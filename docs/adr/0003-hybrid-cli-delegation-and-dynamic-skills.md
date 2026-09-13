# 3. Kiến Trúc Lai (Hybrid Upstream Delegation) & Cập Nhật Tự Động Dynamic Skills

Date: 2026-09-13

## Bối cảnh (Context)
Trong phiên bản ban đầu, CLI sao chép các template thư mục tĩnh cho Frontend (Vue 3, React, Next.js) và bộ AI Skills. Tuy nhiên, cách tiếp cận này bộc lộ các hạn chế:
1. **Thiếu các tùy chọn chuẩn của hệ sinh thái**: Lập trình viên quen thuộc với `create-vue@latest` kỳ vọng được chọn đầy đủ các tính năng: TypeScript, Vue Router, Pinia, ESLint, Prettier, Vitest, Cypress/Playwright.
2. **Rủi ro lỗi thời phiên bản (Version Staleness)**: Khi Vue 3.6, Vite 7 hay Next.js phiên bản mới ra mắt, các template tĩnh sẽ bị tụt hậu so với chuẩn mới nhất của cộng đồng.
3. **Bộ AI Skills không đầy đủ**: Bộ `mattpocock/skills` thực tế có hơn 37 kỹ năng và liên tục được cập nhật trên GitHub, việc chỉ copy cứng 6 file làm mất đi sức mạnh của hệ sinh thái `skills.sh`.

## Quyết định Kiến trúc (Decision)
1. **Chuyển đổi sang Mô hình Lai (Hybrid Upstream Scaffolder)**:
   - CLI sẽ hỏi người dùng toàn bộ các tùy chọn chuẩn mực như các official tool (`create-vue`, `create-next-app`).
   - CLI sẽ gọi trực tiếp official generator với các cờ tương ứng (ví dụ: `npm create vue@latest apps/frontend -- --ts --router --pinia --eslint --prettier`).
   - Sau đó, CLI sẽ tiêm (layering) các tính năng tùy biến độc quyền:
     - Theme Switcher (Dark/Light mode 60fps)
     - SCSS Preprocessor / Tailwind CSS
     - Đa ngôn ngữ i18n (English & Tiếng Việt)
     - Cấu hình Proxy API và Typed API Client kết nối trực tiếp với Backend đã chọn.
   - Nếu môi trường offline hoặc lệnh official thất bại, tự động fallback về kho template tĩnh tích hợp sẵn.
2. **Tích hợp Công cụ Quản lý Kỹ năng Chính Thức (`skills.sh`)**:
   - Tận dụng lệnh chính thức: `npx skills@latest add <owner/repo> --agent * --all --copy -y` để tải trực tiếp phiên bản mới nhất từ GitHub (`mattpocock/skills`).
   - Tự động nạp vào các thư mục agent đích (`.gemini/skills/`, `.claude/skills/`, `.cursor/skills/`).
   - Duy trì kho dự phòng offline trong thư mục `templates/skills/` để hoạt động khi không có internet.

## Hệ quả (Consequences)
- Dự án sinh ra luôn sở hữu phiên bản mới nhất của các framework mà không cần bảo trì thủ công hàng chục template.
- Bộ kỹ năng AI luôn đầy đủ và cập nhật trực tiếp từ kho chính thức của Matt Pocock.
- Trải nghiệm lập trình viên đạt đẳng cấp chuyên nghiệp chuẩn mực của hệ sinh thái web hiện đại.
