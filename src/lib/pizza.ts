import * as cheerio from 'cheerio';

export interface PizzaData {
    usScore: number; // 0-100
    justification: string;
    isStale: boolean;
}

// User-Agent rotation to avoid simple scraping blocks
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1'
];

async function fetchBusyness(query: string): Promise<string> {
    try {
        const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
        const res = await fetch(`https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en`, {
            headers: {
                'User-Agent': ua,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            },
            next: { revalidate: 1200 } // 20 min cache
        });

        if (!res.ok) return 'UNKNOWN';
        const html = await res.text();
        const $ = cheerio.load(html);

        // This is a "Best Effort" attempt to find snippets related to "Live" or "Busy"
        // Google often hides this in complex JS, but occasionally it leaks in snippets or meta.
        // We look for specific keywords in the text content.
        const bodyText = $('body').text().toLowerCase();

        if (bodyText.includes('very busy') || bodyText.includes('peak times')) return 'BUSY';
        if (bodyText.includes('a little busy') || bodyText.includes('usually busy')) return 'MODERATE';
        if (bodyText.includes('not busy') || bodyText.includes('usually not busy')) return 'QUIET';
        if (bodyText.includes('closed') || bodyText.includes('opens soon')) return 'CLOSED';

        return 'UNKNOWN';
    } catch (e) {
        console.error('Scraping failed:', e);
        return 'UNKNOWN';
    }
}

export async function getPizzaOccupancy(): Promise<PizzaData> {
    // 1. Domino's Arlington
    const dominos = await fetchBusyness("Domino's Pizza 11th St S Arlington VA live busyness");
    // 2. Papa John's Arlingon
    const papa = await fetchBusyness("Papa Johns Columbia Pike Arlington VA live busyness");
    // 3. Pizza Hut Pentagon City
    const hut = await fetchBusyness("Pizza Hut Pentagon City live busyness");

    // Algorithm
    let busyCount = 0;
    let moderateCount = 0;
    let closedCount = 0;

    [dominos, papa, hut].forEach(status => {
        if (status === 'BUSY') busyCount++;
        if (status === 'MODERATE') moderateCount++;
        if (status === 'CLOSED') closedCount++;
    });

    // Score Mapping
    if (busyCount >= 2) {
        return { usScore: 85, justification: "CRITICAL LOAD", isStale: false };
    }
    if (busyCount === 1 || moderateCount >= 2) {
        return { usScore: 45, justification: "ELEVATED ACTIVITY", isStale: false };
    }

    // Default / Quiet / Fallback
    // If we have mostly UNKNOWN, we default to 10% but mark as "Stale" or "Normal"
    // Requirement 4: "If all fail, show 10% with a DATA DELAYED tag"

    const isFailure = [dominos, papa, hut].every(s => s === 'UNKNOWN');
    if (isFailure) {
        return { usScore: 10, justification: "DATA DELAYED", isStale: true };
    }

    return { usScore: 10, justification: "NORMAL OPERATION", isStale: false };
}
