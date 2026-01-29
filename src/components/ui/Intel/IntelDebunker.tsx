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
        <MetricCard title="RUMOR ANALYSIS" className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-2 mb-4 scrollbar-hide">
                {feed.map((item) => (
                    <div key={item.id} className="border-l-2 border-tactical-teal/20 pl-2 py-1 text-xs">
                        <div className="flex items-center justify-between mb-1">
                            <span className={clsx("font-bold",
                                item.status === "VERIFIED" ? "text-emerald-500" :
                                    item.status === "FAKE" ? "text-red-500" : "text-coyote-tan"
                            )}>
                                {item.status}
                            </span>
                            <span className="text-gray-500 text-[10px]">{item.timestamp}</span>
                        </div>
                        <p className="text-tactical-teal/80 mb-1">{item.text}</p>
                        {item.summary && (
                            <p className="text-[10px] text-coyote-tan/60 italic border-t border-white/5 pt-1 mt-1">
                                ANALYSIS: {item.summary}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            <div className="relative">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="ENTER INTEL..."
                    className="w-full bg-black/50 border border-tactical-teal/30 p-2 pl-2 pr-8 text-xs text-coyote-tan placeholder:text-gray-600 focus:outline-none focus:border-tactical-teal/60 font-mono"
                />
                <button
                    onClick={handleAnalyze}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-tactical-teal hover:text-coyote-tan"
                >
                    <Send className="h-3 w-3" />
                </button>
            </div>
        </MetricCard>
    );
}
