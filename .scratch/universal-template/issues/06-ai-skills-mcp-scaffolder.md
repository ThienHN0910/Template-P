# 06: AI Skills & MCP Server Scaffolder

**What to build:**
Xây dựng thư mục `templates/skills/` và `templates/mcp/`:
1. `templates/skills/pocock/`:
   - Trích xuất các skill cốt lõi của Matt Pocock: `to-tickets`, `to-spec`, `grill-me`, `domain-modeling`, `triage`, `setup-matt-pocock-skills`.
2. `templates/skills/taste/`:
   - Các skill định hình phong cách UI đỉnh cao: `design-taste-frontend`, `minimalist-ui`.
3. `templates/skills/ponytail/`:
   - Bộ quy tắc và skill kiểm soát over-engineering (`ponytail`, `ponytail-review`, `ponytail-audit`).
4. `templates/mcp/`:
   - File cấu hình mẫu MCP Servers (`mcp.json` và cấu hình dành cho Antigravity / Claude / Cursor):
     - `chrome-devtools`: Debug web frontend, xem console, inspect DOM
     - `filesystem`: Thao tác file trong workspace
     - `sqlite` / `postgres`: Truy vấn database an toàn

**Blocked by:** 01-root-monorepo-cli-scaffold

**Status:** resolved

- [x] Các file SKILL.md có metadata YAML chuẩn và hướng dẫn sử dụng chi tiết
- [x] File cấu hình MCP không chứa secret thật, có chú thích tham số rõ ràng
- [x] Tích hợp skills.sh engine: Hỗ trợ cài đặt bất kỳ repository skills nào qua `npx skills@latest add <repo>`
- [x] Đóng gói trọn bộ 52 production-grade AI Skills (37 Matt Pocock skills, 10 Taste UI skills, 5 Ponytail skills) trong offline bundle, tự động đồng bộ sang `.gemini/skills`, `.claude/skills`, `.cursorrules` và `mcp.json`
