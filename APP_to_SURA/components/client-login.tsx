'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Mail, ArrowRight, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/lib/auth-context'
import { appRoutes } from '@/lib/routes'

// TODO: Implementar API calls para OTP
// import { requestOTP, verifyOTP } from '@/lib/api'

export function ClientLogin() {
  const router = useRouter()
  const { setClientSession } = useAuth()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !email.includes('@')) {
      setError('Por favor ingrese un correo electrónico válido.')
      return
    }

    setIsLoading(true)

    try {
      // TODO: Implementar llamada a API para enviar OTP
      // const result = await requestOTP(email)

      // Simulación temporal
      await new Promise(resolve => setTimeout(resolve, 1000))

      setStep('otp')
    } catch {
      setError('Error al enviar el código. Intente nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!otp.trim() || otp.length !== 6) {
      setError('Por favor ingrese un código de 6 dígitos.')
      return
    }

    setIsLoading(true)

    try {
      // TODO: Implementar verificación de OTP
      // const result = await verifyOTP(email, otp)

      // Simulación temporal
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Crear sesión de cliente
      const session = {
        email,
        token: `client-token-${Date.now()}`, // TODO: Usar token real de API
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
      }

      setClientSession(session)

      // TODO: Redirigir al portal de carga de documentos
      // router.push('/carga')
    } catch {
      setError('Código incorrecto. Intente nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToEmail = () => {
    setStep('email')
    setOtp('')
    setError('')
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
          <p className="text-muted-foreground text-sm">Portal de Clientes</p>
        </div>

        <Card className="shadow-xl border-0 bg-card">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-foreground">
              {step === 'email' ? 'Acceso al Portal' : 'Verificar Código'}
            </CardTitle>
            <CardDescription>
              {step === 'email'
                ? 'Ingrese su correo electrónico para recibir un código de acceso'
                : `Se envió un código de 6 dígitos a ${email}`
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === 'email' ? (
              <form onSubmit={handleEmailSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11"
                        disabled={isLoading}
                        autoComplete="email"
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
                    className="w-full h-11 mt-2 gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner className="size-4" />
                        Enviando código...
                      </>
                    ) : (
                      <>
                        Enviar código
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </FieldGroup>
              </form>
            ) : (
              <form onSubmit={handleOTPSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="otp">Código de verificación</FieldLabel>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="h-11 text-center text-2xl tracking-widest"
                      disabled={isLoading}
                      maxLength={6}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Ingrese los 6 dígitos enviados a su correo
                    </p>
                  </Field>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <FieldError>{error}</FieldError>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={handleBackToEmail}
                      disabled={isLoading}
                    >
                      Atrás
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 gap-2"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Spinner className="size-4" />
                          Verificando...
                        </>
                      ) : (
                        <>
                          Verificar
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Demo info */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Modo de desarrollo:
          </p>
          <p className="text-xs text-muted-foreground">
            Cualquier código de 6 dígitos será aceptado temporalmente
          </p>
        </div>
      </div>
    </div>
  )
}