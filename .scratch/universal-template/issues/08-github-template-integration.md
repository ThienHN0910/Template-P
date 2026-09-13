# 08: GitHub Template Repo Integration & Verification

**What to build:**
Hoàn thiện hỗ trợ GitHub Template Repository và kiểm thử end-to-end:
1. Thêm script `scripts/init.js` và lệnh `npm run init` ở root repo để khi người dùng nhấn "Use this template" trên GitHub và clone về máy, họ chỉ cần gõ `npm run init` là wizard khởi chạy và tự dọn dẹp repo.
2. Viết `README.md` chính thức với badge, hướng dẫn cả 2 cách sử dụng:
   - Cách 1: `npx create-p-stack`
   - Cách 2: GitHub "Use this template"
3. Test end-to-end (E2E) tự động chạy thử CLI tạo ra một sample app (ví dụ DotNet 8 DDD + Vue 3 Vite + Pinia + i18n + AI Skills) và kiểm tra tính toàn vẹn của thư mục được sinh ra.

**Blocked by:** 07-scaffolding-orchestrator

**Status:** resolved

- [x] Lệnh `npm run init` chạy trơn tru trong repo clone
- [x] File `README.md` rõ ràng, có video/GIF demo hoặc các bước minh họa
- [x] Verification test chạy pass 100% không có lỗi
