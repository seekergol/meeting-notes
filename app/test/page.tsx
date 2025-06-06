"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import SpeechRecognition from "@/components/speech-recognition"
import SummaryGenerator from "@/components/summary-generator"
import { useToast } from "@/hooks/use-toast"

export default function TestPage() {
  const [transcriptionText, setTranscriptionText] = useState<string>("")
  const [testText, setTestText] = useState<string>(`说话人 1: 大家好，今天我们讨论第三季度的销售策略。
说话人 2: 我认为我们应该增加线上营销的预算。
说话人 1: 同意，数据显示线上渠道的转化率提高了15%。
说话人 3: 我们需要确定具体的执行计划和时间表。
说话人 2: 建议将Q3营销预算增加20%用于线上渠道。
说话人 1: 好的，那么市场部需要准备详细的执行方案。
说话人 3: 我会负责跟进销售团队的目标调整。`)
  const { toast } = useToast()

  const handleTranscript = (text: string) => {
    // 将识别的文本添加到转写结果中
    if (text.trim()) {
      setTranscriptionText(prev => prev + " " + text)
      
      toast({
        title: "实时转写",
        description: "已添加新的转写内容",
      })
    }
  }

  const handleSummaryGenerated = (summary: string) => {
    toast({
      title: "摘要生成成功",
      description: "已使用API生成会议摘要",
    })
  }

  const useTestText = () => {
    setTranscriptionText(testText)
    toast({
      title: "使用测试文本",
      description: "已加载预设的测试文本",
    })
  }

  const clearText = () => {
    setTranscriptionText("")
    toast({
      title: "清除文本",
      description: "已清除所有文本",
    })
  }

  return (
    <main className="container mx-auto py-6 px-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6 text-center">功能测试页面</h1>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>语音识别测试</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6">
              <SpeechRecognition onTranscript={handleTranscript} language="zh-CN" />
              
              <div className="w-full flex gap-2">
                <Button onClick={useTestText} variant="outline" className="flex-1">
                  使用测试文本
                </Button>
                <Button onClick={clearText} variant="outline" className="flex-1">
                  清除文本
                </Button>
              </div>
              
              <div className="w-full">
                <Textarea 
                  value={transcriptionText}
                  onChange={(e) => setTranscriptionText(e.target.value)}
                  placeholder="识别的文本将显示在这里..."
                  className="min-h-[150px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>文本总结测试</CardTitle>
          </CardHeader>
          <CardContent>
            <SummaryGenerator 
              transcriptionText={transcriptionText}
              onSummaryGenerated={handleSummaryGenerated}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  )
} 