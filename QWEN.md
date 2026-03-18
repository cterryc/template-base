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
| **UI Components** | shadcn/ui (Radix UI) — 50+ components |
| **Styling** | Tailwind CSS v3 + CSS Variables |
| **Images** | Cloudinary (unoptimized: true) |
| **Maps** | Leaflet + react-leaflet |
| **Charts** | ReCharts |
| **State** | React Context API (CartContext, AuthContext, ConfigContext) |
| **Forms** | Manual state (migration to React Hook Form + Zod planned) |

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
│   ├── ui/                  # shadcn/ui components (50+)
│   ├── header.tsx           # Main header (14.3 KB)
│   ├── ShoppingCartPanel.tsx # Cart sidebar (9 KB)
│   ├── formToSend.tsx       # Checkout form (23.6 KB — needs RHF+Zod refactor)
│   └── Maps/                # Leaflet map components
├── contexts/
│   ├── AuthContext.tsx      # Auth state (uses Clerk useAuth())
│   ├── CartContext.tsx      # Shopping cart state
│   └── ConfigContext.tsx    # Global config state
├── lib/
│   ├── prisma.ts            # Prisma client singleton
│   ├── env.ts               # Typed environment variables (Zod)
│   ├── utils/               # Utility functions
│   └── schemas/             # Zod schemas (in progress)
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── hooks/                   # Custom React hooks
├── data/                    # Static data files
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
| `header.tsx` | 14.3 KB | Navegación principal (Home, Productos, Nosotros, Contactanos). UserButton.MenuItems limpio: solo "Admin Savior" (ADMIN/EDITOR) y "Mis pedidos". Menú mobile incluye enlaces esenciales + condicionales por rol |
| `ShoppingCartPanel.tsx` | 9 KB | Slide-out cart panel |
| `formToSend.tsx` | 23.6 KB | Checkout form (needs RHF+Zod refactor) |
| `product-card.tsx` | — | Product display card |

---

## ⚠️ Known Issues & TODOs

### High Priority

1. **`formToSend.tsx`** — 23.6 KB monolithic component, needs React Hook Form + Zod refactor
2. **Webhooks** — Clerk webhooks not fully implemented for DB sync
3. **`proxy.ts`** — Middleware configuration incomplete for Next.js 16

### Medium Priority

4. **Performance** — Images unoptimized (`unoptimized: true` in config)
5. **Cache** — `cacheComponents: true` commented out due to Clerk conflicts
6. **Type safety** — Some areas lack proper TypeScript typing

### Low Priority

7. **Bundle size** — Could benefit from code splitting analysis
8. **Accessibility** — UI needs WCAG audit
9. **Structure** — Consider feature-based folder organization

### ✅ Completed

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

---

## 🆘 Troubleshooting

### Build Errors

- **TypeScript errors**: Check `tsconfig.json` and run `npx tsc --noEmit`
- **Prisma errors**: Run `npx prisma generate` and `npx prisma migrate dev`
- **Clerk errors**: Verify environment variables in `.env`

### Development Server

- **Port**: Runs on `http://localhost:4000` (configured in `package.json`)
- **Hot reload**: Enabled by default
- **Turbopack**: Active in Next.js 16.1.6

### Database

- **Connection**: Via Prisma with PostgreSQL adapter
- **Migrations**: `npx prisma migrate dev`
- **Studio**: `npx prisma studio`

---

## 📞 Support

For issues or questions:
1. Check `skills-lock.json` for skill version tracking
2. Consult Next.js 16 and Clerk v6 documentation

---

*Last updated: March 2026*
