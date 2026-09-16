using Application.Common.Interfaces;
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
