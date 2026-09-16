import type { FileOperation } from '../operations.js';

export function getPythonSqlAlchemyOperations(
  dialect: 'postgresql' | 'sqlserver' | 'mysql' | 'sqlite'
): FileOperation[] {
  let defaultDbUrl = '';
  let urlRewrite = '';

  switch (dialect) {
    case 'postgresql':
      defaultDbUrl = 'postgresql+psycopg://localhost:5432/app';
      urlRewrite = `if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
`;
      break;
    case 'mysql':
      defaultDbUrl = 'mysql+asyncmy://localhost:3306/app';
      urlRewrite = `if DATABASE_URL.startswith("mysql://"):
    DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+asyncmy://", 1)
`;
      break;
    case 'sqlserver':
      defaultDbUrl = 'mssql+aioodbc://localhost:1433/app';
      urlRewrite = `if DATABASE_URL.startswith("mssql://"):
    DATABASE_URL = DATABASE_URL.replace("mssql://", "mssql+aioodbc://", 1)
`;
      break;
    case 'sqlite':
    default:
      defaultDbUrl = 'sqlite+aiosqlite:///./app.db';
      urlRewrite = '';
      break;
  }

  const sessionPy = `import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

DATABASE_URL = os.getenv("DATABASE_URL", "${defaultDbUrl}")
${urlRewrite}
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
`;

  const productModelPy = `import datetime
from sqlalchemy import Column, String, Float, DateTime, Text
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
`;

  return [
    {
      kind: 'createFile',
      path: 'apps/backend/app/db/session.py',
      content: sessionPy,
    },
    {
      kind: 'createFile',
      path: 'apps/backend/app/models/product.py',
      content: productModelPy,
    },
  ];
}
