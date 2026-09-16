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
    <PackageReference Include="Microsoft.OpenApi" Version="2.12.2" />
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
Global
	GlobalSection(SolutionConfigurationPlatforms) = preSolution
		Debug|Any CPU = Debug|Any CPU
		Release|Any CPU = Release|Any CPU
	EndGlobalSection
	GlobalSection(ProjectConfigurationPlatforms) = postSolution
		{11111111-1111-1111-1111-111111111111}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
		{11111111-1111-1111-1111-111111111111}.Debug|Any CPU.Build.0 = Debug|Any CPU
		{11111111-1111-1111-1111-111111111111}.Release|Any CPU.ActiveCfg = Release|Any CPU
		{11111111-1111-1111-1111-111111111111}.Release|Any CPU.Build.0 = Release|Any CPU
		{22222222-2222-2222-2222-222222222222}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
		{22222222-2222-2222-2222-222222222222}.Debug|Any CPU.Build.0 = Debug|Any CPU
		{22222222-2222-2222-2222-222222222222}.Release|Any CPU.ActiveCfg = Release|Any CPU
		{22222222-2222-2222-2222-222222222222}.Release|Any CPU.Build.0 = Release|Any CPU
		{33333333-3333-3333-3333-333333333333}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
		{33333333-3333-3333-3333-333333333333}.Debug|Any CPU.Build.0 = Debug|Any CPU
		{33333333-3333-3333-3333-333333333333}.Release|Any CPU.ActiveCfg = Release|Any CPU
		{33333333-3333-3333-3333-333333333333}.Release|Any CPU.Build.0 = Release|Any CPU
		{44444444-4444-4444-4444-444444444444}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
		{44444444-4444-4444-4444-444444444444}.Debug|Any CPU.Build.0 = Debug|Any CPU
		{44444444-4444-4444-4444-444444444444}.Release|Any CPU.ActiveCfg = Release|Any CPU
		{44444444-4444-4444-4444-444444444444}.Release|Any CPU.Build.0 = Release|Any CPU
	EndGlobalSection
EndGlobal
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
