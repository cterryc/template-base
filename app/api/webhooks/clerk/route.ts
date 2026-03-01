/**
 * app/api/webhooks/clerk/route.ts
 *
 * Endpoint para recibir eventos de Clerk via webhook.
 * - Usa verifyWebhook() nativo de @clerk/nextjs/webhooks (no necesita svix separado)
 * - La ruta DEBE ser pública en proxy.ts: '/api/webhooks(.*)'
 * - En Clerk Dashboard registrar: https://tu-dominio/api/webhooks/clerk
 * - Variable requerida en .env: CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
 *
 * Eventos manejados: user.created, user.updated, user.deleted
 */
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Role } from '@/app/generated/prisma/enums'

export async function POST(req: NextRequest) {
  // 1. Verificar la firma del webhook (lanza error si es inválida)
  let evt
  try {
    evt = await verifyWebhook(req)
  } catch (err) {
    console.error('[Webhook] Verificación fallida:', err)
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    )
  }

  const eventType = evt.type
  console.log(`[Webhook] Evento recibido: ${eventType}`)

  // 2. Manejar cada tipo de evento
  try {
    switch (eventType) {
      // ── Crear o actualizar usuario ──────────────────────────────────────────
      case 'user.created':
      case 'user.updated': {
        const {
          id: clerkId,
          email_addresses,
          first_name,
          last_name,
          public_metadata
        } = evt.data

        const email = email_addresses?.[0]?.email_address
        if (!email) {
          console.warn(`[Webhook] Usuario ${clerkId} sin email, omitiendo`)
          break
        }

        const name = [first_name, last_name].filter(Boolean).join(' ') || null

        // Leer el rol desde public_metadata de Clerk y mapearlo al enum de Prisma.
        // Si el valor no es válido o no existe, usar USER como fallback seguro.
        const rawRole = (
          public_metadata as { role?: string }
        )?.role?.toUpperCase()
        const role: Role =
          rawRole === 'ADMIN'
            ? Role.ADMIN
            : rawRole === 'EDITOR'
              ? Role.EDITOR
              : Role.USER

        await prisma.user.upsert({
          where: { clerkId },
          update: {
            email,
            name,
            role
          },
          create: {
            clerkId,
            email,
            name,
            role
          }
        })

        console.log(
          `[Webhook] Usuario ${eventType === 'user.created' ? 'creado' : 'actualizado'}: ${clerkId} | role: ${role}`
        )
        break
      }

      // ── Eliminar usuario ────────────────────────────────────────────────────
      case 'user.deleted': {
        const { id: clerkId, deleted } = evt.data

        if (!clerkId || !deleted) break

        // Verificar que el usuario existe antes de borrar
        const user = await prisma.user.findUnique({ where: { clerkId } })
        if (!user) {
          console.warn(
            `[Webhook] Usuario ${clerkId} no encontrado en DB, omitiendo`
          )
          break
        }

        await prisma.user.delete({ where: { clerkId } })
        console.log(`[Webhook] Usuario eliminado: ${clerkId}`)
        break
      }

      // ── Eventos no manejados (retornar 200 igual para evitar retries) ───────
      default:
        console.log(`[Webhook] Evento no manejado: ${eventType}`)
    }

    // Retornar 200 siempre para indicar recepción exitosa
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err) {
    console.error(`[Webhook] Error procesando evento ${eventType}:`, err)
    // Retornar 500 para que Clerk reintente (retries por hasta 3 días)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
