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
        <header className={`flex h-20 items-center justify-between border-b px-6 font-mono text-xs tracking-wider sticky top-0 z-50 transition-colors duration-500 relative ${isEmergency ? 'bg-red-950/20 border-red-500/50' : 'bg-matte-black border-white/10'}`}>

            {/* Centered Title (Mobile & Desktop) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <h1 className={`font-bold italic tracking-tighter font-sans pointer-events-auto ${isEmergency ? 'text-red-500 animate-pulse' : 'text-[#826E58]'}`}>
                    {/* Mobile: GLOBAL RISK MONITOR */}
                    <span className="block md:hidden text-lg tracking-[0.15em]">GLOBAL RISK MONITOR</span>
                    {/* Desktop: TACTICAL */}
                    <span className="hidden md:block text-3xl">TACTICAL</span>
                </h1>
            </div>

            {/* Left Side: Subtitle (Desktop Only) */}
            <div className="hidden md:flex flex-col z-10">
                <div className="mt-1 text-[10px] font-medium tracking-[0.2em] text-gray-500 uppercase">
                    Strategic Intelligence
                </div>
            </div>

            {/* Right Side: Data/Time (Desktop Only) */}
            <div className="hidden md:flex items-center gap-6 text-coyote-tan z-10">

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
