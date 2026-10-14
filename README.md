# statsFM 🪡

[![Deploy to GitHub Pages](https://github.com/paidguy/statsFM/actions/workflows/deploy.yml/badge.svg)](https://github.com/paidguy/statsFM/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-paidguy.me%2Fstatsfm-3fd6c6?style=flat&logo=safari)](https://paidguy.me/statsfm)
[![License: MIT](https://img.shields.io/badge/License-MIT-ff5c9a.svg)](https://opensource.org/licenses/MIT)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff.svg?logo=vite)](https://vitejs.dev/)

> **A high-fidelity Last.fm visual analytics engine, 6-dimension music taste scorecard, and silkscreen festival lineup poster generator designed with an editorial risograph aesthetic.**

Live Application: **[paidguy.me/statsfm](https://paidguy.me/statsfm)**  
GitHub Repository: **[paidguy/statsFM](https://github.com/paidguy/statsFM)**

---

## ✦ Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
  - [1. 6-Dimension Music Taste Scorecard](#1-6-dimension-music-taste-scorecard)
  - [2. Silkscreen Festival Lineup Poster (A2 / 18×24)](#2-silkscreen-festival-lineup-poster-a2--1824)
  - [3. Full-Screen Story Recap & Exports](#3-full-screen-story-recap--exports)
  - [4. Deep-Dive Analytical Visualizations](#4-deep-dive-analytical-visualizations)
  - [5. Tactile Interactions & Custom Stylus Cursor](#5-tactile-interactions--custom-stylus-cursor)
- [Architecture & Hosting Modes](#-architecture--hosting-modes)
- [Quick Start & Local Setup](#-quick-start--local-setup)
- [Deploying to GitHub Pages](#-deploying-to-github-pages)
  - [Standard GitHub Pages Setup](#standard-github-pages-setup)
  - [Custom Domain Setup (`paidguy.me/statsfm`)](#custom-domain-setup-paidguymestatsfm)
- [Full-Stack Node / Docker Deployment](#-full-stack-node--docker-deployment)
- [Environment Variables](#-environment-variables)
- [Accessibility & Design Standards](#-accessibility--design-standards)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✦ Overview

**statsFM** connects to any public [Last.fm](https://www.last.fm) profile and transforms raw scrobble history into editorial, print-grade music reports. Rather than presenting generic tables of numbers, statsFM calculates human-readable music taste ratings, decodes listening habits into relatable personas, and generates high-resolution downloadable posters for social sharing.

Designed in a bespoke dark risograph aesthetic utilizing a dual-ink palette (**Fluorescent Pink `#ff5c9a`** and **Aqua `#3fd6c6`** with screen blend dynamics), the interface adheres strictly to anti-slop rules, zero-pill metadata discipline, and WCAG AA contrast standards.

---

## ✦ Key Features

### 1. 6-Dimension Music Taste Scorecard
An intuitive, jargon-free scorecard rating six key dimensions of personal music taste with letter grades (A+, A, B), spectrum sliders, and transparent explanations:

- **Underground vs. Popular (Rarity)**: Measures how much of your rotation comprises independent, niche artists versus global Billboard chart-toppers.
- **Artist Devotion & Loyalty**: Evaluates whether you dedicate the majority of your listening time to a trusted inner circle of musicians or explore hundreds of different names.
- **Song Repeating Habit (Looping)**: Discovers whether you fall in love with single tracks and put them on repeat or prefer to listen through entire albums without repeating.
- **Listening Time & Rhythm (Clock)**: Maps your scrobbles to day vs. night listening, highlighting peak hours and your Night Owl percentage.
- **Favorite Music Era (Time Machine)**: Identifies which musical decade (1960s through 2020s) your top tracks and albums belong to.
- **Daily Music Appetite (Speed)**: Compares your recent daily track volume against your lifetime average.
- **Interactive Views**: Toggle between the **Detailed Scorecard** and **Spectrum Comparison**, with expandable *"Why this score?"* breakdowns for every metric.

### 2. Silkscreen Festival Lineup Poster (A2 / 18×24)
- Automatically stages your top 36 artists into a multi-tiered festival bill with headliners, sub-headliners, and undercard acts.
- Styled as an authentic screen-printed gig poster with registration marks, stage schedules, and custom dual-ink textures.
- One-click high-resolution PNG export (`html-to-image`) calibrated at 2× pixel ratio for crisp print quality.

### 3. Full-Screen Story Recap & Exports
- An 8-slide interactive recap designed for social media sharing.
- Tap/click navigation, segmented progress indicators, and full keyboard arrow support.
- Dual export options:
  - **9:16 Vertical Story** (Instagram Stories, TikTok, Snapchat)
  - **1:1 Square Album Sleeve** (Instagram Feed, Twitter / X, Discord)
- One-click clipboard copy of clean plain-text summaries.

### 4. Deep-Dive Analytical Visualizations
- **Scalable Artist Name Poster**: Proportional typographic sizing reflecting total plays, with instant click-to-spotlight artist profile modals.
- **Ranked Top Tracks**: Proportional visual bars with play counts and ranking numbers.
- **24-Hour Listening Histogram**: Hand-crafted SVG bar chart categorizing night hours (10pm–5am) and daytime hours.
- **7-Day Weekday vs. Weekend Heatmap**: Compares weekday routine listening with weekend leisure sessions.
- **Era & Decade Distribution**: Categorizes catalog distribution across musical eras.
- **Top Album Grid**: Shows real album artwork with automatic graceful fallback to dual-ink risograph vinyl sleeve art.
- **Real-Time Live Ticker**: Detects active `@attr: nowplaying` tracks and recent scrobbles.

### 5. Tactile Interactions & Custom Stylus Cursor
- Custom 60fps stylus needle cursor with a screen-blended dual-ink aperture (automatically disabled on touch devices and when `prefers-reduced-motion` is active).
- Magnetic physics attraction on primary buttons (`MagneticButton`).
- Full keyboard accessibility (`Tab`, `Space`, `Enter`, `Escape`).

---

## ✦ Architecture & Hosting Modes

statsFM is designed to run in two distinct environments with **zero code changes**:

```
┌─────────────────────────────────────────────────────────────┐
│                      statsFM Frontend                       │
│             React 19 + TypeScript + Tailwind CSS            │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│  Mode A: Static GitHub Pages │    │  Mode B: Full-Stack Express  │
│  (paidguy.me/statsfm)        │    │  (Node.js / Docker)          │
│                              │    │                              │
│  - Static bundle in ./dist   │    │  - server.ts entrypoint      │
│  - Direct Last.fm CORS calls │    │  - /api/lastfm proxy route   │
│  - 5-min client memory cache │    │  - 5-min server memory cache │
│  - Relative base: './'       │    │  - API key protection        │
└──────────────────────────────┘    └──────────────────────────────┘
```

1. **Static Hosting (GitHub Pages / Vercel / Netlify / Cloudflare Pages)**:
   - When hosted on GitHub Pages (`https://paidguy.me/statsfm` or `https://paidguy.github.io/statsFM`), the client detects that no proxy is mounted and calls the Last.fm AudioScrobbler 2.0 API directly.
   - Last.fm supports `Access-Control-Allow-Origin: *` for browser CORS calls.
   - Built-in 5-minute client-side memory caching prevents rate limiting.

2. **Full-Stack Hosting (Node.js / Express / Cloud Run / Railway / VPS)**:
   - Run `npm start` to execute `server.ts`.
   - Mounts the `/api/lastfm` proxy route with method whitelisting, HTTP headers, and 5-minute memory caching.

---

## ✦ Quick Start & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (version 20 or higher recommended)
- `npm`, `pnpm`, or `bun`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/paidguy/statsFM.git
   cd statsFM
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables** (optional):
   ```bash
   cp .env.example .env
   ```
   *Note: statsFM includes an active Last.fm fallback key, so local development works immediately out-of-the-box without manual API key registration.*

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Type check & Lint**:
   ```bash
   npm run lint
   ```

6. **Build for production**:
   ```bash
   npm run build
   ```

---

## ✦ Deploying to GitHub Pages

statsFM comes pre-configured with a GitHub Actions workflow (`.github/workflows/deploy.yml`) for automated, zero-config deployment.

### Standard GitHub Pages Setup

1. **Push your repository to GitHub**:
   ```bash
   git remote add origin https://github.com/paidguy/statsFM.git
   git branch -M main
   git push -u origin main
   ```

2. **Enable GitHub Pages in your repository settings**:
   - Go to your repository on GitHub: `https://github.com/paidguy/statsFM/settings/pages`.
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.

3. **Trigger deployment**:
   - Every push to `main` will automatically build the application and deploy the static `dist/` directory to GitHub Pages.
   - You can also trigger it manually under the **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**.

### Custom Domain Setup (`paidguy.me/statsfm`)

If hosting under a custom domain like `paidguy.me/statsfm`:

1. In `vite.config.ts`, `base: './'` is already configured to generate relative asset paths so the app works regardless of domain or subpath.
2. In your DNS provider (e.g. Cloudflare, Namecheap, Google Domains), point `paidguy.me` to GitHub Pages:
   - **Apex A records**:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
3. Under **Settings → Pages** in your root `paidguy` GitHub Pages repository, set the Custom domain to `paidguy.me`.
4. Your statsFM build will be live at `https://paidguy.me/statsfm`!

---

## ✦ Full-Stack Node / Docker Deployment

If you prefer to host statsFM with its Node.js / Express proxy backend:

```bash
# Build the client bundle
npm run build

# Start the Express server
npm start
```

### Dockerfile (Optional)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## ✦ Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `LASTFM_API_KEY` | Server-side Last.fm 32-character API key (used by `server.ts`) | Pre-configured active key |
| `VITE_LASTFM_API_KEY` | Client-side Last.fm API key (used for direct static calls) | Pre-configured active key |
| `PORT` | Local port for Express / Vite server | `3000` |
| `APP_URL` | Canonical URL for social preview meta tags and share links | `https://paidguy.me/statsfm` |

---

## ✦ Accessibility & Design Standards

statsFM was built with careful attention to frontend craftsmanship:

- **WCAG AA Compliance**: High text contrast ratios ($\ge 5.6:1$ for secondary copy, $\ge 13.5:1$ for primary headings).
- **Visible Focus States**: Unambiguous `focus-visible:ring-2 focus-visible:ring-[#3fd6c6]` outlines for all keyboard navigation.
- **Screen Reader Announcements**: Semantic `aria-live="assertive"` on errors, `aria-busy` during fetch states, and explicit `role="progressbar"` with min/max values.
- **Touch Target Integrity**: Minimum $40\text{px}$–$44\text{px}$ clickable hit areas for touch devices.
- **Zero-Pill Discipline**: Metadata is styled cleanly with typographic hierarchy and subtle separators rather than generic rounded pill chips.
- **Reduced Motion Support**: Animations and custom cursors gracefully yield when `prefers-reduced-motion: reduce` is detected.

---

## ✦ Contributing

Contributions, bug reports, and suggestions are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ✦ License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more information.

---

Crafted with care by [paidguy](https://github.com/paidguy) · Live at [paidguy.me/statsfm](https://paidguy.me/statsfm)
