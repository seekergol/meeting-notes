"use client"

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, AlertCircle, Play, Pause } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Progress } from './ui/progress';

interface FreeAudioTranscriberProps {
  onTranscript: (text: string) => void;
  onIsTranscribingChange: (isTranscribing: boolean) => void;
}

export default function FreeAudioTranscriber({ onTranscript, onIsTranscribingChange }: FreeAudioTranscriberProps) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const transcriptRef = useRef<string>(""); // Use a ref to store transcript to avoid stale state in callbacks

  const { toast } = useToast();

  const stopTranscription = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // Prevent onend from re-triggering
      recognitionRef.current.stop();
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsTranscribing(false);
    onIsTranscribingChange(false);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const startTranscription = (file: File) => {
    setError(null);
    transcriptRef.current = "";
    onTranscript('');
    const audioURL = URL.createObjectURL(file);
    if (audioRef.current) {
        audioRef.current.src = audioURL;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("您的浏览器不支持语音识别功能，请使用最新版Chrome或Edge。");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN'; // 确保是中文
    recognition.continuous = true;
    recognition.interimResults = true;

    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = transcriptRef.current;
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      transcriptRef.current = finalTranscript;
      onTranscript(finalTranscript + interimTranscript);
    };
    
    recognition.onerror = (event: any) => {
        if(event.error !== 'no-speech' && event.error !== 'aborted') {
            setError(`语音识别错误: ${event.error}`);
            stopTranscription();
        }
    };

    // 1. 核心修复：增加韧性，在识别意外中断时自动重启
    recognition.onend = () => {
        // Only stop everything if the audio has truly finished playing.
        if (audioRef.current && audioRef.current.ended) {
            stopTranscription();
        } else {
            // Otherwise, the recognition service ended prematurely. Restart it.
            // But only if we are still supposed to be transcribing.
            if (isTranscribing) {
                try {
                    recognition.start();
                } catch (e) {
                    // It might fail if the user navigates away, etc.
                    stopTranscription();
                }
            }
        }
    };

    recognition.onstart = () => {
        if (audioRef.current && audioRef.current.paused) {
            audioRef.current.play().catch(e => {
                setError("无法自动播放音频文件。");
                stopTranscription();
            });
        }
    };
    
    try {
        setIsTranscribing(true);
        onIsTranscribingChange(true);
        recognition.start();
    } catch(e) {
        setError("无法启动语音识别服务。");
        setIsTranscribing(false);
        onIsTranscribingChange(false);
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
        setError('不支持的文件类型。请上传一个有效的音频文件。');
        return;
    }
    setFileName(file.name);
    startTranscription(file);
  };

  const handleButtonClick = () => {
    if (isTranscribing) {
        stopTranscription();
    } else {
        fileInputRef.current?.click();
    }
  };
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => {
      if (audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    audio.addEventListener('timeupdate', onTimeUpdate);
    return () => audio.removeEventListener('timeupdate', onTimeUpdate);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <audio ref={audioRef} style={{ display: 'none' }} />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*"
        style={{ display: 'none' }}
      />
      <Button
        onClick={handleButtonClick}
        variant="outline"
        className="w-full"
      >
        {isTranscribing ? <Pause className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
        {isTranscribing ? '停止转写' : '选择本地音频文件'}
      </Button>

      {isTranscribing && (
        <div className="w-full text-center">
            <p className="text-sm text-muted-foreground truncate mb-1" title={fileName || ""}>正在转写: {fileName}</p>
            <Progress value={progress} className="w-full" />
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-2 w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>出错了</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 