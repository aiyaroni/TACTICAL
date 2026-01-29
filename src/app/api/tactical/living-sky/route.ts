import { NextResponse } from 'next/server';
import { fetchTacticalData } from '@/lib/opensky';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const states = await fetchTacticalData();
        return NextResponse.json({ states });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ states: [] }, { status: 500 });
    }
}
