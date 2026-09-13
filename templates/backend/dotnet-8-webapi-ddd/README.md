# .NET 8 Clean Architecture / DDD Web API

Enterprise-grade Clean Architecture implementation with 4 distinct layers:
- **`Domain`**: Entities, Value Objects, Domain Events (Zero external dependencies)
- **`Application`**: CQRS/Service Features, DTOs, Business Use Cases, Interfaces
- **`Infrastructure`**: EF Core persistence, DB Provider support (PostgreSQL, MySQL, SQLite), Repositories
- **`API`**: Presentation layer, Controllers, Swagger UI, CORS policy

## Quickstart

```bash
dotnet restore
dotnet run --project src/API/API.csproj
```

Open Swagger UI at `http://localhost:5050/swagger`.
