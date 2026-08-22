import React from 'react';
import { Heart, Lock, ShieldCheck, Smartphone } from 'lucide-react';

interface FooterProps {
  onStartCampaign: () => void;
  onOpenGatewayInfo: () => void;
  onOpenPayouts: () => void;
  onSelectDistrict: (district: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onStartCampaign,
  onOpenGatewayInfo,
  onOpenPayouts,
  onSelectDistrict,
}) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800 text-xs sm:text-sm">
          
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm shadow-emerald-600/30">
                <div className="w-5 h-5 border-2 border-white rounded-md flex items-center justify-center text-white">
                  <Heart className="w-3 h-3 fill-white text-white" />
                </div>
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Kusanya<span className="text-emerald-500">.org</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Uganda’s premier mobile money crowdfunding and community SACCO platform, powering verified medical, church ministry, SACCO revolving fund, and community causes across all 135+ districts.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              <span>MTN MoMo (*165#)</span>
              <span>•</span>
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>Airtel Money (*185#)</span>
            </div>
          </div>

          {/* Col 2: Fundraise Across Districts */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">
              Explore by District
            </h4>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-400">
              {['Kampala', 'Gulu', 'Jinja', 'Mbarara', 'Mbale', 'Fort Portal', 'Arua', 'Mukono'].map((d) => (
                <button
                  key={d}
                  onClick={() => onSelectDistrict(d)}
                  className="text-left hover:text-emerald-400 transition-colors py-0.5 cursor-pointer"
                >
                  {d} Fundraisers
                </button>
              ))}
            </div>
          </div>

          {/* Col 3: Causes */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">
              Giving Categories
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>Church Roofs, Pledges & Youth Brass Bands</li>
              <li>Market Women & Boda SACCO Revolving Pools</li>
              <li>Emergency Heart & Cancer Surgeries in UGX</li>
              <li>University & Secondary School Tuition</li>
              <li>Solar Water Boreholes for Rural Schools</li>
            </ul>
          </div>

          {/* Col 4: Platform & Security */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">
              Transparency & Security
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenGatewayInfo}
                  className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>How Mobile Money Gateway Works</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPayouts}
                  className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Organizer Payout Portal</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onStartCampaign}
                  className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer"
                >
                  + Start a Fundraiser Today
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright & Disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>
            © 2026 Kusanya (kusanya.org). Built for the Pearl of Africa with Bulungi Bwansi & Twegaite spirit.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Real-time Fund Tracking Active</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <Lock className="w-3 h-3 text-emerald-500" />
              <span>Payments Secured by Bank of Uganda NPS Rails</span>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
