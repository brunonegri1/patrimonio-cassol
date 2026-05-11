'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { buscarColaborador, atualizarColaborador } from '@/actions/colaboradores'

export default function EditarColaboradorPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [col, setCol] = useState<any>(null)

  useEffect(() => {
    buscarColaborador(decodeURIComponent((params as any).id)).then(setCol)
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    const form = new FormData(e.currentTarget)

    try {
      await atualizarColaborador(col.id, {
        nome: form.get('nome') as string,
        cargo: form.get('cargo') as string || undefined,
        setor: form.get('setor') as string || undefined,
        email: form.get('email') as string || undefined,
        userRede: form.get('userRede') as string || undefined,
        situacao: form.get('situacao') as any,
        tipoTrabalho: form.get('tipoTrabalho') as any,
      })
      router.push(`/colaboradores/${col.id}`)
    } catch (err: any) {
      setErro(err.message)
      setSalvando(false)
    }
  }

  if (!col) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/colaboradores/${col.id}`} className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft size={18} className="text-slate-600" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Editar Colaborador</h2>
          <p className="text-sm text-slate-500">{col.nome}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
            <input name="nome" required defaultValue={col.nome}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cargo</label>
              <input name="cargo" defaultValue={col.cargo || ''}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Setor</label>
              <input name="setor" defaultValue={col.setor || ''}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Situação</label>
              <select name="situacao" defaultValue={col.situacao}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white">
                <option value="Trabalhando">Trabalhando</option>
                <option value="Afastado">Afastado</option>
                <option value="Desligado">Desligado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Vínculo</label>
              <select name="tipoTrabalho" defaultValue={col.tipoTrabalho}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white">
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
              <input name="email" type="email" defaultValue={col.email || ''}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Login de Rede</label>
              <input name="userRede" defaultValue={col.userRede || ''}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{erro}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={salvando}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <Link href={`/colaboradores/${col.id}`}
              className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
