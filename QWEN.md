# Savior E-Commerce — Project Context

## 📋 Project Overview

**Savior** is a modern e-commerce platform built with Next.js 16, featuring clothing/apparel sales with features like product catalog, shopping cart, user authentication, admin panel, and order management.

### Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16.1.6 (App Router) |
| **Runtime** | React 19.2.4 |
| **Language** | TypeScript 5 |
| **Authentication** | Clerk (@clerk/nextjs ^6.35.5) |
| **Database** | PostgreSQL via Prisma v7 + @prisma/adapter-pg |
| **UI Components** | shadcn/ui (Radix UI) — 36 components |
| **Styling** | Tailwind CSS v3 + CSS Variables |
| **Images** | Cloudinary (unoptimized: true) |
| **Maps** | Leaflet + react-leaflet |
| **State** | React Context API (CartContext, AuthContext, ConfigContext) |
| **Forms** | React Hook Form + Zod (formToSend.tsx) |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Clerk account (for authentication)
- Cloudinary account (for images)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables (.env)
# See .env.example for required variables

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev      # Start dev server on port 4000
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

---

## 📁 Project Structure

```
Ecommerce-Base/
├── app/
│   ├── (auth)/              # Clerk auth pages (sign-in, sign-up)
│   ├── (protected)/         # Protected routes (profile, orders)
│   ├── admin-panel/         # Admin dashboard
│   ├── api/                 # Route handlers
│   │   ├── (auth)/          # Auth-related APIs
│   │   ├── (public)/        # Public APIs
│   │   └── (user)/          # User-specific APIs
│   ├── collection/          # Product catalog
│   ├── about/               # About page
│   ├── contact/             # Contact page
│   ├── cleanup-session/     # Session cleanup route
│   ├── layout.tsx           # Root layout with ClerkProvider
│   ├── page.tsx             # Homepage
│   ├── error.tsx            # Global error boundary
│   ├── not-found.tsx        # 404 page
│   └── globals.css          # Global styles
├── components/
│   ├── ui/                  # shadcn/ui components (36 activos)
│   ├── header/              # Header components (DesktopNav, MobileNav, UserMenuItems)
│   ├── cart/                # Cart components (ShoppingCartPanel, CartItemsList, CouponInput, CartSummary)
│   ├── checkout/            # Checkout components (formToSend)
│   ├── maps/                # Map components (maps.tsx)
│   ├── shared/              # Shared components (KpiCard, ThemeToggle)
│   ├── header.tsx           # Main header (4.2 KB — refactorizado)
│   ├── header.css           # Header styles
│   └── theme-provider.tsx   # Theme provider for next-themes
├── contexts/
│   ├── AuthContext.tsx      # Auth state (usa useUser() de Clerk)
│   ├── CartContext.tsx      # Shopping cart state
│   └── ConfigContext.tsx    # Global config state (con caché)
├── lib/
│   ├── prisma.ts            # Prisma client singleton
│   ├── env.ts               # Typed environment variables (Zod)
│   ├── utils/               # Utility functions (local-storage.ts, order-calculations.ts)
│   └── schemas/             # Zod schemas (delivery.schema.ts)
├── hooks/                   # Custom React hooks:
│   ├── useUserRole.ts       # Role-based access control
│   ├── useCouponValidator.ts # Coupon validation
│   ├── useRouteCalculation.ts # Route calculation for delivery
│   ├── useCache.ts          # LocalStorage cache utility
│   ├── useConfigData.ts     # Config data access
│   └── use-toast.ts         # Toast notifications
├── types/                   # TypeScript types:
│   ├── products.ts          # CartItem, OrderItem, DeliveryFormData
│   └── index.ts             # Type exports
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── data/                    # Static data files (agencias.ts, cupon.ts)
├── public/                  # Static assets
├── proxy.ts                 # Edge middleware (Next.js 16)
├── next.config.mjs          # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
└── tsconfig.json            # TypeScript configuration
```

