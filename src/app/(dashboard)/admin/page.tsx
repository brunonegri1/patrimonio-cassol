import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Settings, Users, Monitor, Building2 } from 'lucide-react'
import { PERFIL_LABELS, PERFIL_CORES } from '@/lib/rbac'
import { PerfilAcesso } from '@prisma/client'
import { formatarDataHora } from '@/lib/utils'

export default async function AdminPage() {
  const session = await auth()
  if (session?.user?.perfil !== 'Administrador') redirect('/dashboard')

  const [usuarios, empresas, tiposEquip, marcas, tiposPosse] = await Promise.all([
    prisma.usuarioSistema.findMany({ orderBy: { nome: 'asc' } }),
    prisma.empresa.findMany({ orderBy: { nome: 'asc' } }),
    prisma.tipoEquipamento.findMany({ orderBy: { nome: 'asc' } }),
    prisma.marca.findMany({ orderBy: { nome: 'asc' } }),
    prisma.tipoPosse.findMany({ orderBy: { categoria: 'asc' } }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings size={24} className="text-slate-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Administração</h2>
          <p className="text-slate-500 text-sm">Gerenciar usuários do sistema e tabelas de referência</p>
        </div>
      </div>

      {/* Usuários do sistema */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Users size={16} className="text-blue-500" />
            Usuários do Sistema ({usuarios.length})
          </h3>
          <Link href="/admin/usuarios/novo"
            className="text-sm bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors">
            + Novo Usuário
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Nome / E-mail</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Perfil</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Empresas</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Último Acesso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{u.nome}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PERFIL_CORES[u.perfil as PerfilAcesso]}`}>
                      {PERFIL_LABELS[u.perfil as PerfilAcesso]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {u.perfil === 'Administrador' ? 'Todas' : `${u.empresasIds.length} empresa(s)`}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {u.ultimoAcesso ? formatarDataHora(u.ultimoAcesso) : 'Nunca'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabelas de referência */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Empresas */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Building2 size={15} className="text-orange-500" />
            Empresas ({empresas.length})
          </h3>
          <div className="space-y-1.5">
            {empresas.map((e) => (
              <div key={e.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700 truncate">{e.nome}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${e.ativo ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                  {e.ativo ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tipos de equipamento */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Monitor size={15} className="text-blue-500" />
            Tipos de Equipamento ({tiposEquip.length})
          </h3>
          <div className="space-y-1.5">
            {tiposEquip.map((t) => (
              <div key={t.id} className="text-sm text-slate-700 py-1 border-b border-slate-50 last:border-0">
                {t.nome}
              </div>
            ))}
          </div>
        </div>

        {/* Marcas */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-800 mb-3">Marcas ({marcas.length})</h3>
          <div className="flex flex-wrap gap-1.5">
            {marcas.map((m) => (
              <span key={m.id} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-lg">
                {m.nome}
              </span>
            ))}
          </div>

          <h3 className="font-semibold text-slate-800 mt-5 mb-3">Tipos de Posse ({tiposPosse.length})</h3>
          <div className="flex flex-wrap gap-1.5">
            {tiposPosse.map((p) => (
              <span key={p.id} className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded-lg border border-orange-100">
                {p.categoria}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
