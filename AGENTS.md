# AGENTS.md — Agent Playbook for MenuFlow

**Purpose**  
This document tells AI coding agents exactly how to plan, implement, test, and ship features for **MenuFlow** (see `PRD.md`). It standardizes prompts, repo structure, coding rules, and CI gates so multi-agent work remains deterministic and safe.

---

## 0) Agent Contracts

### 0.1 Roles
- **PlannerAgent** — reads PRD, creates design + task plan, writes issue/PR scaffolds.
- **ImplementorAgent** — writes TypeScript/TSX, Prisma schema/migrations, tests, and docs.
- **FixerAgent** — runs linters/tests, rewrites to pass CI, hardens a11y/perf.
- **ReviewerAgent** — verifies acceptance criteria, security, a11y, and architecture.
- **IntegratorAgent** — wires POS adapters, env, and deployment manifests.

### 0.2 Success Criteria (must all pass)
- `npm run typecheck && npm run lint && npm run test && npm run e2e`
- Playwright a11y checks: **axe violations = 0** (critical/serious).
- Propagation SLA: edit → board/guest **<10s** in local/dev.
- Offline board shows cached menu **≥8h** (simulated).
- WCAG 2.2 AA: color contrast, focus order, landmarks validated.
- No secrets in repo. Env variables only via `.env.local`.

---

## 1) Tech Stack & Boundaries

- **Frontend:** Next.js (App Router, **TypeScript/TSX**), CSS Modules (Tailwind optional).
- **Screen Player:** React + Service Worker (SSE for updates, IndexedDB cache).
- **Backend:** Node.js (NestJS or Fastify), Prisma ORM.
- **DB:** SQLite (dev) → Postgres (prod).
- **Auth:** NextAuth (Auth.js) + Prisma adapter.
- **Realtime:** Ably/Pusher/Cloudflare PubSub (abstracted behind `RealtimeBus`).
- **Storage/CDN:** S3/R2.
- **Tests:** Vitest + Playwright + axe-core.
- **OpenAI:** Responses API + Agents SDK (tool calling for code, file ops, evals).

> **Non-goals:** replacing POS; loyalty/CRM; payments settlement. See PRD.

---

## 2) Repo Layout (create if missing)

```

/app
/guest           # guest menu (paper view + filters + nutrition modal)
/admin           # admin dashboard + command palette + diagnostics
/boards          # TV/kiosk player (SSR-safe shell + SW registration)
/api               # Next.js route handlers (thin edges) or proxy to backend

/backend
/src
/modules         # menu, items, sync, orders, billing, diagnostics
/adapters        # toast, square, lightspeed, doordash, ubereats
/realtime        # pubsub impl (Ably/Pusher/CF)
/workers         # jobs (sync, pdf, anomaly detection)
/tests
/prisma
schema.prisma
/migrations

/packages
/ui                # shared UI comps
/types             # shared zod/ts types (MenuItem, BoardManifest, Events)
/sdk               # client for MenuFlow API & realtime

/.github/workflows   # ci.yml
/scripts             # dev scripts (seed, fixtures, load-tests)
/docs                # PRD.md, ARCHITECTURE.md, AGENTS.md, API.md

```

**ImplementorAgent:** if files are missing, scaffold them with minimal compilable stubs.

---

## 3) Environment & Commands

