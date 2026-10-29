import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [vue(),tailwindcss()],
  test: { include: ['src/**/*.spec.ts'] },
});