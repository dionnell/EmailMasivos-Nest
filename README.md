# MailMasivo API

API en NestJS para autenticación de usuarios y envío de email masivo (campañas) usando **Resend**.

Todo lo que no está directamente relacionado con estas dos funciones (autenticación y envío de email) fue removido del proyecto original.

## Estructura del proyecto

```
src/
├── app.module.ts
├── auth/                # Registro, login, JWT, roles y gestión de usuarios
├── seed/                # Crea rápido usuarios de prueba (admin + user)
├── mail/                # Cliente de Resend (envío real del correo)
├── events/               # Gateway de WebSocket (progreso de envío, tracking en vivo)
├── campaigns/            # Creación y envío de campañas de email
├── recipients/           # Destinatarios (listas, importación, activos)
├── templates/             # Plantillas reutilizables de asunto/cuerpo
├── tracking/              # Pixel de apertura de email
├── webhooks/              # Webhook de Resend (bounces, quejas, entregas)
├── dashboard/             # Métricas agregadas de campañas
└── common/                # DTOs compartidos (paginación)
```

## 1. Requisitos

- Node.js >= 18
- PostgreSQL
- Una cuenta de [Resend](https://resend.com) con su API Key

## 2. Variables de entorno

Copia `.env.template` a `.env` y completa los valores:

```env
STAGE=dev

DB_PASSWORD=MySecretPassword
DB_NAME=MailMasivoDB
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres

JWT_SECRET=secret_key_for_jwt

PORT=3000
API_URL=http://localhost:3000/api

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAIL_FROM=MailMasivo <onboarding@resend.dev>
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
```

> Para pruebas sin dominio propio verificado en Resend, usa `onboarding@resend.dev`
> como remitente en `MAIL_FROM`; Resend solo entregará a tu propio correo registrado.

## 3. Instalación

```bash
npm install
docker compose up -d   # levanta la base de datos Postgres
npm run start:dev
```

## 4. Endpoints disponibles

### Auth
| Método | Ruta                     | Descripción                          |
|--------|--------------------------|---------------------------------------|
| POST   | /api/auth/register       | Crear usuario                         |
| POST   | /api/auth/login          | Iniciar sesión                        |
| GET    | /api/auth/check-status   | Verifica token y refresca             |
| PATCH  | /api/auth/profile        | Actualiza el propio perfil            |
| PATCH  | /api/auth/change-password| Cambia la propia contraseña           |
| GET    | /api/auth/users          | Lista usuarios (solo admin)           |
| PATCH  | /api/auth/users/:id      | Actualiza un usuario (solo admin)     |

### Seed (solo desarrollo)
| Método | Ruta        | Descripción                                                        |
|--------|-------------|----------------------------------------------------------------------|
| GET    | /api/seed   | Borra todos los usuarios y crea `admin@test.com` / `user@test.com` (password `Abc123`) |

### Mail
| Método | Ruta               | Descripción                              |
|--------|--------------------|-------------------------------------------|
| GET    | /api/mail/status   | Indica si Resend está configurado         |

### Dashboard
| Método | Ruta                    | Descripción              |
|--------|-------------------------|--------------------------|
| GET    | /api/dashboard/metrics  | Métricas del dashboard   |

### Campaigns
| Método | Ruta                        | Descripción                       |
|--------|-----------------------------|-----------------------------------|
| POST   | /api/campaigns              | Crear campaña                     |
| GET    | /api/campaigns              | Listar campañas                   |
| GET    | /api/campaigns/:id          | Detalle de campaña                |
| PATCH  | /api/campaigns/:id          | Actualizar campaña (solo borrador)|
| DELETE | /api/campaigns/:id          | Eliminar campaña                  |
| POST   | /api/campaigns/:id/send     | Enviar campaña                    |
| GET    | /api/campaigns/:id/logs     | Log de envíos                     |

### Recipients
| Método | Ruta                        | Descripción                       |
|--------|-----------------------------|-----------------------------------|
| POST   | /api/recipients             | Crear destinatario                |
| POST   | /api/recipients/import      | Importar múltiples (desde CSV)    |
| GET    | /api/recipients             | Listar destinatarios              |
| GET    | /api/recipients/:id         | Detalle de destinatario           |
| PATCH  | /api/recipients/:id         | Actualizar destinatario           |
| DELETE | /api/recipients/:id         | Eliminar destinatario             |

### Templates
| Método | Ruta                        | Descripción                       |
|--------|-----------------------------|-----------------------------------|
| POST   | /api/templates              | Crear plantilla                   |
| GET    | /api/templates              | Listar plantillas                 |
| GET    | /api/templates/:id          | Detalle de plantilla              |
| PATCH  | /api/templates/:id          | Actualizar plantilla              |
| DELETE | /api/templates/:id          | Eliminar plantilla                |

### Tracking / Webhooks
| Método | Ruta                        | Descripción                              |
|--------|-----------------------------|--------------------------------------------|
| GET    | /api/track/open/:sendLogId | Pixel de apertura (usado dentro del email)|
| POST   | /api/webhooks/resend       | Recibe eventos de Resend (bounce, etc.)   |

## 5. Variables de personalización en emails

En el cuerpo y asunto del email puedes usar:

- `{nombre}` → nombre del destinatario
- `{email}`  → email del destinatario
- `{empresa}` → (extensible vía tags/metadata futuro)
- `{ciudad}`  → (extensible)

## 6. Flujo de envío

```
POST /api/campaigns/:id/send
Body: { "recipientIds": [] }  ← vacío = todos los activos
```

El servicio:
1. Obtiene los destinatarios
2. Interpola variables en subject y body
3. Envía vía Resend con delay de 600ms entre correos
4. Guarda un SendLog por cada envío (exitoso o fallido)
5. Actualiza stats en la campaña (sentCount, failedCount)

Todas las rutas de campañas, destinatarios, plantillas, dashboard, tracking y webhooks son públicas por diseño (pensadas para uso interno/administrativo). Si necesitas protegerlas, agrega el decorador `@Auth()` del módulo `auth` a los controladores correspondientes.

## 7. WebSocket — eventos en vivo

Namespace: `/events` (con el prefijo global `api`, la URL completa de conexión es `ws://localhost:3000/api/events` o simplemente que el cliente de socket.io apunte a `http://localhost:3000` con `path` según tu configuración de proxy).

### Autenticación

La conexión requiere el mismo JWT que devuelve `/api/auth/login`. Se envía así:

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/events', {
  auth: { token: '<tu JWT>' },
});
```

Si el token falta o es inválido, el servidor desconecta al cliente inmediatamente.

### Eventos que emite el servidor

| Evento               | Cuándo se emite                                         | Payload                                                              |
|----------------------|----------------------------------------------------------|-----------------------------------------------------------------------|
| `campaign:progress`  | Después de cada email enviado durante `POST /campaigns/:id/send` | `{ campaignId, sentCount, failedCount, totalRecipients }`            |
| `campaign:done`      | Cuando la campaña termina de enviarse                    | `{ campaignId, sentCount, failedCount, totalRecipients }`            |
| `email:opened`       | Cuando se dispara el pixel de tracking (`/api/track/open/:id`) | `{ campaignId, sendLogId, email, openCount, firstOpen }`             |
| `email:bounced`      | Cuando Resend informa un bounce vía webhook               | `{ email, type: 'hard' \| 'soft', campaignId }`                       |
| `email:complained`   | Cuando Resend informa una queja de spam vía webhook        | `{ email }`                                                          |

Estos eventos se transmiten (broadcast) a todos los clientes conectados y autenticados — útil para alimentar un dashboard administrativo en tiempo real sin hacer polling.

