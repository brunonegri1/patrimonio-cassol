import { listarAuditLog } from '@/actions/audit-log'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Shield } from 'lucide-react'
import { formatarDataHora } from '@/lib/utils'

const ACAO_CORES: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN:  'bg-purple-100 text-purple-700',
  LOGOUT: 'bg-slate-100 text-slate-600',
  SYNC:   'bg-orange-100 text-orange-700',
}

export default async function AuditLogPage({ searchParams }: { searchParams: any }) {
  const session = await auth()
  if (!['Administrador', 'GestorTI'].includes(session?.user?.perfil || '')) {
    redirect('/dashboard')
  }

  const sp = await searchParams
  const page = parseInt(sp?.page || '1')

  const resultado = await listarAuditLog({
    tabela: sp?.tabela,
    acao: sp?.acao,
    page,
    limit: 50,
  })

  const tabelasDisponiveis = ['Equipamento', 'Colaborador', 'LicencaUsuario', 'Contrato', 'EquipamentoUsuario', 'UsuarioSistema']

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield size={24} className="text-slate-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Audit Log</h2>
          <p className="text-slate-500 text-sm mt-0.5">Registro imutável de todas as operações — somente leitura</p>
        </div>
      </div>

      {/* Aviso imutabilidade */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
        <Shield size={16} className="flex-shrink-0 text-amber-500" />
        Este log é <strong>imutável</strong>. Nenhum registro pode ser alterado ou excluído por qualquer perfil.
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <form className="flex flex-wrap gap-3">
          <select name="tabela" defaultValue={sp?.tabela}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white">
            <option value="">Todas as tabelas</option>
            {tabelasDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select name="acao" defaultValue={sp?.acao}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white">
            <option value="">Todas as ações</option>
            {['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'SYNC'].map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <button type="submit"
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
            Filtrar
          </button>
          <a href="/audit-log" className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition-colors">
            Limpar
          </a>
        </form>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm text-slate-500">{resultado.total} registros</p>
          <p className="text-xs text-slate-400">Ordenado por mais recente</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Data/Hora</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Ação</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Tabela</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Registro</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Campo</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Usuário</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {resultado.dados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">Nenhum registro encontrado</td>
                </tr>
              ) : (
                resultado.dados.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {formatarDataHora(log.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${ACAO_CORES[log.acao] || 'bg-slate-100 text-slate-600'}`}>
                        {log.acao}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-700">{log.tabela}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-600 max-w-32 truncate">{log.registroId}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {log.campo ? (
                        <div>
                          <p className="font-medium">{log.campo}</p>
                          {log.valorAnterior && (
                            <p className="text-red-400 text-xs truncate max-w-24" title={log.valorAnterior}>
                              – {log.valorAnterior.substring(0, 20)}
                            </p>
                          )}
                          {log.valorNovo && (
                            <p className="text-green-500 text-xs truncate max-w-24" title={log.valorNovo}>
                              + {log.valorNovo.substring(0, 20)}
                            </p>
                          )}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">{log.usuarioNome}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-400">{log.ip || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {resultado.totalPaginas > 1 && (
          <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Página {resultado.pagina} de {resultado.totalPaginas}
            </p>
            <div className="flex gap-2">
              {resultado.pagina > 1 && (
                <a href={`?page=${resultado.pagina - 1}&tabela=${sp?.tabela || ''}&acao=${sp?.acao || ''}`}
                  className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg">← Anterior</a>
              )}
              {resultado.pagina < resultado.totalPaginas && (
                <a href={`?page=${resultado.pagina + 1}&tabela=${sp?.tabela || ''}&acao=${sp?.acao || ''}`}
                  className="px-3 py-1.5 text-xs bg-orange-500 text-white hover:bg-orange-600 rounded-lg">Próxima →</a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
