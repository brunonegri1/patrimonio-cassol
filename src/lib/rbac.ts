import { PerfilAcesso } from '@prisma/client'

export type Permissoes = {
  criar: boolean
  editar: boolean
  excluir: boolean // soft delete
  verTudo: boolean // todas as empresas
  verAuditLog: boolean
  gerenciarUsuarios: boolean
  importarSenior: boolean
}

export const PERMISSOES: Record<PerfilAcesso, Permissoes> = {
  Administrador: {
    criar: true,
    editar: true,
    excluir: true,
    verTudo: true,
    verAuditLog: true,
    gerenciarUsuarios: true,
    importarSenior: true,
  },
  GestorTI: {
    criar: true,
    editar: true,
    excluir: false,
    verTudo: false,
    verAuditLog: true,
    gerenciarUsuarios: false,
    importarSenior: true,
  },
  Tecnico: {
    criar: false,
    editar: true,
    excluir: false,
    verTudo: false,
    verAuditLog: false,
    gerenciarUsuarios: false,
    importarSenior: false,
  },
  Consultor: {
    criar: false,
    editar: false,
    excluir: false,
    verTudo: false,
    verAuditLog: false,
    gerenciarUsuarios: false,
    importarSenior: false,
  },
}

export function getPerfil(perfil: PerfilAcesso): Permissoes {
  return PERMISSOES[perfil]
}

export function podeAcessarEmpresa(
  usuarioEmpresasIds: number[],
  perfil: PerfilAcesso,
  empresaId: number
): boolean {
  if (PERMISSOES[perfil].verTudo) return true
  return usuarioEmpresasIds.includes(empresaId)
}

export function podeRealizarAcao(
  perfil: PerfilAcesso,
  acao: keyof Permissoes
): boolean {
  return PERMISSOES[perfil][acao]
}

export const PERFIL_LABELS: Record<PerfilAcesso, string> = {
  Administrador: 'Administrador',
  GestorTI: 'Gestor de TI',
  Tecnico: 'Técnico',
  Consultor: 'Consultor',
}

export const PERFIL_CORES: Record<PerfilAcesso, string> = {
  Administrador: 'bg-red-100 text-red-800',
  GestorTI: 'bg-blue-100 text-blue-800',
  Tecnico: 'bg-green-100 text-green-800',
  Consultor: 'bg-gray-100 text-gray-800',
}
