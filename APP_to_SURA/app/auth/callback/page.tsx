'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { appRoutes } from '@/lib/routes'
import { Spinner } from '@/components/ui/spinner'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace(appRoutes.operaciones.root)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Spinner className="size-8 mb-4" />
        <p className="text-muted-foreground">Redirigiendo...</p>
      </div>
    </div>
  )
}
