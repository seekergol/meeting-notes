import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// 初始化OpenAI客户端，指向OpenRouter
const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
    "X-Title": "Meeting Notes App",
  }
});

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

export async function POST(request: NextRequest) {
  console.log("--- OpenRouter API Route Called ---");
  console.log("Server process sees OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY ? `Key Found (length: ${process.env.OPENROUTER_API_KEY.length})` : "UNDEFINED or EMPTY");
  
  try {
    // 1. 解析请求体，现在可以接收 text 和可选的 model
    const body = await request.json();
    const { text, model: modelFromRequest } = body;

    // 2. 决定使用的模型
    // 如果前端没有指定模型，则使用您选择的 gemma-4b-it 作为默认模型
    const modelToUse = modelFromRequest || "mistralai/mistral-7b-instruct:free";
    
    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: "请提供至少10个字符的文本内容来生成摘要。" },
        { status: 400 }
      );
    }
    
    // 检查API密钥是否存在 (现在是双重保证)
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("OpenRouter API Key 未配置。");
      return NextResponse.json(
        { error: "服务器端API密钥未配置，无法生成摘要。" },
        { status: 500 }
      );
    }
    
    // 调试：直接使用 fetch 来调用 API，绕过 openai 库
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
        'X-Title': "Meeting Notes App",
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          {
            role: "system",
            content: "你是一个专业的会议助理，擅长总结会议内容。请根据提供的文字记录，生成一份结构化的会议摘要。摘要应包括：1. 主要讨论点，2. 重要决策，3. 行动项目及负责人。请保持摘要简洁、专业，并突出关键信息。"
          },
          {
            role: "user",
            content: `请根据以下会议记录生成摘要（请用中文回答）：\n\n${text}`
          }
        ]
      })
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error("OpenRouter API 返回错误:", errorBody);
        throw new Error(errorBody.error?.message || `API 请求失败，状态码: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices[0]?.message?.content;

    if (!summary) {
        throw new Error("API返回的数据中不包含有效的摘要内容。");
    }

    // 4. 返回成功的结果
    return NextResponse.json({ summary });

  } catch (error: any) {
    // 5. 增强的错误处理
    console.error("调用OpenRouter API时出错:", error);
    
    return NextResponse.json(
      { error: `生成摘要失败: ${error.message || "未知错误"}` },
      { status: 500 }
    );
  }
} 