### 3.1 Required env
Create `.env.local` (never commit):
```

# DB

DATABASE_URL="file:./dev.db"          # dev

# AUTH

NEXTAUTH_URL=[http://localhost:3000](http://localhost:3000)
NEXTAUTH_SECRET=CHANGEME

# REALTIME

REALTIME_PROVIDER=ably|pusher|cf
REALTIME_KEY=...

# STORAGE

ASSETS_BUCKET=s3://menuflow-dev
ASSETS_CDN_BASE=[https://cdn.example.com](https://cdn.example.com)

# OPENAI (for internal eval tools, not guest UI)

OPENAI_API_KEY=sk-...

# INTEGRATIONS (adapters can be no-op in dev)

SQUARE_TOKEN=...
TOAST_TOKEN=...

````

### 3.2 NPM scripts (add to root)
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build && tsx backend/scripts/build.ts",
    "start": "next start",
    "typecheck": "tsc -b --pretty false",
    "lint": "eslint . --max-warnings=0",
    "test": "vitest run",
    "e2e": "playwright test",
    "a11y": "playwright test --project=a11y",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "seed": "tsx scripts/seed.ts"
  }
}
````

---

## 4) Coding Rules

* **Type safety first**: no `any`, use `zod` schemas between layers.
* **Server Components** for guest reads; Client Components only where needed.
* **CSS Modules** with logical tokens; ensure min font sizes on boards.
* **No unverifiable magic**: every “smart” behavior has explicit tests.
* **Accessibility is a gate**, not a polish task.
* **Security**: paramized queries (Prisma), strict CSP for board/guest, no PII in analytics.

---

## 5) Feature Blueprints (what to build, how to test)

### 5.1 Unified Menu Engine

* **Goal:** Single source of truth for items, categories, nutrition, pricing.
* **Artifacts**

  * `packages/types/menu.ts`: `MenuItem`, `Category`, `Nutrition`, `Badge`, `BoardManifest`.
  * `backend/src/modules/menu/*`: CRUD, versioning, diff/rollback.
  * `backend/src/modules/sync/*`: outbound sync publisher (events: `item.updated`, `item.soldout`, `category.updated`).
* **Acceptance**

  * CRUD ops reflected on guest and board within **10s** (local).
  * `GET /manifest/:storeId` deterministic and cacheable.
  * Version rollback updates all surfaces.

### 5.2 86 Workflow (Two-tap)

* **Goal:** Fast remove with auto-expiry.
* **Artifacts**

  * `app/admin/items/[id]/actions.tsx` — surface actions.
  * `backend/modules/menu/availability.service.ts` — `soldOutUntil`.
  * `realtime` event: `item.availability.changed`.
* **Tests**

  * E2E: mark sold out → board badge “Sold Out – Back Tomorrow”.
  * Conflict: offline admin marks sold out, later merge = **last-write wins** with audit.

### 5.3 Command Palette

* **Goal:** Natural-language edits with guardrails.
* **Artifacts**

  * `app/admin/command-palette/*`
  * Parser: `packages/sdk/commands.ts` (`zod` parse → intent object).
* **Tests**

  * Unit: `"set fries $5.99"` → `{type:'price.update', item:'fries', value:5.99}`.
  * E2E: command executes, audit log appended, manifest updated.

### 5.4 Offline-First Boards

* **Goal:** Board renders while WAN is down; reconcile later.
* **Artifacts**

  * SW: `app/boards/sw.ts` (cache manifest, fonts, images).
  * IndexedDB via Dexie: `lastManifest`, `assets`.
  * SSE client: `packages/sdk/realtime.ts`.
* **Tests**

  * Simulate offline: board still renders.
  * Clock travel **8h**: cache valid; stale banner appears after TTL.
  * When online resumes: delta apply → UI update without reload.

### 5.5 MenuSync Engine (Multi-channel)

* **Goal:** Keep POS + 3rd parties consistent.
* **Artifacts**

  * `backend/adapters/{square,toast,lightspeed}.ts` (read-only MVP).
  * `backend/adapters/3p/{doordash,ubereats}.ts`.
  * Sync dashboard: `app/admin/sync`.
* **Tests**

  * Unit mock adapters; E2E “stale channel” health turns ✅ after push.

### 5.6 Order & Payment Validator

* **Goal:** Detect duplicate charges / orphaned orders; initiate refunds workflow (stub).
* **Artifacts**

  * `backend/modules/orders/validator.service.ts`.
  * `backend/modules/orders/events.ts` (state machine: `auth→ack→kds→served`).
* **Tests**

  * Simulate `auth` without `ack` for N seconds ⇒ alert + guest-safe message.

### 5.7 Diagnostics & Support Panel

* **Goal:** Self-serve triage + structured logs.
* **Artifacts**

  * `app/admin/diagnostics` (network, device, adapter, SW, SSE).
  * “Generate Report” (zips logs, redacts secrets).
* **Tests**

  * Offline, POS 500, adapter lag ⇒ surfaces clear statuses.

### 5.8 Billing Transparency

* **Goal:** Clear fee breakdowns + anomaly alerts.
* **Artifacts**

  * `backend/modules/billing/*`
  * Jobs: monthly rollups; spike detection.
* **Tests**

  * MoM +20% variance triggers alert card and webhook.

### 5.9 A11y + Compliance

* **Goal:** WCAG 2.2 AA; FDA calorie lines for covered chains.
* **Artifacts**

  * `app/guest/*`—semantic landmarks; font scaling; high-contrast theme.
  * Nutrition modal + print sheet.
* **Tests**

  * Playwright + axe: **0 critical/serious**.
  * Keyboard path coverage (tab order, skip links).

---

## 6) Database & Prisma

### 6.1 Schema (excerpt)

```prisma
model MenuItem {
  id            String   @id @default(cuid())
  storeId       String
  name          String
  description   String?
  price         Decimal  @db.Decimal(10,2)
  calories      Int?
  allergens     String[]
  badges        String[]
  image         String?
  visible       Boolean  @default(true)
  soldOutUntil  DateTime?
  createdAt     DateTime @default(now())
  modifiedAt    DateTime @updatedAt
}

model Category {
  id        String   @id @default(cuid())
  name      String
  order     Int       @default(0)
  daypart   Json?
  storeId   String
  items     MenuItem[]
}
```

### 6.2 Migrations

* Dev: `npm run db:migrate` (SQLite).
* Prod: Postgres with `prisma migrate deploy`.

---

## 7) Auth (NextAuth / Auth.js)

* Credentials (email+password) for staff; provider slots pluggable.
* Prisma adapter tables generated by `npx prisma migrate dev`.
* Route handlers live under `app/api/auth/[...nextauth]/route.ts`.

**Security**: session strategy = JWT; set `NEXTAUTH_SECRET`; restrict admin routes via server actions.

---

## 8) Realtime Updates

* Publish `ManifestChanged`, `ItemAvailabilityChanged`, `CategoryChanged`.
* Board subscribes via SSE; guest pages use streaming/React RSC revalidate tags.
* If Pub/Sub unavailable, fall back to **long-poll** on `/manifest?since=...`.

---

## 9) QA & CI Gates

**CI (`.github/workflows/ci.yml`)**

1. Install, `db:push`, `seed`.
2. `typecheck`, `lint`, `test`.
3. `a11y` (Playwright + axe) against `/ guest`, `/boards`, `/admin`.
4. Bundle-size budget for board (ensure fast boot).

**Artifacts**

* HTML a11y report, coverage, Lighthouse (boards & guest).

---

## 10) Agent Workflows

### 10.1 Planning Prompt (PlannerAgent)

```
System: You are PlannerAgent for MenuFlow. Read /docs/PRD.md and /docs/API.md if present.
User: Produce a step-by-step plan for the requested feature with:
- file diffs to create/modify
- API contracts (zod)
- DB changes (prisma)
- tests (vitest + playwright)
- acceptance criteria mapped to tests
Return: a single Markdown plan with checkboxes.
```

### 10.2 Implementation Prompt (ImplementorAgent)

```
System: You are ImplementorAgent coding in TS/TSX.
User: Implement the plan. Respect repo layout, coding rules, and CI gates.
- Write minimal compilable code first, then tests.
- Prefer server components for reads; keep client code lean.
- Update docs when public API changes.
Return: patchset (unified diffs) + new files in full.
```

### 10.3 Fix/Hardening Prompt (FixerAgent)

```
System: You enforce CI & a11y. Do not change behavior without tests.
User: Make the code pass typecheck, lint, unit, e2e, and axe. Minimize diff. 
Return: concise diff + summary of fixes.
```

### 10.4 Review Prompt (ReviewerAgent)

```
System: You gatekeep architecture, security, and a11y.
User: Check acceptance, threat model (XSS/CSP), secrets handling, perf, and 
consistency with PRD.md. List pass/fail with exact file-line refs.
```

---

## 11) Guardrails

* **No credentials** in code or logs. Redact with `****`.
* **No training data leakage** to third parties. Use OpenAI only for internal evals; do not call models from guest UI.
* **Accessibility first**: if a11y fails, block merge.
* **Data minimization**: log IDs and timings, not PII.
* **Idempotence** for menu updates; retries must not duplicate events.
* **Print/PDF generation** must sandbox HTML (no untrusted input).

---

## 12) Manual Runbook (local)

```bash
# 1) Install
pnpm i

# 2) Env
cp .env.example .env.local  # fill in values

# 3) DB
pnpm db:push && pnpm seed

# 4) Dev
pnpm dev  # http://localhost:3000

# 5) Boards
# Open http://localhost:3000/boards?store=demo and toggle offline (DevTools)
```

---

## 13) Definition of Done (per feature)

* Tests exist and pass (unit + E2E + axe).
* Docs updated (`/docs/API.md` if API changes; `/docs/CHANGELOG.md`).
* Telemetry added (time-to-propagate, error counters).
* Rollback path verified (menu version restore).
* Sync dashboard shows all channels in-sync.

---

## 14) References (for agents)

* OpenAI **Responses API** (agentic tool use): [https://platform.openai.com/docs/api-reference/responses](https://platform.openai.com/docs/api-reference/responses)
* Agents & builder overview: [https://openai.com/index/new-tools-for-building-agents/](https://openai.com/index/new-tools-for-building-agents/)
* Building agents track: [https://developers.openai.com/tracks/building-agents/](https://developers.openai.com/tracks/building-agents/)
* Next.js (App Router): [https://nextjs.org/docs/app](https://nextjs.org/docs/app)
* Prisma ORM: [https://www.prisma.io/docs](https://www.prisma.io/docs)
* Auth.js / NextAuth Prisma adapter: [https://authjs.dev/getting-started/adapters/prisma](https://authjs.dev/getting-started/adapters/prisma)
