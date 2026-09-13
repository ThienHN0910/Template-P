# 04: Core Backend Blueprints (DotNet, Node.js, FastAPI & Database Presets)

**What to build:**
Xây dựng các thư mục template backend trong `templates/backend/`:
1. `.NET 8`:
   - `dotnet-8-webapi-ddd`: Clean Architecture / DDD chuẩn 4 layer:
     - `Domain`: Entities, Value Objects, Domain Events
     - `Application`: Features (CQRS / MediatR hoặc Services), DTOs, Interfaces
     - `Infrastructure`: Data (EF Core / Dapper), Repositories, External Services
     - `API`: Controllers, Endpoints, Program.cs, Middleware
   - `dotnet-8-webapi-mvc`: Controllers, Models, Services, Views/API
   - `dotnet-blank`: Minimal API tối giản 1 file `Program.cs`
   - Tích hợp sẵn EF Core DbContext hỗ trợ: PostgreSQL (`Npgsql`), MySQL (`Pomelo`), SQLite.
2. `Node.js (TypeScript)`:
   - `node-express-ddd`: Domain, Application, Infrastructure, Presentation
   - `node-fastify-clean`: Cấu trúc Plugins, Routes, Services, Schemas
   - `node-blank`: TypeScript server cơ bản
   - Tích hợp sẵn Prisma / Drizzle config cho DB đã chọn.
3. `FastAPI (Python)`:
   - `fastapi-modular`: Routers, Schemas, Core config, Services, SQLModel / SQLAlchemy engine.
   - `fastapi-blank`: Minimal `main.py`
4. Code mẫu:
   - Mỗi backend có 1 endpoint mẫu `/api/health` hoặc `/api/items` query thử kết nối Database.
   - File `.env.example` với connection string an toàn, không chứa secret.

**Blocked by:** 01-root-monorepo-cli-scaffold

**Status:** resolved

- [x] Các project .NET có file `.sln` và `.csproj` hợp lệ với packages EF Core tương ứng
- [x] Các project Node.js có `package.json` và `tsconfig.json` chuẩn
- [x] Project FastAPI có `requirements.txt` / `pyproject.toml`
- [x] Đảm bảo 100% không chứa secrets, tuân thủ nghiêm ngặt Zero-Leakage
