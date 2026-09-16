import type { FileOperation } from '../operations.js';

export function getPythonMongoOperations(): FileOperation[] {
  const mongoPy = `import os
from pymongo import AsyncMongoClient

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "app_db")

_client: AsyncMongoClient | None = None

def get_mongo_client() -> AsyncMongoClient:
    global _client
    if _client is None:
        _client = AsyncMongoClient(MONGODB_URI)
    return _client

def get_database(db_name: str | None = None):
    client = get_mongo_client()
    return client[db_name or DATABASE_NAME]

def get_products_collection():
    db = get_database()
    return db["products"]
`;

  return [
    {
      kind: 'createFile',
      path: 'apps/backend/app/db/mongo.py',
      content: mongoPy,
    },
  ];
}
