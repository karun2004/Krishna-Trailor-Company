import { describe, expect, it } from 'vitest'
import { fieldErrors, industrialEnquirySchema, travelEnquirySchema } from '../enquiry'

const industrial = {
  name: 'Asha Patel',
  company: 'Patel Heavy Works',
  phone: '+91 98765 43210',
  email: 'asha@example.com',
  cargoType: 'Transformer',
  weight: '45 tonnes',
  dimensions: '6m x 3m x 3.5m',
  pickup: 'Vadodara',
  destination: 'Mumbai',
  requiredDate: '2026-12-01',
  message: 'Need escort.',
}
const travel = {
  name: 'Ravi', phone: '9876543210', requirement: 'Sleeper bus', passengerCount: '32',
  route: 'Surat to Goa', travelDate: '2026-12-20', message: 'Hi',
}

describe('industrialEnquirySchema', () => {
  it('accepts a full valid enquiry', () => {
    expect(industrialEnquirySchema.safeParse(industrial).success).toBe(true)
  })
  it('accepts only required fields and turns empty optionals into undefined', () => {
    const r = industrialEnquirySchema.safeParse({
      name: 'A', phone: '9876543210', cargoType: 'Steel', pickup: 'X', destination: 'Y',
      company: '', email: '', requiredDate: '', message: '  ',
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.email).toBeUndefined()
      expect(r.data.message).toBeUndefined()
      expect(r.data.division).toBe('heavy_haulage')
    }
  })
  it.each(['name', 'phone', 'cargoType', 'pickup', 'destination'])('requires %s', (f) => {
    const r = industrialEnquirySchema.safeParse({ ...industrial, [f]: '' })
    expect(r.success).toBe(false)
    if (!r.success) expect(fieldErrors(r.error)).toHaveProperty(f)
  })
  it('rejects bad email, phone and date', () => {
    const r = industrialEnquirySchema.safeParse({ ...industrial, email: 'nope', phone: 'abc', requiredDate: '12/01/2026' })
    expect(r.success).toBe(false)
    if (!r.success) expect(Object.keys(fieldErrors(r.error)).sort()).toEqual(['email', 'phone', 'requiredDate'])
  })
  it.each([
    ['name', 201], ['company', 201], ['phone', 51], ['message', 5001], ['email', 321],
  ])('enforces the DB length limit for %s (%i chars is too long)', (f, n) => {
    const value = f === 'email' ? `${'a'.repeat(n - 12)}@example.com` : f === 'phone' ? '9'.repeat(n) : 'x'.repeat(n)
    expect(industrialEnquirySchema.safeParse({ ...industrial, [f]: value }).success).toBe(false)
  })
  it('accepts values exactly at the DB limit', () => {
    expect(
      industrialEnquirySchema.safeParse({ ...industrial, name: 'x'.repeat(200), message: 'x'.repeat(5000) }).success,
    ).toBe(true)
  })
  it('validates attachment metadata', () => {
    const ok = { type: 'application/pdf', size: 1000 }
    expect(industrialEnquirySchema.safeParse({ ...industrial, attachment: ok }).success).toBe(true)
    for (const bad of [
      { type: 'image/gif', size: 10 },
      { type: 'application/pdf', size: 10 * 1024 * 1024 + 1 },
      { type: 'application/pdf', size: 0 },
    ]) {
      expect(industrialEnquirySchema.safeParse({ ...industrial, attachment: bad }).success).toBe(false)
    }
  })
  it('passes the honeypot through for the route to act on', () => {
    const r = industrialEnquirySchema.safeParse({ ...industrial, website: 'http://spam' })
    expect(r.success && r.data.website).toBe('http://spam')
  })
  it('rejects a non-heavy-haulage division', () => {
    expect(industrialEnquirySchema.safeParse({ ...industrial, division: 'radhe_travels' }).success).toBe(false)
  })
})

describe('travelEnquirySchema', () => {
  it('accepts a valid enquiry and coerces passengerCount', () => {
    const r = travelEnquirySchema.safeParse(travel)
    expect(r.success && r.data.passengerCount).toBe(32)
  })
  it('accepts a numeric passengerCount and a missing one', () => {
    expect(travelEnquirySchema.safeParse({ ...travel, passengerCount: 5 }).success).toBe(true)
    const { passengerCount: _p, ...rest } = travel
    void _p
    expect(travelEnquirySchema.safeParse(rest).success).toBe(true)
  })
  it.each(['0', '501', '2.5', 'many', -3])('rejects passengerCount %j', (p) => {
    expect(travelEnquirySchema.safeParse({ ...travel, passengerCount: p }).success).toBe(false)
  })
  it.each(['name', 'phone', 'requirement'])('requires %s', (f) => {
    const r = travelEnquirySchema.safeParse({ ...travel, [f]: undefined })
    expect(r.success).toBe(false)
    if (!r.success) expect(fieldErrors(r.error)).toHaveProperty(f)
  })
  it('rejects an invalid travel date', () => {
    expect(travelEnquirySchema.safeParse({ ...travel, travelDate: 'soon' }).success).toBe(false)
  })
})
