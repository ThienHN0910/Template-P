# Universal Fullstack Template & CLI Engine (`@thienhn/create-template`)

<p align="center">
  <a href="https://www.npmjs.com/package/@thienhn/create-template"><img src="https://img.shields.io/npm/v/@thienhn/create-template.svg?style=flat-square&color=cb3837" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@thienhn/create-template"><img src="https://img.shields.io/npm/dm/@thienhn/create-template.svg?style=flat-square" alt="npm downloads" /></a>
  <a href="https://github.com/ThienHN0910/Template-P/discussions"><img src="https://img.shields.io/badge/Discussions-Join%20Community-blue?style=flat-square&logo=github" alt="GitHub Discussions" /></a>
  <a href="https://github.com/ThienHN0910/Template-P/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT" /></a>
  <a href="https://github.com/ThienHN0910/Template-P/pulls"><img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue.svg?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/.NET-8.0_LTS-512BD4.svg?style=flat-square&logo=dotnet" alt=".NET 8" />
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D.svg?style=flat-square&logo=vue.js" alt="Vue 3" />
  <img src="https://img.shields.io/badge/React-18%2F19-61DAFB.svg?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Next.js-15-black.svg?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688.svg?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Docker-Postgres%20%7C%20MySQL-2496ED.svg?style=flat-square&logo=docker" alt="Docker" />
</p>

> **Universal Fullstack Scaffolder & GitHub Template**: Khởi tạo một nền tảng Fullstack có thể tùy biến bằng giao diện terminal tương tác. Mỗi blueprint cần được xem xét và kiểm thử theo compatibility contract trước khi dùng cho production.

---

## 🌟 Điểm Nổi Bật (Key Features)

- ⚡ **2 Chế độ Sử dụng Tiện lợi**:
  1. **NPX Trực tiếp**: Chạy `npx @thienhn/create-template <tên-dự-án>` ở bất kỳ máy nào mà không cần cài trước.
  2. **GitHub Template Repository**: Nhấn **"Use this template"** trên GitHub, clone về máy và gõ `npm run init`.
- 🎯 **Giao diện Tương tác Terminal Hiện đại** (`@clack/prompts`):
  - Phím mũi tên di chuyển.
  - Phím **`<Space>`** để bật/tắt nhiều tùy chọn cùng lúc (Multi-select).
  - Phím **`<Enter>`** để xác nhận (hoặc nhấn Enter nhận ngay tên mặc định `my-p-app`).
- 🛠️ **Pre-flight Check & Tự Động Cài Đặt Môi Trường**:
  - Tự động phát hiện xem máy đã cài `dotnet`, `node`, hay `python` chưa.
  - Tự động kích hoạt Package Manager của hệ điều hành (`winget` trên Windows, `brew` trên macOS, `apt` trên Linux) để cài đặt nếu còn thiếu.
