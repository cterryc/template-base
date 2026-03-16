import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import { AddToCartButton } from './add-to-cart-button'
import { ProductReviews } from './reviews/reviews-list'
import { ImageGallery } from './image-gallery'
import ProductCard from '@/components/product-card'
import Link from 'next/link'
import { ecommerceName } from '@/lib/constants'

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
    title: `${product.name} | ${ecommerceName}`,
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

  const relatedProducts = await getRelatedProducts(product.category, product.id)

  return (
    <div className='min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background'>
      <div className='container mx-auto px-4 py-12 lg:py-20'>
        {/* Breadcrumbs */}
        <nav className='mb-12 text-xs uppercase tracking-widest text-foreground/60'>
          <ol className='flex items-center space-x-3'>
            <li>
              <Link
                href='/'
                className='hover:text-foreground transition-colors'
              >
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href='/collection'
                className='hover:text-foreground transition-colors'
              >
                Colección
              </Link>
            </li>
            <li>/</li>
            <li className='text-foreground font-medium'>{product.name}</li>
          </ol>
        </nav>

        {/* Producto principal */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 mb-24'>
          {/* Columna Izquierda: Galería de Imágenes */}
          <div className='lg:col-span-7'>
            <ImageGallery
              images={[
                product.image,
                product.image2,
                product.image3,
                product.image4
              ].filter(
                (img): img is string => img !== null && img !== undefined
              )}
              productName={product.name}
            />
          </div>

          {/* Columna Derecha: Información y Compra */}
          <div className='lg:col-span-5 flex flex-col'>
            <div className='mb-8'>
              <p className='text-xs uppercase tracking-[0.2em] text-foreground/60 mb-2'>
                {product.category}
              </p>
              <h1 className='text-4xl lg:text-5xl font-light tracking-tight mb-4'>
                {product.name}
              </h1>
              <div className='flex items-baseline space-x-4 mb-6'>
                <p className='text-3xl font-medium'>
                  S/ {Number(product.price).toFixed(2)}
                </p>
              </div>

              <div className='flex items-center space-x-2 mb-8'>
                <span
                  className={`h-2 w-2 rounded-full ${product.stock > 0 ? 'bg-foreground' : 'bg-red-500'}`}
                />
                <p
                  className={`text-sm tracking-wide ${product.stock > 0 ? 'text-foreground/80' : 'text-red-500'}`}
                >
                  {product.stock > 0
                    ? `Stock disponible: ${product.stock}`
                    : 'Temporalmente agotado'}
                </p>
              </div>
            </div>

            <div className='space-y-10'>
              {/* Botón de carrito y selectores (Componente Cliente) */}
              <AddToCartButton
                product={{
                  ...product,
                  price: Number(product.price),
                  size: product.size || undefined
                }}
              />

              {/* Detalles Adicionales / Acordeón Minimalista */}
              <div className='border-t border-border pt-10'>
                <div className='space-y-6'>
                  <div>
                    <h3 className='text-xs uppercase tracking-widest font-bold mb-3'>
                      Descripción y Detalles
                    </h3>
                    <p className='text-sm leading-relaxed text-foreground/70'>
                      {product.estado ||
                        'No hay descripción detallada disponible para este artículo.'}
                    </p>
                  </div>
                  <div className='grid grid-cols-2 gap-4 text-[10px] uppercase tracking-widest text-foreground/50'>
                    <div className='border border-border p-3'>
                      <span className='block font-bold text-foreground/80 mb-1'>
                        Referencia
                      </span>
                      #{product.id.toString().padStart(5, '0')}
                    </div>
                    <div className='border border-border p-3'>
                      <span className='block font-bold text-foreground/80 mb-1'>
                        Categoría
                      </span>
                      {product.category}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className='border-t border-border pt-24 mb-24'>
          <div className='max-w-4xl mx-auto'>
            <h2 className='text-2xl font-light tracking-tight mb-12 text-center'>
              Opiniones de Clientes
            </h2>
            <ProductReviews productId={product.id} />
          </div>
        </section>

        {/* Productos Relacionados */}
        {relatedProducts.length > 0 && (
          <section className='border-t border-border pt-24'>
            <div className='flex items-end justify-between mb-12'>
              <h2 className='text-2xl font-light tracking-tight'>
                Te puede interesar
              </h2>
              <Link
                href='/collection'
                className='text-xs uppercase tracking-widest border-b border-foreground pb-1 hover:opacity-60 transition-opacity'
              >
                Ver toda la colección
              </Link>
            </div>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10'>
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
      </div>
    </div>
  )
}
