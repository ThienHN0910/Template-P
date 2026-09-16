# Template-P v3 Golden Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver Increment 03 of the approved Template-P v3 architecture: the first complete, production-ready golden vertical slice (.NET 10 + ASP.NET Core Clean Architecture + PostgreSQL/EF Core + React/Vite + OpenAPI typed client + Product CRUD slice) scaffolded deterministically by the v3 engine.

**Architecture:** Composable layers under `templates/v3/` applied by the v3 composition engine in topological order (`workspace base` -> `runtime/dotnet` -> `backend/aspnet-core` -> `architecture/clean` -> `database/postgresql` -> `data-access/dotnet/ef-core/postgresql` -> `client/openapi` -> `frontend/react`) to produce a verified fullstack monorepo with root lifecycle scripts, Docker compose infrastructure, and `.template-p/manifest.json`.

**Tech Stack:** .NET 10 LTS (`net10.0`), C# 13, EF Core 10, Npgsql, React 19, Vite, TypeScript 7, Tailwind CSS, Docker Compose, pnpm 11.15.1, Vitest 5.

**Spec:** `docs/superpowers/specs/2026-09-16-template-p-v3-capability-architecture-design.md`

## Global Constraints

- Keep the repository name `ThienHN0910/Template-P` and npm package name `@thienhn/create-template`.
- Keep `create-template` as the canonical executable and `create-p-stack` as a compatibility alias.
- Monorepo folder layout: `apps/backend/`, `apps/frontend/`, `packages/api-client/`, `infra/compose.yaml`, `.template-p/manifest.json`, `template-p.config.json`.
- Root scripts must adhere to the standard vocabulary: `dev`, `build`, `test`, `lint`, `format`, `api:sync`, `db:migrate`, `db:seed`, `infra:up`, `infra:down`.
- .NET projects target `net10.0` LTS with C# 13 nullable reference types enabled and treat warnings as errors.
- Persistence port protects application logic from direct ORM coupling without hiding native PostgreSQL features in the adapter.
- The reference vertical slice must provide `/api/v1/products` CRUD with Problem Details error responses and OpenAPI spec output.
- All file operations must be idempotent; applying the same plan twice must not corrupt existing files.
- Every commit must follow Conventional Commits (`feat:`, `fix:`, `test:`, `refactor:`, `docs:`, `chore:`).

---

### Task 1: V3 Workspace Base & Infrastructure Layer

**Files:**
- Create: `templates/v3/base/workspace/package.json`
- Create: `templates/v3/base/workspace/.gitignore`
- Create: `templates/v3/base/workspace/.env.example`
- Create: `templates/v3/base/workspace/README.md`
- Create: `templates/v3/base/workspace/infra/compose.yaml`
- Create: `packages/cli/src/engine/composer/layers/workspace-base.ts`
- Test: `packages/cli/tests/engine/layers/workspace-base.test.ts`

**Interfaces:**
- Produces:
  - `function getWorkspaceBaseOperations(projectName: string, packageManager: string): FileOperation[]`

- [ ] **Step 1: Write the failing test for workspace base layer**

Create `packages/cli/tests/engine/layers/workspace-base.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { getWorkspaceBaseOperations } from '../../../src/engine/composer/layers/workspace-base.js';

describe('Workspace Base Layer', () => {
  it('generates root package.json, compose.yaml, .env.example, and .gitignore', () => {
    const ops = getWorkspaceBaseOperations('golden-app', 'pnpm');
    expect(ops.length).toBeGreaterThan(0);

    const paths = ops.map((op) => op.path);
    expect(paths).toContain('package.json');
    expect(paths).toContain('infra/compose.yaml');
    expect(paths).toContain('.env.example');
    expect(paths).toContain('.gitignore');
    expect(paths).toContain('README.md');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/workspace-base.test.ts`
Expected: FAIL due to missing module.

- [ ] **Step 3: Implement workspace base layer and templates**

