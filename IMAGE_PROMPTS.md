# KTC Website: Image Prompts for Gemini

Every image the website needs, with a ready-to-paste Gemini prompt, the exact file name and the format.

## 1. How to use

1. Open Gemini (Imagen / image generation). Paste ONE prompt block at a time.
2. In the settings choose the **aspect ratio** shown for that image. If Gemini cannot set it, add the ratio to the prompt text.
3. Generate 3 to 4 options. Pick the one where **"KTC" is spelled correctly**. If the lettering is wrong, regenerate; do not fix it in the prompt by adding more text.
4. Save the result with the **exact file name** shown. Keep the name lowercase, with hyphens.
5. Put every file in `public/images/` (flat folder, no subfolders). The site reads files from there by name.
6. Optional: use the Admin panel (Media, then Page images) to replace any picture later without touching code.

## 2. File format rules

| Item | Rule |
|---|---|
| Format | JPG (quality 85). WebP is also accepted if you rename the extension and tell me. |
| Max size | Under 10 MB each (the admin upload limit). Aim for under 1.5 MB for hero images. |
| Colour | sRGB |
| Hero images | 16:9, 2400x1350 px |
| Card images | 4:3, 1600x1200 px |
| Division panel images | 3:4, 1200x1600 px |
| Names | lowercase, hyphens, no spaces. Example: `home-hero.jpg` |

## 3. Honesty note

AI images are fine for backgrounds and mood. Do **not** present the "project sample" images as real jobs. Replace them with real photos through Admin, Projects, when you have them. The people in the images are generic; do not caption them as real staff.

## 4. Brand rules used in every prompt

- Colours: black `#101010`, orange `#F28C28`, white. Radhe Travels uses blue and white, no orange.
- Every truck, prime mover, trailer and machine carries **KTC** in bold orange capitals with a thin white outline. Buses carry **RADHE TRAVELS**, not KTC.
- No manufacturer logos, no readable number plates, no extra text.

## 5. Reusable blocks (already included in each prompt below)

**Style block:** Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation.

**KTC branding block:** Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos.

**Negative block:** Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.

---


## Home

### 1. `home-hero.jpg`

- **Where it shows:** Home page, full-width hero background (slot: home / hero)
- **Aspect ratio:** 16:9  |  **Size:** 2400x1350  |  **Format:** JPG
- **Save to:** `public/images/home-hero.jpg`

```text
Composition: wide cinematic framing. Keep the left 40% of the frame relatively clear (sky, road, soft background) so website headline text can sit on top. An Indian heavy-duty prime mover with a low-bed trailer carrying a yellow excavator, driving toward the camera at a slight three-quarter angle on a wide highway in Punjab/Haryana at golden hour, warm low sun, long soft shadows, light dust haze, green fields at the roadside. Vehicle on the right side of the frame. Cab and trailer painted black and white with orange accents. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 2. `home-division-krishna-trailor.jpg`

- **Where it shows:** Home page, division panel: Krishna Trailor (slot: home / division_krishna_trailor)
- **Aspect ratio:** 3:4  |  **Size:** 1200x1600  |  **Format:** JPG
- **Save to:** `public/images/home-division-krishna-trailor.jpg`

```text
A black and orange semi-bed trailer with a heavy-duty prime mover parked at an angle in a clean transport yard at sunrise, low-angle front three-quarter view, clean dramatic sky. Portrait framing, vehicle fills the lower two thirds. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 3. `home-division-heavy-machinery.jpg`

- **Where it shows:** Home page, division panel: Heavy Machinery (slot: home / division_heavy_machinery)
- **Aspect ratio:** 3:4  |  **Size:** 1200x1600  |  **Format:** JPG
- **Save to:** `public/images/home-division-heavy-machinery.jpg`

