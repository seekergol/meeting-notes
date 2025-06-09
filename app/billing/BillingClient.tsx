"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

// Helper function to format price and interval
function formatPrice(priceData: { amount: number | null; currency: string; interval: string | null; interval_count: number | null; }) {
    if (priceData.amount === null) {
        return "Price not available";
    }
    const amount = (priceData.amount / 100).toFixed(2);
    const currency = priceData.currency.toUpperCase();
    const interval_count = priceData.interval_count;
    
    let intervalString;
    switch(priceData.interval) {
        case 'month':
            intervalString = interval_count === 1 ? '月' : `${interval_count} 个月`;
            break;
        case 'year':
            intervalString = interval_count === 1 ? '年' : `${interval_count} 年`;
            break;
        case 'week':
            intervalString = interval_count === 1 ? '周' : `${interval_count} 周`;
            break;
        case 'day':
            intervalString = interval_count === 1 ? '天' : `${interval_count} 天`;
            break;
        default:
            intervalString = '';
    }

    return `${currency} $${amount} / ${intervalString}`;
}

interface BillingClientProps {
    priceData: {
        productId: string;
        amount: number | null;
        currency: string;
        interval: string | null;
        interval_count: number | null;
    } | null;
}

export default function BillingClient({ priceData }: BillingClientProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { user } = useAuth();

    const handleSubscribe = async () => {
        if (!user) {
            alert('请在订阅前登录。');
            return;
        }
        if (!priceData) {
            alert('价格信息加载失败，请刷新重试。');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: priceData.productId }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`创建支付会话失败: ${error}`);
            }

            const { url } = await response.json();
            if (url) {
                router.push(url);
            } else {
                throw new Error('无法获取支付链接。');
            }

        } catch (error) {
            console.error(error);
            alert((error as Error).message);
            setIsLoading(false);
        }
    };

    if (!priceData) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
                <Card className="max-w-md w-full text-center">
                    <CardHeader>
                        <CardTitle>错误</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>无法加载产品价格信息。请检查您的 Stripe 配置或稍后重试。</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="max-w-md w-full text-center">
                <h1 className="text-4xl font-bold mb-4">完成最后一步</h1>
                
                <Card className="bg-green-100 border-green-200 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center text-2xl">
                            <Zap className="w-6 h-6 mr-2 text-yellow-500" />
                            订阅 Pro 计划
                        </CardTitle>
                        <CardDescription>
                            解锁所有高级功能，开始您的高效会议体验。
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-3xl font-bold my-4">
                            {formatPrice(priceData)}
                        </p>
                        <Button
                            size="lg"
                            className="w-full bg-green-500 hover:bg-green-600 text-white"
                            onClick={handleSubscribe}
                            disabled={isLoading || !user}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    处理中...
                                </>
                            ) : !user ? (
                                "请先登录"
                            ) : (
                                "立即订阅"
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 