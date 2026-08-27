import React, { useState, useEffect } from 'react';
import { Heart, Smartphone, Zap, Target, TrendingUp, Calculator } from 'lucide-react';
import { Campaign, DonorCheer } from '../types';
import { formatUGX, formatSignedUGX, calculateDonationMinusTarget, timeAgo } from '../utils/formatters';

interface LiveDonationsTickerProps {
  donations: DonorCheer[];
  campaigns?: Campaign[];
  onSelectDonationCampaign?: (campaignId: string) => void;
}

export const LiveDonationsTicker: React.FC<LiveDonationsTickerProps> = ({
  donations,
  campaigns = [],
  onSelectDonationCampaign,
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

  // Find linked campaign for target and total raised amounts
  const linkedCampaign = campaigns.find((c) => c.id === current.campaignId);
  const targetAmount = linkedCampaign?.targetAmount || current.campaignTarget || 0;
  const raisedAmount = linkedCampaign?.raisedAmount || current.campaignRaised || 0;
  const campaignTitle = linkedCampaign?.title || current.campaignTitle || 'Uganda Fundraiser';
  const { amountDonatedMinusTarget } = calculateDonationMinusTarget(raisedAmount, targetAmount);

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 py-2 px-3 sm:px-4 shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs overflow-hidden">
        
        {/* Live Badge */}
        <div className="flex items-center gap-1.5 shrink-0 bg-emerald-950/90 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-800/70">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] uppercase tracking-wider font-mono">Live Giving</span>
        </div>

        {/* Animated Donor Item with Amount, Total Raised & Target */}
        <div 
          onClick={() => {
            if (current.campaignId && onSelectDonationCampaign) {
              onSelectDonationCampaign(current.campaignId);
            }
          }}
          className={`flex-1 truncate flex items-center gap-2 ${
            onSelectDonationCampaign ? 'cursor-pointer hover:text-white transition-colors' : ''
          }`}
          title={onSelectDonationCampaign ? `View fundraiser: ${campaignTitle}` : undefined}
        >
          <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${
            currentProvider === 'mtn' 
              ? 'bg-yellow-400' 
              : currentProvider === 'airtel' 
              ? 'bg-red-500' 
              : currentProvider === 'visa' || currentProvider === 'card'
              ? 'bg-blue-500'
              : 'bg-sky-400'
          }`}></span>

          {/* Donor & Donation Amount */}
          <span className="font-bold text-white shrink-0">
            {current.isAnonymous ? 'Anonymous Giver' : current.donorName || 'Kind Giver'}
          </span>
          <span className="text-slate-400 shrink-0">donated</span>
          <span className="font-black text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded text-[11px] shrink-0 shadow-xs">
            {formatUGX(current.amount || 0)}
          </span>

          {/* Target & Total Raised Section */}
          <span className="text-slate-400 hidden sm:inline shrink-0">to</span>
          <span className="font-semibold text-slate-200 truncate max-w-[140px] sm:max-w-[200px] hidden sm:inline">
            {campaignTitle}
          </span>

          {targetAmount > 0 && (
            <div className="hidden md:inline-flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 px-2 py-0.5 rounded-full text-[10px] text-slate-300 shrink-0">
              <Calculator className="w-3 h-3 text-emerald-400" />
              <span>Total: <strong>{formatUGX(raisedAmount)}</strong></span>
              <span className="text-slate-500">/</span>
              <span>Target: <strong>{formatUGX(targetAmount)}</strong></span>
              <span className="text-emerald-400 font-mono font-bold ml-0.5">
                (Donated − Target: {formatSignedUGX(amountDonatedMinusTarget)})
              </span>
            </div>
          )}

          {current.message && (
            <span className="text-slate-400 italic hidden lg:inline truncate max-w-xs">
              “{current.message}”
            </span>
          )}
        </div>

        {/* Timestamp */}
        <div className="shrink-0 text-[11px] text-slate-500 font-mono">
          {timeAgo(current.timestamp || new Date().toISOString())}
        </div>

      </div>
    </div>
  );
};
