'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '@/lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount: try to restore session from the server (cookie-based)
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { user } = await authApi.me()
        setUser(user)
        localStorage.setItem('fintrack_user', JSON.stringify(user))
      } catch {
        // No valid session — fall back to whatever's cached, then clear it
        localStorage.removeItem('fintrack_user')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    restoreSession()
  }, [])

  const login = async (email, password) => {
    const { user } = await authApi.login({ email, password })
    localStorage.setItem('fintrack_user', JSON.stringify(user))
    setUser(user)
    return user
  }

  const register = async ({ firstName, lastName, email, password }) => {
    const { user } = await authApi.register({ firstName, lastName, email, password })
    localStorage.setItem('fintrack_user', JSON.stringify(user))
    setUser(user)
    return user
  }

  const logout = async () => {
    try { await authApi.logout() } catch { /* ignore network errors on logout */ }
    localStorage.removeItem('fintrack_user')
    setUser(null)
  }

  // Optimistic local update — used for instant UI feedback during onboarding steps
  const updateUser = (updates) => {
    const updated = { ...user, ...updates }
    localStorage.setItem('fintrack_user', JSON.stringify(updated))
    setUser(updated)
  }

  // Persists onboarding data to the server, then updates local state
  const completeOnboarding = async (data) => {
    const { user } = await authApi.completeOnboarding(data)
    localStorage.setItem('fintrack_user', JSON.stringify(user))
    setUser(user)
    return user
  }

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, updateUser, completeOnboarding,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}