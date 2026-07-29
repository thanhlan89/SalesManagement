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
