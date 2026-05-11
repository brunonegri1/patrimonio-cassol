import { Prisma, StatusEquipamento, TipoTrabalho, SituacaoTrabalho, PerfilAcesso } from '@prisma/client'

// ────── EQUIPAMENTOS ──────
export type EquipamentoComRelacoes = Prisma.EquipamentoGetPayload<{
  include: {
    tipoEquip: true
    posse: true
    marca: true
    unidade: { include: { empresa: true } }
    contrato: true
    usuarios: { include: { colaborador: true } }
    ocorrencias: true
  }
}>

export type EquipamentoResumo = {
  nserial: string
  status: StatusEquipamento
  patrimonio: string | null
  modelo: string | null
  tipoEquip: { nome: string }
  posse: { categoria: string }
  marca: { nome: string } | null
  unidade: { nome: string; empresa: { nome: string } }
  usuarios: { colaborador: { nome: string } }[]
}

// ────── COLABORADORES ──────
export type ColaboradorComRelacoes = Prisma.ColaboradorGetPayload<{
  include: {
    unidade: { include: { empresa: true } }
    equipamentos: { include: { equipamento: { include: { tipoEquip: true; marca: true } } } }
    licencas: { include: { licenca: true } }
  }
}>

// ────── ALERTAS ──────
export type TipoAlerta =
  | 'CONTRATO_VENCENDO'
  | 'EQUIP_SEM_USUARIO'
  | 'USUARIO_DESLIGADO_COM_EQUIP'
  | 'TERMO_PENDENTE'

export type Alerta = {
  tipo: TipoAlerta
  titulo: string
  descricao: string
  urgencia: 'alta' | 'media' | 'baixa'
  link?: string
  dadosExtras?: Record<string, unknown>
}

// ────── DASHBOARD ──────
export type DashboardStats = {
  totalEquipamentos: number
  equipamentosPorStatus: Record<StatusEquipamento, number>
  equipamentosPorEmpresa: { empresa: string; total: number }[]
  equipamentosPorTipo: { tipo: string; total: number }[]
  colaboradoresAtivos: number
  licencasAtivas: number
  contratosVencendo: number
  alertas: Alerta[]
}

// ────── FILTROS ──────
export type FiltrosEquipamento = {
  empresaId?: number
  unidadeId?: number
  tipoEquipId?: number
  posseId?: number
  status?: StatusEquipamento
  marcaId?: number
  contratoId?: number
  busca?: string
  page?: number
  limit?: number
}

export type FiltrosColaborador = {
  empresaId?: number
  unidadeId?: number
  tipoTrabalho?: TipoTrabalho
  situacao?: SituacaoTrabalho
  busca?: string
  comEquipamento?: boolean
  page?: number
  limit?: number
}

// ────── PAGINAÇÃO ──────
export type PaginatedResult<T> = {
  dados: T[]
  total: number
  pagina: number
  totalPaginas: number
  limit: number
}

// ────── AUDIT ──────
export type AuditLogInput = {
  tabela: string
  registroId: string
  campo?: string
  valorAnterior?: string
  valorNovo?: string
  acao: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'SYNC'
  usuarioId: number
  usuarioNome: string
  ip?: string
  userAgent?: string
}

// ────── STATUS LABELS ──────
export const STATUS_LABELS: Record<StatusEquipamento, string> = {
  Ativo: 'Ativo',
  Estoque: 'Em Estoque',
  Desativado: 'Desativado',
  Baixado: 'Baixado',
  EmManutencao: 'Em Manutenção',
  FurtadoRoubado: 'Furtado/Roubado',
}

export const STATUS_CORES: Record<StatusEquipamento, string> = {
  Ativo: 'bg-green-100 text-green-800',
  Estoque: 'bg-blue-100 text-blue-800',
  Desativado: 'bg-gray-100 text-gray-800',
  Baixado: 'bg-red-100 text-red-800',
  EmManutencao: 'bg-yellow-100 text-yellow-800',
  FurtadoRoubado: 'bg-purple-100 text-purple-800',
}

export const SITUACAO_LABELS: Record<SituacaoTrabalho, string> = {
  Trabalhando: 'Trabalhando',
  Afastado: 'Afastado',
  Desligado: 'Desligado',
}

export const TIPO_TRABALHO_LABELS: Record<TipoTrabalho, string> = {
  CLT: 'CLT',
  PJ: 'PJ',
  PostoTrabalho: 'Posto de Trabalho',
  Terceiro: 'Terceiro',
}
