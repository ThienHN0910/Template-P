import type { FileOperation } from '../operations.js';

export function getDotnetMongoDbOperations(): FileOperation[] {
  const infraCsproj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
  </PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="..\\Application\\Application.csproj" />
    <PackageReference Include="MongoDB.Driver" Version="3.2.1" />
  </ItemGroup>
</Project>
`;

  const dbContext = `using Application.Common.Interfaces;
using Domain.Entities;
using MongoDB.Driver;

namespace Infrastructure.Persistence;

public class ApplicationDbContext : IApplicationDbContext
{
    private readonly IMongoCollection<Product> _products;

    public ApplicationDbContext(IMongoDatabase database)
    {
        _products = database.GetCollection<Product>("Products");
    }

    public async Task<List<Product>> GetProductsAsync(CancellationToken cancellationToken = default)
    {
        return await _products.Find(FilterDefinition<Product>.Empty).ToListAsync(cancellationToken);
    }

    public async Task<Product?> GetProductByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _products.Find(p => p.Id == id).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Product> CreateProductAsync(Product product, CancellationToken cancellationToken = default)
    {
        await _products.InsertOneAsync(product, cancellationToken: cancellationToken);
        return product;
    }

    public async Task<bool> DeleteProductAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _products.DeleteOneAsync(p => p.Id == id, cancellationToken);
        return result.DeletedCount > 0;
    }
}
`;

  return [
    { kind: 'createFile', path: 'apps/backend/src/Infrastructure/Infrastructure.csproj', content: infraCsproj },
    { kind: 'createFile', path: 'apps/backend/src/Infrastructure/Persistence/ApplicationDbContext.cs', content: dbContext },
  ];
}
