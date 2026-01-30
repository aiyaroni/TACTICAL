"use client";

import { useEffect, useState } from "react";

interface TacticalHeaderProps {
    isEmergency?: boolean;
}

export default function TacticalHeader({ isEmergency }: TacticalHeaderProps) {
    const [time, setTime] = useState("");
    const [date, setDate] = useState("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            // Format time as HH:MM:SS ZULU
            const hours = now.getUTCHours().toString().padStart(2, '0');
            const minutes = now.getUTCMinutes().toString().padStart(2, '0');
            const seconds = now.getUTCSeconds().toString().padStart(2, '0');
            setTime(`${hours}:${minutes}:${seconds} ZULU`);

            // Format date as DD MMM YYYY
            const day = now.getUTCDate().toString().padStart(2, '0');
            const month = now.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase();
            const year = now.getUTCFullYear();
            setDate(`${day} ${month} ${year}`);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className={`flex h-20 items-center justify-between border-b px-6 font-mono text-xs tracking-wider sticky top-0 z-50 transition-colors duration-500 ${isEmergency ? 'bg-red-950/20 border-red-500/50' : 'bg-matte-black border-white/10'}`}>
            {/* Left Side: Branding */}
            <div className="flex flex-col">
                <div className="flex items-center gap-3">
                    <h1 className={`text-2xl font-bold italic tracking-tighter font-sans ${isEmergency ? 'text-red-500 animate-pulse' : 'text-gray-100'}`}>TACTICAL</h1>
                </div>
                <div className="mt-1 text-[10px] font-medium tracking-[0.2em] text-gray-500 uppercase">
                    Global Risk Monitoring & Strategic Intelligence
                </div>
            </div>

            {/* Right Side: Data/Time */}
            <div className="flex items-center gap-6 text-coyote-tan">

                {/* Separator */}
                <div className="h-8 w-px bg-white/10" />

                <div className="flex items-center gap-3">
                    <span className="text-lg tracking-widest">{date}</span>
                    <div className="h-4 w-px bg-coyote-tan/30" />
                    <span className="text-lg tracking-widest">{time}</span>
                    <span className={`h-2 w-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] ${isEmergency ? 'bg-red-600 animate-ping' : 'bg-green-500 animate-pulse'}`} />
                </div>
            </div>
        </header>
    );
}
