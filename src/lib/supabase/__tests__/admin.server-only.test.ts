import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(here, '../..', '..') // src/lib/supabase/__tests__ -> src
const adminPath = resolve(srcDir, 'lib/supabase/admin.ts')
const KEY = 'SUPABASE_SERVICE_ROLE_KEY'

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  )
}

function stripLeadingTrivia(code: string): string {
  let s = code
  for (;;) {
    const next = s
      .replace(/^\s+/, '')
      .replace(/^\/\/[^\n]*(\n|$)/, '')
      .replace(/^\/\*[\s\S]*?\*\//, '')
    if (next === s) return s
    s = next
  }
}

describe('server-only guarantees', () => {
  it("admin.ts's first statement is import 'server-only'", () => {
    const body = stripLeadingTrivia(readFileSync(adminPath, 'utf8'))
    expect(body).toMatch(/^import\s+(['"])server-only\1\s*;?/)
  })

  it(`no file under src/ other than admin.ts and test files mentions ${KEY}`, () => {
    const offenders = walk(srcDir)
      .filter((f) => /\.(ts|tsx|js|jsx|mjs|cjs|json|css|md)$/.test(f))
      .filter((f) => f !== adminPath && !/\.test\.[tj]sx?$/.test(f))
      .filter((f) => readFileSync(f, 'utf8').includes(KEY))
    expect(offenders).toEqual([])
  })
})
