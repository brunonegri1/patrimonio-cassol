'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { registrarAudit } from './audit-log'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const contratoSchema = z.object({
  numero: z.string().min(1, 'Número obrigatório'),
  fornecedor: z.string().optional(),
  dataContrato: z.string(),
  dataFinal: z.string(),
  valor: z.number().optional(),
  observacoes: z.string().optional(),
})

export async function listarContratos(filtros: { busca?: string; page?: number; limit?: number; vencendo?: boolean } = {}) {
  const { page = 1, limit = 20, busca, vencendo } = filtros
  const skip = (page - 1) * limit
  const hoje = new Date()

  const whereClause: any = {}

  if (vencendo) {
    const em30dias = new Date(hoje)
    em30dias.setDate(em30dias.getDate() + 30)
    whereClause.dataFinal = { gte: hoje, lte: em30dias }
  }

  if (busca) {
    whereClause.OR = [
      { numero: { contains: busca, mode: 'insensitive' } },
      { fornecedor: { contains: busca, mode: 'insensitive' } },
    ]
  }

  const [dados, total] = await Promise.all([
    prisma.contrato.findMany({
      where: whereClause,
      include: { equipamentos: { include: { tipoEquip: true } } },
      orderBy: { dataFinal: 'asc' },
      skip,
      take: limit,
    }),
    prisma.contrato.count({ where: whereClause }),
  ])

  return { dados, total, pagina: page, totalPaginas: Math.ceil(total / limit), limit }
}

export async function criarContrato(dados: z.infer<typeof contratoSchema>) {
  const session = await auth()
  if (!session?.user) throw new Error('Não autenticado')

  const parsed = contratoSchema.safeParse(dados)
  if (!parsed.success) throw new Error(parsed.error.message)

  const contrato = await prisma.contrato.create({
    data: {
      ...parsed.data,
      dataContrato: new Date(parsed.data.dataContrato),
      dataFinal: new Date(parsed.data.dataFinal),
      valor: parsed.data.valor,
    },
  })

  await registrarAudit({
    tabela: 'Contrato',
    registroId: String(contrato.id),
    acao: 'CREATE',
    usuarioId: parseInt(session.user.id),
    usuarioNome: session.user.name,
    valorNovo: JSON.stringify({ numero: contrato.numero }),
  })

  revalidatePath('/contratos')
  return { sucesso: true, id: contrato.id }
}

export async function atualizarContrato(id: number, dados: Partial<z.infer<typeof contratoSchema>>) {
  const session = await auth()
  if (!session?.user) throw new Error('Não autenticado')

  const atual = await prisma.contrato.findUnique({ where: { id } })
  if (!atual) throw new Error('Contrato não encontrado')

  const contrato = await prisma.contrato.update({
    where: { id },
    data: {
      ...dados,
      dataContrato: dados.dataContrato ? new Date(dados.dataContrato) : undefined,
      dataFinal: dados.dataFinal ? new Date(dados.dataFinal) : undefined,
    },
  })

  await registrarAudit({
    tabela: 'Contrato',
    registroId: String(id),
    acao: 'UPDATE',
    usuarioId: parseInt(session.user.id),
    usuarioNome: session.user.name,
    valorAnterior: JSON.stringify(atual),
    valorNovo: JSON.stringify(dados),
  })

  revalidatePath('/contratos')
  return { sucesso: true }
}
