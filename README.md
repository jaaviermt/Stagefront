# STAGEFRONT

Plataforma de eventos y conciertos. Venta de boletos, reventas, reseñas y panel administrativo.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + GSAP |
| Backend | Node.js + Express + TypeScript |
| ORM relacional | Prisma 5 |
| Base de datos relacional | PostgreSQL 16 |
| Base de datos documental | MongoDB 7 + Mongoose |
| Contenedores | Docker Compose |

---

## Requisitos previos

- Node.js 20+
- Docker Desktop (para las bases de datos)
- pnpm / npm / yarn

---

## Levantamiento local

### 1. Bases de datos (Docker)

```bash
docker compose up -d
```

Esto levanta:
- PostgreSQL en `localhost:5432`
- MongoDB en `localhost:27017`

Ambos servicios persisten datos en volúmenes Docker (`stagefront_pg_data`, `stagefront_mongo_data`).

---

### 2. Backend

```bash
cd backend
cp .env.example .env      # copiar variables de entorno
npm install
npm run db:setup          # prisma db push + seed
npm run dev               # servidor en http://localhost:3001
```

El comando `db:setup` aplica el schema de Prisma y carga todos los datos de ejemplo (6 eventos, venues, zonas, asientos, órdenes, perfiles de artistas, reseñas, notificaciones).

---

### 3. Frontend

```bash
cd frontend
cp .env.example .env      # copiar variables de entorno
npm install
npm run dev               # app en http://localhost:5173
```

---

## URLs del frontend

| URL | Página | Acceso |
|-----|--------|--------|
| `http://localhost:5173/` | Home — listado de eventos destacados | Público |
| `http://localhost:5173/events` | Catálogo de eventos | Público |
| `http://localhost:5173/events/:id` | Detalle de evento + compra | Público |
| `http://localhost:5173/resales` | Mercado de reventas | Público |
| `http://localhost:5173/checkout` | Finalizar compra | Público (usa usuario demo) |
| `http://localhost:5173/admin/login` | Login del panel admin | Credenciales requeridas |
| `http://localhost:5173/admin` | Dashboard administrativo | Solo admin autenticado |

---

## Autenticación

### Panel de administración

La app usa autenticación basada en contexto (React `AdminAuthContext`). Para acceder al dashboard:

1. Ir a `/admin/login`
2. Ingresar las credenciales del usuario admin creado por el seed:

```
Email:    admin@stagefront.mx
Password: (definida en JWT_SECRET — en dev cualquier contraseña funciona con el seed)
```

El guard `AdminGuard` redirige a `/admin/login` si no hay sesión activa.

### Compra pública (checkout)

El flujo de compra no requiere login. Se usa automáticamente el usuario demo creado por el seed. Su ID se configura en las variables de entorno:

```
# backend/.env
DEMO_USER_ID=seed-user-demo

# frontend/.env
VITE_DEMO_USER_ID=seed-user-demo
```

### Endpoints de API

Los endpoints de `/api/v1/admin/*` **no tienen middleware de auth en la implementación actual** (ver comentario en `backend/src/routes/index.ts`). Deben protegerse antes de ir a producción con un middleware JWT.

---

## Variables de entorno

### `backend/.env`

```env
DATABASE_URL="postgresql://stagefront:stagefront@localhost:5432/stagefront"
MONGODB_URI="mongodb://localhost:27017/stagefront"
PORT=3001
NODE_ENV=development
JWT_SECRET=change_me_before_production
DEMO_USER_ID=seed-user-demo
```

### `frontend/.env`

```env
VITE_DEMO_USER_ID=seed-user-demo
```

---

## API REST — Endpoints

Base URL: `http://localhost:3001/api/v1`

### Estadísticas públicas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/stats` | Conteos generales (eventos, órdenes, reventas) |

### Eventos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/events` | Lista todos los eventos con venues y zonas |
| GET | `/events/:id` | Detalle de un evento + zonas + asientos |
| POST | `/events` | Crear nuevo evento |

