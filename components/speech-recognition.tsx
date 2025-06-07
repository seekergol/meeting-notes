"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// 添加Web Speech API的类型定义
interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

// 定义SpeechRecognition类型
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionStatic
    webkitSpeechRecognition?: SpeechRecognitionStatic
  }
}

interface SpeechRecognitionProps {
  onTranscript: (text: string) => void
  language?: string
  disabled?: boolean
}

export default function SpeechRecognitionComponent({
  onTranscript,
  language = "zh-CN",
  disabled = false,
}: SpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const transcriptRef = useRef<string>("")
  const userStoppedRef = useRef(false)

  const handleResult = useCallback((event: SpeechRecognitionEvent) => {
      let finalTranscript = ""
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript
      }
      transcriptRef.current = finalTranscript
      onTranscript(finalTranscript)
    }, [onTranscript])

  const handleError = useCallback((event: SpeechRecognitionErrorEvent) => {
    if (event.error === 'no-speech' || event.error === 'audio-capture') {
        // 忽略常见且无害的错误
        return;
    }
    setError(`语音识别错误: ${event.error}`)
    setIsListening(false)
  }, [])

  const handleEnd = useCallback(() => {
    if (!userStoppedRef.current && isListening) {
      try {
        recognitionRef.current?.start()
      } catch (e) {
        setError("语音识别意外中断后无法自动重启。")
        setIsListening(false)
      }
    } else {
      setIsListening(false)
    }
  }, [isListening])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        userStoppedRef.current = false
        transcriptRef.current = ""
        onTranscript("")
        recognitionRef.current.start()
        setIsListening(true)
        setError(null)
      } catch (e) {
        setError("启动语音识别失败，请检查麦克风权限。")
      }
    }
  }, [isListening, onTranscript])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      userStoppedRef.current = true
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [isListening])
  
  const toggleListening = isListening ? stopListening : startListening;

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsSupported(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = language
    recognition.continuous = true // 持续识别
    recognition.interimResults = true // 返回临时结果

    recognition.onresult = handleResult
    recognition.onerror = handleError
    recognition.onend = handleEnd
    
    recognitionRef.current = recognition

    return () => {
      recognition.stop()
    }
  }, [language, handleResult, handleError, handleEnd])


  if (!isSupported) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          您的浏览器不支持语音识别，请尝试使用最新版本的 Chrome 或 Edge 浏览器。
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={toggleListening}
        disabled={disabled}
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