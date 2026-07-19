# Ecosphere

A turn-based, browser-based city-resilience strategy game. Pick an ecoregion,
play weekly turns over ~3 in-game years, collect tax income, and spend it
upgrading city systems to survive climate catastrophes.

**Live game:** https://dandyarmanization.github.io/Ecosphere/

## Tech stack

- React + TypeScript + Vite
- Game balance lives in editable JSON files (`src/data/`), not hard-coded
- Deployed automatically to GitHub Pages via GitHub Actions on every push to `main`

## Running locally

npm install
npm run dev



Then open the URL it prints (usually http://localhost:5173/).

## Building for production

npm run build



Outputs a deployable `dist/` folder. You normally won't need to run this by
hand — pushing to `main` triggers `.github/workflows/deploy.yml`, which builds
and publishes automatically.

## Project structure

- `src/landing/` — marketing/intro page (not built yet)
- `src/game/components/` — screens and UI pieces (e.g. `CityDashboard.tsx`)
- `src/game/engine/` — pure game-rule functions (`turn.ts`): tax, upgrades,
  climate event resolution, win/lose checks
- `src/game/state/` — live game state + `localStorage` autosave (`useGameState.ts`)
- `src/data/` — editable game balance JSON:
  - `ecoregions.json` — playable regions, starting money/resilience
  - `systems.json` — Energy/Water/Policy upgrade costs and effects
  - `events.json` — climate events and what mitigates them
  - `balance.json` — global knobs (game length, tax rate, event odds)

## Current MVP scope

- 1 ecoregion: Boreal (wildfire + cold-snap events)
- 3 systems: Energy, Water, Policy
- Turn loop: collect tax → spend on upgrades → resolve a climate event →
  update resilience score → advance the week
- Autosaves to the browser (localStorage)
- Win at week 156 with resilience > 0; lose if resilience hits 0