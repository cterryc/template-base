# Savior E-Commerce 🛍️

> Modern e-commerce platform built with Next.js 16, Clerk, Prisma, and shadcn/ui

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)

---

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Project Structure](#-project-structure)
- [Database](#-database)
- [Authentication](#-authentication)
- [Features in Detail](#-features-in-detail)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Customer Features

- 🛒 **Product Catalog** — Browse products by category with filtering and sorting
- 🔍 **Search** — Find products by name or category
- 🛍️ **Shopping Cart** — Add/remove items with real-time updates
- 👤 **User Accounts** — Secure authentication via Clerk
- 📍 **Delivery Options** — Lima Metropolitana or Provincia shipping
- 💳 **Order Management** — View order history and status
- ⭐ **Product Reviews** — Rate and review purchased products
- 📱 **Responsive Design** — Mobile-first, works on all devices

### Admin Features

- 📊 **Dashboard** — Sales analytics and KPIs
- 📦 **Product Management** — CRUD operations for products
- 🏷️ **Category Management** — Organize products by category
- 📋 **Order Management** — View and update order status
- 👥 **User Management** — View and manage customer accounts
- 🎟️ **Coupon System** — Create and manage discount codes
- ⭐ **Review Moderation** — Approve/reject product reviews

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16.1.6 (App Router) |
| **Language** | TypeScript 5 |
| **Authentication** | Clerk v6 |
| **Database** | PostgreSQL |
| **ORM** | Prisma v7 |
| **UI Components** | shadcn/ui (Radix UI) |
| **Styling** | Tailwind CSS v3 |
| **Forms** | React Hook Form + Zod |
| **State Management** | React Context API |
| **Images** | Cloudinary |
| **Maps** | Leaflet + react-leaflet |
| **Charts** | ReCharts |
| **Icons** | Lucide React + react-icons |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** package manager

### Required Accounts

- [Clerk](https://clerk.com/) — Authentication
- [Cloudinary](https://cloudinary.com/) — Image hosting
- PostgreSQL database (local or cloud service like [Neon](https://neon.tech) or [Supabase](https://supabase.com))

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ecommerce-base.git
cd ecommerce-base
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials (see [Environment Variables](#-environment-variables)).

### 4. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your data
npx prisma studio
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:4000](http://localhost:4000) to see your application.

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

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
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce?schema=public

# ─── Cloudinary (Image Storage) ───────────────────────────
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_PRESET=your-preset

# ─── Application ──────────────────────────────────────────
NODE_ENV=development
```

### Getting Your Keys

| Service | How to Get Keys |
|---------|----------------|
| **Clerk** | [Dashboard](https://dashboard.clerk.com) → API Keys |
| **Cloudinary** | [Dashboard](https://cloudinary.com/console) → Settings |
| **Database URL** | Your PostgreSQL connection string |

---

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start dev server on port 4000

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npx prisma generate  # Generate Prisma client
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate dev    # Create and apply migration
npx prisma db push        # Push schema to DB without migration
```

---

## 📁 Project Structure

```
ecommerce-base/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── sign-in/         # Sign-in page
│   │   └── sign-up/         # Sign-up page
│   ├── (protected)/         # Protected routes
│   │   ├── orders/          # User orders
│   │   └── profile/         # User profile
│   ├── admin-panel/         # Admin dashboard
│   │   ├── components/      # Admin components
│   │   └── page.tsx         # Admin home
│   ├── api/                 # API routes
│   │   ├── (auth)/          # Auth APIs
│   │   ├── (public)/        # Public APIs
│   │   └── (user)/          # User APIs
│   ├── collection/          # Product catalog
│   │   └── [id]/            # Product detail page
│   ├── about/               # About page
│   ├── contact/             # Contact page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   ├── error.tsx            # Error boundary
│   └── globals.css          # Global styles
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── header.tsx           # Main header
│   ├── ShoppingCartPanel.tsx # Cart sidebar
│   ├── formToSend.tsx       # Checkout form
│   └── Maps/                # Map components
├── contexts/
│   ├── AuthContext.tsx      # Auth state
│   ├── CartContext.tsx      # Cart state
│   └── ConfigContext.tsx    # Config state
├── lib/
│   ├── prisma.ts            # Prisma client
│   ├── env.ts               # Env validation
│   └── utils/               # Utilities
├── prisma/
│   ├── schema.prisma        # DB schema
│   └── migrations/          # Migrations
├── hooks/                   # Custom hooks
├── public/                  # Static assets
├── proxy.ts                 # Edge middleware
└── next.config.mjs          # Next.js config
```

---

## 🗄️ Database

### Schema Overview

The application uses Prisma ORM with PostgreSQL. Key models:

- **User** — Customer accounts (synced with Clerk)
- **Productos** — Product catalog with images, prices, stock
- **ProductosDestacados** — Featured products
- **Orders** — Customer orders with status tracking
- **OrderItem** — Order line items
- **Categories** — Product categories
- **Review** — Product reviews and ratings
- **Cupon** — Discount coupons
- **Agencia** — Shipping agencies for Provincia delivery
- **Setting** — Application settings

### Database Commands

```bash
# View database in GUI
npx prisma studio

# Create new migration
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Deploy to production
npx prisma migrate deploy
```

---

## 🔐 Authentication

The application uses **Clerk** for secure authentication:

### Features

- ✅ Email/password authentication
- ✅ Social login (Google, Facebook, etc.)
- ✅ Password reset flow
- ✅ Email verification
- ✅ Session management
- ✅ Role-based access control (USER, ADMIN, EDITOR)

### Protected Routes

| Route | Access |
|-------|--------|
| `/` | Public |
| `/collection` | Public |
| `/about` | Public |
| `/contact` | Public |
| `/sign-in` | Public |
| `/sign-up` | Public |
| `/orders` | Authenticated users |
| `/profile` | Authenticated users |
| `/admin-panel` | Admin/Editor only |

---

## 📦 Features in Detail

### Product Catalog

- **Filtering** — By category, price range
- **Sorting** — By name, price (asc/desc), newest
- **Pagination** — 16 products per page
- **Product Details** — Images, description, reviews, related products

### Shopping Cart

- **Add to Cart** — With size selection
- **Update Quantity** — Increase/decrease items
- **Remove Items** — Delete from cart
- **Persistent Cart** — Saved in localStorage
- **Cart Sidebar** — Slide-out panel for easy access

### Checkout Process

1. **Cart Review** — View items and total
2. **Delivery Type** — Lima Metropolitana or Provincia
3. **Location/Address** — Map picker for Lima, address form for Provincia
4. **Coupon Code** — Apply discount if available
5. **Order Confirmation** — Send to WhatsApp + save to database

### Admin Panel

- **Dashboard** — Sales metrics, recent orders, inventory value
- **Products** — CRUD with image upload to Cloudinary
- **Orders** — View, filter, update status
- **Collections** — Manage featured collections
- **Coupons** — Create/edit discount codes
- **Settings** — Configure delivery costs, phone numbers, etc.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for all new code
- Follow existing code style (Prettier + ESLint)
- Write meaningful commit messages
- Test your changes locally before submitting

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For questions or issues:

- **Documentation** — See `QWEN.md` and `PROJECT-UPDATE-BY-SKILLS.md`
- **Issues** — Open an issue on GitHub
- **Email** — your-email@example.com

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) — React framework
- [Clerk](https://clerk.com/) — Authentication
- [Prisma](https://prisma.io/) — Database ORM
- [shadcn/ui](https://ui.shadcn.com/) — UI components
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [Cloudinary](https://cloudinary.com/) — Image hosting

---

**Built with ❤️ using Next.js 16**
