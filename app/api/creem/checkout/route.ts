import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
const { Creem } = require('creem');

const creem = new Creem(process.env.CREEM_API_KEY!, {
  apiVersion: '2024-01-01',
});

export async function POST(req: NextRequest) {
    try {
        const { productId, discountCode } = await req.json();

        if (!productId) {
            return new NextResponse('Product ID is required', { status: 400 });
        }

        // 1. Get the current user from Supabase
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('User not authenticated', { status: 401 });
        }

        // 2. Dynamically retrieve the price for the product
        const prices = await creem.prices.list({ product: productId, active: true, limit: 1 });
        if (!prices.data || prices.data.length === 0) {
            return new NextResponse('No active price found for the given product ID', { status: 404 });
        }
        const price = prices.data[0];

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        // Prepare checkout session parameters
        let checkoutOptions: any = {
            payment_method_types: ['card', 'alipay', 'wechat_pay'],
            line_items: [
                {
                    price: price.id, // Use the retrieved price ID
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${baseUrl}/app/meetings?payment=success_creem`,
            cancel_url: `${baseUrl}/creem-billing?payment=cancelled`,
            metadata: {
                userId: user.id,
            },
        };

        // 3. Apply discount code if provided
        if (discountCode) {
            checkoutOptions.discounts = [{
                coupon: discountCode,
            }];
        }

        // 4. Create a Creem Checkout Session with the retrieved price and optional discount
        const session = await creem.checkout.sessions.create(checkoutOptions);

        if (session.url) {
            return NextResponse.json({ url: session.url });
        } else {
            return new NextResponse('Could not create Creem Checkout session', { status: 500 });
        }

    } catch (error: any) {
        console.error('Creem Checkout Error:', error.message);
        return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
    }
} 