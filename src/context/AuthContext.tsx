import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { login as loginApi, register as registerApi, logout as logoutApi, getCurrentUser } from '../api'
import type { UserInfo, LoginParams, RegisterParams } from '../api'

interface AuthContextType {
  user: UserInfo | null
  isAuthenticated: boolean
  loading: boolean
  login: (params: LoginParams) => Promise<{ success: boolean; message?: string }>
  register: (params: RegisterParams) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  // 初始化：检查本地 Token 并获取用户信息
  useEffect(() => {
    const token = localStorage.getItem('campus_auth_token')
    if (!token) {
      setLoading(false)
      return
    }
    getCurrentUser().then((res) => {
      if (res.data) setUser(res.data)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [])

  const login = useCallback(async (params: LoginParams) => {
    const res = await loginApi(params)
    if (res.success && res.data) {
      setUser(res.data)
      return { success: true }
    }
    return { success: false, message: res.message }
  }, [])

  const register = useCallback(async (params: RegisterParams) => {
    const res = await registerApi(params)
    if (res.success) {
      // 注册成功后尝试获取用户信息
      const userRes = await getCurrentUser()
      if (userRes.data) setUser(userRes.data)
      return { success: true, message: res.message }
    }
    return { success: false, message: res.message }
  }, [])

  const logout = useCallback(async () => {
    await logoutApi()
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const res = await getCurrentUser()
    if (res.data) setUser(res.data)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      login,
      register,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}