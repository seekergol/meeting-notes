"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Info } from "lucide-react"

export default function ApiTestPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [testText] = useState<string>(`说话人 1: 大家好，今天我们讨论第三季度的销售策略。
说话人 2: 我认为我们应该增加线上营销的预算。
说话人 1: 同意，数据显示线上渠道的转化率提高了15%。
说话人 3: 我们需要确定具体的执行计划和时间表。
说话人 2: 建议将Q3营销预算增加20%用于线上渠道。
说话人 1: 好的，那么市场部需要准备详细的执行方案。
说话人 3: 我会负责跟进销售团队的目标调整。`)
  
  const testOpenRouterApi = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)
    
    try {
      const response = await fetch("/api/openrouter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: testText }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API调用失败 (${response.status})`)
      }
      
      const data = await response.json()
      setResult(data.summary)
    } catch (err: any) {
      console.error("API测试失败:", err)
      setError(err.message || "API测试失败，请检查控制台获取详细信息")
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">API测试</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>OpenRouter API测试</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              此测试将调用OpenRouter API生成会议摘要。如果API密钥已正确配置，将返回实际生成的摘要；
              否则将返回模拟数据。
            </AlertDescription>
          </Alert>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">测试文本:</p>
              <Textarea 
                value={testText}
                readOnly
                className="h-32"
              />
            </div>
            
            <Button 
              onClick={testOpenRouterApi}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  测试中...
                </>
              ) : "测试OpenRouter API"}
            </Button>
            
            {result && (
              <div>
                <p className="font-medium mb-2">API返回结果:</p>
                <div className="p-4 bg-muted/30 rounded-md whitespace-pre-line">
                  {result}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 