# PRD: MenuFlow

**Version:** 1.3
**Date:** October 22, 2025 (status reviewed after latest commit)
**Author:** Derek Brumby
**Stage:** MVP Definition — implementation status tracked via checkboxes

---

## 1. Product Overview

- [x] **Product Name:** MenuFlow
- [x] **One-Liner:** Accessible digital menu and board system backed by a shared manifest.
- [x] **Mission:** Deliver a fast, reliable guest experience while giving operators direct, low-friction control over menu data.

---

## 2. Target Users & Current Coverage

- [x] **Restaurant Owner / Operator** — Can edit pricing, availability, and visibility through the admin workspace with immediate persistence to the shared manifest.
- [x] **Manager / Staff** — Gains quick “86” buttons and inline price edits for shift-level adjustments.
- [ ] **Guest / Diner** — Reads responsive menu surfaces today; ordering flows are not yet implemented.
- [ ] **Multi-location Franchise Manager** — No governance or per-store override tooling yet.

---

## 3. Goals & Non-Goals (Execution Status)

### Goals
- [x] Deliver a **single source of truth** for menu data using a versioned JSON manifest validated by Zod and shared across web surfaces.
- [x] Enable **two-tap item edits** for price and availability via the admin Menu Manager (changes persisted on save and reflected on guest/board reload).
- [ ] Provide **offline resilience** — no service worker or offline cache yet.
- [ ] Achieve **WCAG 2.2 AA** verification — base components are semantic, but automated accessibility audits are not wired into CI.
- [ ] Offer **transparent cost and billing dashboards** — billing module is not started.
- [x] Build **diagnostic insights** directly into the admin app (live manifest version, sold-out summary, hidden item counts).
- [ ] Integrate **order validation** for reliability — not implemented.

### Non-Goals (Confirmed)
- [x] Full POS replacement remains out of scope for the current MVP.
- [x] Payment settlement or payroll features are explicitly excluded.
- [x] Loyalty and deep CRM capabilities remain a later-phase consideration.

---

## 4. Core Problems & Status

- [x] **Menu Management latency** — Resolved via shared manifest and admin tools.
- [ ] **Order errors / reconciliation** — No validator yet.
- [ ] **Third-party sync drift** — No external adapters yet.
- [x] **Support transparency** — Admin dashboard surfaces manifest health indicators, but chat/escalation tooling is pending.
- [ ] **Offline reliability** — Not yet solved; highlighted as gap.
- [ ] **Billing transparency** — Not implemented and tracked as future work.
- [x] **Accessibility** — Semantic components exist, but full WCAG automation pending.
- [x] **Guest UX** — Guest menu renders responsive content with nutrition data; ordering not available.
- [ ] **Multi-store control** — Governance tooling not built.

---

## 5. Product Features

### 5.1 Unified Menu Engine
- [x] Single JSON manifest stored at `data/menu.json` with schema enforcement via `MenuSchema`.
- [x] Manifest served through `/api/manifest` (Next.js) and `/manifest/latest` (Fastify backend) with version metadata.
- [x] Version number increments on every edit to support cache-busting.
- [ ] POS and delivery adapters (Toast, Square, etc.) — not yet implemented.
- [ ] Diff view / rollback UI — not yet implemented.

### 5.2 86 Workflow
- [x] Admin UI exposes quick buttons to mark an item sold out for 1 hour, rest of day, or clear the flag.
- [x] `PATCH /api/menu/items/[itemId]/availability` persists `soldOutUntil` timestamps in the manifest.
- [x] Guest and board surfaces display “Sold out” badges driven by manifest data.

### 5.3 Admin Menu Manager
- [x] Category groups with inline price update form and hide/show toggle per item.
- [x] Live status messaging for each mutation (saving, success, error) with optimistic feedback.
- [ ] Natural-language command palette — not yet implemented (replaced by structured controls for now).

### 5.4 Data Access & APIs
- [x] REST endpoints for reading the manifest and mutating items (price, visibility, sold-out state).
- [x] Shared SDK client (`packages/sdk/src/client.ts`) fetches `/api/manifest` with Zod validation.
- [ ] Streaming/SSE realtime updates — not implemented.

### 5.5 Diagnostics Snapshot
- [x] Admin dashboard shows manifest version, sold-out list, and hidden item counts calculated server-side.
- [x] `/api/status` reports manifest metrics and simple subsystem flags for external monitors.
- [ ] Device health, POS heartbeat, or log export features — not implemented.

### 5.6 Guest & Board Surfaces
- [x] Guest menu renders categories/items directly from the manifest (server component fetch).
- [x] Board view highlights featured items, respects availability, and surfaces sold-out notices.
- [ ] Offline caching, glare adaptation, and font scaling controls — not implemented.