---

## 🗄️ Database Schema

Key models in `prisma/schema.prisma`:

- **User** — User accounts (synced with Clerk)
- **Productos** — Product catalog
- **ProductosDestacados** — Featured products
- **Orders** — Customer orders
- **OrderItem** — Order line items
- **Coleccion** — Collections
- **Cupon** — Discount coupons
- **Agencia** — Shipping agencies
- **Categories** — Product categories
- **Review** — Product reviews
- **Setting** — App settings

---

## 🔐 Authentication

The project uses **Clerk** for authentication:

- **Root Layout**: `ClerkProvider` wraps the entire app
- **Protected Routes**: Routes under `(protected)/` and `admin-panel/` require authentication
- **User Roles**: USER, ADMIN, EDITOR (stored in database)
- **Session Cleanup**: `/cleanup-session` route handles logout

### Environment Variables Required

**Archivo**: `.env` (root del proyecto)

```env
# ─── Clerk Authentication ──────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...

# Clerk Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# ─── Database ─────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# ─── Cloudinary (Image Storage) ───────────────────────────
CLOUDINARY_CLOUD_NAME=dxxxxxxx
CLOUDINARY_API_KEY=xxxxxxxxxxxxx
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLOUDINARY_PRESET=xxxxxxx

# ─── Google AI (Review Moderation) ────────────────────────
GEMINI_API_KEY=xxxxxxxxxxxxxxxxxxxxx
GEMINI_MODEL=gemini-1.5-flash

# ─── Application ──────────────────────────────────────────
NODE_ENV=development
```

**Validación**: Las variables son validadas en `lib/env.ts` usando Zod schema.

---

## 🌐 API Routes

**Ubicación**: `app/api/`

### 🔐 Authentication Routes `(app/api/(auth)/)`

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/api/sign-in` | Sign in con Clerk | ❌ |
| `POST` | `/api/sign-up` | Sign up con Clerk | ❌ |

### 👤 User Routes `(app/api/(user)/)`

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/users/:id` | Obtener usuario por Clerk ID | ✅ |
| `GET` | `/api/users` | Listar usuarios | ✅ Admin |
| `POST` | `/api/updateuser` | Actualizar datos del usuario | ✅ |
| `GET` | `/api/orders/:id` | Obtener orden por ID | ✅ |
| `GET` | `/api/orders` | Listar órdenes del usuario | ✅ |
| `POST` | `/api/orders` | Crear nueva orden | ✅ |
| `GET` | `/api/orders/pdf` | Generar PDF de orden | ✅ |

### 🛍️ Public Routes `(app/api/(public)/)`

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/products` | Listar productos (filtros: category, estado) | ❌ |
| `GET` | `/api/products/:id` | Obtener producto por ID | ❌ |
| `GET` | `/api/categories` | Listar categorías | ❌ |
| `GET` | `/api/categories/:id` | Obtener categoría por ID | ❌ |

### 🔧 Admin Routes `(app/api/admin/)`

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/admin/reviews` | Listar reviews para moderación | ✅ Admin |
| `DELETE` | `/api/admin/reviews/:id` | Eliminar review | ✅ Admin |
| `POST` | `/api/admin/reviews` | Crear/actualizar review | ✅ Admin |

### 📦 Product Management `(app/api/)`

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/productos-destacados` | Listar productos destacados | ❌ |
| `POST` | `/api/productos-destacados` | Crear producto destacado | ✅ Admin |
| `DELETE` | `/api/productos-destacados/:id` | Eliminar producto destacado | ✅ Admin |
| `GET` | `/api/inventory` | Obtener inventario | ✅ Admin |
| `GET` | `/api/dashboard/stats` | Estadísticas del dashboard | ✅ Admin |

### 🎫 Coupon Routes `(app/api/cupones/)`

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/cupones` | Listar cupones | ❌ |
| `POST` | `/api/cupones` | Crear cupón | ✅ Admin |
| `DELETE` | `/api/cupones/:id` | Eliminar cupón | ✅ Admin |
| `GET` | `/api/cupones/codigo/:codigo` | Validar cupón por código | ❌ |
| `GET` | `/api/cupones/validate` | Validar cupón (alternativo) | ❌ |

