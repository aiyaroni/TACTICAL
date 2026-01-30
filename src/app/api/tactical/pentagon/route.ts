import { NextResponse } from 'next/server';
import { getPizzaOccupancy } from '@/lib/pizza';

export const dynamic = 'force-dynamic';

export async function GET() {
    // Low-Cost Scraper Implementation (Cheerio)
    const data = await getPizzaOccupancy();
    return NextResponse.json(data);
}
