"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Clock } from "lucide-react"

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void
  maxDurationSec?: number
}

export default function AudioRecorder({
  onRecordingComplete,
  maxDurationSec = 1800, // 30 minutes default
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        onRecordingComplete(audioBlob)

        // Stop all audio tracks
        stream.getAudioTracks().forEach((track) => track.stop())

        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }

        setIsRecording(false)
        setRecordingTime(0)
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1
          if (newTime >= maxDurationSec) {
            stopRecording()
            return prev
          }
          return newTime
        })
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-center gap-4">
        {isRecording ? (
          <>
            <Button variant="destructive" size="icon" onClick={stopRecording} className="h-16 w-16 rounded-full">
              <Square className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2 text-lg font-mono">
              <Clock className="h-5 w-5 text-red-500 animate-pulse" />
              <span>{formatTime(recordingTime)}</span>
            </div>
          </>
        ) : (
          <Button
            variant="outline"
            size="icon"
            onClick={startRecording}
            className="h-16 w-16 rounded-full border-2 hover:bg-red-50 hover:text-red-600 hover:border-red-600"
          >
            <Mic className="h-6 w-6" />
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{isRecording ? "点击停止按钮结束录音" : "点击麦克风按钮开始录音"}</p>
    </div>
  )
}
