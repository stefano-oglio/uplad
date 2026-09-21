# DocInbox

MVP B2B para gestorías en España: recepción documental móvil + panel de semáforos por periodo fiscal.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS + componentes estilo shadcn/ui
- PostgreSQL + Prisma
- Auth.js (NextAuth) v5 — asesores con email/password
- Magic link (token hasheado + cookie JWT httpOnly) — clientes
- Storage S3-compatible (`@aws-sdk/client-s3`) o carpeta local
- Recordatorios: tabla `ReminderJob` + `/api/cron/reminders`
- Email: Resend (o log en consola si no hay API key)

## Setup local

### 1. Requisitos

- Node 20+
- pnpm
- PostgreSQL (Docker opcional)

```bash
# Ejemplo Docker Postgres
docker run --name docinbox-pg -e POSTGRES_PASSWORD=docinbox -e POSTGRES_USER=docinbox -e POSTGRES_DB=docinbox -p 5432:5432 -d postgres:16
```

### 2. Instalar y migrar

```bash
cp .env.example .env
# Edita DATABASE_URL, AUTH_SECRET y CLIENT_SESSION_SECRET

pnpm install
pnpm prisma migrate dev --name init
pnpm db:seed
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

### 3. Usuarios seed

| Rol | Email | Password |
|-----|-------|----------|
| Asesor ADMIN | `asesor@demo.local` | `demo1234` |
| Asesor | `asesor2@demo.local` | `demo1234` |

- Org: **Gestoría Demo SL**
- 20 clientes de ejemplo
- Periodo activo: trimestre actual, `deadlineDate` ≈ +25 días (ventana de presión / rojos activa)

### 4. Probar el flujo cliente

1. Login como asesor → panel `/app`
2. Abre una ficha → **Copiar enlace del cliente**
3. Abre el enlace (DevTools móvil) → sube una foto → aparece en la ficha
4. **He subido todo lo de este periodo** → 🟢 y jobs `PENDING` cancelados

### 5. Recordatorios

```bash
curl -X POST http://localhost:3000/api/cron/reminders
```

Quiet hours: 22:00–09:00 Europe/Madrid. Sin `RESEND_API_KEY`, el envío se registra en consola.

### 6. Tests smoke

```bash
pnpm test:smoke
```

## Variables de entorno

Ver `.env.example`. Principales:

- `DATABASE_URL` — Postgres
- `AUTH_SECRET` / `AUTH_URL` — Auth.js asesores
- `CLIENT_SESSION_SECRET` — JWT sesión cliente
- `APP_URL` — base de magic links
- `STORAGE_DRIVER` — `local` | `s3`
- `RESEND_API_KEY` / `EMAIL_FROM` — opcional
- `CRON_SECRET` — opcional para proteger el cron

## Limitaciones v1

- **Sin WhatsApp Business API** — solo copy para pegar
- **Sin OCR** — stub `OcrProvider`, campo `ocrJson` nullable
- **HEIC**: se acepta en upload; algunos entornos no lo previsualizan (JPG/PNG/PDF siempre OK)
- Sin billing, OCR de pago, roles granulares, ni integraciones contables

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing |
| `/login` | Asesores |
| `/app` | Dashboard semáforos |
| `/app/clients/[id]` | Ficha cliente |
| `/app/periods` | Periodos fiscales |
| `/c/[token]` | Magic link → sesión |
| `/c/buzon` | Buzón móvil del cliente |

## Decisiones

Ver [docs/DECISIONS.md](docs/DECISIONS.md).
