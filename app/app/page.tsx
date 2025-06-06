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
    <main className="container mx-auto py-6 px-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6 text-center">会议笔记三件套</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="record" className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            <span>录音/上传</span>
          </TabsTrigger>
          <TabsTrigger value="transcription" disabled={!transcription} className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>转写文本</span>
          </TabsTrigger>
          <TabsTrigger value="summary" disabled={!summary} className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>AI总结</span>
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span>归档查询</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="record">
          <Card className="border shadow-sm">
            <CardHeader className="bg-muted/30">
              <CardTitle>录制或上传会议音频</CardTitle>
              <CardDescription>支持录制或上传最长30分钟的音频</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6">
                <div className="grid gap-4">
                  <h3 className="text-lg font-medium">语音识别</h3>
                  <div className="flex flex-col items-center">
                    <SpeechRecognition onTranscript={handleTranscript} language="zh-CN" />
                    {transcriptionText && (
                      <div className="mt-4 p-3 bg-muted/30 rounded-md w-full">
                        <p className="text-sm italic">{transcriptionText}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">或</span>
                  </div>
                </div>

                <div className="grid gap-4">
                  <h3 className="text-lg font-medium">上传音频文件</h3>
                  <div className="grid w-full items-center gap-4">
                    <label htmlFor="audio-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md hover:bg-muted/50 transition-colors">
                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">点击上传音频文件 (最大30分钟)</p>
                      </div>
                      <Input
                        id="audio-upload"
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>

                {audioUrl && (
                  <div className="grid gap-2">
                    <h3 className="text-lg font-medium">预览音频</h3>
                    <audio src={audioUrl} controls className="w-full rounded-md" />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6 bg-muted/10">
              <Button className="bg-background border hover:bg-accent hover:text-accent-foreground" onClick={() => setActiveTab("archive")}>
                查看归档
              </Button>
              <Button onClick={transcribeAudio} disabled={!audioBlob || isTranscribing} className="gap-2">
                {isTranscribing ? "转写中..." : "开始转写"}
                {!isTranscribing && <FileText className="w-4 h-4" />}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="transcription">
          <Card className="border shadow-sm">
            <CardHeader className="bg-muted/30">
              <CardTitle>会议转写文本</CardTitle>
              <CardDescription>带有说话人标记的转写文本</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">{transcription && <TranscriptionViewer transcription={transcription} />}</CardContent>
            <CardFooter className="flex justify-between border-t p-6 bg-muted/10">
              <Button className="bg-background border hover:bg-accent hover:text-accent-foreground" onClick={() => setActiveTab("record")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
              <Button onClick={generateSummary} disabled={isGeneratingSummary} className="gap-2">
                {isGeneratingSummary ? "生成中..." : "生成AI总结"}
                {!isGeneratingSummary && <CheckCircle className="w-4 h-4" />}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <Card className="border shadow-sm">
            <CardHeader className="bg-muted/30">
              <CardTitle>会议总结</CardTitle>
              <CardDescription>AI生成的会议要点和行动项</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <label htmlFor="department" className="text-sm font-medium">
                    部门 <span className="text-red-500">*</span>
                  </label>
                  <DepartmentInput value={department} onChange={setDepartment} />
                </div>

                <SummaryGenerator 
                  transcriptionText={transcriptionText} 
                  onSummaryGenerated={handleSummaryGenerated} 
                />

                {summary && (
                  <div className="grid gap-3">
                    <label className="text-sm font-medium">AI生成的总结</label>
                    <div className="p-4 border rounded-md bg-muted/30">
                      <div className="prose prose-sm max-w-none">
                        {summary.split("\n").map((line, i) => (
                          <div key={i} className="mb-1">
                            {line.startsWith("###") ? (
                              <h3 className="text-base font-semibold mt-3 mb-2">{line.replace("###", "")}</h3>
                            ) : line.startsWith("##") ? (
                              <h2 className="text-lg font-bold mt-2 mb-3">{line.replace("##", "")}</h2>
                            ) : line.startsWith("- [ ]") ? (
                              <div className="flex items-start gap-2">
                                <input type="checkbox" className="mt-1" />
                                <span>{line.replace("- [ ]", "")}</span>
                              </div>
                            ) : line.startsWith("- ") ? (
                              <div className="flex items-start gap-2">
                                <span>•</span>
                                <span>{line.replace("- ", "")}</span>
                              </div>
                            ) : line.match(/^\d+\./) ? (
                              <div className="flex items-start gap-2">
                                <span>{line.match(/^\d+\./)?.[0]}</span>
                                <span>{line.replace(/^\d+\./, "")}</span>
                              </div>
                            ) : (
                              <p>{line}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6 bg-muted/10">
              <Button className="bg-background border hover:bg-accent hover:text-accent-foreground" onClick={() => setActiveTab("transcription")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
              <Button onClick={saveNote} disabled={isSaving || !department.trim() || !summary} className="gap-2">
                <Save className="w-4 h-4" />
                {isSaving ? "保存中..." : "保存并归档"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="archive">
          <Card className="border shadow-sm">
            <CardHeader className="bg-muted/30">
              <CardTitle>会议笔记归档</CardTitle>
              <CardDescription>搜索并查看已保存的会议笔记</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="搜索笔记或输入 部门:部门名 进行筛选"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button className="bg-background border hover:bg-accent hover:text-accent-foreground shrink-0" onClick={() => setSearchQuery("")}>
                    清除
                  </Button>
                </div>

                {filteredNotes.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    {searchQuery ? "没有找到匹配的笔记" : "暂无保存的会议笔记"}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredNotes.map((note) => (
                      <Card key={note.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <Badge className="mb-2">{note.department}</Badge>
                              <CardTitle className="text-base">
                                {note.summary.split("\n")[0].replace("##", "")}
                              </CardTitle>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(note.date).toLocaleDateString()}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {note.transcription.segments[0].text}
                          </p>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Button
                            className="text-primary underline-offset-4 hover:underline p-0 h-auto"
                            onClick={() => {
                              setTranscription(note.transcription)
                              setSummary(note.summary)
                              setDepartment(note.department)
                              setActiveTab("summary")
                            }}
                          >
                            查看详情
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t p-6 bg-muted/10">
              <Button className="bg-background border hover:bg-accent hover:text-accent-foreground w-full gap-2" onClick={() => setActiveTab("record")}>
                <ArrowLeft className="w-4 h-4" />
                返回录制页面
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
} 