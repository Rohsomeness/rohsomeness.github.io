# rohsomeness.github.io

Interactive pixel-art personal site for **Rohit Das**.

Walk a bit-art character through a small campus: **Projects Lab**, **Music Studio**, **Story Corner**, and board a spacecraft to **rise through career planets**.

## Controls

| Input | Action |
|--------|--------|
| Arrow keys / WASD | Move |
| E / Space / Enter | Interact |
| H / ? | Help |
| Esc | Close panel |
| On-screen D-pad + A | Mobile |

## Develop

```bash
npm install
npm run dev
```

Open the local URL Vite prints (default `http://localhost:5173`).

```bash
npm run build   # output in dist/
npm run preview
```

## Content

Edit TypeScript modules under `src/content/`:

- `about.ts` — story + links
- `projects.ts` — project terminals
- `music.ts` — music stations
- `career.ts` — planets on the ascent (order `0` = earliest / lowest)

No rebuild of map code needed for copy changes — just edit and refresh.

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) builds on push to `main` or `rewrite` and deploys to **GitHub Pages**.

In the repo: **Settings → Pages → Source: GitHub Actions**.

Live site: https://rohsomeness.github.io

## Stack

- Phaser 3 + Vite + TypeScript
- Static hosting (no backend)
