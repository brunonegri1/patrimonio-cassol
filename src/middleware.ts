import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { nextUrl } = req
  const path = nextUrl.pathname

  // Libera: estáticos, rotas do NextAuth, arquivos com extensão
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api/auth') ||
    path.includes('.') ||
    path === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  const isLoginRoute = path.startsWith('/login')
  const isApiRoute   = path.startsWith('/api')
  const isCronRoute  = path.startsWith('/api/cron')

  // Cron: protege com CRON_SECRET
  if (isCronRoute) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // NextAuth v5 usa AUTH_SECRET; aceita ambos para compatibilidade
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  const token = await getToken({ req, secret })
  const isLoggedIn = !!token

  // APIs (exceto /api/auth já liberadas)
  if (isApiRoute) {
    if (!isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Página de login: redireciona se já logado
  if (isLoginRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }
    return NextResponse.next()
  }

  // Demais rotas: requer login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
