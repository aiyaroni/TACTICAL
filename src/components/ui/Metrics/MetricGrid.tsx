"use client";

import { useEffect, useState } from "react";
import MetricCard from "./MetricCard";
import Sparkline from "./Sparkline";
import { Plane, Radio, Pizza, TrendingUp } from "lucide-react";
import { useTacticalData } from "@/hooks/useTacticalData";

export default function MetricGrid() {
    const { ewJamming, pizzaIndex, predictionOdds } = useTacticalData(true);

    // Local state for Assets (OpenSky)
    const [assetStatus, setAssetStatus] = useState<"STANDBY" | "ACTIVE">("STANDBY");
    const [e4bCount, setE4bCount] = useState(0);

    // Fetch OpenSky data to check for E-4Bs
    useEffect(() => {
        const checkAssets = async () => {
            try {
                const res = await fetch('/api/tactical/living-sky');
                const data = await res.json();
                if (data.states && Array.isArray(data.states)) {
                    // Check if any tracked assets (which are filtered by ICAOs of interest in the API) are present
                    if (data.states.length > 0) {
                        setAssetStatus("ACTIVE");
                        setE4bCount(data.states.length);
                    } else {
                        setAssetStatus("STANDBY");
                        setE4bCount(0);
                    }
                }
            } catch (e) {
                console.error("Asset check failed", e);
            }
        };

        checkAssets();
        const interval = setInterval(checkAssets, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    // Generate dummy sparkline data
    const generateSpark = () => Array.from({ length: 15 }, () => Math.floor(Math.random() * 50) + 20);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl mx-auto">
            {/* 1. ASSETS CARD */}
            <MetricCard
                title="ASSETS"
                value={assetStatus}
                subLabel={`E-4B STATUS [${e4bCount} DETECTED]`}
                icon={Plane}
                className={assetStatus === 'ACTIVE' ? 'border-coyote-tan/50 bg-coyote-tan/5' : ''}
            >
                <Sparkline points={generateSpark()} color="stroke-coyote-tan" />
            </MetricCard>

            {/* 2. E-WARFARE CARD */}
            <MetricCard
                title="E-WARFARE"
                value={`${ewJamming.toFixed(0)}%`}
                subLabel="GPS INTERFERENCE"
                icon={Radio}
            >
                <Sparkline points={generateSpark()} color="stroke-white" />
            </MetricCard>

            {/* 3. PENTAGON CARD */}
            <MetricCard
                title="PENTAGON"
                value={pizzaIndex}
                subLabel="PIZZA INDEX"
                icon={Pizza}
                className={pizzaIndex === 'CRITICAL' ? 'border-red-500/50' : ''}
            >
                <Sparkline points={generateSpark()} color={pizzaIndex === 'CRITICAL' ? 'stroke-red-500' : 'stroke-white'} />
            </MetricCard>

            {/* 4. MARKET CARD */}
            <MetricCard
                title="MARKET"
                value={`${predictionOdds}%`}
                subLabel="PREDICTION ODDS"
                icon={TrendingUp}
            >
                <Sparkline points={generateSpark()} color="stroke-white" />
            </MetricCard>
        </div>
    );
}
