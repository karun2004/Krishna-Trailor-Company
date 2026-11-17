import { describe, expect, it } from 'vitest'
import { createTestUser, serviceClient } from './db'

async function testUserEmails(): Promise<string[]> {
  const { data, error } = await serviceClient().auth.admin.listUsers({ perPage: 1000 })
  if (error) throw new Error(error.message)
  return data.users.map((u) => u.email ?? '').filter((e) => e.endsWith('@example.test'))
}

describe('createTestUser cleanup', () => {
  it('deletes the auth user when a step after createUser fails', async () => {
    const before = await testUserEmails()
    // An invalid role violates profiles.role check, so the profile insert fails.
    await expect(createTestUser({ admin: true, profileRole: 'superuser' })).rejects.toThrow(
      /profile insert failed/,
    )
    expect(await testUserEmails()).toEqual(before)
  })

  it('remove() is idempotent and a successful user is cleaned up', async () => {
    const before = await testUserEmails()
    const u = await createTestUser({ admin: true })
    expect(await testUserEmails()).toHaveLength(before.length + 1)
    await u.remove()
    await u.remove() // already gone: must not throw
    expect(await testUserEmails()).toEqual(before)
  })
})
