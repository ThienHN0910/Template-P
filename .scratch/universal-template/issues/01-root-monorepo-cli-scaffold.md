# 01: Root Monorepo & CLI Package Scaffold

**What to build:**
Khởi tạo cấu trúc monorepo gốc của dự án `template-p` bao gồm:
- Root `package.json` cấu hình pnpm / npm workspaces
- Package `packages/cli` với TypeScript build config (tsup hoặc tsc)
- Executable script `bin/create-p-stack.js` với `#!/usr/bin/env node`
- In ra banner khởi động đẹp mắt và version khi người dùng chạy `node packages/cli/bin/create-p-stack.js`

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Root `package.json` và `pnpm-workspace.yaml` được thiết lập
- [x] `packages/cli/package.json` với các dependencies: `@clack/prompts`, `picocolors`, `execa`, `commander` hoặc tương tự
- [x] TypeScript config (`tsconfig.json`) và build script
- [x] Executable binary chạy thử nghiệm in banner thành công
