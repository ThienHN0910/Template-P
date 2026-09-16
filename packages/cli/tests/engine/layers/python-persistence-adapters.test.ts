import { describe, expect, it } from 'vitest';
import { getPythonSqlAlchemyOperations } from '../../../src/engine/composer/layers/python-sqlalchemy.js';
import { getPythonMongoOperations } from '../../../src/engine/composer/layers/python-mongodb.js';

describe('Python 3.13 FastAPI Persistence Adapters', () => {
  describe('SQLAlchemy 2.0 Async Adapter', () => {
    it('generates SQLAlchemy async session for PostgreSQL with psycopg', () => {
      const ops = getPythonSqlAlchemyOperations('postgresql');
      const db = ops.find((o) => o.path === 'apps/backend/app/db/session.py') as any;
      expect(db).toBeDefined();
      expect(db.content).toContain('create_async_engine');
      expect(db.content).toContain('async_sessionmaker');
      expect(db.content).toContain('AsyncSession');
      expect(db.content).toContain('postgresql+psycopg');
      expect(db.content).toContain('async def get_db() -> AsyncGenerator[AsyncSession, None]:');
      expect(db.content).toContain('os.getenv("DATABASE_URL"');

      const model = ops.find((o) => o.path === 'apps/backend/app/models/product.py') as any;
      expect(model).toBeDefined();
      expect(model.content).toContain('Base = declarative_base()');
      expect(model.content).toContain('class Product(Base):');
      expect(model.content).toContain('id = Column(');
      expect(model.content).toContain('name = Column(');
      expect(model.content).toContain('description = Column(');
      expect(model.content).toContain('price = Column(');
      expect(model.content).toContain('created_at = Column(');
    });

    it('generates SQLAlchemy async session for SQLite with aiosqlite', () => {
      const ops = getPythonSqlAlchemyOperations('sqlite');
      const db = ops.find((o) => o.path === 'apps/backend/app/db/session.py') as any;
      expect(db).toBeDefined();
      expect(db.content).toContain('sqlite+aiosqlite:///./app.db');
      expect(db.content).toContain('create_async_engine');
      expect(db.content).toContain('async_sessionmaker');
    });

    it('generates SQLAlchemy async session for MySQL with asyncmy', () => {
      const ops = getPythonSqlAlchemyOperations('mysql');
      const db = ops.find((o) => o.path === 'apps/backend/app/db/session.py') as any;
      expect(db).toBeDefined();
      expect(db.content).toContain('mysql+asyncmy');
      expect(db.content).toContain('create_async_engine');
    });

    it('generates SQLAlchemy async session for SQL Server with aioodbc', () => {
      const ops = getPythonSqlAlchemyOperations('sqlserver');
      const db = ops.find((o) => o.path === 'apps/backend/app/db/session.py') as any;
      expect(db).toBeDefined();
      expect(db.content).toContain('mssql+aioodbc');
      expect(db.content).toContain('create_async_engine');
    });
  });

  describe('PyMongo Async Adapter', () => {
    it('generates PyMongo AsyncMongoClient adapter for MongoDB', () => {
      const ops = getPythonMongoOperations();
      const db = ops.find((o) => o.path === 'apps/backend/app/db/mongo.py') as any;
      expect(db).toBeDefined();
      expect(db.content).toContain('from pymongo import AsyncMongoClient');
      expect(db.content).toContain('def get_mongo_client() -> AsyncMongoClient:');
      expect(db.content).toContain('def get_database(');
      expect(db.content).toContain('def get_products_collection(');
      expect(db.content).toContain('os.getenv("MONGODB_URI"');
    });
  });
});
