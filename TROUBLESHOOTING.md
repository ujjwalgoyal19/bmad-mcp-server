# TROUBLESHOOTING

Common issues and how to resolve them.

## Local infra not starting

- Check Docker logs: `docker compose -f infra/docker-compose.yml logs`.
- Ensure required ports are free (Postgres, MinIO default ports).

## Database connection errors

- Verify `DATABASE_URL` env var and that Postgres container is running.
- Inspect Prisma migrations and run `bunx prisma migrate status` if needed.

## Storage upload issues

- Confirm `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` are correct and MinIO is reachable.
