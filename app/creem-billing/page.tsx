import CreemBillingClient from './CreemBillingClient';
const { Creem } = require('creem');

// This ensures we have the Creem API key. The build will fail if it's not set.
if (!process.env.CREEM_API_KEY) {
    throw new Error('CREEM_API_KEY is not set in the environment variables');
}

const creem = new Creem(process.env.CREEM_API_KEY, {
    apiVersion: '2024-01-01',
});

async function getPriceData(productId: string) {
    try {
        const prices = await creem.prices.list({
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
        console.error("Failed to fetch Creem price data:", error);
        return null;
    }
}

export default async function CreemBillingPage() {
    // This is your Creem Production Product ID
    const productId = 'prod_1IevTlgDM9M0X712QbQ2CT';
    const priceData = await getPriceData(productId);

    return <CreemBillingClient priceData={priceData} />;
} 