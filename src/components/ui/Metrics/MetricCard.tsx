import { ReactNode } from "react";
import { clsx } from "clsx";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
    title: string;
    value?: string | number | ReactNode;
    subLabel?: string;
    icon?: LucideIcon;
    trendData?: number[]; // For Sparkline
    statusColor?: "coyote-tan" | "red" | "emerald";
    children?: ReactNode; // Sparkline or other visual
    className?: string;
    noWrapper?: boolean;
}

export default function MetricCard({ title, value, subLabel, icon: Icon, children, className, noWrapper }: MetricCardProps) {
    return (
        <div className={clsx("relative tactical-clip border border-white/10 bg-matte-black p-4 transition-all hover:bg-white/5", className)}>

            {/* Top Row: Icon + Category */}
            <div className="flex items-center justify-between mb-4">
                {Icon && <Icon className="h-5 w-5 scale-110 text-coyote-tan/50" />}
                <span className="font-mono text-[10px] tracking-[0.2em] text-coyote-tan/40 uppercase">{title}</span>
            </div>

            {/* Middle Section: Value */}
            {value && (
                <div className="mb-4">
                    <div className="text-3xl font-bold tracking-tight text-coyote-tan">{value}</div>
                </div>
            )}

            {/* Content Area (Sparkline or Custom) */}
            {children && (
                noWrapper ? (
                    <div className="flex-1 min-h-0 flex flex-col">{children}</div>
                ) : (
                    <div className="h-8 w-full mb-3 opacity-80 mix-blend-screen overflow-hidden">
                        {children}
                    </div>
                )
            )}

            {/* Bottom Label */}
            {subLabel && (
                <div className="border-t border-white/5 pt-2 text-center mt-auto">
                    <div className="font-mono text-xs tracking-widest text-coyote-tan/90 uppercase">{subLabel}</div>
                </div>
            )}

            {/* Corner Decorators */}
            <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-coyote-tan/30" />
        </div>
    );
}
