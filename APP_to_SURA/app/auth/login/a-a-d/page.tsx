'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { appRoutes } from '@/lib/routes'
import { Spinner } from '@/components/ui/spinner'

export default function AuthLoginPage() {
  const router = useRouter()

  useEffect(() => {
    const redirectUri = encodeURIComponent(`${window.location.origin}${appRoutes.operadores}`)
    window.location.replace(`${appRoutes.auth.login}?post_login_redirect_uri=${redirectUri}`)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Spinner className="size-8 mb-4" />
        <p className="text-muted-foreground">Redirigiendo a Microsoft Entra ID...</p>
      </div>
    </div>
  )
}
