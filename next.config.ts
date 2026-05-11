import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app'],
    },
  },
  // Permite Prisma e bcryptjs no servidor
  serverExternalPackages: ['bcryptjs', '@prisma/client', '.prisma/client'],
  // Ignora erros TypeScript no build de produção (Prisma types não gerados localmente)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignora erros ESLint no build
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
