<script setup lang="ts">
const health = ref('Checking...');

onMounted(async () => {
  try {
    const res = await $fetch<{ status: string }>('/api/health');
    health.value = res?.status || 'Healthy';
  } catch {
    health.value = 'Offline / Connecting...';
  }
});
</script>

<template>
  <div style="max-width: 800px; margin: 40px auto; font-family: sans-serif; padding: 0 20px">
    <h1>Nuxt 3 Fullstack Starter</h1>
    <p style="color: #666">Universal Nuxt 3 with Backend Integration & AI Skills</p>
    <div style="margin-top: 24px; padding: 20px; border: 1px solid #ddd; border-radius: 8px">
      <strong>Backend Status: </strong>
      <span style="color: #059669; font-weight: bold">{{ health }}</span>
    </div>
  </div>
</template>
