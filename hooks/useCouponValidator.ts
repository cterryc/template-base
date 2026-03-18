'use client'

import { useState, useCallback } from 'react'

interface CouponData {
  codigoCupon: string
  descuento: number
  mostrarCupon: boolean
}

interface UseCouponValidatorReturn {
  couponCode: string
  discount: number
  isValidating: boolean
  error: string | null
  validate: (code: string) => Promise<CouponData | undefined>
  clear: () => void
  setDiscount: (discount: number) => void
}

/**
 * Hook para validar cupones de descuento
 * 
 * @example
 * ```tsx
 * const { couponCode, discount, isValidating, validate, clear } = useCouponValidator()
 * 
 * const handleSubmit = async () => {
 *   await validate(couponCode)
 *   if (discount > 0) {
 *     // Aplicar descuento
 *   }
 * }
 * ```
 */
export function useCouponValidator(): UseCouponValidatorReturn {
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validate = useCallback(async (code: string) => {
    if (!code) {
      setError('Ingrese un código de cupón')
      return
    }

    setIsValidating(true)
    setError(null)

    try {
      const response = await fetch(`/api/cupones/codigo/${code}`)
      
      if (!response.ok) {
        setError('Código de cupón inválido')
        setDiscount(0)
        setCouponCode('')
        setIsValidating(false)
        throw new Error('Cupón inválido')
      }

      const data: CouponData = await response.json()
      setCouponCode(data.codigoCupon)
      setDiscount(data.descuento)
      setIsValidating(false)
      
      return data
    } catch (err) {
      setIsValidating(false)
      throw err
    }
  }, [])

  const clear = useCallback(() => {
    setCouponCode('')
    setDiscount(0)
    setError(null)
  }, [])

  return {
    couponCode,
    discount,
    isValidating,
    error,
    validate,
    clear,
    setDiscount
  }
}
