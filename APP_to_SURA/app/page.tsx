'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Shield, Upload, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Image
            src="/logo-sura.png"
            alt="SURA"
            width={140}
            height={47}
            priority
          />
          <Link href="/operaciones">
            <Button variant="outline" className="gap-2">
              <Users className="w-4 h-4" />
              Acceso Operadores
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Portal de Solicitud Documental
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Sistema seguro para la solicitud y carga de documentos de reclamaciones
          </p>
        </div>

        {/* Access Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Operator Access */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Portal de Operadores</CardTitle>
              <CardDescription>
                Acceso para operadores Konecta. Gestione solicitudes, genere enlaces seguros y envíe correos a clientes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/operaciones">
                <Button className="w-full gap-2">
                  Iniciar sesión
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Credenciales demo: <code className="bg-muted px-1 rounded">demo</code> / <code className="bg-muted px-1 rounded">demo</code>
              </p>
            </CardContent>
          </Card>

          {/* Customer Access */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-xl">Portal de Clientes</CardTitle>
              <CardDescription>
                Acceso para clientes con enlace de carga. Use el enlace personalizado que recibió por correo electrónico.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/carga/demo-token-123">
                <Button variant="outline" className="w-full gap-2">
                  Probar portal de demo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Código de seguridad demo: <code className="bg-muted px-1 rounded">123456</code>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Acceso Seguro</h3>
            <p className="text-sm text-muted-foreground">
              Enlaces de un solo uso con código de seguridad de 6 dígitos y máximo 3 intentos.
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-7 h-7 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Carga Simple</h3>
            <p className="text-sm text-muted-foreground">
              Interfaz intuitiva con drag & drop para cargar múltiples documentos fácilmente.
            </p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-success" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Gestión Completa</h3>
            <p className="text-sm text-muted-foreground">
              Panel de operadores para crear, enviar y monitorear solicitudes en tiempo real.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-8">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SURA. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  )
}
