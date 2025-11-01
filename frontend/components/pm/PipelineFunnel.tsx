'use client';

type Stage = { name: string; count: number; };

export function PipelineFunnel({ stages }: { stages: Stage[] }) {
  const max = Math.max(...stages.map(s => s.count || 0), 1);
  return (
    <div className="bg-white rounded-lg border border-[#DFE2E4] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-[#31343A]">Procurement Pipeline</h3>
        <span className="text-xs text-[#9DA5A8]">Indent → PO → Delivered</span>
      </div>
      <div className="space-y-2">
        {stages.map((s, i) => {
          const width = Math.max(8, Math.round((s.count / max) * 100));
          const prev = stages[i - 1]?.count ?? s.count;
          const conv = prev ? Math.round((s.count / prev) * 100) : 100;
          const danger = conv < 60;
          return (
            <div key={s.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-[#31343A]">{s.name}</span>
                <span className={`text-xs ${danger ? 'text-[#E00420]' : 'text-[#9DA5A8]'}`}>
                  {s.count} {i > 0 && <>( {conv}% of prev )</>}
                </span>
              </div>
              <div className="w-full bg-[#DFE2E4] rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${danger ? 'bg-[#E00420]' : 'bg-[#005691]'}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}


