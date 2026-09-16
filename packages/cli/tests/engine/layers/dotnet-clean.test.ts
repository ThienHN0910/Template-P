import { describe, expect, it } from 'vitest';
import { getDotnetCleanOperations } from '../../../src/engine/composer/layers/dotnet-clean.js';

describe('Dotnet Clean Architecture Layer', () => {
  it('generates .NET 10 Clean Architecture solution with Domain, Application, and API', () => {
    const ops = getDotnetCleanOperations('my-app');
    const paths = ops.map((o) => o.path);

    expect(paths).toContain('apps/backend/Backend.sln');
    expect(paths).toContain('apps/backend/src/Domain/Domain.csproj');
    expect(paths).toContain('apps/backend/src/Domain/Entities/Product.cs');
    expect(paths).toContain('apps/backend/src/Application/Application.csproj');
    expect(paths).toContain('apps/backend/src/Application/Products/ProductDto.cs');
    expect(paths).toContain('apps/backend/src/Application/Common/Interfaces/IApplicationDbContext.cs');
    expect(paths).toContain('apps/backend/src/API/API.csproj');
    expect(paths).toContain('apps/backend/src/API/Controllers/ProductsController.cs');
    expect(paths).toContain('apps/backend/src/API/Program.cs');

    const domainCsproj = ops.find((o) => o.path === 'apps/backend/src/Domain/Domain.csproj');
    expect((domainCsproj as any)?.content).toContain('<TargetFramework>net10.0</TargetFramework>');

    const appCsproj = ops.find((o) => o.path === 'apps/backend/src/Application/Application.csproj');
    expect((appCsproj as any)?.content).toContain('<TargetFramework>net10.0</TargetFramework>');
    expect((appCsproj as any)?.content).toContain('Domain.csproj');

    const apiCsproj = ops.find((o) => o.path === 'apps/backend/src/API/API.csproj');
    expect((apiCsproj as any)?.content).toContain('<TargetFramework>net10.0</TargetFramework>');
    expect((apiCsproj as any)?.content).toContain('Application.csproj');
    expect((apiCsproj as any)?.content).toContain('Infrastructure.csproj');

    const sln = ops.find((o) => o.path === 'apps/backend/Backend.sln');
    expect((sln as any)?.content).toContain('Domain.csproj');
    expect((sln as any)?.content).toContain('Application.csproj');
    expect((sln as any)?.content).toContain('Infrastructure.csproj');
    expect((sln as any)?.content).toContain('API.csproj');
  });
});
