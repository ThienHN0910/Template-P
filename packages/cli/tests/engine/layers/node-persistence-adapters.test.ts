import { describe, expect, it } from 'vitest';
import { getNodePrismaOperations } from '../../../src/engine/composer/layers/node-prisma.js';
import { getNodeMongoOperations } from '../../../src/engine/composer/layers/node-mongodb.js';

describe('Node.js 24 Persistence Adapters', () => {
  describe('Prisma 7 Adapter', () => {
    it('generates Prisma 7 schema and client for PostgreSQL', () => {
      const ops = getNodePrismaOperations('postgresql');
      const schema = ops.find((o) => o.path === 'apps/backend/prisma/schema.prisma') as any;
      expect(schema).toBeDefined();
      expect(schema.content).toContain('provider = "postgresql"');
      expect(schema.content).toContain('DATABASE_URL');
      expect(schema.content).toContain('model Product');
      expect(schema.content).toMatch(/price\s+Decimal/);

      const db = ops.find((o) => o.path === 'apps/backend/src/db.ts') as any;
      expect(db).toBeDefined();
      expect(db.content).toContain('PrismaClient');

      const pkg = ops.find((o) => o.path === 'apps/backend/package.json') as any;
      expect(pkg).toBeDefined();
      expect(pkg.kind).toBe('mergeJson');
      expect(pkg.data.dependencies['@prisma/client']).toBe('^7.0.0');
      expect(pkg.data.devDependencies.prisma).toBe('^7.0.0');
    });

    it('generates Prisma 7 schema and client for SQLite', () => {
      const ops = getNodePrismaOperations('sqlite');
      const schema = ops.find((o) => o.path === 'apps/backend/prisma/schema.prisma') as any;
      expect(schema).toBeDefined();
      expect(schema.content).toContain('provider = "sqlite"');
      expect(schema.content).toContain('model Product');
    });

    it('generates Prisma 7 schema for MySQL and SQL Server', () => {
      const mysqlOps = getNodePrismaOperations('mysql');
      const mysqlSchema = mysqlOps.find((o) => o.path === 'apps/backend/prisma/schema.prisma') as any;
      expect(mysqlSchema.content).toContain('provider = "mysql"');

      const sqlserverOps = getNodePrismaOperations('sqlserver');
      const sqlserverSchema = sqlserverOps.find((o) => o.path === 'apps/backend/prisma/schema.prisma') as any;
      expect(sqlserverSchema.content).toContain('provider = "sqlserver"');
    });
  });

  describe('MongoDB Adapter', () => {
    it('generates official MongoDB adapter for Node.js', () => {
      const ops = getNodeMongoOperations();
      const pkg = ops.find((o) => o.path === 'apps/backend/package.json') as any;
      expect(pkg).toBeDefined();
      expect(pkg.kind).toBe('mergeJson');
      expect(pkg.data.dependencies.mongodb).toBe('^6.14.0');

      const db = ops.find((o) => o.path === 'apps/backend/src/db.ts') as any;
      expect(db).toBeDefined();
      expect(db.content).toContain('MongoClient');
      expect(db.content).toContain('process.env.MONGODB_URI');
      expect(db.content).toContain('products');
    });
  });
});
