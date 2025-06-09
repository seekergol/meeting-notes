import Stripe from 'stripe';
import BillingClient from './BillingClient';

// This ensures we have the Stripe secret key. The build will fail if it's not set.
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in the environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
});

async function getPriceData(productId: string) {
    try {
        const prices = await stripe.prices.list({
            product: productId,
            active: true,
            limit: 1, // Get the most recent active price
        });

        if (prices.data.length === 0) {
            console.error(`No active price found for product ID: ${productId}`);
            return null;
        }

        const price = prices.data[0];

        return {
            productId: productId,
            amount: price.unit_amount,
            currency: price.currency,
            interval: price.recurring?.interval ?? null,
            interval_count: price.recurring?.interval_count ?? null,
        };
    } catch (error) {
        console.error("Failed to fetch Stripe price data:", error);
        return null;
    }
}

export default async function BillingPage() {
    const productId = 'prod_SSG6THUCYStFxy';
    const priceData = await getPriceData(productId);

    return <BillingClient priceData={priceData} />;
} 