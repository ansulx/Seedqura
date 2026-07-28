# Seedqura Student Platform

Pay-first enrollment: apply → Razorpay → student account → admin management.

## Roles
- **student** — enrolls after payment; uses `/login` → `/student`
- **admin** — manages applicants/students at `/admin`
- No professor role

## Setup

### 1. Environment

**Backend** (`Backend/.env`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional on BE)
- `SUPABASE_SERVICE_ROLE_KEY` (server only — never expose to browser)
- `SUPABASE_DB_PASSWORD`
- `FRONTEND_URL` / `NEXT_PUBLIC_SITE_URL`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` (for `npm run db:migrate`)

**Frontend** (`Frontend/.env.local`):
- `API_URL=http://localhost:3001`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` (public checkout key only)

### 2. Database

```bash
cd Backend
npm install
npm run db:migrate
```

Applies `Backend/supabase/schema.sql`, seeds courses, ensures admin profile.

Default admin (change after first login):
- Email: `admin@seedqura.com`
- Password: `SeedquraAdmin@123`

### 3. Razorpay webhook

Point Razorpay dashboard webhook to:
`https://YOUR_API_HOST/api/payments/webhook`

Events: `payment.captured` (and optionally `payment.authorized`).

Until keys are set, applications still save; checkout shows a “gateway not configured” saved state.

### 4. Run

```bash
# Backend
cd Backend && npm run dev

# Frontend
cd Frontend && npm run dev
```

## Routes

| Path | Purpose |
|------|---------|
| `/apply?course=academy` | Apply + pay |
| `/login` | Student / admin sign-in |
| `/student` | Student enrollments |
| `/admin` | Applicants, payments, students |

## API (Backend)

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/apply` | Creates `payment_pending` application |
| POST | `/api/payments/order` | Creates Razorpay order |
| POST | `/api/payments/verify` | Client signature verify + provision |
| POST | `/api/payments/webhook` | Server webhook + provision |
| GET | `/api/student/me` | Bearer student session |
| GET/PATCH | `/api/admin/*` | Bearer admin session |

Account provisioning is **idempotent**: paid webhook/verify creates Auth user, profile, enrollment, sets application `active`, and sends a set-password email (recovery/invite).
