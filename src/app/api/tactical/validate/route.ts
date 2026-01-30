import { NextResponse } from 'next/server';
import { validateIntel } from '@/lib/gemini';

export async function POST(req: Request) {
    try {
        const { input } = await req.json();
        if (!input) return NextResponse.json({ status: "UNCONFIRMED", summary: "EMPTY INPUT" });

        const validation = await validateIntel(input);
        return NextResponse.json(validation);
    } catch (e) {
        return NextResponse.json({ status: "UNCONFIRMED", summary: "SYSTEM ERROR" }, { status: 500 });
    }
}