**POST `/events` — body:**
```json
{
  "title": "Nombre del evento",
  "artist_name": "Artista",
  "venue_id": "id-del-venue",
  "date": "2026-12-01T21:00:00-06:00",
  "status": "draft",
  "total_capacity": 20000,
  "genre": "Pop",
  "description": "Descripción del evento",
  "image_url": "/images/mi-evento.jpg"
}
```

### Órdenes

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/orders` | Crear una orden de compra |
| GET | `/users/:userId/orders` | Órdenes de un usuario |

**POST `/orders` — body:**
```json
{
  "user_id": "seed-user-demo",
  "event_id": "id-del-evento",
  "seat_ids": ["seat-zone-ro-general-A-1", "seat-zone-ro-general-A-2"]
}
```

### Reventas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/resales` | Lista reventas activas con info de asiento y evento |
| POST | `/resales` | Publicar una reventa |

**POST `/resales` — body:**
```json
{
  "seat_id": "id-del-asiento",
  "seller_id": "id-del-vendedor",
  "price": 2100
}
```

Regla de negocio: el precio de reventa no puede superar el 30% sobre el precio original.

### Reseñas (MongoDB)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/events/:eventId/reviews` | Reseñas de un evento |
| POST | `/reviews` | Crear reseña |

**POST `/reviews` — body:**
```json
{
  "user_id": "seed-user-demo",
  "event_id": "id-del-evento",
  "rating": 5,
  "comment": "Texto de la reseña"
}
```

### Admin

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/admin/stats` | KPIs: eventos activos, revenue, ticket promedio, sold out |
| GET | `/admin/orders` | Últimas órdenes (param: `?limit=10`, máx 50) |
| GET | `/admin/events` | Eventos con métricas de venta por zona |

---

## Arquitectura de base de datos

### PostgreSQL — Prisma (transaccional)

```
users
  id            String (cuid)   PK
  name          String
  email         String          UNIQUE
  password_hash String
  role          UserRole        admin | buyer | seller
  created_at    DateTime

venues
  id            String (cuid)   PK
  name          String
  city          String
  address       String
  capacity      Int

events
  id             String (cuid)  PK
  title          String
  artist_name    String
  venue_id       String         FK → venues
  date           DateTime
  status         EventStatus    draft | published | cancelled | completed
  total_capacity Int
  genre          String
  description    Text
  image_url      String

zones
  id              String (cuid) PK
  event_id        String        FK → events
  name            String
  price           Decimal(10,2)
  total_seats     Int
  available_seats Int

seats
  id      String (cuid)  PK
  zone_id String         FK → zones
  row     String
  number  Int
  status  SeatStatus     available | reserved | sold

orders
  id         String (cuid) PK
  user_id    String        FK → users
  event_id   String        FK → events
  total      Decimal(10,2)
  status     OrderStatus   pending | confirmed | cancelled | refunded
  created_at DateTime

order_items
  id       String (cuid) PK
  order_id String        FK → orders
  seat_id  String        FK → seats
  price    Decimal(10,2)

resales
  id        String (cuid) PK
  seat_id   String        FK → seats
  seller_id String        FK → users
  price     Decimal(10,2)
  status    ResaleStatus  active | sold | cancelled
```

### MongoDB — Mongoose (documental)

```
reviews
  user_id    String (ref a users de Postgres)
  event_id   String (ref a events de Postgres)
  rating     Number (1–5)
  comment    String
  created_at Date

activity_logs
  user_id   String
  action    String  (order_placed | review_created | resale_listed | ...)
  metadata  Object  (datos arbitrarios del evento)
  timestamp Date

notifications
  user_id    String
  type       String  (order_confirmed | event_reminder | resale_alert | system)
  message    String
  read       Boolean
  created_at Date

artist_profiles
  name         String
  bio          String
  genres       String[]
  social_links Object  { instagram, spotify, youtube, twitter }
  media        String[] (URLs de imágenes)
