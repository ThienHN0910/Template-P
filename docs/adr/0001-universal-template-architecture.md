# 1. Kiến Trúc Universal Fullstack Template & CLI Engine

Date: 2026-09-13

## Bối cảnh & Vấn đề (Context)
Các nhà phát triển thường xuyên phải mất nhiều thời gian để khởi tạo dự án mới:
- Chọn framework Backend (DotNet, Node.js, FastAPI) và dựng các tầng kiến trúc (DDD/Clean Architecture, MVC).
- Cài đặt runtime và kiểm tra công cụ máy dev.
- Cấu hình Frontend (Vue 3, React, Next.js, Nuxt 3) với các nhu cầu cơ bản: Theme (Dark/Light), SCSS, Đa ngôn ngữ (i18n).
- Tích hợp các trợ lý AI Coding Agent (Matt Pocock skills, Taste skills, Ponytail, MCP servers).

## Quyết định (Decision)
1. **Xây dựng `template-p` theo mô hình Monorepo lai (Dual-mode)**:
   - Một CLI package độc lập (`packages/cli`) có thể publish lên npm (`npx create-p-stack`).
   - Một kho template (`templates/`) chứa các mẫu BE, FE, AI Skills và MCP configurations.
   - Hỗ trợ cả GitHub Template Repo ("Use this template" -> chạy wizard nội bộ).
2. **Interactive CLI UX**:
   - Sử dụng `@clack/prompts` để hỗ trợ lựa chọn trực quan bằng phím mũi tên, Space (multi-select), Enter (xác nhận) và giá trị mặc định nếu bỏ qua.
3. **Pre-flight & Installer**:
   - Tự động chạy lệnh kiểm tra runtime (`dotnet`, `node`, `python`).
   - Cung cấp cơ chế cài đặt qua Package Manager tương ứng của OS (`winget` trên Windows, `brew` trên macOS, `apt` trên Linux) kèm fallback link.
4. **AI-Native từ gốc**:
   - Tự động tạo thư mục `.gemini/skills/` hoặc `.claude/skills/` và cấu hình MCP Server cho dự án đích.

## Hệ quả (Consequences)
- Dễ dàng mở rộng thêm template mới trong tương lai chỉ bằng cách thêm thư mục vào `templates/`.
- Tiết kiệm thời gian thiết lập dự án ban đầu từ hàng giờ xuống dưới 1 phút.
- Đảm bảo tuân thủ tiêu chuẩn code, bảo mật `.env.example`, và cấu trúc sạch sẽ.
