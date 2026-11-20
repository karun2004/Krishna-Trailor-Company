import { SiteFooter, SiteNav } from '@/components/site'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-black focus:px-5 focus:py-3 focus:font-mono focus:text-xs focus:uppercase focus:tracking-widest focus:text-white focus:outline-2 focus:outline-offset-2 focus:outline-[#F28C28]"
      >
        Skip to content
      </a>
      <SiteNav />
      <main id="main" tabIndex={-1} className="outline-none">{children}</main>
      <SiteFooter />
    </>
  )
}