```text
A large yellow hydraulic mobile crane with its boom raised at about 60 degrees at an industrial construction site, steel structure being built in the background, late afternoon light. Portrait framing, crane body and boom fully visible. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 4. `home-division-radhe-travels.jpg`

- **Where it shows:** Home page, division panel: Radhe Travels (slot: home / division_radhe_travels)
- **Aspect ratio:** 3:4  |  **Size:** 1200x1600  |  **Format:** JPG
- **Save to:** `public/images/home-division-radhe-travels.jpg`

```text
A modern white luxury sleeper coach bus on a scenic Indian highway with hills in the background, soft morning light, clean and premium look, light blue and white colour scheme with no orange. The bus carries the words "RADHE TRAVELS" in clean blue capital letters on its side. Portrait framing. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. No orange. Clean light colour scheme. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 5. `home-haulage-showcase.jpg`

- **Where it shows:** Home page, heavy haulage showcase band (slot: home / haulage_showcase)
- **Aspect ratio:** 16:9  |  **Size:** 2400x1350  |  **Format:** JPG
- **Save to:** `public/images/home-haulage-showcase.jpg`

```text
Composition: wide cinematic framing. Keep the left 40% of the frame relatively clear (sky, road, soft background) so website headline text can sit on top. An oversized industrial cargo (a large steel pressure vessel wrapped in protective sheeting) on a multi-axle hydraulic trailer pulled by a heavy-duty prime mover, with a pilot escort vehicle ahead, on an Indian highway at dusk, warm sky with deep blue shadows, vehicle lights on. Vehicle on the right. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 6. `og-default.jpg`

- **Where it shows:** Search and social share image (slot: SEO default)
- **Aspect ratio:** 16:9  |  **Size:** 1200x630 (crop from 1920x1080)  |  **Format:** JPG
- **Save to:** `public/images/og-default.jpg`

```text
Centered composition: a black heavy-duty prime mover with a low-bed trailer in front view on a highway at golden hour, symmetrical, strong and trustworthy mood, enough empty space at the top and bottom. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```


## About

### 7. `about-hero.jpg`

- **Where it shows:** About page header (slot: about / hero)
- **Aspect ratio:** 16:9  |  **Size:** 2400x1350  |  **Format:** JPG
- **Save to:** `public/images/about-hero.jpg`

```text
Composition: wide cinematic framing. Keep the left 40% of the frame relatively clear (sky, road, soft background) so website headline text can sit on top. A row of black and orange trailers and prime movers parked neatly in a large transport yard in Chandigarh early in the morning, mist in the air, mountains faintly visible far behind, camera at eye level looking along the line of vehicles. Vehicles on the right. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 8. `about-story-1.jpg`

- **Where it shows:** About page, Our Story gallery tile 1 (slot: about / story_1)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/about-story-1.jpg`

```text
A mechanic in a navy work uniform and safety shoes inspecting a hydraulic axle assembly under a trailer in a tidy workshop, face turned away or partly shadowed, tools in hand, realistic workshop lighting. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 9. `about-story-2.jpg`

- **Where it shows:** About page, Our Story gallery tile 2 (slot: about / story_2)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/about-story-2.jpg`

```text
An excavator being driven up the ramps of a low-bed trailer, loading operation at an Indian site, a ground guide with hi-vis vest and helmet signalling, midday sun, dust on the ground. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 10. `about-story-3.jpg`

- **Where it shows:** About page, Our Story gallery tile 3 (slot: about / story_3)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/about-story-3.jpg`

```text
Detail shot: the front of a heavy-duty prime mover cab with the orange KTC lettering on the door, bonnet and mirrors in focus, shallow depth of field, warm evening light on weathered black paint. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 11. `about-story-4.jpg`

