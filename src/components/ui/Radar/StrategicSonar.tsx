"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type Blip = {
    id: string;
    icao24: string;
    callsign: string | null;
    x: number;
    y: number;
    lastContact: number;
}; // Derived from OpenSkyState but simplified for UI

export default function StrategicSonar() {
    const [blips, setBlips] = useState<Blip[]>([]);

    // Risk level could be derived from number of targets or external prop. 
    // Hardcoding '25%' as per mock requirement for now, or dynamic based on count.
    const riskLevel = Math.min(100, blips.length * 10).toFixed(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/tactical/living-sky');
                const data = await res.json();

                if (data.states && Array.isArray(data.states)) {
                    // Current time in seconds for OpenSky comparison
                    const nowSec = Math.floor(Date.now() / 1000);

                    // Transform and filter states
                    const newBlips = data.states
                        .filter((state: any) => {
                            // 15 second rule: if last_contact is older than 15s, ignore
                            return (nowSec - state.last_contact) <= 20; // Giving a small buffer (20s) for network latency
                        })
                        .map((state: any, index: number) => {
                            // Pseudorandom position based on index/icao since we don't have a map center
                            // In a real app, we'd project unique Lat/Lon relative to a center.
                            // For visual flair matching the mock, we distribute them.
                            // However, to make them "correspond" to vectors, we can map Lat/Lon loosely to X/Y 
                            // assuming a bounding box or just use hash for consistent positioning if stationary.

                            // Simple mapping for demo:
                            // Map Longitude (-180 to 180) to X (-50 to 50)
                            // Map Latitude (-90 to 90) to Y (-50 to 50)
                            // But since these are specific planes, they might be clustered. 
                            // Let's use a seeded random based on ICAO for consistent "position" on the scope
                            // unless they are actually moving significantly (which they are).

                            // BETTER APPROACH: Use data if available, else fallback.
                            // We want movement.
                            // Let's try to normalize their coordinates relative to a fixed point (e.g. Middle East or US)
                            // OR, just map them purely on their lat/lon modulus for screen fit.

                            const x = (state.longitude % 10) * 5; // Arbitrary scale
                            const y = (state.latitude % 10) * 5;

                            return {
                                id: state.icao24,
                                icao24: state.icao24,
                                callsign: state.callsign,
                                lastContact: state.last_contact,
                                x: x || (Math.random() * 60 - 30),
                                y: y || (Math.random() * 60 - 30),
                            };
                        });
                    setBlips(newBlips);
                }
            } catch (error) {
                console.error("Radar update failed", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 15000); // 15s refresh
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative aspect-square w-full max-w-lg mx-auto tactical-clip border border-white/5 bg-matte-black p-4 overflow-hidden">

            {/* Center Info */}
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-6xl font-bold tracking-tighter text-coyote-tan/90">{riskLevel}%</div>
                <div className="text-[10px] tracking-[0.3em] text-coyote-tan/60 font-medium mt-1">RISK LEVEL</div>
            </div>

            {/* Radar Rings & Markers */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                {/* Outer Ring */}
                <div className="absolute h-[90%] w-[90%] rounded-full border border-coyote-tan/20" />
                {/* Mid Ring */}
                <div className="absolute h-[60%] w-[60%] rounded-full border border-coyote-tan/20" />
                {/* Inner Ring */}
                <div className="absolute h-[30%] w-[30%] rounded-full border border-coyote-tan/20" />

                {/* Degree Markers */}
                <span className="absolute top-2 text-[9px] text-coyote-tan/50 font-mono">0°</span>
                <span className="absolute bottom-2 text-[9px] text-coyote-tan/50 font-mono">180°</span>
                <span className="absolute left-2 text-[9px] text-coyote-tan/50 font-mono">270°</span>
                <span className="absolute right-2 text-[9px] text-coyote-tan/50 font-mono">90°</span>

                {/* Crosshairs */}
                <div className="absolute h-[1px] w-full bg-white/5" />
                <div className="absolute h-full w-[1px] bg-white/5" />
            </div>

            {/* Radar Sweep */}
            <motion.div
                className="absolute inset-0 z-10 origin-center"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            >
                {/* Sharp teal line with trailing gradient */}
                <div className="absolute left-1/2 top-1/2 h-1/2 w-[2px] -translate-x-1/2 origin-top bg-tactical-teal shadow-[0_0_10px_#5A7D9A]" style={{ transform: 'rotate(180deg)' }} />
                <div className="absolute inset-0 rounded-full bg-[conic-gradient(transparent_270deg,rgba(90,125,154,0.3)_360deg)]" />
            </motion.div>


            {/* Blips */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
                {blips.map((blip) => (
                    <motion.div
                        key={blip.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute flex flex-col items-center justify-center"
                        style={{
                            transform: `translate(${blip.x * 2}px, ${blip.y * 2}px)`, // Scale factor for visibility
                        }}
                    >
                        <div className="relative">
                            <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)] animate-ping absolute inset-0 opacity-75"></div>
                            <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)] relative z-10"></div>
                        </div>
                        <span className="mt-1 text-[8px] font-mono text-tactical-teal whitespace-nowrap">{blip.callsign || blip.icao24}</span>
                    </motion.div>
                ))}
            </div>

            {/* Corner Decorators */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l border-t border-coyote-tan/50" />
            <div className="absolute top-0 right-0 w-4 h-4 border-r border-t border-coyote-tan/50" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l border-b border-coyote-tan/50" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r border-b border-coyote-tan/50" />

        </div>
    );
}
