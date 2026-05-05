# Cohere · Build Log

> Plataforma para profesionales que cobran membresías recurrentes vía Mercado Pago Subscriptions. Tracking honesto del tiempo de construcción.

## La métrica

**T-0** (inicio): 2026-05-05 14:52:47 ART
- Decisión "arrancamos demo #2 del kit portfolio AR" + naming "Cohere" + nicho yoga/pilates firmado.
- Marca el momento en que paramos de hablar y empezamos a producir.

**T-final**: 2026-05-05 16:46:20 ART
- Sitio live en https://cohere-six.vercel.app, end-to-end funcionando, tests Vitest + Playwright passing, security headers configurados.

**Total wall-clock activo**: ~1h 54 min

## Reglas

- Tiempo **wall-clock activo**. Pausas largas (>15 min sin tocar el proyecto) no cuentan.
- Múltiples sesiones se suman.
- Source of truth: este archivo + git log (timestamps inmutables) + Vercel deployments.

## Antecedentes (para narrativa marketing)

Demo #1 del kit (Norhaven Lodge — booking de cabañas con Checkout Pro one-shot): cerrado en **2h 33 min** + security hardening en **40 min** = 3h 13 min total. Repo: https://github.com/martin-minghetti/norhaven-lodge

Diferencial técnico de Cohere vs Norhaven:
- Subscriptions API (`/preapproval_plan`) en lugar de Checkout Pro
- Recurrencia mensual real con webhooks de eventos `subscription_*`
- Customer portal (cancel/pause/resume)
- Dashboard pro con métricas
- Multi-tenant (3 profes con sus propios planes en una sola plataforma)

## Hallazgo previo al T-0 (vale anotar para honestidad técnica)

Probe de MP API antes de arrancar:
- `/preapproval` directo devuelve 500 sin `preapproval_plan_id` previo
- `/preapproval_plan` (planes recurrentes) es el endpoint correcto
- Requiere cuenta MP en estado "productive" (no solo developer registrado)
- Se destrabó completando "Activar credenciales de producción" en panel MP Developers

Endpoint correcto del flow: Plataforma crea **plan** → cliente va a `init_point` → autoriza con su cuenta MP → MP genera suscripción individual y empieza a cobrar mensual → webhooks llegan a la app.

## Hitos

| Timestamp | Hito | Tiempo desde T-0 |
|-----------|------|------------------|
| 14:52:47 | T-0 · arranque (decisión + naming + nicho firmados) | 0:00 |
| 15:08 | Scaffold Next 16 + deps Norhaven + GitHub repo público + BUILD_LOG + README | +15 |
| 15:25 | Drizzle schema (4 tablas) + migration generada + seed con 3 profes (Ana yoga, Lucía pilates, Tomás yoga online) | +32 |
| 15:32 | Vercel project linkeado + Neon (gru1, free) provisioned + DATABASE_URL pulled | +39 |
| 15:38 | Schema aplicado a Neon + seed corrido (3 profes, 7 planes) | +45 |
| 15:55 | Home + pro detail + subscribe form + queries + layout (Inter/Fraunces) | +62 |
| 16:18 | MP Subscriptions: createSubscription (simulated/production flag) + signSubscriptionToken (HMAC) + simulated checkout + customer portal (active/pause/resume/cancel) | +85 |
| 16:30 | Webhook handler /api/webhooks/mp (HMAC + ts freshness + idempotencia) + Pro dashboard con subscribers + MRR + tabla | +98 |
| 16:42 | Vitest 26 unit tests passing (format, mp signature, subscription-token, schema) + Playwright E2E happy path passing con cleanup DB | +110 |
| 16:46 | Deploy prod a Vercel + security headers (X-Frame, X-Content, Referrer, Permissions, HSTS) verificados | +113 |
| **16:46:20** | **🏁 T-FINAL · proyecto cerrado** | **+1h 54 min total** |

## Stack

Next.js 16 + TS + Tailwind v4 + shadcn/ui (Base UI · base-nova) + Drizzle ORM + **Neon Postgres** + MercadoPago Subscriptions + Resend + Vitest + Playwright + Vercel.

Diferencia con Norhaven: Neon en lugar de Supabase. Cohere keyword-forward para CV.

## Resumen entrega

- **8 rutas live**:
  - `/` — home con 3 profes
  - `/p/[slug]` — perfil del profe + planes
  - `/p/[slug]/[planSlug]/suscribirme` — form de suscripción
  - `/sub/[id]` — customer portal (active/pause/resume/cancel)
  - `/sub/[id]/simulated-checkout?t=...` — autorización simulada (HMAC TTL 30min)
  - `/p/[slug]/dashboard` — dashboard del profe (subscribers + MRR + tabla)
  - `/api/webhooks/mp` — webhook handler MP (HMAC + ts freshness + idempotencia)
- **27 tests passing**: 26 unit (Vitest) + 1 E2E (Playwright happy path)
- **Security headers** habilitados desde día 1
- **PAYMENT_MODE=simulated** en deploy público; switch a `production` solo local con test users MP

## Hallazgos técnicos para narrativa

1. **Endpoint correcto Subscriptions**: `/preapproval_plan` (planes), no `/preapproval` directo. La instancia individual (`preapproval`) requiere un `preapproval_plan_id` previo o `card_token_id`. MP devuelve 500 sin contexto si te pasás del orden.

2. **Cuenta MP debe ser "productive user"**: incluso para usar Subscriptions en sandbox, MP exige completar el flow "Activar credenciales de producción" en el panel Developers. Sin eso `preapproval_plan.create()` y `users/test_user` devuelven 403/500 sin mensaje claro.

3. **RLS en Neon**: a diferencia de Supabase (que expone PostgREST público con anon key), Neon es Postgres puro sin endpoint REST público por default. Defense-in-depth de RLS no aplica acá porque no hay superficie de ataque equivalente; la única forma de leer la DB es con `DATABASE_URL` (secret en Vercel).

## Para marketing posterior

Tres pruebas de tiempo real:
1. Este archivo (narrativa con timestamps).
2. `git log` del repo (commits con timestamps UTC inmutables).
3. Vercel deployments dashboard (timestamps de cada deploy).

Cualquiera puede verificar las 3.

## Para marketing posterior

Tres pruebas de tiempo real:
1. Este archivo (narrativa con timestamps).
2. `git log` del repo (commits con timestamps UTC inmutables).
3. Vercel deployments dashboard (timestamps de cada deploy).

Cualquiera puede verificar las 3.
