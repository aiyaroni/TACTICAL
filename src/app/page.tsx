"use client";

import TacticalHeader from "@/components/layout/TacticalHeader";
import MetricGrid from "@/components/ui/Metrics/MetricGrid";
import StrategicSonar from "@/components/ui/Radar/StrategicSonar";
import IntelDebunker from "@/components/ui/Intel/IntelDebunker";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-matte-black text-coyote-tan font-mono overflow-x-hidden">
      <TacticalHeader />

      <main className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col gap-8">

        {/* Top Row: Metrics */}
        <section>
          <MetricGrid />
        </section>

        {/* Main Content: Split Radar & Intel */}
        <section className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto w-full">

          {/* Left: Radar */}
          <div className="lg:col-span-8 w-full flex flex-col gap-2">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-[10px] tracking-[0.2em] font-bold text-tactical-teal/70">
                LIVE FEED // SECTOR 7
              </h2>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[9px] tracking-widest text-red-500">REALTIME</span>
              </div>
            </div>
            <StrategicSonar />
          </div>

          {/* Right: Intel Feed */}
          <div className="lg:col-span-4 w-full h-full min-h-[400px]">
            <IntelDebunker />
          </div>

        </section>
      </main>
    </div>
  );
}
