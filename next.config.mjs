import { fileURLToPath } from 'url'

/**
 * Next.js Configuration
 *
 * Bundle analyzer: Run with `ANALYZE=true npm run build`
 * Docs: https://nextjs.org/docs/app/api-reference/next-config-js
 */

let userConfig = undefined
try {
  // Try to import ESM first (v0.dev generated config)
  userConfig = await import('./v0-user-next.config.mjs')
} catch (e) {
  try {
    // Fallback to CJS import
    userConfig = await import('./v0-user-next.config')
  } catch (innerError) {
    // Ignore error - no user config exists
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build output - 'standalone' for Docker deployment
  output: 'standalone',

  // ESLint - disabled in favor of next lint command
  eslint: {
    ignoreDuringBuilds: false
  },

  // TypeScript - show errors during build
  typescript: {
    ignoreBuildErrors: false
  },

  // Images - optimize and allow Cloudinary
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**'
      }
    ],
    unoptimized: true  // Cloudinary optimiza, no Vercel
  },

  // Experimental features (safe for production)
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true
    // PPR (Partial Prerendering) - Cache Components
    // DESHABILITADO TEMPORALMENTE: Clerk auth pages tienen conflicto con cacheComponents
    // Ver: https://github.com/clerk/clerk-nextjs/issues
  },
  // cacheComponents: true,  // Deshabilitado temporalmente por conflicto con Clerk

  // Server external packages - don't bundle these
  serverExternalPackages: ['@prisma/client'],

  // Transpile packages if needed (ESM/CommonJS issues)
  // transpilePackages: [],

  // Powered by header
  poweredByHeader: false
}

// Merge user config if exists (v0.dev)
if (userConfig) {
  const config = userConfig.default || userConfig

  for (const key in config) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key]) &&
      nextConfig[key] !== null
    ) {
      // Deep merge objects
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key]
      }
    } else {
      // Override with user config
      nextConfig[key] = config[key]
    }
  }
}

// Bundle analyzer - wrap config if enabled
const withBundleAnalyzer =
  process.env.ANALYZE === 'true'
    ? (await import('@next/bundle-analyzer')).default({ enabled: true })
    : (config) => config

export default withBundleAnalyzer(nextConfig)
