"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        // 如果超时后仍在加载，则停止检查并让后续逻辑处理
        setIsChecking(false);
      }
    }, 3000); // 3秒超时

    if (!isLoading) {
      setIsChecking(false);
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // 1. 如果没有用户，重定向到登录页
        router.replace('/auth/login');
      } else if (!profile?.has_paid_subscription) {
        // 2. 如果用户已登录但未付费，重定向到计费页
        router.replace('/billing');
      }
    }
  }, [user, profile, isLoading, router]);

  if (isLoading || isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // 3. 如果用户已登录且已付费，则显示子组件
  if (user && profile?.has_paid_subscription) {
    return <>{children}</>;
  }

  // 如果没有用户且没有在加载，则显示重定向中的加载状态
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">正在跳转到登录页面...</p>
      </div>
    </div>
  );
} 