"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type Blip = { x: number; y: number; opacity: number; id: string; type: string; threat_level: string };

const SEEDED_TARGETS = [
    { id: "T-01", type: "E-4B", icao: "ADFEB2", status: "AIRBORNE", threat_level: "LOW" },
    { id: "T-02", type: "E-6B", icao: "AE0410", status: "STATIONARY", threat_level: "LOW" },
    { id: "T-03", type: "UNKNOWN", sector: "PERSIAN_GULF", status: "JAMMING_DETECTED", threat_level: "HIGH" }
];

export default function StrategicSonar() {
    const [blips, setBlips] = useState<Blip[]>([]);

    useEffect(() => {
        // Map seeded targets to coordinates
        const initialBlips: Blip[] = SEEDED_TARGETS.map(target => {
            // Deterministic positioning based on ID for demo consistency
            let x = 0, y = 0;
            if (target.id === "T-01") { x = 15; y = -15; } // Top Right
            if (target.id === "T-02") { x = -10; y = 10; } // Bottom Left
            if (target.id === "T-03") { x = 25; y = 5; }   // Far Right

            return {
                id: target.id,
                x,
                y,
                opacity: 1,
                type: target.type,
                threat_level: target.threat_level
            };
        });
        setBlips(initialBlips);

        // Random blips generator (adds noise)
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 40;
                setBlips((prev) => {
                    // Keep seeded targets (first 3)
                    const seeded = prev.filter(b => b.id.startsWith("T-"));
                    const noise = prev.filter(b => !b.id.startsWith("T-")).slice(-4);

                    return [
                        ...seeded,
                        ...noise,
                        {
                            id: Date.now().toString(),
                            x: Math.cos(angle) * radius,
                            y: Math.sin(angle) * radius,
                            opacity: 1,
                            type: "NOISE",
                            threat_level: "LOW"
                        },
                    ];
                });
            }
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative aspect-square w-full max-w-2xl mx-auto tactical-clip border border-tactical-teal/20 bg-black/40 p-4 overflow-hidden">
            {/* Grid Background */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(90,125,154,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(90,125,154,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

            {/* Radar Main Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-[80%] w-[80%] rounded-full border border-tactical-teal/30 opacity-50" />
                <div className="absolute h-[60%] w-[60%] rounded-full border border-tactical-teal/30 opacity-40" />
                <div className="absolute h-[40%] w-[40%] rounded-full border border-tactical-teal/30 opacity-30" />
                {/* Crosshairs */}
                <div className="absolute h-[1px] w-full bg-tactical-teal/20" />
                <div className="absolute h-full w-[1px] bg-tactical-teal/20" />
            </div>

            {/* Radar Sweep */}
            <motion.div
                className="absolute inset-0 z-10 origin-center"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            >
                <div className="h-1/2 w-full origin-bottom bg-[conic-gradient(from_0deg,transparent_60%,rgba(90,125,154,0.5)_100%)]" style={{ transformOrigin: "50% 100%" }} />
            </motion.div>


            {/* Blips */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
                {blips.map((blip) => (
                    <div
                        key={blip.id}
                        className="absolute flex flex-col items-center justify-center"
                        style={{
                            transform: `translate(${blip.x * 10}px, ${blip.y * 10}px)`,
                        }}
                    >
                        <motion.div
                            initial={blip.id.startsWith("T-") ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 0 }}
                            animate={blip.id.startsWith("T-") ? { opacity: [1, 0.5, 1] } : { opacity: 0, scale: 1.5 }}
                            transition={blip.id.startsWith("T-") ? { repeat: Infinity, duration: 2 } : { duration: 3 }}
                            className={`h-2 w-2 rounded-full shadow-[0_0_8px_rgba(239,68,68,1)] ${blip.threat_level === 'HIGH' ? 'bg-red-500' : 'bg-emerald-400'}`}
                        />
                        {blip.id.startsWith("T-") && (
                            <span className="mt-1 text-[8px] font-mono text-coyote-tan whitespace-nowrap">{blip.type}</span>
                        )}
                    </div>
                ))}
            </div>

            {/* HUD Info */}
            <div className="absolute bottom-4 left-4 z-30">
                <div className="text-xs font-mono text-tactical-teal">RADAR // ACTIVE</div>
                <div className="text-[10px] font-mono text-coyote-tan">TARGETS: {blips.length}</div>
            </div>
        </div>
    );
}
