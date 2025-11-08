# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenVote is a full-stack election management system for the CFC AGM, built on Cloudflare's serverless infrastructure. It implements preferential voting systems (Hare-Clark/instant runoff) for conducting elections.

**Stack:**
- **Backend:** Cloudflare Workers + Durable Objects with Hono for routing
- **Database:** SQLite via Drizzle ORM (running in Durable Objects)
- **Frontend:** React Router v7 with React Query and Shadcn UI
- **Authentication:** JWT-based auth with Clerk integration
- **Testing:** Playwright for UI and API tests
- **Package Manager:** pnpm (v9.15.2)

## Development Commands

### Backend (API)
```bash
# Install dependencies
pnpm install

# Generate Drizzle migrations
npx drizzle-kit generate

# Run local development server (with hot reload)
pnpm run dev
```

### Frontend
```bash
cd client
pnpm install

# Type check
pnpm typecheck

# Run development server
pnpm run dev
```

### Testing
```bash
# Install Playwright browsers (first time only)
pnpm exec playwright install

# Run all tests
pnpm test
```

### Deployment
```bash
# Deploy API to Cloudflare Workers (production)
pnpm run deploy

# Deploy secrets (requires .dev.vars.prod file)
pnpm run deploy:secrets
```

## Architecture

### Durable Objects Pattern

The application uses a **single Durable Object instance** (`VotingObject`) per environment that acts as both the database and state manager. This is initialized using `VOTING_OBJECT.idFromName(ENVIRONMENT)` in `src/middleware/db.ts:7`, ensuring all requests hit the same instance.

**Key implications:**
- Database operations are synchronous within the Durable Object
- All API routes access the DB through the `STUB` variable (set by `addStub` middleware)
- The Durable Object provides both database methods and WebSocket broadcast functionality
- Migrations run automatically on Durable Object initialization via `blockConcurrencyWhile` in `src/models/index.ts:41-62`

### Database Layer

**Location:** `src/models/`

The database is structured around elections:
- **Users:** Voters with roles (user/admin) linked to seats via one-to-one relationship
- **Seats:** Access codes for joining elections
- **Positions:** Elected roles (e.g., President, Treasurer) with priority and openings count
- **Candidates:** Applicants with detailed nomination information
- **Nominations:** Many-to-many relationship between candidates and positions
- **Races:** Specific election instances for a position (status: closed/open/finished)
- **Votes:** User votes for races with timestamp tracking
- **Vote Preferences:** Ranked preferences for candidates within a vote
- **Elected:** Winners of completed races

All database operations are exposed as methods on the `VotingObject` class (e.g., `getAllUsers()`, `insertVote()`, etc.). These delegate to functions in `src/models/db/` subdirectories.

### Election System

**Location:** `src/lib/election-system/`

Implements preferential voting algorithms:
- **Hare-Clark:** Multi-candidate proportional representation (used when openings > 1)
- **Instant Runoff:** Single-winner preferential voting (Hare-Clark with 1 opening)
- **Preferential Block:** Alternative voting system (work in progress per recent commits)

The `autocount()` function in `src/lib/election-system/index.ts` is the main entry point, accepting vote data keyed by seat and returning elected candidates with tally history.

### API Routes

**Location:** `src/routes/`

Routes follow RESTful patterns:
- `auth.ts` - Login/signup with Clerk or seat codes, returns JWT
- `user.ts` - User CRUD (admin only)
- `position.ts` - Position management
- `candidate.ts` - Candidate applications and management
- `nomination.ts` - Link candidates to positions
- `race.ts` - Race lifecycle (start/stop voting, view current race)
- `vote.ts` - Submit and view votes
- `results.ts` - Tally results and elect winners
- `seat.ts` - Generate access codes

All routes use the `STUB` context variable to call Durable Object methods.

### Middleware

**Location:** `src/middleware/`

- `db.ts` - Injects `STUB` (Durable Object instance) into context
- `auth.ts` - JWT verification, `requireUser` and `requireAdmin` guards

Middleware chain in `src/index.ts:21-25`: secure headers → CORS → add stub → logger → authenticate

### Frontend Structure

**Location:** `client/app/`

- React Router v7 with file-based routing (`client/app/routes/`)
- Shadcn UI components in `client/app/components/`
- React Query for API state management
- Path aliases configured (`@/` → `client/app/`)

### WebSocket Support

The application supports WebSockets for real-time updates (e.g., broadcasting race status changes). WebSocket connections are:
- Established via `/ws` endpoint (bypasses secure headers middleware)
- Managed by the Durable Object's `connections` Map
- Broadcast with the `broadcast(message)` method

## Development Patterns

### Adding a New Database Table

1. Define schema in `src/models/schema.ts` with relations
2. Create CRUD operations in `src/models/db/[table-name].ts`
3. Expose methods on `VotingObject` class in `src/models/index.ts`
4. Generate migration: `npx drizzle-kit generate`
5. Restart dev server to apply migration

### Path Aliases

Backend uses `@/*` → `./src/*` (configured in `tsconfig.json:18`)

### Environment Variables

Required secrets (set in Cloudflare dashboard or `.dev.vars` locally):
- `CLERK_SECRET_KEY` - Clerk authentication secret
- `AUTH_SECRET_KEY` - JWT signing key (generate with `openssl rand -base64 32`)
- `INIT_SEAT` - Master seat code for initial access
- `ENVIRONMENT` - "dev" or "prod"

## Voting System Implementation

When implementing or debugging voting logic:
- Votes are stored as `vote_preferences` with a `preference` field (1 = first choice, 2 = second, etc.)
- The `autocount()` function expects data as `Record<Seat, Candidate[]>` where arrays are ordered by preference
- Tally history is returned as `Map<PropertyKey, number>[]` for each round of counting
- Recent work (per git log) focuses on "preferential block voting" as an alternative to Hare-Clark
