import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { verificarAlertas } from '@/actions/alertas'
import { obterEstatisticasEquipamentos } from '@/actions/equipamentos'
import { Monitor, Users, Key, AlertTriangle, Package, TrendingUp, FileText, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { STATUS_LABELS, STATUS_CORES } from '@/types'
import { formatarMoeda } from '@/lib/utils'

export default async function DashboardPage() {
  const session = await auth()

  const [alertas, statsEquip, totalColaboradores, licencasAtivas, contratosAtivos] = await Promise.all([
    verificarAlertas(),
    obterEstatisticasEquipamentos(),
    prisma.colaborador.count({ where: { ativo: true, situacao: 'Trabalhando' } }),
    prisma.licencaUsuario.count({ where: { ativa: true } }),
    prisma.contrato.count({ where: { dataFinal: { gte: new Date() } } }),
  ])

  const alertasAlta = alertas.filter(a => a.urgencia === 'alta')
  const alertasMedia = alertas.filter(a => a.urgencia === 'media')

  const kpis = [
    { label: 'Total Equipamentos', valor: statsEquip.total, icon: Monitor, cor: 'bg-blue-500', link: '/equipamentos' },
    { label: 'Colaboradores Ativos', valor: totalColaboradores, icon: Users, cor: 'bg-green-500', link: '/colaboradores' },
    { label: 'Licenças Ativas', valor: licencasAtivas, icon: Key, cor: 'bg-purple-500', link: '/licencas' },
    { label: 'Contratos Vigentes', valor: contratosAtivos, icon: FileText, cor: 'bg-orange-500', link: '/contratos' },
    { label: 'Alertas Críticos', valor: alertasAlta.length, icon: AlertTriangle, cor: 'bg-red-500', link: '#alertas' },
    { label: 'Sem Usuário', valor: statsEquip.semUsuario, icon: Package, cor: 'bg-yellow-500', link: '/equipamentos?status=Ativo&semUsuario=true' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500 text-sm mt-1">Visão geral do patrimônio de TI do Grupo Cassol</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <Link key={kpi.label} href={kpi.link} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${kpi.cor} rounded-lg flex items-center justify-center mb-3`}>
              <kpi.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{kpi.valor}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-tight">{kpi.label}</p>
          </Link>
        ))}
      </div>

      {/* Status dos equipamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Equipamentos por Status
          </h3>
          <div className="space-y-3">
            {statsEquip.porStatus.map((item: any) => {
              const pct = statsEquip.total > 0 ? Math.round((item._count / statsEquip.total) * 100) : 0
              return (
                <div key={item.status} className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CORES[item.status as keyof typeof STATUS_CORES]}`}>
                    {STATUS_LABELS[item.status as keyof typeof STATUS_LABELS]}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 w-8 text-right">{item._count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Alertas */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6" id="alertas">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Alertas Ativos
            {alertas.length > 0 && (
              <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {alertas.length}
              </span>
            )}
          </h3>
          {alertas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-green-400 mb-2" />
              <p className="text-sm font-medium text-green-600">Nenhum alerta ativo</p>
              <p className="text-xs text-slate-400 mt-1">Tudo em ordem!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alertas.slice(0, 5).map((alerta, i) => (
                <Link key={i} href={alerta.link || '#'} className="block">
                  <div className={`p-3 rounded-lg border-l-4 ${
                    alerta.urgencia === 'alta' ? 'bg-red-50 border-red-400' :
                    alerta.urgencia === 'media' ? 'bg-yellow-50 border-yellow-400' :
                    'bg-blue-50 border-blue-400'
                  }`}>
                    <p className="text-sm font-semibold text-slate-800">{alerta.titulo}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{alerta.descricao}</p>
                  </div>
                </Link>
              ))}
              {alertas.length > 5 && (
                <p className="text-xs text-slate-400 text-center">+{alertas.length - 5} alertas adicionais</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
