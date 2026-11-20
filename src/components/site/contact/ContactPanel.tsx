import { Card, MonoLabel } from '@/components/site'
import type { ContactPanelData } from './contact-data'
import { telHref } from './contact-data'

const link = 'underline underline-offset-4 hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2'

export function ContactPanel({ data }: { data: ContactPanelData }) {
  const { offices, phones, email, whatsappUrl } = data
  const nothing = !offices.length && !phones.length && !email && !whatsappUrl
  if (nothing) return null
  return (
    <aside aria-label="Contact details" className="flex flex-col gap-4">
      {offices.map((o) => (
        <Card key={o.name} variant="soft">
          <MonoLabel>{o.isHead ? 'Head office' : 'Office'}</MonoLabel>
          <h3 className="mt-3 font-display text-xl uppercase">{o.name}</h3>
          {o.address && <p className="mt-2">{o.address}</p>}
          {o.phone && <p className="mt-2"><a className={link} href={telHref(o.phone)}>{o.phone}</a></p>}
          {o.email && <p className="mt-1 break-all"><a className={link} href={`mailto:${o.email}`}>{o.email}</a></p>}
          {o.mapUrl && (
            <p className="mt-3">
              <a className={link} href={o.mapUrl} target="_blank" rel="noopener noreferrer">View on map<span className="sr-only"> ({o.name}, opens in new tab)</span></a>
            </p>
          )}
        </Card>
      ))}
      {(phones.length > 0 || email || whatsappUrl) && (
        <Card variant="dark">
          <MonoLabel>Call or message</MonoLabel>
          <ul className="mt-3 flex flex-col gap-2">
            {phones.map((p) => (
              <li key={p.number}>
                {p.name ? `${p.name}: ` : ''}
                <a className={link} href={telHref(p.number)}>{p.number}</a>
              </li>
            ))}
            {email && <li className="break-all"><a className={link} href={`mailto:${email}`}>{email}</a></li>}
            {whatsappUrl && (
              <li><a className={link} href={whatsappUrl} target="_blank" rel="noopener noreferrer">Chat on WhatsApp<span className="sr-only"> (opens in new tab)</span></a></li>
            )}
          </ul>
        </Card>
      )}
    </aside>
  )
}
