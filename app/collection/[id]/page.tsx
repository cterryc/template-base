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

// Función para obtener producto
async function getProduct(id: number) {
  return prisma.productos.findUnique({
    where: { id },
    include: {
      destacados: true
    }
  })
}

// Función para productos relacionados
async function getRelatedProducts(category: string, currentId: number) {
  return prisma.productos.findMany({
    where: {
      category,
      id: { not: currentId }
    },
    take: 4
  })
}

// Metadata dinámica
export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(parseInt(id))

  if (!product) {
    return {
      title: 'Producto no encontrado'
    }
  }

  return {
    title: `${product.name} | Savior`,
    description: `Compra ${product.name} al mejor precio`,
    openGraph: {
      images: [product.image],
      title: product.name,
      description: `Precio: S/ ${Number(product.price).toFixed(2)}`,
      type: 'website'
    }
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params
  const product = await getProduct(parseInt(id))

  if (!product) {
    notFound()
  }

  // Productos relacionados (misma categoría)
  const relatedProducts = await getRelatedProducts(product.category, product.id)

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Breadcrumbs */}
      <nav className='mb-6 text-sm text-muted-foreground'>
        <ol className='flex space-x-2'>
          <li>
            <Link href='/'>Home</Link>
          </li>
          <li>/</li>
          <li>
            <Link href='/collection'>Colección</Link>
          </li>
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
          <div
            className={`mb-4 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {product.stock > 0 ? `Disponible ${product.stock}` : 'Agotado'}
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
          <AddToCartButton
            product={{
              ...product,
              price: Number(product.price),
              size: product.size || undefined
            }}
          />

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
              <ProductCard
                key={p.id}
                product={{
                  ...p,
                  price: Number(p.price),
                  size: p.size || undefined,
                  image2: p.image2 || undefined
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <ProductReviews productId={product.id} />
    </div>
  )
}
