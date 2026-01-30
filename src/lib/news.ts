export interface NewsArticle {
    title: string;
    description: string;
    source: { name: string };
    publishedAt: string;
    url: string;
}

const NEWS_API_KEY = process.env.NEWS_API_KEY?.replace(/"/g, '');

export async function fetchMilitaryNews(query = "military+geopolitics"): Promise<NewsArticle[]> {
    if (!NEWS_API_KEY) {
        console.warn("NEWS_API_KEY missing");
        return [];
    }

    try {
        const res = await fetch(`https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`, {
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
