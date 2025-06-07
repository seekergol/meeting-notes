'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';

export default function BillingPage() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();

  const handleUpgradeClick = async () => {
    // setIsRedirecting(true);
    // toast({ title: '正在准备支付页面...', description: '请稍候，我们将跳转到Creem。' });

    // try {
    //   if (!auth || !auth.session) {
    //     throw new Error('用户认证信息加载中或无效，请稍后再试。');
    //   }

    //   const response = await fetch('/api/create-checkout', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${auth.session.access_token}`,
    //     },
    //   });

    //   if (!response.ok) {
    //     const errorBody = await response.json();
    //     throw new Error(errorBody.error || '创建支付会话失败');
    //   }

    //   const { redirectUrl } = await response.json();
      
    //   if (redirectUrl) {
    //     window.location.href = redirectUrl;
    //   } else {
    //     throw new Error('未能获取到支付跳转链接。');
    //   }

    // } catch (error: any) {
    //   console.error('支付跳转失败:', error);
    //   toast({
    //     variant: 'destructive',
    //     title: '出错了',
    //     description: '无法准备支付页面，请稍后再试。',
    //   });
    //   setIsRedirecting(false);
    // }
    toast({
        title: '功能开发中',
        description: '支付功能将很快上线，敬请期待！',
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">完成最后一步</h1>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              订阅 Pro 计划
            </CardTitle>
            <CardDescription className="text-center">
              解锁所有高级功能，开始您的高效会议体验。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-center text-lg font-semibold">仅需 $4.50/月</p>
            <Button onClick={handleUpgradeClick} disabled={!auth?.session} className="w-full">
              {!auth?.session ? (
                '等待认证...'
              ) : (
                '立即订阅'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 