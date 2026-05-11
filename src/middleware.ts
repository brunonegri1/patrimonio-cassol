import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { nextUrl } = req

  const isAuthRoute = nextUrl.pathname.startsWith('/login')
  const isApiRoute = nextUrl.pathname.startsWith('/api')
  const isCronRoute = nextUrl.pathname.startsWith('/api/cron')
  const isStaticRoute = nextUrl.pathname.startsWith('/_next') || nextUrl.pathname.includes('.')

  if (isStaticRoute) return NextResponse.next()

  // Protege cron routes com CRON_SECRET
  if (isCronRoute) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Verifica sessão JWT (sem usar Prisma no Edge)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })
  const isLoggedIn = !!token

  // API routes
  if (isApiRoute) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Redireciona usuário logado para o dashboard
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }
    return NextResponse.next()
  }

  // Protege todas as rotas do dashboard
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
