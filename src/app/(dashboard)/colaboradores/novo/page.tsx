'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { criarColaborador } from '@/actions/colaboradores'

export default function NovoColaboradorPage() {
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    const form = new FormData(e.currentTarget)

    try {
      const resultado = await criarColaborador({
        id: form.get('id') as string,
        matricula: form.get('matricula') as string || undefined,
        nome: form.get('nome') as string,
        cargo: form.get('cargo') as string || undefined,
        setor: form.get('setor') as string || undefined,
        unidadeId: parseInt(form.get('unidadeId') as string),
        tipoTrabalho: form.get('tipoTrabalho') as any,
        situacao: 'Trabalhando',
        dataAdmissao: form.get('dataAdmissao') as string || undefined,
        email: form.get('email') as string || undefined,
        userRede: form.get('userRede') as string || undefined,
      })
      if (resultado.sucesso) router.push(`/colaboradores/${resultado.id}`)
    } catch (err: any) {
      setErro(err.message)
      setSalvando(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/colaboradores" className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft size={18} className="text-slate-600" />
        </Link>
        <h2 className="text-xl font-bold text-slate-800">Novo Colaborador</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CPF / Matrícula *</label>
              <input name="id" required placeholder="000.000.000-00"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Matrícula Senior</label>
              <input name="matricula" placeholder="Ex: 001001"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
            <input name="nome" required placeholder="Nome completo"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cargo</label>
              <input name="cargo" placeholder="Ex: Analista de TI"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Setor</label>
              <input name="setor" placeholder="Ex: Tecnologia da Informação"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unidade *</label>
              <input name="unidadeId" type="number" required placeholder="ID da unidade"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Vínculo *</label>
              <select name="tipoTrabalho" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white">
                <option value="CLT">CLT</option>
                <option value="PJ">PJ</option>
                <option value="PostoTrabalho">Posto de Trabalho</option>
                <option value="Terceiro">Terceiro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail Corporativo</label>
              <input name="email" type="email" placeholder="nome@cassol.com.br"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Login de Rede</label>
              <input name="userRede" placeholder="Ex: nome.sobrenome"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data de Admissão</label>
            <input name="dataAdmissao" type="date"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{erro}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={salvando}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
              {salvando ? 'Salvando...' : 'Cadastrar Colaborador'}
            </button>
            <Link href="/colaboradores"
              className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
