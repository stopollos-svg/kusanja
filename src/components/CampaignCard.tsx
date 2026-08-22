import React from 'react';
import { Calendar, CheckCircle2, Heart, MapPin, Phone, Smartphone, Users } from 'lucide-react';
import { Campaign } from '../types';
import { formatUGX } from '../utils/formatters';

interface CampaignCardProps {
  campaign: Campaign;
  onSelect: (campaign: Campaign) => void;
  onDonate: (campaign: Campaign) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onSelect,
  onDonate,
}) => {
  const percentage = Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100));
  const contactNum = campaign.beneficiaryPhone || campaign.organizerPhone;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col group overflow-hidden">
      
      {/* Card Image Header */}
      <div 
        className="relative h-48 sm:h-52 overflow-hidden bg-slate-100 cursor-pointer"
        onClick={() => onSelect(campaign)}
      >
        <img
          src={campaign.image}
          alt={campaign.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/20"></div>

        {/* Category Pill */}
        <div className={`absolute top-3.5 left-3.5 flex items-center gap-1.5 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider ${
          campaign.category === 'faith'
            ? 'bg-amber-600'
            : campaign.category === 'sacco'
            ? 'bg-blue-600'
            : 'bg-emerald-600'
        }`}>
          <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
          <span>
            {campaign.category === 'faith'
              ? 'Church / Faith'
              : campaign.category === 'sacco'
              ? 'SACCO / Savings'
              : campaign.category}
          </span>
        </div>

        {/* District Location */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md text-slate-100 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-700/60">
          <MapPin className="w-3 h-3 text-emerald-400" />
          <span>{campaign.district}</span>
        </div>

        {/* Verified Badge */}
        {campaign.organizerKycVerified && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-slate-900/85 backdrop-blur-md text-emerald-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-md border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Verified Organizer</span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        
        <div>
          {/* Title */}
          <h3 
            onClick={() => onSelect(campaign)}
            className="text-base sm:text-lg font-bold text-slate-900 hover:text-emerald-700 transition-colors line-clamp-2 leading-snug cursor-pointer mb-2"
          >
            {campaign.title}
          </h3>

          {/* Tagline */}
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {campaign.tagline || campaign.story.slice(0, 100) + '...'}
          </p>

          {/* Beneficiary & Direct Contact Tag */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-4 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
            <span className="truncate">
              For: <strong className="text-slate-800 font-semibold">{campaign.beneficiaryName}</strong>
            </span>
            {contactNum && (
              <a 
                href={`tel:${contactNum.replace(/\s+/g, '')}`}
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold ml-2 bg-emerald-100/70 hover:bg-emerald-100 px-2 py-0.5 rounded-md transition-colors"
                title="Direct call"
              >
                <Phone className="w-3 h-3 text-emerald-600" />
                <span>{contactNum}</span>
              </a>
            )}
          </div>
        </div>

        {/* Progress Bar & Financials */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          
          {/* Progress Visual */}
          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-xs font-bold text-slate-900">
                {percentage}% <span className="font-normal text-slate-500">funded</span>
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Target: {formatUGX(campaign.targetAmount)}
              </span>
            </div>
            
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Raised & Donors Summary */}
          <div className="flex items-center justify-between text-xs text-slate-700">
            <div>
              <span className="text-sm sm:text-base font-black text-slate-900">
                {formatUGX(campaign.raisedAmount)}
              </span>
              <span className="text-[11px] text-slate-500 block">Raised in UGX</span>
            </div>

            <div className="flex items-center gap-3 text-slate-600">
              <div className="flex items-center gap-1" title={`${campaign.donorsCount} Mobile Money Donors`}>
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-slate-800">{campaign.donorsCount}</span>
              </div>
              <div className="flex items-center gap-1" title={`${campaign.daysRemaining} days left`}>
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{campaign.daysRemaining}d left</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => onSelect(campaign)}
              className="px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors text-center cursor-pointer"
            >
              Read Story
            </button>

            <button
              onClick={() => onDonate(campaign)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-black text-slate-900 bg-yellow-400 hover:bg-yellow-300 rounded-xl shadow-sm border-b-2 border-yellow-600 active:scale-95 transition-all cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-900" />
              <span>Donate MoMo</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
