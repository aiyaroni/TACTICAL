import { NextResponse } from 'next/server';
import { analyzeDualVectorEscalation } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function GET() {
    const analysis = await analyzeDualVectorEscalation();
    return NextResponse.json(analysis);
}