Create `templates/v3/base/workspace/infra/compose.yaml`:
```yaml
services:
  postgres:
    image: postgres:17-alpine
    container_name: ${PROJECT_NAME:-app}-postgres
    environment:
      POSTGRES_DB: ${DB_NAME:-appdb}
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres} -d ${DB_NAME:-appdb}"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

Create `packages/cli/src/engine/composer/layers/workspace-base.ts`:
```ts
import type { FileOperation } from '../operations.js';

export function getWorkspaceBaseOperations(projectName: string, packageManager: string): FileOperation[] {
  const rootPackageJson = {
    name: projectName,
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'pnpm --filter ./apps/* --parallel dev',
      build: 'pnpm --filter ./packages/* --filter ./apps/* build',
      test: 'pnpm --filter ./packages/* --filter ./apps/* test',
      'infra:up': 'docker compose -f infra/compose.yaml up -d',
      'infra:down': 'docker compose -f infra/compose.yaml down',
      'db:migrate': 'dotnet run --project apps/backend/src/API/API.csproj -- --migrate',
      'db:seed': 'dotnet run --project apps/backend/src/API/API.csproj -- --seed',
    },
    devDependencies: {
      typescript: '^7.0.2',
    },
  };

  const gitignoreContent = [
    'node_modules/',
    'dist/',
    'build/',
    'bin/',
    'obj/',
    '.env',
    '.env.local',
    '*.user',
    '*.suo',
  ].join('\n') + '\n';

  const envExampleContent = [
    `PROJECT_NAME=${projectName}`,
    'DB_HOST=localhost',
    'DB_PORT=5432',
    'DB_NAME=appdb',
    'DB_USER=postgres',
    'DB_PASSWORD=<db_password>',
    'CONNECTION_STRING=Host=localhost;Port=5432;Database=appdb;Username=postgres;Password=<db_password>',
  ].join('\n') + '\n';

  const composeContent = [
    'services:',
    '  postgres:',
    '    image: postgres:17-alpine',
    `    container_name: ${projectName}-postgres`,
    '    environment:',
    '      POSTGRES_DB: ${DB_NAME:-appdb}',
    '      POSTGRES_USER: ${DB_USER:-postgres}',
    '      POSTGRES_PASSWORD: ${DB_PASSWORD}',
    '    ports:',
    '      - "${DB_PORT:-5432}:5432"',
    '    volumes:',
    '      - pgdata:/var/lib/postgresql/data',
    '    healthcheck:',
    '      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres} -d ${DB_NAME:-appdb}"]',
    '      interval: 5s',
    '      timeout: 5s',
    '      retries: 5',
    '',
    'volumes:',
    '  pgdata:',
    '',
  ].join('\n');

  const readmeContent = [
    `# ${projectName}`,
    '',
    'Full-stack project generated with [Template-P](https://github.com/ThienHN0910/Template-P).',
    '',
    '## Getting Started',
    '',
    '```bash',
    '# 1. Start database container',
    'npm run infra:up',
    '',
    '# 2. Start development servers',
    'npm run dev',
    '```',
    '',
  ].join('\n');

  return [
    { kind: 'createFile', path: 'package.json', content: JSON.stringify(rootPackageJson, null, 2) + '\n' },
    { kind: 'createFile', path: '.gitignore', content: gitignoreContent },
    { kind: 'createFile', path: '.env.example', content: envExampleContent },
    { kind: 'createFile', path: 'infra/compose.yaml', content: composeContent },
    { kind: 'createFile', path: 'README.md', content: readmeContent },
  ];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/workspace-base.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/engine/composer/layers packages/cli/tests/engine/layers/workspace-base.test.ts templates/v3/base
