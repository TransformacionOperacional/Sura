'use client'

import { useRouter } from 'next/navigation'
import { FileText, FolderOpen, Clock, CheckCircle, Send, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'
import { OperatorLogin } from '@/components/operator-login'

const stats = [
  { label: 'Solicitudes Pendientes', value: 12, icon: Clock, color: 'text-amber-500' },
  { label: 'Enviadas Hoy', value: 8, icon: Send, color: 'text-blue-500' },
  { label: 'Completadas', value: 45, icon: CheckCircle, color: 'text-emerald-500' },
  { label: 'Expiradas', value: 3, icon: AlertTriangle, color: 'text-red-500' },
]

export default function OperacionesDashboard() {
  const router = useRouter()
  const { operator, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <OperatorLogin />
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const firstName = operator?.name.split(' ')[0] ?? 'Operador'

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          {getGreeting()}, <span className="text-primary">{firstName}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Bienvenido al Portal de Operaciones - Gestión de Solicitudes Documentales
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/operaciones/nueva')}>
          <CardHeader>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            <CardTitle>Nueva Solicitud Documental</CardTitle>
            <CardDescription>
              Generar una nueva solicitud de documentos para un cliente. Configure los documentos requeridos y envíe el enlace seguro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              Crear Solicitud
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/operaciones/solicitudes')}>
          <CardHeader>
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
              <FolderOpen className="w-7 h-7 text-secondary" />
            </div>
            <CardTitle>Gestionar Solicitudes</CardTitle>
            <CardDescription>
              Consulte el estado de las solicitudes existentes, reenvíe correos o vea los documentos cargados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="w-full">
              Ver Solicitudes
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-md mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'Solicitud SOL-2024-00045 completada', time: 'Hace 15 minutos', type: 'success' },
              { action: 'Nuevo acceso a SOL-2024-00044', time: 'Hace 1 hora', type: 'info' },
              { action: 'Correo enviado a cliente - SOL-2024-00043', time: 'Hace 2 horas', type: 'info' },
              { action: 'Solicitud SOL-2024-00042 expirada', time: 'Hace 3 horas', type: 'warning' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className={`w-2 h-2 rounded-full ${
                  item.type === 'success' ? 'bg-emerald-500' :
                  item.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
