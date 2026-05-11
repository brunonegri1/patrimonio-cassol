'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { atualizarEquipamento, buscarEquipamento } from '@/actions/equipamentos'

export default function EditarEquipamentoPage({ params }: { params: { nserial: string } }) {
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [equip, setEquip] = useState<any>(null)

  useEffect(() => {
    params.then ? params : Promise.resolve(params)
    buscarEquipamento(decodeURIComponent((params as any).nserial)).then(setEquip)
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    const form = new FormData(e.currentTarget)

    try {
      await atualizarEquipamento(equip.nserial, {
        status: form.get('status') as any,
        patrimonio: form.get('patrimonio') as string || undefined,
        modelo: form.get('modelo') as string || undefined,
        processador: form.get('processador') as string || undefined,
        ram: form.get('ram') as string || undefined,
        memoriaDisco: form.get('memoriaDisco') as string || undefined,
        observacoes: form.get('observacoes') as string || undefined,
      })
      router.push(`/equipamentos/${equip.nserial}`)
    } catch (err: any) {
      setErro(err.message)
      setSalvando(false)
    }
  }

  if (!equip) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/equipamentos/${equip.nserial}`} className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft size={18} className="text-slate-600" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Editar Equipamento</h2>
          <p className="text-sm text-slate-500 font-mono">{equip.nserial}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select name="status" defaultValue={equip.status}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white">
                <option value="Ativo">Ativo</option>
                <option value="Estoque">Em Estoque</option>
                <option value="Desativado">Desativado</option>
                <option value="EmManutencao">Em Manutenção</option>
                <option value="Baixado">Baixado</option>
                <option value="FurtadoRoubado">Furtado/Roubado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Patrimônio</label>
              <input name="patrimonio" defaultValue={equip.patrimonio || ''}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <input value={equip.tipoEquip?.nome || ''} disabled
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Modelo</label>
              <input name="modelo" defaultValue={equip.modelo || ''}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Processador</label>
              <input name="processador" defaultValue={equip.processador || ''}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">RAM</label>
              <input name="ram" defaultValue={equip.ram || ''}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Armazenamento</label>
              <input name="memoriaDisco" defaultValue={equip.memoriaDisco || ''}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
            <textarea name="observacoes" rows={3} defaultValue={equip.observacoes || ''}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none" />
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{erro}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={salvando}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <Link href={`/equipamentos/${equip.nserial}`}
              className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
