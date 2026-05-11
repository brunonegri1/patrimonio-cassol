import { listarEquipamentos } from '@/actions/equipamentos'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Search, Monitor } from 'lucide-react'
import { STATUS_LABELS, STATUS_CORES } from '@/types'

interface SearchParams {
  page?: string
  busca?: string
  status?: string
  tipoEquipId?: string
  unidadeId?: string
  empresaId?: string
}

export default async function EquipamentosPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const page = parseInt(sp?.page || '1')

  const [resultado, tiposEquip, empresas] = await Promise.all([
    listarEquipamentos({
      page,
      limit: 20,
      busca: sp?.busca,
      status: sp?.status as any,
      tipoEquipId: sp?.tipoEquipId ? parseInt(sp.tipoEquipId) : undefined,
      empresaId: sp?.empresaId ? parseInt(sp.empresaId) : undefined,
    }),
    prisma.tipoEquipamento.findMany({ orderBy: { nome: 'asc' } }),
    prisma.empresa.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Equipamentos</h2>
          <p className="text-slate-500 text-sm mt-1">{resultado.total} equipamentos encontrados</p>
        </div>
        <Link
          href="/equipamentos/novo"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} />
          Novo Equipamento
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <form className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              name="busca"
              defaultValue={sp?.busca}
              placeholder="Buscar por serial, modelo, usuário..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            />
          </div>
          <select name="status" defaultValue={sp?.status} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white">
            <option value="">Todos os status</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select name="tipoEquipId" defaultValue={sp?.tipoEquipId} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white">
            <option value="">Todos os tipos</option>
            {tiposEquip.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
          <select name="empresaId" defaultValue={sp?.empresaId} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white">
            <option value="">Todas as empresas</option>
            {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
          <button type="submit" className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
            Filtrar
          </button>
          <Link href="/equipamentos" className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition-colors">
            Limpar
          </Link>
        </form>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Serial / Patrimônio</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Tipo / Modelo</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Empresa / Unidade</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Usuário</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Posse</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {resultado.dados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Monitor className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    Nenhum equipamento encontrado
                  </td>
                </tr>
              ) : (
                resultado.dados.map((equip: any) => {
                  const usuario = equip.usuarios[0]?.colaborador
                  return (
                    <tr key={equip.nserial} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs font-semibold text-slate-800">{equip.nserial}</p>
                        {equip.patrimonio && <p className="text-xs text-slate-400 mt-0.5">{equip.patrimonio}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{equip.tipoEquip.nome}</p>
                        {equip.modelo && <p className="text-xs text-slate-400">{equip.marca?.nome} {equip.modelo}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CORES[equip.status as keyof typeof STATUS_CORES]}`}>
                          {STATUS_LABELS[equip.status as keyof typeof STATUS_LABELS]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-slate-500">{equip.unidade.empresa.nome}</p>
                        <p className="text-xs font-medium text-slate-700">{equip.unidade.nome}</p>
                      </td>
                      <td className="px-4 py-3">
                        {usuario ? (
                          <div>
                            <p className="text-xs font-medium text-slate-800">{usuario.nome}</p>
                            {usuario.situacao !== 'Trabalhando' && (
                              <span className="text-xs text-red-500 font-medium">{usuario.situacao}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Sem usuário</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-600">{equip.posse.categoria}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/equipamentos/${equip.nserial}`} className="text-orange-500 hover:text-orange-700 text-xs font-medium">
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {resultado.totalPaginas > 1 && (
          <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Página {resultado.pagina} de {resultado.totalPaginas} — {resultado.total} registros
            </p>
            <div className="flex gap-2">
              {resultado.pagina > 1 && (
                <Link href={`?page=${resultado.pagina - 1}&busca=${sp?.busca || ''}`}
                  className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  ← Anterior
                </Link>
              )}
              {resultado.pagina < resultado.totalPaginas && (
                <Link href={`?page=${resultado.pagina + 1}&busca=${sp?.busca || ''}`}
                  className="px-3 py-1.5 text-xs bg-orange-500 text-white hover:bg-orange-600 rounded-lg transition-colors">
                  Próxima →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
