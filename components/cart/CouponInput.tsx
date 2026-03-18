'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LuLoaderCircle } from 'react-icons/lu'

interface CouponInputProps {
  onValidate: (code: string) => Promise<{ valid: boolean; discount?: number; code?: string }>
  onClear: () => void
}

export function CouponInput({ onValidate, onClear }: CouponInputProps) {
  const [cuponCode, setCuponCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [discount, setDiscount] = useState(0)

  const validateCupon = async () => {
    if (!cuponCode) return

    setLoading(true)
    setError('')

    try {
      const result = await onValidate(cuponCode)
      
      if (result.valid) {
        setDiscount(result.discount || 0)
      } else {
        setError('Cupón inválido')
        setDiscount(0)
        setCuponCode('')
        onClear()
      }
    } catch {
      setError('Cupón inválido')
      setDiscount(0)
      setCuponCode('')
      onClear()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full'>
      <div className='flex items-center gap-2 mb-1'>
        <Input
          type='text'
          placeholder='Cupón de descuento...'
          className='flex-1 uppercase'
          value={cuponCode}
          onChange={(e) => {
            setCuponCode(e.target.value.toUpperCase())
            if (error) setError('')
          }}
          onKeyDown={(e) => e.key === 'Enter' && validateCupon()}
        />
        <Button
          onClick={validateCupon}
          disabled={loading}
          className='min-w-24'
          variant='default'
        >
          {loading ? (
            <LuLoaderCircle className='animate-spin mr-2' />
          ) : null}
          {loading ? 'Validando' : 'Validar'}
        </Button>
      </div>
      
      {error && (
        <span className='text-destructive text-sm'>
          {error}
        </span>
      )}
      
      <div
        className={`flex justify-between text-sm mt-2 font-medium ${
          error
            ? 'text-destructive'
            : discount > 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-muted-foreground'
        }`}
      >
        <span>Descuento:</span>
        <span>{discount > 0 ? `${discount}%` : '0%'}</span>
      </div>
    </div>
  )
}
