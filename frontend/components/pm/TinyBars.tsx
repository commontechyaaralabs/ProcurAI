'use client';

export function TinyBars({ values }: { values: number[] }) {
  if (!values || values.length === 0) {
    return (
      <div className="w-full h-10 flex items-center justify-center text-xs text-[#9DA5A8]">
        No data
      </div>
    );
  }
  const w = 140, h = 40, gap = 4;
  const n = Math.max(1, values.length);
  const barW = Math.max(6, (w - gap * (n + 1)) / n);

  return (
    <div className="w-full overflow-hidden">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="max-w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {values.map((v, i) => {
          const x = gap + i * (barW + gap);
          const barH = Math.max(2, (v / 100) * (h - 4));
          const y = h - barH;
          const fill = v >= 80 ? '#16a34a' : v >= 60 ? '#eab308' : '#E00420';
          return <rect key={i} x={x} y={y} width={barW} height={barH} rx={2} fill={fill} />;
        })}
      </svg>
    </div>
  );
}

