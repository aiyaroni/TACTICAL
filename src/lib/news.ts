export interface NewsArticle {
    title: string;
    description: string;
    source: { name: string };
    publishedAt: string;
    url: string;
}

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_URL = `https://newsapi.org/v2/everything?q=military+geopolitics&language=en&sortBy=publishedAt&pageSize=10&apiKey=`;

export async function fetchMilitaryNews(): Promise<NewsArticle[]> {
    if (!NEWS_API_KEY) {
        console.warn("NEWS_API_KEY missing");
        return [];
    }

    try {
        const res = await fetch(`${NEWS_URL}${NEWS_API_KEY}`, {
            next: { revalidate: 900 } // 15 minutes cache
        });

        if (!res.ok) {
            console.error(`NewsAPI Error: ${res.status}`);
            return [];
        }

        const data = await res.json();
        return data.articles || [];
    } catch (e) {
        console.error("Failed to fetch news", e);
        return [];
    }
}
