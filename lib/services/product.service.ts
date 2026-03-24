import prisma from '@/lib/prisma'
import {
  productRepository,
  type FindProductsParams
} from '@/lib/repositories/product.repository'

/**
 * Product Service
 * Lógica de negocio para Productos
 * Sigue el patrón de Clean Architecture - Use Case
 */

export interface CreateProductDTO {
  name: string
  category: string
  estado: string
  size?: string
  price: number
  image: string
  image2?: string | null
  stock: number
  destacado?: boolean
}

export interface UpdateProductDTO extends Partial<Omit<CreateProductDTO, 'destacado'>> {
  destacado?: boolean
}

export class ProductService {
  constructor(private repository = productRepository) {}

  /**
   * Obtener producto por ID
   */
  async getById(id: number) {
    const product = await this.repository.findById(id)

    if (!product) {
      throw new Error('Producto no encontrado')
    }

    return {
      ...product,
      destacado: product.destacados?.length > 0 || false
    }
  }

  /**
   * Obtener todos los productos con paginación y filtros
   */
  async getAll(params: FindProductsParams) {
    const { products, totalCount } = await this.repository.findAll(params)

    const transformedProducts = products.map((product) => ({
      ...product,
      destacado: product.destacados?.length > 0 || false
    }))

    return {
      data: transformedProducts,
      pagination: {
        page: params.page || 1,
        pageSize: params.pageSize || 16,
        totalPages: Math.ceil(totalCount / (params.pageSize || 16)),
        totalCount
      }
    }
  }

  /**
   * Obtener productos destacados
   */
  async getFeatured() {
    return this.repository.findFeatured()
  }

  /**
   * Crear producto
   */
  async create(data: CreateProductDTO) {
    const { destacado = false, ...productData } = data

    // Validar precio
    if (data.price <= 0) {
      throw new Error('El precio debe ser mayor a 0')
    }

    // Validar stock
    if (data.stock < 0) {
      throw new Error('El stock no puede ser negativo')
    }

    const product = await this.repository.create(productData)

    // Si es destacado, crear relación
    if (destacado) {
      await prisma.productosDestacados.create({
        data: {
          productoId: product.id
        }
      })
    }

    return product
  }

  /**
   * Actualizar producto
   */
  async update(id: number, data: UpdateProductDTO) {
    // Verificar existencia
    const existing = await this.repository.findById(id)
    if (!existing) {
      throw new Error('Producto no encontrado')
    }

    // Validar precio si se actualiza
    if (data.price !== undefined && data.price <= 0) {
      throw new Error('El precio debe ser mayor a 0')
    }

    // Validar stock si se actualiza
    if (data.stock !== undefined && data.stock < 0) {
      throw new Error('El stock no puede ser negativo')
    }

    const { destacado, ...productData } = data

    const updated = await this.repository.update(id, productData)

    // Manejar destacado
    if (destacado !== undefined) {
      const existingDestacado = await prisma.productosDestacados.findUnique({
        where: { productoId: id }
      })

      if (destacado && !existingDestacado) {
        await prisma.productosDestacados.create({
          data: { productoId: id }
        })
      } else if (!destacado && existingDestacado) {
        await prisma.productosDestacados.delete({
          where: { productoId: id }
        })
      }
    }

    return updated
  }

  /**
   * Eliminar producto
   */
  async delete(id: number) {
    // Verificar existencia
    const existing = await this.repository.findById(id)
    if (!existing) {
      throw new Error('Producto no encontrado')
    }

    // Verificar si tiene órdenes asociadas
    if (existing.orderItems.length > 0) {
      throw new Error(
        'No se puede eliminar el producto porque tiene órdenes asociadas'
      )
    }

    await this.repository.delete(id)
  }

  /**
   * Contar productos
   */
  async count() {
    return this.repository.count()
  }
}

// Instancia singleton
export const productService = new ProductService()