### 🏢 Agency Routes `(app/api/agencias/)`

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/agencias` | Listar agencias de envío | ❌ |
| `POST` | `/api/agencias` | Crear agencia | ✅ Admin |
| `DELETE` | `/api/agencias/:id` | Eliminar agencia | ✅ Admin |

### 🖼️ Cloudinary Routes `(app/api/cloudinary/)`

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/api/cloudinary/upload` | Subir imagen a Cloudinary | ✅ Admin |
| `GET` | `/api/cloudinary/list` | Listar assets en Cloudinary | ✅ Admin |
| `GET` | `/api/cloudinary/folders` | Listar folders en Cloudinary | ✅ Admin |
| `POST` | `/api/cloudinary/folder-create` | Crear folder en Cloudinary | ✅ Admin |
| `DELETE` | `/api/cloudinary/folder-delete` | Eliminar folder en Cloudinary | ✅ Admin |
| `GET` | `/api/cloudinary/folder-assets-count` | Contar assets en folder | ✅ Admin |
| `GET` | `/api/cloudinary/assets` | Listar assets | ✅ Admin |
| `DELETE` | `/api/cloudinary/delete-image` | Eliminar imagen | ✅ Admin |

### ⚙️ Config & Settings `(app/api/)`

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/config` | Obtener configuración de la app | ❌ |
| `GET` | `/api/settings` | Obtener settings | ✅ Admin |
| `POST` | `/api/settings` | Actualizar settings | ✅ Admin |
| `GET` | `/api/fotos` | Obtener fotos de la tienda | ❌ |
| `POST` | `/api/fotos` | Actualizar fotos | ✅ Admin |
| `GET` | `/api/colecciones` | Listar colecciones | ❌ |
| `POST` | `/api/colecciones` | Crear colección | ✅ Admin |
| `DELETE` | `/api/colecciones/:id` | Eliminar colección | ✅ Admin |

### 📊 Reports `(app/api/reports/)`

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/reports/sales` | Reporte de ventas | ✅ Admin |

### 🔔 Webhooks `(app/api/webhooks/)`

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/api/webhooks/clerk` | Webhook de Clerk para sync con DB | 🔐 Secret |

---

## 🗄️ Database Schema Detallado

**Archivo**: `prisma/schema.prisma`

### Enums

```typescript
enum DeliveryLocation {
  Lima        // Lima Metropolitana
  Provincia   // Fuera de Lima
  Null        // Sin definir
}

