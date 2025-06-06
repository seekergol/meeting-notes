"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, FileText, User, Zap, Home } from "lucide-react"

export default function TestDashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">测试仪表板</h1>
        <Button variant="outline" asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            返回首页
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>环境变量测试</CardTitle>
            <CardDescription>
              检查应用环境变量是否正确配置
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              此页面显示当前环境变量的配置状态，包括Supabase和OpenRouter API密钥。
            </p>
            <Button asChild>
              <Link href="/env-test">
                <Settings className="mr-2 h-4 w-4" />
                查看环境变量
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>API测试</CardTitle>
            <CardDescription>
              测试OpenRouter API是否正常工作
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              此页面测试OpenRouter API的会议摘要生成功能是否正常工作。
            </p>
            <Button asChild>
              <Link href="/api-test">
                <Zap className="mr-2 h-4 w-4" />
                测试API
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>认证测试</CardTitle>
            <CardDescription>
              测试Supabase认证是否正常工作
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              此页面测试Supabase的手机号验证码登录功能是否正常工作。
            </p>
            <Button asChild>
              <Link href="/auth-test">
                <User className="mr-2 h-4 w-4" />
                测试认证
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>功能测试</CardTitle>
            <CardDescription>
              测试语音识别和摘要生成功能
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              此页面测试应用的核心功能：语音识别和会议摘要生成。
            </p>
            <Button asChild>
              <Link href="/test">
                <FileText className="mr-2 h-4 w-4" />
                测试功能
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>应用主页</CardTitle>
            <CardDescription>
              访问应用的主要功能页面
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              此链接跳转到应用的主要功能页面，需要登录才能访问。
            </p>
            <Button asChild>
              <Link href="/app">
                <Home className="mr-2 h-4 w-4" />
                进入应用
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 