- **Where it shows:** About page, Our Story gallery tile 4 (slot: about / story_4)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/about-story-4.jpg`

```text
A dispatcher in a small transport office with a desk, paper files, a wall map of India with route lines, a computer and a phone, large window showing trailers parked outside, face not clearly visible, calm professional mood. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. No orange. Clean light colour scheme. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```


## Contact

### 12. `contact-hero.jpg`

- **Where it shows:** Contact page header (slot: contact / hero)
- **Aspect ratio:** 16:9  |  **Size:** 2400x1350  |  **Format:** JPG
- **Save to:** `public/images/contact-hero.jpg`

```text
Composition: wide cinematic framing. Keep the left 40% of the frame relatively clear (sky, road, soft background) so website headline text can sit on top. The front of a trailer-transport business in a busy Indian motor market: a two-storey shopfront with a black and orange signboard reading "KTC", a heavy-duty prime mover and trailer parked in front, early evening light, shopfront on the right. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```


## Fleet

### 13. `fleet-hero.jpg`

- **Where it shows:** Fleet page header (slot: fleet / hero)
- **Aspect ratio:** 16:9  |  **Size:** 2400x1350  |  **Format:** JPG
- **Save to:** `public/images/fleet-hero.jpg`

```text
Composition: wide cinematic framing. Keep the left 40% of the frame relatively clear (sky, road, soft background) so website headline text can sit on top. A staggered line-up of the KTC fleet on a paved yard at golden hour, front three-quarter view: a prime mover with a low-bed trailer, an excavator, a mobile crane and a forklift. Vehicles arranged on the right two thirds, sky and clear ground on the left. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 14. `fleet-tractor-pullers.jpg`

- **Where it shows:** Fleet page card: Tractor Pullers (fleet item: tractor_pullers)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/fleet-tractor-pullers.jpg`

```text
A black heavy-duty 6x4 prime mover (tractor puller) without trailer, front three-quarter view, on a clean concrete yard, soft overcast light. Neutral uncluttered background so the machine is the clear subject. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 15. `fleet-low-bed-trailers.jpg`

- **Where it shows:** Fleet page card: Low Bed Trailers (fleet item: low_bed_trailers)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/fleet-low-bed-trailers.jpg`

```text
A black multi-axle low-bed trailer with a prime mover carrying a bulldozer, side three-quarter view on a highway, clear daylight. Neutral uncluttered background so the machine is the clear subject. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 16. `fleet-semi-bed-trailers.jpg`

- **Where it shows:** Fleet page card: Semi Bed Trailers (fleet item: semi_bed_trailers)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/fleet-semi-bed-trailers.jpg`

```text
A black semi-bed trailer hitched to a prime mover carrying a wheel loader, side view in a yard, clear daylight, ramps visible at the rear. Neutral uncluttered background so the machine is the clear subject. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 17. `fleet-hydraulic-axle-systems.jpg`

- **Where it shows:** Fleet page card: Hydraulic Axle Systems (fleet item: hydraulic_axle_systems)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/fleet-hydraulic-axle-systems.jpg`

```text
A modular hydraulic multi-axle trailer platform with many wheel rows carrying a huge steel machine part, low-angle view showing axles and hydraulic lines, industrial site. Neutral uncluttered background so the machine is the clear subject. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 18. `fleet-forklifts.jpg`

- **Where it shows:** Fleet page card: Forklifts (fleet item: forklifts)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/fleet-forklifts.jpg`

```text
A large orange and black diesel forklift lifting a wooden crate in a warehouse yard, side three-quarter view, bright daylight. Neutral uncluttered background so the machine is the clear subject. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 19. `fleet-excavators.jpg`

- **Where it shows:** Fleet page card: Excavators (fleet item: excavators)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/fleet-excavators.jpg`

```text
A yellow and black hydraulic excavator with bucket raised digging soil at a construction site, side three-quarter view, soft dust, clear daylight. Neutral uncluttered background so the machine is the clear subject. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 20. `fleet-cranes.jpg`

- **Where it shows:** Fleet page card: Cranes (fleet item: cranes, draft)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/fleet-cranes.jpg`

```text
A yellow hydraulic mobile crane with outriggers extended and boom raised, standing on a prepared site, clear daylight. Neutral uncluttered background so the machine is the clear subject. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 21. `fleet-sleeper-buses.jpg`

- **Where it shows:** Fleet page card: Sleeper Buses (fleet item: sleeper_buses, draft)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/fleet-sleeper-buses.jpg`

```text
A white and blue modern sleeper coach bus, front three-quarter view, parked on a clean road in daylight, no orange. The bus carries the words "RADHE TRAVELS" in blue capital letters on its side. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. No orange. Clean light colour scheme. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 22. `fleet-seater-buses.jpg`

