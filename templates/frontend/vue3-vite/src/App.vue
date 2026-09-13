<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { apiClient, Product } from './api/client.js';

const { t, locale } = useI18n();

const isDark = ref(false);
const healthStatus = ref('Checking...');
const products = ref<Product[]>([]);
const newName = ref('');
const newPrice = ref(49.99);
const loading = ref(false);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light');
};

const toggleLanguage = () => {
  locale.value = locale.value === 'vi' ? 'en' : 'vi';
};

const loadData = async () => {
  loading.value = true;
  const health = await apiClient.getHealth();
  healthStatus.value = health.status;
  products.value = await apiClient.getProducts();
  loading.value = false;
};

const handleCreate = async () => {
  if (!newName.value) return;
  const created = await apiClient.createProduct(newName.value, newPrice.value);
  if (created) {
    products.value.push(created);
    newName.value = '';
  }
};

onMounted(() => {
  toggleTheme(); // Set default dark
  loadData();
});
</script>

<template>
  <main class="container">
    <header class="header">
      <div class="brand">
        <h1>{{ t('welcome') }}</h1>
        <p class="subtitle">{{ t('subtitle') }}</p>
      </div>
      <div class="actions">
        <button class="btn btn-animate" @click="toggleTheme">
          {{ isDark ? '☀️ ' + t('lightMode') : '🌙 ' + t('darkMode') }}
        </button>
        <button class="btn btn-animate" @click="toggleLanguage">
          🌐 {{ locale.toUpperCase() }}
        </button>
      </div>
    </header>

    <section class="card status-card">
      <span class="status-indicator" :class="{ ok: healthStatus === 'Healthy' }"></span>
      <div>
        <strong>{{ t('backendStatus') }}:</strong>
        <span class="status-text">{{ healthStatus }}</span>
      </div>
      <button class="btn btn-sm btn-animate" @click="loadData">↻ Refresh</button>
    </section>

    <section class="card content-card">
      <h2>{{ t('items') }}</h2>
      <div class="add-box">
        <input v-model="newName" placeholder="Item name..." class="input" />
        <input v-model.number="newPrice" type="number" placeholder="Price" class="input input-num" />
        <button class="btn btn-primary btn-animate" @click="handleCreate">{{ t('addItem') }}</button>
      </div>

      <div v-if="loading" class="loading">{{ t('loading') }}</div>
      <ul v-else class="item-list">
        <li v-for="item in products" :key="item.id" class="item">
          <span>{{ item.name }}</span>
          <span class="price">${{ item.price.toFixed(2) }}</span>
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped lang="scss">
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.subtitle {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-top: 0.25rem;
}

.actions {
  display: flex;
  gap: 0.75rem;
}

.card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--card-shadow);
}

.status-card {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ef4444;
  &.ok {
    background-color: #22c55e;
  }
}

.status-text {
  margin-left: 0.5rem;
  color: var(--accent-color);
  font-weight: 600;
}

.add-box {
  display: flex;
  gap: 0.75rem;
  margin: 1rem 0;
}

.input {
  flex: 1;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.input-num {
  max-width: 120px;
}

.btn {
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-surface);
  color: var(--text-primary);
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background-color: var(--accent-color);
  color: #ffffff;
  border: none;
}

.btn-sm {
  margin-left: auto;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}

.item-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.price {
  font-weight: 600;
  color: var(--accent-color);
}
</style>
