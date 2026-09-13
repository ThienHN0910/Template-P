import fsp from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import { execa } from 'execa';
import { ProjectConfig } from '../types.js';

export async function scaffoldHybridFrontend(
  config: ProjectConfig,
  templatesDir: string,
  bePort: string
): Promise<void> {
  const { targetDir, frontend } = config;
  const appsDir = path.join(targetDir, 'apps');
  await fsp.mkdir(appsDir, { recursive: true });
  const frontendDest = path.join(appsDir, 'frontend');

  let usedUpstream = false;

  if (frontend.type === 'vue3') {
    // 1. Try Upstream Official create-vue@latest
    const flags = ['frontend', '--force'];
    if (frontend.features.typescript) flags.push('--ts');
    if (frontend.features.router) flags.push('--router');
    if (frontend.features.stateManagement === 'pinia') flags.push('--pinia');
    if (frontend.features.linter === 'eslint') flags.push('--eslint');
    if (frontend.features.prettier) flags.push('--prettier');
    if (frontend.features.vitest) flags.push('--vitest');

    // If no feature flags, pass --default so create-vue won't trigger interactive prompt
    if (flags.length === 2) {
      flags.push('--default');
    }

    try {
      await execa('npx', ['create-vue@latest', ...flags], {
        cwd: appsDir,
        timeout: 25000,
        stdio: 'pipe',
      });
      usedUpstream = true;
    } catch {
      usedUpstream = false;
    }

    if (!usedUpstream) {
      // Offline fallback
      const fallbackSource = path.join(templatesDir, 'frontend', 'vue3-vite');
      if (fs.existsSync(fallbackSource)) {
        await fsp.cp(fallbackSource, frontendDest, { recursive: true });
      }
    }

    // 2. Layer Custom Additions (Theme, i18n, SCSS, API Client & Proxy, Showcase App.vue)
    await layerVueCustomizations(frontendDest, templatesDir, config, bePort);
  } else if (frontend.type === 'nextjs') {
    try {
      const pmFlag =
        config.packageManager === 'pnpm'
          ? '--use-pnpm'
          : config.packageManager === 'bun'
            ? '--use-bun'
            : '--use-npm';
      await execa(
        'npx',
        [
          'create-next-app@latest',
          'frontend',
          '--typescript',
          '--eslint',
          '--tailwind',
          '--app',
          '--src-dir',
          '--import-alias',
          '@/*',
          '--skip-install',
          '--disable-git',
          '--yes',
          pmFlag,
        ],
        {
          cwd: appsDir,
          timeout: 30000,
          stdio: 'pipe',
        }
      );
      usedUpstream = true;
    } catch {
      usedUpstream = false;
    }

    if (!usedUpstream) {
      const fallbackSource = path.join(templatesDir, 'frontend', 'nextjs-app');
      if (fs.existsSync(fallbackSource)) {
        await fsp.cp(fallbackSource, frontendDest, { recursive: true });
      }
    }

    await layerNextCustomizations(frontendDest, bePort);
  } else if (frontend.type === 'react') {
    const reactSource = path.join(templatesDir, 'frontend', 'react-vite');
    if (fs.existsSync(reactSource)) {
      await fsp.cp(reactSource, frontendDest, { recursive: true });
    }
  } else if (frontend.type === 'nuxt3') {
    const nuxtSource = path.join(templatesDir, 'frontend', 'nuxt3-app');
    if (fs.existsSync(nuxtSource)) {
      await fsp.cp(nuxtSource, frontendDest, { recursive: true });
    }
  }
}