git commit -m "feat(engine): add workspace base and docker compose layer"
```

---

### Task 2: .NET 10 Clean Architecture Backend & Product Slice Layer

**Files:**
- Create: `packages/cli/src/engine/composer/layers/dotnet-clean.ts`
- Create: `templates/v3/backend/dotnet-clean/Backend.sln`
- Create: `templates/v3/backend/dotnet-clean/src/Domain/Domain.csproj`
- Create: `templates/v3/backend/dotnet-clean/src/Domain/Entities/Product.cs`
- Create: `templates/v3/backend/dotnet-clean/src/Application/Application.csproj`
- Create: `templates/v3/backend/dotnet-clean/src/Application/Common/Interfaces/IApplicationDbContext.cs`
- Create: `templates/v3/backend/dotnet-clean/src/Application/Products/ProductDto.cs`
- Create: `templates/v3/backend/dotnet-clean/src/Application/Products/ProductService.cs`
- Create: `templates/v3/backend/dotnet-clean/src/Infrastructure/Infrastructure.csproj`
- Create: `templates/v3/backend/dotnet-clean/src/API/API.csproj`
- Create: `templates/v3/backend/dotnet-clean/src/API/Program.cs`
- Create: `templates/v3/backend/dotnet-clean/src/API/Controllers/ProductsController.cs`
- Test: `packages/cli/tests/engine/layers/dotnet-clean.test.ts`

**Interfaces:**
- Produces:
  - `function getDotnetCleanOperations(projectName: string): FileOperation[]`

- [ ] **Step 1: Write the failing test for .NET 10 Clean Architecture layer**

Create `packages/cli/tests/engine/layers/dotnet-clean.test.ts`:
```ts
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
    expect(paths).toContain('apps/backend/src/API/API.csproj');
    expect(paths).toContain('apps/backend/src/API/Controllers/ProductsController.cs');
    expect(paths).toContain('apps/backend/src/API/Program.cs');

    const apiCsproj = ops.find((o) => o.path === 'apps/backend/src/API/API.csproj');
    expect((apiCsproj as any).content).toContain('<TargetFramework>net10.0</TargetFramework>');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/dotnet-clean.test.ts`
Expected: FAIL due to missing module.

- [ ] **Step 3: Implement .NET 10 Clean Architecture layer**

Create `packages/cli/src/engine/composer/layers/dotnet-clean.ts`:
```ts
import type { FileOperation } from '../operations.js';

