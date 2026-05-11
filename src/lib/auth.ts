import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await prisma.usuarioSistema.findUnique({
          where: { email, ativo: true },
        })

        if (!user) return null

        const senhaValida = await bcrypt.compare(password, user.senha)
        if (!senhaValida) return null

        // Atualiza último acesso
        await prisma.usuarioSistema.update({
          where: { id: user.id },
          data: { ultimoAcesso: new Date() },
        })

        // Audit log de login
        await prisma.auditLog.create({
          data: {
            tabela: 'UsuarioSistema',
            registroId: String(user.id),
            acao: 'LOGIN',
            usuarioId: user.id,
            usuarioNome: user.nome,
          },
        })

        return {
          id: String(user.id),
          email: user.email,
          name: user.nome,
          perfil: user.perfil,
          empresasIds: user.empresasIds,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.perfil = (user as any).perfil
        token.empresasIds = (user as any).empresasIds
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.perfil = token.perfil as string
        session.user.empresasIds = token.empresasIds as number[]
        session.user.id = token.userId as string
      }
      return session
    },
  },
})

// Extend next-auth types
declare module 'next-auth' {
  interface User {
    perfil?: string
    empresasIds?: number[]
  }
  interface Session {
    user: {
      id: string
      email: string
      name: string
      perfil: string
      empresasIds: number[]
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    perfil?: string
    empresasIds?: number[]
    userId?: string
  }
}
