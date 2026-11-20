-- Seed data. Verified facts are published; anything unverified is published = false
-- with verification_note set. No client_logos (upload via admin). Idempotent.

insert into public.business_divisions (slug, name, tagline, summary, cta_label, cta_href, published, sort_order, verification_note) values
  ('krishna-trailor', 'Krishna Trailor Company', 'Heavy haulage and trailer transport', 'Heavy haulage and trailer transport from Chandigarh.', 'Get a Quote', '/contact', true, 1, 'Copy is generic; confirm wording with the company.'),
  ('heavy-machinery', 'KTC Heavy Machinery', 'Cranes, forklifts and excavators', 'Heavy machinery and equipment services.', 'Get a Quote', '/contact', true, 2, 'Copy is generic; confirm wording with the company.'),
  ('radhe-travels', 'Radhe Travels', 'Passenger bus travel', 'Passenger bus services.', 'Enquire', '/contact', true, 3, 'Routes, fares, schedules and fleet details are unverified and intentionally omitted.')
on conflict (slug) do nothing;

insert into public.services (slug, name, category, division_id, published, sort_order, verification_note)
select v.slug, v.name, v.category, d.id, true, v.ord, 'Name derived from verified fleet categories; confirm exact service names against the live site.'
from (values
  ('heavy-haulage-transport', 'Heavy Haulage Transport', 'haulage', 'krishna-trailor', 1),
  ('low-bed-trailer-services', 'Low Bed Trailer Services', 'haulage', 'krishna-trailor', 2),
  ('semi-bed-trailer-services', 'Semi Bed Trailer Services', 'haulage', 'krishna-trailor', 3),
  ('hydraulic-axle-transport', 'Hydraulic Axle Transport', 'haulage', 'krishna-trailor', 4),
  ('crane-services', 'Crane Services', 'machinery', 'heavy-machinery', 5),
  ('forklift-services', 'Forklift Services', 'machinery', 'heavy-machinery', 6),
  ('excavator-services', 'Excavator Services', 'machinery', 'heavy-machinery', 7),
  ('bus-travel-services', 'Bus Travel Services', 'passenger', 'radhe-travels', 8)
) as v(slug, name, category, div, ord)
join public.business_divisions d on d.slug = v.div
on conflict (slug) do nothing;

insert into public.fleet_items (slug, name, category, published, sort_order, verification_note) values
  ('tractor-pullers', 'Tractor Pullers', 'tractor_pullers', true, 1, 'Category verified from live site; specs and counts not seeded.'),
  ('low-bed-trailers', 'Low Bed Trailers', 'low_bed_trailers', true, 2, 'Category verified from live site; specs and counts not seeded.'),
  ('semi-bed-trailers', 'Semi Bed Trailers', 'semi_bed_trailers', true, 3, 'Category verified from live site; specs and counts not seeded.'),
  ('hydraulic-axle-systems', 'Hydraulic Axle Systems', 'hydraulic_axle_systems', true, 4, 'Category verified from live site; specs and counts not seeded.'),
  ('forklifts', 'Forklifts', 'forklifts', true, 5, 'Category verified from live site; specs and counts not seeded.'),
  ('excavators', 'Excavators', 'excavators', true, 6, 'Category verified from live site; specs and counts not seeded.'),
  ('cranes', 'Cranes', 'cranes', false, 7, 'Not in verified fleet list; confirm before publishing.'),
  ('sleeper-buses', 'Sleeper Buses', 'sleeper_buses', false, 8, 'Radhe fleet specifics unverified.'),
  ('seater-buses', 'Seater Buses', 'seater_buses', false, 9, 'Radhe fleet specifics unverified.')
on conflict (slug) do nothing;

insert into public.office_locations (name, address, phone, email, is_head_office, published, sort_order, verification_note) values
  ('Chandigarh Head Office', 'Shop No. 644, New Motor Market, Manimajra, Chandigarh – 160101', '0172-4640644', 'Ktc087@gmail.com', true, true, 1, null),
  ('Bhopal Office', null, null, null, false, true, 2, 'Parallel office verified; address and contact details not yet provided.')
on conflict do nothing;

insert into public.timeline_milestones (year, title, description, published, sort_order, verification_note)
select * from (values
  ('1987', 'Founded', 'Krishna Trailor Company was founded in 1987 under Mr. Kuldeep Singh.', true, 1, null),
  ('Expansion', 'Expansion', null, false, 2, 'Expansion milestones and dates unverified; confirm with the company.'),
  ('Fleet', 'Fleet growth', null, false, 3, 'Fleet growth milestones and dates unverified; confirm with the company.'),
  ('Today', 'Today', 'Head office in Chandigarh with a parallel office in Bhopal.', true, 4, null)
) as v(year, title, description, published, sort_order, verification_note)
where not exists (select 1 from public.timeline_milestones);

insert into public.faqs (question, answer, published, sort_order, verification_note)
select * from (values
  ('How can I request a quote?', 'Call 0172-4640644, 9815413468 or 7373000018, or email Ktc087@gmail.com.', true, 1, null),
  ('Where is your head office?', 'Shop No. 644, New Motor Market, Manimajra, Chandigarh – 160101. We also have a parallel office in Bhopal.', true, 2, null),
  ('What load capacity can you handle?', 'Capacity range to be confirmed by the company.', false, 3, 'The 1 MT to 250 MT claim is unverified.')
) as v(question, answer, published, sort_order, verification_note)
where not exists (select 1 from public.faqs);

insert into public.testimonials (author_name, quote, approved, published, sort_order, verification_note)
select 'Placeholder client', 'Testimonial text pending approval.', false, false, 1, 'Placeholder; real testimonials must be supplied and approved by the client.'
where not exists (select 1 from public.testimonials);

insert into public.page_content (page_key, block_key, content, published, sort_order, verification_note) values
  ('home', 'hero', '{"headline":"ANY LOAD. ANY ROAD.","cta_label":"Get a Quote","cta_href":"/contact"}', true, 1, null),
  ('home', 'haulage_showcase', '{"headline":"WE MOVE WHAT OTHERS CAN''T."}', true, 2, null),
  ('home', 'stat_experience', '{"label":"38+ years"}', false, 3, 'The 38+ years figure is unverified.'),
  ('home', 'stat_capacity', '{"label":"1 MT to 250 MT"}', false, 4, 'The 1 MT to 250 MT capacity claim is unverified.')
on conflict (page_key, block_key) do nothing;

insert into public.seo_metadata (page_key, slug, title, meta_description, published, sort_order) values
  ('home', '/', 'Krishna Trailor Company | Any Load. Any Road.', 'Heavy haulage and trailer transport from Chandigarh. Founded 1987.', true, 1),
  ('contact', '/contact', 'Contact | Krishna Trailor Company', 'Reach Krishna Trailor Company at Manimajra, Chandigarh.', true, 2)
on conflict (page_key) do nothing;

insert into public.site_settings (key, value) values
  ('company', '{"name":"Krishna Trailor Company","founded":"1987","founder":"Mr. Kuldeep Singh"}'),
  ('contact', '{"address":"Shop No. 644, New Motor Market, Manimajra, Chandigarh – 160101","office_phone":"0172-4640644","phones":[{"name":"Kuldeep Singh","number":"9815413468"},{"name":"Devilal","number":"7373000018"}],"email":"Ktc087@gmail.com","parallel_office":"Bhopal"}')
on conflict (key) do nothing;
