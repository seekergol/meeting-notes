"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signInWithPhone, verifyOTP, signInWithEmail, useMockMode } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, ArrowLeft, Info, Mail, Phone } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function LoginPage() {
  const router = useRouter()
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email')
  
  // 邮箱登录相关状态
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // 手机登录相关状态
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  
  // 通用状态
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isMockMode, setIsMockMode] = useState(false)
  
  // 检查是否在模拟模式下运行
  useEffect(() => {
    setIsMockMode(useMockMode())
  }, [])

  // 邮箱密码登录
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!email || !password) {
      setError('请输入邮箱和密码')
      return
    }
    
    setIsLoading(true)
    
    try {
      const { data, error } = await signInWithEmail(email, password)
      
      if (error) {
        throw error
      }
      
      setSuccess('登录成功！')
      
      // 登录成功，跳转到应用主页
      setTimeout(() => {
        // 使用replace而不是push，避免用户可以返回到登录页面
        router.replace('/app')
      }, 1000)
    } catch (err: any) {
      setError(err.message || '登录失败，请检查邮箱和密码')
    } finally {
      setIsLoading(false)
    }
  }

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
      
      setSuccess('登录成功！')
      
      // 登录成功，跳转到应用主页
      setTimeout(() => {
        // 使用replace而不是push，避免用户可以返回到登录页面
        router.replace('/app')
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
          <CardTitle className="text-2xl font-bold">用户登录</CardTitle>
          <CardDescription>
            登录您的会议笔记账号
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isMockMode && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                当前运行在模拟模式下，任意邮箱密码或手机号验证码(123456)均可登录
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
          
          <Tabs defaultValue="email" className="w-full" onValueChange={(value) => setLoginMethod(value as 'email' | 'phone')}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="email">
                <Mail className="h-4 w-4 mr-2" />
                邮箱登录
              </TabsTrigger>
              <TabsTrigger value="phone">
                <Phone className="h-4 w-4 mr-2" />
                手机登录
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-4">
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
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                      登录中...
                    </>
                  ) : '登录'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="phone">
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
                    ) : '登录'}
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
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            <span className="text-muted-foreground">还没有账号？</span>{' '}
            <Link href="/auth/register" className="text-primary hover:underline">
              立即注册
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