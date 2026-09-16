namespace Application.Products;

public record ProductDto(Guid Id, string Name, string Description, decimal Price, DateTime CreatedAtUtc);
public record CreateProductRequest(string Name, string Description, decimal Price);
public record UpdateProductRequest(string Name, string Description, decimal Price);
