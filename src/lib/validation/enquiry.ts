import { z } from 'zod'

// Lengths mirror the enquiries CHECK constraints in 0002_content.sql
// (name 200, phone 50, email 320, company 200, message 5000).
export const ENQUIRY_ATTACHMENT_MIME = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'application/pdf': 'pdf',
} as const
export type EnquiryAttachmentMime = keyof typeof ENQUIRY_ATTACHMENT_MIME
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024

const emptyToUndefined = (v: string) => (v === '' ? undefined : v)

/** Trimmed optional text; empty string counts as "not provided". */
const opt = (max: number) =>
  z.string().trim().max(max, `Must be at most ${max} characters`).transform(emptyToUndefined).optional()

const req = (label: string, max: number) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `Must be at most ${max} characters`)

const phone = z
  .string({ error: 'Phone is required' })
  .trim()
  .min(1, 'Phone is required')
  .max(50, 'Must be at most 50 characters')
  .regex(/^\+?[0-9][0-9\s().-]{5,}$/, 'Enter a valid phone number')

const email = z
  .string()
  .trim()
  .max(320, 'Must be at most 320 characters')
  .transform(emptyToUndefined)
  .pipe(z.email('Enter a valid email address').optional())
  .optional()

const isoDate = z
  .string()
  .trim()
  .transform(emptyToUndefined)
  .pipe(
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD')
      .refine((v) => !Number.isNaN(Date.parse(v)), 'Enter a valid date')
      .optional(),
  )
  .optional()

/** Metadata of the (already-read) attachment; bytes are verified separately in the route. */
export const attachmentMetaSchema = z.object({
  type: z.enum(Object.keys(ENQUIRY_ATTACHMENT_MIME) as [EnquiryAttachmentMime, ...EnquiryAttachmentMime[]], {
    error: 'Attachment must be a JPEG, PNG, WebP, AVIF or PDF file',
  }),
  size: z
    .number()
    .int()
    .min(1, 'The attachment is empty')
    .max(MAX_ATTACHMENT_BYTES, 'The attachment is too large (10MB limit)'),
})

// Honeypot: real users never see or fill it. Not rejected by the schema; the route
// silently drops submissions where it is non-empty.
const honeypot = z.string().max(500).optional()

export const industrialEnquirySchema = z.object({
  name: req('Name', 200),
  company: opt(200),
  phone,
  email,
  cargoType: req('Cargo type', 200),
  weight: opt(100),
  dimensions: opt(200),
  pickup: req('Pickup location', 300),
  destination: req('Destination', 300),
  requiredDate: isoDate,
  message: opt(5000),
  attachment: attachmentMetaSchema.optional(),
  division: z.enum(['krishna_trailor', 'heavy_haulage']).default('heavy_haulage'),
  website: honeypot,
})

export const travelEnquirySchema = z.object({
  name: req('Name', 200),
  phone,
  requirement: req('Requirement', 200),
  passengerCount: z
    .union([z.number(), z.string().trim().transform((v) => (v === '' ? undefined : Number(v)))])
    .pipe(
      z
        .number('Passenger count must be a number')
        .int('Passenger count must be a whole number')
        .min(1, 'At least 1 passenger')
        .max(500, 'At most 500 passengers')
        .optional(),
    )
    .optional(),
  route: opt(300),
  travelDate: isoDate,
  message: opt(5000),
  website: honeypot,
})

export type IndustrialEnquiry = z.infer<typeof industrialEnquirySchema>
export type TravelEnquiry = z.infer<typeof travelEnquirySchema>

/** Field-level messages: first issue per dotted path. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_'
    if (!(key in out)) out[key] = issue.message
  }
  return out
}
