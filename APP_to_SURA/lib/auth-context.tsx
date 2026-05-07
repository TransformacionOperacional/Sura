'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Operator } from './types'

interface AuthContextType {
  operator: Operator | null
  isAuthenticated: boolean
  login: (operator: Operator) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const SESSION_KEY = 'operator_session'
const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [operator, setOperator] = useState<Operator | null>(null)
  const [lastActivity, setLastActivity] = useState<number>(Date.now())

  // Load session from storage
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored) {
      try {
        const { operator: storedOperator, timestamp } = JSON.parse(stored)
        const elapsed = Date.now() - timestamp
        if (elapsed < INACTIVITY_TIMEOUT) {
          setOperator(storedOperator)
          setLastActivity(timestamp)
        } else {
          sessionStorage.removeItem(SESSION_KEY)
        }
      } catch {
        sessionStorage.removeItem(SESSION_KEY)
      }
    }
  }, [])

  // Track activity
  useEffect(() => {
    if (!operator) return

    const updateActivity = () => {
      const now = Date.now()
      setLastActivity(now)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ operator, timestamp: now }))
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => window.addEventListener(event, updateActivity))

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity))
    }
  }, [operator])

  // Auto logout on inactivity
  useEffect(() => {
    if (!operator) return

    const interval = setInterval(() => {
      if (Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
        logout()
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [operator, lastActivity])

  const login = useCallback((op: Operator) => {
    setOperator(op)
    const now = Date.now()
    setLastActivity(now)
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ operator: op, timestamp: now }))
  }, [])

  const logout = useCallback(() => {
    setOperator(null)
    sessionStorage.removeItem(SESSION_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ operator, isAuthenticated: !!operator, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
