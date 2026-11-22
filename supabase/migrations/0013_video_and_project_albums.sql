-- 0013: video uploads in the media bucket, and the two Projects sub-sections.
-- Admin uploads MP4/WebM in Media (50MB max) and attaches them to the "Project videos" album;
-- photos go in the "Project images" album. The public Projects page renders each album as its own section.
update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm']
where id = 'media';

insert into public.gallery_albums (title, slug, description, published, sort_order)
values
  ('Project videos', 'project-videos', 'Short clips from loads and jobs we have moved.', true, 10),
  ('Project images', 'project-images', 'Photos from loads and jobs we have moved.', true, 20)
on conflict (slug) do nothing;
