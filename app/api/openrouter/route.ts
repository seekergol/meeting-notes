import { NextResponse } from "next/server"

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
    
    // 获取API密钥
    const apiKey = process.env.OPENROUTER_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "未配置OpenRouter API密钥" },
        { status: 500 }
      )
    }
    
    // 调用OpenRouter API生成摘要
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_URL || "http://localhost:3000", // 你的网站URL
        "X-Title": "会议笔记应用" // 你的应用名称
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528-qwen3-8b:free", // 可以根据需要更换模型
        messages: [
          {
            role: "system",
            content: "你是一个专业的会议记录助手，擅长总结会议内容。请根据提供的会议转录文本，生成一个结构化的会议摘要。摘要应包括：1) 主要讨论点，2) 重要决策，3) 行动项目和负责人。保持简洁、专业，并突出关键信息。"
          },
          {
            role: "user",
            content: `请根据以下会议转录内容生成摘要：\n\n${text}`
          }
        ]
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error("OpenRouter API错误:", errorData)
      return NextResponse.json(
        { error: `调用OpenRouter API时出错: ${errorData.error?.message || '未知错误'}` },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    const summary = data.choices[0]?.message?.content || "无法生成摘要"
    
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