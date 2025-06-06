"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUpWithEmail, useMockMode } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, ArrowLeft, Info } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isMockMode, setIsMockMode] = useState(false)
  
  // 检查是否在模拟模式下运行
  useEffect(() => {
    setIsMockMode(useMockMode())
  }, [])

  // 邮箱密码注册
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // 表单验证
    if (!email) {
      setError('请输入邮箱')
      return
    }
    
    if (!password) {
      setError('请输入密码')
      return
    }
    
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    
    if (password.length < 6) {
      setError('密码长度不能少于6位')
      return
    }
    
    setIsLoading(true)
    
    try {
      const { data, error } = await signUpWithEmail(email, password, { name })
      
      if (error) {
        throw error
      }
      
      setSuccess('注册成功！')
      
      // 注册成功，跳转到登录页面
      setTimeout(() => {
        router.push('/auth/login')
      }, 1500)
    } catch (err: any) {
      setError(err.message || '注册失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">创建账号</CardTitle>
          <CardDescription>
            注册一个新的会议笔记账号
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isMockMode && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                当前运行在模拟模式下，任意邮箱和密码均可注册
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                type="text"
                placeholder="请输入您的姓名（选填）"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="请输入邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码（至少6位）"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  注册中...
                </>
              ) : '注册'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            <span className="text-muted-foreground">已有账号？</span>{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              立即登录
            </Link>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="mx-auto"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首页
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 