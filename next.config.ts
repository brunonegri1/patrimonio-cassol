import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app'],
    },
  },
  // Permite imports de servidor sem expor no cliente
  serverExternalPackages: ['bcryptjs', '@prisma/client'],
}

export default nextConfig
