# UNSAID

UNSAID is a responsive anonymous social space for honest expressions, replies,
open letters, and messages sealed for the future. It uses one KISS full-stack
Next.js application: the App Router renders the interface and Route Handlers
provide the backend.

## Stack

- Next.js 16, React 19, and TypeScript
- Tailwind CSS v4 and reusable design-system components
- MongoDB Atlas with Mongoose connection pooling
- Zod 4 request, query, parameter, environment, and response contracts
- Google OAuth with revocable database-backed sessions

## Included

- Anonymous feed with cursor pagination and mood/topic filters
- Posts, public/private replies, and idempotent echo reactions
- Google-authenticated accounts with rotating public aliases
- Open letters that never expose recipient email in public responses
- Private, public, and collective time capsules
- Report and block foundations for moderation
- Responsive desktop, tablet, and mobile UI based on the Figma design system

## Architecture

```text
src/
├── app/
│   └── api/             # Thin Next.js Route Handlers
├── components/
│   ├── layout/
│   ├── shared/
│   └── ui/              # Global Button, Alert, Card, Dialog, and form controls
├── contracts/           # Shared Zod request and response contracts
├── features/            # Client feature modules and contexts
├── server/
│   ├── auth/            # Session lifecycle
│   ├── db/              # Cached connection and Mongoose models
│   └── services/        # Business logic
└── lib/                 # Framework-neutral helpers
```

The backend flow is deliberately small:

```text
Route Handler → Zod → Session/authorization → Service → Mongoose
```

There is no controller class, repository abstraction, dependency injection
container, runtime index synchronization, or separate NestJS service.

## Database collections

| Collection  | Purpose                                                 |
| ----------- | ------------------------------------------------------- |
| `users`     | Private Google identity, public alias, role, and status |
| `sessions`  | Hashed session tokens with TTL expiration               |
| `posts`     | Anonymous expressions and denormalized counters         |
| `replies`   | Public and private post replies                         |
| `reactions` | Unique user echoes for posts and replies                |
| `letters`   | Public or recipient-only open letters                   |
| `capsules`  | Sealed content with unlock time and visibility          |
| `reports`   | Moderation reports and review status                    |
| `blocks`    | Unique blocker/blocked-user relationships               |

Email addresses are never returned in public content payloads. Letter recipient
lookup uses an HMAC hash. Posts, replies, letters, and capsules store an alias
snapshot so historical content does not change when the user rotates aliases.

## MongoDB connection behavior

Every service safely calls `connectMongo()`. The connection and in-flight
promise are cached on `globalThis`, so a warm Vercel instance reuses the same
Mongoose pool. The application never disconnects after a request. Failed initial
connections clear the cached promise so the next request can retry.

Indexes are not synchronized during application startup. Run them explicitly:

```bash
npm run db:indexes
```

## Environment

Copy `.env.example` to `.env.local`:

```env
MONGODB_URI=mongodb+srv://...
AUTH_SECRET=use-at-least-32-random-characters
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
SESSION_MAX_AGE_DAYS=30
```

For Google OAuth, add this callback URL in Google Cloud:

```text
http://localhost:3000/api/auth/google/callback
```

Use the equivalent HTTPS URL for production.

## Local development

```bash
npm install
npm run db:indexes
npm run dev
```

Quality checks:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## API overview

```text
GET|POST    /api/posts
GET         /api/posts/:id
GET|POST    /api/posts/:id/replies
POST|DELETE /api/posts/:id/reactions
GET|POST    /api/open-letters
GET|POST    /api/capsules
POST        /api/reports
POST|DELETE /api/blocks/:userId
GET         /api/auth/session
POST        /api/auth/sign-out
POST        /api/me/alias
GET         /api/health/database
```

Invalid JSON returns `400`, unauthenticated requests `401`, missing resources
`404`, conflicts `409`, Zod validation failures `422`, and unavailable database
connections `503`.
