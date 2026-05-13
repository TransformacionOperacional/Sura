'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { Operator } from './types'

interface AuthContextType {
  // Operadores (Entra ID)
  operator: Operator | null
  isAuthenticated: boolean
  isAuthReady: boolean
  login: (operator: Operator) => void
  logout: () => void

  // Clientes (OTP - futuro)
  clientSession: ClientSession | null
  isClientAuthenticated: boolean
  setClientSession: (session: ClientSession | null) => void
}

interface ClientSession {
  email: string
  token: string
  expiresAt: number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const SESSION_KEY = 'operator_session'
const CLIENT_SESSION_KEY = 'client_session'
const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutes

function isLocalhostHost(hostname: string) {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname.endsWith('.localhost')
  )
}

function createDevOperator(): Operator {
  return {
    id: 'dev-operator',
    username: 'developer@localhost',
    name: 'Operador Local',
    email: 'developer@localhost',
    role: 'Operador',
    department: 'Operaciones',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [operator, setOperator] = useState<Operator | null>(null)
  const [clientSession, setClientSessionState] = useState<ClientSession | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isLocalhost, setIsLocalhost] = useState(false)
  const [lastActivity, setLastActivity] = useState<number>(Date.now())

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const hostname = window.location.hostname
    const local = isLocalhostHost(hostname)
    setIsLocalhost(local)

    const restoreOperator = (): boolean => {
      const stored = sessionStorage.getItem(SESSION_KEY)
      if (!stored) {
        return false
      }

      try {
        const { operator: storedOperator, timestamp } = JSON.parse(stored)
        const elapsed = Date.now() - timestamp
        if (storedOperator && elapsed < INACTIVITY_TIMEOUT) {
          setOperator(storedOperator)
          setLastActivity(timestamp)
          return true
        }
      } catch {
        // ignore invalid session payload
      }

      sessionStorage.removeItem(SESSION_KEY)
      return false
    }

    if (local) {
      if (!restoreOperator()) {
        const devOperator = createDevOperator()
        setOperator(devOperator)
        setLastActivity(Date.now())
        sessionStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ operator: devOperator, timestamp: Date.now() }),
        )
      }
      setIsReady(true)
      return
    }

    async function loadStaticWebAppAuth() {
      try {
        const response = await fetch('/.auth/me', { cache: 'no-store' })
        if (!response.ok) {
          setOperator(null)
          return
        }

        const body = await response.json()
        const principal = body?.clientPrincipal
        const hasAuthenticatedUser = Boolean(
          principal?.userId &&
          principal?.identityProvider &&
          Array.isArray(principal?.userRoles) &&
          principal.userRoles.some((role: string) => role !== 'anonymous'),
        )

        if (hasAuthenticatedUser) {
          const operator: Operator = {
            id: principal.userId,
            username: principal.userDetails || principal.userId,
            name: principal.userDetails || principal.userId,
            email: principal.userDetails,
            role: principal.userRoles.includes('authenticated')
              ? 'Operador'
              : principal.userRoles.find((role: string) => role !== 'anonymous') || 'Operador',
            department: 'Operaciones',
          }

          setOperator(operator)
          setLastActivity(Date.now())
          sessionStorage.setItem(
            SESSION_KEY,
            JSON.stringify({ operator, timestamp: Date.now() }),
          )
        } else {
          setOperator(null)
          sessionStorage.removeItem(SESSION_KEY)
        }
      } catch (error) {
        console.error('AuthProvider /.auth/me error:', error)
        setOperator(null)
        sessionStorage.removeItem(SESSION_KEY)
      } finally {
        setIsReady(true)
      }
    }

    loadStaticWebAppAuth()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const stored = sessionStorage.getItem(CLIENT_SESSION_KEY)
    if (!stored) {
      return
    }

    try {
      const session: ClientSession = JSON.parse(stored)
      if (session.expiresAt > Date.now()) {
        setClientSessionState(session)
      } else {
        sessionStorage.removeItem(CLIENT_SESSION_KEY)
      }
    } catch {
      sessionStorage.removeItem(CLIENT_SESSION_KEY)
    }
  }, [])

  const login = useCallback((op: Operator) => {
    setOperator(op)
    const now = Date.now()
    setLastActivity(now)
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ operator: op, timestamp: now }))
  }, [])

  const logout = useCallback(() => {
    setOperator(null)
    setClientSessionState(null)
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(CLIENT_SESSION_KEY)

    if (typeof window !== 'undefined' && !isLocalhost) {
      window.location.href = `/.auth/logout?post_logout_redirect_uri=${encodeURIComponent(window.location.origin)}`
    }
  }, [isLocalhost])

  useEffect(() => {
    if (!operator) {
      return
    }

    const updateActivity = () => {
      const now = Date.now()
      setLastActivity(now)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ operator, timestamp: now }))
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach((event) => window.addEventListener(event, updateActivity))

    return () => {
      events.forEach((event) => window.removeEventListener(event, updateActivity))
    }
  }, [operator])

  useEffect(() => {
    if (!operator) {
      return
    }

    const interval = setInterval(() => {
      if (Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
        logout()
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [operator, lastActivity, logout])

  const setClientSession = useCallback((session: ClientSession | null) => {
    setClientSessionState(session)
    if (session) {
      sessionStorage.setItem(CLIENT_SESSION_KEY, JSON.stringify(session))
    } else {
      sessionStorage.removeItem(CLIENT_SESSION_KEY)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        operator,
        isAuthenticated: !!operator,
        isAuthReady: isReady,
        login,
        logout,
        clientSession,
        isClientAuthenticated: !!clientSession,
        setClientSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    return {
      operator: null,
      isAuthenticated: false,
      isAuthReady: false,
      login: () => {},
      logout: () => {},
      clientSession: null,
      isClientAuthenticated: false,
      setClientSession: () => {},
    }
  }

  return context
}