- **Where it shows:** Fleet page card: Seater Buses (fleet item: seater_buses, draft)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/fleet-seater-buses.jpg`

```text
A white and blue modern seater luxury coach bus, side three-quarter view on a highway, clear daylight, no orange. The bus carries the words "RADHE TRAVELS" in blue capital letters on its side. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. No orange. Clean light colour scheme. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```


## Heavy Haulage

### 23. `heavy-haulage-hero.jpg`

- **Where it shows:** Heavy Haulage page header (slot: heavy-haulage / hero)
- **Aspect ratio:** 16:9  |  **Size:** 2400x1350  |  **Format:** JPG
- **Save to:** `public/images/heavy-haulage-hero.jpg`

```text
Composition: wide cinematic framing. Keep the left 40% of the frame relatively clear (sky, road, soft background) so website headline text can sit on top. A multi-axle hydraulic trailer carrying an enormous power transformer on an Indian highway at dusk, heavy-duty prime movers pulling and pushing, a pilot escort vehicle with amber lights ahead, dramatic sky. Load and vehicles on the right. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 24. `service-heavy-haulage-transport.jpg`

- **Where it shows:** Service card: Heavy Haulage Transport (slot: services / main image)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/service-heavy-haulage-transport.jpg`

```text
A heavy-duty prime mover pulling a low-bed trailer with a large crawler excavator across a highway bridge, afternoon light. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 25. `service-low-bed-trailer.jpg`

- **Where it shows:** Service card: Low Bed Trailer Services (slot: services / main image)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/service-low-bed-trailer.jpg`

```text
A low-bed trailer being loaded with a bulldozer by its own power on rear ramps, a spotter in a hi-vis vest and helmet guiding, site yard, daylight. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 26. `service-semi-bed-trailer.jpg`

- **Where it shows:** Service card: Semi Bed Trailer Services (slot: services / main image)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/service-semi-bed-trailer.jpg`

```text
A semi-bed trailer carrying steel structures strapped down with chains and straps, highway, early morning light. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 27. `service-hydraulic-axle-transport.jpg`

- **Where it shows:** Service card: Hydraulic Axle Transport (slot: services / main image)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/service-hydraulic-axle-transport.jpg`

```text
A modular hydraulic axle trailer carrying a huge industrial vessel, side view in an industrial estate, clear light. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 28. `service-crane.jpg`

- **Where it shows:** Service card: Crane Services (slot: services / main image)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/service-crane.jpg`

```text
A yellow mobile crane lifting a steel beam at a building site, workers in hard hats and hi-vis vests below at a distance, clear afternoon sky. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 29. `service-forklift.jpg`

- **Where it shows:** Service card: Forklift Services (slot: services / main image)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/service-forklift.jpg`

```text
A heavy forklift moving a palletised machine part in an industrial yard, bright daylight. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 30. `service-excavator.jpg`

- **Where it shows:** Service card: Excavator Services (slot: services / main image)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/service-excavator.jpg`

```text
An excavator digging a trench at a road project site, dust in the air, warm light. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 31. `service-bus-travel.jpg`

