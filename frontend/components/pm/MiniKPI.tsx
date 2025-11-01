export function MiniKPI({ label, value, hint }: { label: string; value: string | number; hint?: string; }) {
  return (
    <div className="border border-[#DFE2E4] rounded-lg p-3">
      <div className="text-xs text-[#9DA5A8]">{label}</div>
      <div className="text-lg font-semibold text-[#31343A]">{value}</div>
      {hint && <div className="text-[11px] text-[#9DA5A8] mt-0.5">{hint}</div>}
    </div>
  );
}


