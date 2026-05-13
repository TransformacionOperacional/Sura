'use client'

export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { appRoutes } from '@/lib/routes'
import {
  FileText,
  FolderOpen,
  Clock,
  CheckCircle,
  Send,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const statsData = [
  { 
    label: 'Solicitudes Pendientes', 
    value: 12, 
    icon: Clock, 
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10'
  },
  { 
    label: 'Enviadas Hoy', 
    value: 8, 
    icon: Send, 
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  { 
    label: 'Completadas', 
    value: 45, 
    icon: CheckCircle, 
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10'
  },
  { 
    label: 'Expiradas', 
    value: 3, 
    icon: AlertTriangle, 
    color: 'text-red-500',
    bgColor: 'bg-red-500/10'
  },
]

const quickActions = [
  {
    title: 'Nueva Solicitud Documental',
    description: 'Generar una nueva solicitud de documentos para un cliente. Configure los documentos requeridos y envíe el enlace seguro.',
    icon: FileText,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    buttonText: 'Crear Solicitud',
    href: appRoutes.operaciones.nueva,
    variant: 'default' as const,
  },
  {
    title: 'Gestionar Solicitudes',
    description: 'Consulte el estado de las solicitudes existentes, reenvíe correos o vea los documentos cargados.',
    icon: FolderOpen,
    iconColor: 'text-secondary',
    iconBg: 'bg-secondary/10',
    buttonText: 'Ver Solicitudes',
    href: appRoutes.operaciones.solicitudes,
    variant: 'secondary' as const,
  },
]

const recentActivity = [
  {
    action: 'Solicitud SOL-2024-00045 completada',
    time: 'Hace 15 minutos',
    type: 'success',
  },
  {
    action: 'Nuevo acceso a SOL-2024-00044',
    time: 'Hace 1 hora',
    type: 'info',
  },
  {
    action: 'Correo enviado a cliente - SOL-2024-00043',
    time: 'Hace 2 horas',
    type: 'info',
  },
  {
    action: 'Solicitud SOL-2024-00042 expirada',
    time: 'Hace 3 horas',
    type: 'warning',
  },
]

export default function OperacionesDashboard() {
  const router = useRouter()
  const { operator } = useAuth()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {getGreeting()}, <span className="text-primary">{operator?.name || 'Operador'}</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido al Portal de Operaciones - Gestión de Solicitudes Documentales
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsData.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground font-medium">
                      {stat.label}
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-foreground mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Card
              key={action.title}
              className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(action.href)}
            >
              <CardHeader>
                <div className={`w-14 h-14 rounded-2xl ${action.iconBg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-7 h-7 ${action.iconColor}`} />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full gap-2" 
                  variant={action.variant}
                  onClick={() => router.push(action.href)}
                >
                  {action.buttonText}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    item.type === 'success'
                      ? 'bg-emerald-500'
                      : item.type === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium truncate">
                    {item.action}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
		