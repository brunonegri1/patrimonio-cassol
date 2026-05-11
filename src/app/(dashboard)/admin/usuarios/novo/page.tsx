'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NovoUsuarioPage() {
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    const form = new FormData(e.currentTarget)

    const res = await fetch('/api/admin/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.get('email'),
        nome: form.get('nome'),
        senha: form.get('senha'),
        perfil: form.get('perfil'),
        empresasIds: [],
      }),
    })

    if (res.ok) {
      router.push('/admin')
    } else {
      const data = await res.json()
      setErro(data.error || 'Erro ao criar usuário')
      setSalvando(false)
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft size={18} className="text-slate-600" />
        </Link>
        <h2 className="text-xl font-bold text-slate-800">Novo Usuário do Sistema</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
            <input name="nome" required placeholder="Nome do usuário"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail *</label>
            <input name="email" type="email" required placeholder="usuario@cassol.com.br"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha *</label>
            <input name="senha" type="password" required placeholder="Mínimo 8 caracteres"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Perfil de Acesso *</label>
            <select name="perfil" required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none bg-white">
              <option value="Consultor">Consultor — Somente leitura</option>
              <option value="Tecnico">Técnico — Edição parcial</option>
              <option value="GestorTI">Gestor de TI — Criar e editar</option>
              <option value="Administrador">Administrador — Acesso total</option>
            </select>
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{erro}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={salvando}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
              {salvando ? 'Criando...' : 'Criar Usuário'}
            </button>
            <Link href="/admin"
              className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
