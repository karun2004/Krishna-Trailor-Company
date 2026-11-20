import { describe, expect, it } from 'vitest'
import { canTransition, isEnquiryStatus, sanitizeSearch } from '../enquiries'

describe('enquiry helpers', () => {
  it('validates statuses', () => {
    expect(isEnquiryStatus('new')).toBe(true)
    expect(isEnquiryStatus('bogus')).toBe(false)
    expect(isEnquiryStatus(undefined)).toBe(false)
  })
  it('allows forward and one-step-back transitions', () => {
    expect(canTransition('new', 'contacted')).toBe(true)
    expect(canTransition('contacted', 'completed')).toBe(true)
    expect(canTransition('completed', 'in_progress')).toBe(true)
    expect(canTransition('completed', 'new')).toBe(false)
    expect(canTransition('new', 'new')).toBe(false)
    expect(canTransition('archived', 'new')).toBe(true)
  })
  it('sanitizes filter-significant chars', () => {
    expect(sanitizeSearch('a,b)%_c')).toBe('a b c')
  })
})
