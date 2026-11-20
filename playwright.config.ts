import { existsSync, writeFileSync } from 'node:fs'
import { defineConfig } from '@playwright/test'
import { localEnv } from './tests/support/db'

const PORT = 3100
const { url, anonKey, serviceKey } = localEnv()

// Ensure a local .env.local exists (gitignored) so `pnpm dev` / create-admin work too.
if (!existsSync('.env.local')) {
  writeFileSync(
    '.env.local',
    `NEXT_PUBLIC_SUPABASE_URL=${url}\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}\nSUPABASE_SERVICE_ROLE_KEY=${serviceKey}\n`,
    { mode: 0o600 },
  )
}

export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.spec.ts',
  globalSetup: './e2e/global-setup.ts',
  workers: 1,
  reporter: 'list',
  use: { baseURL: `http://127.0.0.1:${PORT}` },
  webServer: {
    command: `pnpm exec next dev --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}/admin/login`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: url,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
      SUPABASE_SERVICE_ROLE_KEY: serviceKey,
    },
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
})
