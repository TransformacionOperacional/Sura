'use client'

import Image from 'next/image'
import { CheckCircle, FileText, Calendar, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface SuccessConfirmationProps {
  confirmationNumber: string
  clientName: string
}

export function SuccessConfirmation({ confirmationNumber, clientName }: SuccessConfirmationProps) {
  const currentDate = new Date().toLocaleString('es-CO', {
    dateStyle: 'full',
    timeStyle: 'medium'
  })

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo-sura.png"
            alt="SURA"
            width={180}
            height={60}
            priority
          />
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center">
            {/* Success Icon */}
            <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">
              Documentos Recibidos Correctamente
            </h1>

            <p className="text-muted-foreground mb-8">
              Gracias, <span className="font-medium text-foreground">{clientName}</span>. Sus documentos han sido enviados exitosamente.
            </p>

            {/* Confirmation Details */}
            <div className="p-6 rounded-xl bg-muted/50 border border-border space-y-4 text-left mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Número de Confirmación</p>
                  <p className="font-mono font-bold text-lg text-foreground">{confirmationNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha y Hora de Recepción</p>
                  <p className="font-medium text-foreground">{currentDate}</p>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 mb-6">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Importante:</strong> Guarde su número de confirmación como comprobante. Este enlace ya no será accesible.
              </p>
            </div>

            {/* Action */}
            <Button variant="outline" className="gap-2" onClick={() => window.close()}>
              <Home className="w-4 h-4" />
              Cerrar ventana
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Si tiene alguna consulta, comuníquese con nuestra línea de atención al cliente.
        </p>

        <p className="text-center text-xs text-muted-foreground mt-2">
          © {new Date().getFullYear()} SURA. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
