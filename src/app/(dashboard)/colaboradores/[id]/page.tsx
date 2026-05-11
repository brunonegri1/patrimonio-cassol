import { buscarColaborador } from '@/actions/colaboradores'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Monitor, Key, FileText, Pencil } from 'lucide-react'
import { formatarData } from '@/lib/utils'
import { STATUS_LABELS, STATUS_CORES } from '@/types'

const SITUACAO_CORES: Record<string, string> = {
  Trabalhando: 'bg-green-100 text-green-700',
  Afastado:    'bg-yellow-100 text-yellow-700',
  Desligado:   'bg-red-100 text-red-700',
}

export default async function ColaboradorDetailPage({ params }: { params: { id: string } }) {
  const p = await params
  const col = await buscarColaborador(decodeURIComponent(p.id))
  if (!col) notFound()

  const equipAtual = col.equipamentos.filter(e => !e.dataDesvinculo)
  const equipHistorico = col.equipamentos.filter(e => e.dataDesvinculo)

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Link href="/colaboradores" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-slate-600" />
        </Link>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-800">{col.nome}</h2>
          <p className="text-slate-500 text-sm">{col.cargo} — {col.setor}</p>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${SITUACAO_CORES[col.situacao]}`}>
          {col.situacao}
        </span>
        <Link href={`/colaboradores/${col.id}/editar`}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
          <Pencil size={14} /> Editar
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dados pessoais */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Dados do Colaborador</h3>
            <dl className="space-y-3 text-sm">
              {[
                ['CPF / ID', col.id],
                ['Matrícula', col.matricula || '—'],
                ['E-mail', col.email || '—'],
                ['Login de Rede', col.userRede || '—'],
                ['Tipo de Vínculo', col.tipoTrabalho],
                ['Admissão', formatarData(col.dataAdmissao)],
                ['Desligamento', col.dataDesligamento ? formatarData(col.dataDesligamento) : '—'],
                ['Empresa', col.unidade.empresa.nome],
                ['Unidade', col.unidade.nome],
              ].map(([label, valor]) => (
                <div key={label}>
                  <dt className="text-xs text-slate-400 uppercase font-medium tracking-wide">{label}</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">{valor}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Equipamentos e Licenças */}
        <div className="lg:col-span-2 space-y-5">
          {/* Equipamentos atuais */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Monitor size={16} className="text-blue-500" />
              Equipamentos Atuais ({equipAtual.length})
            </h3>
            {equipAtual.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Nenhum equipamento vinculado</p>
            ) : (
              <div className="space-y-2">
                {equipAtual.map((eu: any) => (
                  <div key={eu.nserial} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <div>
                      <Link href={`/equipamentos/${eu.nserial}`}
                        className="font-mono text-sm font-semibold text-blue-700 hover:underline">
                        {eu.nserial}
                      </Link>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {eu.equipamento.tipoEquip.nome} — {eu.equipamento.marca?.nome} {eu.equipamento.modelo}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_CORES[eu.equipamento.status as keyof typeof STATUS_CORES]}`}>
                        {STATUS_LABELS[eu.equipamento.status as keyof typeof STATUS_LABELS]}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">desde {formatarData(eu.dataVinculo)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Licenças */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Key size={16} className="text-purple-500" />
              Licenças de Software ({col.licencas.filter((l: any) => l.ativa).length} ativas)
            </h3>
            {col.licencas.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Nenhuma licença atribuída</p>
            ) : (
              <div className="space-y-2">
                {col.licencas.map((lu: any) => (
                  <div key={lu.id} className={`flex items-center justify-between p-3 rounded-lg border ${lu.ativa ? 'bg-purple-50 border-purple-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{lu.licenca.nome}</p>
                      <p className="text-xs text-slate-500">{lu.licenca.tipo} — desde {formatarData(lu.dataInicio)}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lu.ativa ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                      {lu.ativa ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Termos */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={16} className="text-slate-400" />
              Termos de Responsabilidade ({col.termos.length})
            </h3>
            {col.termos.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Nenhum termo registrado</p>
            ) : (
              <div className="space-y-2">
                {col.termos.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg text-sm">
                    <div>
                      <p className="font-medium text-slate-800">{formatarData(t.dataAssinatura)}</p>
                      {t.nserialNovo && <p className="text-xs text-slate-500">Recebeu: <span className="font-mono">{t.nserialNovo}</span></p>}
                      {t.nserialDevolvido && <p className="text-xs text-slate-500">Devolveu: <span className="font-mono">{t.nserialDevolvido}</span></p>}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.termoDigitalizado ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {t.termoDigitalizado ? 'Digitalizado' : 'Pendente'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Histórico equipamentos */}
          {equipHistorico.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
              <h3 className="font-semibold text-slate-800 mb-4 text-sm text-slate-500">
                Histórico de Equipamentos ({equipHistorico.length})
              </h3>
              <div className="space-y-2">
                {equipHistorico.map((eu: any) => (
                  <div key={`${eu.nserial}-${eu.dataDesvinculo}`} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg opacity-70">
                    <div>
                      <span className="font-mono text-xs font-semibold text-slate-600">{eu.nserial}</span>
                      <p className="text-xs text-slate-500">{eu.equipamento.tipoEquip.nome} — {eu.equipamento.modelo}</p>
                    </div>
                    <p className="text-xs text-slate-400">
                      {formatarData(eu.dataVinculo)} → {formatarData(eu.dataDesvinculo)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
