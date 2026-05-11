'use client'

import { signOut } from 'next-auth/react'
import { LogOut, User, Bell } from 'lucide-react'

interface HeaderProps {
  user: { name: string; email: string; perfil: string }
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">Sistema de Gestão Patrimonial</h1>
        <p className="text-xs text-slate-500">Grupo Cassol — TI</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Notificações (placeholder) */}
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Usuário */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <User size={16} className="text-orange-600" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800 leading-tight">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
