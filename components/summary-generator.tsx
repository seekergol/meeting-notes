"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
  const [apiProvider, setApiProvider] = useState<"openai" | "openrouter">("openrouter")
  
  const generateSummary = async () => {
    if (!transcriptionText || transcriptionText.trim().length < 10) {
      setError("请提供足够的文本内容来生成摘要")
      return
    }
    
    setIsGenerating(true)
    setError(null)
    
    try {
      // 根据选择的API提供商发送请求到不同的后端API
      const endpoint = apiProvider === "openai" ? "/api/generate-summary" : "/api/openrouter"
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: transcriptionText }),
      })
      
      if (!response.ok) {
        throw new Error(`生成摘要时出现错误 (${response.status})`)
      }
      
      const data = await response.json()
      setSummary(data.summary)
      onSummaryGenerated(data.summary)
    } catch (err) {
      console.error("生成摘要失败:", err)
      setError("生成摘要时出现错误，请稍后重试")
    } finally {
      setIsGenerating(false)
    }
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>会议摘要生成</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="mb-4">
          <Textarea 
            placeholder="转录的文本将在此显示..."
            value={transcriptionText}
            readOnly
            className="h-32 mb-4"
          />
        </div>
        
        <div className="mb-4">
          <Label htmlFor="api-provider" className="mb-2 block">选择API提供商</Label>
          <Select
            value={apiProvider}
            onValueChange={(value) => setApiProvider(value as "openai" | "openrouter")}
          >
            <SelectTrigger id="api-provider">
              <SelectValue placeholder="选择API提供商" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI API</SelectItem>
              <SelectItem value="openrouter">OpenRouter API</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">
            {apiProvider === "openrouter" ? 
              "使用OpenRouter API (支持多种模型)" : 
              "使用OpenAI API (GPT-3.5-Turbo)"}
          </p>
        </div>
        
        {summary && (
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">生成的摘要</h3>
            <div className="p-3 bg-muted/30 rounded-md">
              <p className="whitespace-pre-line">{summary}</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={generateSummary} 
          disabled={isGenerating || !transcriptionText}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              正在生成摘要...
            </>
          ) : "生成会议摘要"}
        </Button>
      </CardFooter>
    </Card>
  )
} 