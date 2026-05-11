'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
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
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated && pathname !== appRoutes.operaciones.root) {
      router.push(appRoutes.home)
    }
  }, [isAuthenticated, pathname, router])

  if (!isAuthenticated && pathname !== appRoutes.operaciones.root) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {isAuthenticated && <OperatorSidebar />}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
