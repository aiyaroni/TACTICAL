import { ReactNode } from "react";
import { clsx } from "clsx";

interface MetricCardProps {
    title: string;
    children: ReactNode;
    alert?: boolean;
    className?: string;
}

export default function MetricCard({ title, children, alert = false, className }: MetricCardProps) {
    return (
        <div className={clsx("relative tactical-clip border bg-black/40 p-4 backdrop-blur-sm transition-all",
            alert ? "border-red-500/50 bg-red-900/10" : "border-tactical-teal/20 hover:bg-tactical-teal/5 hover:border-tactical-teal/40",
            className
        )}>
            <div className="mb-2 flex items-center justify-between border-b border-tactical-teal/10 pb-1">
                <h3 className="font-mono text-xs font-bold tracking-wider text-coyote-tan/80">{title}</h3>
                {alert && <span className="animate-pulse h-1.5 w-1.5 rounded-full bg-red-500" />}
            </div>
            {children}
        </div>
    );
}
