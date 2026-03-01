# NUEVAS FEATURES — Plan de Implementación

> **Propósito:** Este documento detalla el plan para implementar dos nuevas features:
> 1. Página de detalle de producto `/collection/[id]`
> 2. Sistema de reviews de productos
>
> **Fecha de creación:** 2026-02-28
> **Estado:** Pendiente de implementación
> **Skills requeridas:** Ver sección "Skills por Feature" más abajo

---

## 🚦 Skills por Feature

### Feature 1: Página de Detalle `/collection/[id]`

| Tarea | Skill | Ruta SKILL.md | Prioridad |
|-------|-------|---------------|-----------|
| Crear ruta dinámica `[id]` | `next-best-practices` | `.agents/skills/next-best-practices/SKILL.md` | 🔴 Alta |
| Optimizar imágenes del producto | `vercel-react-best-practices` | `.agents/skills/vercel-react-best-practices/SKILL.md` | 🟠 Media |
| Metadata dinámica (SEO) | `next-best-practices` → Metadata | `.agents/skills/next-best-practices/SKILL.md#metadata` | 🟠 Media |
| Componente add-to-cart | `react-hook-form-zod` | `.agents/skills/react-hook-form-zod/SKILL.md` | 🟠 Media |
| Productos relacionados | `next-best-practices` → RSC | `.agents/skills/next-best-practices/SKILL.md` | 🟡 Normal |

### Feature 2: Sistema de Reviews

| Tarea | Skill | Ruta SKILL.md | Prioridad |
|-------|-------|---------------|-----------|
| Modelo Review en Prisma | `prisma-expert` | `.agents/skills/prisma-expert/SKILL.md` | 🔴 Alta |
| Server Actions para reviews | `next-best-practices` → Server Actions | `.agents/skills/next-best-practices/SKILL.md` | 🔴 Alta |
| Formulario con validación | `react-hook-form-zod` | `.agents/skills/react-hook-form-zod/SKILL.md` | 🟠 Media |
| Componente estrellas | `shadcn-ui` | `.agents/skills/shadcn-ui/SKILL.md` | 🟡 Normal |
| Verified badge (compra) | `architecture-patterns` | `.agents/skills/architecture-patterns/SKILL.md` | 🟡 Normal |
| Cache y revalidación | `next-cache-components` | `.agents/skills/next-cache-components/SKILL.md` | 🟠 Media |

---

## 📋 Resumen Ejecutivo

| Feature | Complejidad | Tiempo estimado | Dependencias |
|---------|-------------|-----------------|--------------|
| Página de detalle | Media | 2-3 horas | Ninguna |
| Sistema de reviews | Media-Alta | 4-5 horas | Schema Prisma nuevo |

**Total estimado:** 6-8 horas de desarrollo

---

## 🎯 Feature 1: Página de Detalle de Producto

### URL Pattern
```
/collection/[id]
```

### Estructura de Archivos

```
app/collection/[id]/
├── page.tsx                  # Server Component — datos del producto
├── loading.tsx               # Loading state (skeleton)
├── not-found.tsx             # 404 personalizado
└── add-to-cart-button.tsx    # Client Component — botón interactivo
```

### Archivos a crear

#### 1. `app/collection/[id]/page.tsx` (Server Component)

**Propósito:** Mostrar detalles completos del producto

**Características:**
- Fetch directo a Prisma (sin API intermedia)
- Metadata dinámica (título, descripción, OG tags)
- Productos relacionados (misma categoría)
- Breadcrumbs de navegación
- Precio, stock, tallas disponibles
- Galería de imágenes (imagen principal + secundaria)

**Código de referencia:**

