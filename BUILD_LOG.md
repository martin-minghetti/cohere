# Cohere · Build Log

> Plataforma para profesionales que cobran membresías recurrentes vía Mercado Pago Subscriptions. Tracking honesto del tiempo de construcción.

## La métrica

**T-0** (inicio): 2026-05-05 14:52:47 ART
- Decisión "arrancamos demo #2 del kit portfolio AR" + naming "Cohere" + nicho yoga/pilates firmado.
- Marca el momento en que paramos de hablar y empezamos a producir.

**T-final**: pendiente (se cierra cuando el sitio esté live + tests passing + narrativa publicada).

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

## Stack

Next.js 16 + TS + Tailwind v4 + shadcn/ui + Drizzle + Supabase Postgres + MercadoPago Subscriptions + Resend + Vercel AI SDK (opcional) + Vitest + Playwright + Vercel.

## Para marketing posterior

Tres pruebas de tiempo real:
1. Este archivo (narrativa con timestamps).
2. `git log` del repo (commits con timestamps UTC inmutables).
3. Vercel deployments dashboard (timestamps de cada deploy).

Cualquiera puede verificar las 3.
