import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase/admin'; // 我们需要使用管理员权限的 aupabase 客户端

const { Creem } = require('creem');

const creem = new Creem(process.env.CREEM_API_KEY!, {
  apiVersion: '2024-01-01',
  typescript: true,
});

const webhookSecret = process.env.CREEM_WEB_HOOK_SECRET!;

type CreemEvent = InstanceType<typeof Creem.Event>;
type CreemCheckoutSession = InstanceType<typeof Creem.Checkout.Session>;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get('Creem-Signature') as string;

  let event: CreemEvent;

  try {
    event = creem.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 只处理支付会话完成事件
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as CreemCheckoutSession;
    const userId = session?.metadata?.userId;

    if (!userId) {
      console.error('Webhook received but no userId in metadata');
      return new NextResponse('Webhook Error: Missing user ID in session metadata', { status: 400 });
    }

    try {
      // 更新用户在 profiles 表中的付费状态
      const { error } = await supabase
        .from('profiles')
        .update({ has_paid_subscription: true })
        .eq('id', userId);

      if (error) {
        console.error(`Failed to update subscription status for user ${userId}:`, error);
        return new NextResponse(`Database Error: ${error.message}`, { status: 500 });
      }

      console.log(`Successfully updated subscription for user ${userId}`);
    } catch (dbError: any) {
      console.error(`Database operation failed:`, dbError);
      return new NextResponse(`Database Error: ${dbError.message}`, { status: 500 });
    }
  }

  return new NextResponse(null, { status: 200 });
} 