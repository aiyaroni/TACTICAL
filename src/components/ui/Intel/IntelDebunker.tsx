"use client";

import { useState, useEffect } from "react";
import { Send, ShieldAlert, CheckCircle, HelpCircle } from "lucide-react";
import MetricCard from "../Metrics/MetricCard";
import { clsx } from "clsx";

type FeedItem = {
    id: number | string;
    text: string;
    status: "VERIFIED" | "FAKE" | "UNCONFIRMED" | "NEWS" | "CONFIRMED";
    summary?: string;
    timestamp: string;
    url?: string;
};

const INITIAL_DATA: FeedItem[] = [];

export default function IntelDebunker() {
    const [input, setInput] = useState("");
    const [feed, setFeed] = useState<FeedItem[]>(INITIAL_DATA);
    const [isExpanded, setIsExpanded] = useState(false);

    // Fetch News
    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await fetch('/api/tactical/news');
                const data = await res.json();
                if (data.articles) {
                    const newsItems: FeedItem[] = data.articles.map((art: any, i: number) => {
                        const pubDate = new Date(art.publishedAt);

                        // Fix Timezone to UTC
                        const timeStr = pubDate.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                            timeZone: 'UTC'
                        });

                        // Calculate "Minutes Ago"
                        const diffMs = new Date().getTime() - pubDate.getTime();
                        const diffMins = Math.floor(diffMs / 60000);
                        const agoLabel = diffMins < 60 ? `${diffMins}m AGO` : `${Math.floor(diffMins / 60)}h AGO`;

                        return {
                            id: `news-${i}`,
                            text: art.title,
                            status: "NEWS",
                            summary: art.source.name,
                            timestamp: `${timeStr}Z [${agoLabel}]`,
                            url: art.url,
                            realTime: pubDate.getTime() // store for filtering
                        };
                    });
                    setFeed(newsItems); // Set directly, no initial data fallout
                }
            } catch (e) {
                console.error("News fetch failed", e);
            }
        };
        fetchNews();
    }, []);

    const handleAnalyze = async () => {
        if (!input.trim()) return;

        // Check for System Override Command
        if (input.includes("SYSTEM OVERRIDE")) {
            const overrideMsg: FeedItem = {
                id: Date.now(),
                text: "SYSTEM OVERRIDE ACCEPTED. DUAL-VECTOR CALIBRATION INITIATED.",
                status: "VERIFIED",
                summary: "COMMAND AUTHENTICATED",
                timestamp: new Date().toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false, hour: '2-digit', minute: '2-digit' }) + "Z [0m AGO]"
            };
            setFeed([overrideMsg, ...feed]);
            setInput("");
            return;
        }

        // Temporary "Analysing..." State
        const tempId = Date.now();
        const pendingItem: FeedItem = {
            id: tempId,
            text: input,
            status: "UNCONFIRMED",
            summary: "VALIDATING VIA DUAL-VECTOR SIGINT...",
            timestamp: new Date().toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false, hour: '2-digit', minute: '2-digit' }) + "Z [0m AGO]"
        };
        setFeed([pendingItem, ...feed]);
        setInput("");

        // Call Validation API
        try {
            const res = await fetch('/api/tactical/validate', {
                method: 'POST',
                body: JSON.stringify({ input: pendingItem.text }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();

            // Update the pending item with actual result
            setFeed(current => current.map(item =>
                item.id === tempId ? { ...item, status: data.status, summary: data.summary } : item
            ));
        } catch (e) {
            console.error("Validation Request Failed", e);
            setFeed(current => current.map(item =>
                item.id === tempId ? { ...item, summary: "VALIDATION FAILED - RETRY" } : item
            ));
        }
    };

    const filteredFeed = feed
        .filter(item => {
            // Text Search Filter
            const matchesSearch = input.trim() === "" ||
                item.text.toLowerCase().includes(input.toLowerCase()) ||
                (item.summary && item.summary.toLowerCase().includes(input.toLowerCase()));

            if (!matchesSearch) return false;

            // STABILIZED MONITOR PROTOCOL: Strict 17h Filter
            // If item has a realTime timestamp, check it.
            if ((item as any).realTime) {
                const ageHours = (Date.now() - (item as any).realTime) / (1000 * 60 * 60);
                if (ageHours > 17) return false;
            }

            return true;
        })
        .sort((a, b) => 0); // Keep API order (Newest First)

    const visibleCount = isExpanded ? filteredFeed.length : 4;

    return (
        <MetricCard title="INTEL & NEWS" className="h-full flex flex-col p-4 !pb-2" noWrapper>

            {/* Scrollable Feed Container - Fluid Height */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-3 mb-1 pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-tactical-teal/20 hover:scrollbar-thumb-tactical-teal/40">
                {filteredFeed.slice(0, visibleCount).map((item) => (
                    <div key={item.id} className="border-l-2 border-white/10 pl-3 py-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className={clsx("text-[10px] font-bold tracking-wider",
                                item.status === "CONFIRMED" || item.status === "VERIFIED" ? "text-emerald-400" :
                                    item.status === "FAKE" || item.status === "UNCONFIRMED" ? "text-red-500" :
                                        item.status === "NEWS" ? "text-blue-400" : "text-amber-400"
                            )}>
                                {item.status}
                            </span>
                            <span className="text-amber-500 text-[10px] font-bold font-mono tracking-wide shadow-black drop-shadow-md">{item.timestamp}</span>
                        </div>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className={clsx("text-xs leading-relaxed mb-0.5 font-medium block hover:underline",
                            "text-coyote-tan/90 shadow-black drop-shadow-sm")}>
                            {item.text}
                        </a>

                        {/* Source Display */}
                        {item.summary && (
                            <div className="text-[9px] text-white/30 font-mono tracking-tight mb-1">
                                via {item.summary}
                            </div>
                        )}
                    </div>
                ))}
                {filteredFeed.length === 0 && (
                    <div className="text-center text-white/20 text-[10px] italic py-4">NO CRITICAL UPDATES (24H)</div>
                )}
            </div>

            {/* Read More Toggle */}
            {filteredFeed.length > 4 && (
                <div className="flex justify-center -mt-1 mb-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-[9px] text-tactical-teal/70 hover:text-tactical-teal uppercase tracking-widest font-bold flex items-center gap-1"
                    >
                        {isExpanded ? "[-] Collapse Archive" : `[+] View Strategic Archive (${filteredFeed.length - 4} Hidden)`}
                        {isExpanded ? <CheckCircle className="h-2 w-2" /> : <ShieldAlert className="h-2 w-2" />}
                    </button>
                </div>
            )}

            {/* Input Area (Search & Submit) */}
            <div className="relative pt-2 border-t border-white/5">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        // Force verification of Enter key submission
                        if (e.key === 'Enter') {
                            handleAnalyze();
                        }
                    }}
                    placeholder="Refine Intel / Type 'SYSTEM OVERRIDE'..."
                    className="w-full bg-white/5 border border-white/10 p-2 pl-3 pr-8 text-[10px] tracking-widest text-coyote-tan placeholder:text-zinc-400 focus:outline-none focus:border-tactical-teal/50 font-mono rounded-none transition-colors"
                />
                <button
                    onClick={handleAnalyze}
                    className="absolute right-2 top-[calc(50%+4px)] -translate-y-1/2 text-tactical-teal/50 hover:text-tactical-teal cursor-pointer"
                >
                    <Send className="h-3 w-3" />
                </button>
            </div>
        </MetricCard>
    );
}
