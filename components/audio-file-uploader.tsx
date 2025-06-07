"use client"

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from './ui/alert';

interface AudioFileUploaderProps {
  onTranscript: (text: string) => void;
}

export default function AudioFileUploader({ onTranscript }: AudioFileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) { // 25MB 大小限制
        setError('文件大小不能超过 25MB。');
        return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/openrouter/transcribe', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '转写失败，请检查API Key和服务器日志。');
      }

      onTranscript(result.transcript);
      toast({
        title: '上传成功',
        description: '音频文件已成功转写。',
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsUploading(false);
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*"
        style={{ display: 'none' }}
        disabled={isUploading}
      />
      <Button
        onClick={handleButtonClick}
        disabled={isUploading}
        variant="outline"
        className="w-full"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Upload className="h-4 w-4 mr-2" />
        )}
        {isUploading ? '正在上传和转写...' : '上传音频文件'}
      </Button>
      {error && (
        <Alert variant="destructive" className="mt-2 w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 