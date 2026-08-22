import React from 'react';
import { 
  CheckCircle2, 
  CreditCard, 
  Globe, 
  HelpCircle, 
  Lock, 
  Server, 
  ShieldCheck, 
  Smartphone, 
  X, 
  Zap 
} from 'lucide-react';

interface PaymentGatewayInfoModalProps {
  onClose: () => void;
}

export const PaymentGatewayInfoModal: React.FC<PaymentGatewayInfoModalProps> = ({
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 my-0 sm:my-6 max-h-[94vh] sm:max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle indicator */}
        <div className="sm:hidden w-full flex items-center justify-center pt-2.5 pb-1 bg-slate-900">
          <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
        </div>
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">Payment Infrastructure</h3>
              <p className="text-xs text-slate-400">MTN MoMo, Airtel Money, Visa & PayPal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 text-slate-800 text-xs sm:text-sm leading-relaxed overflow-y-auto flex-1">
          
          {/* Section 1: How Payments Work */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-950 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>1. Supported Payment Channels</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-yellow-50/70 border border-yellow-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="bg-yellow-400 text-slate-900 text-[10px] font-black px-1.5 py-0.5 rounded">MTN</span>
                  <span className="font-bold text-slate-900">MTN MoMo (*165#)</span>
                </div>
                <p className="text-xs text-slate-700">
                  Instant collections across Uganda with *165# automated push prompts directly to the donor's mobile handset.
                </p>
              </div>

              <div className="bg-red-50/70 border border-red-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded">AIR</span>
                  <span className="font-bold text-slate-900">Airtel Money (*185#)</span>
                </div>
                <p className="text-xs text-slate-700">
                  Direct Airtel Africa Money integration with instant *185# push prompt authorization and instant verification.
                </p>
              </div>

              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="bg-blue-700 text-white text-[10px] font-black px-1.5 py-0.5 rounded">VISA</span>
                  <span className="font-bold text-slate-900">Visa & Debit Cards</span>
                </div>
                <p className="text-xs text-slate-700">
                  Global diaspora support for all Visa and Mastercard debit/credit cards with 3D-Secure 2.0 bank authentication.
                </p>
              </div>

              <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="bg-sky-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded">PP</span>
                  <span className="font-bold text-slate-900">PayPal Instant Giving</span>
                </div>
                <p className="text-xs text-slate-700">
                  Allows international donors and diaspora members across North America, Europe, and the Middle East to donate in 1 click.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Transparent 5% Maintenance Fee */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <h4 className="font-bold text-slate-950 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>2. Transparent 5% Maintenance & Telecom Fee</span>
            </h4>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-1.5 text-xs text-emerald-950">
              <p>
                <strong>95% of every donation goes directly to the beneficiary</strong> or verified cause organizer.
              </p>
              <p className="text-emerald-800">
                A transparent 5% platform maintenance fee is deducted automatically at transaction time to cover telecom SMS gateway notifications, USSD push network charges, server hosting, and security audits.
              </p>
            </div>
          </div>

          {/* Section 3: Regulation & Compliance */}
          <div className="bg-slate-900 text-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>National Payment Systems Act Compliance</span>
            </div>
            <p className="text-slate-300 text-xs">
              Kusanya (kusanya.org) operates strictly in compliance with Bank of Uganda National Payment Systems (NPS) guidelines. All customer wallet funds are protected in regulated escrow accounts and only released to verified church, SACCO, hospital, school, or community accounts.
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-md transition-colors cursor-pointer"
          >
            I Understand — Start Giving
          </button>

        </div>

      </div>
    </div>
  );
};
