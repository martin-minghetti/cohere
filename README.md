# Cohere

Demo platform for professionals (yoga / pilates / coaching) charging monthly memberships via **Mercado Pago Subscriptions**. Portfolio piece — not a real business.

> **Demo #2 of the AR portfolio kit**. Demo #1 = [Norhaven Lodge](https://github.com/martin-minghetti/norhaven-lodge) (booking + Checkout Pro one-shot).

## Live

- 🌐 **Production**: https://cohere-six.vercel.app
- 📊 **BUILD_LOG**: [./BUILD_LOG.md](./BUILD_LOG.md) — honest tracking of build time

## Technical differential

Norhaven covers MP Checkout Pro (one-shot payments). Cohere shows **what Norhaven does not touch**:

- **Subscriptions API** (`/preapproval_plan` + `/preapproval`) — recurring monthly plans
- **Webhook handler** for `subscription_preapproval`, `subscription_authorized_payment`, and `payment` events (HMAC SHA256 + timestamp freshness + idempotency)
- **Customer portal** with real cancel / pause / resume actions
- **Pro dashboard** with active subscribers + monthly recurring revenue (MRR)
- **Multi-tenant** simulated (3 professionals with their own plans)

## Payment mode

Same dual flag as Norhaven (`PAYMENT_MODE`):

- `simulated` (default in public deploy): full flow simulated — DB is real but no MP calls. Anyone can try the UX without risk of a real charge.
- `production` (local or private preview only): real MP with test users. Used to validate the technical flow end-to-end.

**We do not run `production` on the public deploy** because that would expose visitors to actually paying for "yoga" that does not exist.

## Stack

Next.js 16 + TS + Tailwind v4 + shadcn/ui (Base UI · base-nova) + Drizzle ORM + **Neon Postgres** + MercadoPago Subscriptions + Resend + Vitest + Playwright + Vercel.

Difference vs Norhaven: Neon instead of Supabase. Cohere is keyword-forward for the CV.

## Live features

| Feature | Path | Notes |
|---------|------|-------|
| Home | `/` | 3 pros, lowest plan price each |
| Pro profile | `/p/[slug]` | Bio, plans, subscribe CTA |
| Subscribe form | `/p/[slug]/[planSlug]/suscribirme` | Server Action + Zod validation |
| Simulated checkout | `/sub/[id]/simulated-checkout?t=...` | HMAC-signed token, 30-min TTL |
| Customer portal | `/sub/[id]` | Cancel / pause / resume real state machine |
| Pro dashboard | `/p/[slug]/dashboard` | Active subscribers + MRR + table |
| MP webhook | `/api/webhooks/mp` | HMAC + ts freshness + idempotency for `preapproval` and `payment` events |

## Setup

```bash
cp .env.example .env.local
# Fill in values
npm install
npm run db:push
npm run db:seed
npm run dev
```

## Environment variables

See [`.env.example`](.env.example) for the full list. Minimum to run dev:

```env
# Neon Postgres
DATABASE_URL=postgresql://<user>:<pwd>@<host>/neondb?sslmode=require

# Payment mode
PAYMENT_MODE=simulated

# Subscription token (HMAC-signed simulated-checkout URL)
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
SUBSCRIPTION_TOKEN_SECRET=...

# MercadoPago — only if PAYMENT_MODE=production
MP_ACCESS_TOKEN=APP_USR-...
MP_WEBHOOK_SECRET=...

# Public site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Project structure

```
src/
├── app/
│   ├── page.tsx                                # Home (3 pros)
│   ├── layout.tsx                              # Inter + Fraunces fonts
│   ├── globals.css                             # Custom palette
│   ├── p/[slug]/
│   │   ├── page.tsx                            # Pro profile + plans
│   │   ├── dashboard/page.tsx                  # Pro dashboard
│   │   └── [planSlug]/suscribirme/
│   │       ├── page.tsx                        # Subscribe form
│   │       ├── subscribe-form.tsx              # Client component
│   │       └── actions.ts                      # submitSubscription server action
│   ├── sub/[id]/
│   │   ├── page.tsx                            # Customer portal
│   │   ├── actions.ts                          # pause / resume / cancel
│   │   └── simulated-checkout/
│   │       ├── page.tsx                        # Simulated authorization page
│   │       └── actions.ts                      # simulatePreapproval server action
│   └── api/webhooks/mp/route.ts                # MP webhook handler
├── components/
│   ├── site-header.tsx
│   ├── site-footer.tsx
│   └── ui/                                     # shadcn primitives
└── lib/
    ├── db/{schema,index,seed}.ts               # Drizzle
    ├── queries.ts                              # Server queries (pros, plans, subs, MRR)
    ├── subscriptions.ts                        # createSubscription + pause/resume/cancel
    ├── subscription-schema.ts                  # Zod input schema (no server-only)
    ├── subscription-token.ts                   # HMAC-signed simulated-checkout token
    ├── mp.ts                                   # MP clients + signature validator
    ├── format.ts                               # Pure formatters
    └── utils.ts
```

## Tests

```bash
npm test            # Vitest unit
npm run test:e2e    # Playwright E2E
```

- 26 unit tests (`format`, `subscription-token`, `subscription-schema`, MP HMAC + ts freshness)
- 1 E2E happy path: home → pro → plan → form → simulated authorize → portal active

## Notable technical decisions

- **`/preapproval_plan` over `/preapproval` directly**: MP Subscriptions requires a plan to exist before a subscription can be created. Calling `/preapproval` without a `preapproval_plan_id` (or a tokenized card) returns 500 with no useful message. Plans are created lazily on first subscription and cached per `plan` row.
- **HMAC-signed simulated-checkout URL**: `signSubscriptionToken(subId)` returns `<ts>.<hmac>` with a 30-minute TTL. Prevents IDOR — a UUID alone is not enough to trigger the simulated authorization flow.
- **Webhook timestamp freshness**: in addition to HMAC SHA256 + idempotency, the webhook rejects signatures whose `ts` is more than 5 minutes off, preventing replay attacks.
- **`subscription-schema.ts` extracted from `subscriptions.ts`**: keeps the Zod input schema testable in Vitest without dragging `server-only` and the Drizzle client into the test runner.
- **No public PostgREST / RLS**: Neon is plain Postgres without a public REST endpoint, unlike Supabase. The only way to read the DB is with `DATABASE_URL` (a Vercel secret), so RLS as defense-in-depth does not add value here. The threat model is different.

## Findings worth keeping

1. **Subscriptions endpoint**: the correct one is `/preapproval_plan`, not `/preapproval` directly. Documented in `BUILD_LOG.md`.
2. **MP account must be a "productive user"**: even for sandbox Subscriptions, MP requires you to complete the "Activar credenciales de producción" wizard in the developer panel. Without it, `preapproval_plan.create()` and `users/test_user` return 403/500 with no clear message.
3. **Neon vs Supabase RLS**: Neon has no public PostgREST, so RLS is not a defense-in-depth requirement; the threat surface is different.

## Database commands

```bash
npm run db:generate   # Generate migration from schema changes
npm run db:push       # Push schema to Neon
npm run db:studio     # Open Drizzle Studio
npm run db:seed       # Seed 3 pros + 7 plans
```

## Build journal

See [`BUILD_LOG.md`](BUILD_LOG.md) for the full timeline with immutable timestamps.

| Phase | Date | Active time | Output |
|-------|------|-------------|--------|
| Single session | 2026-05-05 | ~1h 54 min | Full demo end-to-end live in production, 27 tests passing, security headers configured |
