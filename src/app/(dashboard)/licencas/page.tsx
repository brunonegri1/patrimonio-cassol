import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Key } from 'lucide-react'
import { formatarMoeda } from '@/lib/utils'

export default async function LicencasPage({ searchParams }: { searchParams: any }) {
  const sp = await searchParams
  const busca = sp?.busca || ''

  const [tiposLicenca, resumo] = await Promise.all([
    prisma.tipoLicenca.findMany({
      where: busca ? { nome: { contains: busca, mode: 'insensitive' } } : undefined,
      include: {
        licencas: {
          where: { ativa: true },
          include: { colaborador: { include: { unidade: { include: { empresa: true } } } } },
        },
      },
      orderBy: { nome: 'asc' },
    }),
    prisma.licencaUsuario.groupBy({
      by: ['licencaId'],
      where: { ativa: true },
      _count: true,
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Licenças de Software</h2>
          <p className="text-slate-500 text-sm mt-1">{tiposLicenca.length} tipos de licença</p>
        </div>
      </div>

      {/* Busca */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <form className="flex gap-3">
          <input name="busca" defaultValue={busca} placeholder="Buscar tipo de licença..."
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
          <button type="submit"
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
            Buscar
          </button>
        </form>
      </div>

      {/* Cards por tipo de licença */}
      <div className="space-y-4">
        {tiposLicenca.map((tipo) => {
          const totalAtivas = tipo.licencas.length
          const custoTotal = tipo.custo ? Number(tipo.custo) * totalAtivas : null

          return (
            <div key={tipo.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Key size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{tipo.nome}</h3>
                    <p className="text-xs text-slate-500">{tipo.tipo} {tipo.descricao ? `— ${tipo.descricao}` : ''}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-800">{totalAtivas}</p>
                  <p className="text-xs text-slate-400">usuários ativos</p>
                  {custoTotal && (
                    <p className="text-xs text-green-600 font-medium mt-0.5">
                      {formatarMoeda(custoTotal)}/mês
                    </p>
                  )}
                </div>
              </div>

              {/* Usuários */}
              {totalAtivas > 0 && (
                <div className="px-5 py-3">
                  <div className="flex flex-wrap gap-2">
                    {tipo.licencas.slice(0, 10).map((lu) => (
                      <Link key={lu.id} href={`/colaboradores/${lu.colaboradorId}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-lg text-xs text-purple-800 font-medium transition-colors">
                        {lu.colaborador.nome.split(' ').slice(0, 2).join(' ')}
                        <span className="text-purple-400">—</span>
                        <span className="text-purple-500">{lu.colaborador.unidade.empresa.nome.split(' ')[1] || lu.colaborador.unidade.empresa.nome}</span>
                      </Link>
                    ))}
                    {totalAtivas > 10 && (
                      <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 rounded-lg text-xs text-slate-500">
                        +{totalAtivas - 10} mais
                      </span>
                    )}
                  </div>
                </div>
              )}

              {totalAtivas === 0 && (
                <div className="px-5 py-3">
                  <p className="text-xs text-slate-400 italic">Nenhum usuário com esta licença</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
