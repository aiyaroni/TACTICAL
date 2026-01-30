"use client";

import { useState, useEffect } from 'react';

// Types
export type TacticalData = {
    strategicAssets: { id: string; callsign: string; status: 'AIRBORNE' | 'GROUND' | 'MAINTENANCE'; location: string }[];
    ewJamming: number; // 0-100
    pizzaIndex: 'NORMAL' | 'HIGH' | 'CRITICAL';
    predictionOdds: number; // 0-100
};

export function useTacticalData(simulationMode: boolean = true) {
    const [data, setData] = useState<TacticalData>({
        strategicAssets: [],
        ewJamming: 0,
        pizzaIndex: 'NORMAL',
        predictionOdds: 0,
    });

    useEffect(() => {
        // Zero Hallucination: Simulation Disabled.
        // We only rely on real API integrations (OpenSky, etc) passed via props or other hooks in page.tsx
    }, []);

    return data;
}
