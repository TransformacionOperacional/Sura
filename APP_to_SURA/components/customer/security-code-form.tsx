'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Lock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { validateSecurityCode } from '@/lib/api'
import type { DocumentRequest } from '@/lib/types'

interface SecurityCodeFormProps {
  token: string
  clientName: string
  onValidated: (request: DocumentRequest) => void
  onBlocked: (message: string) => void
}

export function SecurityCodeForm({ token, clientName, onValidated, onBlocked }: SecurityCodeFormProps) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [attemptsRemaining, setAttemptsRemaining] = useState(3)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData.length === 6) {
      setCode(pastedData.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullCode = code.join('')

    if (fullCode.length !== 6) {
      setError('Por favor ingrese los 6 dígitos del código.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await validateSecurityCode(token, fullCode)

      if (result.success && result.request) {
        onValidated(result.request)
      } else {
        if (result.blocked) {
          onBlocked(result.message)
        } else {
          setError(result.message)
          setAttemptsRemaining(result.attemptsRemaining ?? 0)
          setCode(['', '', '', '', '', ''])
          inputRefs.current[0]?.focus()
        }
      }
    } catch {
      setError('Error de conexión. Por favor intente nuevamente.')
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
          <p className="text-muted-foreground text-sm">Portal Seguro de Cargue Documental</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl">Validación de Acceso</CardTitle>
            <CardDescription>
              Hola <span className="font-medium text-foreground">{clientName}</span>, ingrese el código de seguridad de 6 dígitos que recibió en su correo electrónico.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold"
                    disabled={isLoading}
                  />
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {attemptsRemaining < 3 && attemptsRemaining > 0 && (
                <p className="text-sm text-amber-600 text-center mb-4">
                  Intentos restantes: {attemptsRemaining}
                </p>
              )}

              <Button type="submit" className="w-full h-12" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner className="size-8" />
                    Validando...
                  </>
                ) : (
                  'Validar acceso'
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground text-center">
                Este es un acceso personal e intransferible. El enlace es de un solo uso y tiene un tiempo límite de expiración.
              </p>
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
