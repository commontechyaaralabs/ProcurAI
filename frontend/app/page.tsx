'use client';

import { useRouter } from 'next/navigation';
import { Building2, ShoppingBag, TrendingUp } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const roles = [
    {
      id: 'department-manager',
      title: 'Department Manager',
      description: 'Submit and track departmental purchase requests',
      icon: ShoppingBag,
      href: '/department-manager',
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'procurement-manager',
      title: 'Procurement Manager',
      description: 'Review requests, analyze vendors, manage sourcing workflow',
      icon: Building2,
      href: '/procurement-manager',
      color: 'from-[#005691] to-[#0066a3]',
    },
    {
      id: 'cfo',
      title: 'CFO / Procurement Head',
      description: 'Strategic oversight, budget health monitoring, vendor performance',
      icon: TrendingUp,
      href: '/cfo',
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DFE2E4]/30 to-[#DFE2E4]/50">
      {/* Bosch Header */}
      <header className="w-full bg-gradient-to-r from-[#31343A] via-[#2a2d33] to-[#31343A] border-b border-[#9DA5A8] sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white px-5 py-3 rounded-lg shadow-lg border border-[#DFE2E4]/50 hover:shadow-xl transition-all duration-300">
                <img 
                  src="/bosch_logo-removebg-preview.png" 
                  alt="Bosch Logo" 
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div className="h-10 w-px bg-[#9DA5A8]/50"></div>
              <div>
                <h1 className="text-xl font-bold text-white leading-tight">ProcurAI</h1>
                <p className="text-xs text-[#B6BBBE] mt-0.5">Enterprise Procurement Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-[#E00420]/10 border border-[#E00420]/30 rounded-lg">
                <span className="text-xs font-semibold text-[#E00420]">Powered by Bosch</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#31343A] mb-4">
            ProcurAI
          </h1>
          <p className="text-xl text-[#9DA5A8] mb-2">
            Enterprise Procurement Management Dashboard
          </p>
          <p className="text-sm text-[#9DA5A8]">
            Streamline procurement workflow from request intake → vendor selection → approval → PO release
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => router.push(role.href)}
                className={`bg-white rounded-xl border border-[#DFE2E4] p-8 hover:shadow-lg transition-all duration-300 hover:scale-105 text-left group ${role.color.includes('blue') ? 'hover:border-[#005691]' : ''}`}
              >
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-[#31343A] mb-3">{role.title}</h2>
                <p className="text-[#9DA5A8] mb-6">{role.description}</p>
                <div className="flex items-center text-[#005691] font-medium group-hover:translate-x-2 transition-transform">
                  <span>Access Dashboard</span>
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
