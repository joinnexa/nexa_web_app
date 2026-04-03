# Nexa Admin Dashboard

Ecosystem dashboard for **Nexa Pay**, **Nexa Go**, and **Nexa Stays**. Built with React, TypeScript, and Vite. Uses the **nexa_backend** API for live data; design follows the Nexa admin dashboard HTML prototype.

## Setup

```bash
cp .env.example .env
# Edit .env: set VITE_API_BASE_URL to your backend (e.g. http://localhost:3000/api/v1)
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001). Sign in with an admin account (e.g. `POST /auth/admin/login`).

## Environment

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Nexa backend base URL, e.g. `http://localhost:3000/api/v1` (no trailing slash) |

## API usage

- **Overview** — `GET /admin/dashboard/stats`, `GET /admin/stays/stats`, `GET /admin/transactions` (recent)
- **KYC** — `GET /admin/kyc/applications`, `POST /admin/kyc/:userId/approve`, `POST .../reject`
- **Transactions** — `GET /admin/transactions`
- **Fraud & Risk** — `GET /admin/risk/alerts`, `GET /admin/risk/stats`
- **Audit Logs** — `GET /admin/audit/logs`
- **Config** — `GET /admin/system/feature-flags`, `PATCH /admin/system/feature-flags/:key`
- **Stays** — `GET /admin/stays/stats`, `GET /admin/stays/bookings`, `GET /admin/stays/host-applications`, etc.
- **Users** — `GET /admin/users`
- **Wallets** — `GET /admin/wallets`
- **Pay dashboard** — `GET /admin/dashboard/stats`

Pages that still show placeholders or “No API yet” (Rides, Drivers, Delivery, Merchants, Pricing, Live Activity, Settlements summary, etc.) are documented in **docs/MISSING_APIS.md** with suggested endpoint specs for the backend.

## Build

```bash
npm run build
npm run preview   # preview production build
```

## Structure

- **Auth** — Login at `/login`, JWT stored in localStorage, `Authorization: Bearer` on all API requests
- **Sidebar** — Overview, Nexa Pay, Nexa Go, Nexa Stays, System; Sign out
- **Pages** — Real data where backend exists; placeholders and docs for missing APIs
- **Logos** — `public/logo/` (from Nexa logo pack)
