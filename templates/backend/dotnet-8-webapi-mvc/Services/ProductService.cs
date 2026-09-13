using Microsoft.EntityFrameworkCore;
using WebApiMvc.Data;
using WebApiMvc.Models;

namespace WebApiMvc.Services;

public interface IProductService
{
    Task<List<Product>> GetAllAsync();
    Task<Product> CreateAsync(string name, decimal price);
}

public class ProductService : IProductService
{
    private readonly ApplicationDbContext _db;
    public ProductService(ApplicationDbContext db) => _db = db;

    public async Task<List<Product>> GetAllAsync() => await _db.Products.AsNoTracking().ToListAsync();

    public async Task<Product> CreateAsync(string name, decimal price)
    {
        var p = new Product { Name = name, Price = price };
        _db.Products.Add(p);
        await _db.SaveChangesAsync();
        return p;
    }
}
