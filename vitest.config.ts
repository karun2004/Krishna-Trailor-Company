import { configDefaults, defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // `server-only` throws outside a React Server environment; stub it for tests only.
      'server-only': fileURLToPath(new URL('./src/test/server-only-stub.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    // Dummy public values so modules that import `env` load under test.
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    },
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    // Integration tests need a live local Supabase; run them with `pnpm test:int`.
    exclude: [...configDefaults.exclude, '**/*.int.test.ts'],
  },
})
