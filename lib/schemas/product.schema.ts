import { z } from 'zod'

// Schema para formulario de productos (admin panel)
export const ProductSchema = z
  .object({
    name: z.string().min(1, 'Nombre del producto requerido'),
    category: z.string().min(1, 'Categoría requerida'),
    estado: z.enum(['DISPONIBLE', 'NO DISPONIBLE', 'SOLO DISPONIBLE']),
    size: z.string().optional().or(z.literal('')),
    price: z
      .number()
      .positive('El precio debe ser mayor a 0')
      .or(z.string().transform((val) => parseFloat(val))),
    image: z.string().url('Imagen debe ser una URL válida'),
    image2: z.string().url('Imagen debe ser una URL válida').optional().nullable().or(z.literal('')),
    stock: z.number().int().min(0, 'Stock no puede ser negativo'),
    destacado: z.boolean().default(false),
    newCategory: z.string().optional()
  })
  .refine(
    (data) => {
      // Si image2 no es null/undefined, debe ser URL válida
      if (data.image2 && data.image2 !== '') {
        try {
          new URL(data.image2)
          return true
        } catch {
          return false
        }
      }
      return true
    },
    {
      message: 'Segunda imagen debe ser una URL válida',
      path: ['image2']
    }
  )

export type ProductFormData = z.infer<typeof ProductSchema>