```typescript
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import { AddToCartButton } from './add-to-cart-button'
import { ProductReviews } from './reviews/reviews-list'
import ProductCard from '@/components/product-card'
import Image from 'next/image'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

// Metadata dinámica
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const product = await prisma.productos.findUnique({
    where: { id: parseInt(id) }
  })

  if (!product) {
    return {
      title: 'Producto no encontrado'
    }
  }

  return {
    title: `${product.name} | Savior`,
    description: product.description || `Compra ${product.name} al mejor precio`,
    openGraph: {
      images: [product.image],
      title: product.name,
      description: `Precio: S/ ${product.price}`,
      type: 'product'
    }
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params
  const product = await prisma.productos.findUnique({
    where: { id: parseInt(id) },
    include: {
      destacados: true
    }
  })

  if (!product) {
    notFound()
  }

  // Productos relacionados (misma categoría)
  const relatedProducts = await prisma.productos.findMany({
    where: {
      category: product.category,
      id: { not: product.id }
    },
    take: 4
  })

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Breadcrumbs */}
      <nav className='mb-6 text-sm text-muted-foreground'>
        <ol className='flex space-x-2'>
          <li><Link href='/'>Home</Link></li>
          <li>/</li>
          <li><Link href='/collection'>Colección</Link></li>
          <li>/</li>
          <li className='text-foreground'>{product.name}</li>
        </ol>
      </nav>

      {/* Producto principal */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-12'>
        {/* Imágenes */}
        <div className='space-y-4'>
          <Image
            src={product.image}
            alt={product.name}
            width={600}
            height={600}
            className='rounded-lg'
            priority
          />
          {product.image2 && (
            <Image
              src={product.image2}
              alt={`${product.name} - vista 2`}
              width={300}
              height={300}
              className='rounded-lg'
            />
          )}
        </div>

        {/* Información */}
        <div>
          <h1 className='text-3xl font-bold mb-2'>{product.name}</h1>
          
          {/* Precio */}
          <div className='text-2xl font-bold text-primary mb-4'>
            S/ {Number(product.price).toFixed(2)}
          </div>

          {/* Stock */}
          <div className={`mb-4 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? '✓ En stock' : '✗ Agotado'}
          </div>

          {/* Tallas (si aplica) */}
          {product.size && (
            <div className='mb-6'>
              <h3 className='font-semibold mb-2'>Tallas disponibles:</h3>
              <div className='flex space-x-2'>
                {product.size.split('-').map((size) => (
                  <span key={size.trim()} className='px-3 py-1 border rounded'>
                    {size.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Botón de carrito */}
          <AddToCartButton product={product} />

          {/* Descripción */}
          {product.estado && (
            <div className='mt-6 p-4 bg-muted rounded-lg'>
              <h3 className='font-semibold mb-2'>Estado:</h3>
              <p className='text-muted-foreground'>{product.estado}</p>
            </div>
          )}
        </div>
      </div>

      {/* Productos relacionados */}
      {relatedProducts.length > 0 && (
        <section className='mb-12'>
          <h2 className='text-2xl font-bold mb-6'>Productos relacionados</h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <ProductReviews productId={product.id} />
    </div>
  )
}
```

---

#### 2. `app/collection/[id]/loading.tsx`

**Propósito:** Skeleton mientras carga el producto

```typescript
export default function ProductDetailLoading() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-12'>
        {/* Skeleton imágenes */}
        <div className='space-y-4'>
          <div className='w-full aspect-square bg-muted animate-pulse rounded-lg' />
          <div className='w-full aspect-video bg-muted animate-pulse rounded-lg' />
        </div>

        {/* Skeleton información */}
        <div className='space-y-4'>
          <div className='h-10 w-3/4 bg-muted animate-pulse rounded' />
          <div className='h-8 w-1/2 bg-muted animate-pulse rounded' />
          <div className='h-6 w-1/3 bg-muted animate-pulse rounded' />
          <div className='h-20 w-full bg-muted animate-pulse rounded' />
        </div>
      </div>

      {/* Skeleton relacionados */}
      <div className='space-y-4'>
        <div className='h-8 w-48 bg-muted animate-pulse rounded' />
        <div className='grid grid-cols-4 gap-4'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='aspect-square bg-muted animate-pulse rounded' />
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

#### 3. `app/collection/[id]/not-found.tsx`

**Propósito:** Página 404 para producto no encontrado

```typescript
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ProductNotFound() {
  return (
    <div className='container mx-auto px-4 py-16 text-center'>
      <h1 className='text-6xl font-bold mb-4'>404</h1>
      <h2 className='text-2xl font-semibold mb-4'>Producto no encontrado</h2>
      <p className='text-muted-foreground mb-8'>
        El producto que buscas no existe o ha sido eliminado.
      </p>
      <Button asChild>
        <Link href='/collection'>Ver colección completa</Link>
      </Button>
    </div>
  )
}
```

---

#### 4. `app/collection/[id]/add-to-cart-button.tsx` (Client Component)

**Propósito:** Botón interactivo de "Añadir al carrito"

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { MdOutlineShoppingCart } from 'react-icons/md'
import { FiCheckCircle } from 'react-icons/fi'
import { ImSpinner2 } from 'react-icons/im'

interface Product {
  id: number
  name: string
  price: number
  image: string
  size?: string
  stock: number
}

export function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleAddToCart = async () => {
    setButtonState('loading')
    
    setTimeout(() => {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image,
        size: selectedSize
      })
      setButtonState('success')
      
      setTimeout(() => {
        setButtonState('idle')
      }, 2000)
    }, 500)
  }

  const isOutOfStock = product.stock === 0
  const hasSizes = product.size && product.size.trim() !== ''
  const sizes = hasSizes ? product.size.split('-').map(s => s.trim()) : []

  return (
    <div className='space-y-4'>
      {/* Selector de tallas */}
      {hasSizes && (
        <div>
          <label className='block text-sm font-medium mb-2'>
            Selecciona tu talla:
          </label>
          <div className='flex flex-wrap gap-2'>
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 border rounded-md transition-colors ${
                  selectedSize === size
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:bg-muted'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          {!selectedSize && (
            <p className='text-sm text-destructive mt-1'>
              Por favor selecciona una talla
            </p>
          )}
        </div>
      )}

      {/* Selector de cantidad */}
      <div>
        <label className='block text-sm font-medium mb-2'>
          Cantidad:
        </label>
        <div className='flex items-center space-x-2'>
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className='w-10 h-10 border rounded-md flex items-center justify-center hover:bg-muted'
          >
            -
          </button>
          <span className='w-12 text-center'>{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className='w-10 h-10 border rounded-md flex items-center justify-center hover:bg-muted'
            disabled={quantity >= product.stock}
          >
            +
          </button>
        </div>
      </div>

      {/* Botón de añadir */}
      <Button
        onClick={handleAddToCart}
        disabled={
          isOutOfStock ||
          buttonState === 'loading' ||
          buttonState === 'success' ||
          (hasSizes && !selectedSize)
        }
        className='w-full h-12 text-lg'
      >
        {buttonState === 'loading' && (
          <ImSpinner2 className='animate-spin mr-2' />
        )}
        {buttonState === 'success' && (
          <FiCheckCircle className='mr-2 text-green-600' />
        )}
        {buttonState === 'idle' && isOutOfStock ? (
          'Agotado'
        ) : buttonState === 'idle' ? (
          <>
            Añadir al carrito <MdOutlineShoppingCart className='ml-2' />
          </>
        ) : buttonState === 'success' ? (
          '¡Añadido!'
        ) : (
          'Añadiendo...'
        )}
      </Button>
    </div>
  )
}
```

---

## 🎯 Feature 2: Sistema de Reviews

### Estructura de Archivos

```
app/collection/[id]/reviews/
├── page.tsx                  # Server Component — lista de reviews
├── actions.ts                # Server Actions — crear/validar reviews
├── create-review-form.tsx    # Client Component — formulario
├── reviews-list.tsx          # Componente reutilizable — lista
├── stars-display.tsx         # Componente visual — estrellas
└── verified-badge.tsx        # Componente — badge "Compra verificada"
```

### Paso 1: Schema Prisma

#### Editar `prisma/schema.prisma`

Agregar al final del archivo, antes del cierre:

```prisma
model Review {
  id         Int       @id @default(autoincrement())
  rating     Int       // 1-5 estrellas
  comment    String?
  userId     Int
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  productoId Int
  producto   Productos @relation(fields: [productoId], references: [id], onDelete: Cascade)
  verified   Boolean   @default(false) // ¿Compró el producto?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  @@index([productoId])
  @@index([userId])
  @@index([verified])
}
```

**Comandos a ejecutar:**

```bash
# Crear migración
npx prisma migrate dev --name add-review-model

# Regenerar cliente Prisma
npx prisma generate
```

---

### Paso 2: Server Actions

#### `app/collection/[id]/reviews/actions.ts`

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

// Schema de validación
const createReviewSchema = z.object({
  productId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(500).optional()
})

export type CreateReviewFormData = z.infer<typeof createReviewSchema>

/**
 * Crear una nueva review
 */
export async function createReview(data: CreateReviewFormData) {
  // 1. Verificar autenticación
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return {
      success: false,
      error: 'Debes iniciar sesión para dejar una review'
    }
  }

  // 2. Validar datos
  const validated = createReviewSchema.safeParse(data)
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.errors[0].message
    }
  }

  // 3. Obtener usuario de la DB
  const dbUser = await prisma.user.findUnique({
    where: { clerkId }
  })

  if (!dbUser) {
    return {
      success: false,
      error: 'Usuario no encontrado en la base de datos'
    }
  }

  // 4. Verificar si el usuario compró el producto (verified badge)
  const hasPurchased = await prisma.orders.findFirst({
    where: {
      userId: dbUser.id,
      status: { in: ['Pagado', 'Enviado', 'Entregado'] },
      orderItems: {
        some: {
          productoId: data.productId
        }
      }
    }
  })

  // 5. Crear review
  try {
    await prisma.review.create({
      data: {
        rating: validated.data.rating,
        comment: validated.data.comment,
        userId: dbUser.id,
        productoId: data.productId,
        verified: !!hasPurchased
      }
    })

    // 6. Invalidar caché
    revalidatePath(`/collection/${data.productId}`)
    revalidatePath(`/collection/${data.productId}/reviews`)

    return {
      success: true,
      message: '¡Gracias por tu review!'
    }
  } catch (error) {
    console.error('Error creating review:', error)
    return {
      success: false,
      error: 'Error al crear la review. Inténtalo de nuevo.'
    }
  }
}

/**
 * Obtener reviews de un producto
 */
export async function getProductReviews(productId: number) {
  const reviews = await prisma.review.findMany({
    where: { productoId: productId },
    include: {
      user: {
        select: {
          name: true,
          imageUrl: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Calcular promedio
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return {
    reviews,
    averageRating,
    totalReviews: reviews.length
  }
}

/**
 * Verificar si el usuario puede revisar un producto
 */
export async function canUserReview(productId: number) {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return { canReview: false, reason: 'auth_required' }
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId }
  })

  if (!dbUser) {
    return { canReview: false, reason: 'user_not_found' }
  }

  // Verificar si ya dejó review
  const existingReview = await prisma.review.findFirst({
    where: {
      userId: dbUser.id,
      productoId: productId
    }
  })

  if (existingReview) {
    return { canReview: false, reason: 'already_reviewed' }
  }

  // Opcional: Solo permitir reviews si compró el producto
  // const hasPurchased = await prisma.orders.findFirst({...})
  // if (!hasPurchased) {
  //   return { canReview: false, reason: 'not_purchased' }
  // }

  return { canReview: true }
}
```

---

### Paso 3: Componentes

#### `app/collection/[id]/reviews/stars-display.tsx`

```typescript
import { Star } from 'lucide-react'

interface StarsDisplayProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  showNumber?: boolean
}

export function StarsDisplay({ 
  rating, 
  size = 'md',
  showNumber = true 
}: StarsDisplayProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <div className='flex items-center space-x-1'>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
      {showNumber && (
        <span className='text-sm text-muted-foreground ml-1'>
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  )
}
```

---

#### `app/collection/[id]/reviews/verified-badge.tsx`

```typescript
import { FiCheckCircle } from 'react-icons/fi'

export function VerifiedBadge() {
  return (
    <div className='flex items-center space-x-1 text-green-600' title='Compra verificada'>
      <FiCheckCircle className='w-4 h-4' />
      <span className='text-xs font-medium'>Compra verificada</span>
    </div>
  )
}
```

---

#### `app/collection/[id]/reviews/reviews-list.tsx`

```typescript
import { getProductReviews } from './actions'
import { StarsDisplay } from './stars-display'
import { VerifiedBadge } from './verified-badge'
import { CreateReviewForm } from './create-review-form'
import { canUserReview } from './actions'

interface ProductReviewsProps {
  productId: number
}

export async function ProductReviews({ productId }: ProductReviewsProps) {
  const { reviews, averageRating, totalReviews } = await getProductReviews(productId)
  const { canReview } = await canUserReview(productId)

  return (
    <section className='border-t pt-8'>
      <h2 className='text-2xl font-bold mb-6'>Opiniones de clientes</h2>

      {/* Resumen */}
      <div className='bg-muted rounded-lg p-6 mb-8'>
        <div className='flex items-center space-x-4'>
          <div className='text-5xl font-bold'>{averageRating.toFixed(1)}</div>
          <div>
            <StarsDisplay rating={averageRating} size='lg' showNumber={false} />
            <p className='text-sm text-muted-foreground mt-1'>
              {totalReviews} {totalReviews === 1 ? 'opinión' : 'opiniones'}
            </p>
          </div>
        </div>
      </div>

      {/* Formulario (si puede revisar) */}
      {canReview && (
        <div className='mb-8'>
          <CreateReviewForm productId={productId} />
        </div>
      )}

      {/* Lista de reviews */}
      <div className='space-y-6'>
        {reviews.length === 0 ? (
          <p className='text-muted-foreground text-center py-8'>
            Aún no hay opiniones. ¡Sé el primero en opinar!
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className='border-b pb-6'>
              <div className='flex items-start justify-between mb-2'>
                <div className='flex items-center space-x-3'>
                  {review.user.imageUrl && (
                    <img
                      src={review.user.imageUrl}
                      alt={review.user.name || 'Usuario'}
                      className='w-10 h-10 rounded-full'
                    />
                  )}
                  <div>
                    <div className='font-semibold'>
                      {review.user.name || 'Cliente anónimo'}
                    </div>
                    <StarsDisplay rating={review.rating} size='sm' />
                  </div>
                </div>
                {review.verified && <VerifiedBadge />}
              </div>
              
              {review.comment && (
                <p className='text-muted-foreground mt-3'>{review.comment}</p>
              )}
              
              <div className='text-xs text-muted-foreground mt-2'>
                {new Date(review.createdAt).toLocaleDateString('es-PE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
```

---

#### `app/collection/[id]/reviews/create-review-form.tsx` (Client Component)

```typescript
'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createReview } from './actions'
import { StarsDisplay } from './stars-display'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FiCheckCircle } from 'react-icons/fi'
import { ImSpinner2 } from 'react-icons/im'
import { Star } from 'lucide-react'

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, 'El comentario debe tener al menos 10 caracteres').max(500)
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface CreateReviewFormProps {
  productId: number
}

export function CreateReviewForm({ productId }: CreateReviewFormProps) {
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: ''
    }
  })

  const rating = watch('rating')

  const onSubmit = async (data: ReviewFormData) => {
    startTransition(async () => {
      const result = await createReview({
        productId,
        rating: data.rating,
        comment: data.comment
      })

      if (result.success) {
        setSubmitted(true)
      } else {
        alert(result.error)
      }
    })
  }

  if (submitted) {
    return (
      <div className='bg-green-50 border border-green-200 rounded-lg p-6 text-center'>
        <FiCheckCircle className='w-12 h-12 text-green-600 mx-auto mb-3' />
        <h3 className='text-lg font-semibold text-green-800'>¡Gracias por tu opinión!</h3>
        <p className='text-green-600 mt-1'>Tu review ha sido publicada.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='border rounded-lg p-6 space-y-4'>
      <h3 className='text-lg font-semibold'>Deja tu opinión</h3>

      {/* Rating */}
      <div>
        <label className='block text-sm font-medium mb-2'>
          Calificación:
        </label>
        <div className='flex space-x-2'>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type='button'
              onClick={() => setValue('rating', star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className='focus:outline-none'
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className='text-sm text-destructive mt-1'>{errors.rating.message}</p>
        )}
      </div>

      {/* Comentario */}
      <div>
        <label className='block text-sm font-medium mb-2'>
          Comentario (opcional):
        </label>
        <Textarea
          {...register('comment')}
          placeholder='Cuéntanos tu experiencia con este producto...'
          rows={4}
          className={errors.comment ? 'border-destructive' : ''}
        />
        <div className='flex justify-between mt-1'>
          {errors.comment ? (
            <p className='text-sm text-destructive'>{errors.comment.message}</p>
          ) : (
            <span />
          )}
          <span className='text-xs text-muted-foreground'>
            {watch('comment')?.length || 0}/500
          </span>
        </div>
      </div>

      {/* Submit */}
      <Button
        type='submit'
        disabled={isPending || rating === 0}
        className='w-full'
      >
        {isPending ? (
          <>
            <ImSpinner2 className='animate-spin mr-2' />
            Publicando...
          </>
        ) : (
          'Publicar opinión'
        )}
      </Button>
    </form>
  )
}
```

---

## 📊 Resumen de Cambios

### Archivos nuevos a crear:

| Ruta | Tipo | Líneas estimadas |
|------|------|------------------|
| `app/collection/[id]/page.tsx` | Server | ~150 |
| `app/collection/[id]/loading.tsx` | Server | ~40 |
| `app/collection/[id]/not-found.tsx` | Server | ~20 |
| `app/collection/[id]/add-to-cart-button.tsx` | Client | ~100 |
| `prisma/schema.prisma` | Schema | +15 (modelo Review) |
| `app/collection/[id]/reviews/actions.ts` | Server | ~120 |
| `app/collection/[id]/reviews/stars-display.tsx` | Client | ~30 |
| `app/collection/[id]/reviews/verified-badge.tsx` | Client | ~10 |
| `app/collection/[id]/reviews/reviews-list.tsx` | Server | ~100 |
| `app/collection/[id]/reviews/create-review-form.tsx` | Client | ~120 |

**Total estimado:** ~705 líneas de código nuevo

---

## 🚀 Comandos de Ejecución

```bash
# 1. Agregar modelo Review al schema (editar manualmente prisma/schema.prisma)

# 2. Crear migración
npx prisma migrate dev --name add-review-model

# 3. Regenerar cliente Prisma
npx prisma generate

# 4. Crear archivos (copiar plantillas de arriba)
# - app/collection/[id]/page.tsx
# - app/collection/[id]/loading.tsx
# - app/collection/[id]/not-found.tsx
# - app/collection/[id]/add-to-cart-button.tsx
# - app/collection/[id]/reviews/actions.ts
# - app/collection/[id]/reviews/stars-display.tsx
# - app/collection/[id]/reviews/verified-badge.tsx
# - app/collection/[id]/reviews/reviews-list.tsx
# - app/collection/[id]/reviews/create-review-form.tsx

# 5. Verificar build
npm run build
```

---

## ⚠️ Consideraciones Técnicas

### 1. **No requiere Redux**
- CartContext es suficiente para "añadir al carrito"
- Reviews son datos de servidor + estado local del formulario

### 2. **Server Components**
- Todo el fetch de datos es server-side (SEO, performance)
- Client Components solo para interacción (botones, formularios)

### 3. **Autenticación**
- Solo usuarios logueados pueden crear reviews
- Verificación vía Clerk `auth()`

### 4. **Verified Badge**
- Se muestra si el usuario compró el producto
- Query a `Orders` + `OrderItems` para verificar

### 5. **Validación**
- Zod schema para reviews (rating 1-5, comment 10-500 chars)
- Server-side validation en Server Action

### 6. **Cache**
- `revalidatePath` después de crear review
- Reviews se cachean automáticamente (Server Component)

---

## 📁 Dependencias Existentes a Reutilizar

| Archivo | Uso |
|---------|-----|
| `components/product-card.tsx` | UI de productos relacionados |
| `components/formToSend.tsx` | Patrón de formulario con RHF |
| `contexts/CartContext.tsx` | Añadir al carrito |
| `lib/prisma.ts` | Cliente Prisma |
| `app/(protected)/orders/page.tsx` | Ejemplo de Server Component con Clerk |
| `lib/schemas/*.ts` | Patrón para schemas Zod |

---

## ✅ Criterios de Aceptación

### Página de Detalle
- [ ] URL `/collection/[id]` muestra datos del producto
- [ ] Metadata dinámica (título, OG tags)
- [ ] Imágenes del producto (principal + secundaria)
- [ ] Precio, stock, tallas visibles
- [ ] Botón "Añadir al carrito" funcional
- [ ] Productos relacionados (misma categoría)
- [ ] Loading state (skeleton)
- [ ] 404 personalizado si no existe

### Sistema de Reviews
- [ ] Modelo `Review` en Prisma con migración
- [ ] Lista de reviews en página de producto
- [ ] Promedio de rating visible
- [ ] Formulario para crear review (solo logueados)
- [ ] Validación Zod (rating 1-5, comment 10-500 chars)
- [ ] Verified badge si compró el producto
- [ ] Revalidación de caché después de crear

---

## 🤖 Instrucciones para el Agente

Si eres un agente de IA trabajando en este plan, sigue este protocolo:

### 1. Antes de comenzar

- Lee este documento completo
- Lee `PROJECT-UPDATE-BY-SKILLS.md` para entender el contexto del proyecto
- **Importante:** Lee cada skill en la ruta indicada antes de implementar
  - Ejemplo: Para Prisma, lee `.agents/skills/prisma-expert/SKILL.md`
  - Ejemplo: Para formularios, lee `.agents/skills/react-hook-form-zod/SKILL.md`

### 2. Orden de implementación

**Feature 1 (Página de Detalle):**
1. Comienza con `app/collection/[id]/page.tsx` (Server Component)
2. Luego `app/collection/[id]/loading.tsx` (skeleton)
3. Luego `app/collection/[id]/not-found.tsx` (404)
4. Finalmente `app/collection/[id]/add-to-cart-button.tsx` (Client Component)

**Feature 2 (Reviews):**
1. Primero edita `prisma/schema.prisma` (agregar modelo Review)
2. Ejecuta migración: `npx prisma migrate dev --name add-review-model`
3. Ejecuta: `npx prisma generate`
4. Crea `app/collection/[id]/reviews/actions.ts` (Server Actions)
5. Crea componentes UI (stars, badge, list, form)

### 3. Skills a consultar

**Para cada tarea, lee la skill correspondiente:**

| Tarea | Skill a leer |
|-------|--------------|
| Ruta dinámica `[id]` | `.agents/skills/next-best-practices/SKILL.md` |
| Imágenes optimizadas | `.agents/skills/vercel-react-best-practices/SKILL.md#image-optimization` |
| Metadata dinámica | `.agents/skills/next-best-practices/SKILL.md#metadata` |
| Schema Prisma | `.agents/skills/prisma-expert/SKILL.md#schema-design` |
| Server Actions | `.agents/skills/next-best-practices/SKILL.md#server-actions` |
| Formulario RHF+Zod | `.agents/skills/react-hook-form-zod/SKILL.md` |
| Componentes shadcn | `.agents/skills/shadcn-ui/SKILL.md` |
| Cache/revalidación | `.agents/skills/next-cache-components/SKILL.md` |

### 4. Verificación

Después de implementar:
1. Ejecuta `npm run build` para verificar que no hay errores
2. Prueba la ruta `/collection/1` (o cualquier ID válido)
3. Prueba el formulario de reviews (logeado)
4. Verifica que el verified badge aparece si compró el producto

### 5. Convenciones del proyecto

- **Imports:** Usa `@/` para paths absolutos (`@/lib/prisma`, `@/components/ui/button`)
- **Estilos:** Tailwind CSS con clases utilitarias
- **Componentes:** Funcionales con TypeScript
- **Server Components:** Por defecto (usa `'use client'` solo cuando sea necesario)
- **Validación:** Zod schemas en `lib/schemas/`
- **Auth:** Clerk (`auth()` para server, `useUser()` para client)

---

**Documento actualizado:** 2026-02-28
**Próximo paso:** Comenzar Feature 1 siguiendo el orden de archivos listado

**Documento creado:** 2026-02-28
**Próximo paso:** Comenzar implementación siguiendo el orden de archivos listado
