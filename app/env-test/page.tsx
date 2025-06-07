"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, AlertCircle } from "lucide-react"

export default function EnvTestPage() {
  const [supabaseUrl, setSupabaseUrl] = useState<string | null>(null)
  const [supabaseKey, setSupabaseKey] = useState<string | null>(null)
  const [openrouterKey, setOpenrouterKey] = useState<string | null>(null)
  const [isConfigOk, setIsConfigOk] = useState<boolean>(false)
  
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    setSupabaseUrl(url || null)
    setSupabaseKey(key ? "已配置" : null)
    setOpenrouterKey(process.env.OPENROUTER_API_KEY ? "已配置" : null)
    
    if (url && key && url !== 'https://example.supabase.co' && key !== 'example-anon-key') {
      setIsConfigOk(true);
    } else {
      setIsConfigOk(false);
    }
  }, [])
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">环境变量测试</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>环境变量状态</CardTitle>
        </CardHeader>
        <CardContent>
          {!isConfigOk ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Supabase环境变量未正确配置。请检查您的 `.env.local` 文件。
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Supabase环境变量已配置。
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div>
              <p className="font-medium">Supabase URL:</p>
              <p className="text-sm text-muted-foreground">
                {supabaseUrl || "未配置"}
              </p>
            </div>
            
            <div>
              <p className="font-medium">Supabase Anon Key:</p>
              <p className="text-sm text-muted-foreground">
                {supabaseKey || "未配置"}
              </p>
            </div>
            
            <div>
              <p className="font-medium">OpenRouter API Key:</p>
              <p className="text-sm text-muted-foreground">
                {openrouterKey || "未配置"}
                <br />
                <span className="text-xs">
                  (注意: 这是服务器端环境变量，可能在客户端不可见)
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-sm text-muted-foreground">
        <p>
          如果环境变量显示为"未配置"，请确保您已经在.env.local文件中正确设置了它们。
          服务器端环境变量（如OPENROUTER_API_KEY）在客户端不可见，但可以通过API调用测试其功能。
        </p>
      </div>
    </div>
  )
} 