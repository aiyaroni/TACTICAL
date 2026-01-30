"use client";

import { useState, useEffect } from "react";
import { Send, ShieldAlert, CheckCircle, HelpCircle } from "lucide-react";
import MetricCard from "../Metrics/MetricCard";
import { clsx } from "clsx";

type FeedItem = {
    id: number | string;
    text: string;
    status: "VERIFIED" | "FAKE" | "UNCONFIRMED" | "NEWS";
    summary?: string;
    timestamp: string;
    url?: string;
};

const INITIAL_DATA: FeedItem[] = [
    {
        id: 102,
        text: "Massive GPS interference reported in Northern Israel and Lebanon border.",
        status: "VERIFIED",
        summary: "Data confirms high-intensity electronic warfare activity consistent with border tensions.",
        timestamp: "05:15Z"
    },
    {
        id: 101,
        text: "Unconfirmed report of IRGC naval drills near the Strait of Hormuz.",
        status: "UNCONFIRMED",
        summary: "Satellite imagery shows normal patrol activity; no unusual vessel concentration detected.",
        timestamp: "04:20Z"
    }
];

export default function IntelDebunker() {
    const [input, setInput] = useState("");
    const [feed, setFeed] = useState<FeedItem[]>(INITIAL_DATA);

    // Fetch News
    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch('/api/tactical/news');
                const data = await res.json();
                if (data.articles) {
                    const newsItems: FeedItem[] = data.articles.map((art: any, i: number) => ({
                        id: `news-${i}`,
                        text: art.title,
                        status: "NEWS",
                        summary: art.source.name,
                        timestamp: new Date(art.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + "Z",
                        url: art.url
                    }));
                    // Interleave or append news. For now, we prepend news to the initial tactical data logic?
                    // Let's just combine them.
                    setFeed(prev => [...newsItems.slice(0, 5), ...prev]);
                }
            } catch (e) {
                console.error("News fetch failed", e);
            }
        };
        fetchNews();
    }, []);

    const handleAnalyze = () => {
        if (!input.trim()) return;
        const newRumor: FeedItem = {
            id: Date.now(),
            text: input,
            status: "UNCONFIRMED",
            timestamp: new Date().toISOString().split("T")[1].slice(0, 5) + "Z"
        };
        setFeed([newRumor, ...feed]);
        setInput("");
    };

    return (
        <MetricCard title="INTEL & NEWS" className="h-full flex flex-col p-4 !pb-2">

            {/* Scrollable Feed Container - Strict Height Enforcement */}
            <div className="flex-1 max-h-[400px] overflow-y-auto space-y-3 mb-3 pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-tactical-teal/20 hover:scrollbar-thumb-tactical-teal/40">
                {feed.map((item) => (
                    <div key={item.id} className="border-l-2 border-white/10 pl-3 py-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className={clsx("text-[10px] font-bold tracking-wider",
                                item.status === "VERIFIED" ? "text-emerald-400" :
                                    item.status === "FAKE" ? "text-red-500" :
                                        item.status === "NEWS" ? "text-blue-400" : "text-amber-400"
                            )}>
                                {item.status}
                            </span>
                            <span className="text-white/20 text-[9px] font-mono">{item.timestamp}</span>
                        </div>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className={clsx("text-xs leading-relaxed mb-1 font-medium block hover:underline",
                            item.status === 'NEWS' ? "text-white/90" : "text-coyote-tan/90")}>
                            {item.text}
                        </a>
                        {item.summary && (
                            <p className="text-[10px] text-tactical-teal/80 italic border-t border-white/5 pt-1 mt-1 font-mono">
                                // {item.summary}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="relative pt-2 border-t border-white/5">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="SUBMIT INTEL..."
                    className="w-full bg-white/5 border border-white/10 p-2 pl-3 pr-8 text-[10px] tracking-widest text-coyote-tan placeholder:text-white/20 focus:outline-none focus:border-tactical-teal/50 font-mono rounded-none transition-colors"
                />
                <button
                    onClick={handleAnalyze}
                    className="absolute right-2 top-[calc(50%+4px)] -translate-y-1/2 text-tactical-teal/50 hover:text-tactical-teal transition-colors"
                >
                    <Send className="h-3 w-3" />
                </button>
            </div>
        </MetricCard>
    );
}
