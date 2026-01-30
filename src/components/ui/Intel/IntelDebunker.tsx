"use client";

import { useState } from "react";
import { Send, ShieldAlert, CheckCircle, HelpCircle } from "lucide-react";
import MetricCard from "../Metrics/MetricCard";
import { clsx } from "clsx";

type Rumor = {
    id: number;
    text: string;
    status: "VERIFIED" | "FAKE" | "UNCONFIRMED";
    summary?: string;
    timestamp: string;
};

const INITIAL_DATA: Rumor[] = [
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
    const [feed, setFeed] = useState<Rumor[]>(INITIAL_DATA);

    const handleAnalyze = () => {
        if (!input.trim()) return;
        const newRumor: Rumor = {
            id: Date.now(),
            text: input,
            status: "UNCONFIRMED",
            timestamp: new Date().toISOString().split("T")[1].slice(0, 5) + "Z"
        };
        setFeed([newRumor, ...feed]);
        setInput("");
    };

    return (
        <MetricCard title="RUMOR ANALYSIS" className="h-full flex flex-col p-4 !pb-2">

            {/* Scrollable Feed Container - Strict Height Enforcement */}
            <div className="flex-1 max-h-[400px] overflow-y-auto space-y-3 mb-3 pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-tactical-teal/20 hover:scrollbar-thumb-tactical-teal/40">
                {feed.map((item) => (
                    <div key={item.id} className="border-l-2 border-white/10 pl-3 py-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className={clsx("text-[10px] font-bold tracking-wider",
                                item.status === "VERIFIED" ? "text-emerald-400" :
                                    item.status === "FAKE" ? "text-red-500" : "text-amber-400"
                            )}>
                                {item.status}
                            </span>
                            <span className="text-white/20 text-[9px] font-mono">{item.timestamp}</span>
                        </div>
                        <p className="text-coyote-tan/90 text-xs leading-relaxed mb-1 font-medium">{item.text}</p>
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
