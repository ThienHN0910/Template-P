# Specification: Universal Fullstack Template & Interactive CLI (`create-p-stack`)

## 1. Mục tiêu & Tổng quan
Xây dựng một bộ công cụ khởi tạo dự án Fullstack chuẩn hóa cho phép:
1. Chạy trực tiếp qua lệnh NPX: `npx create-p-stack` (hoặc `npx template-p`).
2. Tương thích làm GitHub Template Repository ("Use this template" -> `npm run init`).
3. Giao diện Terminal tương tác hiện đại (`@clack/prompts`): dùng phím mũi tên di chuyển, Space để chọn / bỏ chọn (multi-select), Enter để xác nhận, hỗ trợ giá trị mặc định khi gõ Enter.
4. Kiểm tra trước môi trường (Pre-flight checks): Phát hiện xem máy đã cài `dotnet`, `node`, `python` chưa. Nếu chưa, hỏi có muốn tự động cài đặt qua package manager (winget/brew/apt) hoặc cung cấp link tải chính thức.
5. Lựa chọn linh hoạt:
   - **Backend**:
     - `.NET`: Version 8 LTS, lựa chọn Web API / Razor Pages, kiến trúc DDD (Clean Architecture), MVC, hoặc Blank/Minimal.
     - `Node.js (TypeScript)`: Express hoặc Fastify, kiến trúc DDD/Clean, MVC, hoặc Blank.
     - `FastAPI (Python)`: Modular DDD hoặc Flat/Blank.
   - **Frontend**:
     - `Vue 3`: Vite + Pinia, tích hợp Dark/Light theme, tùy chọn SCSS, cấu hình sẵn vue-i18n.
     - `React`: Vite, tích hợp Dark/Light theme, SCSS/Tailwind, i18next.
     - `Next.js`: App Router, next-themes, next-intl.
     - `Nuxt 3`: @nuxtjs/color-mode, @nuxtjs/i18n.
   - **AI Agent Skills & MCP Presets**:
     - Matt Pocock Skills (`to-tickets`, `to-spec`, `grill-me`, `domain-modeling`, `triage`...).
     - Taste Skills (`design-taste-frontend`, `minimalist-ui`).
     - Ponytail Rules (chống over-engineering).
     - Cấu hình MCP Server (`mcp.json`) cho Chrome DevTools, Filesystem, Database.

---

## 2. Kiến trúc Thư mục Monorepo của Bộ Tool này

```text
template-p/
├── packages/
│   └── cli/                       # Source code của CLI tool (npx create-p-stack)
│       ├── src/
│       │   ├── index.ts           # Entry point của CLI
│       │   ├── prompts/           # Từng bước hỏi (prompts)
│       │   │   ├── project-name.ts
│       │   │   ├── backend.ts
│       │   │   ├── frontend.ts
│       │   │   ├── preflight.ts
│       │   │   └── ai-skills.ts
│       │   ├── installer/         # Logic kiểm tra & cài đặt runtime (winget, brew, apt)
│       │   ├── scaffolder/        # Logic copy & transform template sang thư mục đích
│       │   └── utils/
│       ├── bin/
│       │   └── create-p-stack.js  # Executable entrypoint
│       └── package.json
├── templates/                     # Kho lưu trữ các template mẫu
│   ├── backend/
│   │   ├── dotnet-8-webapi-ddd/
│   │   ├── dotnet-8-webapi-mvc/
│   │   ├── dotnet-blank/
│   │   ├── node-express-ddd/
│   │   ├── node-fastify-clean/
│   │   ├── node-blank/
│   │   ├── fastapi-modular/
│   │   └── fastapi-blank/
│   ├── frontend/
│   │   ├── vue3-vite/
│   │   ├── react-vite/
│   │   ├── nextjs-app/
│   │   └── nuxt3-app/
│   ├── skills/                    # Bộ Agent Skills mẫu
│   │   ├── pocock/
│   │   ├── taste/
│   │   └── ponytail/
│   └── mcp/                       # File cấu hình MCP servers mẫu
├── docs/
│   ├── adr/
│   └── agents/
├── .scratch/
├── package.json                   # Root package.json quản lý pnpm workspaces
├── pnpm-workspace.yaml
└── README.md
```

---

## 3. Cấu trúc Thư mục của Dự án do CLI Sinh Ra

```text
<project-name>/
├── apps/
│   ├── backend/                   # Template backend đã chọn
│   └── frontend/                  # Template frontend đã chọn
├── docs/
│   ├── adr/
│   └── agents/
├── .gemini/                       # Hoặc .claude/ tùy chọn
│   ├── skills/                    # Các skill đã chọn tích hợp
│   └── mcp.json                   # Cấu hình MCP server
├── package.json                   # Root workspace chạy lệnh chung (pnpm dev, pnpm build)
├── docker-compose.yml             # Docker compose chạy BE, FE, DB
├── .gitignore
├── .env.example                   # Tuân thủ nghiêm ngặt Zero-Leakage Secrets
└── README.md
```

---

## 4. Quy chuẩn Kỹ thuật & Tiêu chuẩn Chất lượng
- **An ninh & Bí mật (Zero-Leakage)**: Mọi template đều chỉ dùng `.env.example`, không hardcode secret hay API key.
- **Cross-Platform**: CLI hoạt động trơn tru trên Windows (PowerShell/CMD), macOS, và Linux.
- **Giao diện dòng lệnh mượt mà**: Sử dụng `@clack/prompts`, spinner hiển thị trạng thái copy và install, màu sắc `picocolors` trang nhã.
