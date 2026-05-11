'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { registrarAudit } from './audit-log'
import { FiltrosColaborador } from '@/types'
import { SituacaoTrabalho, TipoTrabalho } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const colaboradorSchema = z.object({
  id: z.string().min(1, 'CPF/Matrícula obrigatório'),
  matricula: z.string().optional(),
  nome: z.string().min(2, 'Nome obrigatório'),
  cargo: z.string().optional(),
  setor: z.string().optional(),
  unidadeId: z.number(),
  tipoTrabalho: z.nativeEnum(TipoTrabalho),
  situacao: z.nativeEnum(SituacaoTrabalho).default('Trabalhando'),
  dataAdmissao: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  userRede: z.string().optional(),
})

export async function listarColaboradores(filtros: FiltrosColaborador = {}) {
  const { page = 1, limit = 20, busca, comEquipamento, ...where } = filtros
  const skip = (page - 1) * limit

  const whereClause: any = { ativo: true }
  if (where.situacao) whereClause.situacao = where.situacao
  if (where.tipoTrabalho) whereClause.tipoTrabalho = where.tipoTrabalho
  if (where.unidadeId) whereClause.unidadeId = where.unidadeId
  if (where.empresaId) whereClause.unidade = { empresaId: where.empresaId }
  if (comEquipamento) whereClause.equipamentos = { some: { dataDesvinculo: null } }

  if (busca) {
    whereClause.OR = [
      { nome: { contains: busca, mode: 'insensitive' } },
      { id: { contains: busca, mode: 'insensitive' } },
      { matricula: { contains: busca, mode: 'insensitive' } },
      { email: { contains: busca, mode: 'insensitive' } },
      { cargo: { contains: busca, mode: 'insensitive' } },
    ]
  }

  const [dados, total] = await Promise.all([
    prisma.colaborador.findMany({
      where: whereClause,
      include: {
        unidade: { include: { empresa: true } },
        equipamentos: {
          where: { dataDesvinculo: null },
          include: { equipamento: { include: { tipoEquip: true } } },
        },
        licencas: { where: { ativa: true }, include: { licenca: true } },
      },
      orderBy: { nome: 'asc' },
      skip,
      take: limit,
    }),
    prisma.colaborador.count({ where: whereClause }),
  ])

  return { dados, total, pagina: page, totalPaginas: Math.ceil(total / limit), limit }
}

export async function buscarColaborador(id: string) {
  return prisma.colaborador.findUnique({
    where: { id },
    include: {
      unidade: { include: { empresa: true } },
      equipamentos: {
        include: { equipamento: { include: { tipoEquip: true, marca: true, posse: true } } },
        orderBy: { dataVinculo: 'desc' },
      },
      licencas: { include: { licenca: true }, orderBy: { dataInicio: 'desc' } },
      termos: { orderBy: { dataAssinatura: 'desc' } },
    },
  })
}

export async function criarColaborador(dados: z.infer<typeof colaboradorSchema>) {
  const session = await auth()
  if (!session?.user) throw new Error('Não autenticado')

  const parsed = colaboradorSchema.safeParse(dados)
  if (!parsed.success) throw new Error(parsed.error.message)

  const existente = await prisma.colaborador.findUnique({ where: { id: parsed.data.id } })
  if (existente) throw new Error('Colaborador com este CPF/matrícula já existe')

  const colaborador = await prisma.colaborador.create({
    data: {
      ...parsed.data,
      dataAdmissao: parsed.data.dataAdmissao ? new Date(parsed.data.dataAdmissao) : undefined,
      email: parsed.data.email || undefined,
    },
  })

  await registrarAudit({
    tabela: 'Colaborador',
    registroId: colaborador.id,
    acao: 'CREATE',
    usuarioId: parseInt(session.user.id),
    usuarioNome: session.user.name,
    valorNovo: JSON.stringify({ nome: colaborador.nome }),
  })

  revalidatePath('/colaboradores')
  return { sucesso: true, id: colaborador.id }
}

export async function atualizarColaborador(id: string, dados: Partial<z.infer<typeof colaboradorSchema>>) {
  const session = await auth()
  if (!session?.user) throw new Error('Não autenticado')

  const atual = await prisma.colaborador.findUnique({ where: { id } })
  if (!atual) throw new Error('Colaborador não encontrado')

  const colaborador = await prisma.colaborador.update({
    where: { id },
    data: {
      ...dados,
      dataAdmissao: dados.dataAdmissao ? new Date(dados.dataAdmissao) : undefined,
      email: dados.email || undefined,
    },
  })

  await registrarAudit({
    tabela: 'Colaborador',
    registroId: id,
    acao: 'UPDATE',
    usuarioId: parseInt(session.user.id),
    usuarioNome: session.user.name,
    valorAnterior: JSON.stringify(atual),
    valorNovo: JSON.stringify(dados),
  })

  revalidatePath('/colaboradores')
  revalidatePath(`/colaboradores/${id}`)
  return { sucesso: true }
}

export async function desligarColaborador(id: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Não autenticado')

  // Soft delete + situacao Desligado
  await prisma.colaborador.update({
    where: { id },
    data: { situacao: SituacaoTrabalho.Desligado, ativo: false, dataDesligamento: new Date() },
  })

  await registrarAudit({
    tabela: 'Colaborador',
    registroId: id,
    acao: 'UPDATE',
    campo: 'situacao',
    valorAnterior: 'Trabalhando',
    valorNovo: 'Desligado',
    usuarioId: parseInt(session.user.id),
    usuarioNome: session.user.name,
  })

  revalidatePath('/colaboradores')
  return { sucesso: true }
}

export async function adicionarLicenca(colaboradorId: string, licencaId: number) {
  const session = await auth()
  if (!session?.user) throw new Error('Não autenticado')

  const existente = await prisma.licencaUsuario.findFirst({
    where: { colaboradorId, licencaId, ativa: true },
  })
  if (existente) throw new Error('Colaborador já possui esta licença ativa')

  const licenca = await prisma.licencaUsuario.create({
    data: { colaboradorId, licencaId },
  })

  await registrarAudit({
    tabela: 'LicencaUsuario',
    registroId: String(licenca.id),
    acao: 'CREATE',
    usuarioId: parseInt(session.user.id),
    usuarioNome: session.user.name,
    valorNovo: JSON.stringify({ colaboradorId, licencaId }),
  })

  revalidatePath(`/colaboradores/${colaboradorId}`)
  return { sucesso: true }
}

export async function removerLicenca(licencaUsuarioId: number) {
  const session = await auth()
  if (!session?.user) throw new Error('Não autenticado')

  await prisma.licencaUsuario.update({
    where: { id: licencaUsuarioId },
    data: { ativa: false, dataFim: new Date() },
  })

  await registrarAudit({
    tabela: 'LicencaUsuario',
    registroId: String(licencaUsuarioId),
    acao: 'UPDATE',
    campo: 'ativa',
    valorAnterior: 'true',
    valorNovo: 'false',
    usuarioId: parseInt(session.user.id),
    usuarioNome: session.user.name,
  })

  revalidatePath('/colaboradores')
  return { sucesso: true }
}
