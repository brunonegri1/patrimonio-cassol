import { listarColaboradores } from '@/actions/colaboradores'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Search, Users } from 'lucide-react'

const SITUACAO_CORES: Record<string, string> = {
  Trabalhando: 'bg-green-100 text-green-700',
  Afastado:    'bg-yellow-100 text-yellow-700',
  Desligado:   'bg-red-100 text-red-700',
}

const TIPO_LABELS: Record<string, string> = {
  CLT: 'CLT', PJ: 'PJ', PostoTrabalho: 'Posto', Terceiro: 'Terceiro',
}

export default async function ColaboradoresPage({ searchParams }: { searchParams: any }) {
  const sp = await searchParams
  const page = parseInt(sp?.page || '1')

  const [resultado, empresas] = await Promise.all([
    listarColaboradores({
      page, limit: 20,
      busca: sp?.busca,
      situacao: sp?.situacao as any,
      empresaId: sp?.empresaId ? parseInt(sp.empresaId) : undefined,
    }),
    prisma.empresa.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Colaboradores</h2>
          <p className="text-slate-500 text-sm mt-1">{resultado.total} colaboradores encontrados</p>
        </div>
        <Link href="/colaboradores/novo"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} /> Novo Colaborador
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <form className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input name="busca" defaultValue={sp?.busca} placeholder="Buscar por nome, CPF, e-mail..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>
          <select name="situacao" defaultValue={sp?.situacao}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white">
            <option value="">Todas as situações</option>
            <option value="Trabalhando">Trabalhando</option>
            <option value="Afastado">Afastado</option>
            <option value="Desligado">Desligado</option>
          </select>
          <select name="empresaId" defaultValue={sp?.empresaId}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white">
            <option value="">Todas as empresas</option>
            {empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
          <button type="submit"
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
            Filtrar
          </button>
          <Link href="/colaboradores"
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition-colors">
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
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Nome / Matrícula</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Cargo / Setor</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Empresa / Unidade</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Situação</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Tipo</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Equipamentos</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Licenças</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {resultado.dados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    Nenhum colaborador encontrado
                  </td>
                </tr>
              ) : (
                resultado.dados.map((col: any) => (
                  <tr key={col.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{col.nome}</p>
                      <p className="text-xs text-slate-400 font-mono">{col.matricula || col.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{col.cargo || '—'}</p>
                      <p className="text-xs text-slate-400">{col.setor || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-500">{col.unidade.empresa.nome}</p>
                      <p className="text-xs font-medium text-slate-700">{col.unidade.nome}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SITUACAO_CORES[col.situacao]}`}>
                        {col.situacao}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-600">{TIPO_LABELS[col.tipoTrabalho]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${col.equipamentos.length > 0 ? 'text-blue-600' : 'text-slate-300'}`}>
                        {col.equipamentos.length}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${col.licencas.length > 0 ? 'text-purple-600' : 'text-slate-300'}`}>
                        {col.licencas.length}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/colaboradores/${col.id}`}
                        className="text-orange-500 hover:text-orange-700 text-xs font-medium">
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))
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
                  className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg">← Anterior</Link>
              )}
              {resultado.pagina < resultado.totalPaginas && (
                <Link href={`?page=${resultado.pagina + 1}&busca=${sp?.busca || ''}`}
                  className="px-3 py-1.5 text-xs bg-orange-500 text-white hover:bg-orange-600 rounded-lg">Próxima →</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