- **Where it shows:** Service card: Bus Travel Services (Radhe Travels)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/service-bus-travel.jpg`

```text
A white and blue luxury coach bus at a clean bus terminal in the morning, passengers boarding in the distance, no orange. The bus carries the words "RADHE TRAVELS" in blue capital letters. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. No orange. Clean light colour scheme. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```


## Krishna Trailor

### 32. `krishna-trailor-hero.jpg`

- **Where it shows:** Krishna Trailor division page header (slot: krishna-trailor / hero)
- **Aspect ratio:** 16:9  |  **Size:** 2400x1350  |  **Format:** JPG
- **Save to:** `public/images/krishna-trailor-hero.jpg`

```text
Composition: wide cinematic framing. Keep the left 40% of the frame relatively clear (sky, road, soft background) so website headline text can sit on top. A fleet of black and orange KTC low-bed trailers with prime movers lined up at the edge of a highway at sunrise, camera low, strong perspective lines, warm light, a clear sky on the left. Vehicles on the right. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```


## Radhe Travels

### 33. `radhe-travels-hero.jpg`

- **Where it shows:** Radhe Travels page header (slot: radhe-travels / hero)
- **Aspect ratio:** 16:9  |  **Size:** 2400x1350  |  **Format:** JPG
- **Save to:** `public/images/radhe-travels-hero.jpg`

```text
Composition: wide cinematic framing. Keep the left 40% of the frame relatively clear (sky, road, soft background) so website headline text can sit on top. A white and blue premium sleeper coach bus driving on a smooth highway through green hills in Himachal at soft morning light, camera at three-quarter front angle, bus on the right. The bus carries the words "RADHE TRAVELS" in blue capital letters. Light, fresh, calm mood, no orange. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. No orange. Clean light colour scheme. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```


## Projects

### 34. `projects-hero.jpg`

- **Where it shows:** Projects page header (slot: projects / hero)
- **Aspect ratio:** 16:9  |  **Size:** 2400x1350  |  **Format:** JPG
- **Save to:** `public/images/projects-hero.jpg`

```text
Composition: wide cinematic framing. Keep the left 40% of the frame relatively clear (sky, road, soft background) so website headline text can sit on top. A huge wind turbine blade being transported on a long specialised extendable trailer pulled by a heavy-duty prime mover through the Indian countryside, escort vehicle behind, golden hour, wide landscape. Trailer and blade on the right. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 35. `project-sample-1.jpg`

- **Where it shows:** Placeholder project photo: Excavator relocation. Replace with real project photos when available.
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/project-sample-1.jpg`

```text
An excavator secured on a low-bed trailer being unloaded at a mining site in India, dust and rocks, daylight. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 36. `project-sample-2.jpg`

- **Where it shows:** Placeholder project photo: Transformer movement. Replace with real project photos when available.
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/project-sample-2.jpg`

```text
A power transformer on a multi-axle hydraulic trailer entering a substation gate, evening light. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 37. `project-sample-3.jpg`

- **Where it shows:** Placeholder project photo: Plant machinery shift. Replace with real project photos when available.
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/project-sample-3.jpg`

```text
A large press machine wrapped in sheet on a semi-bed trailer, parked at a factory gate, morning light. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```


## Checklist (37 images)

- [ ] `home-hero.jpg`
- [ ] `home-division-krishna-trailor.jpg`
- [ ] `home-division-heavy-machinery.jpg`
- [ ] `home-division-radhe-travels.jpg`
- [ ] `home-haulage-showcase.jpg`
- [ ] `og-default.jpg`
- [ ] `about-hero.jpg`
- [ ] `about-story-1.jpg`
- [ ] `about-story-2.jpg`
- [ ] `about-story-3.jpg`
- [ ] `about-story-4.jpg`
- [ ] `contact-hero.jpg`
- [ ] `fleet-hero.jpg`
- [ ] `fleet-tractor-pullers.jpg`
- [ ] `fleet-low-bed-trailers.jpg`
- [ ] `fleet-semi-bed-trailers.jpg`
- [ ] `fleet-hydraulic-axle-systems.jpg`
- [ ] `fleet-forklifts.jpg`
- [ ] `fleet-excavators.jpg`
- [ ] `fleet-cranes.jpg`
- [ ] `fleet-sleeper-buses.jpg`
- [ ] `fleet-seater-buses.jpg`
- [ ] `heavy-haulage-hero.jpg`
- [ ] `service-heavy-haulage-transport.jpg`
- [ ] `service-low-bed-trailer.jpg`
- [ ] `service-semi-bed-trailer.jpg`
- [ ] `service-hydraulic-axle-transport.jpg`
- [ ] `service-crane.jpg`
- [ ] `service-forklift.jpg`
- [ ] `service-excavator.jpg`
- [ ] `service-bus-travel.jpg`
- [ ] `krishna-trailor-hero.jpg`
- [ ] `radhe-travels-hero.jpg`
- [ ] `projects-hero.jpg`
- [ ] `project-sample-1.jpg`
- [ ] `project-sample-2.jpg`
- [ ] `project-sample-3.jpg`


---

## Added in the second round (new sections and Projects)

These fill the new containers. Each section on the site hides itself until its photo exists, so no empty boxes show. Duplicate use of one photo on a page has been removed: the old Heavy Machinery strip on Home is gone, and each tile now needs its own picture.

### 38. `home-process.jpg`

- **Where it shows:** Home, 'From enquiry to delivery' photo (home / process)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/home-process.jpg`

