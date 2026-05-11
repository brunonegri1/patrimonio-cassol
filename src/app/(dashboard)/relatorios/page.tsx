import { prisma } from '@/lib/prisma'
import { BarChart3, Download } from 'lucide-react'
import Link from 'next/link'

export default async function RelatoriosPage() {
  const [totalEquip, totalColab, totalLicencas, equipPorStatus, equipPorTipo, equipPorEmpresa] = await Promise.all([
    prisma.equipamento.count({ where: { ativo: true } }),
    prisma.colaborador.count({ where: { ativo: true } }),
    prisma.licencaUsuario.count({ where: { ativa: true } }),
    prisma.equipamento.groupBy({ by: ['status'], where: { ativo: true }, _count: true }),
    prisma.equipamento.groupBy({ by: ['tipoEquipId'], where: { ativo: true }, _count: true }),
    prisma.unidade.findMany({
      include: {
        empresa: true,
        equipamentos: { where: { ativo: true }, select: { nserial: true } },
      },
      orderBy: { empresaId: 'asc' },
    }),
  ])

  const tiposEquip = await prisma.tipoEquipamento.findMany()
  const tipoMap = Object.fromEntries(tiposEquip.map(t => [t.id, t.nome]))

  const relatorios = [
    { titulo: 'Inventário Completo de Equipamentos', descricao: 'Todos os equipamentos com usuário, status e localização', href: '/api/relatorios/inventario', icone: '📋' },
    { titulo: 'Equipamentos por Colaborador', descricao: 'Lista de colaboradores e seus respectivos equipamentos', href: '/api/relatorios/por-colaborador', icone: '👤' },
    { titulo: 'Licenças Ativas por Usuário', descricao: 'Todas as licenças de software ativas e seus titulares', href: '/api/relatorios/licencas', icone: '🔑' },
    { titulo: 'Equipamentos de Desligados', descricao: 'Equipamentos ainda vinculados a colaboradores desligados', href: '/api/relatorios/desligados', icone: '⚠️' },
    { titulo: 'Contratos Próximos ao Vencimento', descricao: 'Contratos que vencem nos próximos 30 dias', href: '/contratos?vencendo=true', icone: '📄' },
    { titulo: 'Equipamentos em Estoque', descricao: 'Equipamentos sem usuário vinculado', href: '/equipamentos?status=Estoque', icone: '📦' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Relatórios</h2>
        <p className="text-slate-500 text-sm mt-1">Visão analítica e exportação de dados do patrimônio</p>
      </div>

      {/* Resumo executivo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Equipamentos', valor: totalEquip, cor: 'border-blue-400' },
          { label: 'Colaboradores', valor: totalColab, cor: 'border-green-400' },
          { label: 'Licenças Ativas', valor: totalLicencas, cor: 'border-purple-400' },
          { label: 'Tipos de Equip.', valor: tiposEquip.length, cor: 'border-orange-400' },
        ].map(item => (
          <div key={item.label} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${item.cor} border border-slate-100`}>
            <p className="text-3xl font-bold text-slate-800">{item.valor}</p>
            <p className="text-sm text-slate-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipamentos por status */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-blue-500" />
            Equipamentos por Status
          </h3>
          <div className="space-y-3">
            {equipPorStatus.map((item) => (
              <div key={item.status} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 w-32 truncate">{item.status}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{ width: `${totalEquip > 0 ? (item._count / totalEquip) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-700 w-8 text-right">{item._count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Equipamentos por tipo */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-orange-500" />
            Equipamentos por Tipo
          </h3>
          <div className="space-y-3">
            {equipPorTipo.sort((a, b) => b._count - a._count).map((item) => (
              <div key={item.tipoEquipId} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 w-32 truncate">{tipoMap[item.tipoEquipId] || '—'}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-3">
                  <div
                    className="bg-orange-400 h-3 rounded-full"
                    style={{ width: `${totalEquip > 0 ? (item._count / totalEquip) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-700 w-8 text-right">{item._count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Equipamentos por empresa */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-4">Equipamentos por Empresa</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-2 text-slate-500 font-medium">Empresa</th>
                  <th className="text-left pb-2 text-slate-500 font-medium">Unidade</th>
                  <th className="text-right pb-2 text-slate-500 font-medium">Equipamentos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {equipPorEmpresa.map((unidade) => (
                  <tr key={unidade.id} className="hover:bg-slate-50">
                    <td className="py-2 text-slate-600 text-xs">{unidade.empresa.nome}</td>
                    <td className="py-2 font-medium text-slate-800">{unidade.nome}</td>
                    <td className="py-2 text-right font-bold text-slate-800">{unidade.equipamentos.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Relatórios para exportar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Exportar Relatórios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {relatorios.map((rel) => (
            <Link key={rel.titulo} href={rel.href}
              className="flex items-start gap-3 p-4 border border-slate-100 hover:border-orange-200 hover:bg-orange-50 rounded-xl transition-colors group">
              <span className="text-2xl">{rel.icone}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 group-hover:text-orange-700">{rel.titulo}</p>
                <p className="text-xs text-slate-500 mt-0.5">{rel.descricao}</p>
              </div>
              <Download size={14} className="text-slate-400 group-hover:text-orange-500 flex-shrink-0 mt-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
