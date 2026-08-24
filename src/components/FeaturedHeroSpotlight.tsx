import React, { useState } from 'react';
import { 
  AlertCircle,
  Building2, 
  CheckCircle2, 
  ChevronLeft,
  ChevronRight, 
  Church, 
  Clock,
  Flame, 
  GraduationCap, 
  Heart, 
  HeartHandshake, 
  Info,
  Landmark, 
  MapPin, 
  Phone, 
  Plus, 
  RotateCcw,
  Share2, 
  ShieldCheck, 
  Smartphone, 
  Sparkles, 
  Star,
  Stethoscope, 
  Timer,
  TrendingUp, 
  Users, 
  Zap 
} from 'lucide-react';
import { Campaign } from '../types';
import { formatUGX } from '../utils/formatters';
import { calculateCampaignActivity, sortCampaignsForSpotlight } from '../utils/activity';
import { KusanyaBrandLogo, KusanyaEmblem } from './KusanyaBrandLogo';

interface FeaturedHeroSpotlightProps {
  campaigns: Campaign[];
  onSelectCampaign: (c: Campaign) => void;
  onDonateToCampaign: (c: Campaign) => void;
  onStartCampaign: () => void;
  onOpenGatewayInfo: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedRegion: string;
  onSelectRegion: (reg: string) => void;
  totalRaisedUGX: number;
  totalDonors: number;
}

const CATEGORIES = [
  { id: 'all', label: 'All Fundraisers', icon: Sparkles },
  { id: 'urgent', label: '⚡ Urgent (<48h / Goal)', icon: Flame },
  { id: 'medical', label: 'Medical & Surgery', icon: Stethoscope },
  { id: 'faith', label: 'Churches & Ministry', icon: Church },
  { id: 'sacco', label: 'SACCOs & Group Savings', icon: Landmark },
  { id: 'emergency', label: 'Urgent Relief', icon: Flame },
  { id: 'education', label: 'School & Tuition', icon: GraduationCap },
  { id: 'community', label: 'Clean Water & Solar', icon: HeartHandshake },
  { id: 'business', label: 'Youth Enterprise', icon: Building2 },
];

const REGIONS = ['all', 'Central', 'Eastern', 'Northern', 'Western'];

