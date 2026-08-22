import React from 'react';
import { 
  Building2, 
  Church,
  Coins,
  Flame, 
  GraduationCap, 
  HeartHandshake, 
  HelpCircle, 
  Landmark,
  MapPin, 
  Plus, 
  ShieldCheck, 
  Smartphone, 
  Sparkles, 
  Stethoscope, 
  Users 
} from 'lucide-react';
import { formatUGX } from '../utils/formatters';

interface HeroSectionProps {
  totalRaisedUGX: number;
  totalDonors: number;
  activeCampaignsCount: number;
  districtsCount: number;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedRegion: string;
  onSelectRegion: (reg: string) => void;
  onStartCampaign: () => void;
  onOpenGatewayInfo: () => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Causes', icon: Sparkles },
  { id: 'faith', label: 'Churches & Ministries', icon: Church },
  { id: 'sacco', label: 'SACCOs & Group Savings', icon: Landmark },
  { id: 'medical', label: 'Medical & Surgery', icon: Stethoscope },
  { id: 'education', label: 'School & Tuition', icon: GraduationCap },
  { id: 'emergency', label: 'Disaster Relief', icon: Flame },
  { id: 'community', label: 'Community Water/Solar', icon: HeartHandshake },
  { id: 'business', label: 'Youth & Agribusiness', icon: Building2 },
];

const REGIONS = ['all', 'Central', 'Eastern', 'Northern', 'Western'];

export const HeroSection: React.FC<HeroSectionProps> = ({
  totalRaisedUGX,
  totalDonors,
  activeCampaignsCount,
  districtsCount,
  selectedCategory,
  onSelectCategory,
  selectedRegion,
  onSelectRegion,
  onStartCampaign,
  onOpenGatewayInfo,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-8 pb-10 sm:pt-12 sm:pb-14">
      {/* Background subtle mesh */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Banner Content */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-semibold text-slate-300 mb-4">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-200">Kusanya.org — Crowdfunding, Churches & SACCOs</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-bold">MTN MoMo & Airtel Money</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
            Empower Communities, Churches & SACCOs Across Uganda with <span className="text-emerald-400">Direct Mobile Money</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-6">
            Mobilize funds or donate instantly in <strong>Ugandan Shillings (UGX)</strong> to verified church projects, SACCO group savings, medical emergencies, and tuition with real-time fund tracking.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onStartCampaign}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full shadow-lg shadow-emerald-600/30 active:scale-95 transition-all text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Start a Free Fundraiser</span>
            </button>

            <button
              onClick={onOpenGatewayInfo}
              className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-full active:scale-95 transition-all text-sm cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>How MoMo Checkout Works</span>
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Verified Beneficiaries</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
              <span>MTN MoMo (*165#)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>Airtel Money (*185#)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Instant Donor SMS & Receipt</span>
            </div>
          </div>
        </div>

        {/* Live Real-time Metrics Card */}
        <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-xl max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-700/60 text-center">
            
            <div className="pt-2 sm:pt-0">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-400">
                {formatUGX(totalRaisedUGX)}
              </div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
                Total Raised Live (UGX)
              </div>
            </div>

            <div className="pt-2 sm:pt-0 sm:pl-4">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white flex items-center justify-center gap-1">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>{totalDonors.toLocaleString()}</span>
              </div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
                Generous Donors
              </div>
            </div>

            <div className="pt-2 sm:pt-0 sm:pl-4">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
                {activeCampaignsCount}
              </div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
                Active Fundraisers
              </div>
            </div>

            <div className="pt-2 sm:pt-0 sm:pl-4">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-400 flex items-center justify-center gap-1">
                <MapPin className="w-5 h-5" />
                <span>{districtsCount} Districts</span>
              </div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
                Nationwide Reach
              </div>
            </div>

          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
              Browse by Cause
            </span>

            {/* Region Filter */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 hidden sm:inline">Region:</span>
              <div className="inline-flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                {REGIONS.map((reg) => (
                  <button
                    key={reg}
                    onClick={() => onSelectRegion(reg)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      selectedRegion === reg
                        ? 'bg-emerald-600 text-white font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {reg === 'all' ? 'All Uganda' : reg}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30'
                      : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:border-slate-500 hover:bg-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-400'}`} />
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
