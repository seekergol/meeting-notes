"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, getCurrentUser, useMockMode } from '@/lib/supabase'

type User = any
type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  refreshUser: async () => {}
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBrowser, setIsBrowser] = useState(false)

  // 确保只在客户端执行
  useEffect(() => {
    setIsBrowser(true)
    
    // 检查本地存储中是否有模拟用户数据
    if (useMockMode()) {
      const mockLoggedIn = localStorage.getItem('mock_logged_in')
      const mockUser = localStorage.getItem('mock_user')
      
      if (mockLoggedIn === 'true' && mockUser) {
        try {
          setUser(JSON.parse(mockUser))
        } catch (e) {
          console.error('解析模拟用户数据失败', e)
        }
      }
      setIsLoading(false)
    }
  }, [])

  const refreshUser = async () => {
    if (!isBrowser) return
    
    setIsLoading(true)
    try {
      const { user: currentUser } = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('刷新用户信息失败:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // 只在浏览器环境执行
    if (!isBrowser) return

    // 初始化时获取用户信息
    refreshUser()

    // 如果不是模拟模式，监听认证状态变化
    if (!useMockMode()) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            setUser(session.user)
          } else {
            setUser(null)
          }
          setIsLoading(false)
        }
      )

      return () => {
        if (authListener?.subscription) {
          authListener.subscription.unsubscribe()
        }
      }
    }
  }, [isBrowser])

  const value = {
    user,
    isLoading: !isBrowser || isLoading, // 在SSR期间始终显示为加载中
    isAuthenticated: !!user,
    refreshUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 