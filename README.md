# UNSAID

UNSAID is a responsive web prototype for anonymous opinions, expressions, open
letters, and time capsules. The interface follows the supplied Figma design
system: bold color blocks, soft cream surfaces, rounded cards, and
Plus Jakarta Sans typography.

## Included

- Responsive feed with search, mood filters, echoes, and post detail pages
- Explore page for topics and open letters
- Anonymous expression composer with local draft saving
- Time capsule overview and filters
- Anonymous account flow with rotating public aliases
- Profile and safety controls
- Reusable global UI components for buttons, alerts, cards, chips, inputs,
  dialogs, switches, text areas, and avatars

## Project structure

```text
src/
├── app/                 # Next.js App Router pages and global styles
├── components/
│   ├── layout/          # Responsive app shell and navigation
│   ├── shared/          # Shared product-level components
│   └── ui/              # Global design-system primitives
├── features/            # Feature modules: auth, feed, compose, and others
├── lib/                 # Shared utilities
└── types/               # Domain types
```

## Local development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run typecheck
npm run lint
npm run build
```

## Deploy to Vercel

Import this repository in Vercel and keep the detected Next.js defaults. No
environment variables are required for this prototype.

## MVP note

This version is intentionally frontend-first. Accounts, posts, echoes, drafts,
and safety settings use browser-local state so the complete experience can be
tested without a backend. Production authentication, database storage,
moderation, abuse prevention, and email recovery should be added before public
launch.
