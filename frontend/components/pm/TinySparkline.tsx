'use client';

export function TinySparkline({ data }: { data: number[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-10 flex items-center justify-center text-xs text-[#9DA5A8]">
        No data
      </div>
    );
  }
  const max = Math.max(...data, 1);
  const w = 140, h = 40, pad = 4;
  const step = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;

  const pts = data.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - (v / max) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full overflow-hidden">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="max-w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <polyline fill="none" stroke="#005691" strokeWidth="2" points={pts} />
      </svg>
    </div>
  );
}

