using Microsoft.EntityFrameworkCore;
using WebApiMvc.Data;
using WebApiMvc.Services;

var builder = WebApplication.CreateBuilder(args);

// Database Setup
var provider = builder.Configuration.GetValue<string>("DatabaseProvider")?.ToLowerInvariant() ?? "__DB_PROVIDER__";
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "__DB_CONNECTION__";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    switch (provider)
    {
        case "postgres":
        case "postgresql":
            options.UseNpgsql(connectionString);
            break;
        case "mysql":
            options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
            break;
        case "sqlite":
        default:
            options.UseSqlite(connectionString);
            break;
    }
});

// Services DI
builder.Services.AddScoped<IProductService, ProductService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:3001")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        context.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "Could not initialize database.");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();
