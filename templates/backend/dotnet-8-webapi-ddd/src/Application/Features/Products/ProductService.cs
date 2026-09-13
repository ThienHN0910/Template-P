using Application.Common.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Products;

public record ProductDto(Guid Id, string Name, string? Description, decimal Price, bool IsActive, DateTime CreatedAt);

public record CreateProductRequest(string Name, string? Description, decimal Price);

public interface IProductService
{
    Task<List<ProductDto>> GetAllAsync(CancellationToken ct = default);
    Task<ProductDto> CreateAsync(CreateProductRequest request, CancellationToken ct = default);
}

public class ProductService : IProductService
{
    private readonly IApplicationDbContext _context;

    public ProductService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.Products
            .AsNoTracking()
            .Select(p => new ProductDto(p.Id, p.Name, p.Description, p.Price, p.IsActive, p.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<ProductDto> CreateAsync(CreateProductRequest request, CancellationToken ct = default)
    {
        var product = new Product
        {
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            IsActive = true,
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync(ct);

        return new ProductDto(product.Id, product.Name, product.Description, product.Price, product.IsActive, product.CreatedAt);
    }
}
