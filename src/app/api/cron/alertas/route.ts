import { NextRequest, NextResponse } from 'next/server'
import { verificarAlertas } from '@/actions/alertas'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const alertas = await verificarAlertas()
  return NextResponse.json({ alertas, total: alertas.length, timestamp: new Date().toISOString() })
}
