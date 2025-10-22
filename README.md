# MenuFlow

MenuFlow is an accessible, offline-first digital menu and operations suite for restaurants. This repository contains the
frontend, backend, and shared packages that deliver the guest menu, operator dashboard, and board experiences described in the
PRD.

## Getting Started

```bash
pnpm install
cp .env.example .env.local # fill environment variables
pnpm db:push
pnpm seed
pnpm dev
```

## Project Structure

- `app/` – Next.js App Router surfaces for guests, admins, and boards along with API routes.
- `backend/` – Fastify server modules, scripts, and tests for menu manifest management.
- `packages/` – Shared UI components, menu schemas, and SDK client utilities.
- `prisma/` – Database schema and migrations.
- `tests/` – Playwright end-to-end tests.
- `docs/` – Architecture notes and product requirements.

## Scripts

- `pnpm dev` – run the Next.js development server.
- `pnpm build` – build the frontend and run a backend build check.
- `pnpm typecheck` – run TypeScript type checks across the repo.
- `pnpm lint` – run Next.js lint rules.
- `pnpm test` – run Vitest unit tests.
- `pnpm e2e` – execute Playwright smoke tests.

## Accessibility & Offline

MenuFlow prioritizes WCAG 2.2 AA compliance with semantic headings, aria labeling, and color contrast. Offline resilience is
modeled through shared manifest data, ensuring surfaces degrade gracefully if real-time connectivity drops.
