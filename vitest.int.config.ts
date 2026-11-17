import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

// Integration tests: need the local Supabase stack (`pnpm exec supabase start`).
// Run with `pnpm test:int`. Excluded from the default `pnpm test`.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.int.test.ts', 'tests/**/*.int.test.ts'],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
})
