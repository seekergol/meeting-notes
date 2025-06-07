"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { signInWithPhone, verifyOTP, signOut } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Info, CheckCircle } from "lucide-react"

export default function AuthTestPage() {
  const { user, isLoading } = useAuth()
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const handleSendOTP = async () => {
    if (!phone || phone.length < 11) {
      setError("请输入有效的手机号码")
      return
    }
    
    setIsAuthLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const formattedPhone = formatPhoneNumber(phone)
      const { error } = await signInWithPhone(formattedPhone)
      
      if (error) {
        throw error
      }
      
      setSuccess("验证码已发送到您的手机，请查收")
    } catch (err: any) {
      setError(err.message || "发送验证码失败，请稍后重试")
    } finally {
      setIsAuthLoading(false)
    }
  }
  
  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      setError("请输入完整的验证码")
      return
    }
    
    setIsAuthLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const formattedPhone = formatPhoneNumber(phone)
      const { data, error } = await verifyOTP(formattedPhone, otp)
      
      if (error) {
        throw error
      }
      
      setSuccess("登录成功！")
    } catch (err: any) {
      setError(err.message || "验证码验证失败，请检查后重试")
    } finally {
      setIsAuthLoading(false)
    }
  }
  
  const handleSignOut = async () => {
    setIsAuthLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const { error } = await signOut()
      
      if (error) {
        throw error
      }
      
      setSuccess("已成功退出登录")
    } catch (err: any) {
      setError(err.message || "退出登录失败，请稍后重试")
    } finally {
      setIsAuthLoading(false)
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
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">认证测试</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Supabase认证测试</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2">加载中...</span>
              </div>
            ) : user ? (
              <div>
                <div className="p-4 bg-muted/30 rounded-md mb-4">
                  <h3 className="font-medium mb-2">当前登录用户:</h3>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
                
                <Button 
                  onClick={handleSignOut}
                  disabled={isAuthLoading}
                  variant="destructive"
                >
                  {isAuthLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      处理中...
                    </>
                  ) : "退出登录"}
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">手机号码</label>
                    <Input
                      type="tel"
                      placeholder="请输入手机号码"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isAuthLoading}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSendOTP}
                    disabled={isAuthLoading || !phone}
                  >
                    {isAuthLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        处理中...
                      </>
                    ) : "发送验证码"}
                  </Button>
                </div>
                
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">验证码</label>
                    <Input
                      type="text"
                      placeholder="请输入验证码"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      disabled={isAuthLoading}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleVerifyOTP}
                    disabled={isAuthLoading || !otp}
                  >
                    {isAuthLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        处理中...
                      </>
                    ) : "验证并登录"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 