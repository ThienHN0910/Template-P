# AGENTS.md

Welcome AI agents and developers. This file defines operating rules, agent configurations, and domain guidelines for `template-p` (the Universal Fullstack Template & CLI Engine).

## Agent skills

### Issue tracker

Local markdown files in `.scratch/`. See [`docs/agents/issue-tracker.md`](file:///E:/workspace/srcPrj/template-p/docs/agents/issue-tracker.md).

### Triage labels

Canonical 5 triage labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See [`docs/agents/triage-labels.md`](file:///E:/workspace/srcPrj/template-p/docs/agents/triage-labels.md).

### Domain docs

Single-context documentation layout. See [`docs/agents/domain.md`](file:///E:/workspace/srcPrj/template-p/docs/agents/domain.md).

---

## Project Overview

`template-p` là bộ công cụ CLI Scaffolder và GitHub Template đa năng:
1. Cho phép chạy lệnh `npx` (ví dụ `npx create-p-stack`) để khởi tạo dự án Fullstack bằng giao diện tương tác (interactive terminal).
2. Hỗ trợ chọn Backend (.NET, Node.js, FastAPI), Kiến trúc (Clean Architecture / DDD, MVC, Blank).
3. Kiểm tra tự động môi trường (`dotnet`, `node`, `python`), hỏi cài đặt nếu thiếu qua package manager của hệ điều hành.
4. Hỗ trợ chọn Frontend (Vue 3, React, Next.js, Nuxt 3) với tùy chọn Theme (Dark/Light), CSS (SCSS/Tailwind), đa ngôn ngữ (i18n).
5. Tự động đóng gói bộ Agent Skills (Matt Pocock skills, Taste skills, Ponytail) và MCP Servers vào dự án mới sinh ra.
