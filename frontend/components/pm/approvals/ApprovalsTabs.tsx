'use client';

interface ApprovalsTabsProps {
  tab: 'INDENT' | 'QUOTE' | 'PO';
  setTab: (t: 'INDENT' | 'QUOTE' | 'PO') => void;
}

export function ApprovalsTabs({ tab, setTab }: ApprovalsTabsProps) {
  const items: Array<{ key: 'INDENT' | 'QUOTE' | 'PO', label: string }> = [
    { key: 'INDENT', label: 'Indents' },
    { key: 'QUOTE', label: 'Quotes' },
    { key: 'PO', label: 'POs' },
  ];

  return (
    <div className="border-b border-[#DFE2E4] flex gap-4">
      {items.map(({ key, label }) => (
        <button
          key={key}
          className={`py-2 px-3 text-sm font-medium transition-colors ${
            tab === key
              ? 'border-b-2 border-[#005691] text-[#005691]'
              : 'text-[#9DA5A8] hover:text-[#31343A]'
          }`}
          onClick={() => setTab(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

