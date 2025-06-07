import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// 初始化一个专门用于OpenRouter的客户端
const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: NextRequest) {
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: 'OPENROUTER_API_KEY is not configured in .env.local' }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 调用OpenRouter的音频转写接口
    // 我们使用 whisper-1 模型，性价比高，效果好
    const transcription = await openrouter.audio.transcriptions.create({
      model: 'openai/whisper-1', 
      file: file,
    });

    // 返回转写后的文本
    return NextResponse.json({ transcript: transcription.text });

  } catch (error: any) {
    console.error('Error during transcription:', error);
    const errorMessage = error.response ? JSON.stringify(await error.response.json()) : error.message;
    return NextResponse.json({ error: `Transcription failed: ${errorMessage}` }, { status: 500 });
  }
} 