# 07: Scaffolding Orchestrator, Composite Gitignore & Fullstack Assembler

**What to build:**
Engine lắp ráp toàn bộ dự án dựa trên các lựa chọn của người dùng:
1. Tạo thư mục đích `<project-name>/`
2. Tạo cấu trúc monorepo:
   - `apps/backend/`: Copy template backend đã chọn, thay thế project name, namespace, port.
   - `apps/frontend/`: Copy template frontend đã chọn, cấu hình proxy API trỏ tới backend port.
   - `docs/`: Sinh `ADR` và `agents/` tương ứng.
   - `.gemini/` (hoặc `.claude/`): Copy các gói skills đã chọn vào `.gemini/skills/` và file cấu hình `mcp.json`.
3. Sinh file `.gitignore` đa tầng động (Composite `.gitignore`):
   - Tự động gộp quy tắc chuẩn của OS (`.DS_Store`, `Thumbs.db`)
   - Quy tắc của Backend đã chọn (.NET: `bin/`, `obj/`, `*.user` / Python: `__pycache__/`, `.venv/` / Node: `node_modules/`, `dist/`)
   - Quy tắc của Frontend đã chọn (`.next/`, `.nuxt/`, `dist/`)
   - Bắt buộc bỏ qua tuyệt đối: `.env`, `**/.env`, `*.local`, `*.key`, `*.pem`
4. Sinh file `.env` (chứa connection string local Docker mặc định) và `.env.example` (chứa placeholder mẫu an toàn).
5. Sinh `docker-compose.yml` (nếu chọn PostgreSQL hoặc MySQL) kèm healthcheck và persistent volume.
6. Sinh root `package.json` với script `dev` chạy đồng thời BE & FE qua `concurrently`.
7. Tự động chạy `git init` nếu máy có Git.
8. In thông báo thành công và các bước khởi động (`cd <project>`, `pnpm install`, `pnpm dev`).

**Blocked by:** 02-cli-interactive-questionnaire, 03-preflight-environment-inspector, 04-core-backend-blueprints, 05-core-frontend-blueprints, 06-ai-skills-mcp-scaffolder

**Status:** resolved

- [x] Generator `.gitignore` gộp đúng các rule theo từng framework
- [x] File `.env` và `.env.example` sinh chính xác theo DB đã chọn
- [x] Root workspace chạy được `pnpm dev`
