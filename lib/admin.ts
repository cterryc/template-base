// lib/admin.ts (solo si usas Server Actions o direct DB access)
import prisma from './prisma'

// export async function getIsAdmin(userId: string): Promise<boolean> {
//   try {
//     const user = await prisma.user.findUnique({
//       where: { clerkId: userId },
//       select: { role: true }
//     })

//     // Si no existe usuario, no es admin
//     if (!user) return false

//     return user.role === 'ADMIN'
//   } catch (error) {
//     console.error('Error checking admin status:', error)
//     return false
//   }
// }

export async function getIsAdminOrEditor(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

    // Si no existe usuario, no es admin ni editor
    if (!user) return false

    return user.role === 'ADMIN' || user.role === 'EDITOR'
  } catch (error) {
    console.error('Error checking admin or editor status:', error)
    return false
  }
}
