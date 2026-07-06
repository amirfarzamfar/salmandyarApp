# Docker Deployment Guide

## What Was Added

- Production Docker image for `frontend` (`Next.js standalone`)
- Production Docker image for `backend` (`ASP.NET Core .NET 8`)
- `docker-compose.yml` for `nginx`, `frontend`, `backend`, `postgres`
- Dedicated `migrations` service for EF Core migration bundle
- Persistent Docker volumes for PostgreSQL data and uploaded files
- GitHub Actions workflow for VPS deployment over SSH

## Files You Must Prepare

1. Copy the environment template:

```bash
cp .env.production.example .env.production
```

2. Set these values before first production deploy:

- `APP_DOMAIN`
- `APP_ORIGIN`
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- Optional first-run seed values:
  - `ADMIN_EMAIL`
  - `ADMIN_PHONE_NUMBER`
  - `ADMIN_PASSWORD`
  - `DB_SEED_ROLES=true`
  - `DB_SEED_ADMIN_USER=true`

After the first successful bootstrap, set `DB_SEED_ROLES` and `DB_SEED_ADMIN_USER` back to `false`.

## Local Run With Docker

1. Copy the local template:

```bash
cp .env.example .env
```

2. Build and start the full stack:

```bash
docker compose --env-file .env up -d --build
```

3. Run database migrations once:

```bash
docker compose --env-file .env --profile tools run --rm migrations
```

4. Open the app:

- App: `http://localhost`
- API health: `http://localhost/health`

5. Stop everything:

```bash
docker compose --env-file .env down
```

## Local Run Without Docker

### Backend

Create environment variables or use a local secret store for:

- `ConnectionStrings__DefaultConnection`
- `JwtSettings__Secret`

Then run:

```bash
dotnet run --project backend/src/Salmandyar.API/Salmandyar.API.csproj
```

### Frontend

Create `frontend/.env.local` from `frontend/.env.example`, then run:

```bash
npm install --prefix frontend
npm run dev --prefix frontend
```

## Ubuntu Server Deployment

### Prerequisites

- Ubuntu 22.04 or 24.04
- Docker Engine + Docker Compose plugin
- Git
- Domain pointing to the server IP

### First-Time Setup

```bash
git clone <your-repo-url> /opt/salmandyar
cd /opt/salmandyar
cp .env.production.example .env.production
```

Edit `.env.production`, then run:

```bash
docker compose --env-file .env.production --profile tools run --rm migrations
docker compose --env-file .env.production up -d --build
```

### Update / Redeploy

```bash
git pull --ff-only
docker compose --env-file .env.production --profile tools run --rm migrations
docker compose --env-file .env.production up -d --build --remove-orphans
```

### Check Status

```bash
docker compose --env-file .env.production ps
docker compose --env-file .env.production logs -f nginx
docker compose --env-file .env.production logs -f backend
```

## Database Backup

```bash
docker compose --env-file .env.production exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > backup.sql
```

## Database Restore

```bash
cat backup.sql | docker compose --env-file .env.production exec -T postgres sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'
```

## SSL Note

This stack exposes `nginx` on port `80`. For production HTTPS, put TLS in front of it:

- Cloudflare proxy + server certificate
- Nginx SSL extension on the server
- Traefik / Caddy in front of this stack

If you want container-level TLS later, extend the nginx config and mount certificates into the container.

## GitHub Actions Deploy

The workflow in `.github/workflows/deploy.yml` expects these GitHub secrets:

- `VPS_HOST`
- `VPS_PORT`
- `VPS_USER`
- `VPS_SSH_KEY`
- `VPS_APP_DIR`

`VPS_APP_DIR` should point to the cloned repository on the server, for example `/opt/salmandyar`.

The workflow:

- connects to the VPS over SSH
- pulls the selected branch
- optionally runs migrations
- rebuilds and restarts the stack with Docker Compose
