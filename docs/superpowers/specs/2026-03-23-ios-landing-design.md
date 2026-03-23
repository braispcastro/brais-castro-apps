# iOS Developer Landing Page — Design Spec

**Date:** 2026-03-23  
**Author:** Brais Castro  
**Status:** Approved

---

## 1. Overview

A static website serving as a developer landing page for Brais Castro's iOS apps. Primary purposes:

- Showcase all published iOS apps in a clean, minimal grid
- Provide linkable URLs for App Store Connect fields (Privacy Policy, Support URL)
- Host `app-ads.txt` for ad network compliance
- Provide a contact page (mailto-based)
- Bilingual support (English / Spanish)

The site is fully static, built with Astro and Tailwind CSS, deployed to GitHub Pages via GitHub Actions.

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Astro (static output) | Zero JS by default, excellent for static sites, native i18n routing |
| Styles | Tailwind CSS | Rapid development, consistent design, minimal output |
| Language | TypeScript | Type safety for app data models |
| Data source | iTunes Search API (build time) | No auth needed, free, returns all apps by developer ID |
| Hosting | GitHub Pages | Free, HTTPS, custom domain ready |
| CI/CD | GitHub Actions | Build on push + weekly cron for data freshness |

---

## 3. Pages and Routes

Each page exists in both `/en/` and `/es/` variants. The root `/` redirects to the appropriate language based on `navigator.language`, falling back to `/en/`. Since the output is fully static, the redirect is implemented via a small inline `<script>` block in `/pages/index.astro` — the only JavaScript on the entire site.

```
/                         → redirect to /en/ or /es/
/en/                      → Home (app grid + hero)
/es/                      → Home (app grid + hero)
/en/privacy/              → Privacy Policy
/es/privacy/              → Privacy Policy (Spanish)
/en/contact/              → Contact page
/es/contact/              → Contact page (Spanish)
/en/app/[slug]/           → Individual app page
/es/app/[slug]/           → Individual app page (Spanish)
/app-ads.txt              → Static file at root
```

**App Store Connect URLs** (per app):
- Privacy Policy URL: `https://braiscastro.github.io/brais-castro-apps/en/privacy/`
- Support URL: `https://braiscastro.github.io/brais-castro-apps/en/contact/`

---

## 4. Data Layer

### iTunes API Fetch

At build time, the following endpoint is called:

```
https://itunes.apple.com/lookup?id=1604438132&entity=software
```

Developer ID: `1604438132` (Brais Castro)

The first result (`wrapperType: "artist"`) is discarded. The remaining results are mapped to the internal `AppData` type.

### AppData Type

```typescript
interface AppData {
  id: number             // trackId
  name: string           // trackName
  slug: string           // kebab-case generated from trackName
  description: string    // description (English from API)
  icon: string           // artworkUrl512
  category: string       // primaryGenreName
  rating: number | null  // averageUserRating (null if no ratings; hide star row when null or 0)
  ratingCount: number    // userRatingCount (show "No ratings yet" when 0)
  price: string          // formattedPrice
  appStoreUrl: string    // trackViewUrl (stripped of ?uo=4)
  version: string        // version
  releaseDate: string    // releaseDate (ISO 8601)
  screenshots: string[]  // screenshotUrls (may be empty — section is hidden if empty)
  bundleId: string       // bundleId
}
```

### Build Failure Policy

If the iTunes API fetch fails (network error or empty result), the build **fails with a descriptive error**. An empty or partial deploy is worse than no deploy.

### Known Apps (as of 2026-03-23)

| Name | ID | Category | Rating | Reviews |
|------|----|----------|--------|---------|
| Mathle | 1608780316 | Games | 4.74 | 442 |
| Draftle | 6475204180 | Games | 4.44 | 100 |
| 7TV Stickers from Twitch | 6740347826 | Entertainment | 4.71 | 7 |
| Space Launch Calendar | 1604438130 | News | 4.80 | 65 |
| Pyxis - Travel Tracker | 6739588659 | Travel | — | 0 |
| Decibel Meter - Sound Level | 6741395557 | Utilities | — | 0 |

---

## 5. Internationalization (i18n)

### Routing

Astro dynamic routing with `[lang]` parameter. Supported values: `en`, `es`.

### Translation Files

```
src/i18n/
  en.json    # English strings
  es.json    # Spanish strings
  utils.ts   # t(key: string, lang: string) => string helper
```

### App Descriptions

App descriptions come from the iTunes API in English. They are displayed as-is in both language variants (same as what users see in the App Store). No translation needed for descriptions.

### Language Switcher

A simple `EN | ES` toggle in the header. Switches between `/en/...` and `/es/...` preserving the current path (e.g., `/en/privacy/` ↔ `/es/privacy/`).

---

## 6. Visual Design

### Style

- **Theme:** Minimalist / Apple-like
- **Color scheme:** Light background (`#ffffff` / `#f5f5f7`), near-black text (`#1d1d1f`)
- **Accent:** Single neutral accent (e.g., `#0071e3` Apple blue) for CTAs and links
- **Typography:** System font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", ...`)
- **Radius:** Generous border-radius on cards (`rounded-2xl`)
- **Shadows:** Subtle, light (`shadow-sm`, stronger on hover)

