"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, Upload, Save, Search, Clock, FileText, CheckCircle, ArrowLeft } from "lucide-react"
import SpeechRecognition from "@/components/speech-recognition"
import TranscriptionViewer from "@/components/transcription-viewer"
import DepartmentInput from "@/components/department-input"
import { useToast } from "@/hooks/use-toast"
import SummaryGenerator from "@/components/summary-generator"
import UserProfile from "@/components/auth/user-profile"
import { useAuth } from "@/contexts/auth-context"

// 定义转写结果的类型
interface TranscriptionSegment {
  speaker: string
  text: string
  start: number
  end: number
}

interface TranscriptionResult {
  segments: TranscriptionSegment[]
}

// 定义保存的笔记类型
interface SavedNote {
  id: number
  department: string
  transcription: TranscriptionResult
  summary: string
  date: string
}

export default function AppPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("record")
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null)
  const [summary, setSummary] = useState("")
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [department, setDepartment] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [transcriptionText, setTranscriptionText] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    // Load saved notes from localStorage
    const notes = localStorage.getItem("meetingNotes")
    if (notes) {
      setSavedNotes(JSON.parse(notes))
    }
  }, [])

  const handleAudioRecorded = (blob: Blob) => {
    setAudioBlob(blob)
    setAudioUrl(URL.createObjectURL(blob))
    toast({
      title: "录音完成",
      description: "音频已准备好，可以开始转写",
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check if file is audio and less than 30 minutes (approx 30MB)
      if (!file.type.startsWith("audio/")) {
        toast({
          title: "文件类型错误",
          description: "请上传音频文件",
          variant: "destructive",
        })
        return
      }

      if (file.size > 30 * 1024 * 1024) {
        toast({
          title: "文件过大",
          description: "请上传小于30分钟的音频",
          variant: "destructive",
        })
        return
      }

      setAudioBlob(file)
      setAudioUrl(URL.createObjectURL(file))
      toast({
        title: "文件已上传",
        description: "音频已准备好，可以开始转写",
      })
    }
  }

  const handleTranscript = (text: string) => {
    // 将识别的文本添加到转写结果中
    if (text.trim()) {
      // 创建一个模拟的转写结果
      const newSegment = {
        speaker: "说话人 1",
        text: text,
        start: Date.now() / 1000, // 当前时间（秒）
        end: Date.now() / 1000 + 5, // 估计的结束时间
      }
      
      // 如果已有转写结果，则添加到现有结果中
      if (transcription) {
        const updatedTranscription = {
          segments: [...transcription.segments, newSegment]
        }
        setTranscription(updatedTranscription)
      } else {
        // 否则创建新的转写结果
        const newTranscription = {
          segments: [newSegment]
        }
        setTranscription(newTranscription)
        setActiveTab("transcription") // 自动切换到转写标签
      }
      
      // 保存识别的文本，用于显示
      setTranscriptionText(prev => prev + " " + text)
      
      toast({
        title: "实时转写",
        description: "已添加新的转写内容",
      })
    }
  }

  const transcribeAudio = async () => {
    if (!audioBlob) return

    setIsTranscribing(true)

    try {
      // In a real app, we would send the audio to a server for transcription
      // For demo purposes, we'll simulate a transcription after a delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock transcription result with speaker diarization
      const mockTranscription: TranscriptionResult = {
        segments: [
          { speaker: "说话人 1", text: "大家好，今天我们讨论第三季度的销售策略。", start: 0, end: 5 },
          { speaker: "说话人 2", text: "我认为我们应该增加线上营销的预算。", start: 6, end: 10 },
          { speaker: "说话人 1", text: "同意，数据显示线上渠道的转化率提高了15%。", start: 11, end: 16 },
          { speaker: "说话人 3", text: "我们需要确定具体的执行计划和时间表。", start: 17, end: 22 },
        ],
      }

      setTranscription(mockTranscription)
      setActiveTab("transcription")

      toast({
        title: "转写完成",
        description: "音频已成功转写为文本",
      })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      // 忽略错误详情，只显示通用错误消息
      toast({
        title: "转写失败",
        description: "请重试或上传其他音频",
        variant: "destructive",
      })
    } finally {
      setIsTranscribing(false)
    }
  }

  const generateSummary = async () => {
    if (!transcription) return
    
    setIsGeneratingSummary(true)
    
    try {
      // 从转录内容中提取纯文本
      const transcriptionText = transcription.segments
        .map(segment => `${segment.speaker}: ${segment.text}`)
        .join("\n")
      
      // 设置转录文本，SummaryGenerator组件将处理摘要生成
      setTranscriptionText(transcriptionText)
      setActiveTab("summary")
    } catch (err) {
      console.error("准备摘要生成失败:", err)
      toast({
        title: "摘要生成失败",
        description: "请重试",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  const handleSummaryGenerated = (generatedSummary: string) => {
    setSummary(generatedSummary)
    if (generatedSummary) {
      toast({
        title: "摘要生成成功",
        description: "已使用OpenRouter API生成会议摘要",
      })
    }
  }

  const saveNote = () => {
    if (!transcription || !summary) return

    if (!department.trim()) {
      toast({
        title: "请输入部门",
        description: "部门信息不能为空",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const newNote: SavedNote = {
        id: Date.now(),
        department,
        transcription,
        summary,
        date: new Date().toISOString(),
      }

      const updatedNotes = [...savedNotes, newNote]
      setSavedNotes(updatedNotes)

      // Save to localStorage
      localStorage.setItem("meetingNotes", JSON.stringify(updatedNotes))

      // Save department to history
      const departments = JSON.parse(localStorage.getItem("departments") || "[]")
      if (!departments.includes(department)) {
        localStorage.setItem("departments", JSON.stringify([...departments, department]))
      }

      toast({
        title: "保存成功",
        description: "会议笔记已归档",
      })

      // Reset form
      setAudioBlob(null)
      setAudioUrl(null)
      setTranscription(null)
      setSummary("")
      setDepartment("")
      setActiveTab("record")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      // 忽略错误详情，只显示通用错误消息
      toast({
        title: "保存失败",
        description: "请重试",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const filteredNotes = savedNotes.filter((note) => {
    if (!searchQuery) return true

    // Check if search is for department tag
    if (searchQuery.startsWith("部门:")) {
      const deptQuery = searchQuery.substring(3).trim().toLowerCase()
      return note.department.toLowerCase().includes(deptQuery)
    }

    // Regular search
    return (
      note.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(note.transcription).toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.summary.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <header className="border-b">
        <div className="container mx-auto py-4 flex items-center justify-between">
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
            <span className="font-bold text-xl">会议笔记</span>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-sm text-muted-foreground">
                欢迎回来，{user.phone ? `${user.phone.slice(-4)}用户` : '用户'}
              </div>
            )}
            <UserProfile />
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="container mx-auto py-8 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="record" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                <span>录制</span>
              </TabsTrigger>
              <TabsTrigger value="transcription" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>转写</span>
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>摘要</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>历史</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* 录制标签页 */}
          <TabsContent value="record" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>录制会议</CardTitle>
                <CardDescription>录制会议音频或上传已有音频文件</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                {/* 录音组件 */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">录制音频</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center py-6">
                      <SpeechRecognition 
                        onTranscript={handleTranscript}
                        language="zh-CN"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">上传音频</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-6 gap-4">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <Input
                        id="audio-upload"
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <label htmlFor="audio-upload">
                        <Button variant="outline" className="cursor-pointer" asChild>
                          <span>选择音频文件</span>
                        </Button>
                      </label>
                      <p className="text-sm text-muted-foreground">支持MP3, WAV, M4A等格式</p>
                    </CardContent>
                  </Card>
                </div>

                {/* 音频预览 */}
                {audioUrl && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">音频预览</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      <audio src={audioUrl} controls className="w-full max-w-md" />
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={transcribeAudio}
                        disabled={isTranscribing}
                        className="w-full"
                      >
                        {isTranscribing ? "转写中..." : "开始转写"}
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 转写标签页 */}
          <TabsContent value="transcription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>转写结果</CardTitle>
                <CardDescription>会议转写文本</CardDescription>
              </CardHeader>
              <CardContent>
                {transcription ? (
                  <TranscriptionViewer transcription={transcription} />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">暂无转写内容</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("record")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回录制
                </Button>
                <Button
                  onClick={generateSummary}
                  disabled={!transcription || isGeneratingSummary}
                >
                  {isGeneratingSummary ? "生成中..." : "生成摘要"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* 摘要标签页 */}
          <TabsContent value="summary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>会议摘要</CardTitle>
                <CardDescription>AI生成的会议摘要</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SummaryGenerator 
                  transcriptionText={transcriptionText}
                  onSummaryGenerated={handleSummaryGenerated}
                />
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <div className="w-full">
                  <DepartmentInput
                    value={department}
                    onChange={setDepartment}
                  />
                </div>
                <div className="flex justify-between w-full">
                  <Button variant="outline" onClick={() => setActiveTab("transcription")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    返回转写
                  </Button>
                  <Button
                    onClick={saveNote}
                    disabled={!transcription || !summary || !department || isSaving}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? "保存中..." : "保存笔记"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* 历史标签页 */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>历史记录</CardTitle>
                <CardDescription>已保存的会议笔记</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="搜索会议记录..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                {savedNotes.length > 0 ? (
                  <div className="space-y-4">
                    {savedNotes
                      .filter(
                        (note) =>
                          note.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.summary.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((note) => (
                        <Card key={note.id}>
                          <CardHeader className="py-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{note.department}</CardTitle>
                                <CardDescription>
                                  {new Date(note.date).toLocaleString()}
                                </CardDescription>
                              </div>
                              <Badge>{note.transcription.segments.length} 段对话</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="py-2">
                            <p className="line-clamp-3 text-sm text-muted-foreground">
                              {note.summary.split("\n")[0]}
                            </p>
                          </CardContent>
                          <CardFooter className="py-3">
                            <Button variant="outline" size="sm" className="w-full">
                              查看详情
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">暂无保存的会议记录</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
} 