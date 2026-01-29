"use client";

import TacticalHeader from "@/components/layout/TacticalHeader";
import MetricCard from "@/components/ui/Metrics/MetricCard";
import Sparkline from "@/components/ui/Metrics/Sparkline";
import StrategicSonar from "@/components/ui/Radar/StrategicSonar";
import IntelDebunker from "@/components/ui/Intel/IntelDebunker";
import { useTacticalData } from "@/hooks/useTacticalData";
import { Plane, Radio, TrendingUp, AlertTriangle } from "lucide-react";

export default function Home() {
  const data = useTacticalData(true);

  // Generate historical data array for sparklines (mock)
  const sparkData = Array.from({ length: 15 }, () => Math.random() * 100);

  return (
    <div className="min-h-screen flex flex-col bg-matte-black text-coyote-tan font-mono overflow-x-hidden">
      <TacticalHeader />

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 lg:grid-cols-12 auto-rows-min md:h-[calc(100vh-140px)]">

          {/* Left Panel: Metrics (Cols 1-3) */}
          <section className="flex flex-col gap-4 lg:col-span-3 h-full overflow-y-auto scrollbar-hide">

            {/* Strategic Assets */}
            <MetricCard title="STRATEGIC ASSETS">
              <div className="space-y-3">
                {data.strategicAssets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between text-xs border-b border-white/5 pb-2 last:border-0">
                    <div className="flex items-center gap-2">
                      <Plane className={asset.status === 'AIRBORNE' ? "h-3 w-3 text-emerald-400" : "h-3 w-3 text-gray-500"} />
                      <span className="text-tactical-teal">{asset.callsign}</span>
                    </div>
                    <span className={asset.status === 'AIRBORNE' ? "text-emerald-400 font-bold" : "text-gray-500"}>
                      {asset.status}
                    </span>
                  </div>
                ))}
              </div>
            </MetricCard>

            {/* Electronic Warfare */}
            <MetricCard title="EW JAMMING INDEX" alert={data.ewJamming > 75}>
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-bold text-white">{Math.round(data.ewJamming)}%</span>
                <Radio className="h-4 w-4 text-tactical-teal mb-1" />
              </div>
              <div className="h-10 w-full mb-2">
                <Sparkline points={[...sparkData, data.ewJamming]} color={data.ewJamming > 75 ? "stroke-red-500" : "stroke-tactical-teal"} />
              </div>
              <p className="text-[10px] text-gray-400">GPS INTERFERENCE DETECTED</p>
            </MetricCard>

            {/* Pizza Index */}
            <MetricCard title="PENTAGON ACTIVITY" alert={data.pizzaIndex === 'CRITICAL'}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`h-3 w-3 rounded-full ${data.pizzaIndex === 'CRITICAL' ? 'bg-red-600 animate-ping' : data.pizzaIndex === 'HIGH' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <span className="text-xl font-bold text-white">{data.pizzaIndex}</span>
              </div>
              <p className="text-[10px] text-gray-400">LOCAL DELIVERY VOL: {data.pizzaIndex === 'CRITICAL' ? '+450%' : '+12%'}</p>
            </MetricCard>

          </section>

          {/* Centerpiece: Radar (Cols 4-9) */}
          <section className="flex flex-col justify-center lg:col-span-6 h-full min-h-[50vh]">
            <div className="relative w-full h-full flex flex-col">
              <div className="flex items-center justify-between mb-2 px-2">
                <h2 className="text-tactical-teal text-sm font-bold tracking-widest">
                  LIVE FEED // SECTOR 7
                </h2>
                <div className="flex gap-2">
                  <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-red-500">REALTIME</span>
                </div>
              </div>
              <div className="flex-1 flex items-center">
                <StrategicSonar />
              </div>
            </div>
          </section>

          {/* Right Panel: Debunker & Predictions (Cols 10-12) */}
          <section className="flex flex-col gap-4 lg:col-span-3 h-full overflow-y-auto scrollbar-hide">

            {/* Prediction Odds */}
            <MetricCard title="CONFLICT ODDS">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold text-white">{Math.round(data.predictionOdds)}%</span>
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${data.predictionOdds}%` }} />
              </div>
              <p className="text-[10px] text-gray-400 mt-2">POLYMARKET AGGREGATE</p>
            </MetricCard>

            {/* Intel Debunker */}
            <div className="flex-1 min-h-[300px]">
              <IntelDebunker />
            </div>

          </section>

        </div>
      </main>
    </div>
  );
}
