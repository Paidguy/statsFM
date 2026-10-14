# statsFM

statsFM is a React + TypeScript app that analyzes public Last.fm profiles and turns listening history into a clear, visual report.

**Live app:** https://paidguy.me/statsFM

## Features

- Last.fm profile lookup with period filters (`1month`, `6month`, `12month`, `overall`)
- Six-dimension taste ratings with plain-language explanations
- Charts for hourly and weekday listening behavior
- Top artists, tracks, albums, and decade distribution views
- Recap modal with exportable 9:16 and 1:1 images
- Festival lineup poster export from top artists
- Optional server-side Last.fm proxy with caching

## Tech stack

- React 19 + TypeScript
- Vite 8 + Tailwind CSS 4
- Express (optional production proxy/server)

## Getting started

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
git clone https://github.com/paidguy/statsFM.git
cd statsFM
npm install
```

### Run locally

```bash
npm run dev
```

Open http://localhost:3000.

### Type check and build

```bash
npm run lint
npm run build
```

### Run the Express server

Build first, then run:

```bash
npm run build
npm start
```

## Environment variables

Copy `.env.example` to `.env` if needed:

```bash
cp .env.example .env
```

| Variable | Purpose | Default |
| --- | --- | --- |
| `LASTFM_API_KEY` | API key used by `server.ts` proxy | Built-in fallback key |
| `VITE_LASTFM_API_KEY` | API key used by client-side direct requests | Built-in fallback key |
| `PORT` | Local port for Vite/Express | `3000` |
| `APP_URL` | Canonical app URL for metadata | `https://paidguy.me/statsfm` |

## Architecture

statsFM supports two runtime modes:

1. **Static mode (GitHub Pages / static hosts):** client calls Last.fm directly with CORS and client-side caching.
2. **Server mode (Node/Express):** `/api/lastfm` proxy handles requests with method allow-listing and in-memory caching.

## Project structure

```text
src/
  api/            # Last.fm client and fetch orchestration
  components/     # UI components, modals, charts, exports
  server/         # Last.fm proxy handler shared by Vite + Express
  types/          # API and app data types
  utils/          # scoring and analytics logic
server.ts         # Express entrypoint for server mode
.github/workflows # CI and GitHub Pages deployment
```

## Deployment

### GitHub Pages

The repository includes `.github/workflows/deploy.yml`.

1. Enable **GitHub Actions** as the Pages source.
2. Push to `main` (or run the workflow manually).
3. The workflow builds and deploys `dist/`.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)
