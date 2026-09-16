import { describe, expect, it } from 'vitest';
import { getDotnetEfSqlServerOperations } from '../../../src/engine/composer/layers/dotnet-ef-sqlserver.js';
import { getDotnetEfMySqlOperations } from '../../../src/engine/composer/layers/dotnet-ef-mysql.js';
import { getDotnetEfSqliteOperations } from '../../../src/engine/composer/layers/dotnet-ef-sqlite.js';
import { getDotnetMongoDbOperations } from '../../../src/engine/composer/layers/dotnet-mongodb.js';

describe('.NET 10 Persistence Adapters', () => {
  it('generates SQL Server EF Core adapter with Microsoft.EntityFrameworkCore.SqlServer', () => {
    const ops = getDotnetEfSqlServerOperations();
    const csproj = ops.find((o) => o.path === 'apps/backend/src/Infrastructure/Infrastructure.csproj') as any;
    expect(csproj).toBeDefined();
    expect(csproj.content).toContain('Microsoft.EntityFrameworkCore.SqlServer');
    expect(csproj.content).toContain('<TargetFramework>net10.0</TargetFramework>');
    expect(csproj.content).toContain('<TreatWarningsAsErrors>true</TreatWarningsAsErrors>');
    expect(csproj.content).toContain('<Nullable>enable</Nullable>');

    const dbContext = ops.find((o) => o.path === 'apps/backend/src/Infrastructure/Persistence/ApplicationDbContext.cs') as any;
    expect(dbContext).toBeDefined();
    expect(dbContext.content).toContain('public class ApplicationDbContext : DbContext, IApplicationDbContext');
    expect(dbContext.content).toContain('DbSet<Product> Products => Set<Product>();');
  });

  it('generates MySQL EF Core adapter with MySql.EntityFrameworkCore', () => {
    const ops = getDotnetEfMySqlOperations();
    const csproj = ops.find((o) => o.path === 'apps/backend/src/Infrastructure/Infrastructure.csproj') as any;
    expect(csproj).toBeDefined();
    expect(csproj.content).toContain('MySql.EntityFrameworkCore');
    expect(csproj.content).toContain('<TargetFramework>net10.0</TargetFramework>');
    expect(csproj.content).toContain('<TreatWarningsAsErrors>true</TreatWarningsAsErrors>');

    const dbContext = ops.find((o) => o.path === 'apps/backend/src/Infrastructure/Persistence/ApplicationDbContext.cs') as any;
    expect(dbContext).toBeDefined();
    expect(dbContext.content).toContain('public class ApplicationDbContext : DbContext, IApplicationDbContext');
  });

  it('generates SQLite EF Core adapter with Microsoft.EntityFrameworkCore.Sqlite', () => {
    const ops = getDotnetEfSqliteOperations();
    const csproj = ops.find((o) => o.path === 'apps/backend/src/Infrastructure/Infrastructure.csproj') as any;
    expect(csproj).toBeDefined();
    expect(csproj.content).toContain('Microsoft.EntityFrameworkCore.Sqlite');
    expect(csproj.content).toContain('<TargetFramework>net10.0</TargetFramework>');
    expect(csproj.content).toContain('<TreatWarningsAsErrors>true</TreatWarningsAsErrors>');

    const dbContext = ops.find((o) => o.path === 'apps/backend/src/Infrastructure/Persistence/ApplicationDbContext.cs') as any;
    expect(dbContext).toBeDefined();
    expect(dbContext.content).toContain('public class ApplicationDbContext : DbContext, IApplicationDbContext');
  });

  it('generates MongoDB C# adapter with MongoDB.Driver', () => {
    const ops = getDotnetMongoDbOperations();
    const csproj = ops.find((o) => o.path === 'apps/backend/src/Infrastructure/Infrastructure.csproj') as any;
    expect(csproj).toBeDefined();
    expect(csproj.content).toContain('MongoDB.Driver');
    expect(csproj.content).toContain('Version="3.2.1"');
    expect(csproj.content).toContain('<TargetFramework>net10.0</TargetFramework>');
    expect(csproj.content).toContain('<TreatWarningsAsErrors>true</TreatWarningsAsErrors>');

    const dbContext = ops.find((o) => o.path === 'apps/backend/src/Infrastructure/Persistence/ApplicationDbContext.cs') as any;
    expect(dbContext).toBeDefined();
    expect(dbContext.content).toContain('public class ApplicationDbContext : IApplicationDbContext');
    expect(dbContext.content).toContain('IMongoDatabase');
    expect(dbContext.content).toContain('IMongoCollection<Product>');
    expect(dbContext.content).toContain('GetProductsAsync');
    expect(dbContext.content).toContain('GetProductByIdAsync');
    expect(dbContext.content).toContain('CreateProductAsync');
    expect(dbContext.content).toContain('DeleteProductAsync');
  });
});
