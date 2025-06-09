import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
});

export async function POST(req: Request) {
  try {
    const authorization = headers().get('Authorization');
    if (!authorization) {
      return new NextResponse('认证失败', { status: 401 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authorization.replace('Bearer ', ''));

    if (userError || !user) {
      console.error('获取Supabase用户失败:', userError);
      return new NextResponse('用户未找到或认证失败', { status: 401 });
    }

    const { priceId } = await req.json(); // 我们将从前端接收一个价格ID
    if (!priceId) {
        return new NextResponse('缺少价格ID', { status: 400 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription', // 设置为订阅模式
      payment_method_types: ['card'],
      customer_email: user.email, // 预填用户邮箱
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL}/app?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/billing?payment=cancelled`,
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id });

  } catch (error: any) {
    console.error('Stripe支付会话创建失败:', error);
    return new NextResponse(`内部服务器错误: ${error.message}`, { status: 500 });
  }
} 