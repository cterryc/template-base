import { z } from 'zod'

const envSchema = z.object({
  // Base de Datos
  DATABASE_URL: z.string().url(),

  // Clerk (Públicas)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().min(1).default('/sign-in'),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().min(1).default('/sign-up'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().min(1).default('/'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().min(1).default('/'),

  // Clerk (Privadas)
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_WEBHOOK_SIGNING_SECRET: z.string().min(1),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  // App Config
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development')
})

// Validar process.env contra el esquema
const result = envSchema.safeParse(process.env)

if (!result.success) {
  console.error('❌ Invalid environment variables:', result.error.format())
  throw new Error('Invalid environment variables')
}

export const env = result.data
