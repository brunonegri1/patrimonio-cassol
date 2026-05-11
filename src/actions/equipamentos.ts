'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { registrarAudit } from './audit-log'
import { FiltrosEquipamento, PaginatedResult } from '@/types'
import { StatusEquipamento } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const equipamentoSchema = z.object({
  nserial: z.string().min(1, 'Número de série obrigatório'),
  status: z.nativeEnum(StatusEquipamento),
  patrimonio: z.string().optional(),
  tipoEquipId: z.number(),
  posseId: z.number(),
  marcaId: z.number().optional(),
  contratoId: z.number().optional(),
  modelo: z.string().optional(),
  processador: z.string().optional(),
  geracao: z.string().optional(),
  ram: z.string().optional(),
  memoriaDisco: z.string().optional(),
  unidadeId: z.number(),
  observacoes: z.string().optional(),
})

export async function listarEquipamentos(filtros: FiltrosEquipamento = {}): Promise<PaginatedResult<any>> {
  const { page = 1, limit = 20, busca, ...where } = filtros
  const skip = (page - 1) * limit

  const whereClause: any = { ativo: true }

  if (where.status) whereClause.status = where.status
  if (where.tipoEquipId) whereClause.tipoEquipId = where.tipoEquipId
  if (where.posseId) whereClause.posseId = where.posseId
  if (where.marcaId) whereClause.marcaId = where.marcaId
  if (where.contratoId) whereClause.contratoId = where.contratoId
  if (where.unidadeId) whereClause.unidadeId = where.unidadeId
  if (where.empresaId) whereClause.unidade = { empresaId: where.empresaId }

  if (busca) {
    whereClause.OR = [
      { nserial: { contains: busca, mode: 'insensitive' } },
      { patrimonio: { contains: busca, mode: 'insensitive' } },
      { modelo: { contains: busca, mode: 'insensitive' } },
      { usuarios: { some: { colaborador: { nome: { contains: busca, mode: 'insensitive' } } } } },
    ]
  }

  const [dados, total] = await Promise.all([
    prisma.equipamento.findMany({
      where: whereClause,
      include: {
        tipoEquip: true,
        posse: true,
        marca: true,
        unidade: { include: { empresa: true } },
        usuarios: {
          where: { dataDesvinculo: null },
          include: { colaborador: { select: { id: true, nome: true, situacao: true } } },
          take: 1,
        },
      },
      orderBy: { dataAtualizacao: 'desc' },
      skip,
      take: limit,
    }),
    prisma.equipamento.count({ where: whereClause }),
  ])

  return { dados, total, pagina: page, totalPaginas: Math.ceil(total / limit), limit }
}

export async function buscarEquipamento(nserial: string) {
  return prisma.equipamento.findUnique({
    where: { nserial, ativo: true },
    include: {
      tipoEquip: true,
      posse: true,
      marca: true,
      unidade: { include: { empresa: true } },
      contrato: true,
      usuarios: {
        include: { colaborador: true },
        orderBy: { dataVinculo: 'desc' },
      },
      ocorrencias: { orderBy: { dataOcorr: 'desc' } },
      termosNovos: { include: { colaborador: true }, orderBy: { criadoEm: 'desc' } },
    },
  })
}

export async function criarEquipamento(dados: z.infer<typeof equipamentoSchema>) {
  const session = await auth()
  if (!session?.user) throw new Error('Não autenticado')

  const parsed = equipamentoSchema.safeParse(dados)
  if (!parsed.success) throw new Error(parsed.error.message)

  const equipamento = await prisma.equipamento.create({
    data: { ...parsed.data, dataAtualizacao: new Date() },
  })

  await registrarAudit({
    tabela: 'Equipamento',
    registroId: equipamento.nserial,
    acao: 'CREATE',
    usuarioId: parseInt(session.user.id),
    usuarioNome: session.user.name,
    valorNovo: JSON.stringify(parsed.data),
  })

  revalidatePath('/equipamentos')
  return { sucesso: true, nserial: equipamento.nserial }
}

