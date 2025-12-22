# Chronicles - Population Simulator

A human civilization simulator starting from 8000 BC.

## Tech Stack

- **Framework**: SolidJS (solid-js)
- **Build**: Vite (rolldown-vite)
- **Styling**: Tailwind CSS v4
- **Charts**: d3.js
- **Deploy**: Cloudflare Pages (`simulator-8wq.pages.dev`)

## Project Structure

```
src/
├── index.tsx          # Entry point
├── App.tsx            # Main app component (CSS Grid layout)
├── gameStore.ts       # Game state & simulation logic
├── types.ts           # TypeScript types (Human, GameState, HistoryPoint)
└── components/
    ├── MainStats.tsx        # Year, population, food, children stats
    ├── TimeControl.tsx      # Play/pause, speed control (1-4 keys, Space)
    ├── Charts.tsx           # d3.js line charts (population, births, food)
    ├── PopulationPyramid.tsx # Age distribution (0-69)
    ├── ChronicleLog.tsx     # Event log
    └── GameOverModal.tsx    # Game over screen
```

## Game Mechanics

- **Start**: 8000 BC, 100 married couples (age 15)
- **Marriage**: Unmarried adults (15+) auto-marry (incest prevention)
- **Reproduction**: Married women age 15-30, 30% chance per year
- **Death**: Normal distribution (mean 60, std 10)
- **Food**: Workers (15-49) produce, 1 consumed per person
- **Save**: Auto-save to localStorage every year

## Commands

```bash
pnpm dev      # Development server
pnpm build    # Production build
pnpm preview  # Preview production build
```

## Keyboard Shortcuts

- `Space`: Play/Pause
- `1`: 1x speed
- `2`: 2x speed
- `3`: 5x speed
- `4`: 10x speed

## Tailwind CSS v4 Conventions

Use new Tailwind v4 syntax:

- `bg-linear-to-r` (not `bg-gradient-to-r`)
- `bg-linear-to-b` (not `bg-gradient-to-b`)
- `grid-cols-[2fr_1fr]` for arbitrary grid columns
