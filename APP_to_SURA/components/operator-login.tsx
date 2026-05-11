'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { User, Lock, LogIn, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { loginOperator } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { appRoutes } from '@/lib/routes'

export function OperatorLogin() {
  const router = useRouter()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Por favor ingrese usuario y contraseña.')
      return
    }

    setIsLoading(true)

    try {
      const result = await loginOperator(username, password)

      if (result.success && result.operator) {
        login(result.operator)
        router.push(appRoutes.operadores)
      } else {
        setError(result.message)
      }
    } catch {
      setError('Error de conexión. Intente nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo-sura.png"
            alt="SURA"
            width={180}
            height={60}
            className="mb-2"
            priority
          />
          <p className="text-muted-foreground text-sm">Portal de Operaciones</p>
        </div>

        <Card className="shadow-xl border-0 bg-card">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-foreground">
              Iniciar Sesión
            </CardTitle>
            <CardDescription>
              Ingrese sus credenciales corporativas para acceder al sistema
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="username">Usuario corporativo</FieldLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Ingrese su usuario"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 h-11"
                      disabled={isLoading}
                      autoComplete="username"
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Ingrese su contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-11"
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                  </div>
                </Field>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <FieldError>{error}</FieldError>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner className="size-8" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Iniciar sesión
                    </>
                  )}
                </Button>
              </FieldGroup>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Credenciales de demostración:
              </p>
              <div className="space-y-1 text-xs text-muted-foreground font-mono">
                <p>Usuario: <span className="text-foreground">demo</span></p>
                <p>Contraseña: <span className="text-foreground">demo</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} SURA. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
