"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { signOut } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus, LogOut } from 'lucide-react'
import ProtectedRoute from '@/components/auth/protected-route'

export default function AppPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [meetings, setMeetings] = useState<any[]>([])
  
  // 模拟会议数据
  useEffect(() => {
    if (user) {
      // 这里可以从API获取真实数据
      setMeetings([
        { id: 1, title: '产品讨论会议', date: '2023-10-15', summary: '讨论了新功能的开发计划和时间线' },
        { id: 2, title: '团队周会', date: '2023-10-10', summary: '回顾了上周工作，安排了本周任务' },
        { id: 3, title: '客户沟通会议', date: '2023-10-05', summary: '与客户讨论了项目进度和需求变更' },
      ])
    }
  }, [user])
  
  // 处理退出登录
  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      router.replace('/auth/login')
    } catch (error) {
      console.error('退出登录失败:', error)
    } finally {
      setIsSigningOut(false)
    }
  }
  
  // 创建新会议笔记
  const handleCreateMeeting = () => {
    router.push('/app/meetings/new')
  }
  
  // 查看会议详情
  const handleViewMeeting = (id: number) => {
    router.push(`/app/meetings/${id}`)
  }
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">会议笔记</h1>
          <div className="flex gap-2">
            <Button onClick={handleCreateMeeting} className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              新建会议
            </Button>
            <Button variant="outline" onClick={handleSignOut} disabled={isSigningOut}>
              {isSigningOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-1" />
                  退出
                </>
              )}
            </Button>
          </div>
        </div>
        
        {user && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>欢迎回来</CardTitle>
              <CardDescription>
                {user.user_metadata?.name || user.email || user.phone || '用户'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                您可以在这里管理您的所有会议笔记和摘要。
              </p>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meetings.map(meeting => (
            <Card key={meeting.id} className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleViewMeeting(meeting.id)}>
              <CardHeader>
                <CardTitle>{meeting.title}</CardTitle>
                <CardDescription>{meeting.date}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3">{meeting.summary}</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" onClick={(e) => {
                  e.stopPropagation();
                  handleViewMeeting(meeting.id);
                }}>
                  查看详情
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          {meetings.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">您还没有创建任何会议笔记</p>
              <Button onClick={handleCreateMeeting}>
                <Plus className="h-4 w-4 mr-2" />
                创建第一个会议笔记
              </Button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
} 