# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

See `AGENTS.md` for full coding guidelines, style rules, and conventions — everything there applies here.

## Commands

```bash
npm run dev          # Dev server at http://localhost:4321
npm run build        # Static build → ./dist/
npm run preview      # Serve production build locally
npx astro check      # TypeScript + template type checker (only code quality tool)
```

No test runner, linter, or formatter is configured.

## Architecture

Static landing page for iOS apps built with **Astro 6** + **Tailwind CSS v4**, deployed to **GitHub Pages**.

- **Static output only** — all pages pre-rendered at build time via `getStaticPaths()`
- **Base URL:** `/brais-castro-apps` (use `import.meta.env.BASE_URL.replace(/\/$/, '')` for links)
- **Data source:** iTunes Search API, fetched at build time in `src/data/apps.ts`
- **i18n:** Two languages (en/es) via `src/i18n/` — flat dot-notation keys, `t(key, lang)` helper, always update both JSON files
- **Dark mode:** Class-based toggle (`dark` class on `<html>`), persisted to localStorage, falls back to system preference

## Key Patterns

- Root-level pages (`/privacy`, `/app/[slug]`) are redirects via `LangRedirect.astro` — actual content lives under `/[lang]/`
- `SUPPORTED_LANGS` in `src/i18n/utils.ts` is the single source of truth for language codes
- Apple-inspired color palette applied as inline hex values (not in Tailwind config)
- Always test `npm run build` before pushing — the site is fully static and build failures are caught here

## CI/CD

GitHub Actions deploys on push to `main`, weekly cron (Monday 06:00 UTC to refresh iTunes data), and manual dispatch.
