import { describe, expect, it } from 'vitest';
import { getBuiltinRegistry } from '../../../src/engine/registry/registry.js';
import { getWorkspaceBaseOperations } from '../../../src/engine/composer/layers/workspace-base.js';

describe('Database Registry & Dynamic Compose', () => {
  it('registers all 5 normative database capabilities', () => {
    const registry = getBuiltinRegistry();
    expect(registry.get('database/postgresql')).toBeDefined();
    expect(registry.get('database/sqlserver')).toBeDefined();
    expect(registry.get('database/mysql')).toBeDefined();
    expect(registry.get('database/sqlite')).toBeDefined();
    expect(registry.get('database/mongodb')).toBeDefined();
    expect(registry.get('database/none')).toBeDefined();
  });

  it('generates MySQL compose service when database is mysql', () => {
    const ops = getWorkspaceBaseOperations('test-app', 'pnpm', 'mysql');
    const compose = ops.find((o) => o.path === 'infra/compose.yaml') as any;
    expect(compose).toBeDefined();
    expect(compose.content).toContain('image: mysql:8.4');
    expect(compose.content).toContain('3306:3306');
    expect(compose.content).toContain('mysqladmin ping');
    const env = ops.find((o) => o.path === '.env.example') as any;
    expect(env).toBeDefined();
    expect(env.content).toContain('3306');
  });

  it('generates SQL Server compose service when database is sqlserver', () => {
    const ops = getWorkspaceBaseOperations('test-app', 'pnpm', 'sqlserver');
    const compose = ops.find((o) => o.path === 'infra/compose.yaml') as any;
    expect(compose).toBeDefined();
    expect(compose.content).toContain('mcr.microsoft.com/mssql/server:2022-latest');
    expect(compose.content).toContain('1433:1433');
    expect(compose.content).toContain('ACCEPT_EULA=Y');
    expect(compose.content).toContain('MSSQL_SA_PASSWORD=${DB_PASSWORD}');
    const env = ops.find((o) => o.path === '.env.example') as any;
    expect(env).toBeDefined();
    expect(env.content).toContain('1433');
  });

  it('generates MongoDB compose service when database is mongodb', () => {
    const ops = getWorkspaceBaseOperations('test-app', 'pnpm', 'mongodb');
    const compose = ops.find((o) => o.path === 'infra/compose.yaml') as any;
    expect(compose).toBeDefined();
    expect(compose.content).toContain('image: mongo:7');
    expect(compose.content).toContain('27017:27017');
    const env = ops.find((o) => o.path === '.env.example') as any;
    expect(env).toBeDefined();
    expect(env.content).toContain('mongodb://');
  });

  it('omits compose service for sqlite', () => {
    const ops = getWorkspaceBaseOperations('test-app', 'pnpm', 'sqlite');
    const compose = ops.find((o) => o.path === 'infra/compose.yaml') as any;
    expect(compose).toBeUndefined();
    const env = ops.find((o) => o.path === '.env.example') as any;
    expect(env).toBeDefined();
    expect(env.content).toContain('Data Source=app.db');
  });

  it('defaults to postgresql when database argument is omitted', () => {
    const ops = getWorkspaceBaseOperations('test-app', 'pnpm');
    const compose = ops.find((o) => o.path === 'infra/compose.yaml') as any;
    expect(compose).toBeDefined();
    expect(compose.content).toContain('image: postgres:17-alpine');
    expect(compose.content).toContain('5432');
  });

  it('omits compose service for database none', () => {
    const ops = getWorkspaceBaseOperations('test-app', 'pnpm', 'none');
    const compose = ops.find((o) => o.path === 'infra/compose.yaml') as any;
    expect(compose).toBeUndefined();
  });
});
