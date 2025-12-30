# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenVote is a full-stack election management system for the CFC AGM. The backend is a standalone API server running on Bun, platform-agnostic and deployable to any hosting provider.

**Stack:**
- **Backend**: Hono.js (routing/middleware), Drizzle ORM (PostgreSQL), Zod (validation)
- **Frontend**: React Router 7, TanStack Query, Shadcn UI components, Tailwind CSS
- **Database**: PostgreSQL
- **Runtime**: Bun (platform-agnostic)
- **Testing**: Playwright

## Development Commands

### Monorepo Structure
The project uses a workspace-based monorepo with `api/` and `client/` subdirectories.

### API (Backend)
```bash
# Development server with hot reload
bun --filter api dev
# or from root
bun dev

# Build
bun --filter api build

# Tests (Playwright)
bun --filter api test
# or from root
bun test

# Type checking
bun --filter api typecheck

# Database operations
bun db:generate    # Generate migrations from schema
bun db:migrate     # Run migrations
bun db:studio      # Open Drizzle Studio
```

### Client (Frontend)
```bash
# Development server
bun --filter client dev
# or from root
bun dev:client

# Build
bun --filter client build

# Type checking
bun --filter client typecheck

# Run both API and client concurrently
bun dev:all
```

### Testing
```bash
# Install Playwright browsers (first time only)
pnpm exec playwright install

# Run all tests
bun test
```

## Code Architecture

### Backend Module Structure (Rewrite Branch)

The codebase is currently being refactored from a centralized structure to a **module-based architecture**. Each domain is organized into self-contained modules:

```
api/src/
├── {module}/           # e.g., race, vote, user, position, candidate, etc.
│   ├── schema.ts       # Drizzle table definitions, relations, and DB queries
│   ├── handlers.ts     # Handler functions using factory.createHandlers()
│   └── routes.ts       # Hono route definitions using factory.createApp()
├── shared/
│   ├── app.ts          # Factory setup (createFactory from hono/factory)
│   ├── lib/
│   │   └── election-system/   # Vote counting algorithms
│   │       ├── hare-clark.ts  # Hare-Clark STV implementation
│   │       ├── preferential-block.ts  # Block voting method
│   │       ├── race.ts        # Base race logic
│   │       ├── vote.ts        # Vote representation
│   │       └── index.ts       # Exports autocount() function
│   ├── middleware/
│   │   └── auth.ts      # authenticate, requireUser, requireAdmin middleware
│   └── types.ts         # Shared TypeScript types
├── db.ts               # Drizzle database instance
└── index.ts            # App entry point, middleware setup, route mounting
```

**Important Notes:**
- **Schema files** (`schema.ts`) contain both Drizzle schema definitions AND database query functions
- **Factory pattern**: All modules import `factory` from `@/shared/app` for consistent middleware/handler creation
- **Drizzle config**: Uses glob pattern `./src/**/schema.ts` to find all schema files across modules

### Module Pattern

Each module follows this pattern:

1. **schema.ts**: Defines database table, relations, and CRUD operations
   - Example: `getRace()`, `getAllRaces()`, `insertRace()`, `updateRace()`, `deleteRace()`
   - May include complex business logic (e.g., `saveElectedForRace()` in race/schema.ts)

2. **handlers.ts**: Uses `factory.createHandlers()` to group validation with handler logic
   - Import `factory` from `@/shared/app`
   - Validation middleware (e.g., `zValidator`) is passed to `factory.createHandlers()`
   - Handler function receives properly typed context with validation results
   - Export handler arrays with descriptive names (e.g., `getAllRacesHandlers`)
   - Example:
     ```typescript
     import { factory } from "@/shared/app";
     import { zValidator } from "@hono/zod-validator";
     import { z } from "zod";

     const raceIdSchema = z.object({
       id: z.number({ coerce: true }),
     });

     export const getRaceHandlers = factory.createHandlers(
       zValidator("param", raceIdSchema),
       async (c) => {
         const { id } = c.req.valid("param"); // Properly typed from validation
         const race = await c.var.STUB.getRace(id);
         return c.json(race);
       }
     );
     ```

3. **routes.ts**: Defines route paths and spreads handler arrays
   - Uses `factory.createApp()` to create Hono app instance
   - Authorization middleware (`authenticate`, `requireAdmin`, `requireUser`) applied in routes
   - Spreads handler arrays using spread operator (`...`)
   - Example:
     ```typescript
     import { factory } from "@/shared/app";
     import { requireAdmin } from "@/shared/middleware/auth";
     import { getRaceHandlers, updateRaceHandlers } from "@/race/handlers";

     const app = factory.createApp();

     app.get("/:id", ...getRaceHandlers);
     app.patch("/:id", requireAdmin, ...updateRaceHandlers);

     export default app;
     ```

