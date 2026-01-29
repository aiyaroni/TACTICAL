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
        strategicAssets: [
            { id: '1', callsign: 'ADFEB2', status: 'AIRBORNE', location: 'UNK' },
            { id: '2', callsign: 'ADFEB4', status: 'GROUND', location: 'OFFUTT' },
            { id: '3', callsign: 'ADFEB6', status: 'MAINTENANCE', location: 'TINKER' },
            { id: '4', callsign: 'AE0410', status: 'AIRBORNE', location: 'PACIFIC' },
        ],
        ewJamming: 45,
        pizzaIndex: 'NORMAL',
        predictionOdds: 52,
    });

    useEffect(() => {
        if (!simulationMode) return;

        const interval = setInterval(() => {
            setData(prev => ({
                ...prev,
                ewJamming: Math.min(100, Math.max(0, prev.ewJamming + (Math.random() * 20 - 10))),
                predictionOdds: Math.min(100, Math.max(0, prev.predictionOdds + (Math.random() * 10 - 5))),
                pizzaIndex: Math.random() > 0.9 ? 'HIGH' : Math.random() > 0.95 ? 'CRITICAL' : 'NORMAL',
                strategicAssets: prev.strategicAssets.map(asset => ({
                    ...asset,
                    status: Math.random() > 0.8 ? (['AIRBORNE', 'GROUND', 'MAINTENANCE'][Math.floor(Math.random() * 3)] as any) : asset.status
                }))
            }));
        }, 10000); // 10s interval

        return () => clearInterval(interval);
    }, [simulationMode]);

    return data;
}
