import { NextResponse } from 'next/server';
import { fetchMilitaryNews } from '@/lib/news';

export const dynamic = 'force-dynamic';

export async function GET() {
    const articles = await fetchMilitaryNews();
    return NextResponse.json({ articles });
}
