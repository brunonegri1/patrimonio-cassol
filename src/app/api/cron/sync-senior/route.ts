import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const resultado = await sincronizarSenior()
    return NextResponse.json({ sucesso: true, ...resultado })
  } catch (error) {
    console.error('[CRON Senior]', error)
    return NextResponse.json({ error: 'Erro na sincronização' }, { status: 500 })
  }
}

async function sincronizarSenior() {
  const SENIOR_URL = process.env.SENIOR_API_URL
  const SENIOR_KEY = process.env.SENIOR_API_KEY
  const SENIOR_TENANT = process.env.SENIOR_TENANT

  if (!SENIOR_URL || !SENIOR_KEY || !SENIOR_TENANT) {
    return { sincronizados: 0, desligados: 0, mensagem: 'API Senior não configurada' }
  }

  // Busca colaboradores da API Senior
  const response = await fetch(`${SENIOR_URL}/hcm/api/rest/v1/employees`, {
    headers: {
      'Authorization': `Bearer ${SENIOR_KEY}`,
      'X-Tenant': SENIOR_TENANT,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Senior API error: ${response.status}`)
  }

  const { employees } = await response.json()
  let sincronizados = 0
  let desligados = 0

  for (const emp of employees) {
    const cpf = emp.cpf?.replace(/\D/g, '')
    if (!cpf) continue

    const existente = await prisma.colaborador.findUnique({ where: { id: cpf } })

    const dadosSenior = {
      nome: emp.name,
      matricula: emp.registration,
      cargo: emp.position,
      setor: emp.department,
      situacao: emp.status === 'ACTIVE' ? 'Trabalhando' : emp.status === 'ON_LEAVE' ? 'Afastado' : 'Desligado',
      dataAdmissao: emp.admissionDate ? new Date(emp.admissionDate) : undefined,
      dataDesligamento: emp.dismissalDate ? new Date(emp.dismissalDate) : undefined,
      email: emp.email,
    } as any

    if (existente) {
      // Verifica se foi desligado
      const foiDesligado = existente.situacao !== 'Desligado' && dadosSenior.situacao === 'Desligado'

      await prisma.colaborador.update({
        where: { id: cpf },
        data: { ...dadosSenior, ativo: dadosSenior.situacao !== 'Desligado' },
      })

      if (foiDesligado) {
        desligados++
        // O alerta será gerado automaticamente pela função verificarAlertas()
        // pois o colaborador terá situacao=Desligado e equipamentos vinculados
        await prisma.auditLog.create({
          data: {
            tabela: 'Colaborador',
            registroId: cpf,
            acao: 'SYNC',
            campo: 'situacao',
            valorAnterior: existente.situacao,
            valorNovo: 'Desligado',
            usuarioId: 0,
            usuarioNome: 'Sistema (Senior Sync)',
          },
        })
      }
    } else {
      // Novo colaborador — precisa de unidade (buscar pelo código da empresa/filial)
      // Lógica simplificada: vincular à unidade 1 por padrão, ajustar conforme mapeamento real
      await prisma.colaborador.create({
        data: {
          id: cpf,
          ...dadosSenior,
          unidadeId: 1, // TODO: mapear empresaCode → unidadeId
          tipoTrabalho: 'CLT',
          ativo: dadosSenior.situacao !== 'Desligado',
        },
      })
    }

    sincronizados++
  }

  return { sincronizados, desligados }
}
