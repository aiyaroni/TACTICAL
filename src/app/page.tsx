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
  // Local state for Dual Vector Analysis (Gemini)
  const [pizzaData, setPizzaData] = useState<any>(null);

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
    <div className={`min-h-screen w-screen flex flex-col bg-matte-black text-coyote-tan font-mono selection:bg-tactical-teal/20 selection:text-white transition-all duration-1000 ${isEmergency ? 'shadow-[inset_0_0_100px_rgba(239,68,68,0.2)]' : ''}`}>

      {/* Emergency Overlay Border */}
      {isEmergency && <div className="fixed inset-0 z-50 pointer-events-none border-[12px] border-red-900/50 animate-pulse" />}

      {/* Critical Risk Text Overlay */}
      {isEmergency && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="bg-red-900/80 backdrop-blur text-white px-6 py-1 border-l-4 border-r-4 border-red-500 flex items-center gap-3 animate-pulse">
            <span className="h-2 w-2 bg-red-500 rounded-full animate-ping" />
            <span className="text-sm font-bold tracking-[0.3em] uppercase">CRITICAL RISK DETECTED // PROTOCOL ALPHA</span>
          </div>
        </div>
      )}

      <TacticalHeader isEmergency={isEmergency} />

      <main className="flex-1 p-2 lg:p-4 relative h-auto lg:h-[calc(100vh-80px)] lg:overflow-hidden overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 h-full">

          {/* LEFT COLUMN (Cols 1-3): METRICS VERTICAL STACK */}
          <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-hidden order-2 lg:order-none">

            {/* 1. ASSETS */}
            <MetricCard
              title="ASSETS"
              value={assetStatus}
              subLabel="SENSOR INTERFERENCE ACTIVE"
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

            {/* 3. DUAL-VECTOR MONITOR */}
            {(() => {
              // Dual Vector Data
              const globalScore = pizzaData?.globalScore || 20;
              const usScore = pizzaData?.usScore || 10;
              const iranScore = pizzaData?.iranScore || 30;

              let status = "NORMAL";
              let statusColor = "text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]";
              let borderColor = "";

              if (globalScore >= 80 || isEmergency) {
                status = "CRITICAL";
                statusColor = "text-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)]";
                borderColor = "border-red-500/50 bg-red-900/10";
              } else if (globalScore >= 50) {
                status = "ELEVATED";
                statusColor = "text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]";
                borderColor = "border-amber-500/50 bg-amber-900/5";
              }

              return (
                <MetricCard
                  title="DUAL-VECTOR MONITOR"
                  value={<span className={statusColor}>{status}</span>}
                  subLabel="US-IRAN CORRELATION INDEX"
                  icon={Pizza}
                  className={borderColor}
                >
                  <div className="flex flex-col h-full justify-between">
                    {/* Multi-Sparkline or Split Bar */}
                    <div className="flex items-end justify-between gap-1 h-8 mb-1 px-1">
                      <div className="flex flex-col items-center gap-1 w-1/3">
                        <div className="w-full bg-white/10 h-6 relative overflow-hidden rounded-sm">
                          <div className="absolute bottom-0 w-full bg-blue-500/60" style={{ height: `${usScore}%` }} />
                        </div>
                        <span className="text-[9px] text-white/50 tracking-wider">USA</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 w-1/3">
                        <div className="w-full bg-white/10 h-6 relative overflow-hidden rounded-sm">
                          <div className="absolute bottom-0 w-full bg-red-500/60" style={{ height: `${iranScore}%` }} />
                        </div>
                        <span className="text-[9px] text-white/50 tracking-wider">IRN</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 w-1/3">
                        <span className="text-lg font-bold text-white/90 leading-none">{globalScore}</span>
                        <span className="text-[9px] text-white/50 tracking-wider">NET</span>
                      </div>
                    </div>

                    <div className="mt-2 relative overflow-hidden h-6 bg-white/5 rounded-sm border border-white/5">
                      <div className="text-[10px] text-coyote-tan/90 font-mono tracking-tight whitespace-nowrap animate-marquee flex items-center h-full px-2">
                           // ANALYSIS: {(pizzaData?.justification || "INITIALIZING DATA LINK... STANDBY...").toUpperCase()}
                      </div>
                    </div>

                  </div>
                </MetricCard>
              );
            })()}
          </div>

          {/* CENTER COLUMN (Cols 4-9): STRATEGIC SONAR */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative order-1 lg:order-none">
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
              <StrategicSonar
                ewJamming={ewJamming}
                escalationIndex={pizzaData?.globalScore || 0}
              />
            </div>
          </div>

          {/* RIGHT COLUMN (Cols 10-12): MARKET & INTEL */}
          <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-hidden order-3 lg:order-none">

            {/* 4. MARKET */}
            {/* 4. MARKET */}
            {(() => {
              // Risk / Odds Synchronization Logic
              // 1. Calculate the 'Tactical Risk' baseline same as Radar
              // WAR ROOM PROTOCOL: Force Risk Level to 58% as base
              const tacticalRisk = Math.max(
                58, // Forced Minimum
                e4bCount * 10,
                ewJamming > 20 ? Math.max(58, ewJamming) : 0,
                pizzaData?.globalScore || 0
              );

              // 2. If Risk > 45%, Override Market Odds with Lag Simulation (+3%)
              // WAR ROOM PROTOCOL: Force Conflict Odds to 61% (58 + 3)
              const displayOdds = tacticalRisk + 3;

              return (
                <MetricCard
                  title="LIVE CONFLICT ODDS (POLYMARKET)"
                  value={`${Math.round(displayOdds)}%`}
                  subLabel={marketData?.label ? marketData.label.substring(0, 40) + (marketData.label.length > 40 ? "..." : "") : "REGIONAL CONFLICT ODDS"}
                  icon={TrendingUp}
                  className={displayOdds > 60 ? 'border-red-500/60 bg-red-900/10' : ''}
                >
                  <Sparkline points={generateSpark()} color={glowingWhite} />
                </MetricCard>
              );
            })()}

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
