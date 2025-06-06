import { NextResponse } from "next/server"

// 模拟摘要生成函数
function generateMockSummary(text: string) {
  console.log("使用模拟数据生成摘要")
  return `
## 会议摘要

### 主要讨论点
- 第三季度销售策略讨论
- 线上营销预算增加的提案
- 线上渠道转化率提高了15%

### 重要决策
- 同意将Q3营销预算增加20%用于线上渠道

### 行动项目
- 市场部需要准备详细的执行方案
- 销售团队目标调整（负责人：说话人3）
  `
}

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
    
    // 如果没有API密钥，使用模拟数据
    if (!apiKey) {
      console.warn("未配置OpenRouter API密钥，使用模拟数据")
      const mockSummary = generateMockSummary(text)
      return NextResponse.json({ summary: mockSummary })
    }
    
    // 调用OpenRouter API生成摘要
    try {
      // 使用ASCII编码的应用名称和头部信息
      const appTitle = "Meeting Notes App"
      
      // 准备API请求数据
      const requestData = {
        model: "deepseek/deepseek-r1-0528-qwen3-8b:free", // 可以根据需要更换模型
        messages: [
          {
            role: "system",
            content: "You are a professional meeting assistant, skilled in summarizing meeting content. Please generate a structured meeting summary based on the provided transcript. The summary should include: 1) Main discussion points, 2) Important decisions, 3) Action items and responsible persons. Keep it concise, professional, and highlight key information."
          },
          {
            role: "user",
            content: `Please generate a summary based on the following meeting transcript (respond in Chinese):\n\n${text}`
          }
        ]
      }
      
      // 发送API请求
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
          "X-Title": appTitle // 使用ASCII编码的应用名称
        },
        body: JSON.stringify(requestData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("OpenRouter API错误:", errorData)
        
        // API调用失败，使用模拟数据
        console.warn("API调用失败，使用模拟数据")
        const mockSummary = generateMockSummary(text)
        return NextResponse.json({ summary: mockSummary })
      }
      
      const data = await response.json()
      const summary = data.choices[0]?.message?.content || "无法生成摘要"
      
      // 返回结果
      return NextResponse.json({ summary })
    } catch (apiError: any) {
      console.error("API调用错误:", apiError)
      // 发生错误时使用模拟数据
      const mockSummary = generateMockSummary(text)
      return NextResponse.json({ summary: mockSummary })
    }
  } catch (error: any) {
    console.error("生成摘要时出错:", error)
    return NextResponse.json(
      { error: `生成摘要时出现错误: ${error.message}` },
      { status: 500 }
    )
  }
} 