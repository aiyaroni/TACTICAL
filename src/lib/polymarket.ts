export interface MarketData {
    question: string;
    probability: number;
    volume: number;
    url: string;
    history?: any[]; // Placeholder for sparkline data if we can parse it
}

const GAMMA_API_URL = "https://gamma-api.polymarket.com/markets";

export async function fetchConflictOdds(): Promise<MarketData | null> {
    try {
        // Hardcoded Targeted Market: "Will Israel and Iran be at war by 2026?"
        // We use the slug filter which is very precise.
        const params = new URLSearchParams({
            slug: "will-israel-and-iran-be-at-war-by-2026"
        });

        const res = await fetch(`${GAMMA_API_URL}?${params.toString()}`, { next: { revalidate: 600 } });
        const data = await res.json();

        if (!data || !Array.isArray(data) || data.length === 0) return null;

        const market = data[0]; // Specific slug returns array of 1 (usually)

        // Iterate to finding a binary YES/NO market if needed, but Slug usually targets one event.
        if (market.outcomes && market.outcomePrices) {
            let outcomes: string[] = [];
            let prices: string[] = [];

            try {
                outcomes = JSON.parse(market.outcomes);
                prices = JSON.parse(market.outcomePrices);
            } catch (e) {
                if (Array.isArray(market.outcomes)) outcomes = market.outcomes;
                if (Array.isArray(market.outcomePrices)) prices = market.outcomePrices;
            }

            const yesIndex = outcomes.findIndex((o: string) => o.toLowerCase() === "yes");

            if (yesIndex !== -1 && prices[yesIndex]) {
                const prob = parseFloat(prices[yesIndex]);

                return {
                    question: market.question,
                    probability: prob * 100, // Client will round this
                    volume: market.volume,
                    url: `https://polymarket.com/event/${market.slug || "unknown"}`,
                };
            }
        }
        return null;

    } catch (error) {
        console.error("Polymarket fetch failed", error);
        return null;
    }
}
