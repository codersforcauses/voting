# OpenVote
This full stack web app aims to provide a seamless election process for the CFC AGM.

This project uses Cloudflare Durable Objects and Workers to host an API built with Honojs for routing and middleware, Drizzle as an SQlite ORM and Zod for validation.
On the frontend it's running React Router and React Query as well as Shadcn as the component library.

## Getting started
Backend
```
pnpm install
npx drizzle-kit generate
pnpm run dev
```

```
pnpm run deploy
```

Frontend
```
cd client
pnpm install
pnpm typecheck
pnpm run dev
```

## Tests
There are ui and api tests written in Playwright
Install browsers with:
```
pnpm exec playwright install
```