export async function atualizarEquipamento(nserial: string, dados: Partial<z.infer<typeof equipamentoSchema>>) {
  const session = await auth()
  if (!session?.user) throw new Error('Não autenticado')

  const atual = await prisma.equipamento.findUnique({ where: { nserial } })
  if (!atual) throw new Error('Equipamento não encontrado')

  const equipamento = await prisma.equipamento.update({
    where: { nserial },
    data: { ...dados, dataAtualizacao: new Date() },
  })

  await registrarAudit({
    tabela: 'Equipamento',
    registroId: nserial,
    acao: 'UPDATE',
    usuarioId: parseInt(session.user.id),
    usuarioNome: session.user.name,
    valorAnterior: JSON.stringify(atual),
    valorNovo: JSON.stringify(dados),
  })

  revalidatePath('/equipamentos')
  revalidatePath(`/equipamentos/${nserial}`)
  return { sucesso: true }
}

export async function desativarEquipamento(nserial: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Não autenticado')

  // Soft delete
  await prisma.equipamento.update({
    where: { nserial },
    data: { ativo: false, status: StatusEquipamento.Baixado },
  })

  await registrarAudit({
    tabela: 'Equipamento',
    registroId: nserial,
    acao: 'DELETE',
    usuarioId: parseInt(session.user.id),
    usuarioNome: session.user.name,
    campo: 'ativo',
    valorAnterior: 'true',
    valorNovo: 'false',
  })

  revalidatePath('/equipamentos')
  return { sucesso: true }
}

export async function vincularColaborador(nserial: string, colaboradorId: string, dados: { cargo?: string; setor?: string }) {
  const session = await auth()
  if (!session?.user) throw new Error('Não autenticado')

  const colaborador = await prisma.colaborador.findUnique({ where: { id: colaboradorId } })
  if (!colaborador) throw new Error('Colaborador não encontrado')

  // Desvincular uso atual (se houver)
  await prisma.equipamentoUsuario.updateMany({
    where: { nserial, dataDesvinculo: null },
    data: { dataDesvinculo: new Date() },
  })

  await prisma.equipamentoUsuario.create({
    data: {
      nserial,
      colaboradorId,
      unidadeId: colaborador.unidadeId,
      cargo: dados.cargo || colaborador.cargo || undefined,
      setor: dados.setor || colaborador.setor || undefined,
    },
  })

  await prisma.equipamento.update({
    where: { nserial },
    data: { dataAtualizacao: new Date() },
  })

  await registrarAudit({
    tabela: 'EquipamentoUsuario',
    registroId: `${nserial}_${colaboradorId}`,
    acao: 'CREATE',
    usuarioId: parseInt(session.user.id),
    usuarioNome: session.user.name,
    valorNovo: JSON.stringify({ nserial, colaboradorId }),
  })

  revalidatePath(`/equipamentos/${nserial}`)
  return { sucesso: true }
}

export async function desvincularColaborador(nserial: string, colaboradorId: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Não autenticado')

  await prisma.equipamentoUsuario.update({
    where: { nserial_colaboradorId: { nserial, colaboradorId } },
    data: { dataDesvinculo: new Date() },
  })

  await registrarAudit({
    tabela: 'EquipamentoUsuario',
    registroId: `${nserial}_${colaboradorId}`,
    acao: 'UPDATE',
    usuarioId: parseInt(session.user.id),
    usuarioNome: session.user.name,
    campo: 'dataDesvinculo',
    valorNovo: new Date().toISOString(),
  })

  revalidatePath(`/equipamentos/${nserial}`)
  return { sucesso: true }
}

export async function obterEstatisticasEquipamentos() {
  const [porStatus, porTipo, total, semUsuario] = await Promise.all([
    prisma.equipamento.groupBy({ by: ['status'], where: { ativo: true }, _count: true }),
    prisma.equipamento.groupBy({ by: ['tipoEquipId'], where: { ativo: true }, _count: true }),
    prisma.equipamento.count({ where: { ativo: true } }),
    prisma.equipamento.count({
      where: { ativo: true, status: 'Ativo', usuarios: { none: { dataDesvinculo: null } } }
    }),
  ])

  return { porStatus, porTipo, total, semUsuario }
}
