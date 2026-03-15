# Missing APIs for Nexa Admin Dashboard

This document lists backend APIs that the dashboard needs but are **not yet implemented** or **not exposed for admin**. Implement these in `nexa_backend` so the dashboard can remove hardcoded data.

**Base URL:** `{API_BASE}/api/v1`  
**Auth:** All admin endpoints require `Authorization: Bearer <JWT>` (from `POST /auth/admin/login`).

---

## 1. Ecosystem Overview (aggregate)

**Needed for:** Overview page — single place for Pay + Go + Stays KPIs.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/ecosystem/stats` or equivalent | GET | Aggregate stats: Pay (volume MTD, users, KYC pending, fraud count), Go (rides today, deliveries today, drivers online), Stays (bookings MTD, listings, hosts pending), plus API uptime / health. |

**Current workaround:** Dashboard calls:
- `GET /admin/dashboard/stats` (Pay-only stats),
- `GET /admin/stays/stats` (Stays),
- and has **no** Go stats (see §2).

**Suggested response shape:**
```json
{
  "pay": { "totalUsers", "verifiedUsers", "pendingKyc", "dailyVolume", "totalWallets", "flaggedTransactions", "dailyTransactions", "successRate", ... },
  "go": { "ridesToday", "deliveriesToday", "activeDrivers", "activeCouriers", "goRevenueMtd" },
  "stays": { "activeListings", "bookingsMtd", "hostsPending", "revenueMtd" },
  "systemStatus": { "api": "healthy", "database": "healthy" }
}
```

---

## 2. Nexa Go — Admin stats and lists

**Needed for:** Go Dashboard, Rides, Drivers, Delivery, Merchants, Pricing.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/go/stats` or `GET /go/admin/stats` | GET | Go-only stats: rides today, deliveries today, drivers online, couriers online, cancellation rate, revenue MTD. |
| `GET /admin/go/rides` | GET | List all rides (admin), with filters: `status`, `from`, `to`, `page`, `limit`. Returns ride id, passenger, driver, route, type, fare, status, created_at. |
| `GET /go/drivers` (admin) | GET | **Exists** but currently returns `{ data: [] }`. Backend must implement full list with pagination and optional `status` filter. |
| `GET /admin/go/delivery/orders` | GET | List all delivery orders (admin). Query: `status`, `page`, `limit`. Returns order id, customer, merchant, courier, type, eta, status. |
| `GET /admin/go/merchants` or reuse `GET /go/delivery/merchants` with ADMIN | GET | List all merchants (admin) with optional filters. |
| `GET /admin/go/pricing` or `GET /go/fares/...` (admin) | GET | Pricing rules: vehicle types, base fare, per km, per min, commission, min fare. |

**Current workaround:** Rides page: use `GET /go/rides` with admin JWT (returns list for admin); Drivers: show empty or mock; Delivery/Merchants/Pricing: hardcoded.

---

## 3. Live Activity / Event stream

**Needed for:** Overview “Live Activity” and “Live Activity” page — real-time or recent events across Pay, Go, Stays.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /admin/activity` or `GET /admin/events/recent` | GET | Recent events (last N minutes): ride completed, KYC approved, delivery picked up, booking confirmed, fraud alert. Query: `limit` (e.g. 50), optional `since` (ISO timestamp). |

**Suggested response shape:**
```json
{
  "events": [
    {
      "id": "uuid",
      "type": "ride_completed",
      "product": "go",
      "payload": { "rideId": "RD-9918", "amount": 42, "from": "Maârif", "to": "Morocco Mall" },
      "created_at": "2026-03-15T12:00:00Z"
    },
    { "type": "kyc_approved", "product": "pay", "payload": { "userId": "...", "userName": "Fatima Z." }, "created_at": "..." }
  ]
}
```

**Current workaround:** Hardcoded feed.

---

## 4. Nexa Pay — Config (limits and pricing)

**Needed for:** Config page — “Nexa Pay — Limits” and “Nexa Go — Pricing” sections.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /admin/system/pay-config` or extend `GET /admin/system/feature-flags` | GET | Pay config: daily send limit (unverified), daily send limit (KYC approved), QR expiry seconds. |
| `PATCH /admin/system/pay-config` | PATCH | Update Pay limits (body: limits and expiry). |
| `GET /admin/go/pricing` or `GET /go/fares` (admin) | GET | Go pricing: base fare, per km, per min, commission, min fare per vehicle type. |
| `PATCH /admin/go/pricing` | PATCH | Update Go pricing rules. |

**Current workaround:** Feature flags exist at `GET/PATCH /admin/system/feature-flags`. Pay limits and Go pricing are **hardcoded** in the UI; no backend config yet.

---

## 5. Settlements summary

**Needed for:** Settlements page — pending payouts, settled this week, recipients count.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /admin/finance/settlements-summary` | GET | Aggregate: `pendingPayoutsAmount`, `settledThisWeekAmount`, `recipientsCount`, `nextBatchDate`. |

**Current workaround:** Dashboard uses `GET /admin/finance/driver-payouts` and `GET /admin/finance/merchant-settlements`; no single “summary” endpoint. Frontend can aggregate from these if response shapes allow, or backend can add a summary.

---

## 6. Admin users (invite)

**Needed for:** Admin Users page — “+ Invite Admin” button.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /admin/users/invite` or `POST /admin/system/invite-admin` | POST | Invite new admin: body `{ "email": "...", "role": "ADMIN" }`. Sends invite email and/or creates pending account. |

**Current workaround:** Button does nothing; no backend.

---

## 7. Nexa Stays — Bookings list shape

**Existing:** `GET /admin/stays/bookings?status=&limit=&offset=`  
**Note:** Ensure response includes: `id`, `guest` (or user), `property`/listing, `dates`, `amount`, `status`, so the dashboard table can map fields without hardcoding.

---

## 8. Search (global)

**Optional:** Topbar “Search users, transactions, rides…” could call a single search endpoint.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /admin/search?q=...&limit=20` | GET | Global search: users (id, phone, name), transaction refs, ride ids. Returns grouped results: `users`, `transactions`, `rides`. |

**Current workaround:** Search is UI-only; no API.

---

## Summary table

| # | Area | Endpoint (suggested) | Priority | Status |
|---|------|----------------------|----------|--------|
| 1 | Ecosystem | GET /admin/ecosystem/stats | High | Done |
| 2 | Go | GET /admin/go/stats | High | Done |
| 2 | Go | GET /admin/go/rides (or clarify GET /go/rides for ADMIN) | High | Done |
| 2 | Go | Implement GET /go/drivers list for admin | High | Done |
| 2 | Go | GET /admin/go/delivery/orders | High | Done |
| 2 | Go | GET /admin/go/pricing + PATCH | Medium | Done (GET from config; PATCH returns message) |
| 3 | Activity | GET /admin/activity or /admin/events/recent | Medium | Done |
| 4 | Config | GET/PATCH Pay limits, GET/PATCH Go pricing | Medium | Done (pay-config in-memory; go pricing read-only) |
| 5 | Finance | GET /admin/finance/settlements-summary | Low | Done |
| 6 | Admins | POST /admin/users/invite (or similar) | Low | Done (stub) |
| 8 | Search | GET /admin/search | Low | Done |

---

*Generated for nexa_web_app; update this doc as backend adds endpoints.*
