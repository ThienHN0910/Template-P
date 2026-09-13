# CONTEXT.md: Universal Template & CLI Scaffolder (`create-p-stack`)

## Domain Glossary

- **CLI Engine**: Bộ điều phối dòng lệnh tương tác (`packages/cli`), xử lý prompt hỏi người dùng, kiểm tra môi trường, và copy/transform template.
- **Pre-flight Check**: Tiến trình kiểm tra sự tồn tại và phiên bản của các CLI runtime (`dotnet`, `node`, `npm`, `python`) trên máy host trước khi scaffold.
- **Auto-installer**: Module thực hiện lệnh cài đặt phần mềm phụ thuộc qua Package Manager bản địa (`winget` trên Windows, `brew` trên macOS, `apt` trên Linux) kèm theo fallback URL.
- **Template Blueprint**: Các khung dự án mẫu tĩnh hoặc động (`templates/backend/*`, `templates/frontend/*`, `templates/skills/*`).
- **Scaffolded Project**: Dự án Fullstack Monorepo hoàn chỉnh do CLI tạo ra cho người dùng (`apps/backend`, `apps/frontend`, `docs/`, `.gemini/`).
- **Hybrid Scaffolder**: Cơ chế sinh dự án kết hợp: gọi trực tiếp official upstream generator (`create-vue@latest`, `create-next-app@latest`) để lấy bản mới nhất chuẩn cộng đồng, sau đó tiêm (layering) các tính năng tùy biến độc quyền (Theme 60fps, SCSS, i18n, API Client & Proxy).
- **Dynamic Skills Engine**: Cơ chế gọi trực tiếp công cụ `skills.sh` (`npx skills@latest add <owner/repo>`) để tải bộ 37+ kỹ năng mới nhất từ GitHub về máy dev.
- **AI Agent Bundle**: Gói kỹ năng AI (Matt Pocock skills, Taste skills, Ponytail) và cấu hình MCP Server (`mcp.json`) được tích hợp sẵn vào dự án mới.

## Core Invariants

1. CLI không bao giờ crash nếu máy người dùng thiếu runtime; luôn bắt lỗi và đưa ra hướng dẫn/tùy chọn cài đặt thân thiện.
2. Tên dự án phải tuân thủ chuẩn npm package naming (chữ thường, gạch ngang, không ký tự đặc biệt).
3. Các template Frontend phải có sẵn cơ chế chuyển đổi Theme (Dark/Light) và hỗ trợ đa ngôn ngữ (i18n) cấu hình sẵn.
4. Mọi template Backend dạng DDD phải tách bạch rõ ràng các tầng: Domain, Application, Infrastructure, Presentation/API.
