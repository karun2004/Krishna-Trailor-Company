# Website content status

Every content row created by `supabase/seed.sql`, its publish state, and why. The seed only publishes what the team has verified. Anything else is a draft (`published = false`) and stays invisible to the public site until someone confirms it in the admin area.

Status key:
- **VERIFIED**: published, facts confirmed by the company.
- **PUBLISHED, CONFIRM**: published, but wording or naming is inferred and needs a check against the live site.
- **PUBLISHED, INCOMPLETE**: published, but key details are missing.
- **DRAFT**: `published = false`, hidden from the public site until verified.

## Divisions (`business_divisions`)

| Slug | Name | Status | Notes |
|---|---|---|---|
| `krishna-trailor` | Krishna Trailor Company | PUBLISHED, CONFIRM | Heavy haulage and trailer transport from Chandigarh. Summary, tagline and button wording are generic. |
| `heavy-machinery` | KTC Heavy Machinery | PUBLISHED, CONFIRM | Division name is inferred from the fleet categories. Summary is generic. Confirm the name. |
| `radhe-travels` | Radhe Travels | PUBLISHED, CONFIRM | Passenger bus services. Routes, fares, schedules and fleet details are unverified and deliberately not seeded. |

## Services (`services`)

All eight are published, but each **name is derived from the verified fleet categories**, not taken from the live site. Confirm exact names before launch.

| Service | Division | Status |
|---|---|---|
| Heavy Haulage Transport | Krishna Trailor | PUBLISHED, CONFIRM |
| Low Bed Trailer Services | Krishna Trailor | PUBLISHED, CONFIRM |
| Semi Bed Trailer Services | Krishna Trailor | PUBLISHED, CONFIRM |
| Hydraulic Axle Transport | Krishna Trailor | PUBLISHED, CONFIRM |
| Crane Services | Heavy Machinery | PUBLISHED, CONFIRM |
| Forklift Services | Heavy Machinery | PUBLISHED, CONFIRM |
| Excavator Services | Heavy Machinery | PUBLISHED, CONFIRM |
| Bus Travel Services | Radhe Travels | PUBLISHED, CONFIRM |

## Fleet (`fleet_items`)

| Item | Category | Status | Reason |
|---|---|---|---|
| Tractor Pullers | `tractor_pullers` | VERIFIED | Category confirmed on the live site. Specs and counts not seeded. |
| Low Bed Trailers | `low_bed_trailers` | VERIFIED | As above |
| Semi Bed Trailers | `semi_bed_trailers` | VERIFIED | As above |
| Hydraulic Axle Systems | `hydraulic_axle_systems` | VERIFIED | As above |
| Forklifts | `forklifts` | VERIFIED | As above |
| Excavators | `excavators` | VERIFIED | As above |
| Cranes | `cranes` | DRAFT | Not in the verified fleet list. |
| Sleeper Buses | `sleeper_buses` | DRAFT | Radhe fleet specifics unverified. |
| Seater Buses | `seater_buses` | DRAFT | Radhe fleet specifics unverified. |

## Offices (`office_locations`)

| Office | Status | Notes |
|---|---|---|
| Chandigarh Head Office | VERIFIED | Shop No. 644, New Motor Market, Manimajra, Chandigarh 160101. Phone 0172-4640644, email Ktc087@gmail.com. Head office. |
| Bhopal Office | PUBLISHED, INCOMPLETE | Parallel office confirmed, but address, phone and email are **missing**. It shows on the site with no details. Either add details or unpublish. |

## Timeline (`timeline_milestones`)

| Year field | Title | Status | Notes |
|---|---|---|---|
| 1987 | Founded | VERIFIED | Founded in 1987 under Mr. Kuldeep Singh. |
| `Expansion` | Expansion | DRAFT | Dates and details unverified. The year field is text, so the placeholder word sits there until a real year is known. |
| `Fleet` | Fleet growth | DRAFT | Dates and details unverified. Same placeholder issue as above. |
| `Today` | Today | VERIFIED | Head office in Chandigarh with a parallel office in Bhopal. The year field shows "Today" on the site. Replace it with a label you want to display. |

## Testimonials (`testimonials`)

| Row | Status | Notes |
|---|---|---|
| Placeholder client | DRAFT, not approved | Placeholder text only. Replace with real quotes the client has approved in writing. |

No real testimonials have been supplied or approved.

## FAQs (`faqs`)

| Question | Status | Notes |
|---|---|---|
| How can I request a quote? | VERIFIED | Uses the verified phone numbers and email. |
| Where is your head office? | VERIFIED | Uses the verified address. Mentions the Bhopal office. |
| What load capacity can you handle? | DRAFT | The "1 MT to 250 MT" claim is unverified. The answer is a placeholder. |

## Client logos (`client_logos`)

None seeded. Logos cannot be created by SQL because the image files must go into storage through the admin media library. The project ledger expects about nine logos to be uploaded by hand, and their names are unverified.

## Homepage blocks (`page_content`, page `home`)

| Block | Status | Content |
|---|---|---|
| `hero` | VERIFIED | "ANY LOAD. ANY ROAD." Button "Get a Quote" to `/contact`. |
| `haulage_showcase` | VERIFIED | "WE MOVE WHAT OTHERS CAN'T." |
| `stat_experience` | DRAFT | "38+ years": the figure is unverified. |
| `stat_capacity` | DRAFT | "1 MT to 250 MT": the capacity claim is unverified. |

The homepage headline copy comes from the design brief, not from the live site. Confirm it.

## Search metadata (`seo_metadata`)

| Page | Status | Notes |
|---|---|---|
| `/` (home) | PUBLISHED, CONFIRM | Title "Krishna Trailor Company \| Any Load. Any Road." Description mentions heavy haulage from Chandigarh and the 1987 founding. |
| `/contact` | PUBLISHED, CONFIRM | Mentions the Manimajra address. |

Other pages use the fallback titles and descriptions in code (`buildMetadata` callers).

## Company settings (`site_settings`)

| Key | Status | Notes |
|---|---|---|
| `company` | VERIFIED | Name, founding year 1987, founder Mr. Kuldeep Singh. |
| `contact` | VERIFIED | Head-office address, office phone 0172-4640644, two named mobile numbers, email Ktc087@gmail.com. Parallel office recorded as "Bhopal" with no details. |

`site_settings` has no draft flag, so these values appear on the public site as soon as the database is seeded. Confirm them before launch.

## Not seeded

- Projects and project photos
- Gallery albums and gallery photos
- Media library entries (no images)
- Client logos
- Routes, fares, schedules and fleet details for Radhe Travels
- Hero vehicle cut-out for the scrubbed homepage hero (the hero works without it, but shows no vehicle)
