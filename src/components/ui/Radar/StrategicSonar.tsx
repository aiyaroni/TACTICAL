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
    const isElevated = riskNum > 50;

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

                {/* Blips */}
                {blips.map((blip) => (
                    <motion.div
                        key={blip.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute bottom-0 left-1/2 origin-bottom transition-all duration-1000"
                        style={{
                            transform: `translateX(${blip.x * 2}px) translateY(-${Math.abs(blip.y * 2) + 20}px)`
                        }}
                    >
                        {blip.type === 'MILITARY' ? (
                            <div className="h-3 w-3 relative flex items-center justify-center">
                                <div className="absolute inset-0 bg-red-500/30 animate-ping rounded-full" />
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-sm rotate-45" />
                            </div>
                        ) : (
                            <div className="h-1 w-1 bg-emerald-500/80 rounded-full shadow-[0_0_4px_#34D399]" />
                        )}
                    </motion.div>
                ))}

                {/* Grid Lines */}
                <div className="absolute bottom-0 left-0 w-full h-px bg-coyote-tan/20" />
                <div className="absolute bottom-0 left-1/2 w-px h-full bg-coyote-tan/20" />
                <div className="absolute bottom-0 left-1/2 w-[140%] h-px bg-coyote-tan/20 origin-bottom -rotate-45" />
                <div className="absolute bottom-0 left-1/2 w-[140%] h-px bg-coyote-tan/20 origin-bottom rotate-45" />

            </div>

            {/* Risk Badge */}
            <div className="mt-4 flex flex-col items-center">
                <div className="text-5xl font-bold tracking-tighter text-coyote-tan">{riskLevel}%</div>
                <div className={`px-3 py-0.5 text-[10px] uppercase font-bold tracking-widest rounded-full mt-2 transition-colors duration-500 ${isElevated ? 'bg-red-900/40 text-red-500 border border-red-500/30' : 'bg-emerald-900/40 text-emerald-500 border border-emerald-500/30'}`}>
                    {isElevated ? 'ELEVATED RISK' : 'LOW RISK // NORMAL'}
                </div>
            </div>

        </div>
    );
}
