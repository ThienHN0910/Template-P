using Application.Features.Products;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ProductsController : ApiControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var products = await _productService.GetAllAsync(ct);
        return Ok(products);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest request, CancellationToken ct)
    {
        var created = await _productService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
    }
}
