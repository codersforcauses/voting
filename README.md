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

## Deployment
The recommended deployment structure is:
Frontend - Cloudflare pages
API - Cloudflare workers
Durable Object/DB - Cloudflare Durable Object

Using durable objects requires a Cloudflare premium account ($5/month) so this probably costs more than having a single EC2 instance and a dockerised full stack application but its serverless so all sins are forgiven.

In the project root where your `wrangler.toml` file is run:
```
pnpm run deploy
```
Log in to the cloudflare account you want to host this project on.

Now go into your cloudflare dashboard and find the deployment. Add your secrets under `openvote-api-prod`/`settings`/`Variables and Secrets`. 
Make sure to set the types as secret except `INIT_SEAT` if you need to refer to the initial seat code.

The `CLERK_SECRET_KEY` needs to be the secret key for the cfc clerk account but `AUTH_SECRET_KEY` can be whatever cryptographically secure key you want. `openssl rand -base64 32` works well.

Secrets need to be configured on the cloudflare dashboard unless using the CI/CD pipeline on github.
