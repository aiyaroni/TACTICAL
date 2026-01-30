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
        // Query for active markets with relevant tags.
        // We'll try query "Middle East" or "War" to find high tension markets.
        const params = new URLSearchParams({
            limit: "10",
            active: "true",
            closed: "false",
            sort: "volume",
            order: "desc",
            tag_slug: "middle-east" // Middle East is usually the busiest conflict tag. Fallback to 'war' if empty?
        });

        // First attempt: Middle East
        let res = await fetch(`${GAMMA_API_URL}?${params.toString()}`, { next: { revalidate: 600 } }); // 10m cache
        let data = await res.json();

        // If no results, try 'war'
        if (!data || data.length === 0) {
            params.set("tag_slug", "");
            params.set("q", "War"); // Search for "War" generally
            res = await fetch(`${GAMMA_API_URL}?${params.toString()}`, { next: { revalidate: 600 } });
            data = await res.json();
        }

        // Third attempt: "Conflict" maybe?
        if (!data || data.length === 0) {
            params.set("q", "Conflict");
            res = await fetch(`${GAMMA_API_URL}?${params.toString()}`, { next: { revalidate: 600 } });
            data = await res.json();
        }

        // Fallback: Try "Global Conflict" or "Politics" if War/Conflict fails, but prioritize a specific known market logic if possible.
        // Using a broad "politics" search sorted by volume often yields the biggest conflict markets too.
        if (!data || data.length === 0) {
            params.set("tag_slug", "");
            params.set("q", "Politics");
            res = await fetch(`${GAMMA_API_URL}?${params.toString()}`, { next: { revalidate: 600 } });
            data = await res.json();
        }

        if (!data || !Array.isArray(data) || data.length === 0) return null;

        // Iterate to find a binary YES/NO market
        for (const market of data) {
            // Check if it has outcomes
            if (market.outcomes && market.outcomePrices) {
                // Try to interpret "Yes". Usually JSON string `["Yes", "No"]`
                let outcomes: string[] = [];
                let prices: string[] = [];

                try {
                    outcomes = JSON.parse(market.outcomes);
                    prices = JSON.parse(market.outcomePrices);
                } catch (e) {
                    // Sometimes they are already arrays? API varies.
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
                        url: `https://polymarket.com/event/${market.slug || market.groupItemTitle || "unknown"}`,
                        // Sparkline: requires a separate /history call usually. 
                        // We will omit for now to stay fast, client uses random sparkline.
                    };
                }
            }
        }

        return null;

    } catch (error) {
        console.error("Polymarket fetch failed", error);
        return null;
    }
}
