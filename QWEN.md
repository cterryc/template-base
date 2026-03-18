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
│   ├── cart/                # Cart components (CartItemsList, CouponInput, CartSummary)
│   ├── checkout/            # Checkout components
│   ├── header.tsx           # Main header (4.2 KB — refactorizado)
│   ├── ShoppingCartPanel.tsx # Cart sidebar (5.1 KB — refactorizado)
│   ├── formToSend.tsx       # Checkout form (19.8 KB — refactorizado con RHF+Zod)
│   └── Maps/                # Leaflet map components (8.5 KB — refactorizado)
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

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...

# Database
DATABASE_URL=postgresql://...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NEXT_PUBLIC_CLOUDINARY_PRESET=...
```

---

## 🎨 UI/UX

### Design System

- **Font**: Inter (via `next/font/google`)
- **Colors**: CSS variables in `globals.css` (--primary, --background, --foreground, etc.)
- **Components**: shadcn/ui with custom theming
- **Icons**: lucide-react + react-icons

### Key Components

| Component | Size | Notes |
|-----------|------|-------|
| `header.tsx` | 4.2 KB | Refactorizado: Componentes separados (DesktopNav, MobileNav, UserMenuItems). Navegación principal y mobile con enlaces completos + condicionales por rol |
| `ShoppingCartPanel.tsx` | 5.1 KB | Refactorizado: Componentes separados (CartItemsList, CouponInput, CartSummary) |
| `formToSend.tsx` | ~20 KB | Refactorizado con React Hook Form + Zod. Usa lib/utils/local-storage.ts para persistencia. **Restaurado**: cálculo de delivery y Link a WhatsApp funcional |
| `Maps/Maps.tsx` | ~10 KB | **Restaurado**: Lógica completa de cálculo de rutas con OpenRouteService. Fórmula original: `Math.ceil(distancia * 1.2)` |
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
