# AGENTS.md

Guidelines for agentic coding agents working in this repository.

## Project Overview

Static landing page for iOS apps by Brais Castro, built with **Astro 6** and **Tailwind CSS v4**.
Deployed to Cloudflare Pages. App data is fetched from the iTunes Search API at build time.

## Tech Stack

- **Framework:** Astro 6 (static output, file-based routing)
- **Language:** TypeScript (strict mode via `astro/tsconfigs/strict`)
- **Styling:** Tailwind CSS v4 (using `@tailwindcss/vite`, NOT the legacy PostCSS integration)
- **Package manager:** npm
- **Node version:** `>=22.12.0` (required)
- **Deployment:** Cloudflare Pages (auto-deploy on push to `main`)

## Commands

```bash
npm run dev        # Start local dev server (http://localhost:4321)
npm run build      # Production static build → ./dist/
npm run preview    # Serve the production build locally
```

There is **no test runner, no linter, and no formatter** configured. TypeScript type-checking
is the only automated code quality tool available.

```bash
npx astro check    # Run Astro's built-in TypeScript + template type checker
```

## Project Structure

```
src/
  components/     # Astro UI components (PascalCase.astro)
  data/           # Data-fetching layer (apps.ts → iTunes Search API)
  i18n/           # Translations: utils.ts + en.json + es.json
  layouts/        # Layout.astro (HTML shell), LangRedirect.astro
  pages/          # File-based routing
    index.astro              # Redirects to /en/ or /es/
    [lang]/                  # Localized pages (en/es)
      index.astro
      app/[slug].astro
      privacy.astro
      contact.astro
    app/[slug].astro         # Language-less routes → redirect via LangRedirect
    privacy.astro
    contact.astro
  styles/
    global.css    # @import "tailwindcss" + dark mode custom variant
public/           # Static assets (favicon, app-ads.txt)
.github/
  workflows/
    deploy.yml    # Triggers Cloudflare Pages deploy on weekly cron for iTunes data refresh
```

## Routing & i18n

- All user-facing pages live under `/[lang]/` (`en` or `es`).
- Root-level paths (e.g., `/privacy`) redirect via `LangRedirect.astro` using `navigator.language`.
- Translation strings live in `src/i18n/en.json` and `src/i18n/es.json` using flat dot-notation
  keys (e.g., `"nav.apps"`, `"meta.home_title"`).
- The `t(key, lang)` helper in `src/i18n/utils.ts` resolves translations with an English fallback.
- Always update **both** `en.json` and `es.json` when adding new translation keys.
- `SUPPORTED_LANGS` from `src/i18n/utils.ts` is the single source of truth for valid language codes.

## TypeScript Guidelines

- Extend `astro/tsconfigs/strict` — do not loosen TypeScript settings.
- Use `interface` for object shapes (component props, API response types, data models).
- Use `type` for union types and type aliases (e.g., `type Lang = 'en' | 'es'`).
- Always use `import type { ... }` for type-only imports.
- Every Astro component must declare an `interface Props { ... }` in its frontmatter.
- Avoid type assertions; use proper narrowing. Exception: `Astro.params as { lang: Lang }` is
  acceptable because Astro does not infer param types from `getStaticPaths`.
- No `any`. Prefer `unknown` with narrowing when the type is genuinely unknown.

## Code Style

### File Naming

| Type | Convention | Example |
|---|---|---|
| Astro components | `PascalCase.astro` | `AppCard.astro`, `StarRating.astro` |
| TypeScript utilities | `camelCase.ts` | `utils.ts`, `apps.ts` |
| CSS | `camelCase.css` | `global.css` |
| i18n data files | lowercase lang code | `en.json`, `es.json` |
| Dynamic route segments | `[camelCase]` | `[slug].astro`, `[lang]` |

### Naming Conventions

- **Functions:** `camelCase` — `fetchApps`, `toSlug`, `getLangFromPath`
- **Variables:** `camelCase` — `currentPath`, `alternateLang`, `starSize`
- **Exported constants:** `SCREAMING_SNAKE_CASE` — `SUPPORTED_LANGS`
- **Types and interfaces:** `PascalCase` — `AppData`, `Lang`, `Props`
- **`Props` interfaces** are never exported; they are local to each component

### Imports

Order imports as follows (no blank lines between groups):

```typescript
import type { ... } from '...';   // 1. Type-only imports
import { ... } from '...';        // 2. Value imports (data/utils)
import Layout from '...';         // 3. Layout components
import Foo from '...';            // 4. UI components
```

- Always use **single quotes** for import paths.
- Use **relative paths** — there are no path aliases (`@/`, `~/`, etc.).
- No barrel `index.ts` files; import from the specific module file.

### Astro Component Structure

Every `.astro` component frontmatter must follow this order:

```astro
---
// 1. Imports
// 2. interface Props { ... }
// 3. const { prop, prop = default } = Astro.props;
// 4. Derived local variables
---

<!-- Template -->
```

### Formatting Rules

- **Indentation:** 2 spaces (no tabs)
- **Semicolons:** always in TypeScript/JS
- **Trailing commas:** in all multi-line arrays and objects
- **String quotes:** single quotes (`'`) in TS/JS; double quotes in HTML attributes and JSON
- **Template literals:** for string interpolation — never use `+` concatenation
- **Arrow functions:** for callbacks (`.map()`, `.filter()`); named `function` declarations for
  standalone helpers and `getStaticPaths`
- **Nullish coalescing:** `??` not `||` for fallback values
- **Optional chaining:** `?.` for nullable property access

### Error Handling

- In async data-fetching code, wrap fetch calls in `try/catch` and rethrow with context:

```typescript
try {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API returned HTTP ${res.status}`);
  data = await res.json();
} catch (err) {
  throw new Error(`Context message: ${err instanceof Error ? err.message : String(err)}`);
}
```

- Always check `!res.ok` before parsing the response body.
- Always validate the result after fetching (e.g., check for empty arrays).
- Wrap `localStorage` calls in `try/catch` with empty catch (`catch (e) {}`) to guard against
  restricted browser environments.
- Do not swallow errors silently anywhere except `localStorage` access.

### Tailwind CSS

- Use **Tailwind v4** syntax: `@import "tailwindcss"` in CSS (not the `@tailwind` directives).
- Dark mode is class-based via `@custom-variant dark (&:where(.dark, .dark *))` in `global.css`.
  Toggle by adding/removing the `dark` class on `<html>`.
- Use Tailwind's `dark:` prefix for dark mode variants.
- Apple-inspired color palette is applied as raw hex values inline (not extracted into a theme
  config): `#1d1d1f`, `#f5f5f7`, `#0071e3`, `#0a84ff`, `#6e6e73`, `#98989d`, `#3a3a3c`.
- No custom CSS class names — use Tailwind utility classes exclusively.

## Adding New Pages

1. Create the page under `src/pages/[lang]/your-page.astro`.
2. Create a root-level redirect at `src/pages/your-page.astro` using `LangRedirect.astro`.
3. Add all visible strings to both `src/i18n/en.json` and `src/i18n/es.json`.
4. Link to the page: `href={`/${lang}/your-page`}`

## CI/CD

Cloudflare Pages auto-deploys on every push to `main` (build + deploy handled by Cloudflare).

The GitHub Actions workflow (`.github/workflows/deploy.yml`) only handles the weekly cron
(Monday 06:00 UTC) to trigger a Cloudflare deploy via Deploy Hook, refreshing iTunes API data.
It also supports manual `workflow_dispatch`.

Ensure `npm run build` succeeds locally before pushing, especially after changes to
`src/data/apps.ts` or any `getStaticPaths` function.
