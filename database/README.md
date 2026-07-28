# Database Migrations

The current migrations target PostgreSQL.

Apply the initial schema:

```bash
psql "$DATABASE_URL" -f database/migrations/001_initial_schema.up.sql
```

Rollback the initial schema:

```bash
psql "$DATABASE_URL" -f database/migrations/001_initial_schema.down.sql
```

Notes:

- ERD entity `USER` is implemented as `app_user` to avoid SQL identifier conflicts.
- UUID primary keys use PostgreSQL `pgcrypto` and `gen_random_uuid()`.
- Status fields are PostgreSQL enums so workflow states stay constrained.
- Monetary values use `numeric(18,2)`.
