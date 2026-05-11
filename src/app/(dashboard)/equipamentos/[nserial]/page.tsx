import { buscarEquipamento } from '@/actions/equipamentos'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Cpu, HardDrive, MemoryStick, Pencil, User, FileText, AlertCircle } from 'lucide-react'
import { STATUS_LABELS, STATUS_CORES } from '@/types'
import { formatarData, formatarDataHora } from '@/lib/utils'

export default async function EquipamentoDetailPage({ params }: { params: { nserial: string } }) {
  const p = await params
  const equip = await buscarEquipamento(decodeURIComponent(p.nserial))
  if (!equip) notFound()

  const usuarioAtual = equip.usuarios.find(u => !u.dataDesvinculo)

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/equipamentos" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-slate-600" />
        </Link>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-800 font-mono">{equip.nserial}</h2>
          <p className="text-slate-500 text-sm">{equip.tipoEquip.nome} — {equip.marca?.nome} {equip.modelo}</p>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_CORES[equip.status]}`}>
          {STATUS_LABELS[equip.status]}
        </span>
        <Link href={`/equipamentos/${equip.nserial}/editar`}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
          <Pencil size={14} /> Editar
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info principal */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Especificações</h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ['Nº Patrimônio', equip.patrimonio || '—'],
                ['Tipo', equip.tipoEquip.nome],
                ['Marca', equip.marca?.nome || '—'],
                ['Modelo', equip.modelo || '—'],
                ['Processador', equip.processador || '—'],
                ['Geração', equip.geracao || '—'],
                ['RAM', equip.ram || '—'],
                ['Armazenamento', equip.memoriaDisco || '—'],
                ['Tipo de Posse', equip.posse.categoria],
                ['Última Atualização', formatarData(equip.dataAtualizacao)],
              ].map(([label, valor]) => (
                <div key={label}>
                  <dt className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">{valor}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Empresa/Unidade */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Localização</h3>
            <div className="text-sm space-y-2">
              <div>
                <span className="text-xs text-slate-400 uppercase font-medium">Empresa</span>
                <p className="font-medium text-slate-800 mt-0.5">{equip.unidade.empresa.nome}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-medium">Unidade</span>
                <p className="font-medium text-slate-800 mt-0.5">{equip.unidade.nome} — {equip.unidade.uf}</p>
              </div>
              {equip.contrato && (
                <div>
                  <span className="text-xs text-slate-400 uppercase font-medium">Contrato</span>
                  <p className="font-medium text-slate-800 mt-0.5">{equip.contrato.numero} (vence {formatarData(equip.contrato.dataFinal)})</p>
                </div>
              )}
            </div>
          </div>

          {/* Ocorrências */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <AlertCircle size={16} className="text-yellow-500" />
              Ocorrências ({equip.ocorrencias.length})
            </h3>
            {equip.ocorrencias.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Nenhuma ocorrência registrada</p>
            ) : (
              <div className="space-y-3">
                {equip.ocorrencias.map(oc => (
                  <div key={oc.id} className="border border-slate-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{oc.tipo || 'Geral'}</span>
                      <span className="text-xs text-slate-400">{formatarData(oc.dataOcorr)}</span>
                    </div>
                    <p className="text-sm text-slate-700">{oc.descricao}</p>
                    {oc.resolvidoEm && (
                      <p className="text-xs text-green-600 mt-1">✓ Resolvido em {formatarData(oc.resolvidoEm)}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Painel lateral */}
        <div className="space-y-5">
          {/* Usuário atual */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User size={16} className="text-blue-500" />
              Usuário Atual
            </h3>
            {usuarioAtual ? (
              <div>
                <Link href={`/colaboradores/${usuarioAtual.colaboradorId}`}
                  className="font-semibold text-blue-600 hover:underline text-sm">
                  {usuarioAtual.colaborador.nome}
                </Link>
                <p className="text-xs text-slate-400 mt-1">{usuarioAtual.cargo}</p>
                <p className="text-xs text-slate-400">{usuarioAtual.setor}</p>
                <p className="text-xs text-slate-400 mt-2">Desde {formatarData(usuarioAtual.dataVinculo)}</p>
                {usuarioAtual.colaborador.situacao === 'Desligado' && (
                  <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg font-medium">
                    ⚠ Colaborador Desligado — Recolher Equipamento!
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <User className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Sem usuário vinculado</p>
              </div>
            )}
          </div>

          {/* Histórico de usuários */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={16} className="text-slate-400" />
              Histórico ({equip.usuarios.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {equip.usuarios.map((u, i) => (
                <div key={i} className={`text-xs p-2 rounded border ${!u.dataDesvinculo ? 'border-green-200 bg-green-50' : 'border-slate-100'}`}>
                  <p className="font-medium text-slate-800">{u.colaborador.nome}</p>
                  <p className="text-slate-400">
                    {formatarData(u.dataVinculo)} → {u.dataDesvinculo ? formatarData(u.dataDesvinculo) : 'atual'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
