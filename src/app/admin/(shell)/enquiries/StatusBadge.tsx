import { STATUS_LABEL, isEnquiryStatus } from '@/lib/admin/enquiries'

const tone: Record<string, string> = {
  new: 'bg-orange text-black',
  contacted: 'bg-blue text-navy',
  in_progress: 'bg-navy text-white',
  completed: 'bg-green-100 text-green-900',
  archived: 'bg-black/10 text-black/80',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone[status] ?? ''}`}>
      {isEnquiryStatus(status) ? STATUS_LABEL[status] : status}
    </span>
  )
}
