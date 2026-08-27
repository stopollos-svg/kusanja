import { FC } from 'react';
import { 
  Flame, 
  MessageSquare, 
  PlusCircle, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Wallet,
  Zap
} from 'lucide-react';
import { KusanyaBrandLogo } from './KusanyaBrandLogo';
import { AdminUser } from '../types';

interface NavbarProps {
  onStartCampaign: () => void;
  onOpenPayouts: () => void;
  onOpenGatewayInfo: () => void;
  onOpenAdmin: () => void;
  onOpenUpdatesFeed: () => void;
  adminUser: AdminUser | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isUrgentOnly?: boolean;
  onToggleUrgentOnly?: () => void;
  urgentCount?: number;
  totalUpdatesCount?: number;
}

export const Navbar: FC<NavbarProps> = ({
  onStartCampaign,
  onOpenPayouts,
  onOpenGatewayInfo,
  onOpenAdmin,
  onOpenUpdatesFeed,
  adminUser,
  searchQuery,
  onSearchChange,
  isUrgentOnly = false,
  onToggleUrgentOnly,
  urgentCount = 0,
  totalUpdatesCount = 0,
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
            <span className="text-slate-300 text-xs hidden sm:inline">Real-time MTN MoMo (*165#) & Airtel Money (*185#) Uganda Rails</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-slate-400">
            <button
              onClick={onOpenUpdatesFeed}
              className="text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Community Posts</span>
              {totalUpdatesCount > 0 && (
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {totalUpdatesCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenGatewayInfo}
              className="hover:text-emerald-400 transition-colors hidden md:flex items-center gap-1 cursor-pointer text-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Deductions • 100% Direct to Cause</span>
            </button>

            <button
              onClick={onOpenAdmin}
              className="text-amber-400 hover:text-amber-300 font-bold transition-colors flex items-center gap-1 cursor-pointer text-xs bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30"
            >
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span>{adminUser ? `Admin: ${adminUser.email.split('@')[0]}` : 'Admin Backend'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand with Official Kusanya Emblem */}
          <div 
            className="cursor-pointer select-none shrink-0" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <KusanyaBrandLogo size="md" />
          </div>

          {/* Search Bar & Urgency Filter Toggle */}
          <div className="hidden md:flex items-center flex-1 max-w-lg mx-3 gap-2">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by cause, district (e.g. Gulu, Kampala), or organizer..."
                className="w-full pl-9 pr-14 py-2 text-xs bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Urgency Filter Quick Button */}
            {onToggleUrgentOnly && (
              <button
                type="button"
                onClick={onToggleUrgentOnly}
                className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border shrink-0 ${
                  isUrgentOnly
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm animate-pulse'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200/80'
                }`}
                title="Filter campaigns ending in <48h or reaching target goal"
              >
                <Flame className={`w-3.5 h-3.5 ${isUrgentOnly ? 'text-white' : 'text-rose-600'}`} />
                <span>Urgent</span>
                {urgentCount > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isUrgentOnly ? 'bg-white text-rose-700' : 'bg-rose-200 text-rose-900'
                  }`}>
                    {urgentCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Updates Pill */}
            <button
              onClick={onOpenUpdatesFeed}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition-colors cursor-pointer"
              title="View all updates and receipts from Ugandan fundraisers"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Updates</span>
              {totalUpdatesCount > 0 && (
                <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {totalUpdatesCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenPayouts}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Organizer Mobile Money Payouts"
            >
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Payouts</span>
            </button>

            <button
              onClick={onStartCampaign}
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 bg-emerald-600 text-white rounded-full text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Start Fundraiser</span>
            </button>
          </div>

        </div>

        {/* Mobile Search Bar & Urgency Toggle */}
        <div className="md:hidden pb-3 pt-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search causes, districts..."
              className="w-full pl-8 pr-12 py-2 text-xs bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:border-emerald-600 focus:outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 bg-slate-200 hover:bg-slate-300 px-1.5 py-0.5 rounded cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {onToggleUrgentOnly && (
            <button
              type="button"
              onClick={onToggleUrgentOnly}
              className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border shrink-0 ${
                isUrgentOnly
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Urgent</span>
              {urgentCount > 0 && (
                <span className={`text-[9px] px-1 py-0.2 rounded-full font-black ${
                  isUrgentOnly ? 'bg-white text-rose-700' : 'bg-rose-200 text-rose-900'
                }`}>
                  {urgentCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
