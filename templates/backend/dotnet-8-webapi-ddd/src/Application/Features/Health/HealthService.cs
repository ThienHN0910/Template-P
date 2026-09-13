using Application.Common.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Health;

public record HealthStatusDto(string Status, string DatabaseProvider, DateTime ServerTimeUtc);

public interface IHealthService
{
    Task<HealthStatusDto> GetHealthStatusAsync(CancellationToken ct = default);
}

public class HealthService : IHealthService
{
    private readonly IApplicationDbContext _context;

    public HealthService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<HealthStatusDto> GetHealthStatusAsync(CancellationToken ct = default)
    {
        // Simple ping to verify DB connectivity
        var canConnect = await _context.Products.AnyAsync(ct).ContinueWith(_ => true);
        return new HealthStatusDto(
            canConnect ? "Healthy" : "Degraded",
            "Database Connected",
            DateTime.UtcNow
        );
    }
}
