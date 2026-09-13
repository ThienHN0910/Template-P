using Domain.Common;

namespace Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;
}

public class HealthItem : BaseEntity
{
    public string Status { get; set; } = "Healthy";
    public string Message { get; set; } = "Database connection operational";
}
