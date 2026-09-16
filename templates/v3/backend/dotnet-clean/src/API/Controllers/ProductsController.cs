using Application.Common.Interfaces;
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