- 🏗️ **Ma trận Kiến trúc Backend Chuyên nghiệp**:
  - **.NET 8 LTS (C#)**:
    - Clean Architecture / DDD chuẩn 4 layer: `Domain`, `Application`, `Infrastructure`, `API`.
    - Classic Web API (MVC pattern).
    - Minimal Blank API.
  - **Node.js (TypeScript)**:
    - Express + Clean Architecture / DDD.
    - Fastify + Modular Plugins.
    - Blank Minimal TypeScript Server.
  - **FastAPI (Python)**:
    - Modular Architecture (Routers, Schemas, Services, SQLModel).
    - Minimal Blank FastAPI.
- 🎨 **Kiến Trúc Hybrid Upstream Frontend & Custom Layering**:
  - Tích hợp trực tiếp generator chính thức của framework (`create-vue@latest`, `create-next-app@latest`, React Vite, Nuxt 3) với trọn bộ feature flags (TypeScript, Router, Pinia, ESLint, Prettier, Vitest).
  - **Tự động chồng lớp (Custom Layers)**:
    - 🌓 **Theme Switcher (Dark / Light mode)**: Tối ưu chuẩn phần cứng 60fps GPU-accelerated.
    - 💅 **SCSS & Tailwind CSS Preprocessors**.
    - 🌐 **Đa ngôn ngữ i18n**: Cấu hình sẵn song ngữ Anh - Việt.
    - 🔌 **API Client & Reverse Proxy**: Gọi trực tiếp `/api` không sợ lỗi CORS.
- 💻 **Tùy Chọn IDE & Loại Bỏ Triệt Để Thư Mục Rác (Zero Repo Pollution)**:
  - Cho phép người dùng chọn IDE đang sử dụng: **VS Code / Cursor**, **Visual Studio**, **JetBrains Rider / WebStorm** hoặc **Minimal**.
  - Tự động may đo `.vscode/extensions.json` và `settings.json` đúng theo tech stack đã chọn.
  - Cho phép chọn trợ lý AI: **Antigravity / Gemini**, **Claude Code**, **Cursor**, **Windsurf**, **Roo Code**.
  - Không sinh thừa bất kỳ thư mục rác nào ngoài các công cụ bạn đã chọn.
- 🗄️ **Tùy chọn Database & Tự Động Sinh Docker Compose**:
  - Hỗ trợ **PostgreSQL 16 Alpine**, **MySQL 8.4**, **SQLite**, hoặc **None**.
  - Tự động sinh `docker-compose.yml` kèm healthcheck và giao diện quản trị (pgAdmin / phpMyAdmin).
  - Tự động sinh file `.env` cục bộ và `.env.example` an toàn theo chuẩn **Zero-Leakage Security**.
- 🤖 **Đóng Gói Sẵn 52 Production AI Agent Skills & MCP**:
  - **37 Matt Pocock Skills**: `ask-matt`, `to-tickets`, `to-spec`, `grill-me`, `domain-modeling`, `triage`, `tdd`, `code-review`, `wayfinder`...
  - **10 Design Taste Skills**: `design-taste-frontend`, `high-end-visual-design`, `industrial-brutalist-ui`, `minimalist-ui`, `image-to-code`...
  - **5 Ponytail Anti-Over-Engineering Skills**: `ponytail`, `ponytail-review`, `ponytail-audit`, `ponytail-gain`, `ponytail-help`.
  - **MCP Servers** (`mcp.json`): Chrome DevTools, Filesystem, Database connectors.

---

## 🚀 Hướng Dẫn Sử Dụng (Quick Start)

### Cách 1: Sử dụng qua lệnh NPX (Khuyến nghị)

```bash
npx @thienhn/create-template my-app
```

Hoặc chạy chế độ tương tác:
```bash
npx @thienhn/create-template
```

#### Chế độ Tự Động / CI (Non-interactive Mode với CLI Flags):
```bash
npx @thienhn/create-template my-app \
  --backend dotnet \
  --arch webapi-ddd \
  --frontend vue3 \
  --db postgres \
  --pm pnpm \
  --yes
```

| Flag | Rút gọn | Tùy chọn | Mô tả |
|---|---|---|---|
| `--backend` | `-b` | `dotnet`, `node`, `fastapi` | Framework backend |
| `--arch` | `-a` | `webapi-ddd`, `webapi-mvc`, `express-ddd`, `fastify-clean`, `modular`, `blank` | Kiến trúc backend |
| `--frontend` | `-f` | `vue3`, `react`, `nextjs`, `nuxt3` | Framework frontend |
| `--db`, `--database` | `-d` | `postgres`, `mysql`, `sqlite`, `none` | Động cơ Database |
| `--pm`, `--package-manager` | `-p` | `pnpm`, `npm`, `bun` | Trình quản lý gói |
| `--yes` | `-y` | | Bỏ qua hỏi đáp, dùng cấu hình mặc định |

---

### Cách 2: Sử dụng làm GitHub Template

1. Nhấn nút **"Use this template"** ở đầu trang GitHub repo này để tạo repo mới.
2. Clone repo mới về máy:
   ```bash
   git clone https://github.com/<username>/<your-new-repo>.git
   cd <your-new-repo>
   ```
3. Khởi chạy wizard:
   ```bash
   npm run init
   ```

---

## 📂 Cấu Trúc Dự Án Sau Khi Khởi Tạo (Monorepo Structure)

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
├── .vscode/                   # Cấu hình IDE được may đo riêng (nếu chọn)
│   ├── extensions.json        # Gợi ý extensions theo đúng stack đã chọn
│   └── settings.json          # Format on save, linter settings
│
├── .gemini/                   # Hoặc .claude/, .cursor/ (theo AI agent đã chọn)
│   ├── skills/                # 52 Production-grade Agent Skills
│   └── mcp.json               # Cấu hình Chrome DevTools, Filesystem, DB
│
├── docs/                      # ADRs và Agent Domain Docs
├── .env                       # Local dev connection strings (ĐÃ ĐƯỢC IGNORE)
├── .env.example               # Template biến môi trường mẫu (Zero-Leakage)
├── .gitignore                 # Composite gitignore tự động gộp theo stack
├── docker-compose.yml         # Container Database (Postgres/MySQL + GUI)
├── package.json               # Quản lý Monorepo & script dev đồng thời
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

- **Frontend**: `http://localhost:5173`
- **Backend Swagger API**: `http://localhost:5050/swagger`

---

## 🤝 Đóng Góp Phát Triển (Contributing)

Dự án này là mã nguồn mở và chúng tôi rất hoan nghênh sự đóng góp từ cộng đồng lập trình viên!

* 💬 **Trao đổi & Đóng góp ý kiến**: Tham gia [GitHub Discussions](https://github.com/ThienHN0910/Template-P/discussions).
* 🐛 **Báo cáo lỗi**: Mở [Issue Bug Report](https://github.com/ThienHN0910/Template-P/issues/new?template=bug_report.yml).
* 💡 **Đề xuất tính năng mới**: Mở [Feature Request](https://github.com/ThienHN0910/Template-P/issues/new?template=feature_request.yml).
* 🛠️ **Hướng dẫn đóng góp chi tiết**: Xem file [CONTRIBUTING.md](CONTRIBUTING.md).
* 📜 **Quy tắc ứng xử cộng đồng**: Xem file [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
* 🔒 **Báo cáo lỗ hổng bảo mật**: Xem [SECURITY.md](SECURITY.md).
* 🧭 **Phạm vi hỗ trợ hiện tại**: Xem [docs/compatibility.md](docs/compatibility.md).

---

## 📄 Bản Quyền (License)

Dự án được phát hành theo giấy phép [MIT License](LICENSE) © 2026 ThienHN0910.
Tự do sử dụng, chỉnh sửa và phân phối cho các dự án thương mại lẫn mã nguồn mở.
