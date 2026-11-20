# Admin guide

For the Krishna Trailor Company team who look after the website.

## 1. What you can do here

The admin area lets you change what the public website shows: divisions, services, fleet, projects, photos, gallery, timeline, testimonials, FAQs, client logos, offices, homepage text, contact details, search-engine settings, and customer enquiries.

Nothing you do is public until you mark it **Published**.

## 2. Logging in

1. Go to `/admin/login` on the website address.
2. Enter your email and password, then select sign in.
3. Use the sign-out button in the sidebar when you finish, especially on a shared computer.

If you cannot sign in, the account may not be an admin account yet. Ask the person who set up the website to add you. If you forgot your password, ask them to reset it; the site has no self-service reset for admins.

## 3. Creating the first admin (set-up only)

This is done once by whoever sets up the website, from a computer with the project and its settings:

1. Make sure `.env.local` holds `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for the live database. Never share or commit these values.
2. Run `pnpm create-admin`.
3. Enter the admin email, then a password of at least 12 characters, twice. Passwords are not shown as you type.

The script creates the login and marks it as an admin. There is no default password. Repeat it for each additional admin.

## 4. Dashboard

The home screen shows counts for images, projects, equipment, services and enquiries, plus the latest uploads and enquiries.

## 5. Media library (photos)

Open **Media** in the sidebar.

**Uploading**
- Accepted formats: JPEG, PNG, WebP, AVIF. Maximum 10 MB per file.
- Pick a **category** (for example Fleet, Cranes, Projects, Team, Clients) before uploading. It helps you find photos later.
- Files are checked by their contents, not just their names. A file renamed to look like a photo is rejected.
- If a photo is larger than 10 MB, reduce its size first (most phones can do this in the share or export options).

**Alt text (required for every photo you use)**
- Describe what is in the photo in one short sentence: "Low-bed trailer carrying an excavator on the highway."
- Screen readers read it out, and it appears if the photo fails to load.
- Leave it empty only for purely decorative images.

**Caption** is optional. It is for your own reference and is not shown on the site unless a page uses it.

**Replacing a photo** keeps the same entry, so pages that use it update automatically.

**Deleting a photo** removes it everywhere it is used; those spots go blank on the site. The usage panel lists every place a photo is used. Check it before you delete.

**Order**: use the up and down buttons to change the order in the library.

## 6. Editing content

Every content screen follows the same pattern: a list, then **New** or select an entry, then **Save**.

| Screen | What it controls |
|---|---|
| Divisions | The three business divisions: name, tagline, summary, description, hero photo, button text and link |
| Services | Services listed under each division |
| Fleet | Equipment and vehicles: name, description, specifications, capacity, availability, division, photo |
| Projects | Past jobs: title, location, date, description, division, featured photo. Each project can hold more photos tagged **before**, **during** or **after** |
| Gallery | Photo albums with a cover and a list of photos |
| Timeline | Milestones with year, title and description |
| Testimonials | Client quotes (see section 8) |
| FAQs | Questions and answers, optionally tied to a division |
| Clients | Client logos with the client name and website |
| Offices | Head office and any other office: address, phone, email, map link |
| Homepage | Text blocks on the home page (see section 9) |
| Settings | Contact details and social links (see section 10) |
| SEO | Page titles, descriptions and share images for search results (see section 11) |

Reorder items with the up and down buttons. The order you set is the order on the site.

## 7. Publish versus draft

- **Published** on: the item shows on the public website.
- **Published** off: the item is saved but hidden. Use this for anything still being checked.
- Changes to a published item go live as soon as you save.
- A section with no published items is hidden completely, so you will not see an empty heading on the site.

## 8. Verification notes and testimonials

**Verification note** appears on most screens. It is for the team only and is never shown on the website. Use it to record what still needs checking, for example "Confirm service name with the owner" or "Address needs checking". Clear the note when the item is confirmed.

**Testimonials stay unpublished until approved.** A testimonial shows on the website only when both boxes are ticked:
1. **Approved**: the client has agreed to the exact wording in writing.
2. **Published**: you are ready to show it.

Do not put invented or paraphrased quotes into the system. Use the client's own words and keep their written approval on file.

## 9. Homepage blocks

The **Homepage** screen lists the text blocks for the home page, for example the main headline and the call-to-action button.

- Select a block to edit it. The content field holds text in a simple structure with keys in quotes, such as `{"headline": "ANY LOAD. ANY ROAD."}`.
- Change only the text inside the quotation marks. Keep the keys (the words before the colons) and the braces, commas and quotation marks.
- If you save and see an error that says "Enter valid JSON", a quotation mark or comma is missing or extra. Compare it with the line above.
- You can add an image and a verification note, and use the Published switch as above.
- Blocks are edited, not created, from this screen.

## 10. Contact details (Settings)

The **Settings** screen holds the details the public site uses in the footer and on the contact page:

- Office phone and any additional phones. Write one per line as `Name: number`, for example `Kuldeep Singh: 98154 13468`.
- Email, WhatsApp number (include the country code, for example `+91 98765 43210`), and the head-office address.
- Map link: a full `https://` link to the head office on a map.
- Social media links.

Check every number after you save: the same details appear in the footer and contact panel.

## 11. Search-engine details (SEO)

Each page has an entry with:
- **Path**: the page address, for example `/contact`.
- **Title**: shown in search results and browser tabs, up to 120 characters.
- **Meta description**: up to 300 characters, about 155 is ideal.
- **Social share image**: the photo shown when the page is shared on social media.
- **Canonical URL**: leave blank unless told otherwise.

Only published entries are used.

## 12. Enquiries

Enquiries come from the **Contact** and quote forms on the website. Each one lists the division, the customer's name and contact details, and the details they gave.

**Statuses**, in order:
1. **New**: just received.
2. **Contacted**: someone has called or written back.
3. **In progress**: work is being quoted or arranged.
4. **Completed**: the job or enquiry is closed.
5. **Archived**: filed away. You can restore an archived enquiry later.

Change the status with the status control. You can skip steps going forward, and move one step back. Use **internal notes** for what was agreed. Customers never see notes.

**Attachments** (drawings, photos, PDFs) open from the enquiry page through a secure link. The link works for 60 seconds, so press the button again if it expires.

**Deleting** an enquiry removes it and its attachment permanently. Do this only when the enquiry is spam or a duplicate.

Enquiries are limited to 5 submissions per 10 minutes from one internet address. If a customer is told to wait, they can phone the office.

## 13. Troubleshooting

| Problem | What to check |
|---|---|
| Sign-in keeps failing | Check the email and password. The account must be an admin. Ask for it to be re-created if needed. |
| Upload fails | Only JPEG, PNG, WebP or AVIF photos up to 10 MB. Renamed or damaged files are refused. |
| Photo missing on the site | The entry must be published, and the photo must be selected in its image field. Deleted photos leave a blank space. |
| Changes not visible | Reload the public page. Check the item is published. |
| Homepage block error | See the JSON hint in section 9. |
| Customer says the form did not send | Ask them to try again in a few minutes. If it keeps failing, contact the person who manages the website. |
