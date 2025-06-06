"use client"

import { AppScreenshot1, AppScreenshot2 } from "@/components/app-screenshots"

export default function ScreenshotsPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">应用截图生成器</h1>
      <p className="mb-8 text-muted-foreground">
        这个页面用于生成应用截图，请在控制台查看生成的图片数据URL
      </p>
      
      <div className="mb-12 border p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">截图1：会议笔记应用</h2>
        <AppScreenshot1 />
      </div>
      
      <div className="mb-12 border p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">截图2：会议摘要</h2>
        <AppScreenshot2 />
      </div>
    </div>
  )
} 