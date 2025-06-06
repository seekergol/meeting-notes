"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signInWithPhone, verifyOTP } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, ArrowLeft, Info } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [success, setSuccess] = useState<string | null>(null)
  const [isMockMode, setIsMockMode] = useState(false)
  
  // 检查是否在模拟模式下运行
  useEffect(() => {
    const checkMockMode = () => {
      return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
    setIsMockMode(checkMockMode())
  }, [])

  // 发送验证码
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!phone || phone.length < 11) {
      setError('请输入有效的手机号码')
      return
    }
    
    setIsLoading(true)
    
    try {
      const formattedPhone = formatPhoneNumber(phone)
      const { error } = await signInWithPhone(formattedPhone)
      
      if (error) {
        throw error
      }
      
      setSuccess('验证码已发送到您的手机，请查收')
      if (isMockMode) {
        setSuccess('模拟模式：验证码为 123456')
      }
      setStep('otp')
    } catch (err: any) {
      setError(err.message || '发送验证码失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }
  
  // 验证OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!otp || otp.length < 6) {
      setError('请输入完整的验证码')
      return
    }
    
    setIsLoading(true)
    
    try {
      const formattedPhone = formatPhoneNumber(phone)
      const { data, error } = await verifyOTP(formattedPhone, otp)
      
      if (error) {
        throw error
      }
      
      setSuccess('注册成功！')
      
      // 注册成功，跳转到应用主页
      setTimeout(() => {
        router.push('/app')
      }, 1000)
    } catch (err: any) {
      setError(err.message || '验证码验证失败，请检查后重试')
    } finally {
      setIsLoading(false)
    }
  }
  
  // 格式化手机号为国际格式
  const formatPhoneNumber = (phoneNumber: string) => {
    // 如果不是以+开头，添加中国区号
    if (!phoneNumber.startsWith('+')) {
      return `+86${phoneNumber}`
    }
    return phoneNumber
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">用户注册</CardTitle>
          <CardDescription>
            创建您的会议笔记账号
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isMockMode && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                当前运行在模拟模式下，使用验证码 123456 注册
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
          
          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">手机号码</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="请输入手机号码"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                    发送验证码...
                  </>
                ) : '发送验证码'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="otp">验证码</Label>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-xs"
                    onClick={() => setStep('phone')}
                    type="button"
                  >
                    更换手机号
                  </Button>
                </div>
                <Input
                  id="otp"
                  type="text"
                  placeholder="请输入验证码"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
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
                    验证中...
                  </>
                ) : '完成注册'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleSendOTP}
                disabled={isLoading}
              >
                重新发送验证码
              </Button>
            </form>
          )}
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