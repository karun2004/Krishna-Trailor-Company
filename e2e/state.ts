import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export type E2EState = {
  url: string
  serviceKey: string
  admin: { id: string; email: string; password: string }
  nonAdmin: { id: string; email: string; password: string }
}

export const STATE_FILE = join(process.cwd(), 'test-results', '.e2e-state.json')

export function readState(): E2EState {
  return JSON.parse(readFileSync(STATE_FILE, 'utf8'))
}
