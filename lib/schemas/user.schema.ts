import { z } from 'zod'

// Schema para datos de usuario (perfil)
export const UserSchema = z.object({
  name: z
    .string()
    .min(3, 'Nombre requerido (mínimo 3 caracteres)')
    .optional(),
  email: z.string().email('Email inválido'),
  phone: z
    .string()
    .min(7, 'Teléfono inválido (mínimo 7 dígitos)')
    .optional()
    .or(z.literal('')),
  dni: z
    .string()
    .min(8, 'DNI debe tener al menos 8 dígitos')
    .optional()
    .or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  department: z.string().optional().or(z.literal('')),
  deliveryLocation: z.enum(['Lima', 'Provincia', 'Null']).optional()
})

export type UserFormData = z.infer<typeof UserSchema>