### 5.7 Future Modules (Not Started)
- [ ] Offline-first service worker & IndexedDB queue.
- [ ] MenuSync channel registry and auto retry.
- [ ] Order & payment validator workflows.
- [ ] Transparent billing dashboard with anomaly detection.

---

## 6. Architecture & Tech Stack

- [x] **Frontend:** Next.js App Router (TypeScript/TSX) with server components for data reads.
- [x] **Admin UI:** Client component (`MenuManager`) using fetch-based mutations.
- [x] **Guest & Boards:** Server components reading the shared manifest; rely on manual refresh for updates.
- [x] **Backend:** Fastify server exposes manifest + 86 endpoints backed by the same JSON store.
- [ ] **Database:** Prisma schema exists but persistence currently uses JSON; migrating to SQLite/Postgres remains future work.
- [x] **Validation:** Zod schemas guard manifest payloads and API responses.
- [ ] **Realtime Layer:** Not yet wired (no Ably/Pusher implementation).
- [ ] **Storage/CDN:** Local JSON store only; S3/R2 integration pending.
- [x] **Testing:** Vitest unit tests cover UI components and menu-store mutations; Playwright smoke test runs.

---

## 7. Data Model Coverage

- [x] `Menu` — id, storeId, version, categories[], items[] persisted in JSON.
- [x] `Category` — id, name, order, daypartRules captured in manifest.
- [x] `MenuItem` — id, description, price, allergens, visibility, soldOutUntil supported.
- [ ] `IntegrationSource` — not implemented.
- [ ] `Order` — not implemented.
- [ ] `BillingRecord` — not implemented.
- [ ] `Log` — no structured log entity yet.

---

## 8. UX Design Principles (Adherence)

- [x] **Cognitive Simplicity:** Inline controls and quick buttons keep top tasks under ten seconds.
- [x] **Hospitality-first:** Guest menu emphasizes readability with generous spacing and typographic hierarchy.
- [x] **Legibility in context:** Board layout scales featured items for distance viewing.
- [ ] **Progressive disclosure:** Advanced workflows (billing, integrations) not yet layered in.
- [x] **Empathetic feedback:** Status messages on admin mutations communicate success or failure.

---

## 9. MVP Scope & Sprint Status

- [ ] **Sprint 1:** Auth, dashboard, menu CRUD, service worker cache — auth & offline cache pending; dashboard + CRUD shipped.
- [x] **Sprint 2:** 86 workflow and guest/board rendering — shipped via admin quick actions and shared manifest surfaces.
- [ ] **Sprint 3:** Diagnostics panel, billing dashboard, order validator — partial diagnostics only; billing and validator pending.

---

## 10. KPIs & Instrumentation

- [ ] **Menu edit latency < 10 s** — manual observation only; telemetry missing.
- [ ] **Offline resilience 8 h** — not measured (feature pending).
- [ ] **A11y score ≥ 95** — automated audits not configured.
- [ ] **Guest task success ≥ 95%** — no study yet.
- [ ] **Support resolution < 2 h** — no SLA tracking yet.
- [ ] **Operator satisfaction ≥ 9/10** — surveying not implemented.
- [ ] **Order/payment error reduction 80%** — validator not built.

---

## 11. Risks & Mitigations

- [ ] **External POS API changes** — adapters not yet abstracted; risk outstanding.
- [ ] **Hardware variability** — no dedicated board testing plan yet.
- [ ] **Offline conflicts** — no vector clock/merge logic implemented.
- [x] **Accessibility regression** — partially mitigated by semantic components; automate audits next.
- [ ] **Multi-store scaling** — JSON store only; migration path pending.

---

## 12. Future Roadmap

- [ ] POS write-back adapter for bidirectional sync.
- [ ] AI-powered copy/translation assistant.
- [ ] Menu photo scanner → structured data import.
- [ ] Predictive 86 alerts using stock signals.
- [ ] Kitchen display system integration.
- [ ] Loyalty / guest profile features.

---

## 13. Appendices

### A. Admin Mutation Endpoints
- [x] `PATCH /api/menu/items/{itemId}` — update price, visibility, description, calories, allergens.
- [x] `PATCH /api/menu/items/{itemId}/availability` — set or clear `soldOutUntil` timestamp.

### B. Sample Admin Actions (Command Palette Replacement)
- [x] “86 Maple Oat Latte for rest of day” → click `86 · Rest of day` next to the latte item.
- [x] “Set fries price to 4.99” → edit the price field and submit.
- [x] “Show holiday menu tomorrow” → toggle visibility off/on as needed (no scheduling yet).

### C. Environment Setup
- [x] `npm install`
- [x] Copy `.env.example` → `.env.local` if using external services (none required for JSON store).
- [x] `npm run dev` to launch Next.js app.
- [x] `npm run test` to execute Vitest suite.
- [x] `npm run e2e` to execute Playwright smoke test.

---

All unchecked boxes represent intentionally deferred work; no item remains undocumented or falsely implied as complete.
