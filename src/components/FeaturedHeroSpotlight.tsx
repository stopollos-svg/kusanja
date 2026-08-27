import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertCircle,
  Building2, 
  Calculator,
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
  Pause,
  Play,
  Plus, 
  RefreshCw,
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
import { formatUGX, formatSignedUGX, calculateDonationMinusTarget } from '../utils/formatters';
import { 
  calculateCampaignActivity, 
  sortCampaignsForSpotlight, 
  getAlternatingSpotlightPool,
  getTopSustainedCampaigns,
  getNewFundraisers 
} from '../utils/activity';
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
  // 1. Build an alternating 10-campaign spotlight pool combining sustained causes and new fundraisers
  const spotlightPool = getAlternatingSpotlightPool(campaigns, 10);

  // 2. Separate lists for the side panel: Top Active Sustained Causes vs. New Fundraisers
  const topSustainedList = getTopSustainedCampaigns(campaigns, 6);
  const newFundraisersList = getNewFundraisers(campaigns, 6);

  // Active spotlight index
  const [selectedSpotlightIndex, setSelectedSpotlightIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [showActivityAudit, setShowActivityAudit] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Side view mode: 'auto' (alternates between sustained and new) | 'sustained' | 'new'
  const [sideViewMode, setSideViewMode] = useState<'auto' | 'sustained' | 'new'>('auto');
  const [activeSideBatch, setActiveSideBatch] = useState<'sustained' | 'new'>('sustained');

  // Auto-rotation timer for the main 10-cause hero spotlight (every 6 seconds)
  useEffect(() => {
    if (!isAutoPlaying || isHovered || spotlightPool.length <= 1) return;

    const interval = setInterval(() => {
      setSelectedSpotlightIndex((prev) => (prev + 1) % spotlightPool.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, isHovered, spotlightPool.length]);

  // Auto-rotation timer for alternating side causes (every 7 seconds when in 'auto' mode)
  useEffect(() => {
    if (sideViewMode !== 'auto' || isHovered) return;

    const interval = setInterval(() => {
      setActiveSideBatch((prev) => (prev === 'sustained' ? 'new' : 'sustained'));
    }, 7000);

    return () => clearInterval(interval);
  }, [sideViewMode, isHovered]);

  const currentSpotlight = spotlightPool[selectedSpotlightIndex] || spotlightPool[0] || campaigns[0];
  const currentStats = currentSpotlight ? calculateCampaignActivity(currentSpotlight) : null;

  // Determine current side list based on mode & alternating cycle
  const currentSideList = sideViewMode === 'sustained' 
    ? topSustainedList.filter(c => c.id !== currentSpotlight?.id).slice(0, 3)
    : sideViewMode === 'new'
    ? newFundraisersList.filter(c => c.id !== currentSpotlight?.id).slice(0, 3)
    : activeSideBatch === 'sustained'
    ? topSustainedList.filter(c => c.id !== currentSpotlight?.id).slice(0, 3)
    : newFundraisersList.filter(c => c.id !== currentSpotlight?.id).slice(0, 3);

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

  const { amountDonatedMinusTarget } = calculateDonationMinusTarget(
    currentSpotlight.raisedAmount,
    currentSpotlight.targetAmount
  );

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
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Live & Verified ({spotlightPool.length} in Rotation)
              </span>
            </div>
            
            {/* 10-Cause Alternating Spotlight Controls & Pager */}
            <div className="flex items-center gap-2 flex-wrap">
              {spotlightPool.length > 1 && (
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                  <button
                    onClick={() => setSelectedSpotlightIndex((prev) => (prev > 0 ? prev - 1 : spotlightPool.length - 1))}
                    className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Previous Spotlight Cause"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* 10 Dot/Number Pager Chips */}
                  <div className="flex items-center gap-1 px-1">
                    {spotlightPool.map((c, idx) => {
                      const stats = calculateCampaignActivity(c);
                      const isSustained = stats.isAtLeastOneYear || stats.activityScore >= 75;
                      const isActive = selectedSpotlightIndex === idx;
                      return (
                        <button
                          key={c.id || idx}
                          onClick={() => setSelectedSpotlightIndex(idx)}
                          className={`h-5 px-1.5 rounded-full text-[10px] font-extrabold transition-all cursor-pointer flex items-center justify-center ${
                            isActive
                              ? 'bg-slate-900 text-emerald-400 shadow-sm min-w-[24px]'
                              : isSustained
                              ? 'bg-amber-100/90 text-amber-900 hover:bg-amber-200 w-5'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 w-5'
                          }`}
                          title={`Cause #${idx + 1}: ${c.title} (${isSustained ? '1-Yr Sustained' : 'New Fundraiser'})`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setSelectedSpotlightIndex((prev) => (prev < spotlightPool.length - 1 ? prev + 1 : 0))}
                    className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Next Spotlight Cause"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Play/Pause Auto-alternating */}
                  <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className={`p-1 rounded-lg transition-colors cursor-pointer ml-0.5 ${
                      isAutoPlaying ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'
                    }`}
                    title={isAutoPlaying ? 'Pause 6s Auto-Rotation' : 'Resume Auto-Rotation'}
                  >
                    {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
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
            
            {/* Primary Main Spotlight Card (GoFundMe Lead Hero with 10-cause alternating cycle) */}
            <div 
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => onSelectCampaign(currentSpotlight)}
              className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col cursor-pointer group relative"
            >
              {/* Auto-cycle indicator bar */}
              {isAutoPlaying && !isHovered && (
                <div className="w-full bg-slate-100 h-1 overflow-hidden">
                  <div 
                    key={selectedSpotlightIndex}
                    className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full animate-[progress_6s_linear]"
                    style={{ animationDuration: '6000ms' }}
                  />
                </div>
              )}

              {/* Lead Image with Badges */}
              <div className="relative aspect-[16/9] sm:aspect-[16/10] w-full overflow-hidden bg-slate-900">
                <img 
                  src={currentSpotlight.image} 
                  alt={currentSpotlight.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>
                
                {/* Top Badges: 1-Year Spotlight / New Fundraiser & Longevity Indicator */}
                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                  <span className={`font-black text-xs px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-md ${
                    currentStats?.isAtLeastOneYear
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-emerald-500 text-white'
                  }`}>
                    <KusanyaEmblem sizeClassName="w-3.5 h-3.5" />
                    {currentStats?.isAtLeastOneYear ? currentStats.statusBadgeText : '⚡ Active Spotlight'}
                  </span>

                  {currentStats?.isAtLeastOneYear ? (
                    <span className="bg-slate-900/90 backdrop-blur-md text-amber-300 font-extrabold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-400/40">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {currentStats.lifespanLabel}
                    </span>
                  ) : (
                    <span className="bg-slate-900/90 backdrop-blur-md text-emerald-300 font-extrabold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-400/40">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      New Fundraiser
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
                        Activity & Longevity Audit
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

              {/* Spotlight Content & Action Box */}
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

                  {/* Target & Donated Minus Target Calculation Stats */}
                  <div className="space-y-2.5 mb-4">
                    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-2">
                      <div className="flex items-baseline justify-between text-xs sm:text-sm">
                        <span className="text-slate-500 font-medium">
                          Total Target Goal:
                        </span>
                        <span className="font-extrabold text-slate-900 text-base sm:text-lg">
                          {formatUGX(currentSpotlight.targetAmount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs sm:text-sm pt-1 border-t border-slate-200/70">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          <Calculator className="w-4 h-4 text-emerald-600" />
                          <span>Amount Donated − Target:</span>
                        </span>
                        <span className={`font-mono text-xs sm:text-sm font-black px-2 py-0.5 rounded-lg ${
                          amountDonatedMinusTarget >= 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {formatSignedUGX(amountDonatedMinusTarget)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1">
                      <span className="flex items-center gap-1 text-slate-700 font-bold">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        {currentSpotlight.donorsCount} donations ({formatUGX(currentSpotlight.raisedAmount)} raised)
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

            {/* Alternating Side Section: Top Active Sustained Causes ⇄ New Fundraisers */}
            <div 
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="lg:col-span-5 flex flex-col gap-3.5 justify-between"
            >
              {/* Header with Switcher Tabs between Sustained and New */}
              <div className="flex items-center justify-between px-1 flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  {activeSideBatch === 'sustained' ? (
                    <span className="text-xs font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                      Top Active Sustained Causes
                    </span>
                  ) : (
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      New Fundraisers
                    </span>
                  )}
                </div>

                {/* Alternating Control Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-[11px] font-bold">
                  <button
                    onClick={() => {
                      setSideViewMode('auto');
                      setActiveSideBatch(activeSideBatch === 'sustained' ? 'new' : 'sustained');
                    }}
                    className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      sideViewMode === 'auto'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Auto-alternating between sustained causes and new fundraisers every 7s"
                  >
                    <RefreshCw className="w-2.5 h-2.5 text-emerald-600 animate-spin" />
                    <span>Auto</span>
                  </button>
                  <button
                    onClick={() => {
                      setSideViewMode('sustained');
                      setActiveSideBatch('sustained');
                    }}
                    className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                      sideViewMode === 'sustained'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sustained
                  </button>
                  <button
                    onClick={() => {
                      setSideViewMode('new');
                      setActiveSideBatch('new');
                    }}
                    className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                      sideViewMode === 'new'
                        ? 'bg-emerald-600 text-white font-black shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    New
                  </button>
                </div>
              </div>

              {/* List of 3 Alternating Cards */}
              <div className="space-y-3">
                {currentSideList.map((c) => {
                  const cStats = calculateCampaignActivity(c);
                  const cDiff = calculateDonationMinusTarget(c.raisedAmount, c.targetAmount);
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
                        {cStats.isAtLeastOneYear ? (
                          <span className="absolute top-1 left-1 text-[9px] font-black bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded shadow" title="1-Year Sustained Active">
                            1-Yr
                          </span>
                        ) : (
                          <span className="absolute top-1 left-1 text-[9px] font-black bg-emerald-600 text-white px-1.5 py-0.5 rounded shadow" title="New Fundraiser">
                            New
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
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                              cStats.isAtLeastOneYear
                                ? 'text-amber-700 bg-amber-50 border-amber-200'
                                : 'text-teal-700 bg-teal-50 border-teal-200'
                            }`}>
                              {cStats.isAtLeastOneYear ? cStats.lifespanLabel : 'New Cause'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              • {c.donorsCount} givers
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors">
                            {c.title}
                          </h4>
                        </div>

                        {/* Financial Calculation summary */}
                        <div className="mt-2 bg-slate-50 border border-slate-200/70 rounded-lg p-1.5 space-y-0.5 text-[11px]">
                          <div className="flex items-center justify-between text-slate-600">
                            <span>Donated: <strong className="text-slate-900">{formatUGX(c.raisedAmount)}</strong></span>
                            <span>Target: <strong className="text-slate-900">{formatUGX(c.targetAmount)}</strong></span>
                          </div>
                          <div className="flex items-center justify-between pt-0.5 border-t border-slate-200/60 font-semibold">
                            <span className="text-slate-500">Donated − Target:</span>
                            <span className={cDiff.amountDonatedMinusTarget >= 0 ? 'text-emerald-700 font-mono font-bold' : 'text-amber-800 font-mono font-bold'}>
                              {formatSignedUGX(cDiff.amountDonatedMinusTarget)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

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


