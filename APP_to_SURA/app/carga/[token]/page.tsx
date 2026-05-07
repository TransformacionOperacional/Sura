'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { ShieldCheck, AlertTriangle, Clock, CheckCircle, Lock } from 'lucide-react'
import { validateToken } from '@/lib/api'
import { Spinner } from '@/components/ui/spinner'
import type { DocumentRequest } from '@/lib/types'
import { SecurityCodeForm } from '@/components/customer/security-code-form'
import { DocumentUploadPortal } from '@/components/customer/document-upload-portal'
import { SuccessConfirmation } from '@/components/customer/success-confirmation'

type PortalState = 'loading' | 'code_validation' | 'upload' | 'completed' | 'blocked' | 'expired' | 'used'

export default function CustomerPortalPage() {
  const params = useParams()
  const token = params.token as string

  const [state, setState] = useState<PortalState>('loading')
  const [request, setRequest] = useState<DocumentRequest | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [confirmationNumber, setConfirmationNumber] = useState('')

  const checkToken = useCallback(async () => {
    try {
      const result = await validateToken(token)

      if (!result.success) {
        if (result.used) {
          setState('used')
        } else if (result.expired) {
          setState('expired')
        } else {
          setState('blocked')
        }
        setErrorMessage(result.message)
        return
      }

      if (result.request) {
        setRequest(result.request)
        setState('code_validation')
      }
    } catch (error) {
      console.error('Error validating token:', error)
      setState('blocked')
      setErrorMessage('Error de conexión. Por favor intente más tarde.')
    }
  }, [token])

  useEffect(() => {
    checkToken()
  }, [checkToken])

  const handleCodeValidated = (validatedRequest: DocumentRequest) => {
    setRequest(validatedRequest)
    setState('upload')
  }

  const handleUploadComplete = (confNumber: string) => {
    setConfirmationNumber(confNumber)
    setState('completed')
  }

  const handleBlocked = (message: string) => {
    setErrorMessage(message)
    setState('blocked')
  }

  // Loading state
  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Spinner className="mx-auto mb-4 size-8" />
          <p className="text-muted-foreground">Validando acceso...</p>
        </div>
      </div>
    )
  }

  // Blocked states
  if (state === 'blocked' || state === 'expired' || state === 'used') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            {state === 'expired' ? (
              <Clock className="w-10 h-10 text-destructive" />
            ) : state === 'used' ? (
              <CheckCircle className="w-10 h-10 text-muted-foreground" />
            ) : (
              <AlertTriangle className="w-10 h-10 text-destructive" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {state === 'expired' ? 'Enlace Expirado' : 
             state === 'used' ? 'Enlace Utilizado' : 
             'Acceso Bloqueado'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {errorMessage || 'Este enlace no es válido o ya no está disponible.'}
          </p>
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground">
              Si necesita asistencia, por favor comuníquese con nuestra línea de atención al cliente.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Completed state
  if (state === 'completed') {
    return <SuccessConfirmation confirmationNumber={confirmationNumber} clientName={request?.client.fullName || ''} />
  }

  // Code validation state
  if (state === 'code_validation' && request) {
    return (
      <SecurityCodeForm
        token={token}
        clientName={request.client.fullName}
        onValidated={handleCodeValidated}
        onBlocked={handleBlocked}
      />
    )
  }

  // Upload state
  if (state === 'upload' && request) {
    return (
      <DocumentUploadPortal
        request={request}
        onComplete={handleUploadComplete}
      />
    )
  }

  return null
}