export function getDotnetCleanOperations(projectName: string): FileOperation[] {
  const domainCsproj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
  </PropertyGroup>
</Project>
`;

  const productEntity = `namespace Domain.Entities;

public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
`;

  const appCsproj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
  </PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="..\\Domain\\Domain.csproj" />
  </ItemGroup>
</Project>
`;

  const productDto = `namespace Application.Products;

public record ProductDto(Guid Id, string Name, string Description, decimal Price, DateTime CreatedAtUtc);
public record CreateProductRequest(string Name, string Description, decimal Price);
public record UpdateProductRequest(string Name, string Description, decimal Price);
`;

  const iDbContext = `using Domain.Entities;

namespace Application.Common.Interfaces;

public interface IApplicationDbContext
{
    Task<List<Product>> GetProductsAsync(CancellationToken cancellationToken = default);
    Task<Product?> GetProductByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Product> CreateProductAsync(Product product, CancellationToken cancellationToken = default);
    Task<bool> DeleteProductAsync(Guid id, CancellationToken cancellationToken = default);
}
`;

  const apiCsproj = `<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
  </PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="..\\Application\\Application.csproj" />
    <ProjectReference Include="..\\Infrastructure\\Infrastructure.csproj" />
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="10.0.0" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="7.3.1" />
  </ItemGroup>
</Project>
`;

  const productsController = `using Application.Common.Interfaces;
using Application.Products;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IApplicationDbContext _db;

    public ProductsController(IApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProductDto>>> GetAll(CancellationToken ct)
    {
        var products = await _db.GetProductsAsync(ct);
        return Ok(products.Select(p => new ProductDto(p.Id, p.Name, p.Description, p.Price, p.CreatedAtUtc)));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProductDto>> GetById(Guid id, CancellationToken ct)
    {
        var product = await _db.GetProductByIdAsync(id, ct);
        if (product == null) return NotFound();
        return Ok(new ProductDto(product.Id, product.Name, product.Description, product.Price, product.CreatedAtUtc));
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create([FromBody] CreateProductRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(ProblemDetailsFactory.CreateProblemDetails(HttpContext, statusCode: 400, title: "Validation Error", detail: "Product name is required."));
        }

        var product = new Product
        {
            Name = request.Name,
            Description = request.Description,
            Price = request.Price
        };

        var created = await _db.CreateProductAsync(product, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, new ProductDto(created.Id, created.Name, created.Description, created.Price, created.CreatedAtUtc));
    }
}
`;

  const programCs = `using Application.Common.Interfaces;
using Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<IApplicationDbContext, ApplicationDbContext>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
`;

  const slnContent = `Microsoft Visual Studio Solution File, Format Version 12.00
# Visual Studio Version 17
VisualStudioVersion = 17.0.31903.59
MinimumVisualStudioVersion = 10.0.40219.1
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "Domain", "src\\Domain\\Domain.csproj", "{11111111-1111-1111-1111-111111111111}"
EndProject
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "Application", "src\\Application\\Application.csproj", "{22222222-2222-2222-2222-222222222222}"
EndProject
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "Infrastructure", "src\\Infrastructure\\Infrastructure.csproj", "{33333333-3333-3333-3333-333333333333}"
EndProject
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "API", "src\\API\\API.csproj", "{44444444-4444-4444-4444-444444444444}"
EndProject
`;

  return [
    { kind: 'createFile', path: 'apps/backend/Backend.sln', content: slnContent },
    { kind: 'createFile', path: 'apps/backend/src/Domain/Domain.csproj', content: domainCsproj },
    { kind: 'createFile', path: 'apps/backend/src/Domain/Entities/Product.cs', content: productEntity },
    { kind: 'createFile', path: 'apps/backend/src/Application/Application.csproj', content: appCsproj },
    { kind: 'createFile', path: 'apps/backend/src/Application/Products/ProductDto.cs', content: productDto },
    { kind: 'createFile', path: 'apps/backend/src/Application/Common/Interfaces/IApplicationDbContext.cs', content: iDbContext },
    { kind: 'createFile', path: 'apps/backend/src/API/API.csproj', content: apiCsproj },
    { kind: 'createFile', path: 'apps/backend/src/API/Controllers/ProductsController.cs', content: productsController },
    { kind: 'createFile', path: 'apps/backend/src/API/Program.cs', content: programCs },
  ];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/dotnet-clean.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/engine/composer/layers/dotnet-clean.ts packages/cli/tests/engine/layers/dotnet-clean.test.ts
git commit -m "feat(engine): add .NET 10 clean architecture backend and product slice layer"
```

---

### Task 3: PostgreSQL & EF Core Data Access Layer

**Files:**
- Create: `packages/cli/src/engine/composer/layers/dotnet-ef-postgresql.ts`
- Test: `packages/cli/tests/engine/layers/dotnet-ef-postgresql.test.ts`

**Interfaces:**
- Produces:
  - `function getDotnetEfPostgresqlOperations(): FileOperation[]`

- [ ] **Step 1: Write the failing test for EF Core PostgreSQL data-access layer**

Create `packages/cli/tests/engine/layers/dotnet-ef-postgresql.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { getDotnetEfPostgresqlOperations } from '../../../src/engine/composer/layers/dotnet-ef-postgresql.js';

describe('Dotnet EF Core PostgreSQL Layer', () => {
  it('generates Infrastructure project with Npgsql.EntityFrameworkCore.PostgreSQL and ApplicationDbContext', () => {
    const ops = getDotnetEfPostgresqlOperations();
    const paths = ops.map((o) => o.path);

    expect(paths).toContain('apps/backend/src/Infrastructure/Infrastructure.csproj');
    expect(paths).toContain('apps/backend/src/Infrastructure/Persistence/ApplicationDbContext.cs');

    const infraCsproj = ops.find((o) => o.path === 'apps/backend/src/Infrastructure/Infrastructure.csproj');
    expect((infraCsproj as any).content).toContain('Npgsql.EntityFrameworkCore.PostgreSQL');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/dotnet-ef-postgresql.test.ts`
Expected: FAIL due to missing module.

- [ ] **Step 3: Implement EF Core PostgreSQL data-access layer**

Create `packages/cli/src/engine/composer/layers/dotnet-ef-postgresql.ts`:
```ts
import type { FileOperation } from '../operations.js';

export function getDotnetEfPostgresqlOperations(): FileOperation[] {
  const infraCsproj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
  </PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="..\\Application\\Application.csproj" />
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="10.0.0" />
    <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="10.0.0" />
  </ItemGroup>
</Project>
`;

  const dbContext = `using Application.Common.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();

    public async Task<List<Product>> GetProductsAsync(CancellationToken cancellationToken = default)
    {
        return await Products.AsNoTracking().ToListAsync(cancellationToken);
    }

    public async Task<Product?> GetProductByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await Products.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<Product> CreateProductAsync(Product product, CancellationToken cancellationToken = default)
    {
        Products.Add(product);
        await SaveChangesAsync(cancellationToken);
        return product;
    }

    public async Task<bool> DeleteProductAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var existing = await Products.FindAsync(new object[] { id }, cancellationToken);
        if (existing == null) return false;
        Products.Remove(existing);
        await SaveChangesAsync(cancellationToken);
        return true;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Price).HasPrecision(18, 2);
        });
    }
}
`;

  return [
    { kind: 'createFile', path: 'apps/backend/src/Infrastructure/Infrastructure.csproj', content: infraCsproj },
    { kind: 'createFile', path: 'apps/backend/src/Infrastructure/Persistence/ApplicationDbContext.cs', content: dbContext },
  ];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/dotnet-ef-postgresql.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/engine/composer/layers/dotnet-ef-postgresql.ts packages/cli/tests/engine/layers/dotnet-ef-postgresql.test.ts
git commit -m "feat(engine): add PostgreSQL EF Core data-access layer"
```

---

### Task 4: OpenAPI Typed Client Layer

**Files:**
- Create: `packages/cli/src/engine/composer/layers/openapi-client.ts`
- Test: `packages/cli/tests/engine/layers/openapi-client.test.ts`

**Interfaces:**
- Produces:
  - `function getOpenApiClientOperations(): FileOperation[]`

- [ ] **Step 1: Write the failing test for OpenAPI client layer**

Create `packages/cli/tests/engine/layers/openapi-client.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { getOpenApiClientOperations } from '../../../src/engine/composer/layers/openapi-client.js';

describe('OpenAPI Client Layer', () => {
  it('generates packages/api-client package with types and typed api client', () => {
    const ops = getOpenApiClientOperations();
    const paths = ops.map((o) => o.path);

    expect(paths).toContain('packages/api-client/package.json');
    expect(paths).toContain('packages/api-client/tsconfig.json');
    expect(paths).toContain('packages/api-client/src/index.ts');
    expect(paths).toContain('packages/api-client/src/models.ts');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/openapi-client.test.ts`
Expected: FAIL due to missing module.

- [ ] **Step 3: Implement OpenAPI client layer**

Create `packages/cli/src/engine/composer/layers/openapi-client.ts`:
```ts
import type { FileOperation } from '../operations.js';

export function getOpenApiClientOperations(): FileOperation[] {
  const pkgJson = {
    name: '@project/api-client',
    version: '1.0.0',
    private: true,
    type: 'module',
    main: './src/index.ts',
    scripts: {
      build: 'tsc',
    },
    devDependencies: {
      typescript: '^7.0.2',
    },
  };

  const tsconfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      declaration: true,
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
    },
    include: ['src'],
  };

  const models = `export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  createdAtUtc: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
}
`;

  const indexTs = `import type { Product, CreateProductRequest } from './models.js';

