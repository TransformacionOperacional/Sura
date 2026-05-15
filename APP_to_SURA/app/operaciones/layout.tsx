'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { OperatorSidebar } from '@/components/operator-sidebar'
import { useAuth } from '@/lib/auth-context'
import { appRoutes } from '@/lib/routes'
import { Spinner } from '@/components/ui/spinner'

export default function OperacionesLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
    if (isLocalhost) return

    if (!isAuthReady) return

    if (!isAuthenticated) {
      router.replace(appRoutes.operadores)
    }
  }, [isAuthenticated, isAuthReady, isLocalhost, router])

  if (!isAuthReady && !isLocalhost) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="size-8" />
      </div>
    )
  }
  /*
  useEffect(() => {
    if (!isAuthReady && !isLocalhost) return

    if (!isAuthenticated && !isLocalhost) {
      router.replace(appRoutes.operadores)
    }
  }, [isAuthenticated, isAuthReady, isLocalhost, router])

  if (!isAuthReady && !isLocalhost) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="size-8" />
      </div>
    )
  }
*/
  return (
    <div className="flex min-h-screen bg-background">
      <OperatorSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
