"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, refreshUser } = useAuth()
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [redirecting, setRedirecting] = useState(false)
  
  // 设置最大检查时间
  useEffect(() => {
    const maxCheckTime = setTimeout(() => {
      if (isCheckingAuth) {
        console.log('认证检查超时，强制完成检查')
        setIsCheckingAuth(false)
      }
    }, 3000) // 最多等待3秒
    
    return () => clearTimeout(maxCheckTime)
  }, [isCheckingAuth])
  
  useEffect(() => {
    // 首次加载时刷新用户信息
    const checkAuth = async () => {
      try {
        await refreshUser()
      } catch (error) {
        console.error('刷新用户信息失败:', error)
      } finally {
        setIsCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [refreshUser])
  
  useEffect(() => {
    // 当认证状态确定后，如果未登录则重定向
    if (!isLoading && !isCheckingAuth && !user && !redirecting) {
      // 用户未登录，重定向到登录页面
      console.log('用户未登录，重定向到登录页面')
      setRedirecting(true)
      router.replace('/auth/login')
    }
  }, [user, isLoading, router, isCheckingAuth, redirecting])
  
  // 加载状态 - 限制加载时间
  if ((isLoading || isCheckingAuth) && !redirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">正在加载...</p>
        </div>
      </div>
    )
  }
  
  // 如果用户已登录，显示子组件
  if (user) {
    return <>{children}</>
  }
  
  // 如果正在重定向，显示重定向中
  if (redirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">正在跳转到登录页面...</p>
        </div>
      </div>
    )
  }
  
  // 默认返回null，避免闪烁
  return null
} 