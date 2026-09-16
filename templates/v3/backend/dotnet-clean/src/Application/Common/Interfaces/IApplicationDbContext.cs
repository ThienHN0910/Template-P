using Domain.Entities;

namespace Application.Common.Interfaces;

public interface IApplicationDbContext
{
    Task<List<Product>> GetProductsAsync(CancellationToken cancellationToken = default);
    Task<Product?> GetProductByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Product> CreateProductAsync(Product product, CancellationToken cancellationToken = default);
    Task<bool> DeleteProductAsync(Guid id, CancellationToken cancellationToken = default);
}
