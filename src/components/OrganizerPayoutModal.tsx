import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  Smartphone, 
  Wallet, 
  X 
} from 'lucide-react';
import { Campaign, PayoutRequest } from '../types';
import { api } from '../services/api';
import { formatPhoneNumber, formatUGX } from '../utils/formatters';

interface OrganizerPayoutModalProps {
  campaigns: Campaign[];
  onClose: () => void;
}

export const OrganizerPayoutModal: React.FC<OrganizerPayoutModalProps> = ({
  campaigns,
  onClose,
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns[0]?.id || '');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [payoutPhone, setPayoutPhone] = useState<string>('');
  const [payoutProvider, setPayoutProvider] = useState<'mtn' | 'airtel'>('mtn');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedPayout, setCompletedPayout] = useState<PayoutRequest | null>(null);
  const [error, setError] = useState('');

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0];

  const handleSelectCampaign = (id: string) => {
    setSelectedCampaignId(id);
    const camp = campaigns.find(c => c.id === id);
    if (camp) {
      setPayoutPhone(camp.payoutPhone);
      setPayoutProvider(camp.payoutProvider);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;

    const amount = Number(withdrawAmount);
    if (isNaN(amount) || amount < 5000) {
      setError('Minimum withdrawal amount is UGX 5,000');
      return;
    }
    if (amount > selectedCampaign.raisedAmount) {
      setError(`Cannot withdraw more than available balance of ${formatUGX(selectedCampaign.raisedAmount)}`);
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const data = await api.requestPayout({
        campaignId: selectedCampaign.id,
        amount,
        provider: payoutProvider,
        phoneNumber: payoutPhone || selectedCampaign.payoutPhone,
        recipientName: selectedCampaign.organizerName
      });

      if (data.success && data.payout) {
        setCompletedPayout(data.payout);
      } else {
        setError(data.error || 'Disbursement request failed');
      }
    } catch (err) {
      setError('Network connection error.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="relative w-full max-w-xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 max-h-[94vh] sm:max-h-[90vh] flex flex-col my-0 sm:my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle indicator */}
        <div className="sm:hidden w-full flex items-center justify-center pt-2.5 pb-1 bg-slate-900">
          <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
        </div>
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Organizer Disbursement</h3>
              <p className="text-xs text-slate-400">Withdraw to registered MTN or Airtel MoMo</p>
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

        {/* Error message */}
        {error && (
          <div className="bg-red-50 text-red-800 text-xs p-3 border-b border-red-200">
            {error}
          </div>
        )}

        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          
          {completedPayout ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-black text-slate-900">
                Mobile Money Payout Disbursed!
              </h4>
              <p className="text-xs text-slate-600">
                <strong>{formatUGX(completedPayout.amount)}</strong> has been processed via <strong>{completedPayout.provider.toUpperCase()} MoMo B2C</strong> to <strong>{formatPhoneNumber(completedPayout.phoneNumber)}</strong>.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-700 text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Settlement Ref:</span>
                  <span className="font-bold">{completedPayout.disbursementRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recipient Name:</span>
                  <span>{completedPayout.recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-emerald-700 font-bold">COMPLETED / SENT</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-md cursor-pointer"
              >
                Close Portal
              </button>
            </div>
          ) : (
            <form onSubmit={handleRequestPayout} className="space-y-4">
              
              {/* Select Campaign */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Select Your Fundraiser
                </label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => handleSelectCampaign(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:outline-none focus:border-emerald-600"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} — Available: {formatUGX(c.raisedAmount)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campaign Balance Banner */}
              {selectedCampaign && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block">Available Balance</span>
                    <span className="text-base font-black text-slate-950">
                      {formatUGX(selectedCampaign.raisedAmount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Verified Organizer</span>
                    <span className="font-semibold text-slate-800">{selectedCampaign.organizerName}</span>
                  </div>
                </div>
              )}

              {/* Withdrawal Amount */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Amount to Withdraw (UGX)</label>
                  {selectedCampaign && (
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(String(selectedCampaign.raisedAmount))}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                    >
                      Withdraw Full Balance
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 500000"
                  min={5000}
                  className="w-full p-2.5 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              {/* Payout Provider & Phone */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Payout Destination</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutProvider('mtn')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      payoutProvider === 'mtn' ? 'bg-yellow-400 text-slate-900 border-yellow-500 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    MTN Mobile Money
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutProvider('airtel')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      payoutProvider === 'airtel' ? 'bg-red-600 text-white border-red-700 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Airtel Money
                  </button>
                </div>

                <input
                  type="tel"
                  value={payoutPhone}
                  onChange={(e) => setPayoutPhone(e.target.value)}
                  placeholder="Registered Mobile Money Phone (e.g. 0772 458912)"
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-full shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Instant MoMo Settlement...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Disburse to Mobile Money</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
