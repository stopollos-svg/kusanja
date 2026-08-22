import React from 'react';
import { 
  Compass, 
  HeartHandshake, 
  PlusCircle, 
  ShieldCheck, 
  Smartphone, 
  Wallet, 
  Zap 
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab?: 'explore' | 'start' | 'payouts' | 'gateway';
  onExplore: () => void;
  onStartCampaign: () => void;
  onOpenPayouts: () => void;
  onOpenGatewayInfo: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onExplore,
  onStartCampaign,
  onOpenPayouts,
  onOpenGatewayInfo,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.07)] px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-4 items-center justify-around text-center">
        
        {/* 1. Explore */}
        <button
          type="button"
          onClick={onExplore}
          className="flex flex-col items-center justify-center py-1 px-2 text-slate-700 hover:text-emerald-600 active:scale-95 transition-all cursor-pointer rounded-xl group"
        >
          <div className="p-1 rounded-full group-hover:bg-emerald-50 transition-colors">
            <Compass className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-[10px] font-bold text-slate-800 tracking-tight">
            Causes
          </span>
        </button>

        {/* 2. Start Fundraiser CTA (Primary center-left) */}
        <button
          type="button"
          onClick={onStartCampaign}
          className="flex flex-col items-center justify-center py-1 px-2 text-emerald-700 hover:text-emerald-800 active:scale-95 transition-all cursor-pointer rounded-xl group"
        >
          <div className="w-9 h-9 -mt-3.5 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/30 border-2 border-white group-hover:bg-emerald-700 transition-colors">
            <PlusCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-black text-emerald-700 tracking-tight mt-0.5">
            + Start
          </span>
        </button>

        {/* 3. MoMo & Visa Info */}
        <button
          type="button"
          onClick={onOpenGatewayInfo}
          className="flex flex-col items-center justify-center py-1 px-2 text-slate-700 hover:text-emerald-600 active:scale-95 transition-all cursor-pointer rounded-xl group"
        >
          <div className="p-1 rounded-full group-hover:bg-emerald-50 transition-colors">
            <Smartphone className="w-5 h-5 text-yellow-600" />
          </div>
          <span className="text-[10px] font-bold text-slate-800 tracking-tight">
            MoMo Info
          </span>
        </button>

        {/* 4. Disbursements */}
        <button
          type="button"
          onClick={onOpenPayouts}
          className="flex flex-col items-center justify-center py-1 px-2 text-slate-700 hover:text-emerald-600 active:scale-95 transition-all cursor-pointer rounded-xl group"
        >
          <div className="p-1 rounded-full group-hover:bg-emerald-50 transition-colors">
            <Wallet className="w-5 h-5 text-slate-700" />
          </div>
          <span className="text-[10px] font-bold text-slate-800 tracking-tight">
            Payouts
          </span>
        </button>

      </div>
    </div>
  );
};
