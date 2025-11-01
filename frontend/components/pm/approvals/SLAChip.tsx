'use client';

interface SLAChipProps {
  slaTargetHours: number;
  slaElapsedHours?: number;
  size?: 'sm' | 'md';
}

export function SLAChip({ slaTargetHours, slaElapsedHours = 0, size = 'md' }: SLAChipProps) {
  const remainingHours = slaTargetHours - slaElapsedHours;
  const isBreached = remainingHours < 0;
  const isDueToday = remainingHours <= 8 && remainingHours > 0;
  const isUrgent = remainingHours <= 24 && remainingHours > 8;

  const getColor = () => {
    if (isBreached) return 'bg-[#E00420]/10 text-[#E00420] border-[#E00420]/30';
    if (isDueToday) return 'bg-orange-100 text-orange-700 border-orange-300';
    if (isUrgent) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-green-100 text-green-700 border-green-300';
  };

  const getText = () => {
    if (isBreached) return `Breached (${Math.abs(remainingHours)}h)`;
    if (isDueToday) return `Due (${remainingHours}h)`;
    if (isUrgent) return `${remainingHours}h left`;
    return `${remainingHours}h left`;
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${getColor()} ${sizeClasses}`}>
      {getText()}
    </span>
  );
}

