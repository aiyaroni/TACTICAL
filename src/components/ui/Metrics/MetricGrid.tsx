export default function MetricGrid() {
    const metrics = [
        { label: "CPU LOAD", value: "34%", status: "NORMAL" },
        { label: "MEM USAGE", value: "12GB", status: "STABLE" },
        { label: "NETWORK", value: "1.2GB/s", status: "ACTIVE" },
        { label: "THREATS", value: "0", status: "CLEAR" },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 w-full">
            {metrics.map((metric, i) => (
                <div key={i} className="clipped-corners flex flex-col justify-between border border-tactical-teal/20 bg-black/20 p-4 backdrop-blur-sm transition-colors hover:bg-tactical-teal/5">
                    <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-coyote-tan/70">{metric.label}</span>
                        <span className={`h-1.5 w-1.5 rounded-full ${metric.status === 'CLEAR' || metric.status === 'NORMAL' || metric.status === 'STABLE' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-tactical-teal">{metric.value}</div>
                    <div className="text-[10px] text-coyote-tan/50">{metric.status}</div>
                </div>
            ))}
        </div>
    );
}
