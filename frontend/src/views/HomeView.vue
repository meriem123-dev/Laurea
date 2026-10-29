<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { apiGet } from '../api/client';

type State = 'loading' | 'up' | 'down';
const api = ref<State>('loading');
const db = ref<State>('loading');

onMounted(async () => {
  try {
    await apiGet('/health');
    api.value = 'up';
  } catch {
    api.value = 'down';
    db.value = 'down';
    return;
  }
  try {
    await apiGet('/health/ready');
    db.value = 'up';
  } catch {
    db.value = 'down';
  }
});
</script>

<template>
  <h1 class="text-3xl font-bold">Gestion des soutenances</h1>
  <p class="mt-2 text-gray-600">
    Master et ingénieur : jurys, planning, mémoires, notes et procès-verbaux.
  </p>

  <section class="mt-6 rounded-lg border border-gray-200 p-4">
    <h2 class="text-xl font-semibold">État du système</h2>
    <ul class="mt-2 space-y-1">
      <li>API : <span :class="api === 'up' ? 'text-green-600' : 'text-red-600'">{{ api }}</span></li>
      <li>Base de données : <span :class="db === 'up' ? 'text-green-600' : 'text-red-600'">{{ db }}</span></li>
    </ul>
  </section>
</template>