import React from 'react';
import { Heart, PlusCircle, Search, ShieldCheck, Smartphone, Wallet } from 'lucide-react';

interface NavbarProps {
  onStartCampaign: () => void;
  onOpenPayouts: () => void;
  onOpenGatewayInfo: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onStartCampaign,
  onOpenPayouts,
  onOpenGatewayInfo,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                GATEWAY LIVE
              </span>
            </div>
            <span className="text-slate-300 text-xs">Real-time MTN MoMo (*165#) & Airtel Money (*185#) Uganda Rails</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={onOpenGatewayInfo}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer text-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>0% Platform Fee for Medical & Disaster Relief</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-600/20">
              <div className="w-5 h-5 border-2 border-white rounded-md flex items-center justify-center text-white">
                <Heart className="w-3 h-3 fill-white text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  Kusanya<span className="text-emerald-600">.org</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                  UGX MoMo
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Uganda's Crowdfunding, Church & SACCO Giving Hub
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by cause, district (e.g. Gulu, Kampala), or organizer..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenGatewayInfo}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>How MoMo Works</span>
            </button>

            <button
              onClick={onOpenPayouts}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Organizer Mobile Money Payouts"
            >
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Organizer</span>
              <span>Disbursement</span>
            </button>

            <button
              onClick={onStartCampaign}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-full text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start a Fundraiser</span>
            </button>
          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3 pt-1">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search campaigns or districts..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:border-emerald-600 focus:outline-none transition-all placeholder:text-slate-400 text-slate-900"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
