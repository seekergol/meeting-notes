"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, Info, FileText, Wand2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface SummaryGeneratorProps {
  transcriptionText: string
  onSummaryGenerated: (summary: string) => void
}

export default function SummaryGenerator({ transcriptionText, onSummaryGenerated }: SummaryGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<string>("")
  const [internalText, setInternalText] = useState(transcriptionText)
  const [apiProvider, setApiProvider] = useState<"openrouter" | "openai">("openrouter")

  useEffect(() => {
    setInternalText(transcriptionText)
  }, [transcriptionText])

  const generateSummary = async () => {
    if (!internalText || internalText.trim().length < 10) {
      setError("请提供至少10个字符的文本内容来生成摘要。")
      return
    }

    setIsGenerating(true)
    setError(null)
    setSummary("")

    try {
      const endpoint = apiProvider === "openai" ? "/api/generate-summary" : "/api/openrouter"
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: internalText }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API 请求失败，状态码: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.summary) {
          throw new Error("API 返回的数据中不包含摘要内容。")
      }
      
      setSummary(data.summary)
      onSummaryGenerated(data.summary)

    } catch (err: any) {
      console.error("生成摘要失败:", err)
      setError(err.message || "生成摘要时发生未知错误，请检查API Key或联系技术支持。")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="w-full border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-primary"/>
          会议摘要生成
        </CardTitle>
        <CardDescription>
          在这里编辑转录的文本，然后选择一个服务商来生成会议摘要。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>出错了</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>提示</AlertTitle>
          <AlertDescription>
            请确保您已在 <code>.env.local</code> 文件中正确配置了所选服务商的 API Key。
          </AlertDescription>
        </Alert>

        <div>
          <Label htmlFor="transcription-text" className="flex items-center gap-1 mb-2">
            <FileText className="h-4 w-4" />
            待处理文本
          </Label>
          <Textarea
            id="transcription-text"
            placeholder="转录的文本将在此显示..."
            value={internalText}
            onChange={(e) => setInternalText(e.target.value)}
            className="h-40"
          />
        </div>

        <div>
          <Label htmlFor="api-provider" className="mb-2 block">选择API服务商</Label>
          <Select value={apiProvider} onValueChange={(v) => setApiProvider(v as any)}>
            <SelectTrigger id="api-provider">
              <SelectValue placeholder="选择一个API服务" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openrouter">OpenRouter API (推荐)</SelectItem>
              <SelectItem value="openai">OpenAI API</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={generateSummary}
          disabled={isGenerating || !internalText}
          className="w-full"
        >
          {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isGenerating ? "正在生成..." : "生成摘要"}
        </Button>
      </CardFooter>
    </Card>
  )
} 