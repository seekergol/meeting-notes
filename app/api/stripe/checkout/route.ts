import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
    // --- DIAGNOSTIC LOGS ---
    console.log("\n--- [DIAGNOSTIC] Stripe Checkout API Route Reached ---");
    const allCookies = req.cookies.getAll();
    console.log("[DIAGNOSTIC] Cookies received by API route:", allCookies);
    if (allCookies.length === 0) {
        console.log("[DIAGNOSTIC] No cookies received by API route.");
    } else {
        const supabaseCookie = allCookies.find(c => c.name.startsWith('sb-'));
        if (supabaseCookie) {
            console.log(`[DIAGNOSTIC] Found Supabase auth cookie: ${supabaseCookie.name}`);
        } else {
            console.log("[DIAGNOSTIC] Supabase auth cookie NOT FOUND.");
        }
    }
    console.log("--- [DIAGNOSTIC] End of Logs ---\n");
    // --- END DIAGNOSTIC LOGS ---


    let priceId: string | null = null;
    try {
        const { productId } = await req.json();

        if (!productId) {
            return new NextResponse('Product ID is required', { status: 400 });
        }
        
        // 1. Proactively find the Price ID from the Product ID
        const prices = await stripe.prices.list({
            product: productId,
            active: true,
            limit: 1,
        });

        if (prices.data.length === 0) {
            return new NextResponse('No active price found for the given product ID', { status: 404 });
        }
        priceId = prices.data[0].id;

        // 2. Get the current user from Supabase
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse('User not authenticated', { status: 401 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        
        // 3. Create a Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            customer_email: user.email, // Pre-fill the user's email
            client_reference_id: user.id, // Associate the checkout session with the user ID
            success_url: `${baseUrl}/app/meetings?payment=success`,
            cancel_url: `${baseUrl}/billing?payment=cancelled`,
        });

        if (session.url) {
            return NextResponse.json({ url: session.url });
        } else {
            return new NextResponse('Could not create Stripe Checkout session', { status: 500 });
        }

    } catch (error: any) {
        console.error('Stripe Checkout Error:', error.message);
        return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
    }
} 