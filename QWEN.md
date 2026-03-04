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
│   ├── header.tsx           # Main header (11 KB)
│   ├── ShoppingCartPanel.tsx # Cart sidebar (9 KB)
│   ├── formToSend.tsx       # Checkout form (23 KB — needs refactoring)
│   └── Maps/                # Leaflet map components
├── contexts/
│   ├── AuthContext.tsx      # Auth state (should migrate to Clerk auth())
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
| `header.tsx` | 11 KB | Main navigation, cart trigger, user menu |
| `ShoppingCartPanel.tsx` | 9 KB | Slide-out cart panel |
| `formToSend.tsx` | 23 KB | Checkout form (needs RHF+Zod refactor) |
| `product-card.tsx` | — | Product display card |

---

## ⚠️ Known Issues & TODOs

### High Priority

1. **`formToSend.tsx`** — 23 KB monolithic component, needs React Hook Form + Zod refactor
2. **`AuthContext.tsx`** — Reimplements Clerk functionality, should use `auth()` directly
3. **Webhooks** — Clerk webhooks not fully implemented for DB sync
4. **`proxy.ts`** — Middleware configuration incomplete for Next.js 16

### Medium Priority

5. **Performance** — Images unoptimized (`unoptimized: true` in config)
6. **Cache** — `cacheComponents: true` commented out due to Clerk conflicts
7. **Loading states** — Missing `loading.tsx` in key routes
8. **Type safety** — Some areas lack proper TypeScript typing

### Low Priority

9. **Bundle size** — Could benefit from code splitting analysis
10. **Accessibility** — UI needs WCAG audit
11. **Structure** — Consider feature-based folder organization

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

- **`PROJECT-UPDATE-BY-SKILLS.md`** — Comprehensive improvement plan with 15 tasks
- **`NEW-FEATURES-PLAN.md`** — Feature implementation roadmap
- **`.agent/skills/`** — AI skill definitions for code generation
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
1. Check `PROJECT-UPDATE-BY-SKILLS.md` for planned improvements
2. Review `.agent/skills/` for implementation patterns
3. Consult Next.js 16 and Clerk v6 documentation

---

*Last updated: March 2026*
