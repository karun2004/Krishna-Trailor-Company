export const ENQUIRY_STATUSES = ['new', 'contacted', 'in_progress', 'completed', 'archived'] as const
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number]

export const STATUS_LABEL: Record<EnquiryStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  in_progress: 'In progress',
  completed: 'Completed',
  archived: 'Archived',
}

export const isEnquiryStatus = (v: unknown): v is EnquiryStatus =>
  typeof v === 'string' && (ENQUIRY_STATUSES as readonly string[]).includes(v)

/** Flow new -> contacted -> in_progress -> completed -> archived. Forward moves may skip; backward moves go one step; archived may be restored. */
export function canTransition(from: EnquiryStatus, to: EnquiryStatus): boolean {
  if (from === to) return false
  const a = ENQUIRY_STATUSES.indexOf(from)
  const b = ENQUIRY_STATUSES.indexOf(to)
  if (b > a) return true
  if (from === 'archived') return true
  return a - b === 1
}

/** Strip characters that are significant in PostgREST filter syntax or LIKE patterns. */
export function sanitizeSearch(q: string): string {
  return q.replace(/[,()%_\\*"'.:]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100)
}

export const PAGE_SIZE = 20
