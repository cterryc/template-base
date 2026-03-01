'use client'

import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error global:', error)
  }, [error])

  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center'>
      <h2 className='text-2xl font-bold'>Algo salió mal</h2>
      <p className='text-muted-foreground'>
        Ha ocurrido un error inesperado. Por favor, intenta nuevamente.
      </p>
      <Button onClick={() => reset()}>Intentar de nuevo</Button>
    </div>
  )
}
