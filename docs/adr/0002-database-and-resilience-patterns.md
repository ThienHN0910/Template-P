# 2. Xử Lý Cơ Sở Dữ Liệu, Độ Bền (Resilience) & Các Kịch Bản Lỗi

Date: 2026-09-13

## Bối cảnh & Nghiên cứu Rủi ro (Research & Edge Cases)
Khi xây dựng một công cụ CLI scaffolder Fullstack đa nền tảng (Windows, macOS, Linux) kết hợp nhiều runtime (.NET, Node, Python, Database), có những rủi ro và tình huống biên (edge cases) sau đây cần được xử lý triệt để:

### 1. Kịch bản lỗi cài đặt Runtime & Quyền Administrator/Sudo
- **Vấn đề**: Khi người dùng chọn tự động cài `dotnet`, `node`, hoặc `python` qua `winget` (Windows) hoặc `brew`/`apt`, lệnh có thể thất bại do:
  - Terminal không chạy dưới quyền Administrator / Sudo.
  - Sau khi cài xong, biến môi trường `PATH` trong session terminal hiện tại chưa cập nhật ngay.
- **Giải pháp**:
  - Bọc lệnh gọi child process bằng `try/catch` có timeout.
  - Nếu thất bại, tuyệt đối không để CLI crash. Bắt lỗi, hiển thị thông báo thân thiện kèm đường dẫn tải chính thức.
  - Cung cấp cơ chế "fallback retry": *"Nhấn Enter sau khi bạn đã cài đặt xong để CLI tiếp tục"*.

### 2. Lựa chọn Database & Cấu hình Mẫu (DB Boilerplate)
- **Vấn đề**: Mỗi framework có hệ sinh thái ORM và connection string khác nhau:
  - .NET: PostgreSQL (`Npgsql`), MySQL (`Pomelo`), SQLite (`Microsoft.EntityFrameworkCore.Sqlite`).
  - Node.js: Prisma hoặc Drizzle ORM.
  - FastAPI: SQLModel / SQLAlchemy + Alembic.
- **Giải pháp**:
  - Hỗ trợ chọn Database qua prompt tương tác: `PostgreSQL`, `MySQL`, `SQLite`, `None`.
  - Sinh sẵn code mẫu kết nối (DbContext / DB Client / Healthcheck Entity).
  - Tự động sinh `docker-compose.yml` (chỉ khi chọn Postgres/MySQL) kèm healthcheck, volume và service quản lý (pgAdmin/Adminer).
  - Sinh file `.env` với connection string chuẩn cho local Docker dev, và `.env.example` với placeholder an toàn.

### 3. Sinh File `.gitignore` Đa Tầng (Composite .gitignore)
- **Vấn đề**: Một monorepo chứa cả .NET (C#) và Frontend (Node) hoặc Python sẽ bị commit nhầm các file rác như `bin/`, `obj/`, `.venv/`, `__pycache__/`, `node_modules/`, và đặc biệt là file bí mật `.env`.
- **Giải pháp**:
  - Xây dựng module `generateGitignore({ be, fe, db })` tự động ghép nối các quy tắc `.gitignore` chuẩn từ GitHub Templates cho từng framework tương ứng, đảm bảo 100% tuân thủ **Zero-Leakage Security**.

### 4. Xung Đột Cổng Mạng (Port Collisions)
- **Vấn đề**: .NET thường dùng port 5000/5001 (hay bị trùng trên macOS hoặc app khác), Next.js dùng 3000, Vite dùng 5173.
- **Giải pháp**:
  - Phân bổ port mặc định rõ ràng:
    - .NET API: `5050`
    - Node API: `4000`
    - FastAPI: `8000`
    - Frontend: `5173` (Vite) / `3000` (Next.js) / `3001` (Nuxt)
  - Cấu hình proxy ở Frontend tự động trỏ đúng port Backend tương ứng.

### 5. Khởi Chạy Đồng Thời BE và FE với 1 Lệnh Duy Nhất (`pnpm dev`)
- **Vấn đề**: Dev phải mở 2 terminal riêng rẽ để chạy Backend và Frontend.
- **Giải pháp**:
  - Dùng thư viện `concurrently` trong root `package.json`:
    - Với .NET: `"dev": "concurrently \"pnpm --filter frontend dev\" \"dotnet run --project apps/backend/...\""`
    - Với FastAPI: `"dev": "concurrently \"pnpm --filter frontend dev\" \"cd apps/backend && uvicorn main:app --reload\""`
    - Với Node: `"dev": "concurrently \"pnpm --filter frontend dev\" \"pnpm --filter backend dev\""`
