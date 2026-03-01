import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// ─── Rutas públicas (no requieren autenticación) ──────────────────────────────
// Solo se listan rutas genuinamente públicas.
// Rutas sensibles de API (settings, cupones, users, etc.) se protegen por defecto.
const isPublicRoute = createRouteMatcher([
  // Páginas de auth de Clerk
  '/sign-in(.*)',
  '/sign-up(.*)',
  // Páginas públicas del sitio
  '/',
  '/about',
  '/contact',
  '/collection(.*)', // incluye /collection y /collection/[slug]
  '/cleanup-session',
  // APIs verdaderamente públicas (lectura de catálogo)
  '/api/products(.*)',
  '/api/productos-destacados(.*)',
  '/api/categories(.*)',
  '/api/colecciones(.*)',
  '/api/sign-in',
  '/api/sign-up',
  '/api/config(.*)',
  '/api/users(.*)',
  // Webhooks de Clerk — deben ser públicos (Clerk los envía sin sesión)
  '/api/webhooks(.*)'
])

// ─── Rutas exclusivas de administrador ───────────────────────────────────────
const isAdminRoute = createRouteMatcher([
  '/admin-panel(.*)',
  '/api/cupones(.*)',
  '/api/settings(.*)',
  '/api/updateuser(.*)',
  '/api/agencias(.*)',
  '/api/inventory(.*)',
  '/api/reports(.*)',
  '/api/cloudinary-list(.*)',
  '/api/delete-image(.*)',
  '/api/fotos(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  // 1. Proteger todas las rutas no públicas con autenticación
  if (!isPublicRoute(req)) {
    await auth.protect()
  }

  // 2. Para rutas de admin, verificar el rol además de la autenticación
  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth()
    const role = (sessionClaims?.metadata as { role?: string })?.role

    console.log('role en proxy.ts', role)

    if (role !== 'ADMIN' && role !== 'EDITOR') {
      // Redirigir a home si no es admin (en lugar de 403, mejor UX)
      const homeUrl = new URL('/', req.url)
      return NextResponse.redirect(homeUrl)
    }
  }
})

export const config = {
  matcher: [
    // Ignorar archivos estáticos y _next internals
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Siempre ejecutar para rutas API
    '/(api|trpc)(.*)'
  ]
}
