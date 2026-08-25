import React, { useState, useEffect } from 'react';
import { Heart, Smartphone, Zap } from 'lucide-react';
import { DonorCheer } from '../types';
import { formatUGX, timeAgo } from '../utils/formatters';

interface LiveDonationsTickerProps {
  donations: DonorCheer[];
  onSelectDonationCampaign?: (campaignId: string) => void;
}

export const LiveDonationsTicker: React.FC<LiveDonationsTickerProps> = ({
  donations,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (donations.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % donations.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [donations.length]);

  if (!donations || donations.length === 0) return null;

  const safeIndex = currentIndex >= 0 && currentIndex < donations.length ? currentIndex : 0;
  const current = donations[safeIndex];

  if (!current) return null;

  const currentProvider = current.provider || 'mtn';
  const providerLabel =
    currentProvider === 'visa' || currentProvider === 'card'
      ? 'Visa Card'
      : currentProvider === 'paypal'
      ? 'PayPal'
      : `${currentProvider.toUpperCase()} MoMo`;

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 py-2 px-4 shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs overflow-hidden">
        
        {/* Live Badge */}
        <div className="flex items-center gap-1.5 shrink-0 bg-emerald-950/80 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-800/60">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] uppercase tracking-wider">Live Giving Feed</span>
        </div>

        {/* Animated Donor Item */}
        <div className="flex-1 truncate flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${
            currentProvider === 'mtn' 
              ? 'bg-yellow-400' 
              : currentProvider === 'airtel' 
              ? 'bg-red-500' 
              : currentProvider === 'visa' || currentProvider === 'card'
              ? 'bg-blue-500'
              : 'bg-sky-400'
          }`}></span>
          <span className="font-bold text-white">
            {current.isAnonymous ? 'An Anonymous Giver' : current.donorName || 'Generous Giver'}
          </span>
          <span className="text-slate-400">just sent</span>
          <span className="font-black text-emerald-400 bg-slate-800 px-2 py-0.5 rounded text-[11px]">
            {formatUGX(current.amount || 0)}
          </span>
          <span className="text-slate-400 hidden sm:inline">
            via {providerLabel}
          </span>
          {current.message && (
            <span className="text-slate-400 italic hidden md:inline truncate max-w-xs">
              “{current.message}”
            </span>
          )}
        </div>

        {/* Timestamp */}
        <div className="shrink-0 text-[11px] text-slate-500">
          {timeAgo(current.timestamp || new Date().toISOString())}
        </div>

      </div>
    </div>
  );
};
