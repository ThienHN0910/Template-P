using Microsoft.AspNetCore.Mvc;
using WebApiMvc.Models;
using WebApiMvc.Services;

namespace WebApiMvc.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _service;
    public ProductsController(IProductService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Product input)
    {
        var result = await _service.CreateAsync(input.Name, input.Price);
        return Created($"/api/products/{result.Id}", result);
    }
}

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new { status = "Healthy", timestamp = DateTime.UtcNow });
}