```text
A KTC crew of three workers in orange hi-vis vests and helmets lashing a yellow excavator onto a black low-bed trailer with chains and binders in a yard at morning, close three-quarter view, shallow depth of field. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 39. `home-industry-power.jpg`

- **Where it shows:** Home, 'Loads we move' tile 1: Power (home / industry_1)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/home-industry-power.jpg`

```text
A KTC multi-axle hydraulic trailer carrying a large grey power transformer along an Indian highway at dusk, escort vehicle blurred behind. Leave the lower third darker and quiet for text. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 40. `home-industry-wind.jpg`

- **Where it shows:** Home, tile 2: Wind and renewables (home / industry_2)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/home-industry-wind.jpg`

```text
A KTC extendable trailer carrying a white wind-turbine tower section through hilly country in Gujarat or Rajasthan, wind turbines on the horizon, late afternoon light. Lower third quiet for text. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 41. `home-industry-construction.jpg`

- **Where it shows:** Home, tile 3: Construction (home / industry_3)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/home-industry-construction.jpg`

```text
A KTC low-bed trailer delivering a yellow road roller to a highway construction site, cranes and half-built flyover behind, dust in the air. Lower third quiet for text. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 42. `home-industry-mining.jpg`

- **Where it shows:** Home, tile 4: Mining and quarry (home / industry_4)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/home-industry-mining.jpg`

```text
A KTC heavy low-bed trailer carrying a large yellow mining excavator past a quarry with pale rock faces, hazy midday sun. Lower third quiet for text. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 43. `about-yard.jpg`

- **Where it shows:** About, yard and workshop (about / yard)
- **Aspect ratio:** 16:9  |  **Size:** 2400x1350  |  **Format:** JPG
- **Save to:** `public/images/about-yard.jpg`

```text
Wide view of the KTC yard in Manimajra, Chandigarh: several black and white trailers parked in rows, a mechanic working on a trailer axle in an open workshop bay, tools and tyres neatly arranged, clear morning sky. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 44. `fleet-maintenance.jpg`

- **Where it shows:** Fleet, maintenance band (fleet / maintenance)
- **Aspect ratio:** 16:9  |  **Size:** 2400x1350  |  **Format:** JPG
- **Save to:** `public/images/fleet-maintenance.jpg`

```text
Close view of a mechanic in a dark work uniform inspecting the hydraulic axle and suspension of a multi-axle KTC trailer with a torch, workshop lighting, grease and metal detail. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 45. `krishna-trailor-feature.jpg`

- **Where it shows:** Krishna Trailor page, feature photo (krishna-trailor / feature)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/krishna-trailor-feature.jpg`

```text
A KTC prime mover and low-bed trailer waiting at a highway toll plaza lane in North India, driver visible as a generic figure in the cab window, bright morning light. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 46. `heavy-haulage-feature.jpg`

- **Where it shows:** Heavy Haulage page, feature photo (heavy-haulage / feature)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/heavy-haulage-feature.jpg`

```text
A KTC multi-axle hydraulic trailer on a night move, amber escort lights reflecting on wet tarmac, a large industrial vessel on the trailer, long-exposure feel with sharp vehicle. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 47. `radhe-route-jammu.jpg`

- **Where it shows:** Radhe Travels, route card: Chandigarh to Jammu (radhe-travels / route_jammu)
- **Aspect ratio:** 16:10  |  **Size:** 1600x1000  |  **Format:** JPG
- **Save to:** `public/images/radhe-route-jammu.jpg`

```text
A maroon and white luxury coach driving on a four-lane highway through Punjab plains toward distant mountains, clear sky, bus at slight three-quarter angle. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the bus carries the words "RADHE TRAVELS" in clean blue and white lettering on the side, spelled exactly, no other words, no orange anywhere. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 48. `radhe-route-dehradun.jpg`

