"use client";

import { motion } from "framer-motion";

export type Blip = {
    id: string;
    icao24: string;
    callsign: string | null;
    x: number;
    y: number;
    lastContact: number;
    type?: 'CIVIL' | 'MILITARY';
};

interface StrategicSonarProps {
    blips: Blip[];
    riskLevel: string;
    ewJamming: number;
}

export default function StrategicSonar({ blips, riskLevel, ewJamming }: StrategicSonarProps) {
    const riskNum = parseInt(riskLevel);

    // Determine Risk Tier for Main Display
    const isElevated = riskNum > 20;
    const isHigh = riskNum > 50;

    let badgeText = "LOW RISK // NORMAL";
    let badgeColor = "bg-emerald-900/40 text-emerald-500 border border-emerald-500/30";

    if (isHigh) {
        badgeText = "HIGH RISK // CRITICAL";
        badgeColor = "bg-red-900/40 text-red-500 border border-red-500/30";
    } else if (isElevated) {
        badgeText = "ELEVATED // GUARDED";
        badgeColor = "bg-amber-900/40 text-amber-500 border border-amber-500/30";
    }

    return (
        <div className="relative w-full max-w-lg mx-auto flex flex-col items-center">

            {/* Semi-Circle Radar Container */}
            <div className="relative aspect-[2/1] w-full overflow-hidden border-b-2 border-coyote-tan/50 bg-matte-black/50">

                {/* Radar Grid (Semi-Circles) */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] h-[180%] rounded-full border border-white/10" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[120%] rounded-full border border-white/10" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30%] h-[60%] rounded-full border border-white/10" />

                {/* Radar Sweep (Semi-Circle Version) */}
                <motion.div
                    className="absolute bottom-0 left-[calc(50%-1px)] w-[2px] h-full bg-tactical-teal/50 origin-bottom shadow-[0_0_15px_#5A7D9A]"
                    animate={{ rotate: [-90, 90] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear", repeatType: "reverse" }}
                >
                    <div className="absolute top-0 -left-4 w-8 h-32 bg-gradient-to-t from-transparent to-tactical-teal/20 blur-xl" />
                </motion.div>

                {/* Empty State: Scanning... */}
                {blips.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center flex-col z-20 pointer-events-none">
                        <div className="text-[10px] text-tactical-teal/50 animate-pulse tracking-[0.2em] mb-20 uppercase font-mono">
                            SCANNING SECTOR 7...
                        </div>
                    </div>
                )}

                {/* Blips */}
                {blips.map((blip) => {
                    const parsedRisk = parseInt(riskLevel);

                    // TIER 3: HIGH RISK (>50%) - RED FIGHTER JETS
                    if (parsedRisk > 50) {
                        return (
                            <motion.div
                                key={blip.id}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute bottom-0 left-1/2 origin-bottom transition-all duration-1000"
                                style={{
                                    transform: `translateX(${blip.x * 2}px) translateY(-${Math.abs(blip.y * 2) + 20}px)`
                                }}
                            >
                                <div className="relative flex items-center justify-center">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                                        <path d="M12 2L2 22l10-3 10 3L12 2z" />
                                    </svg>
                                </div>
                            </motion.div>
                        );
                    }
                    // TIER 2: GUARDED (20-50%) - AMBER DOTS
                    else if (parsedRisk > 20) {
                        return (
                            <motion.div
                                key={blip.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute bottom-0 left-1/2 origin-bottom transition-all duration-1000"
                                style={{
                                    transform: `translateX(${blip.x * 2}px) translateY(-${Math.abs(blip.y * 2) + 20}px)`
                                }}
                            >
                                <div className="h-2 w-2 bg-amber-500/80 rounded-full shadow-[0_0_8px_#F59E0B] animate-pulse" />
                            </motion.div>
                        );
                    }
                    // TIER 1: LOW (<20%) - GREEN DOTS
                    else {
                        return (
                            <motion.div
                                key={blip.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute bottom-0 left-1/2 origin-bottom transition-all duration-1000"
                                style={{
                                    transform: `translateX(${blip.x * 2}px) translateY(-${Math.abs(blip.y * 2) + 20}px)`
                                }}
                            >
                                <div className="h-1.5 w-1.5 bg-emerald-500/60 rounded-full shadow-[0_0_4px_#10B981]" />
                            </motion.div>
                        );
                    }
                })}

                {/* Grid Lines */}
                <div className="absolute bottom-0 left-0 w-full h-px bg-coyote-tan/20" />
                <div className="absolute bottom-0 left-1/2 w-px h-full bg-coyote-tan/20" />
                <div className="absolute bottom-0 left-1/2 w-[140%] h-px bg-coyote-tan/20 origin-bottom -rotate-45" />
                <div className="absolute bottom-0 left-1/2 w-[140%] h-px bg-coyote-tan/20 origin-bottom rotate-45" />

            </div>

            {/* Risk Badge */}
            <div className="mt-4 flex flex-col items-center">
                <div className="text-5xl font-bold tracking-tighter text-coyote-tan">{riskLevel}%</div>
                <div className={`px-3 py-0.5 text-[10px] uppercase font-bold tracking-widest rounded-full mt-2 transition-colors duration-500 ${badgeColor}`}>
                    {badgeText}
                </div>
            </div>

        </div>
    );
}