### Layout Components

**Responsive breakpoints (Tailwind):**
- Mobile: default (< `sm`, < 640px) — 1 column grid
- Tablet: `md` (≥ 768px) — 2 column grid
- Desktop: `lg` (≥ 1024px) — 3 column grid

**Header:**
- Left: "Brais Castro" wordmark
- Right: Language switcher (`EN | ES`) + navigation links (Apps, Privacy, Contact)
- Sticky, minimal, no background blur

**Hero (Home only):**
- Centered text block: name, "iOS Developer", short tagline
- No images, no background — pure typography

**App Grid:**
- 3 columns on desktop, 2 on tablet, 1 on mobile
- Each `AppCard` contains: icon (rounded, 80px), name, category, star rating + review count, "View" link

**App Card (individual page):**
- Large icon (120px) + name + category + metadata row (version, release date, price)
- Star rating
- Full description text
- Screenshots row (if available, horizontal scroll)
- "Download on the App Store" badge (official Apple badge SVG)
- Link to Privacy Policy

**Footer:**
- Privacy Policy link, Contact link
- "© {year} Brais Castro"

---

## 7. Privacy Policy

### Content (both EN and ES)

Sections:

1. **Introduction** — who provides the software and purpose of the policy
2. **Information Collection and Use** — what data may be collected and why
3. **Third-Party Services** — "some of our apps may use the following third-party services":
   - AdMob ([policy link](https://support.google.com/admob/answer/6128543))
   - Google Analytics for Firebase ([policy link](https://firebase.google.com/policies/analytics))
4. **App Tracking Transparency** — mention of Apple's ATT framework for apps using advertising
5. **Log Data** — error log data (IP, device info, timestamps) via third-party tools
6. **Cookies** — apps don't use cookies directly; third-party SDKs may
7. **Service Providers** — third parties may access data only to perform tasks on our behalf
8. **Security** — commercially reasonable protection; no 100% guarantee
9. **Links to Other Sites** — no responsibility for third-party sites
10. **Children's Privacy** — not directed at under-13; contact to request deletion
11. **Your Rights (GDPR)** — for EU users: right to access, rectification, erasure, portability
12. **Changes to This Policy** — policy may be updated; effective date shown
13. **Contact** — braiscastroapps@gmail.com

**Effective date:** 2025-03-15 (maintained from existing policy)  
**Removed from original:** Google Play Services reference, Screen Recording section

---

## 8. Contact Page

- Heading: "Contact" / "Contacto"
- Short text: "For support or questions about any of our apps, reach us at:"
- Email displayed as a `mailto:` link: `braiscastroapps@gmail.com`
- Response time disclaimer: "We'll do our best to respond within a few business days."
- No form, no external service dependency

**This page's URL is used as the Support URL in App Store Connect.**

---

## 9. app-ads.txt

Static file placed at `/public/app-ads.txt`. The file is served at the root: `https://<host>/app-ads.txt`.

Content (final, no placeholder needed):

```
google.com, pub-7337873881009900, DIRECT, f08c47fec0942fa0
```

---

## 10. Project Structure

```
brais-castro-apps/
├── astro.config.mjs
├── package.json
├── tailwind.config.mjs
├── tsconfig.json
├── public/
│   ├── app-ads.txt
│   └── favicon.ico
├── src/
│   ├── data/
│   │   └── apps.ts              # iTunes API fetch + AppData type
│   ├── i18n/
│   │   ├── en.json
│   │   ├── es.json
│   │   └── utils.ts
│   ├── layouts/
│   │   └── Layout.astro         # Base layout: head, header, footer
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Hero.astro
│   │   ├── AppCard.astro
│   │   ├── AppGrid.astro
│   │   ├── StarRating.astro
│   │   └── LanguageSwitcher.astro
│   └── pages/
│       ├── index.astro          # Redirect logic
│       └── [lang]/
│           ├── index.astro      # Home
│           ├── privacy.astro    # Privacy Policy
│           ├── contact.astro    # Contact
│           └── app/
│               └── [slug].astro # Individual app
└── .github/
    └── workflows/
        └── deploy.yml
```

---

## 11. CI/CD

### GitHub Actions Workflow

**Triggers:**
- Push to `main`
- Weekly cron (`0 6 * * 1` — every Monday at 06:00 UTC)

**Steps:**
1. `actions/checkout@v4`
2. `actions/setup-node@v4` (Node 20)
3. `npm ci`
4. `npm run build` (fails if iTunes API unreachable)
5. `actions/deploy-pages@v4` → GitHub Pages

**GitHub Pages config:**
- Source: GitHub Actions
- Base path: `/brais-castro-apps/` (configured in `astro.config.mjs`)

---

## 12. Out of Scope

- Analytics / tracking on the website itself
- Dark mode
- CMS or admin interface
- App reviews / user-generated content
- Server-side functionality (fully static)
