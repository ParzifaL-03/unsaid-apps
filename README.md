# UNSAID Web

Responsive Next.js frontend for anonymous expressions, replies, open letters,
and time capsules. The backend lives in
[`ParzifaL-03/unsaid-be`](https://github.com/ParzifaL-03/unsaid-be).

## Stack

- Next.js 16, React 19, and TypeScript
- Tailwind CSS v4
- Reusable global UI components
- Zod 4 response contracts
- External NestJS API

## Structure

```text
src/
├── app/             # Pages and layouts; no API Route Handlers
├── components/
│   ├── layout/
│   ├── shared/
│   └── ui/          # Button, Alert, Card, Dialog, and form controls
├── contracts/       # Frontend request/response contracts
├── features/        # Client feature modules and contexts
├── lib/             # API client and framework-neutral helpers
└── types/
```

## Environment

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

In production, set `NEXT_PUBLIC_API_URL` to the public NestJS API URL, including
its `/api` prefix. The backend must set `FRONTEND_URL` to the exact frontend
domain and enable production cookie settings described in its README.

## Development

Start the backend first, then:

```bash
npm install
npm run dev
```

Checks:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## CI/CD

Push to `main` runs GitHub Actions checks and deploys production to the AWS
server over SSH. The server path must already contain a clone of this repository
and PM2 must be available for process restart. Configure these repository
secrets:

```text
AWS_HOST
AWS_PORT
AWS_USER
AWS_SSH_KEY
AWS_FE_PATH
AWS_FE_PM2_NAME
NEXT_PUBLIC_API_URL
```

`AWS_PORT` defaults to `22`, and `AWS_FE_PM2_NAME` defaults to `unsaid-apps`.
The server should have its production environment file in place before deploy.
