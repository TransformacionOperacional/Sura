'use client'

import { useRouter, usePathname } from 'next/navigation'
import { 
  Home, 
  FileText, 
  FolderOpen, 
  Settings, 
  LogOut, 
  ChevronRight,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { label: 'Inicio', href: '/operaciones', icon: Home },
  { label: 'Nueva Solicitud', href: '/operaciones/nueva', icon: FileText },
  { label: 'Solicitudes', href: '/operaciones/solicitudes', icon: FolderOpen },
  { label: 'Configuración', href: '/operaciones/configuracion', icon: Settings },
]

export function OperatorSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { operator, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex flex-col items-start gap-2">
          <img
            src="/logo-sura-white.svg"
            alt="SURA"
            width={130}
            height={43}
            className="h-10 w-auto"
          />
          <p className="text-xs text-sidebar-foreground/70">Portal de Operaciones</p>
        </div>
      </div>

      {/* User Info */}
      {operator && (
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{operator.name}</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">{operator.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3 h-11 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive && 'bg-sidebar-accent text-sidebar-accent-foreground'
                  )}
                  onClick={() => router.push(item.href)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </Button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar sesión</span>
        </Button>
      </div>
    </aside>
  )
}
