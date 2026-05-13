'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { appRoutes } from '@/lib/routes'
import { Spinner } from '@/components/ui/spinner'

export default function OperadoresPage() {
  const router = useRouter()
  const { isAuthenticated, isAuthReady } = useAuth()
  const [isLocalhost, setIsLocalhost] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const hostname = window.location.hostname
    setIsLocalhost(
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname.endsWith('.localhost'),
    )
  }, [])

  useEffect(() => {
    if (!isAuthReady && !isLocalhost) return

    if (isLocalhost || isAuthenticated) {
      router.replace(appRoutes.operaciones.root)
      return
    }

    window.location.href = appRoutes.auth.login
  }, [isAuthenticated, isAuthReady, isLocalhost, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Spinner className="size-8 mb-4" />
        <p className="text-muted-foreground">Redirigiendo...</p>
      </div>
    </div>
  )
}