**Key Principles:**
- **Separation of concerns**: Authorization middleware stays in routes.ts (runs first), validation/business logic in handlers.ts
- **Type safety**: `factory.createHandlers()` provides proper TypeScript inference from middleware context
- **Co-location**: Validation schemas and handlers are grouped together for better maintainability

### Authentication & Authorization

- **JWT-based auth** using `hono/jwt`
- **Middleware chain**:
  - `authenticate`: Parses JWT from `Authorization: Bearer <token>`, sets `ID` and `ROLE` in context
  - `requireUser`: Ensures user is authenticated
  - `requireAdmin`: Ensures user has admin role
- Token validated against `AUTH_SECRET_KEY` environment variable

### Election Counting System

Located in `api/src/shared/lib/election-system/`:

- **autocount()**: Main entry point, automatically selects appropriate counting method
- **HareClark**: Hare-Clark STV (Single Transferable Vote) - used for multi-seat races
  - Acts as instant-runoff when `openings = 1`
  - Returns `{candidates, tally}` with elected candidates and count data
- **PreferentialBlock**: Preferential block voting method (in development)
- Vote data format: `Record<Seat, Candidate[]>` where each seat maps to ranked candidate IDs

### Database Schema Pattern

- Tables use `drizzle-orm/pg-core` (PostgreSQL)
- Relations defined with `drizzle-orm` relations API
- Schema files export table definitions AND query functions
- Example from race/schema.ts:
  ```typescript
  export const racesTable = pgTable("race", {...})
  export const racesRelations = relations(racesTable, {...})
  export function getRace(id: number) {...}
  ```

### Frontend Structure

- **React Router 7** file-based routing in `client/app/routes/`
- **TanStack Query** for data fetching (see `client/app/components/vote/queries.ts`)
- **Shadcn UI** components in `client/app/components/ui/`
- Admin components organized in `client/app/components/admin/`

## Common Development Workflows

### Adding a New API Module

1. Create module directory: `api/src/{module}/`
2. Create `schema.ts` with Drizzle table definition and query functions
3. Create `handlers.ts` with route handler logic
4. Create `routes.ts` using `factory.createApp()` pattern
5. Import and mount in `api/src/index.ts`: `app.route("/{module}", moduleRoutes)`
6. Run `bun db:generate` to create migration
7. Run `bun db:migrate` to apply migration

### Running a Single Test

```bash
# Run specific test file
bun test api/tests/counting/count.spec.ts

# Run tests matching a pattern
bun test --grep "Block Voting"
```

### Debugging Database Issues

```bash
# Open Drizzle Studio to inspect database
bun db:studio

# Check current schema
cat api/drizzle/schema.sql

# Regenerate migrations if schema changed
bun db:generate
```

### Database Setup (PostgreSQL)

The API uses PostgreSQL. **The database must be provisioned separately** before running migrations.

```bash
# 1. Ensure PostgreSQL is running and create the database
createdb openvote

# 2. Set DATABASE_URL in api/.env
DATABASE_URL=postgresql://user:password@localhost:5432/openvote

# 3. Generate and run migrations
bun db:generate
bun db:migrate

# Optional: Open Drizzle Studio to verify
bun db:studio
```

**Note**: Drizzle creates tables/schema but does NOT create the database itself. You must have a running PostgreSQL instance and database created before running migrations.

## Deployment

### Backend (Standalone API)

**Required Environment Variables** (see `api/.env.example`):
- `DATABASE_URL`: PostgreSQL connection string (e.g., `postgresql://user:password@host:5432/openvote`)
- `AUTH_SECRET_KEY`: JWT signing key (generate with `openssl rand -base64 32`)
- `INIT_SEAT`: Initial seat code for first-time setup
- `CLERK_SECRET_KEY`: Clerk authentication secret (optional, for OAuth)
- `PORT`: Server port (default: 3000)
- `HOST`: Server host (default: 0.0.0.0)
- `CORS_ORIGINS`: Allowed CORS origins (comma-separated)
- `ENVIRONMENT`: Environment name (e.g., `dev`, `production`)

**Deployment Steps**:
1. Provision PostgreSQL database
2. Set environment variables
3. Run migrations: `bun db:migrate`
4. Build: `bun --filter api build`
5. Start: `bun --filter api start` (or deploy to your hosting provider)

### Frontend
Deploy the React application to your preferred static hosting provider (Vercel, Netlify, Cloudflare Pages, etc.).

## Known Issues / TODO

- **PreferentialBlock counting**: Block voting method is under development, test data needs to be created

# Documentation

Look in the .llms folder for full documentation on drizzle and hono.js
If you're looking for specific documentation automatically use context7