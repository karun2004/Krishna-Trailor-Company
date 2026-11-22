/**
 * Registry of every named image container on the public site.
 * Admin (Page images) writes a `page_content` row per slot (page_key + block_key, media_id).
 * The public site reads that row and, when it is empty, falls back to `/images/<file>` in /public/images
 * (only if the file exists). See IMAGE_PROMPTS.md for the prompt behind each file.
 * Client- and server-safe: no node imports here.
 */
export type MediaSlot = {
  /** Unique id: `<page>/<name>`. */
  id: string
  page: string
  /** page_content.block_key */
  block: string
  pageLabel: string
  label: string
  /** CSS aspect-ratio the container crops to. */
  aspect: string
  /** Fallback file inside /public/images. */
  file: string
  alt: string
}

const hero = (page: string, pageLabel: string, file: string, alt: string): MediaSlot => ({
  id: `${page}/hero`, page, block: 'hero', pageLabel, label: 'Header image', aspect: '16/9', file, alt,
})

const extra = (page: string, block: string, pageLabel: string, label: string, aspect: string, file: string, alt: string): MediaSlot => ({
  id: `${page}/${block}`, page, block, pageLabel, label, aspect, file, alt,
})

export const MEDIA_SLOTS: MediaSlot[] = [
  { ...hero('home', 'Home', 'home-hero.jpg', 'KTC prime mover and low-bed trailer carrying an excavator on a highway'), label: 'Hero image' },
  {
    id: 'home/haulage_showcase', page: 'home', block: 'haulage_showcase', pageLabel: 'Home', label: 'Haulage showcase image',
    aspect: '16/9', file: 'home-haulage-showcase.jpg', alt: 'KTC hydraulic trailer carrying an oversized industrial vessel at dusk',
  },
  hero('about', 'About', 'about-hero.jpg', 'Row of KTC trailers and prime movers in the Chandigarh yard'),
  ...[1, 2, 3, 4].map((n): MediaSlot => ({
    id: `about/story_${n}`, page: 'about', block: `media_story_${n}`, pageLabel: 'About', label: `Our Story tile ${n}`,
    aspect: '4/3', file: `about-story-${n}.jpg`, alt: 'Krishna Trailor Company at work',
  })),
  hero('contact', 'Contact', 'contact-hero.jpg', 'KTC office and trailers at the Manimajra motor market'),
  hero('fleet', 'Fleet', 'fleet-hero.jpg', 'KTC fleet of trailers, excavator, crane and forklift'),
  hero('heavy-haulage', 'Heavy Haulage', 'heavy-haulage-hero.jpg', 'KTC hydraulic trailer carrying a power transformer'),
  hero('krishna-trailor', 'Krishna Trailor', 'krishna-trailor-hero.jpg', 'Line of KTC low-bed trailers at sunrise'),
  hero('radhe-travels', 'Radhe Travels', 'radhe-travels-hero.jpg', 'Radhe Travels coach on a hill highway'),
  hero('projects', 'Projects', 'projects-hero.jpg', 'KTC trailer carrying a wind turbine blade'),
  // Added sections. Each renders only when a photo exists (admin choice or /public/images file), so no empty boxes.
  extra('home', 'process', 'Home', 'How we move it image', '4/3', 'home-process.jpg', 'KTC crew lashing a load onto a low-bed trailer'),
  extra('home', 'industry_1', 'Home', 'Industry tile 1 (Power)', '4/3', 'home-industry-power.jpg', 'KTC trailer carrying a power transformer'),
  extra('home', 'industry_2', 'Home', 'Industry tile 2 (Wind and renewables)', '4/3', 'home-industry-wind.jpg', 'KTC trailer carrying a wind turbine tower section'),
  extra('home', 'industry_3', 'Home', 'Industry tile 3 (Construction)', '4/3', 'home-industry-construction.jpg', 'KTC trailer carrying a road roller to a construction site'),
  extra('home', 'industry_4', 'Home', 'Industry tile 4 (Mining and quarry)', '4/3', 'home-industry-mining.jpg', 'KTC trailer carrying a mining excavator'),
  extra('about', 'yard', 'About', 'Yard and workshop image', '16/9', 'about-yard.jpg', 'KTC workshop and yard with trailers being serviced'),
  extra('fleet', 'maintenance', 'Fleet', 'Maintenance image', '16/9', 'fleet-maintenance.jpg', 'KTC mechanic inspecting a hydraulic axle'),
  extra('krishna-trailor', 'feature', 'Krishna Trailor', 'Feature image', '4/3', 'krishna-trailor-feature.jpg', 'KTC driver and prime mover at a highway toll plaza'),
  extra('heavy-haulage', 'feature', 'Heavy Haulage', 'Feature image', '4/3', 'heavy-haulage-feature.jpg', 'KTC multi-axle hydraulic trailer on a night move'),
  extra('radhe-travels', 'route_jammu', 'Radhe Travels', 'Route image: Chandigarh to Jammu', '16/10', 'radhe-route-jammu.jpg', 'Radhe Travels coach on the highway towards Jammu'),
  extra('radhe-travels', 'route_dehradun', 'Radhe Travels', 'Route image: Chandigarh to Dehradun', '16/10', 'radhe-route-dehradun.jpg', 'Radhe Travels coach on the foothill road towards Dehradun'),
]

export const SLOT_BY_ID = new Map(MEDIA_SLOTS.map((s) => [s.id, s]))
export const slotFor = (page: string, block: string) => MEDIA_SLOTS.find((s) => s.page === page && s.block === block)

/** Fallback files for rows that own their own media field in admin (fleet item, service, division). */
export const FLEET_FALLBACK: Record<string, string> = {
  tractor_pullers: 'fleet-tractor-pullers.jpg',
  low_bed_trailers: 'fleet-low-bed-trailers.jpg',
  semi_bed_trailers: 'fleet-semi-bed-trailers.jpg',
  hydraulic_axle_systems: 'fleet-hydraulic-axle-systems.jpg',
  forklifts: 'fleet-forklifts.jpg',
  excavators: 'fleet-excavators.jpg',
  cranes: 'fleet-cranes.jpg',
  sleeper_buses: 'fleet-sleeper-buses.jpg',
  seater_buses: 'fleet-seater-buses.jpg',
}
export const SERVICE_FALLBACK: Record<string, string> = {
  'heavy-haulage-transport': 'service-heavy-haulage-transport.jpg',
  'low-bed-trailer-services': 'service-low-bed-trailer.jpg',
  'semi-bed-trailer-services': 'service-semi-bed-trailer.jpg',
  'hydraulic-axle-transport': 'service-hydraulic-axle-transport.jpg',
  'crane-services': 'service-crane.jpg',
  'forklift-services': 'service-forklift.jpg',
  'excavator-services': 'service-excavator.jpg',
  'bus-travel-services': 'service-bus-travel.jpg',
}
export const DIVISION_FALLBACK: Record<string, string> = {
  'krishna-trailor': 'home-division-krishna-trailor.jpg',
  'heavy-machinery': 'home-division-heavy-machinery.jpg',
  'radhe-travels': 'home-division-radhe-travels.jpg',
}
