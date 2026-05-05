# Cohere

Plataforma demo para profesionales (yoga / pilates / coaching) que cobran membresías mensuales vía **Mercado Pago Subscriptions**. Portfolio piece — no es un negocio real.

> **Demo #2 del kit portfolio AR**. Demo #1 = [Norhaven Lodge](https://github.com/martin-minghetti/norhaven-lodge) (booking + Checkout Pro one-shot).

## Live

- 🌐 **Producción**: https://cohere-six.vercel.app
- 📊 **BUILD_LOG**: [./BUILD_LOG.md](./BUILD_LOG.md) — tracking honesto del tiempo de construcción

## Diferencial técnico

Norhaven cubre Checkout Pro de MP (pagos one-shot). Cohere muestra **lo que Norhaven no toca**:

- **Subscriptions API** (`/preapproval_plan`) — planes recurrentes mensuales
- **Webhook handler** para eventos `subscription_preapproval`, `subscription_authorized_payment`, `payment` (HMAC SHA256 + idempotencia)
- **Customer portal** real con cancel / pause / resume
- **Dashboard del pro** con subscribers activos + revenue mensual
- **Multi-tenant** simulado (3 profesionales con sus propios planes)

## Modo de pago

Igual que Norhaven, flag dual `PAYMENT_MODE`:

- `simulated` (default en prod público): flow completo simulado — DB-real pero sin tocar MP. Cualquiera puede probar la UX sin riesgo de pago real.
- `production` (solo local o preview privada): MP real con test users. Para validar el flow técnico end-to-end.

**No corremos `production` en deploy público** porque sería abrir la puerta a que un visitor pague plata real por "yoga" que no existe.

## Stack

Next.js 16 + TS + Tailwind v4 + shadcn/ui + Drizzle + Supabase Postgres + MercadoPago Subscriptions + Resend + Vitest + Playwright + Vercel.

## Setup

```bash
cp .env.example .env.local
# completar valores
npm install
npm run db:push
npm run db:seed
npm run dev
```

## Tests

```bash
npm test            # Vitest unit
npm run test:e2e    # Playwright E2E
```
