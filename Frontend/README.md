# Resync Frontend

Next.js marketing website for Resync.

## Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3020](http://localhost:3020).

**Requires the backend API running** on port 3001 for form submissions.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Content editing

Edit JSON files in `data/` — no component changes needed:

- `data/site.json` — site-wide info
- `data/team.json` — team members
- `data/products.json` — product cards
- `data/focus-areas.json` — focus areas

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `API_URL` | `http://localhost:3001` | Backend URL for API rewrites |

## Deploy to Vercel

1. Import the `Frontend` folder as a Next.js project
2. Set `API_URL` to your deployed backend URL
3. Deploy
