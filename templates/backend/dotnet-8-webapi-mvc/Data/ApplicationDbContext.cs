using Microsoft.EntityFrameworkCore;
using WebApiMvc.Models;

namespace WebApiMvc.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
}
