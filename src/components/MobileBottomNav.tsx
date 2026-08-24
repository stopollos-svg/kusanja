import { FC } from 'react';
import { 
  Compass, 
  MessageSquare, 
  PlusCircle, 
  Smartphone, 
  Wallet
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab?: 'explore' | 'updates' | 'start' | 'payouts' | 'gateway';
  onExplore: () => void;
  onOpenUpdates: () => void;
  onStartCampaign: () => void;
  onOpenPayouts: () => void;
  onOpenGatewayInfo: () => void;
  updatesCount?: number;
}

export const MobileBottomNav: FC<MobileBottomNavProps> = ({
  activeTab = 'explore',
  onExplore,
  onOpenUpdates,
  onStartCampaign,
  onOpenPayouts,
  onOpenGatewayInfo,
  updatesCount = 0,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.07)] px-1.5 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-5 items-center justify-around text-center">
        
        {/* 1. Explore */}
        <button
          type="button"
          onClick={onExplore}
          className={`flex flex-col items-center justify-center py-1 px-1 transition-all cursor-pointer rounded-xl group ${
            activeTab === 'explore' ? 'text-emerald-700' : 'text-slate-600 hover:text-emerald-600'
          }`}
        >
          <div className="p-1 rounded-full group-hover:bg-emerald-50 transition-colors">
            <Compass className={`w-5 h-5 ${activeTab === 'explore' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`} />
          </div>
          <span className="text-[10px] font-bold tracking-tight">
            Causes
          </span>
        </button>

        {/* 2. Global Updates Feed */}
        <button
          type="button"
          onClick={onOpenUpdates}
          className={`flex flex-col items-center justify-center py-1 px-1 relative transition-all cursor-pointer rounded-xl group ${
            activeTab === 'updates' ? 'text-emerald-700' : 'text-slate-600 hover:text-emerald-600'
          }`}
        >
          <div className="p-1 rounded-full group-hover:bg-emerald-50 transition-colors relative">
            <MessageSquare className={`w-5 h-5 ${activeTab === 'updates' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`} />
            {updatesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white font-extrabold text-[8px] w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-2xs animate-pulse">
                {updatesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight">
            Posts
          </span>
        </button>

        {/* 3. Start Fundraiser CTA (Center) */}
        <button
          type="button"
          onClick={onStartCampaign}
          className="flex flex-col items-center justify-center py-1 px-1 text-emerald-700 hover:text-emerald-800 active:scale-95 transition-all cursor-pointer rounded-xl group"
        >
          <div className="w-9 h-9 -mt-3.5 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/30 border-2 border-white group-hover:bg-emerald-700 transition-colors">
            <PlusCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-black text-emerald-700 tracking-tight mt-0.5">
            + Start
          </span>
        </button>

        {/* 4. MoMo Info */}
        <button
          type="button"
          onClick={onOpenGatewayInfo}
          className="flex flex-col items-center justify-center py-1 px-1 text-slate-600 hover:text-emerald-600 active:scale-95 transition-all cursor-pointer rounded-xl group"
        >
          <div className="p-1 rounded-full group-hover:bg-emerald-50 transition-colors">
            <Smartphone className="w-5 h-5 text-yellow-600" />
          </div>
          <span className="text-[10px] font-bold tracking-tight">
            MoMo
          </span>
        </button>

        {/* 5. Payouts */}
        <button
          type="button"
          onClick={onOpenPayouts}
          className="flex flex-col items-center justify-center py-1 px-1 text-slate-600 hover:text-emerald-600 active:scale-95 transition-all cursor-pointer rounded-xl group"
        >
          <div className="p-1 rounded-full group-hover:bg-emerald-50 transition-colors">
            <Wallet className="w-5 h-5 text-slate-600" />
          </div>
          <span className="text-[10px] font-bold tracking-tight">
            Payouts
          </span>
        </button>

      </div>
    </div>
  );
};
