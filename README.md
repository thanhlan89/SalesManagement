# sales-management-system

Backend stack:

- Node.js
- NestJS
- PostgreSQL
- Prisma ORM

## Backend Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run start:dev
```

The API runs with the global prefix:

```text
/api/v1
```

## Database

Set `DATABASE_URL` in `.env`, then use Prisma migrations for application development:

```bash
npm run prisma:migrate
```

The hand-written SQL baseline is also available in:

```text
database/migrations/001_initial_schema.up.sql
database/migrations/001_initial_schema.down.sql
```

## Backend Modules

- `auth`: JWT login
- `users`: user management
- `customers`: customer management
- `products`: product catalog
- `sales`: quotes and sales orders
- `inventory`: warehouses and inventory movements
- `billing`: deliveries, invoices, payments

## Semantic product search

The products API provides `GET /api/v1/products/semantic-search`. It accepts a
customer description instead of requiring an exact product name. For example:

```text
GET /api/v1/products/semantic-search?query=tai%20nghe%20chong%20on%20de%20hop%20online&limit=10
Authorization: Bearer <access-token>
```

The service sends the description to OpenAI Responses API, asking for a strict
JSON analysis containing keywords, category hints, price limits, and sort
preference. It then uses those values to query PostgreSQL through Prisma. The
raw user query is never used as an SQL fragment.

Add these values to `.env` to enable the OpenAI analyzer:

```env
OPENAI_API_KEY="your-api-key"
OPENAI_QUERY_MODEL="gpt-5"
OPENAI_TIMEOUT_MS=8000
```

When `OPENAI_API_KEY` is absent, the endpoint remains available and uses a
Vietnamese-aware local tokenizer and price parser. OpenAI errors, invalid JSON,
and timeouts also fall back to this local analyzer, so product search does not
fail just because the AI provider is unavailable.

The response includes `analysis` for observability. In production, avoid
returning that field to untrusted clients if the extracted query details are
considered sensitive, and add rate limiting before exposing the endpoint
publicly because each non-cached request can incur an OpenAI charge.
