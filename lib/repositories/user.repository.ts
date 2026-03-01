import prisma from '@/lib/prisma'
import type { User, Prisma } from '@/app/generated/prisma/client'

/**
 * User Repository
 * Abstracción de acceso a datos para Usuarios
 * Sigue el patrón Repository de Domain-Driven Design
 */

export interface UserRepository {
  findById(id: number): Promise<User | null>
  findByClerkId(clerkId: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(data: Prisma.UserCreateInput): Promise<User>
  update(clerkId: string, data: Prisma.UserUpdateInput): Promise<User>
  delete(clerkId: string): Promise<void>
  upsert(clerkId: string, data: Prisma.UserUpdateInput): Promise<User>
}

export class PrismaUserRepository implements UserRepository {
  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        orders: true
      }
    })
  }

  async findByClerkId(clerkId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { clerkId },
      include: {
        orders: true
      }
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { email },
      include: {
        orders: true
      }
    })
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
      include: {
        orders: true
      }
    })
  }

  async update(clerkId: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { clerkId },
      data,
      include: {
        orders: true
      }
    })
  }

  async delete(clerkId: string): Promise<void> {
    await prisma.user.delete({
      where: { clerkId }
    })
  }

  async upsert(clerkId: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.upsert({
      where: { clerkId },
      update: data,
      create: {
        clerkId,
        email: data.email as string,
        name: data.name as string,
        ...data
      },
      include: {
        orders: true
      }
    })
  }
}

// Instancia singleton para usar en toda la app
export const userRepository = new PrismaUserRepository()
