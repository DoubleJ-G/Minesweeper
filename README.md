# Minesweeper

A classic Minesweeper game built with React and TypeScript. Live it at [https://minesweeper.jadengregory.com.au](https://minesweeper.jadengregory.com.au).

## Features

- **Three difficulty levels** — Beginner (9×9, 10 mines), Intermediate (16×16, 40 mines), and Expert (16×30, 99 mines)
- **First-click safety** — mines are placed after your first click, so you can never lose on the opening move
- **Flood reveal** — clicking an empty cell automatically reveals all connected empty cells and their numbered borders
- **Chord** — click a revealed number when the correct number of adjacent flags are placed to auto-reveal remaining neighbors
- **Flag support** — right-click on desktop or long-press on mobile to place and remove flags
- **Fully responsive** — touch-optimised for mobile with long-press flagging and scroll-safe gesture handling
- **Performance** — individual cells are memoized to avoid unnecessary re-renders on large grids

## How to Play

- **Reveal a cell** — left-click (or tap on mobile)
- **Flag a cell** — right-click on desktop (or long-press on mobile)
- **Chord** — click a revealed number whose adjacent flag count matches its value to reveal all remaining adjacent cells
- **Reset** — click the emoji button in the header to start a new game
- **Change difficulty** — buttons above the board control difficulty


## Technologies

| Tool | Purpose |
|---|---|
| [React 19](https://react.dev) | UI framework |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Tailwind CSS v4](https://tailwindcss.com) | Styling |
| [Vitest](https://vitest.dev) | Unit and component testing |
| [Testing Library](https://testing-library.com) | React component tests |
| [Prettier](https://prettier.io) | Code formatting |
| [ESLint](https://eslint.org) | Linting |
| [pnpm](https://pnpm.io) | Package manager |

## Getting Started

To run locally install the dependencies and start the dev server.
```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the Vite dev server with hot module replacement |
| `pnpm build` | Type-check and build for production |
| `pnpm preview` | Preview the production build locally |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:run` | Run tests once |
| `pnpm test:coverage` | Run tests and generate a coverage report |
| `pnpm lint` | Lint with ESLint |
| `pnpm format` | Format all files with Prettier |
| `pnpm format:check` | Check formatting without writing changes |

