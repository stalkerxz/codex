# PostFlow MVP

PostFlow is a local-first MVP for planning and auto-publishing social content. It ships as a Docker Compose stack with web, API, worker, Postgres, Redis, and MinIO. The MVP focuses on scheduling, cross-posting, and publish retries with a clean capability matrix and graceful degradation.

## Architecture (Step 1)

### System overview
- **Web (Next.js)**: App Router UI for login, dashboard calendar, composer, social accounts, media library, and post detail view.
- **API (Fastify)**: Auth, workspace RBAC, social account management, post & target CRUD, scheduling, calendar query, and media registration. Exposes Swagger docs at `/docs`.
- **Worker (BullMQ)**: Executes scheduled publish jobs, handles retries, writes publish attempts, and updates target status.
- **Postgres**: Source of truth for users, workspaces, posts, targets, and audit logs.
- **Redis**: BullMQ queue + delayed jobs for schedule timing.
- **MinIO**: S3-compatible media storage (bucket `postflow-media`).

### Request + publish flow
1. User creates a **Post** and adds one or more **PostTargets** (cross-posting).
2. Scheduling a target creates a **BullMQ job** keyed by `publish:<postTargetId>`.
3. Worker picks the job at `scheduledAt`, calls the platform adapter, and stores `externalPostId`.
4. Each attempt is recorded in `PublishAttempt` with STARTED → SUCCESS/FAILED.
5. After 3 failed attempts (exponential backoff), the target is marked `FAILED` and `lastError` is shown in UI.

### Data model summary
- **User** → **Workspace** (owner), **WorkspaceMember** (RBAC)
- **Workspace** → **SocialAccount**, **MediaAsset**, **Post**
- **Post** → **PostTarget** → **PublishAttempt**
- **AuditLog** stores create/update actions per workspace

### Platform adapters
- **Telegram**: Uses Bot API (`sendMessage`, `sendMediaGroup`) for text + media.
- **VK**: Uses `wall.post` for simple posts.
- **Instagram**: Stub adapter (returns Not Implemented) to keep the interface ready.

### Capability matrix & graceful degradation
Each platform exposes a capability matrix (text, images, polls, buttons, etc.). The UI shows the matrix and highlights unsupported features so users can adapt their content.

### Security & reliability
- AES-256-GCM encryption for platform credentials using `ENCRYPTION_KEY`.
- JWT access/refresh tokens, bcrypt password hashing.
- BullMQ retries (3 attempts, exponential delay).
- No infinite loops; idempotent publish job via `jobId`.

## Repository structure
```
apps/
  api/        # Fastify API + Prisma
  worker/     # BullMQ worker
  web/        # Next.js UI
packages/
  shared/     # Shared types, zod schemas, queue names
```

## Environment
Copy `.env.example` to `.env` and set secrets:
```
cp .env.example .env
```

## Run locally (Docker Compose)
```
docker compose up --build
```

API docs: http://localhost:4000/docs
Web: http://localhost:3000
MinIO console: http://localhost:9001

## Prisma
Run migrations when needed:
```
cd apps/api
pnpm prisma:migrate
```

## Tests
```
pnpm -r test
```

## Checklists

### Backend + worker
- [x] Auth, RBAC, social accounts, posts, targets
- [x] Scheduling + BullMQ jobs
- [x] Publish attempts, retries, and status updates

### Frontend
- [x] Core screens scaffolded (dashboard, composer, accounts, media, post details)
- [x] Capability matrix displayed with warnings for unsupported features

## What’s next
- Approval flow + content templates
- Analytics (engagement, clicks, reach)
- Team billing + usage limits
- Platform-specific enhancements (VK attachments, Telegram polls/buttons, Instagram API)
