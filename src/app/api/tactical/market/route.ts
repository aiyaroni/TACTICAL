import { NextResponse } from 'next/server';
import { fetchConflictOdds } from '@/lib/polymarket';

export const dynamic = 'force-dynamic';

export async function GET() {
    const market = await fetchConflictOdds();

    // Fallback if API fails or no market
    const fallback = {
        question: "REGIONAL STABILITY (FALLBACK)",
        probability: 45, // Default tension
        volume: 0,
        url: "#"
    };

    return NextResponse.json(market || fallback);
}
