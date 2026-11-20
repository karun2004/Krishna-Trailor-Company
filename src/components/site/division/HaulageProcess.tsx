const STEPS = [
  'Enquiry & route survey',
  'Permits & approvals',
  'Equipment selection',
  'Loading & securing',
  'Escorted transit',
  'Delivery & unloading',
  'Post-delivery sign-off',
]

/** Generic industry process outline. Not a statement of specific procedures, timings or certifications. */
export function HaulageProcess() {
  return (
    <div>
      <svg viewBox="0 0 700 24" preserveAspectRatio="none" aria-hidden className="mb-6 hidden h-6 w-full lg:block">
        <line x1="50" y1="12" x2="650" y2="12" stroke="currentColor" strokeOpacity="0.35" strokeDasharray="4 6" />
        {STEPS.map((_, i) => (<circle key={i} cx={50 + i * 100} cy="12" r="6" fill="#f28c28" />))}
      </svg>
      <ol className="grid gap-px bg-white/15 sm:grid-cols-2 lg:grid-cols-7">
        {STEPS.map((s, i) => (
          <li key={s} className="bg-[#0a0a0a] p-5">
            <p className="font-mono text-xs tracking-[0.18em] text-[var(--accent)]">STEP {String(i + 1).padStart(2, '0')}</p>
            <p className="mt-3 font-display text-base font-bold uppercase leading-tight">{s}</p>
          </li>
        ))}
      </ol>
      <p className="mt-4 font-mono text-xs uppercase tracking-[0.14em] text-white/50">Process outline. General industry sequence for illustration.</p>
    </div>
  )
}