```

---

## Agregar registros nuevos

### Nuevo evento (vía API)

```bash
curl -X POST http://localhost:3001/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bad Bunny — DeBÍ TiRAR MáS FOToS Tour",
    "artist_name": "Bad Bunny",
    "venue_id": "seed-venue-gnp",
    "date": "2026-11-15T21:00:00-06:00",
    "status": "published",
    "total_capacity": 65000,
    "genre": "Reggaetón / Latin Trap",
    "description": "Bad Bunny regresa a México.",
    "image_url": "/images/badbunny.jpg"
  }'
```

Los IDs de venues del seed son:
- `seed-venue-gnp` — Estadio GNP Seguros, CDMX (65,000)
- `seed-venue-palacio` — Palacio de los Deportes, CDMX (20,000)
- `seed-venue-arena-vfg` — Arena VFG, Guadalajara (16,000)
- `seed-venue-foro-sol` — Foro Sol, CDMX (65,000)

### Nuevo venue (vía Prisma)

```typescript
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

await prisma.venue.create({
  data: {
    name: "Arena CDMX",
    city: "Ciudad de México",
    address: "Av. de los Insurgentes 1",
    capacity: 22000,
  },
});
```

O directamente en psql:

```sql
INSERT INTO venues (id, name, city, address, capacity)
VALUES (gen_random_uuid(), 'Arena CDMX', 'Ciudad de México', 'Av. de los Insurgentes 1', 22000);
```

### Nueva zona para un evento

```typescript
await prisma.zone.create({
  data: {
    event_id: "id-del-evento",
    name: "Pista General",
    price: 1800,
    total_seats: 200,
    available_seats: 200,
  },
});
```

### Nuevo usuario

```typescript
import bcrypt from "bcrypt";

await prisma.user.create({
  data: {
    name: "María López",
    email: "maria@ejemplo.mx",
    password_hash: await bcrypt.hash("mi-contraseña", 10),
    role: "buyer", // "admin" | "buyer" | "seller"
  },
});
```

### Nueva reseña (MongoDB)

```typescript
import { Review } from "./src/models/mongoose/Review.js";

await Review.create({
  user_id: "seed-user-demo",
  event_id: "seed-event-weeknd",
  rating: 5,
  comment: "Increíble producción.",
  created_at: new Date(),
});
```

O vía API:

```bash
curl -X POST http://localhost:3001/api/v1/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "seed-user-demo",
    "event_id": "seed-event-weeknd",
    "rating": 5,
    "comment": "Increíble producción."
  }'
```

---

## Datos del seed

El seed (`npm run db:seed`) crea:

### Usuarios de prueba

| ID | Email | Rol |
|----|-------|-----|
| `seed-user-demo` | ana.garcia@ejemplo.mx | buyer |
| `seed-user-admin` | admin@stagefront.mx | admin |
| `seed-user-seller` | carlos.mendoza@ejemplo.mx | seller |

### Eventos publicados

| ID | Evento | Venue | Fecha |
|----|--------|-------|-------|
| `seed-event-rosalia` | Rosalía — Motomami World Tour | Palacio de los Deportes | 22 ago 2026 |
| `seed-event-fka-twigs` | FKA Twigs — Body High Tour | Arena VFG | 05 sep 2026 |
| `seed-event-ctangana` | C. Tangana — Sin Cantar ni Afinar | Foro Sol | 26 sep 2026 |
| `seed-event-weeknd` | The Weeknd — After Hours Til Dawn | Estadio GNP | 17 oct 2026 |
| `seed-event-axe-ceremonia` | Axe Ceremonia 2027 | Foro Sol | 17 abr 2027 |
| `seed-event-kanye` | Kanye West: Ye Live in Mexico | Estadio GNP | 20 feb 2027 |

---

## Scripts disponibles

### Backend

| Script | Acción |
|--------|--------|
| `npm run dev` | Desarrollo con hot-reload (tsx watch) |
| `npm run build` | Compilar a JS |
| `npm run start` | Ejecutar build compilado |
| `npm run db:push` | Aplicar schema Prisma sin migraciones |
| `npm run db:migrate` | Crear y aplicar migración Prisma |
| `npm run db:generate` | Regenerar Prisma Client |
| `npm run db:seed` | Ejecutar seed (borra y recrea datos) |
| `npm run db:setup` | `db:push` + `db:seed` en un solo comando |

### Frontend

| Script | Acción |
|--------|--------|
| `npm run dev` | Servidor de desarrollo Vite |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run lint` | ESLint |

