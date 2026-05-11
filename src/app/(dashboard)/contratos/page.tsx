import { listarContratos } from '@/actions/contratos'
import Link from 'next/link'
import { Plus, FileText, AlertCircle } from 'lucide-react'
import { formatarData, formatarMoeda } from '@/lib/utils'

function diasAteVencer(dataFinal: Date): number {
  return Math.ceil((new Date(dataFinal).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function badgeVencimento(dias: number) {
  if (dias < 0) return { label: 'Vencido', cls: 'bg-red-100 text-red-700 border border-red-200' }
  if (dias <= 7) return { label: `Vence em ${dias}d`, cls: 'bg-red-100 text-red-700 border border-red-200' }
  if (dias <= 15) return { label: `Vence em ${dias}d`, cls: 'bg-orange-100 text-orange-700 border border-orange-200' }
  if (dias <= 30) return { label: `Vence em ${dias}d`, cls: 'bg-yellow-100 text-yellow-700 border border-yellow-200' }
  return { label: `${dias}d restantes`, cls: 'bg-green-100 text-green-700 border border-green-200' }
}

export default async function ContratosPage({ searchParams }: { searchParams: any }) {
  const sp = await searchParams
  const page = parseInt(sp?.page || '1')

  const resultado = await listarContratos({
    page, limit: 20,
    busca: sp?.busca,
    vencendo: sp?.vencendo === 'true',
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Contratos</h2>
          <p className="text-slate-500 text-sm mt-1">{resultado.total} contratos encontrados</p>
        </div>
        <Link href="/contratos/novo"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} /> Novo Contrato
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <form className="flex flex-wrap gap-3">
          <input name="busca" defaultValue={sp?.busca} placeholder="Buscar por número ou fornecedor..."
            className="flex-1 min-w-48 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
          <label className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm cursor-pointer hover:bg-slate-50">
            <input type="checkbox" name="vencendo" value="true" defaultChecked={sp?.vencendo === 'true'} className="rounded" />
            Vencendo em 30 dias
          </label>
          <button type="submit"
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
            Filtrar
          </button>
          <Link href="/contratos" className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition-colors">
            Limpar
          </Link>
        </form>
      </div>

      {/* Cards de contratos */}
      <div className="space-y-3">
        {resultado.dados.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-slate-400 shadow-sm border border-slate-100">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            Nenhum contrato encontrado
          </div>
        ) : (
          resultado.dados.map((contrato: any) => {
            const dias = diasAteVencer(contrato.dataFinal)
            const badge = badgeVencimento(dias)
            return (
              <div key={contrato.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-mono font-semibold text-slate-800">{contrato.numero}</h3>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${badge.cls}`}>
                          {badge.label}
                        </span>
                        {dias <= 7 && <AlertCircle size={14} className="text-red-500" />}
                      </div>
                      {contrato.fornecedor && (
                        <p className="text-sm text-slate-600 mt-1">{contrato.fornecedor}</p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-400">
                        <span>Início: {formatarData(contrato.dataContrato)}</span>
                        <span>Vencimento: <strong className="text-slate-700">{formatarData(contrato.dataFinal)}</strong></span>
                        {contrato.valor && <span>Valor: <strong className="text-green-600">{formatarMoeda(Number(contrato.valor))}</strong></span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-slate-800">{contrato.equipamentos.length}</p>
                    <p className="text-xs text-slate-400">equipamentos</p>
                  </div>
                </div>

                {contrato.equipamentos.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-50 flex flex-wrap gap-1.5">
                    {contrato.equipamentos.slice(0, 8).map((eq: any) => (
                      <Link key={eq.nserial} href={`/equipamentos/${eq.nserial}`}
                        className="text-xs font-mono px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors">
                        {eq.nserial}
                      </Link>
                    ))}
                    {contrato.equipamentos.length > 8 && (
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-400 rounded">
                        +{contrato.equipamentos.length - 8}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
