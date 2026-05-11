import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { registrarAudit } from '@/actions/audit-log'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  nome: z.string().min(2),
  senha: z.string().min(8),
  perfil: z.enum(['Administrador', 'GestorTI', 'Tecnico', 'Consultor']),
  empresasIds: z.array(z.number()).default([]),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.perfil !== 'Administrador') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  }

  const existente = await prisma.usuarioSistema.findUnique({ where: { email: parsed.data.email } })
  if (existente) {
    return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 })
  }

  const senhaHash = await bcrypt.hash(parsed.data.senha, 12)
  const usuario = await prisma.usuarioSistema.create({
    data: {
      email: parsed.data.email,
      nome: parsed.data.nome,
      senha: senhaHash,
      perfil: parsed.data.perfil,
      empresasIds: parsed.data.empresasIds,
    },
  })

  await registrarAudit({
    tabela: 'UsuarioSistema',
    registroId: String(usuario.id),
    acao: 'CREATE',
    usuarioId: parseInt(session.user.id),
    usuarioNome: session.user.name,
    valorNovo: JSON.stringify({ email: usuario.email, perfil: usuario.perfil }),
  })

  return NextResponse.json({ sucesso: true, id: usuario.id })
}
