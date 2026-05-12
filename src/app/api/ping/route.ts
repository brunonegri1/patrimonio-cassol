import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || 'NAO DEFINIDA'
  const urlSafe = dbUrl.replace(/:([^:@]+)@/, ':***@')
  
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    const result = await prisma.$queryRaw`SELECT current_user, current_database()`
    await prisma.$disconnect()
    return NextResponse.json({ ok: true, db: urlSafe, result })
  } catch (e: any) {
    return NextResponse.json({ ok: false, db: urlSafe, error: e.message?.substring(0, 300) }, { status: 500 })
  }
}
