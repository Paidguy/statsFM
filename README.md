<div align="center">

<br />

<a href="https://github.com/Paidguy/statsfm">
  <img src="public/favicon.svg" alt="statsFM Logo" width="76" height="76" />
</a>

# statsFM

**Turn your Last.fm listening history into deep music insights and shareable posters.**

<br />

[![CI](https://img.shields.io/github/actions/workflow/status/Paidguy/statsfm/ci.yml?branch=main&style=for-the-badge&logo=githubactions&logoColor=white&label=CI&color=000000&labelColor=141414)](.github/workflows/ci.yml)
[![Deploy](https://img.shields.io/github/actions/workflow/status/Paidguy/statsfm/deploy.yml?branch=main&style=for-the-badge&logo=github&logoColor=white&label=DEPLOY&color=000000&labelColor=141414)](.github/workflows/deploy.yml)
[![TypeScript](https://img.shields.io/badge/TYPESCRIPT-5.X-000000?style=for-the-badge&logo=typescript&logoColor=white&labelColor=141414)](tsconfig.json)
[![Vite](https://img.shields.io/badge/VITE-BUNDLER-000000?style=for-the-badge&logo=vite&logoColor=white&labelColor=141414)](vite.config.ts)
[![License](https://img.shields.io/badge/LICENSE-MIT-000000?style=for-the-badge&labelColor=141414)](LICENSE)

<br />

<p align="center">
  <a href="#-features"><b>Features</b></a> &nbsp;·&nbsp;
  <a href="#-tech-stack"><b>Tech Stack</b></a> &nbsp;·&nbsp;
  <a href="#-quick-start"><b>Quick Start</b></a> &nbsp;·&nbsp;
  <a href="#-project-structure"><b>Structure</b></a> &nbsp;·&nbsp;
  <a href="#-contributing"><b>Contributing</b></a>
</p>

<br />

</div>

---

## ✦ Features

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🎧 &nbsp;Deep Music Insights</h3>
      <p>Goes beyond simple play counts. Discover your unique taste rating, how varied your artist rotation is, and which decades of music you listen to the most.</p>
    </td>
    <td width="50%" valign="top">
      <h3>📊 &nbsp;Listening Habits & Charts</h3>
      <p>See exactly when you listen to music with 24-hour activity charts, weekly heatmaps, and a live speedometer that tracks your daily listening pace.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🖼️ &nbsp;Shareable Posters & Recaps</h3>
      <p>Turn your top artists and tracks into high-resolution festival lineup posters, artist spotlight cards, and vertical story recaps ready to download and share.</p>
    </td>
    <td width="50%" valign="top">
      <h3>⚡ &nbsp;Fast, Clean & Private</h3>
      <p>Designed with a smooth, minimalist interface, a live "Now Playing" ticker, and a built-in backend server that keeps your Last.fm API key completely hidden.</p>
    </td>
  </tr>
</table>

---

## ✦ Tech Stack

| Part | Built With | What It Does |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript, Vite | Powers the user interface, interactive charts, and fast page loads |
| **Analytics** | Custom Insights Engine | Calculates taste scores, decade breakdowns, and listening patterns |
| **Backend** | Node.js (`server.ts`) | Fetches data from Last.fm, caches results, and protects your API key |
| **Automation** | GitHub Actions | Automatically tests code (`ci.yml`) and deploys updates (`deploy.yml`) |

---

## ✦ Quick Start

### 1. What You Need
* **Node.js** (v18 or newer) and **npm**
* A free **[Last.fm API Key](https://www.last.fm/api/account/create)**

### 2. Install & Set Up

```bash
# Clone the repository
git clone [https://github.com/Paidguy/statsfm.git](https://github.com/Paidguy/statsfm.git)
cd statsfm

# Install packages
npm install

# Create your environment file
cp .env.example .env
```

### 3. Add Your API Key

Open the `.env` file and paste your Last.fm API key:

| Variable | Required | Description |
| :--- | :---: | :--- |
| `LASTFM_API_KEY` | **Yes** | Your personal Last.fm API key (kept safe on the server) |
| `PORT` | Optional | Custom port for the local server |

### 4. Run the App

```bash
# Start the app in development mode
npm run dev

# Build the app for production
npm run build
```

---

## ✦ Project Structure

```text
statsFM/
├── .github/                 # Automated testing, deployment & issue templates
├── public/                  # App icon, static files & 404 error page
├── src/
│   ├── api/                 # Connects the frontend to the backend server
│   ├── components/          # UI screens, charts, heatmaps & poster generators
│   ├── server/              # Handles Last.fm API requests and caching
│   ├── types/               # TypeScript data definitions
│   ├── utils/               # Math and logic for insights and decade tracking
│   ├── App.tsx              # Main page layout
│   └── main.tsx             # App starting point
├── .env.example             # Sample environment file
├── server.ts                # Backend server entry file
└── vite.config.ts           # Build and bundler settings
```

---

## ✦ Contributing

Want to report a bug, suggest a feature, or submit code? Check out [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

1. Fork this repository
2. Create a new branch (`git checkout -b feat/your-feature`)
3. Commit your changes (`git commit -m 'feat: add your feature'`)
4. Push to the branch (`git push origin feat/your-feature`)
5. Open a Pull Request

---

<div align="center">

<br />

Released under the [MIT License](LICENSE).  
Built by [**@Paidguy**](https://github.com/Paidguy)

<br />

</div>
