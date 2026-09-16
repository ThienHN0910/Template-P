import type { FileOperation } from '../operations.js';

export function getVueViteOperations(): FileOperation[] {
  const pkgJson = {
    name: '@project/frontend',
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    },
    dependencies: {
      '@project/api-client': 'workspace:*',
      vue: '^3.5.13',
    },
    devDependencies: {
      '@vitejs/plugin-vue': '^5.2.1',
      typescript: '^7.0.2',
      vite: '^6.1.0',
    },
  };

  const viteConfig = `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
  },
});
`;

  const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Template-P Fullstack App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`;

  const mainTs = `import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
`;

  const appVue = `<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ApiClient, type Product } from '@project/api-client';

const client = new ApiClient();
const products = ref<Product[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    products.value = await client.getProducts();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <main style="padding: 2rem; font-family: sans-serif;">
    <h1>Product Catalog (Golden Slice)</h1>
    <p v-if="loading">Loading products...</p>
    <ul v-else>
      <li v-for="p in products" :key="p.id">
        <strong>{{ p.name }}</strong> - \${{ p.price }} ({{ p.description }})
      </li>
    </ul>
  </main>
</template>
`;

  return [
    { kind: 'createFile', path: 'apps/frontend/package.json', content: JSON.stringify(pkgJson, null, 2) + '\n' },
    { kind: 'createFile', path: 'apps/frontend/vite.config.ts', content: viteConfig },
    { kind: 'createFile', path: 'apps/frontend/index.html', content: indexHtml },
    { kind: 'createFile', path: 'apps/frontend/src/main.ts', content: mainTs },
    { kind: 'createFile', path: 'apps/frontend/src/App.vue', content: appVue },
  ];
}
