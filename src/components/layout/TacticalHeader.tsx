"use client";

import { useEffect, useState } from "react";

export default function TacticalHeader() {
    const [time, setTime] = useState("");
    const [date, setDate] = useState("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTime(now.toISOString().split("T")[1].split(".")[0] + "Z");
            setDate(now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase());
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="flex items-center justify-between border-b border-tactical-teal/30 bg-matte-black/90 p-4 font-mono text-sm tracking-widest backdrop-blur-sm sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-tactical-teal">TACTICAL // OVERWATCH</h1>
                <div className="hidden h-4 w-px bg-tactical-teal/50 sm:block" />
                <span className="hidden text-coyote-tan/80 sm:block">SYS.STATUS: NOMINAL</span>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    <span className="font-bold text-red-500">LIVE</span>
                </div>

                <div className="text-right">
                    <div className="text-coyote-tan">{date}</div>
                    <div className="text-tactical-teal">{time}</div>
                </div>
            </div>
        </header>
    );
}
