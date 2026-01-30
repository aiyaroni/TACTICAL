import { NextResponse } from 'next/server';
import { analyzePentagonActivity } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function GET() {
    const analysis = await analyzePentagonActivity();
    return NextResponse.json(analysis);
}
