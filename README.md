# Resync — Website Repository

Official repository for the **Resync** company website.

## Project structure

```
Resync/
├── Frontend/     # Next.js marketing site
├── Backend/      # Express API stubs (contact + apply forms)
└── WEBSITE_DEVELOPER_GUIDE.md
```

## Quick start

### 1. Backend API

```bash
cd Backend
npm install
npm run dev
# Runs on http://localhost:3001
```

### 2. Frontend website

```bash
cd Frontend
npm install
cp .env.local.example .env.local
npm run dev
# Open http://localhost:3020
```

The frontend proxies `/api/*` requests to the backend via Next.js rewrites.

## Editing content

All editable content lives in `Frontend/data/`:

| File | What to edit |
|---|---|
| `site.json` | Company name, email, phone, location, social links |
| `team.json` | Team member names, roles, bios, initials |
| `products.json` | Product cards (Academy, Research Pilots) |
| `focus-areas.json` | Focus area cards |

Replace placeholder images in `Frontend/public/images/` when assets are ready.

## Deployment

- **Frontend:** Deploy `Frontend/` to [Vercel](https://vercel.com) (set `API_URL` to your backend URL)
- **Backend:** Deploy `Backend/` to Railway, Render, or similar (set `FRONTEND_URL` to your frontend URL)

## Full specification

👉 **[WEBSITE_DEVELOPER_GUIDE.md](./WEBSITE_DEVELOPER_GUIDE.md)**

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Express, TypeScript |
| Icons | Lucide React |
