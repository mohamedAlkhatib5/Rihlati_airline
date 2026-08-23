# ✈️ Rihlati Airlines

Airline booking experience built as a full-stack project: a **React 19 + Vite**
front-end and (in progress) a **Laravel + MySQL** REST API with an admin
dashboard.

Bilingual (English / Arabic) with full right-to-left support.

---

## Repository layout

```text
Rihlati_airline/
├── client/                    React front-end
│   ├── public/
│   ├── scripts/
│   │   └── optimize-images.mjs    Responsive image pipeline (WebP + JPEG)
│   └── src/
│       ├── app/                   Application shell
│       │   ├── App.jsx
│       │   ├── providers/         Router, i18n, motion, error boundary
│       │   └── routes/            Route table + lazily loaded pages
│       │
│       ├── features/              One folder per product area
│       │   ├── home/              Hero, highlights, experience, newsletter
│       │   ├── flights/           Booking form + validation hook
│       │   ├── destinations/      Catalogue, card, grid
│       │   ├── about/
│       │   ├── contact/           Contact form + validation hook
│       │   └── not-found/
│       │       ├── <Feature>Page.jsx
│       │       ├── components/
│       │       ├── constants/
│       │       ├── hooks/
│       │       └── styles/
│       │
│       ├── shared/                Reusable across every feature
│       │   ├── components/
│       │   │   ├── brand/         Logo
│       │   │   ├── layout/        Header, footer, page hero, transitions
│       │   │   ├── ui/            Buttons, form field, status, images
│       │   │   └── feedback/      Error boundary
│       │   ├── constants/
│       │   ├── hooks/
│       │   ├── lib/               Storage, formatting, image registry
│       │   └── styles/            tokens.css + base.css
│       │
│       ├── i18n/                  i18next setup + locales/{en,ar}.json
│       └── assets/
│           ├── images-src/        Originals (input to the image pipeline)
│           └── images/            Generated variants + manifest.json
│
├── server/                    Laravel REST API              (phase 3)
├── database/                  Migrations + seeders          (phase 3)
└── docs/                      API reference, ERD, setup     (phase 4)
```

### Why this shape

- **Feature-first, not type-first.** Everything a feature needs sits together,
  so a change to booking touches one folder rather than five.
- **`shared/` holds only what more than one feature uses.** A component moves
  there the second time it is needed, not the first.
- **Design tokens are the single source of truth.** Colour, spacing, radius,
  typography and motion live in `shared/styles/tokens.css`; components never
  hard-code raw values.
- **Copy lives in `i18n/locales`, never in JSX.** Adding a third language means
  adding one JSON file.

---

## Getting started

```bash
cd client
npm install
npm run dev          # http://localhost:5173
```

### Available scripts

| Script                 | What it does                                     |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Development server with hot reload                |
| `npm run build`        | Production build into `client/dist`               |
| `npm run preview`      | Serve the production build locally                |
| `npm run format`       | Format `src/` with Prettier                       |
| `npm run images:build` | Regenerate responsive images from `images-src/`   |

### Adding a destination image

Drop the original into `client/src/assets/images-src/` and run
`npm run images:build`. The pipeline emits 640 / 1280 / 1920 px WebP plus a
JPEG fallback and records intrinsic dimensions in `manifest.json`, which
`<ResponsiveImage>` uses to reserve layout space. A destination whose image is
not present yet renders a branded placeholder instead of a broken image.

---

## Front-end stack

| Concern          | Choice                                             |
| ---------------- | -------------------------------------------------- |
| Framework        | React 19                                            |
| Build            | Vite 7 (route-level code splitting, vendor chunks)  |
| Routing          | React Router 7                                      |
| Layout / UI      | React Bootstrap 5                                   |
| Icons            | lucide-react (tree-shaken) + local brand glyphs      |
| Animation        | Framer Motion, gated on `prefers-reduced-motion`    |
| Internationalise | i18next + react-i18next, `Intl` for dates and money |
| Formatting       | Prettier                                            |

---

## Accessibility

- Every form control is wired to its label through `controlId`, with
  `aria-invalid` and `aria-describedby` on error.
- A single visible focus ring is defined once in `base.css`.
- Skip link to `<main>`; focus moves there on every route change.
- Status messages are live regions, announced when they appear.
- Motion respects the operating system's reduce-motion setting.

---

## Roadmap

| Phase | Scope                                                    | Status  |
| ----- | -------------------------------------------------------- | ------- |
| 1     | Critical fixes: images, focus, labels, code splitting     | ✅ Done |
| 2     | Architecture: features, tokens, i18n, animation, a11y     | ✅ Done |
| 3     | Laravel API + MySQL schema, migrations, seeders           | Next    |
| 4     | Real flight search, booking flow, seat map, PNR lookup    | Planned |
| 5     | JWT authentication, user area, booking history            | Planned |
| 6     | Admin dashboard: KPIs, charts, CRUD, audit log            | Planned |
| 7     | ESLint, tests, CI, SEO, security headers, deployment      | Planned |
