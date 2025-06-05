"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TranscriptionSegment {
  speaker: string
  text: string
  start: number
  end: number
}

interface TranscriptionProps {
  transcription: {
    segments: TranscriptionSegment[]
  }
}

export default function TranscriptionViewer({ transcription }: TranscriptionProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    const text = transcription.segments.map((segment) => `${segment.speaker}: ${segment.text}`).join("\n\n")

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      toast({
        title: "已复制",
        description: "转写文本已复制到剪贴板",
      })

      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">转写结果</h3>
        <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex items-center gap-1">
          <Copy className="h-3.5 w-3.5" />
          <span>{copied ? "已复制" : "复制文本"}</span>
        </Button>
      </div>

      <div className="space-y-6 max-h-[400px] overflow-y-auto p-1">
        {transcription.segments.map((segment, index) => (
          <div key={index} className="grid grid-cols-[80px_1fr] gap-4">
            <div className="text-sm font-medium text-muted-foreground">{segment.speaker}</div>
            <div className="text-sm">{segment.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
