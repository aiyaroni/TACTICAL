export default function Sparkline({ points, color = "stroke-tactical-teal" }: { points: number[]; color?: string }) {
    const max = Math.max(...points, 1);
    const min = Math.min(...points, 0);
    const range = max - min || 1;
    const width = 100;
    const height = 30;

    const path = points
        .map((p, i) => {
            const x = (i / (points.length - 1)) * width;
            const y = height - ((p - min) / range) * height;
            return `${i === 0 ? "M" : "L"} ${x},${y}`;
        })
        .join(" ");

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
            <path d={path} fill="none" className={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
    );
}
