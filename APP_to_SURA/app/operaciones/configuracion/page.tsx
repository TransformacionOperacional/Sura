'use client'

import { Settings, Bell, Shield, Database, Mail } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ConfiguracionPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Personalice las opciones del sistema
        </p>
      </div>

      <div className="space-y-6">
        {/* Notifications */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Notificaciones</CardTitle>
                <CardDescription>Configure las alertas del sistema</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="font-medium text-sm">Notificar documentos completados</p>
                <p className="text-xs text-muted-foreground">Recibir alerta cuando un cliente complete su carga</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="font-medium text-sm">Alertas de expiración</p>
                <p className="text-xs text-muted-foreground">Notificar cuando una solicitud esté próxima a expirar</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="font-medium text-sm">Resumen diario</p>
                <p className="text-xs text-muted-foreground">Recibir un resumen de actividad al final del día</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-lg">Seguridad</CardTitle>
                <CardDescription>Opciones de seguridad para solicitudes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>Días de expiración por defecto</FieldLabel>
                <Select defaultValue="7">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 días</SelectItem>
                    <SelectItem value="5">5 días</SelectItem>
                    <SelectItem value="7">7 días</SelectItem>
                    <SelectItem value="14">14 días</SelectItem>
                    <SelectItem value="30">30 días</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Intentos máximos de código</FieldLabel>
                <Select defaultValue="3">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 intentos</SelectItem>
                    <SelectItem value="5">5 intentos</SelectItem>
                    <SelectItem value="10">10 intentos</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Tiempo de sesión (minutos)</FieldLabel>
                <Select defaultValue="15">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 minutos</SelectItem>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Email */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-lg">Correo Electrónico</CardTitle>
                <CardDescription>Configure la plantilla de correo</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>Remitente</FieldLabel>
                <Input defaultValue="reclamaciones@sura.com" disabled />
              </Field>
              <Field>
                <FieldLabel>Copia oculta (BCC)</FieldLabel>
                <Input placeholder="correo@ejemplo.com" />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* SharePoint */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Database className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">SharePoint</CardTitle>
                <CardDescription>Configuración del destino de archivos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel>URL del sitio</FieldLabel>
                <Input defaultValue="https://sura.sharepoint.com/sites/Reclamaciones" disabled />
              </Field>
              <Field>
                <FieldLabel>Biblioteca</FieldLabel>
                <Input defaultValue="Documentos_Reclamaciones" disabled />
              </Field>
            </FieldGroup>
            <p className="text-xs text-muted-foreground mt-4">
              Para modificar la configuración de SharePoint, contacte al administrador del sistema.
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button className="gap-2">
            <Settings className="w-4 h-4" />
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  )
}
