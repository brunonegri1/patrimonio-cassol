'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Monitor, Users, Key, FileText,
  BarChart3, Shield, Settings, ChevronRight, Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/equipamentos', icon: Monitor, label: 'Equipamentos' },
  { href: '/colaboradores', icon: Users, label: 'Colaboradores' },
  { href: '/licencas', icon: Key, label: 'Licenças' },
  { href: '/contratos', icon: FileText, label: 'Contratos' },
  { href: '/relatorios', icon: BarChart3, label: 'Relatórios' },
  { href: '/audit-log', icon: Shield, label: 'Audit Log', perfisPermitidos: ['Administrador', 'GestorTI'] },
  { href: '/admin', icon: Settings, label: 'Admin', perfisPermitidos: ['Administrador'] },
]

interface SidebarProps {
  perfil: string
}

export default function Sidebar({ perfil }: SidebarProps) {
  const pathname = usePathname()

  const itemsVisiveis = navItems.filter(item =>
    !item.perfisPermitidos || item.perfisPermitidos.includes(perfil)
  )

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">Patrimônio</p>
            <p className="text-orange-400 text-xs font-medium">Grupo Cassol</p>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {itemsVisiveis.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
            </Link>
          )
        })}
      </nav>

      {/* Perfil no rodapé */}
      <div className="px-3 pb-4 border-t border-slate-700 pt-3">
        <div className="px-3 py-2 rounded-lg bg-slate-800">
          <p className="text-xs text-slate-400">Perfil de acesso</p>
          <p className="text-sm font-medium text-white mt-0.5">{perfil}</p>
        </div>
      </div>
    </aside>
  )
}
