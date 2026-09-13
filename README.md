# Universal Fullstack Template & Interactive CLI Scaffolder (`create-p-stack`)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![.NET 8](https://img.shields.io/badge/.NET-8.0_LTS-512BD4.svg)](https://dotnet.microsoft.com/)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D.svg)](https://vuejs.org/)
[![React](https://img.shields.io/badge/React-18%2F19-61DAFB.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **The Ultimate Universal Scaffolder & GitHub Template**: Khởi tạo dự án Fullstack chuẩn mực sản xuất chỉ trong 30 giây với giao diện Terminal tương tác, tự động kiểm tra runtime môi trường, tích hợp sẵn Database Docker Compose, và trang bị đầy đủ bộ siêu năng lực AI Agent Skills + MCP Servers.

---

## 🌟 Điểm Nổi Bật (Key Features)

- ⚡ **2 Chế độ Sử dụng Tiện lợi**:
  1. **NPX Trực tiếp**: Chạy `npx create-p-stack <tên-dự-án>` ở bất kỳ máy nào mà không cần cài trước.
  2. **GitHub Template Repository**: Nhấn **"Use this template"** trên GitHub, clone về máy và gõ `npm run init`.
- 🎯 **Giao diện Tương tác Terminal Hiện đại** (`@clack/prompts`):
  - Hỗ trợ phím mũi tên di chuyển.
  - Phím **`<Space>`** để bật/tắt nhiều tùy chọn cùng lúc (Multi-select).
  - Phím **`<Enter>`** để xác nhận (hoặc nhấn Enter nhận ngay tên mặc định `my-p-app`).
- 🛠️ **Pre-flight Check & Tự Động Cài Đặt Môi Trường**:
  - Tự động phát hiện xem máy đã cài `dotnet`, `node`, hay `python` chưa.
  - Hỏi người dùng và tự động kích hoạt Package Manager của hệ điều hành (`winget` trên Windows, `brew` trên macOS, `apt` trên Linux) để cài đặt phiên bản phù hợp.
  - Xử lý lỗi quyền Administrator/Sudo mượt mà, cung cấp link tải chính thức và cơ chế fallback an toàn.
- 🏗️ **Ma trận Kiến trúc Backend Chuyên nghiệp**:
  - **.NET 8 LTS (C#)**:
    - Clean Architecture / DDD (Domain-Driven Design) chuẩn 4 layer: `Domain`, `Application`, `Infrastructure`, `API`.
    - Classic Web API (MVC pattern).
    - Minimal Blank API.
  - **Node.js (TypeScript)**:
    - Express + Clean Architecture / DDD.
    - Fastify + Modular Plugins.
    - Blank TypeScript Server.
  - **FastAPI (Python)**:
    - Modular Architecture (Routers, Schemas, Services, SQLModel).
    - Minimal Blank FastAPI.
- 🗄️ **Tùy chọn Database & Tự Động Sinh Docker Compose**:
  - Hỗ trợ **PostgreSQL**, **MySQL / MariaDB**, **SQLite**, hoặc **None**.
  - Tự động cấu hình ORM tương ứng (EF Core cho .NET, Prisma/Drizzle cho Node, SQLModel cho Python).
  - Tự động sinh file `docker-compose.yml` (cho Postgres/MySQL) kèm healthcheck, pgAdmin/Adminer.
  - Tự động sinh file `.env` cục bộ và `.env.example` an toàn theo quy tắc **Zero-Leakage Security**.
- 🎨 **Frontend Đỉnh cao & Trải nghiệm Người dùng**:
  - Hỗ trợ: **Vue 3** (Vite + Pinia), **React** (Vite), **Next.js** (App Router), **Nuxt 3**.
  - Tích hợp sẵn:
    - 🌓 **Theme Switcher (Dark / Light mode)**: Tối ưu theo tiêu chuẩn 60fps GPU-accelerated.
    - 💅 **SCSS Preprocessor**: Mixins, responsive breakpoints và biến giao diện.
    - 🌐 **Đa ngôn ngữ i18n**: Cấu hình sẵn song ngữ Anh - Việt.
    - 🔌 **API Proxy chống lỗi CORS**: Frontend tự động trỏ request `/api` tới đúng port của Backend.
- 🤖 **Bộ Siêu Năng Lực AI Agent & MCP Tích Hợp Sẵn**:
  - **Matt Pocock's Skills**: `to-tickets`, `to-spec`, `grill-me`, `domain-modeling`, `triage`, `setup-matt-pocock-skills`.
  - **Frontend Taste Skills**: `design-taste-frontend`, `minimalist-ui`.
  - **Ponytail Engine**: Bộ quy tắc chống over-engineering và review mã nguồn tinh gọn.
  - **MCP Servers Config** (`mcp.json`): Cấu hình sẵn Chrome DevTools, Filesystem, Database.
  - Tự động sinh `AGENTS.md`, `CLAUDE.md`, `.cursorrules` được may đo theo đúng công nghệ bạn chọn.

---

## 🚀 Hướng Dẫn Sử Dụng (Quickstart)

### Cách 1: Sử dụng qua lệnh NPX (Khuyến nghị)

Mở terminal bất kỳ và chạy:

```bash
npx create-p-stack my-app
```

*Nếu bạn muốn chạy không cần hỏi (Non-interactive mode) với cấu hình mặc định:*
```bash
npx create-p-stack my-app --backend dotnet --arch webapi-ddd --frontend vue3 --db postgres --yes
```

---

### Cách 2: Sử dụng làm GitHub Template

1. Nhấn nút **"Use this template"** ở đầu trang GitHub repo này để tạo repo mới của bạn.
2. Clone repo mới về máy:
   ```bash
   git clone <your-new-repo-url>
   cd <your-new-repo>
   ```
3. Chạy wizard khởi tạo:
   ```bash
   npm run init
   ```

---

## 📂 Cấu Trúc Dự Án Sau Khi Khởi Tạo (Generated Monorepo Structure)

```text
my-app/
├── apps/
│   ├── backend/               # .NET 8 DDD / Node.js TS / FastAPI
│   │   ├── src/
│   │   │   ├── Domain/        # Entities, Value Objects
│   │   │   ├── Application/   # CQRS, Features, Interfaces
│   │   │   ├── Infrastructure/# EF Core, DB Context (Postgres/MySQL/SQLite)
│   │   │   └── API/           # Controllers, Swagger, CORS, Program.cs
│   │   └── .env.example
│   │
│   └── frontend/              # Vue 3 / React / Next.js / Nuxt 3
│       ├── src/
│       │   ├── api/client.ts  # Typed API Client (kết nối trực tiếp tới BE)
│       │   ├── styles/        # Theme SCSS (Dark/Light 60fps)
│       │   ├── i18n.ts        # Đa ngôn ngữ (VI / EN)
│       │   └── App.vue        # Giao diện mẫu kết nối dữ liệu từ Backend
│       └── vite.config.ts     # Proxy tự động /api -> Backend port
│
├── docs/                      # ADRs và Agent Domain Docs
├── .gemini/                   # Hoặc .claude/
│   ├── skills/                # Pocock skills, Taste skills, Ponytail
│   └── mcp.json               # Cấu hình Chrome DevTools, Filesystem, DB
│
├── .env                       # Local dev connection strings (ĐÃ ĐƯỢC IGNORE)
├── .env.example               # Template biến môi trường mẫu (Zero-Leakage)
├── .gitignore                 # Composite gitignore tự động gộp theo stack
├── docker-compose.yml         # Container Database (Postgres/MySQL + GUI)
├── package.json               # Quản lý Monorepo & script concurrently
└── README.md
```

---

## 🏃‍♂️ Khởi Chạy Dự Án (All-in-One Dev Script)

Chỉ với 1 lệnh duy nhất ở thư mục gốc của dự án vừa sinh ra:

```bash
cd my-app
pnpm install
docker compose up -d    # Khởi động Database (nếu chọn Postgres/MySQL)
pnpm dev                # Chạy đồng thời cả Backend và Frontend!
```

- **Frontend**: Mở trình duyệt tại `http://localhost:5173`
- **Backend Swagger API**: Mở tại `http://localhost:5050/swagger`

---

## 🛡️ Tiêu Chuẩn Bảo Mật & Kỹ Thuật (Zero-Leakage)

Dự án tuân thủ nghiêm ngặt **Quy tắc Vàng về Bí mật & An ninh (Zero-Leakage)**:
- Tuyệt đối không bao giờ hardcode chuỗi kết nối Database thật, token hoặc API key trong mã nguồn.
- Mọi file `.env`, `**/.env`, `*.key`, `*.pem` đều được `.gitignore` chặn đứng tự động.

---

## 📄 Bản Quyền (License)

Dự án được phát hành theo giấy phép [MIT License](LICENSE).
Tự do sử dụng, chỉnh sửa và phân phối cho các dự án thương mại lẫn mã nguồn mở.
