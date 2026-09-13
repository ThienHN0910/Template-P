using Application.Features.Health;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class HealthController : ApiControllerBase
{
    private readonly IHealthService _healthService;

    public HealthController(IHealthService healthService)
    {
        _healthService = healthService;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var result = await _healthService.GetHealthStatusAsync(ct);
        return Ok(result);
    }
}
