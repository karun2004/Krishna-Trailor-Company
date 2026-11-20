/**
 * DOCUMENTS CURRENT BEHAVIOUR (see docs/TODO.md): migration 0003 hides verification_note from anon only.
 * A signed-in NON-admin can read it on published rows, so public signups MUST stay disabled
 * (local config.toml enable_signup = false; hosted: Auth -> Providers -> Email -> disable sign-ups).
 * If this test starts failing because the note is hidden, the gap was fixed: update this test and docs/TODO.md.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTestUser, serviceClient, type TestUser } from '../../../tests/support/db'

const svc = serviceClient()
let user: TestUser
let rowId = ''

beforeAll(async () => {
  user = await createTestUser({ admin: false })
  const { data, error } = await svc
    .from('faqs')
    .insert({ question: 'note-exposure?', answer: 'x', published: true, verification_note: 'internal note' })
    .select('id')
    .single()
  expect(error).toBeNull()
  rowId = data!.id as string
})
afterAll(async () => {
  if (rowId) await svc.from('faqs').delete().eq('id', rowId)
  await user?.remove()
})

describe('verification_note exposure to non-admin authenticated users (known gap)', () => {
  it('a non-admin signed-in user can currently read verification_note on a published row', async () => {
    const { data, error } = await user.client.from('faqs').select('verification_note').eq('id', rowId).single()
    expect(error).toBeNull()
    expect(data?.verification_note).toBe('internal note')
  })
})
