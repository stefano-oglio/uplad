# Decisiones de diseño (MVP DocInbox)

## Magic link para clientes (sin password)
Los autónomos/PYMEs no quieren otra cuenta más. Un enlace firmado (token
hasheado en `MagicLink`, sesión JWT en cookie httpOnly 60 días) reduce fricción
al máximo: abren WhatsApp/email, tocan el enlace y suben. El token en claro no
se guarda en DB.

## Asesores con email + password
El panel es de uso diario profesional. Credentials simples (Auth.js v5) bastan
para el MVP; se puede añadir magic link después sin cambiar el modelo `User`.

## Sin WhatsApp Business API en v1
La API oficial requiere Meta Business, plantillas aprobadas y número verificado.
Para validar el producto basta guardar el teléfono y generar copy con el enlace
para que el asesor pegue en WhatsApp. La interfaz `Notifier` deja el hueco.

## Sin OCR en el primer vertical slice
OCR (Vision/Textract) es coste variable y no bloquea el valor core: recepción +
semáforos. Campo `ocrJson` nullable + `OcrProvider` stub listos para enchufar.

## Recordatorios con tabla + cron (no Inngest)
Inngest añade cuenta y DX extra. Una tabla `ReminderJob` + endpoint
`/api/cron/reminders` (node-cron o cron de Vercel) es suficiente, auditable y
fácil de cancelar al COMPLETE. Quiet hours Europe/Madrid 22:00–09:00.

## Storage local por defecto
Misma interfaz `StorageProvider` para carpeta local y S3/MinIO. En local no
hace falta Docker; en producción `STORAGE_DRIVER=s3`.

## Multi-tenant por filtro de sesión
Cada query del panel filtra por `organizationId` de la sesión. RLS de Postgres
no es obligatorio en v1 si el server no se salta ese filtro.