enum Role {
  USER    // Usuario regular
  ADMIN   // Administrador
  EDITOR  // Editor (puede gestionar productos)
}
```

### Modelos

#### **User** - Usuarios de la aplicación
```prisma
model User {
  id               Int              @id @default(autoincrement())
  email            String           @unique
  name             String?
  deliveryLocation DeliveryLocation @default(Null)
  orders           Orders[]
  reviews          Review[]
  clerkId          String?          @unique
  role             Role             @default(USER)
  location         Json?            // Ubicación del usuario
  address          String?          // Dirección de entrega
  agencia          String?          // Agencia seleccionada
  dni              String?          // DNI del usuario
  phone            String?          // Teléfono
  department       String?          // Departamento/Provincia
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
  
  @@index([clerkId])   // Búsqueda por Clerk ID
  @@index([email])     // Búsqueda por email
  @@index([role])      // Filtrar por rol
}
```

#### **Productos** - Catálogo de productos
```prisma
model Productos {
  id         Int     @id @default(autoincrement())
  name       String
  category   String
  estado     String
  size       String?
  price      Decimal
  image      String
  image2     String?
  image3     String?
  image4     String?
  stock      Int     @default(1)
  destacados ProductosDestacados[]
  orderItems OrderItem[]
  reviews    Review[]
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@index([category])
  @@index([estado])
  @@index([category, estado])
}
```

#### **Orders** - Órdenes de compra
```prisma
model Orders {
  id             Int         @id @default(autoincrement())
  address        String
  agencia        String?
  clientName     String
  clientPhone    String?
  deliveryCost   Decimal     @default(0)
  dni            String?
  getlocation    Json        // Coordenadas {lat, lng}
  locationToSend String      // 'lima_metropolitana' | 'provincia'
  status         String      @default("Pendiente")
  userId         Int
  user           User        @relation(fields: [userId], references: [id])
  orderItems     OrderItem[] @relation("OrderItemsOnOrder")
  totalPrice     Decimal     @default(0)
  totalProducts  Int         @default(0)
  discount       Decimal     @default(0)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  
  @@index([userId])
  @@index([status])
  @@index([userId, status])
  @@index([createdAt(sort: Desc)])
  @@index([status, createdAt])
}
```

#### **OrderItem** - Items de la orden
```prisma
model OrderItem {
  id         Int       @id @default(autoincrement())
  order      Orders    @relation("OrderItemsOnOrder")
  orderId    Int
  producto   Productos @relation(fields: [productoId], references: [id])
  productoId Int
  quantity   Int       @default(1)
  totalPrice Decimal
  unitPrice  Decimal
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  
  @@index([orderId])
  @@index([productoId])
  @@index([orderId, productoId])
}
```

#### **Cupon** - Cupones de descuento
```prisma
model Cupon {
  id           Int     @id @default(autoincrement())
  codigoCupon  String  @default("qwer")
  mostrarCupon Boolean @default(false)
  descuento    Int     @default(0)  // Porcentaje de descuento
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

#### **Review** - Reseñas de productos (con moderación IA)
```prisma
model Review {
  id          Int       @id @default(autoincrement())
  rating      Int       // 1-5 estrellas
  comment     String?
  userId      Int
  user        User      @relation(fields: [userId], references: [id])
  productoId  Int
  producto    Productos @relation(fields: [productoId], references: [id])
  verified    Boolean   @default(false)  // ¿Compró el producto?
  
  // Moderación con IA (Google Gemini)
  aiModerated Boolean   @default(false)
  aiApproved  Boolean?  // true = apta, false = no apta
  aiReason    String?   // Razón si fue rechazada
  aiModel     String?   @default("gemini-1.5-flash")
  aiError     Boolean   @default(false)
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([productoId])
  @@index([userId])
  @@index([verified])
}
```

#### **Otros Modelos**

| Modelo | Descripción | Campos Principales |
|--------|-------------|-------------------|
| `ProductosDestacados` | Productos en destaque | `productoId` (FK), `createdAt` |
| `Coleccion` | Colecciones de ropa | `name`, `price`, `image` |
| `Categories` | Categorías de productos | `name` (unique) |
| `Agencia` | Agencias de envío | `agencias` (array), `minimoDelivery`, `maximoDelivery` |
| `Fotos` | Fotos de la tienda | `imagenIzquierda`, `imagenDerecha`, `fotoTienda` |
| `Setting` | Configuración de la app | `key` (PK), `value` |

---

## 📐 Zod Schemas

**Ubicación**: `lib/schemas/`

### `delivery.schema.ts`
```typescript
const DeliverySchema = z.object({
  clientName: z.string().min(1, "El nombre es requerido"),
  address: z.string().min(1, "La dirección es requerida"),
  locationToSend: z.enum(['lima_metropolitana', 'provincia']),
  deliveryCost: z.number().min(0),
  agencia: z.string().optional(),
  dni: z.string().min(8, "DNI debe tener 8 dígitos").optional(),
  clientPhone: z.string().min(7, "Teléfono inválido").optional(),
  getlocation: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  email: z.string().email().optional()
})
```

### `product.schema.ts`
- Schema para validación de productos (CRUD admin)

### `user.schema.ts`
- Schema para validación de usuarios

### `index.ts`
- Exporta todos los schemas

---

## 🧩 Contextos React

### `CartContext` - Estado del carrito
- **Ubicación**: `contexts/CartContext.tsx`
- **Funciones**: `addToCart`, `removeFromCart`, `clearCart`, `getCartTotal`
- **Persistencia**: localStorage

### `AuthContext` - Estado de autenticación
- **Ubicación**: `contexts/AuthContext.tsx`
- **Proveedor**: Clerk (`useUser()`)
- **Funciones**: `useAuthContext`, `useUserRole`
- **Roles**: USER, ADMIN, EDITOR

### `ConfigContext` - Configuración de la app
- **Ubicación**: `contexts/ConfigContext.tsx`
- **Cache**: localStorage con TTL de 5 minutos
- **Funciones**: `useConfig`, `getSetting`, `getActiveCoupon`, `getCouponByCode`, `refetchConfig`

---

## 🪝 Custom Hooks

| Hook | Descripción | Ubicación |
|------|-------------|-----------|
| `useUserRole` | Verifica si el usuario es ADMIN/EDITOR | `hooks/useUserRole.ts` |
| `useCouponValidator` | Valida cupones de descuento | `hooks/useCouponValidator.ts` |
| `useRouteCalculation` | Calcula rutas y delivery | `hooks/useRouteCalculation.ts` |
| `useCache` | Hook genérico para caché en localStorage | `hooks/useCache.ts` |
| `useConfigData` | Obtiene configuración de la app | `hooks/useConfigData.ts` |
| `use-toast` | Muestra notificaciones toast | `hooks/use-toast.ts` |
| `use-mobile` | Detecta si es dispositivo móvil | `hooks/use-mobile.tsx` |

---

## 🔄 Flujos Principales

### 🛒 Flujo de Compra

1. **Usuario agrega productos al carrito** → `CartContext.addToCart()`
2. **Usuario abre carrito** → `ShoppingCartPanel.tsx`
3. **Usuario ingresa cupón (opcional)** → `useCouponValidator.validate()`
4. **Usuario hace click en "Continuar"** → Muestra `formToSend.tsx`
5. **Usuario completa formulario de delivery**:
   - Lima Metropolitana: Requiere mapa con ubicación
   - Provincia: Requiere agencia, DNI, teléfono
6. **Sistema calcula delivery**:
   - Lima: `distance * 1.2` (usando OpenRouteService)
   - Provincia: S/ 10-15 (según configuración)
7. **Usuario hace click en "Realizar pedido"** → `handleOrderSubmit()`
8. **Orden se guarda en DB** → `POST /api/orders`
9. **Usuario es redirigido a WhatsApp** → Mensaje pre-llenado con detalles de orden

### 📝 Moderación de Reviews con IA

1. **Usuario envía review** → `POST /api/reviews`
2. **Review se guarda con `aiModerated: false`**
3. **Sistema llama a Google Gemini API** → `ai-moderation.ts`
4. **IA evalúa review** (contenido inapropiado, spam, etc.)
5. **Resultado se guarda**:
   - `aiApproved: true` → Review publicada
   - `aiApproved: false` → Review rechazada (con razón en `aiReason`)
   - `aiError: true` → Error en moderación (revisar manualmente)

### 🔄 Sync Clerk ↔ Database

1. **Usuario se registra en Clerk** → Webhook `user.created`
2. **Webhook se dispara** → `POST /api/webhooks/clerk`
3. **Usuario se crea en DB** → `prisma.user.create()` con `clerkId`
4. **Usuario actualiza perfil** → Webhook `user.updated`
5. **DB se actualiza** → `prisma.user.update()`

### 📊 Cálculo de Delivery (Lima)

1. **Usuario marca ubicación en mapa** → `Maps.tsx` click handler
2. **Sistema calcula ruta** → `calculateRoute()` con OpenRouteService API
3. **API retorna distancia en km** → `routeData.distance`
4. **Fórmula aplicada**: `Math.ceil(distancia * 1.2)`
5. **Costo se guarda en formulario** → `setValue('deliveryCost', cost)`

---

## 🎯 Known Issues & TODOs

### Design System

- **Font**: Inter (via `next/font/google`)
- **Colors**: CSS variables in `globals.css` (--primary, --background, --foreground, etc.)
- **Components**: shadcn/ui with custom theming
- **Icons**: lucide-react + react-icons

### Key Components

| Component | Size | Notes |
|-----------|------|-------|
| `header.tsx` | 4.2 KB | Refactorizado: Componentes separados (DesktopNav, MobileNav, UserMenuItems). Navegación principal y mobile con enlaces completos + condicionales por rol |
| `cart/ShoppingCartPanel.tsx` | 5.1 KB | Refactorizado: Componentes separados (CartItemsList, CouponInput, CartSummary) |
| `checkout/formToSend.tsx` | ~20 KB | Refactorizado con React Hook Form + Zod. Usa lib/utils/local-storage.ts para persistencia. **Restaurado**: cálculo de delivery y Link a WhatsApp funcional |
| `maps/maps.tsx` | ~10 KB | **Restaurado**: Lógica completa de cálculo de rutas con OpenRouteService. Fórmula original: `Math.ceil(distancia * 1.2)` |
| `product-card.tsx` | — | Product display card |

---

## ⚠️ Known Issues & TODOs

### High Priority

1. **Webhooks** — Clerk webhooks no completamente implementados para sync con DB
2. **`proxy.ts`** — Middleware configuration incomplete for Next.js 16

### Medium Priority

3. **Performance** — Images unoptimized (`unoptimized: true` in config)
4. **Cache** — `cacheComponents: true` commented out due to Clerk conflicts
5. **Type safety** — Some areas lack proper TypeScript typing

### Low Priority

6. **Bundle size** — Could benefit from code splitting analysis
7. **Accessibility** — UI needs WCAG audit

### ✅ Completed

- **Refactorización Masiva de Código** — Marzo 2026:
  - **formToSend.tsx**: 762 → ~565 líneas (-26%) — React Hook Form + Zod implementado
  - **Maps/Maps.tsx**: 735 → ~260 líneas (-65%) — Lógica restaurada con OpenRouteService
  - **header.tsx**: 380 → 122 líneas (-68%) — Componentes DesktopNav, MobileNav, UserMenuItems
  - **ShoppingCartPanel.tsx**: 256 → 144 líneas (-44%) — Componentes CartItemsList, CouponInput, CartSummary
  - **ConfigContext.tsx**: 313 → 238 líneas (-24%) — Hook useCache.ts para caché
  - **Total**: 2,446 → ~1,330 líneas (-46%)

- **Fixes Post-Refactorización**:
  - ✅ **Mapa: Click para marcar ubicación** — Restaurado evento `map.on('click')`
  - ✅ **Cálculo de delivery** — Restaurada fórmula original: `Math.ceil(distancia * 1.2)`
  - ✅ **Link a WhatsApp** — Cambiado de `Link` a `<a>` nativo con `target='_blank'`
  - ✅ **ConfigContext: Maximum update depth** — Eliminado `configData` de dependencias

- **Limpieza de Código Muerto**:
  - 4 archivos eliminados (UserMenu.tsx, formDataUser.tsx, MapComponent.tsx, use-toast.ts duplicado)
  - 14 componentes UI no utilizados eliminados
  - 6 dependencias npm eliminadas (39 paquetes totales)

- **Consolidación de Duplicados**:
  - KpiCard unificado (2 versiones → 1 componente en components/shared/)
  - Interfaces de producto consolidadas en types/products.ts
  - Hook useCouponValidator.ts para validación de cupones

- **Migración a Clerk Nativo**:
  - AuthContext migrado de fetch manual a useUser() de Clerk
  - userRole ahora se obtiene de publicMetadata de Clerk

- **Hooks Personalizados Creados**:
  - useCouponValidator.ts — Validación de cupones
  - useRouteCalculation.ts — Cálculo de rutas de delivery
  - useCache.ts — Utilidad para caché en localStorage
  - local-storage.ts — Funciones genéricas de persistencia

- **Loading states** — `loading.tsx` implemented ✓
- **Header UserButton.MenuItems** — Limpiado para mostrar solo "Admin Savior" (ADMIN/EDITOR) y "Mis pedidos". Navegación principal y mobile restauradas con enlaces completos + condicionales por rol
- **Admin Panel Responsive** — Todo el admin panel ahora es fully responsive:
  - **Sidebar mobile** — Menú hamburguesa con drawer animado y overlay (`page.tsx`)
  - **Tablas responsive (primera fase)** — Headers sticky, padding reducido en mobile (`px-3 py-3 md:px-6 md:py-4`), texto adaptable (`text-xs md:text-sm`), imágenes responsive, botones con touch targets mínimos (36x36px)
  - **Modales responsive** — Padding adaptable (`p-4 md:p-6`), títulos responsive, botones de cierre accesibles (44x44px), layouts verticales en mobile (`flex-col sm:flex-row`)
  - **Formularios responsive** — Inputs con altura mínima (44px), botones ancho completo en mobile (`w-full sm:w-auto`), grids adaptables (`grid-cols-1 md:grid-cols-2`)
  - **KPIs** — Grid responsive mantenido (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`), tamaños de fuente adaptables
  - **Archivos modificados**: `page.tsx`, `Orders.tsx`, `UserManagement.tsx`, `ReviewsManagement.tsx`, `SettingsManagement.tsx`, `CuponesCRUD.tsx`, `CategoriesCRUD.tsx`, `ProductsTable.tsx`, `ProductForm.tsx`, `KpiCard.tsx`
- **Tablas con Columnas Prioritarias** — Implementado patrón de columnas ocultas en mobile para mejor visualización:
  - **Orders.tsx** (7 → 4 columnas en mobile): Ocultar ID (`hidden sm:table-cell`), Productos (`hidden lg:table-cell`), Destino (`hidden lg:table-cell`)
  - **ProductsTable.tsx** (8 → 4 columnas en mobile): Ocultar Categoría (`hidden lg:table-cell`), Estado (`hidden sm:table-cell`), Stock (`hidden lg:table-cell`), Destacado (`hidden md:table-cell`)
  - **UserManagement.tsx** (6 → 3 columnas en mobile): Ocultar Contacto (`hidden lg:table-cell`), Pedidos (`hidden md:table-cell`), Registro (`hidden lg:table-cell`)
  - **ReviewsManagement.tsx** (6 → 4 columnas en mobile): Ocultar Usuario (`hidden lg:table-cell`), Fecha (`hidden md:table-cell`)
  - **SettingsManagement.tsx** (Colecciones) (5 → 3 columnas en mobile): Ocultar Actualizado (`hidden md:table-cell`), Creado (`hidden lg:table-cell`)
  - **Breakpoints**: Mobile (< 640px): 3-4 columnas | Tablet (640px-768px): 5-6 columnas | Desktop (≥ 768px): todas las columnas
- **ImageManager Refactorizado** — Ahora soporta múltiples casos de uso con prop `maxImages`:
  - **`maxImages` prop**: Controla cuántas imágenes se pueden seleccionar (default: 4)
  - **ProductForm.tsx**: `maxImages={4}` — Permite seleccionar 1-4 imágenes para productos
  - **SettingsManagement.tsx**: `maxImages={1}` — Solo permite 1 imagen por campo (imagenIzquierda, imagenDerecha, fotoTienda)
  - **Labels dinámicos**: "Imagen" vs "Imágenes del Producto" según cantidad
  - **CloudinaryGallery**: Ahora recibe `maxSeleted` dinámico en lugar de hardcoded
  - **Archivos modificados**: `ImageManager.tsx`, `ProductForm.tsx`, `SettingsManagement.tsx`

---

## 📝 Development Conventions

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier configured (`.prettierrc`)
- **Linting**: ESLint with Next.js config
- **Imports**: Absolute paths via `@/*` alias

### Testing Practices

- No test framework currently configured
- Manual testing via development server

### Commit Messages

No specific convention enforced. Standard practice:
```
<type>(<scope>): <description>

feat(products): add product filtering
fix(cart): resolve quantity update bug
```

---

## 🔧 Configuration Highlights

### `next.config.mjs`

```javascript
{
  output: 'standalone',              // Docker deployment
  images: {
    remotePatterns: [{
      hostname: 'res.cloudinary.com' // Cloudinary images
    }],
    unoptimized: true                // Cloudinary handles optimization
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true
    // cacheComponents: true — commented out (Clerk conflicts)
  },
  serverExternalPackages: ['@prisma/client']
}
```

### `tsconfig.json`

- **Strict mode**: Enabled
- **Module resolution**: `bundler`
- **Paths**: `@/*` → root directory
- **Incremental**: Enabled for faster builds

### `prisma/schema.prisma`

- **Generator**: Custom output to `app/generated/prisma`
- **Adapter**: `@prisma/adapter-pg` for direct PostgreSQL
- **Indexes**: Optimized for common queries (clerkId, email, category)

---

## 📚 Additional Documentation

- **`skills-lock.json`** — Skill version tracking
- **`types/products.ts`** — Shared types (CartItem, OrderItem, DeliveryFormData)
- **`hooks/`** — Custom hooks documentation:
  - `useCouponValidator.ts` — Coupon validation
  - `useRouteCalculation.ts` — Delivery route calculation
  - `useCache.ts` — LocalStorage cache utility
  - `useUserRole.ts` — Role-based access control

---

## 🆘 Troubleshooting

### Build Errors

- **TypeScript errors**: Check `tsconfig.json` and run `npx tsc --noEmit`
- **Prisma errors**: Run `npx prisma generate` and `npx prisma migrate dev`
- **Clerk errors**: Verify environment variables in `.env`
- **Hook errors**: Check `hooks/` directory for custom hook implementations

### Development Server

- **Port**: Runs on `http://localhost:4000` (configured in `package.json`)
- **Hot reload**: Enabled by default
- **Turbopack**: Active in Next.js 16.1.6

### Database

- **Connection**: Via Prisma with PostgreSQL adapter
- **Migrations**: `npx prisma migrate dev`
- **Studio**: `npx prisma studio`

### Cache Issues

- **LocalStorage cache**: Clear with `localStorage.removeItem('app_config_cache')`
- **Config cache**: Call `refetchConfig()` from `useConfig()` hook to force refresh

### Delivery/Maps Issues

- **Mapa no marca ubicación**: Verificar que `map.on('click')` esté configurado en `Maps.tsx`
- **Delivery no calcula**: Revisar fórmula en `displayRoute()`: `Math.ceil(routeData.distance * 1.2)`
- **WhatsApp no abre**: Verificar que el botón use `<a>` nativo en lugar de `Link` de Next.js

---

## 📞 Support

For issues or questions:
1. Check `skills-lock.json` for skill version tracking
2. Review `types/products.ts` for shared type definitions
3. Check custom hooks in `hooks/` directory for reusable logic
4. **Delivery/Maps**: Review `components/Maps/Maps.tsx` for route calculation logic
5. Consult Next.js 16 and Clerk v6 documentation

---

*Last updated: March 2026 — Refactorización + Fixes Completados*
