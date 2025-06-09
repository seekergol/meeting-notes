"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function Home() {
  const { user, isLoading } = useAuth()
  console.log('Test Var from .env.local:', process.env.NEXT_PUBLIC_TEST_VAR);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* 导航栏 */}
      <nav className="container mx-auto py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary-foreground"
            >
              <path d="M12 2v8"></path>
              <path d="m4.93 10.93 1.41 1.41"></path>
              <path d="M2 18h2"></path>
              <path d="M20 18h2"></path>
              <path d="m19.07 10.93-1.41 1.41"></path>
              <path d="M22 22H2"></path>
              <path d="m8 22 4-10 4 10"></path>
            </svg>
                </div>
          <span className="font-bold text-xl">会议笔记三件套</span>
                  </div>
        <div className="flex items-center gap-4">
          <Link href="#" className="text-muted-foreground hover:text-foreground">
            特性
          </Link>
          <Link href="/test" className="text-muted-foreground hover:text-foreground">
            测试功能
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground">
            文档
          </Link>
          {isLoading ? (
            <Button variant="ghost" size="sm" disabled>加载中...</Button>
          ) : user ? (
            <Link href="/app">
              <Button variant="default" size="sm">进入应用</Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">登录</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="default" size="sm">注册</Button>
              </Link>
                  </div>
          )}
                </div>
      </nav>

      {/* 英雄区域 */}
      <section className="container mx-auto py-20 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-block">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border bg-muted/50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span className="text-sm font-medium">高效易用</span>
                  </div>
                </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">立即实现会议转录</h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0">
            告别低效率，用我们开创性的 AI 应用程序提高您的工作流程，提高生产力，并轻松实现人最大化。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            {user ? (
              <Link href="/app">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  进入应用
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Button>
              </Link>
            ) : (
              <Link href="/auth/register">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  立即注册使用
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Button>
              </Link>
            )}
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              了解更多信息
            </Button>
          </div>
          <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
            <span>已有 350 家企业和 10 位用户（增长中）</span>
                  </div>
          <div className="flex items-center justify-center lg:justify-start gap-2">
            <div className="flex -space-x-2">
              <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                JD
              </div>
              <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                WL
                </div>
              <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                ZM
                            </div>
              <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                99+
                            </div>
                            </div>
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-yellow-400"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                      ))}
                    </div>
              <span className="text-sm">来自 99+ 满意用户</span>
                  </div>
                </div>
        </div>
        <div className="flex-1">
          <div className="relative">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary/50 to-secondary/50 opacity-75 blur-xl"></div>
            <Card className="relative overflow-hidden border-0 shadow-xl float-animation">
              <CardContent className="p-0">
                <div className="screenshot-container">
                  <img
                    src="/images/app-screenshot-1.svg"
                    alt="会议笔记应用截图"
                    className="w-full h-auto rounded-lg"
                    width={600}
                    height={400}
                  />
                  <div className="screenshot-overlay"></div>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </section>

      {/* 特性区域 */}
      <section className="container mx-auto py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">提升您的效率！</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            我们的会议笔记工具让您的工作更加轻松高效
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary/30 to-secondary/30 opacity-50 blur-xl"></div>
            <Card className="relative overflow-hidden border-0 shadow-xl float-animation-delay">
              <CardContent className="p-0">
                <div className="screenshot-container">
                  <img
                    src="/images/app-screenshot-2.svg"
                    alt="会议笔记功能展示"
                    className="w-full h-auto rounded-lg"
                    width={600}
                    height={400}
                  />
                  <div className="screenshot-overlay"></div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-primary h-5 w-5" />
                <h3 className="font-semibold text-xl">实时语音转写</h3>
              </div>
              <p className="text-muted-foreground">
                利用先进的语音识别技术，实时将会议内容转写为文本，支持多人发言区分。
              </p>
                  </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-primary h-5 w-5" />
                <h3 className="font-semibold text-xl">AI智能摘要</h3>
                            </div>
              <p className="text-muted-foreground">
                使用OpenRouter API自动生成结构化的会议摘要，包括主要讨论点、决策和行动项目。
              </p>
                            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-primary h-5 w-5" />
                <h3 className="font-semibold text-xl">便捷归档管理</h3>
                          </div>
              <p className="text-muted-foreground">
                轻松保存和检索会议记录，按部门或关键词快速搜索历史会议内容。
                          </p>
            </div>
            {user ? (
              <Link href="/app">
                <Button size="lg" className="w-full sm:w-auto">
                  进入应用
                </Button>
              </Link>
            ) : (
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">
                  立即免费使用
                          </Button>
              </Link>
            )}
            <p className="text-xs text-muted-foreground">7 天免费试用，无需信用卡</p>
          </div>
                  </div>
      </section>

      {/* 页脚 */}
      <footer className="border-t bg-muted/40">
        <div className="container mx-auto py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary-foreground"
                >
                  <path d="M12 2v8"></path>
                  <path d="m4.93 10.93 1.41 1.41"></path>
                  <path d="M2 18h2"></path>
                  <path d="M20 18h2"></path>
                  <path d="m19.07 10.93-1.41 1.41"></path>
                  <path d="M22 22H2"></path>
                  <path d="m8 22 4-10 4 10"></path>
                </svg>
              </div>
              <span className="font-bold">会议笔记三件套</span>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="cursor-pointer">
                安装
              </Badge>
              <Badge variant="outline" className="cursor-pointer">
                文档
              </Badge>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="4"></circle>
                  <path d="M12 2v2"></path>
                  <path d="M12 20v2"></path>
                  <path d="m4.93 4.93 1.41 1.41"></path>
                  <path d="m17.66 17.66 1.41 1.41"></path>
                  <path d="M2 12h2"></path>
                  <path d="M20 12h2"></path>
                  <path d="m6.34 17.66-1.41 1.41"></path>
                  <path d="m19.07 4.93-1.41 1.41"></path>
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
