"use client";

import { useEffect, useState } from "react";
import TacticalHeader from "@/components/layout/TacticalHeader";
import MetricCard from "@/components/ui/Metrics/MetricCard";
import Sparkline from "@/components/ui/Metrics/Sparkline";
import StrategicSonar from "@/components/ui/Radar/StrategicSonar";
import IntelDebunker from "@/components/ui/Intel/IntelDebunker";
import { useTacticalData } from "@/hooks/useTacticalData";
import { Plane, Radio, Pizza, TrendingUp, Activity } from "lucide-react";

export default function Home() {
  const { ewJamming, pizzaIndex, predictionOdds } = useTacticalData(true);

  // Local state for Assets (OpenSky)
  const [assetStatus, setAssetStatus] = useState<"STANDBY" | "ACTIVE">("STANDBY");
  const [e4bCount, setE4bCount] = useState(0);
  const [blips, setBlips] = useState<any[]>([]); // Data for Radar

  // Local state for Market (Polymarket)
  const [marketData, setMarketData] = useState<{ prob: number; label: string } | null>(null);

  // Fetch OpenSky data
  useEffect(() => {
    const checkAssets = async () => {
      try {
        const res = await fetch('/api/tactical/living-sky');
        const data = await res.json();
        if (data.states && Array.isArray(data.states)) {

          // TARGET DEFINITIONS (Shared with backend but good to check here)
          const MILITARY_ICAOS = ['adfeb3', 'adfeb4', 'adfeb5', 'adfeb6', 'ae01d2', 'ae04d7', '154078', '738011', '738012', '738031'];

          // Filter & Map
          const militaryAssets = data.states.filter((s: any) => MILITARY_ICAOS.includes(s.icao24));
          const civilAssets = data.states.filter((s: any) => !MILITARY_ICAOS.includes(s.icao24));

          const newBlips = data.states.map((state: any) => {
            const isMil = MILITARY_ICAOS.includes(state.icao24);
            return {
              id: state.icao24,
              icao24: state.icao24,
              callsign: state.callsign,
              x: (state.longitude % 10) * 5,
              y: (state.latitude % 10) * 5,
              lastContact: state.last_contact,
              type: isMil ? 'MILITARY' : 'CIVIL'
            };
          });

          setBlips(newBlips);
          setE4bCount(militaryAssets.length);

          if (newBlips.length > 0) {
            setAssetStatus("ACTIVE");
          } else {
            setAssetStatus("STANDBY");
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
  const isEmergency = (marketData?.prob || 0) > 85;

  // Local state for Pentagon Analysis
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
    const interval = setInterval(checkPentagon, 300000); // Check every 5 mins
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

          {/* LEFT COLUMN (Cols 1-3): LIVE SIGNALS TELEMETRY */}
          <div className="lg:col-span-3 flex flex-col h-full bg-white/5 border border-white/10 overflow-hidden relative order-2 lg:order-none">

            {/* Header */}
            <div className="h-10 border-b border-white/10 flex items-center px-4 bg-white/5 backdrop-blur-md">
              <Activity className="h-4 w-4 mr-3 text-tactical-teal" />
              <h2 className="text-[10px] font-bold tracking-[0.2em] text-white/80">LIVE SIGNAL TELEMETRY</h2>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[8px] text-emerald-500 animate-pulse">MONITORING</span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>

            {/* Signal List */}
            <div className="flex-1 overflow-y-scroll p-2 space-y-1 scrollbar-hide">

              {/* 1. CIVIL AVIATION */}
              <div className="p-3 border border-white/5 bg-black/20 hover:bg-white/5 transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] text-coyote-tan/60 tracking-wider">CIVIL AVIATION</span>
                  <span className="text-[9px] text-emerald-500 font-bold bg-emerald-900/20 px-1.5 py-0.5 rounded-sm">
                    {(blips.length - e4bCount) > 0 ? 'ACTIVE' : 'LINK DOWN'}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-white/90">
                      {(blips.length - e4bCount) > 0 ? (blips.length - e4bCount) : 0}
                    </span>
                    <span className="text-[8px] text-white/40">AIRFRAMES DETECTED</span>
                  </div>
                  <div className="w-16 h-8 opacity-50">
                    <Sparkline points={generateSpark()} color="stroke-tactical-teal" />
                  </div>
                </div>
              </div>

              {/* 2. STRATEGIC TANKERS */}
              <div className="p-3 border border-white/5 bg-black/20 hover:bg-white/5 transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] text-coyote-tan/60 tracking-wider">STRAT TANKERS (KC-135)</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${e4bCount > 0 ? 'text-red-500 bg-red-900/20' : 'text-emerald-500 bg-emerald-900/20'}`}>
                    {e4bCount > 0 ? 'ACTIVE' : 'IDLE'}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex flex-col">
                    <span className={`text-2xl font-bold ${e4bCount > 0 ? 'text-red-500' : 'text-white/50'}`}>{e4bCount}</span>
                    <span className="text-[8px] text-white/40">HIGH PRIORITY TARGETS</span>
                  </div>
                  <div className="w-16 h-8 opacity-50">
                    <Sparkline points={generateSpark()} color={e4bCount > 0 ? "stroke-red-500" : "stroke-white/30"} />
                  </div>
                </div>
              </div>

              {/* 3. PENTAGON LOGISTICS (PIZZA) */}
              <div className="p-3 border-t border-white/10 mt-2 pt-4 group">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-coyote-tan/60 tracking-wider">PENTAGON LOGISTICS</span>
                  <span className="text-[9px] text-coyote-tan">{Math.round(pizzaData?.usScore || 10)}% LOAD</span>
                </div>
                {/* Horizontal Bar */}
                <div className="w-full h-2 bg-white/10 rounded-sm overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${(pizzaData?.usScore || 10) > 75 ? 'bg-red-500' : 'bg-tactical-teal'}`}
                    style={{ width: `${pizzaData?.usScore || 10}%` }}
                  />
                </div>
                <p className="text-[8px] text-white/30 mt-1 uppercase tracking-tight truncate">
                  Vol: {pizzaData?.justification || "NORMAL OPERATION"}
                </p>
              </div>

              {/* 4. MARKET ODDS */}
              <div className="p-3 border-t border-white/10 group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] text-coyote-tan/60 tracking-wider">CONFLICT MARKET</span>
                  <span className="text-[9px] text-white/50">POLYMARKET</span>
                </div>
                <div className="flex items-end justify-between">
                  {/* UNIFIED MONITOR LOGIC: Odds spike Only if metrics justify it */}
                  {(() => {
                    let baseOdds = marketData?.prob || 24;
                    const pizzaCritical = (pizzaData?.usScore || 0) > 70;
                    const militaryActive = e4bCount > 0;

                    if (!pizzaCritical && !militaryActive) {
                      // Clamp to normal range if indicators are safe
                      baseOdds = Math.min(baseOdds, 58);
                    }

                    return (
                      <span className="text-xl font-bold text-white/90">
                        {marketData ? `${Math.round(baseOdds)}%` : 'N/A'}
                      </span>
                    );
                  })()}

                  <div className="w-20 h-6 opacity-50">
                    <Sparkline points={generateSpark()} color="stroke-amber-500" />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* CENTER COLUMN (Cols 4-9): SEMI-CIRCLE RADAR */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative order-first lg:order-none">

            {/* Radar Header */}
            <div className="absolute top-4 left-0 w-full flex items-center justify-between px-10 z-30 pointer-events-none">
              <h2 className="text-xs tracking-[0.4em] font-bold text-tactical-teal uppercase opacity-80 backdrop-blur-md">
                Live Feed // Sector 7
              </h2>
            </div>

            <div className="w-full max-w-2xl transform scale-110 z-0 mt-10 lg:mt-0">
              {(() => {
                // STABILIZED STRATEGIC MONITOR RISK LOGIC

                // Baseline Risk (Quiet/Normal)
                let cRisk = 11;

                // Weights
                const tankerRisk = e4bCount * 20; // High weight for tankers
                const jamRisk = ewJamming > 25 ? (ewJamming - 25) / 2 : 0;
                const pizzaRisk = ((pizzaData?.usScore || 10) > 50) ? ((pizzaData?.usScore || 10) - 50) / 2 : 0;

                // Market Influence (Dynamic Sync)
                // If market > 45%, add to risk. If < 45%, reduce risk (stabilize).
                const marketProb = marketData?.prob || 45;
                const marketFactor = (marketProb - 45) / 2; // e.g. 55% -> +5 Risk. 13% -> -16 Risk.

                cRisk += tankerRisk;
                cRisk += jamRisk;
                cRisk += pizzaRisk;
                cRisk += marketFactor;

                // DATA INTEGRITY OVERRIDE:
                // If Civil Aviation is high (e.g. > 50) and Tankers are 0, Risk is LOW (Keep near baseline).
                // "Civil Count" is blips.length - e4bCount.
                const civilCount = blips.length - e4bCount;

                if (civilCount > 50 && e4bCount === 0) {
                  // Dampen jamming/market noise if civil traffic is flowing freely
                  cRisk = Math.min(cRisk, 19);
                }

                // Cap boundaries
                cRisk = Math.min(100, Math.max(0, cRisk));

                return (
                  <StrategicSonar
                    riskLevel={cRisk.toFixed(0)}
                    ewJamming={ewJamming}
                    blips={blips}
                  />
                );
              })()}
            </div>
          </div>

          {/* RIGHT COLUMN (Cols 10-12): INTEL FEED */}
          <div className="lg:col-span-3 flex flex-col h-full overflow-hidden order-3 lg:order-none">
            <IntelDebunker />
          </div>

        </div>
      </main>
    </div>
}
