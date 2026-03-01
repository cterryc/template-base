import { userRepository } from '@/lib/repositories/user.repository'
import type { Prisma } from '@/app/generated/prisma/client'

/**
 * User Service
 * Lógica de negocio para Usuarios
 * Sigue el patrón de Clean Architecture - Use Case
 */

export interface CreateUserDTO {
  clerkId: string
  email: string
  name?: string
  phone?: string
  dni?: string
  address?: string
  department?: string
}

export interface UpdateUserDTO extends Partial<Omit<CreateUserDTO, 'clerkId'>> {}

export class UserService {
  constructor(private repository = userRepository) {}

  /**
   * Obtener usuario por ID
   */
  async getById(id: number) {
    const user = await this.repository.findById(id)

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    return user
  }

  /**
   * Obtener usuario por Clerk ID
   */
  async getByClerkId(clerkId: string) {
    return this.repository.findByClerkId(clerkId)
  }

  /**
   * Obtener usuario por email
   */
  async getByEmail(email: string) {
    return this.repository.findByEmail(email)
  }

  /**
   * Crear usuario
   */
  async create(data: CreateUserDTO) {
    // Verificar si ya existe por email
    const existing = await this.repository.findByEmail(data.email)
    if (existing) {
      throw new Error('El email ya está registrado')
    }

    return this.repository.create(data)
  }

  /**
   * Actualizar usuario por Clerk ID
   */
  async update(clerkId: string, data: UpdateUserDTO) {
    // Verificar existencia
    const existing = await this.repository.findByClerkId(clerkId)
    if (!existing) {
      throw new Error('Usuario no encontrado')
    }

    // Verificar email único si se actualiza
    if (data.email && data.email !== existing.email) {
      const emailExists = await this.repository.findByEmail(data.email)
      if (emailExists && emailExists.clerkId !== clerkId) {
        throw new Error('El email ya está registrado')
      }
    }

    return this.repository.update(clerkId, data)
  }

  /**
   * Eliminar usuario por Clerk ID
   */
  async delete(clerkId: string) {
    await this.repository.delete(clerkId)
  }

  /**
   * Upsert usuario (para webhooks de Clerk)
   */
  async upsert(clerkId: string, data: Prisma.UserUpdateInput) {
    return this.repository.upsert(clerkId, data)
  }

  /**
   * Sincronizar usuario desde Clerk
   */
  async syncFromClerk(clerkId: string, clerkData: {
    email: string
    firstName?: string
    lastName?: string
    imageUrl?: string
  }) {
    const name = [clerkData.firstName, clerkData.lastName]
      .filter(Boolean)
      .join(' ')

    return this.upsert(clerkId, {
      email: clerkData.email,
      name: name || null,
      imageUrl: clerkData.imageUrl || null
    })
  }
}

// Instancia singleton
export const userService = new UserService()
