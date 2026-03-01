import { z } from 'zod'

// Schema para formulario de delivery/orden
export const DeliverySchema = z
  .object({
    clientName: z.string().min(3, 'Nombre completo requerido'),
    address: z.string().min(3, 'Dirección requerida'),
    locationToSend: z.enum(['lima_metropolitana', 'provincia']),
    deliveryCost: z.number().optional(),
    agencia: z.string().optional(),
    dni: z.string().optional(),
    clientPhone: z.string().optional(),
    getlocation: z.object({
      lat: z.number(),
      lng: z.number()
    }),
    email: z.string().email('Email inválido').optional()
  })
  .superRefine((data, ctx) => {
    // Validaciones para Lima Metropolitana
    if (data.locationToSend === 'lima_metropolitana') {
      if (data.getlocation.lat === 0 && data.getlocation.lng === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Marca tu ubicación en el mapa',
          path: ['getlocation']
        })
      }
    }
    // Validaciones para Provincia
    else if (data.locationToSend === 'provincia') {
      if (!data.agencia || data.agencia.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Selecciona una agencia',
          path: ['agencia']
        })
      }
      if (!data.dni || data.dni.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Ingresa un DNI válido (mínimo 8 dígitos)',
          path: ['dni']
        })
      }
      if (!data.clientPhone || data.clientPhone.length < 7) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Ingresa un teléfono válido (mínimo 7 dígitos)',
          path: ['clientPhone']
        })
      }
    }
  })

export type DeliveryFormData = z.infer<typeof DeliverySchema>
