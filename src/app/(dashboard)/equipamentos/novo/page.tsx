'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { criarEquipamento } from '@/actions/equipamentos'

export default function NovoEquipamentoPage() {
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    const form = new FormData(e.currentTarget)

    try {
      const resultado = await criarEquipamento({
        nserial: form.get('nserial') as string,
        status: form.get('status') as any,
        patrimonio: form.get('patrimonio') as string || undefined,
        tipoEquipId: parseInt(form.get('tipoEquipId') as string),
        posseId: parseInt(form.get('posseId') as string),
        marcaId: form.get('marcaId') ? parseInt(form.get('marcaId') as string) : undefined,
        modelo: form.get('modelo') as string || undefined,
        processador: form.get('processador') as string || undefined,
        ram: form.get('ram') as string || undefined,
        memoriaDisco: form.get('memoriaDisco') as string || undefined,
        unidadeId: parseInt(form.get('unidadeId') as string),
        observacoes: form.get('observacoes') as string || undefined,
      })
      if (resultado.sucesso) router.push(`/equipamentos/${resultado.nserial}`)
    } catch (err: any) {
      setErro(err.message)
      setSalvando(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/equipamentos" className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft size={18} className="text-slate-600" />
        </Link>
        <h2 className="text-xl font-bold text-slate-800">Novo Equipamento</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Número de Série *</label>
              <input name="nserial" required placeholder="Ex: NB-DELL-001"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Patrimônio</label>
              <input name="patrimonio" placeholder="Ex: PAT-001"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
              <select name="status" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white">
                <option value="Ativo">Ativo</option>
                <option value="Estoque">Em Estoque</option>
                <option value="Desativado">Desativado</option>
                <option value="EmManutencao">Em Manutenção</option>
                <option value="Baixado">Baixado</option>
                <option value="FurtadoRoubado">Furtado/Roubado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Equipamento *</label>
              <input name="tipoEquipId" type="number" required placeholder="ID do tipo"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Posse *</label>
              <input name="posseId" type="number" required placeholder="1=Próprio, 2=Alugado, 3=Particular"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unidade *</label>
              <input name="unidadeId" type="number" required placeholder="ID da unidade"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Marca (ID)</label>
              <input name="marcaId" type="number" placeholder="ID da marca"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Modelo</label>
              <input name="modelo" placeholder="Ex: Latitude 5540"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Processador</label>
              <input name="processador" placeholder="Ex: Intel Core i7"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">RAM</label>
              <input name="ram" placeholder="Ex: 16GB"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Armazenamento</label>
              <input name="memoriaDisco" placeholder="Ex: 512GB SSD"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
            <textarea name="observacoes" rows={3} placeholder="Observações adicionais..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none" />
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{erro}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={salvando}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
              {salvando ? 'Salvando...' : 'Cadastrar Equipamento'}
            </button>
            <Link href="/equipamentos"
              className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
