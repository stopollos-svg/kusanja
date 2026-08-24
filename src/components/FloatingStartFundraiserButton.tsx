import React from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { KusanyaEmblem } from './KusanyaBrandLogo';

interface FloatingStartFundraiserButtonProps {
  onClick: () => void;
}

export const FloatingStartFundraiserButton: React.FC<FloatingStartFundraiserButtonProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 sm:right-6 lg:right-8 z-40 group pointer-events-auto">
      <button
        type="button"
        onClick={onClick}
        className="relative flex items-center gap-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white pl-3.5 pr-4.5 py-3 rounded-full shadow-[0_10px_25px_-5px_rgba(5,150,105,0.4),0_8px_10px_-6px_rgba(5,150,105,0.2)] hover:shadow-[0_15px_30px_-5px_rgba(5,150,105,0.5),0_10px_15px_-5px_rgba(5,150,105,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 cursor-pointer border border-emerald-400/40"
        title="Start a new fundraiser in Uganda"
        aria-label="Start a fundraiser on Kusanya"
      >
        {/* Subtle Pulse Glow */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500/25 blur-sm group-hover:bg-emerald-400/40 transition-all pointer-events-none -z-10 animate-pulse" />

        {/* Kusanya Emblem / Plus icon container */}
        <div className="relative w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
          <KusanyaEmblem sizeClassName="w-5 h-5" />
        </div>

        {/* Text Details */}
        <div className="text-left flex flex-col">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className="text-xs sm:text-sm font-black tracking-tight text-white drop-shadow-2xs">
              Start a Fundraiser
            </span>
            <Plus className="w-3.5 h-3.5 text-amber-300 stroke-[3] group-hover:rotate-90 transition-transform duration-300" />
          </div>
          <span className="text-[10px] text-emerald-100/90 font-semibold leading-none mt-0.5 hidden sm:inline">
            Free MTN & Airtel MoMo
          </span>
        </div>
      </button>
    </div>
  );
};
