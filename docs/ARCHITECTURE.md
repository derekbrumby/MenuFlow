# MenuFlow Architecture Snapshot

This repository contains a multi-surface MenuFlow prototype aligned with the PRD. It includes:

- **Next.js App Router** frontends under `app/` for guest, admin, and board experiences.
- **Fastify backend** (`backend/`) that exposes a manifest API and supports the 86 workflow.
- **Prisma ORM** schema (`prisma/schema.prisma`) describing menu, category, and item entities.
- **Shared packages** under `packages/` for UI components, strongly-typed menu schemas, and an SDK client.
- **Testing harness** using Vitest for unit tests and Playwright for end-to-end smoke coverage.

The code focuses on accessibility, offline readiness, and real-time propagation primitives described in the PRD.
