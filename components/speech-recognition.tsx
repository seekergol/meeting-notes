"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// 添加Web Speech API的类型定义
interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
        confidence: number
      }
    }
    length: number
    isFinal?: boolean
  }
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message?: string
}

// 定义SpeechRecognition类型
interface SpeechRecognitionType extends EventTarget {
  continuous: boolean
  grammars: any
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onaudioend: ((this: SpeechRecognitionType, ev: Event) => any) | null
  onaudiostart: ((this: SpeechRecognitionType, ev: Event) => any) | null
  onend: ((this: SpeechRecognitionType, ev: Event) => any) | null
  onerror: ((this: SpeechRecognitionType, ev: SpeechRecognitionErrorEvent) => any) | null
  onnomatch: ((this: SpeechRecognitionType, ev: Event) => any) | null
  onresult: ((this: SpeechRecognitionType, ev: SpeechRecognitionEvent) => any) | null
  onsoundend: ((this: SpeechRecognitionType, ev: Event) => any) | null
  onsoundstart: ((this: SpeechRecognitionType, ev: Event) => any) | null
  onspeechend: ((this: SpeechRecognitionType, ev: Event) => any) | null
  onspeechstart: ((this: SpeechRecognitionType, ev: Event) => any) | null
  onstart: ((this: SpeechRecognitionType, ev: Event) => any) | null
  start(): void
  stop(): void
  abort(): void
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionType
  prototype: SpeechRecognitionType
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

interface SpeechRecognitionProps {
  onTranscript: (text: string) => void
  language?: string
  continuous?: boolean
  autoStart?: boolean
}

export default function SpeechRecognition({
  onTranscript,
  language = "zh-CN",
  continuous = true,
  autoStart = false,
}: SpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supported, setSupported] = useState(true)
  
  // 初始化语音识别API
  const initRecognition = useCallback(() => {
    if (typeof window === "undefined") return null
    
    // 检查浏览器支持
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      setError("您的浏览器不支持语音识别功能")
      return null
    }
    
    const recognition = new SpeechRecognition()
    recognition.lang = language
    recognition.continuous = continuous
    recognition.interimResults = true
    
    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }
    
    recognition.onend = () => {
      setIsListening(false)
      // 如果是continuous模式且没有手动停止，则自动重启
      if (continuous && isListening) {
        try {
          recognition.start()
        } catch (e) {
          // 忽略可能的错误
        }
      }
    }
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech") {
        // 没有检测到语音，这是常见的，不显示错误
        return
      }
      
      setError(
        event.error === "not-allowed" 
          ? "请允许访问麦克风" 
          : `语音识别错误: ${event.error}`
      )
      setIsListening(false)
    }
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = ""
      
      // 获取最新的识别结果
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      
      if (transcript.trim()) {
        onTranscript(transcript)
      }
    }
    
    return recognition
  }, [language, continuous, onTranscript, isListening])
  
  useEffect(() => {
    const recognition = initRecognition()
    
    // 如果设置了自动开始且支持语音识别，则自动开始
    if (autoStart && recognition && supported) {
      try {
        recognition.start()
      } catch (e) {
        console.error("自动启动语音识别失败", e)
      }
    }
    
    return () => {
      if (recognition) {
        try {
          recognition.stop()
        } catch (e) {
          // 忽略可能的错误
        }
      }
    }
  }, [autoStart, initRecognition, supported])
  
  const toggleListening = () => {
    const recognition = initRecognition()
    if (!recognition) return
    
    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      try {
        recognition.start()
      } catch (e) {
        setError("启动语音识别失败，请刷新页面重试")
      }
    }
  }
  
  if (!supported) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          您的浏览器不支持语音识别功能，请使用Chrome等现代浏览器
        </AlertDescription>
      </Alert>
    )
  }
  
  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={toggleListening}
        variant={isListening ? "destructive" : "default"}
        className={`rounded-full h-16 w-16 ${isListening ? "animate-pulse" : ""}`}
        aria-label={isListening ? "停止语音识别" : "开始语音识别"}
      >
        {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
      </Button>
      <p className="text-sm text-muted-foreground">
        {isListening ? "正在聆听..." : "点击开始语音识别"}
      </p>
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
} 