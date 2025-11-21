# zapulse-assignment

This repository contains a small TypeScript backend that manages "actions" using an Express API and Prisma with a PostgreSQL datasource. It provides endpoints to create, list, update and execute actions.

**Tech stack**
- **Runtime / package manager**: `bun` (package.json scripts use `bun`)
- **Language**: TypeScript
- **Web framework**: `express` (v5)
- **Database & ORM**: PostgreSQL with `prisma` / `@prisma/client`
- **Testing**: `jest` + `supertest` (tests mock `PrismaClient`)

**Quick Start**

- Clone the repo and open the project directory.
- Install dependencies with `bun`:

```bash
bun install
```

- Copy environment variables:

```bash
cp .env.sample .env
# then edit .env and set DATABASE_URL and BACKEND_PORT
```

- Apply Prisma migrations and generate client (Postgres must be available):

```bash
# using npm/npx
npx prisma generate
npx prisma migrate dev --name init

# or with bun (if bunx is available)
bunx prisma generate
bunx prisma migrate dev --name init
```

- Run the app in development:

```bash
bun run dev
```

The server listens on `BACKEND_PORT` (fallback `5000`). The API base path is `/api/v1`.

**Environment**
- `BACKEND_PORT` : port for the Express server (e.g. `5000`).
- `DATABASE_URL` : PostgreSQL connection string (required by Prisma). See `.env.sample`.

**Database (Prisma)**

Relevant Prisma model (in `db/prisma/schema.prisma`):

- `Action` model fields:
	- `id: Int` (autoincrement)
	- `name: String`
	- `url: String`
	- `method: String`
	- `status: StatusType` (enum: `PENDING`, `SUCCESS`, `FAILED`)
	- `created_at: DateTime`

Run `npx prisma studio` to view data if desired.

**API Endpoints** (base: `/api/v1`)

- `POST /api/v1/actions`
	- Create an action.
	- Body (JSON): `{ name: string, url: string, method: string }`
	- Responses: `201` with created record, or `400` for missing fields.

- `GET /api/v1/actions`
	- List all actions ordered by `id` ascending.
	- Responses: `200` with array of actions.

- `POST /api/v1/actions/:id/execute`
	- Simulates executing an action by updating its `status` to `SUCCESS`.
	- Responses: `200` with updated action, `400` for invalid id, `404` if not found.

- `PATCH /api/v1/actions/:id`
	- Update allowed fields: `name`, `url`, `method`, `status`.
	- Body: partial object with one or more allowed fields.
	- Responses: `200` with updated action, `400` for invalid id or no valid fields, `404` if not found.

All endpoints return `500` on unexpected errors (there is a centralized error handler).

**Testing**

```bash
bun run test
```

- Tests live in `tests/` and use `supertest` to exercise the routes; `@prisma/client` is mocked in tests so the DB is not required for unit tests.

**Database options**

There are two ways to provide a `DATABASE_URL` for this project — pick one:

- Option A — Use your own database (recommended for production):
	- Copy `.env.sample` to `.env` and set `DATABASE_URL` to your hosted Postgres connection string:
		```
		postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
		```

- Option B — Use the local Postgres container (recommended for local development):
	- Start the database container included in the repo:
		```powershell
		docker-compose up -d
		```
	- Then copy `.env.sample` to `.env` copy the below link into the DATABASE_URL value
		```
		postgresql://zapulse:zapulse_pwd@localhost:5432/zapulse_db?schema=public
		```
	- Run Prisma migrations against the local DB:
		```powershell
		npx prisma generate
		npx prisma migrate dev --name init
		```

Only one `DATABASE_URL` should be active in `.env`. The project will fail fast on startup if `DATABASE_URL` is missing or invalid.

