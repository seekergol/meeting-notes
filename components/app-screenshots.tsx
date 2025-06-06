"use client"

import { useEffect, useRef } from "react"
import html2canvas from "html2canvas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Mic, FileText, CheckCircle, Search } from "lucide-react"

export function AppScreenshot1() {
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (typeof window !== "undefined" && ref.current) {
      const captureScreenshot = async () => {
        try {
          const canvas = await html2canvas(ref.current!)
          const dataUrl = canvas.toDataURL("image/png")
          
          // 在实际应用中，你可能想要将这个数据URL保存到文件
          console.log("截图已生成:", dataUrl.substring(0, 100) + "...")
          
          // 这里可以添加代码将dataUrl保存为文件或显示在页面上
        } catch (error) {
          console.error("生成截图时出错:", error)
        }
      }
      
      // 延迟一下以确保组件完全渲染
      setTimeout(captureScreenshot, 1000)
    }
  }, [])
  
  return (
    <div ref={ref} className="w-full max-w-5xl mx-auto p-4 bg-background">
      <h1 className="text-3xl font-bold mb-6 text-center">会议笔记三件套</h1>
      
      <Tabs defaultValue="record" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="record" className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            <span>录音/上传</span>
          </TabsTrigger>
          <TabsTrigger value="transcription" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>转写文本</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
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
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex justify-center my-8">
                <Button size="lg" className="rounded-full h-24 w-24 flex items-center justify-center">
                  <Mic className="h-10 w-10" />
                </Button>
              </div>
              <div className="text-center text-muted-foreground">
                点击按钮开始录音，或上传音频文件
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function AppScreenshot2() {
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (typeof window !== "undefined" && ref.current) {
      const captureScreenshot = async () => {
        try {
          const canvas = await html2canvas(ref.current!)
          const dataUrl = canvas.toDataURL("image/png")
          console.log("截图已生成:", dataUrl.substring(0, 100) + "...")
        } catch (error) {
          console.error("生成截图时出错:", error)
        }
      }
      
      setTimeout(captureScreenshot, 1000)
    }
  }, [])
  
  return (
    <div ref={ref} className="w-full max-w-5xl mx-auto p-4 bg-background">
      <h1 className="text-3xl font-bold mb-6 text-center">AI会议摘要</h1>
      
      <Card className="border shadow-sm">
        <CardHeader className="bg-muted/30">
          <CardTitle>会议总结</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="p-4 border rounded-md bg-muted/30 mb-4">
            <h2 className="text-lg font-bold mb-3">第三季度销售策略会议摘要</h2>
            
            <h3 className="text-base font-semibold mt-3 mb-2">主要讨论点</h3>
            <div className="flex items-start gap-2 mb-1">
              <span>•</span>
              <span>线上营销预算增加的必要性</span>
            </div>
            <div className="flex items-start gap-2 mb-1">
              <span>•</span>
              <span>线上渠道转化率提高15%的数据分析</span>
            </div>
            
            <h3 className="text-base font-semibold mt-3 mb-2">决策事项</h3>
            <div className="flex items-start gap-2 mb-1">
              <span>•</span>
              <span>将Q3营销预算增加20%用于线上渠道</span>
            </div>
            
            <h3 className="text-base font-semibold mt-3 mb-2">行动项目</h3>
            <div className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" />
              <span>市场部制定详细的线上营销执行计划</span>
            </div>
            <div className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" />
              <span>销售团队准备Q3销售目标调整方案</span>
            </div>
          </div>
          
          <Button className="w-full">保存并归档</Button>
        </CardContent>
      </Card>
    </div>
  )
} 