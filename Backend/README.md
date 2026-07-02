# Resync Backend API

Express API stubs for contact and apply forms.

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/contact` | Contact form submission |
| `POST` | `/api/apply` | Academy application submission |

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Runs on `http://localhost:3001` by default.

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Server port |
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowed origin |
| `CONTACT_WEBHOOK_URL` | — | Future webhook (not used in v1) |
| `APPLY_WEBHOOK_URL` | — | Future webhook (not used in v1) |

v1 logs submissions to the console and returns success responses.
