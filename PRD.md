# PRD: MenuFlow

**Version:** 1.2  
**Date:** October 22, 2025  
**Author:** Derek Brumby  
**Stage:** MVP Definition  

---

## 1. Product Overview

### Product Name
**MenuFlow**

### One-Liner
An **accessible, offline-first digital menu and order-management system** that empowers restaurants to update menus, handle 86s, and sync across boards, web, and delivery apps — all in real-time and without the friction of traditional POS tools.

### Mission
Reimagine digital restaurant menus and boards as **fast, reliable, guest-friendly experiences** that are just as elegant for operators as they are for diners. MenuFlow eliminates common POS and Toast pain points through a unified, resilient, and intuitive platform.

---

## 2. Target Users

| Role | Needs / Pain Points | Goals |
|------|---------------------|-------|
| **Restaurant Owner / Operator** | Slow menu updates, inconsistent sync across channels, unreliable POS, unclear billing | Streamlined, real-time control of menus, transparency, cost visibility |
| **Manager / Staff** | Tedious 86 workflows, crashes, support delays | Fast menu edits, live system feedback, simple device status view |
| **Guest / Diner** | Confusing QR menus, accessibility barriers, order errors | Seamless, readable menus and ordering experience |
| **Multi-location Franchise Manager** | No easy store-level overrides, compliance tracking | Central governance + local autonomy, built-in compliance monitoring |

---

## 3. Goals & Non-Goals

### Goals
- Deliver a **single source of truth** for all menu data (POS, online, board, print).
- Enable **two-tap item edits** (price, visibility, sold-out) that propagate instantly.
- Provide **offline resilience** across devices.
- Achieve **WCAG 2.2 AA** accessibility out-of-the-box.
- Offer **transparent cost and billing dashboards**.
- Build **diagnostics and support tooling** directly into the app.
- Integrate **payment/order validation** for guest ordering flow reliability.

### Non-Goals
- Full POS replacement (initially).  
- Handling payment settlement or payroll.  
- Deep CRM / loyalty features (phase 2).  

---

## 4. Core Problems (Pain Points to Solve)

| Category | Current Pain (Toast & Others) | MenuFlow Solution |
|-----------|------------------------------|-------------------|
| **Menu Management** | Multi-minute propagation; inconsistent between POS and boards | Instant sync engine (Pub/Sub + local cache) |
| **Order Errors** | Duplicate/failed payments, mismatched reports | Payment reconciliation + order validator |
| **Third-Party Sync** | Sold-out items still visible on delivery apps | API connectors w/ 86 propagation + sync dashboard |
| **Support** | Slow, opaque escalation | Embedded chat, diagnostic logs, SLA transparency |
| **Offline Reliability** | POS goes down = no menus or orders | Offline-first SW + IndexedDB queue |
| **Billing Transparency** | Unclear fees & overcharges | Billing analytics & anomaly alerts |
| **Accessibility** | Small text, glare, poor contrast | Dynamic type scaling, GlareSmart™ adaptive theme |
| **Guest UX** | QR fatigue, slow load, poor readability | Instant-load “Paper View” menus + a11y standards |
| **Multi-Store Control** | Hard to manage global vs local changes | Role-based override + audit log |

---

## 5. Product Features

### 5.1 Unified Menu Engine
- Single JSON schema for menu data (items, categories, nutrition, pricing).  
- Sync adapters for Toast, Square, Lightspeed, DoorDash, UberEats.  
- Real-time propagation via Pub/Sub.  
- Version history + diff-view rollback.

### 5.2 86 Workflow
- Two-tap flow: *Tap item → 86 for (duration)* → Confirm.  
- Broadcast instantly across: boards, kiosks, guest menus, 3rd party menus.  
- Badge displayed “Sold Out – Back Tomorrow”.

### 5.3 Admin Command Palette
- Natural language and shortcut-based edits:  
  `"Set fries $5.99"`, `"Hide pumpkin latte until Nov 1 8am"`.  
- Role-based: Owner / Manager / Staff permissions.

### 5.4 Offline-First Resilience
- Service Worker caching for menus, assets, fonts.  
- IndexedDB queue for local changes; reconciles automatically when back online.  
- Visual indicator: “Offline mode – last sync 5 min ago.”

### 5.5 MenuSync Engine
- Channel registry (in-store, web, delivery).  
- Health monitor: “3 channels in sync ✅  1 stale ⚠️”.  
- Automatic retry & webhook fallback.

### 5.6 Order & Payment Validator
- Track full order lifecycle (Auth → Kitchen → Serve).  
- Auto-detect double-charge or orphaned orders.  
- Trigger refund workflow + guest notification.

### 5.7 Diagnostics & Support Panel
- Device/network check, sync status, POS heartbeat.  
- “Generate Report” button for auto-attached logs.  
- Embedded chat (Intercom/Linear integration) + escalation tracker.

### 5.8 Transparent Billing Dashboard
- Breakdown: hardware, processing, software, add-ons.  
- Cost anomaly detection (e.g., > 20 % variance MoM).  
- Export to CSV / PDF.

### 5.9 Accessibility & Guest UX
- WCAG 2.2 AA by default.  
- Adjustable font sizes (120–200 %), high-contrast themes, alt text validation.  
- Auto language detection + toggle.  
- GlareSmart™: ambient light sensor → dynamic theme switch.  
- Paper View: static, readable layout for comfort browsing.  

