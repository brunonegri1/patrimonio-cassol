'use server'

import { prisma } from '@/lib/prisma'
import { AuditLogInput } from '@/types'

// AuditLog NUNCA recebe UPDATE ou DELETE — apenas INSERT
export async function registrarAudit(dados: AuditLogInput) {
  try {
    await prisma.auditLog.create({ data: dados })
  } catch (error) {
    // Não interrompe o fluxo principal se audit falhar
    console.error('[AuditLog] Erro ao registrar:', error)
  }
}

export async function listarAuditLog(filtros: {
  tabela?: string
  usuarioId?: number
  acao?: string
  dataInicio?: Date
  dataFim?: Date
  page?: number
  limit?: number
}) {
  const { page = 1, limit = 50, ...where } = filtros
  const skip = (page - 1) * limit

  const whereClause: any = {}
  if (where.tabela) whereClause.tabela = where.tabela
  if (where.usuarioId) whereClause.usuarioId = where.usuarioId
  if (where.acao) whereClause.acao = where.acao as any
  if (where.dataInicio || where.dataFim) {
    whereClause.timestamp = {}
    if (where.dataInicio) whereClause.timestamp.gte = where.dataInicio
    if (where.dataFim) whereClause.timestamp.lte = where.dataFim
  }

  const [dados, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where: whereClause }),
  ])

  return {
    dados,
    total,
    pagina: page,
    totalPaginas: Math.ceil(total / limit),
    limit,
  }
}
