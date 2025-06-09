"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, Save, Mic, MicOff } from 'lucide-react'
import ProtectedRoute from '@/components/auth/protected-route'
import { addMeeting } from '@/lib/supabase'

// 移动到文件顶部，避免与组件内的逻辑混淆
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function NewMeetingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [content, setContent] = useState('')
  
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isBrowserSupported, setIsBrowserSupported] = useState(true)

  const recognitionRef = useRef<any | null>(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsBrowserSupported(false)
      setError("您的浏览器不支持语音识别功能，请尝试使用最新版本的 Chrome 或 Edge 浏览器。")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'zh-CN'

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }
      if (finalTranscript) {
          setContent((prevContent: string) => prevContent + finalTranscript)
      }
    }

    recognition.onerror = (event: any) => {
      setError(`语音识别错误: ${event.error}`)
      setIsRecording(false)
    }
    
    recognition.onend = () => {
        setIsRecording(false)
    }

    recognitionRef.current = recognition
  }, [])

  const handleToggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
      setError(null) 
    }
    setIsRecording(!isRecording);
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    
    if (!title) {
      setError('请输入会议标题')
      return
    }
     if (!content) {
      setError('会议内容不能为空，请手动输入或使用语音识别功能')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      if (!user) throw new Error("用户未登录")
      
      const { data, error: addError } = await addMeeting({
        user_id: user.id,
        title,
        department,
        summary: content.slice(0, 150) + (content.length > 150 ? '...' : ''), 
        content,
      })

      if (addError) throw addError

      if(data?.[0]?.id) {
        router.push(`/app/meetings/${data[0].id}`)
      } else {
        router.push('/app')
      }

    } catch (err: any) {
      setError(err.message || '创建会议失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6 px-4 md:px-6 max-w-2xl">
        <div className="mb-6">
           <Button variant="ghost" onClick={() => router.back()}>
             <ArrowLeft className="mr-2 h-4 w-4" />
             返回
           </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>创建新的会议记录</CardTitle>
            <CardDescription>
              手动输入或使用麦克风进行实时语音转录。
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="title">会议标题 *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：2024年第二季度产品规划会"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">相关部门 (可选)</Label>
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="例如：产品部、研发部"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                 <div className="flex justify-between items-center">
                    <Label htmlFor="content">会议内容 *</Label>
                    <Button 
                        type="button" 
                        variant={isRecording ? "destructive" : "outline"}
                        size="sm"
                        onClick={handleToggleRecording}
                        disabled={!isBrowserSupported || isLoading}
                    >
                        {isRecording ? (
                            <>
                                <MicOff className="mr-2 h-4 w-4" />
                                停止录音
                            </>
                        ) : (
                            <>
                                <Mic className="mr-2 h-4 w-4" />
                                开始录音
                            </>
                        )}
                    </Button>
                 </div>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="点击“开始录音”进行语音输入，或在此处手动输入内容..."
                  rows={12}
                  disabled={isLoading}
                />
              </div>

            </CardContent>
            
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    保存会议
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </ProtectedRoute>
  )
} 