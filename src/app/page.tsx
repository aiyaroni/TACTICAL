"use client";

import { useEffect, useState } from "react";
import TacticalHeader from "@/components/layout/TacticalHeader";
import MetricCard from "@/components/ui/Metrics/MetricCard";
import Sparkline from "@/components/ui/Metrics/Sparkline";
import StrategicSonar from "@/components/ui/Radar/StrategicSonar";
import IntelDebunker from "@/components/ui/Intel/IntelDebunker";
import { useTacticalData } from "@/hooks/useTacticalData";
import { Plane, Radio, Pizza, TrendingUp } from "lucide-react";

export default function Home() {
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

  // Generate sparkline data
  const generateSpark = () => Array.from({ length: 15 }, () => Math.floor(Math.random() * 50) + 20);

  // Glowing White Sparkline Style
  const glowingWhite = "stroke-white drop-shadow-[0_0_3px_rgba(255,255,255,0.8)]";

  return (
    <div className="min-h-screen flex flex-col bg-matte-black text-coyote-tan font-mono overflow-hidden">
      <TacticalHeader />

      <main className="flex-1 p-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)]">

          {/* LEFT COLUMN (Cols 1-3): METRICS VERTICAL STACK */}
          <div className="lg:col-span-3 flex flex-col gap-6 h-full overflow-y-auto noscroll">

            {/* 1. ASSETS */}
            <MetricCard
              title="ASSETS"
              value={assetStatus}
              subLabel={`E-4B STATUS [${e4bCount} DETECTED]`}
              icon={Plane}
              className={assetStatus === 'ACTIVE' ? 'border-coyote-tan/50 bg-coyote-tan/5' : ''}
            >
              <Sparkline points={generateSpark()} color={glowingWhite} />
            </MetricCard>

            {/* 2. E-WARFARE */}
            <MetricCard
              title="E-WARFARE"
              value={`${ewJamming.toFixed(0)}%`}
              subLabel="GPS INTERFERENCE"
              icon={Radio}
            >
              <Sparkline points={generateSpark()} color={glowingWhite} />
            </MetricCard>

            {/* 3. PENTAGON */}
            <MetricCard
              title="PENTAGON"
              value={pizzaIndex}
              subLabel="PIZZA INDEX"
              icon={Pizza}
              className={pizzaIndex === 'CRITICAL' ? 'border-red-500/50' : ''}
            >
              <Sparkline points={generateSpark()} color={pizzaIndex === 'CRITICAL' ? 'stroke-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]' : glowingWhite} />
            </MetricCard>
          </div>

          {/* CENTER COLUMN (Cols 4-9): STRATEGIC SONAR */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
            <div className="absolute top-0 left-0 w-full flex items-center justify-between px-4">
              <h2 className="text-[10px] tracking-[0.3em] font-bold text-tactical-teal/70 uppercase">
                Live Feed // Sector 7
              </h2>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[9px] tracking-widest text-red-500 uppercase">Realtime</span>
              </div>
            </div>

            {/* Make Radar Large */}
            <div className="w-full max-w-3xl transform scale-110">
              <StrategicSonar />
            </div>
          </div>

          {/* RIGHT COLUMN (Cols 10-12): MARKET & INTEL */}
          <div className="lg:col-span-3 flex flex-col gap-6 h-full">

            {/* 4. MARKET */}
            <MetricCard
              title="MARKET"
              value={`${predictionOdds}%`}
              subLabel="PREDICTION ODDS"
              icon={TrendingUp}
            >
              <Sparkline points={generateSpark()} color={glowingWhite} />
            </MetricCard>

            {/* INTEL FEED */}
            <div className="flex-1 w-full min-h-0">
              <IntelDebunker />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
