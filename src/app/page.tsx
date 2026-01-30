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

  // Local state for Market (Polymarket)
  const [marketData, setMarketData] = useState<{ prob: number; label: string } | null>(null);

  // Fetch OpenSky data
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

  // Fetch Polymarket Data
  useEffect(() => {
    const checkMarket = async () => {
      try {
        const res = await fetch('/api/tactical/market');
        const data = await res.json();
        if (data && data.probability !== undefined) {
          setMarketData({
            prob: data.probability,
            label: data.question || "REGIONAL CONFLICT ODDS"
          });
        }
      } catch (e) {
        console.error("Market fetch failed", e);
      }
    };
    checkMarket();
    // Poll every minute
    const interval = setInterval(checkMarket, 60000);
    return () => clearInterval(interval);
  }, []);

  // Generate sparkline data
  const generateSpark = () => Array.from({ length: 15 }, () => Math.floor(Math.random() * 50) + 20);

  // Glowing White Sparkline Style
  const glowingWhite = "stroke-white drop-shadow-[0_0_3px_rgba(255,255,255,0.8)]";

  // Determine Emergency Status
  const isEmergency = (marketData?.prob || 0) > 75 || Math.round(ewJamming) > 80;

  // Local state for Pentagon Analysis (Gemini)
  const [pizzaData, setPizzaData] = useState<{ score: number; justification: string } | null>(null);

  useEffect(() => {
    const checkPentagon = async () => {
      try {
        const res = await fetch('/api/tactical/pentagon');
        const data = await res.json();
        if (data) setPizzaData(data);
      } catch (e) {
        console.error("Pentagon AI failed", e);
      }
    };
    checkPentagon();
    const interval = setInterval(checkPentagon, 300000); // Check every 5 mins (Gemini)
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`h-screen w-screen flex flex-col bg-matte-black text-coyote-tan font-mono overflow-hidden selection:bg-tactical-teal/20 selection:text-white transition-all duration-1000 ${isEmergency ? 'shadow-[inset_0_0_100px_rgba(239,68,68,0.2)]' : ''}`}>

      {/* Emergency Overlay Border */}
      {isEmergency && <div className="absolute inset-0 z-50 pointer-events-none border-[12px] border-red-900/50 animate-pulse" />}

      {/* Critical Risk Text Overlay */}
      {isEmergency && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="bg-red-900/80 backdrop-blur text-white px-6 py-1 border-l-4 border-r-4 border-red-500 flex items-center gap-3 animate-pulse">
            <span className="h-2 w-2 bg-red-500 rounded-full animate-ping" />
            <span className="text-sm font-bold tracking-[0.3em] uppercase">CRITICAL RISK DETECTED // PROTOCOL ALPHA</span>
          </div>
        </div>
      )}

      <TacticalHeader isEmergency={isEmergency} />

      <main className="flex-1 p-6 relative h-[calc(100vh-80px)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

          {/* LEFT COLUMN (Cols 1-3): METRICS VERTICAL STACK */}
          <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-hidden">

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
              value={`${Math.round(ewJamming)}%`}
              subLabel="GPS INTERFERENCE"
              icon={Radio}
              className={isEmergency ? 'border-red-500/50 bg-red-900/10' : ''}
            >
              <Sparkline points={generateSpark()} color={glowingWhite} />
            </MetricCard>

            {/* 3. PENTAGON */}
            {(() => {
              // Pizza Meter Logic - AI Driven
              const score = pizzaData?.score || (pizzaIndex === "CRITICAL" ? 90 : (pizzaIndex === "HIGH" ? 60 : 20)); // Fallback to context or mock

              let pizzaStatus = "NORMAL";
              let pizzaColor = "text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]";
              let borderColor = "";

              if (score >= 80 || isEmergency) {
                pizzaStatus = "CRITICAL";
                pizzaColor = "text-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)]";
                borderColor = "border-red-500/50 bg-red-900/10";
              } else if (score >= 50) {
                pizzaStatus = "ELEVATED";
                pizzaColor = "text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]";
                borderColor = "border-amber-500/50 bg-amber-900/5";
              }

              return (
                <MetricCard
                  title="PENTAGON"
                  value={<span className={pizzaColor}>{pizzaStatus}</span>}
                  subLabel="PIZZA METER // ACTIVITY INDEX"
                  icon={Pizza}
                  className={borderColor}
                >
                  <div className="flex flex-col h-full justify-between">
                    <Sparkline points={generateSpark()} color={isEmergency ? 'stroke-red-500' : (pizzaStatus === 'ELEVATED' ? 'stroke-amber-500' : glowingWhite)} />

                    <div className="mt-2 relative overflow-hidden h-6 bg-white/5 rounded-sm border border-white/5">
                      <div className="text-[10px] text-coyote-tan/90 font-mono tracking-tight whitespace-nowrap animate-marquee flex items-center h-full px-2">
                           // INTELLIGENCE: {(pizzaData?.justification || "INITIALIZING TACTICAL DATA LINK... STANDBY...").toUpperCase()}
                      </div>
                    </div>

                  </div>
                </MetricCard>
              );
            })()}
          </div>

          {/* CENTER COLUMN (Cols 4-9): STRATEGIC SONAR */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
            <div className="absolute top-2 left-0 w-full flex items-center justify-between px-10 z-30 pointer-events-none">
              <h2 className="text-xs tracking-[0.4em] font-bold text-tactical-teal uppercase opacity-80 backdrop-blur-md">
                Live Feed // Sector 7
              </h2>
              <div className="flex items-center gap-2 backdrop-blur-md">
                <span className={`h-1.5 w-1.5 rounded-full animate-pulse shadow-[0_0_5px_red] ${isEmergency ? 'bg-white' : 'bg-red-500'}`} />
                <span className={`text-[10px] tracking-widest uppercase font-bold ${isEmergency ? 'text-white animate-pulse' : 'text-red-500'}`}>Realtime</span>
              </div>
            </div>

            {/* Make Radar Large */}
            <div className="w-full max-w-4xl transform scale-100 z-0">
              <StrategicSonar />
            </div>
          </div>

          {/* RIGHT COLUMN (Cols 10-12): MARKET & INTEL */}
          <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-hidden">

            {/* 4. MARKET */}
            <MetricCard
              title="LIVE CONFLICT ODDS (POLYMARKET)"
              value={`${Math.round(marketData?.prob || predictionOdds)}%`}
              subLabel={marketData?.label ? marketData.label.substring(0, 40) + (marketData.label.length > 40 ? "..." : "") : "REGIONAL CONFLICT ODDS"}
              icon={TrendingUp}
              className={marketData?.prob && marketData.prob > 75 ? 'border-red-500/60 bg-red-900/10' : ''}
            >
              <Sparkline points={generateSpark()} color={glowingWhite} />
            </MetricCard>

            {/* INTEL FEED */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <IntelDebunker />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
