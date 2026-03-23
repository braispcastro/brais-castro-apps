# brais-castro-apps

Developer landing page for [Brais Castro](https://github.com/braispcastro)'s iOS apps. Built with Astro and Tailwind CSS, deployed to GitHub Pages.

## Features

- **App showcase** — fetches all published apps from the iTunes Search API at build time, no manual updates needed
- **Bilingual** — full English and Spanish support via `/en/` and `/es/` routes
- **Individual app pages** — icon, description, screenshots, rating, and App Store link for each app
- **Privacy Policy** — GDPR-compliant, bilingual, linkable from App Store Connect
- **Contact page** — dedicated support URL for App Store Connect
- **app-ads.txt** — served at root for AdMob compliance
- **Zero client-side JS** — fully static HTML except for the language redirect on the root page
- **Auto-refresh** — GitHub Actions rebuilds every Monday to pick up new apps or rating changes

## Stack

- [Astro](https://astro.build) — static site generator
- [Tailwind CSS v4](https://tailwindcss.com) — utility-first styling
- [iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/) — app data source
- [GitHub Pages](https://pages.github.com) — hosting
- [GitHub Actions](https://github.com/features/actions) — CI/CD

## Project Structure

```
src/
├── components/
│   ├── AppCard.astro          # App card for the grid
│   ├── AppGrid.astro          # Responsive grid of app cards
│   ├── Footer.astro
│   ├── Header.astro           # Nav + language switcher
│   ├── Hero.astro             # Landing hero section
│   └── StarRating.astro       # Star rating display
├── data/
│   └── apps.ts                # iTunes API fetch + AppData type
├── i18n/
│   ├── en.json                # English strings
│   ├── es.json                # Spanish strings
│   └── utils.ts               # t() helper, lang utilities
├── layouts/
│   └── Layout.astro           # Base HTML layout
├── pages/
│   ├── index.astro            # Root redirect (EN/ES)
│   └── [lang]/
│       ├── index.astro        # Home (app grid + hero)
│       ├── privacy.astro      # Privacy Policy
│       ├── contact.astro      # Contact
│       └── app/
│           └── [slug].astro   # Individual app page
└── styles/
    └── global.css             # Tailwind import
public/
├── app-ads.txt                # AdMob publisher declaration
└── favicon.svg
.github/workflows/
└── deploy.yml                 # Build + deploy on push and weekly cron
```

## Commands

| Command | Action |
|---------|--------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build to `./dist/` |
| `npm run preview` | Preview the build locally |

## Deploy

The site deploys automatically via GitHub Actions on every push to `main`. A weekly cron job (Mondays at 06:00 UTC) triggers a rebuild to refresh app data from the iTunes API.

To enable GitHub Pages:

1. Go to **Settings → Pages** in the repository
2. Set **Source** to **GitHub Actions**
3. Push to `main` — the workflow handles the rest

## App Store Connect URLs

| Field | URL |
|-------|-----|
| Privacy Policy URL | `https://braispcastro.github.io/brais-castro-apps/en/privacy/` |
| Support URL | `https://braispcastro.github.io/brais-castro-apps/en/contact/` |

## Adding a New App

Publish the app to the App Store. The next build (push to `main` or the weekly cron) will pick it up automatically from the iTunes API.

## License

© Brais Castro. All rights reserved.
