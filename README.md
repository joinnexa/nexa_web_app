# Nexa Admin Dashboard

Ecosystem dashboard for **Nexa Pay**, **Nexa Go**, and **Nexa Stays**. Built with React, TypeScript, and Vite. Design and layout follow the Nexa admin dashboard HTML prototype; branding uses assets from the Nexa logo pack.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview   # preview production build
```

## Structure

- **Sidebar** — Overview, Nexa Pay, Nexa Go, Nexa Stays, System (admins, config, audit logs)
- **Pages** — Overview (stats, revenue chart, recent transactions, live activity), KYC Review, Rides, Fraud & Risk, Stays Dashboard, Config, Delivery, and all other sections from the design
- **Logos** — `public/logo/` (from `logo nexa .zip` general 300ppi assets)
