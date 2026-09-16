import type { FileOperation } from '../operations.js';

export function getNodeMongoOperations(): FileOperation[] {
  const dbTs = `import { MongoClient, type Db, type Collection } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
export const client = new MongoClient(uri);

export function getDatabase(dbName?: string): Db {
  return client.db(dbName);
}

export const getDb = getDatabase;

export function getProductsCollection<T = any>(dbName?: string): Collection<T> {
  return getDatabase(dbName).collection<T>('products');
}

export { MongoClient, Db, Collection };
export default client;
`;

  return [
    {
      kind: 'createFile',
      path: 'apps/backend/src/db.ts',
      content: dbTs,
    },
    {
      kind: 'mergeJson',
      path: 'apps/backend/package.json',
      data: {
        dependencies: {
          mongodb: '^6.14.0',
        },
      },
    },
  ];
}
