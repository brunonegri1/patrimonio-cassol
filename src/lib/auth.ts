import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        try {
          // Usar postgres.js diretamente — sem Prisma, sem binários
          const postgres = (await import('postgres')).default
          const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require', max: 1 })

          const rows = await sql`
            SELECT id, email, nome, senha, perfil, "empresasIds", ativo
            FROM usuarios_sistema
            WHERE email = ${email} AND ativo = true
            LIMIT 1
          `

          await sql.end()

          if (rows.length === 0) return null

          const user = rows[0]
          const senhaValida = await bcrypt.compare(password, user.senha)
          if (!senhaValida) return null

          return {
            id: String(user.id),
            email: user.email,
            name: user.nome,
            perfil: user.perfil,
            empresasIds: user.empresasIds,
          }
        } catch (err: any) {
          console.error('[auth] Erro ao conectar DB:', err.message)
          return null
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