export const FeaturedHeroSpotlight: React.FC<FeaturedHeroSpotlightProps> = ({
  campaigns,
  onSelectCampaign,
  onDonateToCampaign,
  onStartCampaign,
  onOpenGatewayInfo,
  selectedCategory,
  onSelectCategory,
  selectedRegion,
  onSelectRegion,
  totalRaisedUGX,
  totalDonors,
}) => {
  // Sort campaigns dynamically based on 1-year sustained activity & momentum
  const sortedSpotlightCampaigns = sortCampaignsForSpotlight(campaigns);

  // Spotlight Filter Mode: 'one-year' (Active for at least 1 year) vs 'all'
  const [spotlightFilterMode, setSpotlightFilterMode] = useState<'one-year' | 'all'>('one-year');
  
  // Selected spotlight candidate index
  const [selectedSpotlightIndex, setSelectedSpotlightIndex] = useState<number>(0);
  const [showActivityAudit, setShowActivityAudit] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Candidates qualifying for 1-year sustained active spotlight
  const oneYearActiveCandidates = sortedSpotlightCampaigns.filter(c => {
    const stats = calculateCampaignActivity(c);
    return stats.isAtLeastOneYear || stats.spotlightEligible;
  });

  const availableSpotlightList = spotlightFilterMode === 'one-year' && oneYearActiveCandidates.length > 0
    ? oneYearActiveCandidates
    : sortedSpotlightCampaigns;

  const currentSpotlight = availableSpotlightList[selectedSpotlightIndex] || availableSpotlightList[0] || campaigns[0];
  const sideTrending = sortedSpotlightCampaigns.filter(c => c.id !== currentSpotlight?.id).slice(0, 3);

  const currentStats = currentSpotlight ? calculateCampaignActivity(currentSpotlight) : null;

  const handleShare = (e: React.MouseEvent, c: Campaign) => {
    e.stopPropagation();
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: c.title,
        text: `Support "${c.title}" on Kusanya.org via MTN MoMo or Airtel Money:`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${c.title} - Support via MTN MoMo/Airtel Money on ${url}`);
      setCopiedId(c.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  if (!currentSpotlight) return null;

  const percentRaised = Math.min(100, Math.round((currentSpotlight.raisedAmount / currentSpotlight.targetAmount) * 100));

  return (
    <section className="bg-gradient-to-b from-slate-50/80 via-white to-slate-50 border-b border-slate-200/80 pt-3 sm:pt-5 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* GoFundMe-Style Featured Fundraisers Hero Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Featured Fundraisers
              </h2>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Live & Verified
              </span>
            </div>
            
            {/* Spotlight Controls & Pager */}
            <div className="flex items-center gap-2">
              {availableSpotlightList.length > 1 && (
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                  <button
                    onClick={() => setSelectedSpotlightIndex((prev) => (prev > 0 ? prev - 1 : availableSpotlightList.length - 1))}
                    className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Previous Spotlight"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1 px-1">
                    {availableSpotlightList.slice(0, 5).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSpotlightIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                          selectedSpotlightIndex === idx ? 'bg-emerald-600 w-4' : 'bg-slate-300 hover:bg-slate-400'
                        }`}
                        title={`Go to Spotlight #${idx + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setSelectedSpotlightIndex((prev) => (prev < availableSpotlightList.length - 1 ? prev + 1 : 0))}
                    className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Next Spotlight"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                onClick={onStartCampaign}
                className="hidden sm:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Start a Fundraiser</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Primary Main Spotlight Card (GoFundMe Lead Hero) */}
            <div 
              onClick={() => onSelectCampaign(currentSpotlight)}
              className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col cursor-pointer group relative"
            >
              {/* Lead Image with Badges */}
              <div className="relative aspect-[16/9] sm:aspect-[16/10] w-full overflow-hidden bg-slate-900">
                <img 
                  src={currentSpotlight.image} 
                  alt={currentSpotlight.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>
                
                {/* Top Badges: 1-Year Spotlight & Longevity Indicator */}
                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                  <span className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                    <KusanyaEmblem sizeClassName="w-3.5 h-3.5" />
                    {currentStats?.statusBadgeText || 'Top Spotlight'}
                  </span>

                  {currentStats?.isAtLeastOneYear && (
                    <span className="bg-slate-900/90 backdrop-blur-md text-amber-300 font-extrabold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-400/40">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {currentStats.lifespanLabel}
                    </span>
                  )}

                  <span className="bg-emerald-600/95 backdrop-blur-md text-white font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    KYC Verified
                  </span>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActivityAudit(!showActivityAudit);
                    }}
                    className="bg-slate-900/85 hover:bg-slate-800 text-amber-300 font-bold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-500/30 transition-colors shadow-md cursor-pointer"
                    title="View Activity Metrics"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Score: {currentStats?.activityScore}/100</span>
                  </button>

                  <span className="bg-slate-900/80 backdrop-blur-md text-white font-semibold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    {currentSpotlight.district}
                  </span>
                </div>

                {/* Overlay Floating Title on Image Bottom */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-500/80 text-white px-2 py-0.5 rounded">
                      {currentSpotlight.category.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-200">
                      Organized by {currentSpotlight.organizerName}
                    </span>
                    <span className="text-xs text-emerald-300 font-bold">
                      • {currentStats?.velocityLabel}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-xl font-extrabold text-white leading-snug drop-shadow-md">
                    {currentSpotlight.title}
                  </h3>
                </div>
              </div>

              {/* 1-Year Activity Breakdown Banner (Expandable) */}
              {showActivityAudit && currentStats && (
                <div className="bg-slate-900 border-y border-amber-500/30 p-4 text-xs text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-400" />
                      <strong className="text-amber-300 uppercase tracking-wider font-black">
                        1-Year Sustained Activity Audit
                      </strong>
                    </div>
                    <span className="bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded border border-amber-500/30">
                      Activity Index: {currentStats.activityScore}/100
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed mb-3">
                    {currentStats.reason}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                    <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Lifespan</span>
                      <strong className="text-white">{currentStats.lifespanLabel}</strong>
                    </div>
                    <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Longevity Pts</span>
                      <strong className="text-emerald-400">{currentStats.criteriaBreakdown.longevityScore}/30 max</strong>
                    </div>
                    <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Donor Velocity</span>
                      <strong className="text-amber-300">{currentStats.criteriaBreakdown.donorVelocityScore}/35 max</strong>
                    </div>
                    <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Milestones</span>
                      <strong className="text-teal-300">{currentStats.criteriaBreakdown.engagementScore}/15 max</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Spotlight Content & GoFundMe Action Box */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Spotlight Reason Header */}
                  {currentSpotlight.spotlightReason && (
                    <div className="mb-3 bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-950 shadow-sm">
                      <div className="shrink-0 mt-0.5">
                        <KusanyaEmblem sizeClassName="w-4 h-4" />
                      </div>
                      <div className="leading-relaxed">
                        <strong className="font-extrabold text-amber-950">Why this is on Spotlight: </strong>
                        <span className="text-amber-900 font-medium">{currentSpotlight.spotlightReason}</span>
                      </div>
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed mb-5">
                    {currentSpotlight.story}
                  </p>

                  {/* Progress Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-baseline justify-between text-xs sm:text-sm">
                      <span className="font-extrabold text-slate-900 text-lg sm:text-xl">
                        {formatUGX(currentSpotlight.raisedAmount)}
                      </span>
                      <span className="text-slate-500 font-medium">
                        raised of <strong className="text-slate-700">{formatUGX(currentSpotlight.targetAmount)}</strong>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-emerald-600 rounded-full transition-all duration-700 relative"
                        style={{ width: `${percentRaised}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1">
                      <span className="flex items-center gap-1 text-slate-700 font-bold">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        {currentSpotlight.donorsCount} donations
                      </span>
                      <span className="font-black text-emerald-700">
                        {percentRaised}% of goal
                      </span>
                      <span className="text-slate-500">
                        {currentSpotlight.daysRemaining} days left
                      </span>
                    </div>
                  </div>
                </div>

                {/* Instant Action CTA Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDonateToCampaign(currentSpotlight);
                    }}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-md shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-200" />
                    <span>DONATE (MoMo / Card)</span>
                  </button>

                  <button
                    onClick={(e) => handleShare(e, currentSpotlight)}
                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors cursor-pointer"
                    title="Share fundraiser"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Side Trending Featured Fundraisers (3 Cards) */}
            <div className="lg:col-span-5 flex flex-col gap-3.5 justify-between">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                  Top Active Sustained Causes
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Ranked by 1-Yr Activity
                </span>
              </div>

              {sideTrending.map((c) => {
                const cStats = calculateCampaignActivity(c);
                const cPercent = Math.min(100, Math.round((c.raisedAmount / c.targetAmount) * 100));
                return (
                  <div
                    key={c.id}
                    onClick={() => onSelectCampaign(c)}
                    className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-3.5 shadow-sm hover:shadow-md transition-all flex gap-3.5 cursor-pointer group hover:border-emerald-300"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                      <img 
                        src={c.image} 
                        alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-slate-900/80 text-white px-1.5 py-0.5 rounded">
                        {c.district}
                      </span>
                      {cStats.isAtLeastOneYear && (
                        <span className="absolute top-1 left-1 text-[9px] font-black bg-amber-500 text-slate-950 px-1 py-0.2 rounded shadow" title="1-Year Active">
                          1-Yr
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {c.category}
                          </span>
                          <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            {cStats.lifespanLabel}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            • {c.donorsCount} givers
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors">
                          {c.title}
                        </h4>
                      </div>

                      {/* Mini Progress */}
                      <div className="mt-2 space-y-1">
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${cPercent}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-extrabold text-slate-900">
                            {formatUGX(c.raisedAmount)}
                          </span>
                          <span className="text-emerald-700 font-bold">
                            {cPercent}% ({cStats.activityScore} pts)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Quick Start Card Banner */}
              <div 
                onClick={onStartCampaign}
                className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between cursor-pointer hover:opacity-95 transition-all border border-emerald-800/40 group"
              >
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    <KusanyaBrandLogo size="xs" showText={false} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-white group-hover:text-amber-300 transition-colors">
                      Need help raising funds in Uganda?
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      Zero upfront fees • Free MTN & Airtel MoMo setup
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>

            </div>

          </div>
        </div>

        {/* Category Filter Pills (GoFundMe Discovery Bar) */}
        <div className="border-t border-slate-200/80 pt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              Explore by Category
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500">Filter Region:</span>
              <select
                value={selectedRegion}
                onChange={(e) => onSelectRegion(e.target.value)}
                aria-label="Filter campaigns by Uganda region"
                className="text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r === 'all' ? 'All Uganda Regions' : `${r} Uganda`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none touch-pan-x">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

