import { describe, expect, it } from 'vitest';
import { getDotnetEfPostgresqlOperations } from '../../../src/engine/composer/layers/dotnet-ef-postgresql.js';

describe('Dotnet EF Core PostgreSQL Layer', () => {
  it('generates Infrastructure project with Npgsql.EntityFrameworkCore.PostgreSQL and ApplicationDbContext', () => {
    const ops = getDotnetEfPostgresqlOperations();
    const paths = ops.map((o) => o.path);

    expect(paths).toContain('apps/backend/src/Infrastructure/Infrastructure.csproj');
    expect(paths).toContain('apps/backend/src/Infrastructure/Persistence/ApplicationDbContext.cs');

    const infraCsproj = ops.find((o) => o.path === 'apps/backend/src/Infrastructure/Infrastructure.csproj');
    expect((infraCsproj as any)?.content).toContain('<TargetFramework>net10.0</TargetFramework>');
    expect((infraCsproj as any)?.content).toContain('Microsoft.EntityFrameworkCore');
    expect((infraCsproj as any)?.content).toContain('Npgsql.EntityFrameworkCore.PostgreSQL');

    const dbContext = ops.find((o) => o.path === 'apps/backend/src/Infrastructure/Persistence/ApplicationDbContext.cs');
    expect((dbContext as any)?.content).toContain('public class ApplicationDbContext : DbContext, IApplicationDbContext');
    expect((dbContext as any)?.content).toContain('DbSet<Product> Products => Set<Product>();');
  });
});