### 5.10 Compliance Assistant
- Automatic calorie rendering (chains ≥ 20 locations).  
- Nutrition modal with printable sheet (FDA-ready).  
- Audit trail for compliance checks.

### 5.11 Analytics & Insights
- Menu engagement metrics (views, dwell time, conversions).  
- Operational metrics (edit latency, error counts, downtime).  
- Export / webhook to BI tools.

---

## 6. Technical Architecture

| Layer | Tech | Description |
|-------|------|-------------|
| **Frontend (Web + Admin)** | Next.js ( App Router , TSX ), React 18, Tailwind / CSS Modules | Responsive PWA for guest + staff |
| **Screen Player (TV/Kiosk)** | React app with service worker, SSE updates | Auto-updates / caches layout |
| **Backend** | NestJS / Fastify (Node.js), Prisma ORM | API + sync service |
| **Database** | SQLite (dev) → Postgres (prod) | Persistent menu data + audit logs |
| **Realtime Layer** | Ably / Pusher / Cloudflare PubSub | Live menu updates |
| **Storage** | S3 / R2 for images + CDN cache | Fast asset delivery |
| **Auth** | NextAuth + Prisma Adapter | Email/password login + OAuth optional |
| **Integrations** | Toast, Square, Lightspeed, Doordash API adapters | Sync POS ↔ MenuFlow |
| **Testing** | Vitest, Playwright, axe-core CI | Unit + E2E + a11y coverage |
| **Deployment** | Vercel / Fly.io / AWS Fargate | Global edge delivery |

---

## 7. Data Model (Simplified)

| Entity | Key Fields | Notes |
|---------|-------------|-------|
| `MenuItem` | id, storeId, name, desc, price, calories, allergens[], visible, soldOutUntil | Core menu object |
| `Category` | id, name, order, daypartRules | Group of menu items |
| `IntegrationSource` | id, type, apiKey, mapping, lastSync | External POS/3rd-party |
| `Order` | id, status, amount, paymentStatus, source | Used for validator |
| `BillingRecord` | id, storeId, feeType, amount, timestamp | Transparency module |
| `Log` | id, type, details, timestamp | Diagnostic + audit events |

---

## 8. UX Design Principles

1. **Cognitive Simplicity** — staff can perform the top 3 tasks (edit item, 86, price change) in < 10 seconds.  
2. **Hospitality-first** — menus feel inviting, not transactional.  
3. **Legibility in context** — readable from 3 meters on boards; 1-hand on phones.  
4. **Progressive disclosure** — advanced features hidden behind simple primary flows.  
5. **Empathetic feedback** — clear success/failure states w/ undo option.

---

## 9. MVP Scope (3 Sprints)

| Sprint | Deliverables | Success Criteria |
|---------|---------------|------------------|
| **Sprint 1** | Auth + Admin dashboard, Menu CRUD, Service Worker cache | Edit → propagate < 10 s |
| **Sprint 2** | 86 workflow, POS adapter (CSV import), Offline mode, Paper View | Menu renders offline for 8 h |
| **Sprint 3** | Diagnostics panel, Billing dashboard, Accessibility CI, Order validator | ≥ 95 a11y score in axe-core CI |

---

## 10. KPIs & Success Metrics

| Metric | Target |
|---------|---------|
| Menu edit latency | < 10 s propagation |
| Offline resilience | 8 h cached menu availability |
| A11y score | ≥ 95 axe-core |
| Guest task success (find item) | ≥ 95 % |
| Support resolution time | < 2 h avg |
| Operator satisfaction | 9 / 10 post-beta |
| Error reduction (orders/payments) | 80 % vs. baseline |

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|---------|------------|
| API changes from Toast / Square | Medium | Adapter abstraction + version pinning |
| Hardware variability (TV models, kiosk devices) | Medium | Responsive React player + CSS grid fallback |
| Offline conflicts (data sync) | High | Vector clock / last-write-wins + manual merge UI |
| Accessibility regression | Medium | Automated axe-core tests in CI |
| Multi-store data scaling | Low / future | Migrate SQLite → Postgres + read replicas |

---

## 12. Future Roadmap (Post-MVP)

- POS write-back adapter (bidirectional sync).  
- AI-powered menu copy / translation assistant.  
- Menu photo scanner → auto structured data import.  
- Predictive 86 alerts (stock forecasting).  
- KDS (kitchen display) integration.  
- Loyalty / guest profile features.  

---

## 13. References

- Toast user community threads on support & order failures (2024–2025).  
- Reddit r/restaurantowners and r/ToastPOS feedback.  
- BBB complaints data for Toast Inc.  
- FDA menu labeling guidelines (21 CFR 101.11).  
- WCAG 2.2 AA requirements.  

---

## 14. Appendices

### A. Example Command Palette Commands
```

"86 pancakes for today"
"set burger price to 8.99"
"show breakfast until 10:59am"
"hide holiday menu"
"print nutrition sheet for store 005"

```

### B. Sample Environment Configuration
```

DB_URL=postgres://...
POS_ADAPTER=square
EDGE_PUBSUB=ably
AUTH_PROVIDER=email
SUPPORT_WEBHOOK=linear

```

---

**End of Document**

---

Would you like me to follow up with a **technical-architecture diagram** (e.g., Mermaid or PlantUML) to visually map data flow between modules — admin ↔ API ↔ board ↔ POS ↔ third-party apps?
It would make this PRD complete for engineering kickoff.
