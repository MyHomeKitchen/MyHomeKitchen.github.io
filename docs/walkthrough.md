# MyHomeKitchen - Project Walkthrough

A frontend-only web application for managing home and kitchen lists, built with **React**, **Vite**, and **Docker**.

## Features Implemented
- **List Management**: Create grocery and appliance lists.
- **Data Persistence**: Lists are saved automatically to browser storage.
- **Smart Icons**: Items automatically get an icon (e.g. "Milk" -> 🥛) using bundled SVGs.
- **Themes**: Toggle between Light and Dark modes.
- **Export**: "Print" button optimized to save as clean PDF.
- **Responsive**: Mobile-first design.

## How to Run

### Option A: Using Docker (Recommended for local testing)
Since you requested dockerization, this is the easiest way to run without installing Node.js globally.

1.  Open terminal in project folder.
2.  Run:
    ```bash
    docker-compose up
    ```
3.  Open [http://localhost:8083](http://localhost:8083).

### Option B: Using Node.js (If installed)
1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start dev server:
    ```bash
    npm run dev
    ```

## Verification
- **Build**: Verified production build using `npm run build` (Exit Code 0).
- **Files**: All source code, styles, and assets are local (no external backend dependency).

## Next Steps
- Deploy to GitHub Pages:
    1.  Go to GitHub Repo Settings > Pages.
    2.  Select `gh-pages` branch (or configure GitHub Actions to build from `main`).
