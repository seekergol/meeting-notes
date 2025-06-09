'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { loadStripe } from '@stripe/stripe-js';

// TODO: 请将下面的ID替换为您在Stripe后台创建的测试价格ID
const stripeTestPriceId = 'price_...'; 

// 使用您的可发布密钥初始化Stripe.js
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function BillingPage() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();

  const handleUpgradeClick = async () => {
    setIsRedirecting(true);
    toast({ title: '正在准备支付页面...', description: '请稍候，我们将跳转到Stripe。' });

    if (!stripeTestPriceId || stripeTestPriceId === 'price_...') {
        toast({
            variant: 'destructive',
            title: '配置错误',
            description: '请在 app/billing/page.tsx 文件中设置Stripe测试价格ID。',
        });
        setIsRedirecting(false);
        return;
    }

    try {
      if (!auth || !auth.session) {
        throw new Error('用户认证信息加载中或无效，请稍后再试。');
      }

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.session.access_token}`,
        },
        body: JSON.stringify({ priceId: stripeTestPriceId }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.message || '创建支付会话失败');
      }

      const { sessionId } = await response.json();
      
      if (sessionId) {
        const stripe = await stripePromise;
        if (!stripe) {
            throw new Error('Stripe.js 加载失败。');
        }
        // 使用会话ID将用户重定向到Stripe支付页面
        await stripe.redirectToCheckout({ sessionId });
      } else {
        throw new Error('未能获取到支付会话ID。');
      }

    } catch (error: any) {
      console.error('支付跳转失败:', error);
      toast({
        variant: 'destructive',
        title: '出错了',
        description: error.message || '无法准备支付页面，请稍后再试。',
      });
      setIsRedirecting(false);
    }
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
            <Button onClick={handleUpgradeClick} disabled={isRedirecting || !auth?.session} className="w-full">
              {isRedirecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  正在准备支付网关...
                </>
              ) : !auth?.session ? (
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