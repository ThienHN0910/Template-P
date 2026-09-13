# 05: Core Frontend Blueprints (Vue 3, React, Next.js, Nuxt 3)

**What to build:**
Xây dựng các thư mục template frontend trong `templates/frontend/`:
1. `vue3-vite`:
   - Vue 3 + TypeScript + Vite + Pinia
   - Hỗ trợ chuyển đổi Theme (Dark/Light mode) với CSS Variables / Tailwind
   - Cấu hình SCSS với các mixin và biến theme
   - Tích hợp sẵn `vue-i18n` (hỗ trợ mẫu tiếng Việt và tiếng Anh)
2. `react-vite`:
   - React 18/19 + TypeScript + Vite
   - Theme Provider (Dark / Light)
   - Tích hợp SCSS / Tailwind và `react-i18next`
3. `nextjs-app`:
   - Next.js 14/15 App Router + TypeScript
   - `next-themes` (Dark/Light) + `next-intl`
4. `nuxt3-app`:
   - Nuxt 3 + TypeScript
   - `@nuxtjs/color-mode` + `@nuxtjs/i18n`

**Blocked by:** 01-root-monorepo-cli-scaffold

**Status:** resolved

- [x] Từng template frontend có thể chạy `npm install` và `npm run dev` độc lập
- [x] Tính năng Dark/Light mode hoạt động mượt mà
- [x] Tính năng đa ngôn ngữ có ví dụ chuyển đổi ngôn ngữ trực quan