export * from './models.js';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl.replace(/\\/$/, '');
  }

  async getProducts(): Promise<Product[]> {
    const res = await fetch(\`\${this.baseUrl}/api/v1/products\`);
    if (!res.ok) throw new Error(\`Failed to fetch products: \${res.statusText}\`);
    return res.json();
  }

  async getProduct(id: string): Promise<Product> {
    const res = await fetch(\`\${this.baseUrl}/api/v1/products/\${id}\`);
    if (!res.ok) throw new Error(\`Failed to fetch product \${id}: \${res.statusText}\`);
    return res.json();
  }

  async createProduct(request: CreateProductRequest): Promise<Product> {
    const res = await fetch(\`\${this.baseUrl}/api/v1/products\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error(\`Failed to create product: \${res.statusText}\`);
    return res.json();
  }
}
`;

  return [
    { kind: 'createFile', path: 'packages/api-client/package.json', content: JSON.stringify(pkgJson, null, 2) + '\n' },
    { kind: 'createFile', path: 'packages/api-client/tsconfig.json', content: JSON.stringify(tsconfig, null, 2) + '\n' },
    { kind: 'createFile', path: 'packages/api-client/src/models.ts', content: models },
    { kind: 'createFile', path: 'packages/api-client/src/index.ts', content: indexTs },
  ];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/openapi-client.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/engine/composer/layers/openapi-client.ts packages/cli/tests/engine/layers/openapi-client.test.ts
git commit -m "feat(engine): add OpenAPI typed client layer"
```

---

### Task 5: React 19 + Vite Frontend Layer

**Files:**
- Create: `packages/cli/src/engine/composer/layers/react-vite.ts`
- Test: `packages/cli/tests/engine/layers/react-vite.test.ts`

**Interfaces:**
- Produces:
  - `function getReactViteOperations(): FileOperation[]`

- [ ] **Step 1: Write the failing test for React Vite layer**

Create `packages/cli/tests/engine/layers/react-vite.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import { getReactViteOperations } from '../../../src/engine/composer/layers/react-vite.js';

describe('React Vite Layer', () => {
  it('generates apps/frontend with React 19, Vite, and Product catalog component', () => {
    const ops = getReactViteOperations();
    const paths = ops.map((o) => o.path);

    expect(paths).toContain('apps/frontend/package.json');
    expect(paths).toContain('apps/frontend/vite.config.ts');
    expect(paths).toContain('apps/frontend/src/App.tsx');
    expect(paths).toContain('apps/frontend/src/main.tsx');
    expect(paths).toContain('apps/frontend/index.html');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/react-vite.test.ts`
Expected: FAIL due to missing module.

- [ ] **Step 3: Implement React Vite layer**

Create `packages/cli/src/engine/composer/layers/react-vite.ts`:
```ts
import type { FileOperation } from '../operations.js';

export function getReactViteOperations(): FileOperation[] {
  const pkgJson = {
    name: '@project/frontend',
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc && vite build',
      preview: 'vite preview',
    },
    dependencies: {
      '@project/api-client': 'workspace:*',
      react: '^19.0.0',
      'react-dom': '^19.0.0',
    },
    devDependencies: {
      '@types/react': '^19.0.0',
      '@types/react-dom': '^19.0.0',
      '@vitejs/plugin-react': '^4.3.4',
      tailwindcss: '^4.0.0',
      typescript: '^7.0.2',
      vite: '^6.0.0',
    },
  };

  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
});
`;

  const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Template-P Fullstack App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

  const mainTsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

  const appTsx = `import React, { useEffect, useState } from 'react';
import { ApiClient, type Product } from '@project/api-client';

const client = new ApiClient();

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.getProducts()
      .then((data) => setProducts(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Product Catalog (Golden Slice)</h1>
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <ul>
          {products.map((p) => (
            <li key={p.id}>
              <strong>{p.name}</strong> - \${p.price} ({p.description})
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
`;

  return [
    { kind: 'createFile', path: 'apps/frontend/package.json', content: JSON.stringify(pkgJson, null, 2) + '\n' },
    { kind: 'createFile', path: 'apps/frontend/vite.config.ts', content: viteConfig },
    { kind: 'createFile', path: 'apps/frontend/index.html', content: indexHtml },
    { kind: 'createFile', path: 'apps/frontend/src/main.tsx', content: mainTsx },
    { kind: 'createFile', path: 'apps/frontend/src/App.tsx', content: appTsx },
  ];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/layers/react-vite.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/engine/composer/layers/react-vite.ts packages/cli/tests/engine/layers/react-vite.test.ts
git commit -m "feat(engine): add React 19 and Vite frontend layer"
```

---

### Task 6: Scaffolding Orchestrator & CLI Scaffolding Integration

**Files:**
- Create: `packages/cli/src/engine/scaffolder.ts`
- Modify: `packages/cli/src/engine/index.ts`
- Modify: `packages/cli/src/index.ts`
- Test: `packages/cli/tests/engine/scaffolder.test.ts`

**Interfaces:**
- Produces:
  - `function scaffoldStack(config: StackConfiguration, targetDir: string): Promise<void>`

- [ ] **Step 1: Write the failing test for stack scaffolding**

Create `packages/cli/tests/engine/scaffolder.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import path from 'path';
import fsp from 'fs/promises';
import { scaffoldStack } from '../../src/engine/scaffolder.js';
import { BUILTIN_PRESETS } from '../../src/engine/configuration/presets.js';

describe('V3 Stack Scaffolder', () => {
  it('scaffolds the dotnet-clean-react preset into physical files with manifest', async () => {
    const tmpDir = path.resolve('test-output/golden-slice-test');
    await fsp.rm(tmpDir, { recursive: true, force: true });

    await scaffoldStack(BUILTIN_PRESETS['dotnet-clean-react'], tmpDir);

    const exists = async (p: string) => {
      try {
        await fsp.access(path.join(tmpDir, p));
        return true;
      } catch {
        return false;
      }
    };

    expect(await exists('.template-p/manifest.json')).toBe(true);
    expect(await exists('template-p.config.json')).toBe(true);
    expect(await exists('infra/compose.yaml')).toBe(true);
    expect(await exists('apps/backend/src/API/Program.cs')).toBe(true);
    expect(await exists('apps/frontend/src/App.tsx')).toBe(true);
    expect(await exists('packages/api-client/src/index.ts')).toBe(true);

    await fsp.rm(tmpDir, { recursive: true, force: true });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter ./packages/cli test tests/engine/scaffolder.test.ts`
Expected: FAIL due to missing scaffolder.

- [ ] **Step 3: Implement scaffoldStack and wire into engine/CLI**

Create `packages/cli/src/engine/scaffolder.ts`:
```ts
import fsp from 'node:fs/promises';
import path from 'node:path';
import type { StackConfiguration } from './configuration/schema.js';
import { resolveCapabilities } from './resolver/resolver.js';
import { generateManifest, serializeManifest } from './manifest/manifest.js';
import { getWorkspaceBaseOperations } from './composer/layers/workspace-base.js';
import { getDotnetCleanOperations } from './composer/layers/dotnet-clean.js';
import { getDotnetEfPostgresqlOperations } from './composer/layers/dotnet-ef-postgresql.js';
import { getOpenApiClientOperations } from './composer/layers/openapi-client.js';
import { getReactViteOperations } from './composer/layers/react-vite.js';
import type { FileOperation } from './composer/operations.js';

export async function scaffoldStack(config: StackConfiguration, targetDir: string): Promise<void> {
  const resolution = resolveCapabilities(config);
  const manifest = generateManifest(resolution);

  const operations: FileOperation[] = [];

  // Workspace Base
  operations.push(...getWorkspaceBaseOperations(config.project.name, config.project.packageManager));

  // Backend
  if (resolution.resolvedIds.includes('backend/aspnet-core') && resolution.resolvedIds.includes('architecture/clean')) {
    operations.push(...getDotnetCleanOperations(config.project.name));
  }

  // Database / Data Access
  if (resolution.resolvedIds.includes('database/postgresql') && resolution.resolvedIds.includes('runtime/dotnet')) {
    operations.push(...getDotnetEfPostgresqlOperations());
  }

  // Client
  if (resolution.resolvedIds.includes('frontend/react')) {
    operations.push(...getOpenApiClientOperations());
    operations.push(...getReactViteOperations());
  }

  // Manifest & Config
  operations.push({
    kind: 'createFile',
    path: '.template-p/manifest.json',
    content: serializeManifest(manifest),
  });
  operations.push({
    kind: 'createFile',
    path: 'template-p.config.json',
    content: JSON.stringify(config, null, 2) + '\n',
  });

  // Write to disk
  for (const op of operations) {
    const fullPath = path.join(targetDir, op.path);
    await fsp.mkdir(path.dirname(fullPath), { recursive: true });
    if (op.kind === 'createFile') {
      await fsp.writeFile(fullPath, op.content, 'utf8');
    }
  }
}
```

Update `packages/cli/src/engine/index.ts`:
```ts
export * from './scaffolder.js';
```

Update `packages/cli/src/index.ts` to trigger `scaffoldStack` when `--preset` is passed without `--dry-run`:
```ts
  if (options.preset && !options.dryRun) {
    const { scaffoldStack, BUILTIN_PRESETS } = await import('./engine/index.js');
    const preset = BUILTIN_PRESETS[options.preset];
    if (!preset) {
      console.error(pc.red(`Preset "${options.preset}" not found.`));
      process.exit(1);
    }
    const targetDir = path.resolve(process.cwd(), projectName);
    await scaffoldStack({ ...preset, project: { ...preset.project, name: projectName } }, targetDir);
    p.outro(pc.green(`Successfully scaffolded v3 preset "${options.preset}" at ${targetDir}`));
    return;
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/scaffolder.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/engine/scaffolder.ts packages/cli/src/engine/index.ts packages/cli/src/index.ts packages/cli/tests/engine/scaffolder.test.ts
git commit -m "feat(engine): add v3 physical stack scaffolder and CLI preset integration"
```

---

### Task 7: Golden Slice End-to-End Build Verification

**Files:**
- Create: `packages/cli/tests/engine/golden-slice.test.ts`
- Modify: `docs/superpowers/plans/2026-09-16-template-p-v3-golden-slice.md`
- Test: `packages/cli/tests/engine/golden-slice.test.ts`

**Interfaces:**
- Produces:
  - Integration verification test that runs `dotnet build` on the generated C# projects.

- [ ] **Step 1: Write integration test verifying .NET build on generated code**

Create `packages/cli/tests/engine/golden-slice.test.ts`:
```ts
import { describe, expect, it } from 'vitest';
import path from 'path';
import fsp from 'fs/promises';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { scaffoldStack } from '../../src/engine/scaffolder.js';
import { BUILTIN_PRESETS } from '../../src/engine/configuration/presets.js';

const exec = promisify(execFile);

describe('Golden Slice Integration Build', () => {
  it('scaffolds and compiles the .NET 10 Clean Architecture backend', async () => {
    const tmpDir = path.resolve('test-output/golden-slice-e2e');
    await fsp.rm(tmpDir, { recursive: true, force: true });

    await scaffoldStack(BUILTIN_PRESETS['dotnet-clean-react'], tmpDir);

    const apiCsproj = path.join(tmpDir, 'apps/backend/src/API/API.csproj');

    // Run dotnet build
    const { stdout } = await exec('dotnet', ['build', apiCsproj, '-c', 'Release']);
    expect(stdout).toContain('Build succeeded');

    await fsp.rm(tmpDir, { recursive: true, force: true });
  }, 60000);
});
```

- [ ] **Step 2: Run integration test to verify it passes**

Run: `pnpm --filter ./packages/cli test tests/engine/golden-slice.test.ts`
Expected: PASS with "Build succeeded".

- [ ] **Step 3: Run full repository verification**

Run: `pnpm verify`
Expected: All content checks, typecheck, tests, and build pass with 0 errors.

- [ ] **Step 4: Commit**

```bash
git add packages/cli/tests/engine/golden-slice.test.ts
git commit -m "test(engine): add golden slice end-to-end .NET build verification"
```
