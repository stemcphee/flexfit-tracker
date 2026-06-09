# FlexFit Tracker

FlexFit Tracker is a personal workout tracker MVP built with Next.js, TypeScript, and Tailwind CSS.

It is designed for a single user and stores all data locally in the browser with `localStorage`.

## Features

- Flexible Push / Pull / Legs / Upper / Lower workout tracking
- Steps tracking with a 10,000-step goal
- Football session logging
- Lift progression suggestions based on previous performance
- Equipment-aware workout templates
- Rest timer during workouts
- PWA-ready install flow

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production build

```bash
npm run build
```

This project is configured for static export and generates deployable output in `out/`.

## Cloudflare Pages

Recommended build settings:

- Framework preset: `Next.js (Static HTML Export)`
- Build command: `npx next build`
- Build output directory: `out`