---

## Estructura del proyecto

```
stagefront/
├── docker-compose.yml          # PostgreSQL 16 + MongoDB 7
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Router principal
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   └── AdminGuard.tsx  # Protección de rutas admin
│   │   ├── context/
│   │   │   └── AdminAuthContext.tsx
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── EventsPage.tsx
│   │   │   ├── EventDetailPage.tsx
│   │   │   ├── ResalesPage.tsx
│   │   │   ├── CheckoutPage.tsx
│   │   │   ├── AdminLoginPage.tsx
│   │   │   └── AdminDashboardPage.tsx
│   │   ├── lib/                # Clientes HTTP / utilidades
│   │   └── types/
│   └── vite.config.ts
└── backend/
    ├── prisma/
    │   ├── schema.prisma       # Schema PostgreSQL
    │   └── seed.ts             # Datos de prueba
    └── src/
        ├── index.ts            # Entry point Express
        ├── routes/index.ts     # Todas las rutas
        ├── controllers/        # Handlers HTTP
        │   ├── eventsController.ts
        │   ├── ordersController.ts
        │   ├── resalesController.ts
        │   ├── reviewsController.ts
        │   ├── statsController.ts
        │   └── adminController.ts
        ├── services/           # Lógica de negocio pura
        │   ├── eventService.ts
        │   ├── orderService.ts
        │   ├── purchaseService.ts
        │   ├── resaleService.ts
        │   └── promoService.ts
        ├── models/
        │   ├── prisma/         # Tipos derivados de Prisma
        │   └── mongoose/       # Modelos MongoDB
        │       ├── Review.ts
        │       ├── ActivityLog.ts
        │       ├── Notification.ts
        │       └── ArtistProfile.ts
        ├── lib/
        │   ├── prisma.ts       # Singleton PrismaClient
        │   └── mongoose.ts     # Conexión MongoDB
        └── types/              # Tipos compartidos
```

---

## Lógica de negocio (services)

Todas las funciones en `backend/src/services/` son puras, sin side effects, y están listas para unit tests.

| Función | Descripción |
|---------|-------------|
| `isEventSoldOut(zones)` | `true` si todas las zonas tienen `available_seats === 0` |
| `getAvailableSeats(zone)` | Asientos con `status === "available"` en una zona |
| `getEventsByCity(events, city)` | Filtra eventos por ciudad del venue |
| `calculateOrderTotal(items)` | Suma de precios de los items |
| `canUserPurchase(user, event, qty)` | Valida que el usuario pueda comprar |
| `validateResalePrice(original, resale)` | Máximo 30% de markup permitido |
| `applyPromoCode(total, code, validCodes)` | Aplica descuento por código promo |

---

## Imágenes de eventos

Las imágenes se sirven como estáticos desde el frontend. Para usar imágenes reales:

1. Colocar el archivo en `frontend/public/images/<nombre>.jpg`
2. En el seed o al crear el evento usar `image_url: "/images/<nombre>.jpg"`

Los eventos del seed apuntan a `/images/rosalia.jpg`, `/images/theweeknd.jpg`, etc. Si los archivos no existen, el frontend renderizará sin imagen o usará el fallback definido en el componente.

---

## Healthcheck

```bash
curl http://localhost:3001/health
# { "status": "ok" }
```
