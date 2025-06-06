import { NextResponse } from "next/server"
import OpenAI from "openai"

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    // 解析请求体
    const body = await request.json()
    const { text } = body
    
    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: "请提供足够的文本内容来生成摘要" },
        { status: 400 }
      )
    }
    
    // 调用OpenAI API生成摘要
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "你是一个专业的会议记录助手，擅长总结会议内容。请根据提供的会议转录文本，生成一个结构化的会议摘要。摘要应包括：1) 主要讨论点，2) 重要决策，3) 行动项目和负责人。保持简洁、专业，并突出关键信息。"
        },
        {
          role: "user",
          content: `请根据以下会议转录内容生成摘要：\n\n${text}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })
    
    // 提取生成的摘要
    const summary = response.choices[0]?.message?.content || "无法生成摘要"
    
    // 返回结果
    return NextResponse.json({ summary })
  } catch (error: any) {
    console.error("生成摘要时出错:", error)
    return NextResponse.json(
      { error: "生成摘要时出现错误" },
      { status: 500 }
    )
  }
} 