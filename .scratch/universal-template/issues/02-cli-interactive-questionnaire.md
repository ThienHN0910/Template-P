# 02: CLI Interactive Questionnaire Engine (Prompts Pipeline)

**What to build:**
Bộ câu hỏi tương tác hoàn chỉnh bằng `@clack/prompts`:
- **1. Tên dự án**: Nhập tên tuỳ ý, hoặc nhấn Enter nhận tên mặc định `my-p-app`.
- **2. Package Manager**: Chọn `pnpm` (khuyến nghị), `npm`, hoặc `bun`.
- **3. Chọn Backend**:
  - `.NET`: Chọn version (.NET 8 LTS), chọn Web API hoặc Razor, chọn kiến trúc (DDD / Clean Architecture, MVC, Blank).
  - `Node.js`: Chọn Express hoặc Fastify, chọn kiến trúc (DDD / Clean Architecture, MVC, Blank).
  - `FastAPI`: Chọn kiến trúc (Modular DDD, Flat/Blank).
- **4. Chọn Database & ORM**:
  - `PostgreSQL` (sinh sẵn cấu hình Docker & ORM)
  - `MySQL / MariaDB` (sinh sẵn cấu hình Docker & ORM)
  - `SQLite` (cực nhẹ, không cần Docker)
  - `None / Configure later` (chỉ khung API cơ bản)
- **5. Chọn Frontend**: `Vue 3`, `React`, `Next.js`, `Nuxt 3`.
- **6. Multi-select Features cho Frontend** (dùng phím Space để bật/tắt, Enter xác nhận):
  - [x] Theme switcher (Dark / Light mode)
  - [x] CSS preprocessor (SCSS hoặc Tailwind CSS)
  - [x] Đa ngôn ngữ i18n (l10n)
- **7. Multi-select AI Skills & Tools**:
  - [x] Matt Pocock Skills (`to-tickets`, `to-spec`, `grill-me`, `triage`, `domain-modeling`)
  - [x] Taste Skills (`design-taste-frontend`, `minimalist-ui`)
  - [x] Ponytail Engine (Quy tắc chống over-engineering)
  - [x] Cấu hình MCP Server (`mcp.json` cho Chrome DevTools, Filesystem, Database)
- Trả về đối tượng `ProjectConfig` đã được validate đầy đủ.

**Blocked by:** 01-root-monorepo-cli-scaffold

**Status:** resolved

- [x] Phím Space và Enter hoạt động đúng hành vi tương tác dòng lệnh
- [x] Lựa chọn Database được tích hợp liền mạch
- [x] Hỗ trợ hủy tiến trình an toàn khi nhấn Ctrl+C (graceful cancellation)
