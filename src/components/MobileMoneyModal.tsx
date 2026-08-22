import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  CreditCard, 
  Download, 
  Heart, 
  Lock, 
  Printer, 
  RefreshCw, 
  ShieldCheck, 
  Smartphone, 
  X, 
  Zap 
} from 'lucide-react';
import { Campaign, PaymentTransaction } from '../types';
import { detectUgandanProvider, formatPhoneNumber, formatUGX } from '../utils/formatters';

interface MobileMoneyModalProps {
  campaign: Campaign;
  onClose: () => void;
  onDonationComplete: (tx: PaymentTransaction, newRaisedAmount: number) => void;
}

const PRESET_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000];

export const MobileMoneyModal: React.FC<MobileMoneyModalProps> = ({
  campaign,
  onClose,
  onDonationComplete,
}) => {
  // Step state: 1: Details & Amount -> 2: Simulated USSD Push & PIN -> 3: Confirmed Receipt
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState<number>(50000);
  const [customAmount, setCustomAmount] = useState<string>('50000');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [provider, setProvider] = useState<'mtn' | 'airtel' | 'card'>('mtn');
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('May God grant full recovery and bless this family.');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  // Transaction processing state
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [pinCode, setPinCode] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(60);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Auto-detect provider when phone number is typed
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPhoneNumber(val);
    const detected = detectUgandanProvider(val);
    if (detected === 'mtn' || detected === 'airtel') {
      setProvider(detected);
    }
  };

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmount(String(val));
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = Number(val);
    if (!isNaN(num)) {
      setAmount(num);
    }
  };

  // Step 1 -> Step 2: Initiate Mobile Money USSD prompt via backend
  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 9) {
      setErrorMsg('Please enter a valid Ugandan phone number (e.g. 0772 123456).');
      return;
    }
    if (amount < 2000) {
      setErrorMsg('Minimum Mobile Money donation is UGX 2,000.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/donations/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id,
          amount,
          provider,
          phoneNumber,
          donorName: isAnonymous ? 'Anonymous' : (donorName || 'Generous Donor'),
          donorEmail: donorEmail || undefined,
          message,
          isAnonymous
        })
      });

      const data = await res.json();
      if (data.success && data.transaction) {
        setTransaction(data.transaction);
        setStep(2);
        setCountdown(60);
      } else {
        setErrorMsg(data.error || 'Failed to initiate payment.');
      }
    } catch (err) {
      setErrorMsg('Network error connecting to payment gateway.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Countdown timer for USSD simulation
  useEffect(() => {
    if (step !== 2) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  // Step 2 -> Step 3: Confirm PIN via backend simulation
  const handleConfirmPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;
    if (pinCode.length !== 4 && pinCode.length !== 5) {
      setPinError('Please enter your 4 or 5 digit Mobile Money PIN');
      return;
    }

    setIsSubmitting(true);
    setPinError('');

    try {
      const res = await fetch('/api/donations/simulate-pin-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: transaction.id,
          pin: pinCode
        })
      });

      const data = await res.json();
      if (data.success && data.transaction) {
        setTransaction(data.transaction);
        setStep(3);
        onDonationComplete(data.transaction, data.newRaisedAmount);
      } else {
        setPinError(data.error || 'PIN authentication failed.');
      }
    } catch (err) {
      setPinError('Connection timeout during PIN authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header with Provider Branding */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                {step === 3 ? 'Donation Confirmed!' : 'Mobile Money Donation'}
              </h3>
              <p className="text-xs text-slate-400">
                To: <span className="text-slate-200 font-semibold">{campaign.title}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Input Donation Details & Phone */}
        {step === 1 && (
          <form onSubmit={handleInitiatePayment} className="p-4 sm:p-6 space-y-4">
            
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Select Amount */}
            <div>
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider mb-2">
                Select Amount (UGX)
              </label>

              <div className="grid grid-cols-3 gap-2 mb-2">
                {PRESET_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAmountSelect(val)}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      amount === val
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {formatUGX(val)}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                  UGX
                </span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  placeholder="Custom amount in UGX"
                  min={2000}
                  className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Select Mobile Money Provider */}
            <div>
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider mb-2">
                Payment Channel (Uganda)
              </label>

              <div className="grid grid-cols-3 gap-2">
                {/* MTN */}
                <button
                  type="button"
                  onClick={() => setProvider('mtn')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    provider === 'mtn'
                      ? 'bg-yellow-400/20 border-yellow-500 ring-2 ring-yellow-400 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center font-black text-slate-900 text-xs shadow-sm">
                    MTN
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">MTN MoMo</span>
                  <span className="text-[9px] text-slate-500">*165#</span>
                </button>

                {/* Airtel */}
                <button
                  type="button"
                  onClick={() => setProvider('airtel')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    provider === 'airtel'
                      ? 'bg-red-50 border-red-500 ring-2 ring-red-400 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-black text-white text-xs shadow-sm">
                    Airtel
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Airtel Money</span>
                  <span className="text-[9px] text-slate-500">*185#</span>
                </button>

                {/* Card / Diaspora */}
                <button
                  type="button"
                  onClick={() => setProvider('card')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    provider === 'card'
                      ? 'bg-slate-100 border-slate-900 ring-2 ring-slate-400 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs shadow-sm">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Visa / Card</span>
                  <span className="text-[9px] text-slate-500">Diaspora</span>
                </button>
              </div>
            </div>

            {/* Mobile Phone Number */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Ugandan Mobile Number to Charge
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="0772 123456 / 0701 456789"
                  className="w-full pl-3 pr-20 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600 text-slate-900"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {provider.toUpperCase()}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                A secure USSD prompt will be sent directly to this phone to enter your PIN.
              </span>
            </div>

            {/* Donor Identity */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Your Name</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="e.g. David Mukasa"
                  disabled={isAnonymous}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-emerald-600 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email for Receipt</label>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="david@example.com"
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Words of Encouragement */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Message to Beneficiary</label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write words of cheer or blessings..."
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Anonymous Toggle */}
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Keep my name anonymous on the public donors feed</span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black text-sm rounded-xl shadow-sm border-b-4 border-yellow-600 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Contacting MoMo Gateway...</span>
                </>
              ) : (
                <>
                  <span>PAY {formatUGX(amount)} VIA MOMO</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>National Payment Systems (NPS) Encrypted Gateway</span>
            </div>

          </form>
        )}

        {/* Step 2: Interactive USSD Push & PIN Confirmation Simulator */}
        {step === 2 && transaction && (
          <div className="p-5 sm:p-6 space-y-4">
            
            {/* Phone Screen Simulator Card */}
            <div className="bg-slate-950 text-slate-100 rounded-2xl p-5 border-4 border-slate-800 shadow-2xl space-y-4">
              
              {/* Phone Status Bar */}
              <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-bold uppercase text-emerald-400">
                  {transaction.provider === 'mtn' ? 'MTN MoMo (*165#)' : 'Airtel Money (*185#)'}
                </span>
                <span>{countdown}s remaining</span>
              </div>

              {/* USSD Prompt Box */}
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-center space-y-2">
                <div className="inline-block px-2.5 py-0.5 rounded bg-yellow-400/20 text-yellow-300 text-[10px] font-mono font-bold">
                  {transaction.provider.toUpperCase()} SECURE USSD PUSH
                </div>

                <p className="text-xs font-mono text-slate-200 leading-relaxed">
                  {transaction.ussdPromptText || `Pay UGX ${transaction.amount.toLocaleString()} to UgandaFundMe for ${campaign.title}?`}
                </p>

                <div className="text-[11px] text-emerald-400 font-bold">
                  Target Phone: {formatPhoneNumber(transaction.phoneNumber)}
                </div>
              </div>

              {/* PIN Entry Form */}
              <form onSubmit={handleConfirmPin} className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block text-center mb-1">
                    Enter Your Mobile Money Secret PIN
                  </label>
                  <input
                    type="password"
                    maxLength={5}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="••••"
                    autoFocus
                    className="w-36 mx-auto block text-center tracking-widest text-lg font-mono p-2 bg-slate-800 border-2 border-emerald-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    required
                  />
                  <span className="text-[10px] text-slate-400 block text-center mt-1">
                    (Sandbox simulator: enter any 4-digit PIN e.g. 1234)
                  </span>
                </div>

                {pinError && (
                  <p className="text-xs text-red-400 text-center font-medium">{pinError}</p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel / Edit
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm & Pay</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>

            <p className="text-center text-xs text-slate-500">
              In real production, this prompt appears directly as a native telecom popup on your handset.
            </p>

          </div>
        )}

        {/* Step 3: Verified Official Receipt */}
        {step === 3 && transaction && (
          <div className="p-5 sm:p-6 space-y-4">
            
            {/* Success Banner */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-black text-slate-900">
                Payment Successful & Credited!
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Thank you, <strong>{transaction.donorName}</strong>! Your donation of <strong>{formatUGX(transaction.amount)}</strong> has been instantly credited to the campaign.
              </p>
            </div>

            {/* Official Verifiable Receipt Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-800 space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-sans font-bold text-slate-900">
                <span>KUSANYA.ORG OFFICIAL RECEIPT</span>
                <span className="text-emerald-700 font-bold">VERIFIED</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-bold">{transaction.transactionRef}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Network ID:</span>
                <span>{transaction.networkTransactionId}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Channel:</span>
                <span className="uppercase">{transaction.provider} Mobile Money</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-emerald-800 text-sm">{formatUGX(transaction.amount)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Platform Fee:</span>
                <span className="text-emerald-700 font-bold">UGX 0 (0% Fee)</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span>{new Date(transaction.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Receipt Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="py-2.5 px-3 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow transition-colors cursor-pointer text-center"
              >
                Back to Fundraiser
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
