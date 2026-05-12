import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || 'NAO DEFINIDA'
  const urlSafe = dbUrl.replace(/:([^:@]+)@/, ':***@')
  
  try {
    const postgres = (await import('postgres')).default
    const sql = postgres(dbUrl, { ssl: 'require', max: 1 })
    const rows = await sql`SELECT current_user, current_database(), count(*) FROM usuarios_sistema`
    await sql.end()
    return NextResponse.json({ ok: true, db: urlSafe, rows })
  } catch (e: any) {
    return NextResponse.json({ ok: false, db: urlSafe, error: e.message?.substring(0, 500) }, { status: 500 })
  }
}