- **Where it shows:** Radhe Travels, route card: Chandigarh to Dehradun (radhe-travels / route_dehradun)
- **Aspect ratio:** 16:10  |  **Size:** 1600x1000  |  **Format:** JPG
- **Save to:** `public/images/radhe-route-dehradun.jpg`

```text
A maroon and white luxury coach on a curving road at the Shivalik foothills with green forested hills behind, soft morning mist. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the bus carries the words "RADHE TRAVELS" in clean blue and white lettering on the side, spelled exactly, no other words, no orange anywhere. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 49. `project-video-poster-1.jpg`

- **Where it shows:** Optional poster/thumbnail for a project video
- **Aspect ratio:** 16:9  |  **Size:** 2400x1350  |  **Format:** JPG
- **Save to:** `public/images/project-video-poster-1.jpg`

```text
A KTC trailer carrying an oversized industrial boiler moving slowly through a town at dusk, crowd silhouettes behind a barrier. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 50. `project-image-1.jpg`

- **Where it shows:** Projects, photo gallery (add via Admin > Gallery > Project images)
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/project-image-1.jpg`

```text
A KTC low-bed trailer unloading a crane at a power-plant gate, workers guiding with hand signals. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 51. `project-image-2.jpg`

- **Where it shows:** Projects, photo gallery
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/project-image-2.jpg`

```text
A KTC trailer crossing a river bridge in the hills carrying a large steel girder, low sun. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 52. `project-image-3.jpg`

- **Where it shows:** Projects, photo gallery
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/project-image-3.jpg`

```text
A KTC prime mover pulling two tractors on a semi-bed trailer on a village road, harvested fields beside the road. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 53. `project-image-4.jpg`

- **Where it shows:** Projects, photo gallery
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/project-image-4.jpg`

```text
A KTC hydraulic trailer carrying a rail locomotive shell inside a rail yard, cloudy sky. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 54. `project-image-5.jpg`

- **Where it shows:** Projects, photo gallery
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/project-image-5.jpg`

```text
Aerial view of a KTC convoy of three heavy trailers on a highway curve, drone angle, golden hour. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 55. `project-image-6.jpg`

- **Where it shows:** Projects, photo gallery
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/project-image-6.jpg`

```text
A KTC trailer carrying a wind-turbine blade at a mountain bend with an escort vehicle ahead. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### 56. `project-image-7.jpg`

- **Where it shows:** Projects, photo gallery
- **Aspect ratio:** 4:3  |  **Size:** 1600x1200  |  **Format:** JPG
- **Save to:** `public/images/project-image-7.jpg`

```text
A KTC forklift loading steel pipes onto a semi-bed trailer in a stockyard. Photorealistic professional commercial photograph, shot on a full-frame DSLR with a 35mm or 50mm lens, natural lighting, true-to-life colours, sharp focus, realistic metal, paint, dust and tyre wear, authentic Indian highway and industrial setting, no illustration, no CGI look, no HDR oversaturation. Branding: the vehicle or machine carries the letters "KTC" in bold, clean, sans-serif capital letters, painted in orange (#F28C28) with a thin white outline, clearly legible, on the cab door or bonnet and on the side of the trailer or machine body. The text must read exactly K-T-C, three letters only, spelled correctly, no other words, no extra logos. Avoid: manufacturer logos or badges, readable licence plates, watermarks, extra text, distorted or misspelled letters, cartoon style, toy-like scale, deformed wheels, extra axles that do not connect, floating objects, identifiable real faces.
```

### Videos

Short clips (MP4 or WebM, up to 50MB) are not generated here. Film real jobs on a phone, then: Admin > Media > upload; Admin > Gallery > "Project videos" > add the clip.
