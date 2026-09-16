import type { FileOperation } from '../operations.js';

export function getNuxtAppOperations(): FileOperation[] {
  const pkgJson = {
    name: '@project/frontend',
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'nuxt dev',
      build: 'nuxt build',
      generate: 'nuxt generate',
      preview: 'nuxt preview',
    },
    dependencies: {
      '@project/api-client': 'workspace:*',
      nuxt: '^3.15.4',
      vue: '^3.5.13',
    },
    devDependencies: {
      typescript: '^7.0.2',
    },
  };

  const nuxtConfig = `import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
});
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
    { kind: 'createFile', path: 'apps/frontend/nuxt.config.ts', content: nuxtConfig },
    { kind: 'createFile', path: 'apps/frontend/app.vue', content: appVue },
  ];
}
