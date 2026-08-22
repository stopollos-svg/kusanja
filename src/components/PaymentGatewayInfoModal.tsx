import React from 'react';
import { 
  CheckCircle2, 
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Secure Mobile Money Payment Gateway</h3>
              <p className="text-xs text-slate-400">MTN MoMo (*165#) & Airtel Money (*185#) Integration Architecture</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-800 text-xs sm:text-sm leading-relaxed">
          
          {/* Section 1: How It Works */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-950 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>1. Real-Time USSD Push Flow</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="font-bold text-slate-900 block mb-1">Step 1: Enter Phone</span>
                <p className="text-xs">Provide your MTN (077/078) or Airtel (070/075) number with desired UGX amount.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="font-bold text-slate-900 block mb-1">Step 2: Enter PIN</span>
                <p className="text-xs">Your telecom pushes an automated USSD prompt to your screen to enter your secret PIN.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="font-bold text-slate-900 block mb-1">Step 3: Live Receipt</span>
                <p className="text-xs">Gateway webhooks credit the fundraiser instantly and issue a verifiable receipt.</p>
              </div>
            </div>
          </div>

          {/* Section 2: Telecom Integrations */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <h4 className="font-bold text-slate-950 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Server className="w-4 h-4 text-emerald-600" />
              <span>2. Supported Ugandan Telecoms & Banks</span>
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-yellow-50/80 border border-yellow-200 rounded-xl p-3">
                <span className="font-bold text-slate-900 block mb-1">MTN Mobile Money (Uganda)</span>
                <p className="text-xs text-slate-700">
                  Full MTN MoMo API collections & automated B2C bulk disbursements with *165# USSD callback.
                </p>
              </div>
              <div className="bg-red-50/80 border border-red-200 rounded-xl p-3">
                <span className="font-bold text-slate-900 block mb-1">Airtel Money (Uganda)</span>
                <p className="text-xs text-slate-700">
                  Direct Airtel Africa Money Merchant collection with instant *185# authorization & SMS notifications.
                </p>
              </div>
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
