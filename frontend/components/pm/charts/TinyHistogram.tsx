'use client';

export function TinyHistogram({ buckets, counts }: { buckets: string[]; counts: number[]; }) {
  const w = 220, h = 60, gap = 6;
  const n = counts.length;
  const max = Math.max(...counts, 1);
  const barW = Math.max(8, (w - gap * (n + 1)) / n);
  return (
    <div className="flex items-end gap-1">
      <svg width={w} height={h}>
        {counts.map((c, i) => {
          const x = gap + i * (barW + gap);
          const barH = Math.max(2, (c / max) * (h - 12));
          const y = h - barH - 12;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} rx={2} fill="#005691" />
              <text x={x + barW / 2} y={h - 2} textAnchor="middle" fontSize="10" fill="#6b7280">{buckets[i]}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