async function layerVueCustomizations(
  frontendDest: string,
  templatesDir: string,
  config: ProjectConfig,
  bePort: string
) {
  const pkgPath = path.join(frontendDest, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(await fsp.readFile(pkgPath, 'utf-8'));
    pkg.dependencies = pkg.dependencies || {};
    pkg.devDependencies = pkg.devDependencies || {};

    if (config.frontend.features.i18n) {
      pkg.dependencies['vue-i18n'] = '^11.1.1';
    }
    if (config.frontend.features.styling === 'scss') {
      pkg.devDependencies['sass'] = '^1.83.4';
    }
    await fsp.writeFile(pkgPath, JSON.stringify(pkg, null, 2), 'utf-8');
  }

  // Inject Theme styles
  const stylesDir = path.join(frontendDest, 'src', 'styles');
  await fsp.mkdir(stylesDir, { recursive: true });
  const themeScss = `:root {
  --bg-primary: #f8fafc;
  --bg-surface: #ffffff;
  --text-primary: #0f172a;
  --text-muted: #64748b;
  --accent-color: #3b82f6;
  --border-color: #e2e8f0;
  --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

[data-theme='dark'] {
  --bg-primary: #090d16;
  --bg-surface: #131b2e;
  --text-primary: #f1f5f9;
  --text-muted: #94a3b8;
  --accent-color: #60a5fa;
  --border-color: #1e293b;
  --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1), color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.btn-animate {
  transition: transform 0.15s ease, opacity 0.15s ease;
  will-change: transform, opacity;
  &:hover { transform: scale(1.02); }
  &:active { transform: scale(0.98); }
}
`;
  await fsp.writeFile(path.join(stylesDir, 'theme.scss'), themeScss, 'utf-8');

  // Inject i18n
  if (config.frontend.features.i18n) {
    const i18nContent = `import { createI18n } from 'vue-i18n';

export const i18n = createI18n({
  legacy: false,
  locale: 'vi',
  fallbackLocale: 'en',
  messages: {
    en: {
      welcome: 'Fullstack Starter Project',
      subtitle: 'Powered by create-p-stack & AI Agents',
      backendStatus: 'Backend Status',
      items: 'Database Items',
      addItem: 'Add Item',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      loading: 'Loading data...',
    },
    vi: {
      welcome: 'Dự Án Fullstack Khởi Tạo',
      subtitle: 'Xây dựng với create-p-stack & AI Agents',
      backendStatus: 'Trạng thái Backend',
      items: 'Dữ liệu từ Database',
      addItem: 'Thêm mới',
      darkMode: 'Chế độ Tối',
      lightMode: 'Chế độ Sáng',
      loading: 'Đang tải dữ liệu...',
    },
  },
});
`;
    await fsp.writeFile(path.join(frontendDest, 'src', 'i18n.ts'), i18nContent, 'utf-8');
  }

  // Inject Typed API Client
  const apiDir = path.join(frontendDest, 'src', 'api');
  await fsp.mkdir(apiDir, { recursive: true });
  const apiClientContent = `export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  createdAt: string;
}

export interface HealthResponse {
  status: string;
  timestamp?: string;
}

export const apiClient = {
  async getHealth(): Promise<HealthResponse> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch {
      return { status: 'Offline / Connecting...' };
    }
  },
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Fetch failed');
      return await res.json();
    } catch {
      return [];
    }
  },
  async createProduct(name: string, price: number): Promise<Product | null> {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price }),
      });
      return res.ok ? await res.json() : null;
    } catch {
      return null;
    }
  },
};
`;
  await fsp.writeFile(path.join(apiDir, 'client.ts'), apiClientContent, 'utf-8');

  // Copy fullstack showcase App.vue if template exists
  const appVueTemplate = path.join(templatesDir, 'frontend', 'vue3-vite', 'src', 'App.vue');
  if (fs.existsSync(appVueTemplate)) {
    await fsp.copyFile(appVueTemplate, path.join(frontendDest, 'src', 'App.vue'));
  }

  // Inject into main.ts
  const mainTsPath = path.join(frontendDest, 'src', 'main.ts');
  if (fs.existsSync(mainTsPath)) {
    let mainTs = await fsp.readFile(mainTsPath, 'utf-8');
    if (!mainTs.includes('theme.scss')) {
      mainTs = `import './styles/theme.scss';\n` + mainTs;
    }
    if (config.frontend.features.i18n && !mainTs.includes('i18n')) {
      mainTs = `import { i18n } from './i18n';\n` + mainTs;
      if (mainTs.includes('.mount(')) {
        mainTs = mainTs.replace('.mount(', '.use(i18n).mount(');
      } else {
        mainTs = mainTs.replace('app.mount', 'app.use(i18n);\napp.mount');
      }
    }
    await fsp.writeFile(mainTsPath, mainTs, 'utf-8');
  }

  // Inject Vite Proxy in vite.config.ts
  const viteConfigPath = path.join(frontendDest, 'vite.config.ts');
  if (fs.existsSync(viteConfigPath)) {
    let viteConfig = await fsp.readFile(viteConfigPath, 'utf-8');
    if (!viteConfig.includes("'/api'")) {
      viteConfig = viteConfig.replace(
        'defineConfig({',
        `defineConfig({\n  server: {\n    port: 5173,\n    proxy: {\n      '/api': {\n        target: 'http://localhost:${bePort}',\n        changeOrigin: true,\n      },\n    },\n  },`
      );
      await fsp.writeFile(viteConfigPath, viteConfig, 'utf-8');
    }
  }
}

async function layerNextCustomizations(frontendDest: string, bePort: string) {
  // Check for next.config.ts, next.config.mjs, or next.config.js
  const configFiles = ['next.config.ts', 'next.config.mjs', 'next.config.js'];
  for (const file of configFiles) {
    const configPath = path.join(frontendDest, file);
    if (fs.existsSync(configPath)) {
      let content = await fsp.readFile(configPath, 'utf-8');
      if (!content.includes('/api/')) {
        if (content.includes('nextConfig = {')) {
          content = content.replace(
            'nextConfig = {',
            `nextConfig = {\n  async rewrites() {\n    return [\n      {\n        source: '/api/:path*',\n        destination: 'http://localhost:${bePort}/api/:path*',\n      },\n    ];\n  },`
          );
        } else if (content.includes('nextConfig: NextConfig = {')) {
          content = content.replace(
            'nextConfig: NextConfig = {',
            `nextConfig: NextConfig = {\n  async rewrites() {\n    return [\n      {\n        source: '/api/:path*',\n        destination: 'http://localhost:${bePort}/api/:path*',\n      },\n    ];\n  },`
          );
        }
        await fsp.writeFile(configPath, content, 'utf-8');
      }
      break;
    }
  }

  // Inject Typed API client in src/lib/api-client.ts
  const libDir = path.join(frontendDest, 'src', 'lib');
  await fsp.mkdir(libDir, { recursive: true });
  const apiClientContent = `export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  createdAt: string;
}

export interface HealthResponse {
  status: string;
  timestamp?: string;
}

export const apiClient = {
  async getHealth(): Promise<HealthResponse> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch {
      return { status: 'Offline / Connecting...' };
    }
  },
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Fetch failed');
      return await res.json();
    } catch {
      return [];
    }
  },
};
`;
  await fsp.writeFile(path.join(libDir, 'api-client.ts'), apiClientContent, 'utf-8');
}
