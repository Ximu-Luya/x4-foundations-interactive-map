import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { defineConfig } from 'vitest/config'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(projectRoot, 'index.html'),
        freeShips: path.resolve(projectRoot, 'free-ships/index.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
    css: true,
    coverage: {
      reporter: ['text', 'html'],
    },
  },
})
