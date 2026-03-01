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
