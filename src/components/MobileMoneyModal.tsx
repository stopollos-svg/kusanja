import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  CreditCard, 
  Download,
  FileText,
  Globe, 
  Info,
  Lock, 
  Printer, 
  RefreshCw, 
  ShieldCheck, 
  Smartphone, 
  X, 
  Zap 
} from 'lucide-react';
import { Campaign, PaymentTransaction } from '../types';
import { api } from '../services/api';
import { detectUgandanProvider, formatPhoneNumber, formatUGX } from '../utils/formatters';
import { generateDonationReceiptPDF } from '../utils/pdfReceiptGenerator';

interface MobileMoneyModalProps {
  campaign: Campaign;
  onClose: () => void;
  onDonationComplete: (tx: PaymentTransaction, newRaisedAmount: number) => void;
}

const PRESET_AMOUNTS_UGX = [10000, 25000, 50000, 100000, 250000, 500000];
const PRESET_AMOUNTS_USD = [5, 10, 25, 50, 100, 200];
const USD_UGX_RATE = 3750;

export const MobileMoneyModal: React.FC<MobileMoneyModalProps> = ({
  campaign,
  onClose,
  onDonationComplete,
}) => {
  // Step 1: Input details -> Step 2: Provider Authorization (USSD PIN / Visa 3DS / PayPal Checkout) -> Step 3: Confirmed Receipt
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [currencyMode, setCurrencyMode] = useState<'UGX' | 'USD'>('UGX');
  const [amountUGX, setAmountUGX] = useState<number>(50000);
  const [customAmountStr, setCustomAmountStr] = useState<string>('50000');
  
  // Payment Provider: 'mtn' | 'airtel' | 'visa' | 'paypal'
  const [provider, setProvider] = useState<'mtn' | 'airtel' | 'visa' | 'paypal'>('mtn');
  
  // Donor details
  const [donorName, setDonorName] = useState<string>('');
  const [donorEmail, setDonorEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('Wishing full recovery, blessings and success.');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  // MoMo specific details
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  // Visa specific details
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [cardHolderName, setCardHolderName] = useState<string>('');
  const [billingCountry, setBillingCountry] = useState<string>('Uganda');

  // PayPal specific details
  const [paypalEmail, setPaypalEmail] = useState<string>('');

  // 5% App Maintenance Fee Calculations
  const platformFeeUGX = Math.round(amountUGX * 0.05);
  const netBeneficiaryAmountUGX = amountUGX - platformFeeUGX;

  // Authorization & Processing State
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [authCode, setAuthCode] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(60);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Handle currency mode switch
  const handleCurrencyModeChange = (mode: 'UGX' | 'USD') => {
    setCurrencyMode(mode);
    if (mode === 'USD') {
      const approxUSD = Math.max(5, Math.round(amountUGX / USD_UGX_RATE));
      setCustomAmountStr(String(approxUSD));
    } else {
      setCustomAmountStr(String(amountUGX));
    }
  };

  // Handle amount chip selection
  const handleAmountSelect = (val: number, isUSD: boolean = false) => {
    if (isUSD) {
      const ugx = val * USD_UGX_RATE;
      setAmountUGX(ugx);
      setCustomAmountStr(String(val));
    } else {
      setAmountUGX(val);
      setCustomAmountStr(String(val));
    }
  };

  // Handle custom input
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmountStr(val);
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      if (currencyMode === 'USD') {
        setAmountUGX(Math.round(num * USD_UGX_RATE));
      } else {
        setAmountUGX(num);
      }
    }
  };

  // Auto-detect Ugandan provider when phone number is typed
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPhoneNumber(val);
    const detected = detectUgandanProvider(val);
    if (detected === 'mtn' || detected === 'airtel') {
      setProvider(detected);
    }
  };

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = [];
    for (let i = 0; i < raw.length && i < 16; i += 4) {
      parts.push(raw.substring(i, i + 4));
    }
    setCardNumber(parts.join(' '));
  };

  // Format Card Expiry MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/gi, '');
    if (raw.length <= 2) {
      setCardExpiry(raw);
    } else {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2, 4)}`);
    }
  };

  // Step 1 -> Step 2: Initiate Payment Gateway Request
  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (amountUGX < 1000) {
      setErrorMsg('Minimum donation amount is UGX 1,000 (approx $0.30 USD).');
      return;
    }

    if (provider === 'mtn' || provider === 'airtel') {
      if (!phoneNumber || phoneNumber.length < 9) {
        setErrorMsg('Please enter a valid Ugandan phone number (e.g. 0772 123456 or 0701 456789).');
        return;
      }
    } else if (provider === 'visa') {
      const cleanCard = cardNumber.replace(/\s+/g, '');
      if (cleanCard.length < 13) {
        setErrorMsg('Please enter a valid 16-digit Visa or Debit Card number.');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        setErrorMsg('Please enter card expiry date (MM/YY).');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setErrorMsg('Please enter 3-digit CVV security code on the back of your card.');
        return;
      }
    } else if (provider === 'paypal') {
      if (!paypalEmail && !donorEmail) {
        setErrorMsg('Please enter your PayPal account email address to proceed.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const data = await api.initiateDonation({
        campaignId: campaign.id,
        amount: amountUGX,
        provider,
        donorPhone: phoneNumber,
        donorEmail: donorEmail || (provider === 'paypal' ? paypalEmail : undefined),
        donorName: isAnonymous ? 'Anonymous' : (donorName || cardHolderName || 'Generous Donor'),
        message,
        isAnonymous,
        cardDetails: provider === 'visa' ? {
          cardNumber: cardNumber.replace(/\s+/g, ''),
          cardExpiry,
          cardHolderName: cardHolderName || donorName || 'Visa Donor',
          billingCountry
        } : undefined,
        paypalEmail: provider === 'paypal' ? (paypalEmail || donorEmail) : undefined
      });

      if (data.success && data.transaction) {
        setTransaction(data.transaction);
        setStep(2);
        setCountdown(60);
      } else {
        setErrorMsg(data.error || 'Failed to initiate payment.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Network error connecting to payment gateway.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Countdown timer for authorization screen
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

  // Step 2 -> Step 3: Confirm PIN / 3DS OTP / PayPal Checkout
  const handleConfirmAuthorization = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!transaction) return;

    if (provider === 'mtn' || provider === 'airtel') {
      if (authCode.length < 4) {
        setAuthError('Please enter your 4 or 5 digit Mobile Money PIN');
        return;
      }
    } else if (provider === 'visa') {
      if (authCode.length < 4) {
        setAuthError('Please enter the 4 to 6 digit 3D-Secure Bank OTP sent to your phone/email');
        return;
      }
    }

    setIsSubmitting(true);
    setAuthError('');

    try {
      const data = await api.confirmDonation({
        reference: transaction.reference,
        pin: authCode || '1234',
        otp: authCode || '123456',
        transaction
      });

      if (data.success && data.transaction) {
        setTransaction(data.transaction);
        setStep(3);
        onDonationComplete(data.transaction, data.newRaisedAmount || (campaign.raisedAmount + data.transaction.amount));
      } else {
        setAuthError('Authentication failed. Please verify your details.');
      }
    } catch (err) {
      setAuthError('Connection timeout during authorization.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const approxUSD = (amountUGX / USD_UGX_RATE).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 my-0 sm:my-6 max-h-[94vh] sm:max-h-[90vh] flex flex-col"
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
              {provider === 'visa' ? (
                <CreditCard className="w-4 h-4 text-white" />
              ) : provider === 'paypal' ? (
                <Globe className="w-4 h-4 text-white" />
              ) : (
                <Smartphone className="w-4 h-4 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                {step === 3 ? 'Donation Confirmed!' : 'Donate to Fundraiser'}
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-[220px] sm:max-w-xs">
                To: <span className="text-slate-200 font-semibold">{campaign.title}</span>
              </p>
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

        {/* Step 1: Select Method & Amount & Details */}
        {step === 1 && (
          <form onSubmit={handleInitiatePayment} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 pb-8 sm:pb-6">
            
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Payment Channel Selector: MoMo, Visa, PayPal */}
            <div>
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider mb-2">
                Select Payment Method
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* MTN MoMo */}
                <button
                  type="button"
                  onClick={() => setProvider('mtn')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    provider === 'mtn'
                      ? 'bg-yellow-400/20 border-yellow-500 ring-2 ring-yellow-400 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center font-black text-slate-900 text-[10px] shadow-sm">
                    MTN
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">MTN MoMo</span>
                  <span className="text-[9px] text-slate-500">*165# (UG)</span>
                </button>

                {/* Airtel Money */}
                <button
                  type="button"
                  onClick={() => setProvider('airtel')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    provider === 'airtel'
                      ? 'bg-red-50 border-red-500 ring-2 ring-red-400 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center font-black text-white text-[10px] shadow-sm">
                    AIR
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Airtel Money</span>
                  <span className="text-[9px] text-slate-500">*185# (UG)</span>
                </button>

                {/* Visa / Card */}
                <button
                  type="button"
                  onClick={() => setProvider('visa')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    provider === 'visa'
                      ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-white text-[10px] font-black shadow-sm tracking-tighter">
                    VISA
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Visa / Card</span>
                  <span className="text-[9px] text-blue-600 font-semibold">Global / Diaspora</span>
                </button>

                {/* PayPal */}
                <button
                  type="button"
                  onClick={() => setProvider('paypal')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    provider === 'paypal'
                      ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-400 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-sky-600 flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                    PP
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">PayPal</span>
                  <span className="text-[9px] text-sky-600 font-semibold">Instant Global</span>
                </button>
              </div>
            </div>

            {/* 2. Amount Selection with UGX / USD Toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Donation Amount
                </label>

                {/* Currency Mode Switch */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => handleCurrencyModeChange('UGX')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer text-[11px] ${
                      currencyMode === 'UGX' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    UGX (Shs)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCurrencyModeChange('USD')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer text-[11px] ${
                      currencyMode === 'USD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    USD ($)
                  </button>
                </div>
              </div>

              {/* Amount Chips */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                {currencyMode === 'UGX' ? (
                  PRESET_AMOUNTS_UGX.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleAmountSelect(val, false)}
                      className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        amountUGX === val
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {formatUGX(val)}
                    </button>
                  ))
                ) : (
                  PRESET_AMOUNTS_USD.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleAmountSelect(val, true)}
                      className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        amountUGX === val * USD_UGX_RATE
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      ${val} USD
                    </button>
                  ))
                )}
              </div>

              {/* Custom Amount Input */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                  {currencyMode === 'UGX' ? 'UGX' : 'USD $'}
                </span>
                <input
                  type="number"
                  value={customAmountStr}
                  onChange={handleCustomAmountChange}
                  placeholder={currencyMode === 'UGX' ? 'Enter amount in UGX' : 'Enter amount in USD'}
                  min={currencyMode === 'UGX' ? 1000 : 1}
                  className="w-full pl-14 pr-24 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600 text-slate-900"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-500">
                  {currencyMode === 'UGX' ? `≈ $${approxUSD} USD` : `≈ ${formatUGX(amountUGX)}`}
                </span>
              </div>

              {/* Transparent 5% Maintenance Fee Notice */}
              <div className="mt-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Donation:</span>
                  <span className="font-semibold text-slate-900">{formatUGX(amountUGX)} (~${approxUSD} USD)</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>App Maintenance & Telecom Gateway (5%):</span>
                  <span className="font-semibold text-slate-700">{formatUGX(platformFeeUGX)}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold pt-1 border-t border-slate-200">
                  <span>Net Credited to Beneficiary (95%):</span>
                  <span>{formatUGX(netBeneficiaryAmountUGX)}</span>
                </div>
              </div>
            </div>

            {/* 3. Provider-Specific Fields */}
            
            {/* A. Mobile Money (MTN / Airtel) */}
            {(provider === 'mtn' || provider === 'airtel') && (
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
                    {provider.toUpperCase()} MoMo
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">
                  A secure USSD prompt will be sent to your handset to enter your Mobile Money PIN.
                </span>
              </div>
            )}

            {/* B. Visa / Mastercard Card Form */}
            {provider === 'visa' && (
              <div className="space-y-3 bg-blue-50/40 p-3.5 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Visa / Mastercard Details</span>
                  <span className="text-[10px] text-blue-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>256-Bit 3D-Secure 2.0</span>
                  </span>
                </div>

                {/* Card Number */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={19}
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4242 •••• •••• 4242"
                      className="w-full pl-3 pr-14 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-blue-600"
                      required
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <span className="bg-blue-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded">VISA</span>
                      <span className="bg-amber-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">MC</span>
                    </div>
                  </div>
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="12/28"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:border-blue-600 text-center"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">CVV / CVC (3-digits)</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="•••"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:border-blue-600 text-center"
                      required
                    />
                  </div>
                </div>

                {/* Cardholder Name & Country */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Name on Card</label>
                    <input
                      type="text"
                      value={cardHolderName}
                      onChange={(e) => setCardHolderName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Billing Country</label>
                    <select
                      value={billingCountry}
                      onChange={(e) => setBillingCountry(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-600"
                    >
                      <option value="Uganda">Uganda (UG)</option>
                      <option value="United States">United States (US)</option>
                      <option value="United Kingdom">United Kingdom (UK)</option>
                      <option value="Canada">Canada (CA)</option>
                      <option value="United Arab Emirates">United Arab Emirates (UAE)</option>
                      <option value="Kenya">Kenya (KE)</option>
                      <option value="Rwanda">Rwanda (RW)</option>
                      <option value="South Africa">South Africa (ZA)</option>
                      <option value="Germany">Germany (DE)</option>
                      <option value="Australia">Australia (AU)</option>
                      <option value="Other">Other Country</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* C. PayPal Form */}
            {provider === 'paypal' && (
              <div className="space-y-3 bg-sky-50/50 p-3.5 rounded-xl border border-sky-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">PayPal Global Giving</span>
                  <span className="text-[10px] text-sky-700 font-bold flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Instant USD/UGX Conversion</span>
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">PayPal Account Email</label>
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="paypal-donor@example.com"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-sky-600"
                    required
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    You can authorize this donation instantly using PayPal Buyer & Giving Protection.
                  </span>
                </div>
              </div>
            )}

            {/* 4. Donor Identity & Message */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="e.g. Sarah Namubiru"
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
                  placeholder="sarah@example.com"
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
                placeholder="Share words of prayer or encouragement..."
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
              className={`w-full py-3.5 text-slate-900 font-black text-sm rounded-xl shadow-sm border-b-4 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                provider === 'visa'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-800'
                  : provider === 'paypal'
                  ? 'bg-sky-500 hover:bg-sky-400 text-white border-sky-700'
                  : 'bg-yellow-400 hover:bg-yellow-300 text-slate-900 border-yellow-600'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting to {provider.toUpperCase()} Gateway...</span>
                </>
              ) : (
                <>
                  <span>
                    DONATE {formatUGX(amountUGX)} (~${approxUSD} USD) VIA {provider.toUpperCase()}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Uganda NPS Encrypted Gateway • Visa 3DS • PayPal Global • Kusanya.org</span>
            </div>

          </form>
        )}

        {/* Step 2: Interactive Authorization Simulator (USSD PIN / Visa 3DS OTP / PayPal Checkout) */}
        {step === 2 && transaction && (
          <div className="p-5 sm:p-6 space-y-4">
            
            {/* Phone Screen Simulator for MoMo */}
            {(transaction.provider === 'mtn' || transaction.provider === 'airtel') && (
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
                    {transaction.ussdPromptText || `Pay UGX ${transaction.amount.toLocaleString()} to Kusanya.org for ${campaign.title}? (Net ${formatUGX(transaction.netBeneficiaryAmount || Math.round(transaction.amount * 0.95))} to cause)`}
                  </p>

                  <div className="text-[11px] text-emerald-400 font-bold">
                    Target Handset: {formatPhoneNumber(transaction.phoneNumber)}
                  </div>
                </div>

                {/* PIN Entry Form */}
                <form onSubmit={handleConfirmAuthorization} className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block text-center mb-1">
                      Enter Your Mobile Money Secret PIN
                    </label>
                    <input
                      type="password"
                      maxLength={5}
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value)}
                      placeholder="••••"
                      autoFocus
                      className="w-36 mx-auto block text-center tracking-widest text-lg font-mono p-2 bg-slate-800 border-2 border-emerald-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      required
                    />
                    <span className="text-[10px] text-slate-400 block text-center mt-1">
                      (Enter any 4-digit PIN e.g. 1234)
                    </span>
                  </div>

                  {authError && (
                    <p className="text-xs text-red-400 text-center font-medium">{authError}</p>
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
            )}

            {/* Visa 3D-Secure 2.0 Simulator */}
            {(transaction.provider === 'visa' || transaction.provider === 'card') && (
              <div className="bg-white border-2 border-blue-600 rounded-2xl p-5 shadow-2xl space-y-4">
                
                {/* 3DS Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-700 text-white text-xs font-black px-2 py-0.5 rounded">VISA</span>
                    <span className="text-xs font-bold text-slate-800">Verified by Visa (3D Secure 2.0)</span>
                  </div>
                  <span className="text-xs text-slate-500">{countdown}s</span>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <p className="font-semibold text-slate-900">
                    A One-Time Password (OTP) has been sent by your issuing bank to authenticate this transaction.
                  </p>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Merchant:</span>
                      <span className="font-bold">Kusanya.org (Uganda)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Amount:</span>
                      <span className="font-bold text-blue-700">{formatUGX(transaction.amount)} (~${approxUSD} USD)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Transaction Ref:</span>
                      <span className="font-mono">{transaction.reference}</span>
                    </div>
                  </div>
                </div>

                {/* OTP Input Form */}
                <form onSubmit={handleConfirmAuthorization} className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block text-center mb-1">
                      Enter 6-Digit Bank SMS / Email OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value)}
                      placeholder="123456"
                      autoFocus
                      className="w-40 mx-auto block text-center tracking-widest text-lg font-mono p-2 bg-white border-2 border-blue-600 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                    <span className="text-[10px] text-slate-500 block text-center mt-1">
                      (Enter any 6-digit code e.g. 123456 to approve)
                    </span>
                  </div>

                  {authError && (
                    <p className="text-xs text-red-600 text-center font-medium">{authError}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Authorizing Card...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Authorize Visa Payment</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

              </div>
            )}

            {/* PayPal Checkout Simulator */}
            {transaction.provider === 'paypal' && (
              <div className="bg-sky-50 border-2 border-sky-500 rounded-2xl p-5 shadow-2xl space-y-4">
                
                {/* PayPal Header */}
                <div className="flex items-center justify-between border-b border-sky-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-sky-600 text-white text-xs font-black px-2 py-0.5 rounded">PayPal</span>
                    <span className="text-xs font-bold text-slate-800">Express Checkout Window</span>
                  </div>
                  <span className="text-xs text-emerald-700 font-bold">Encrypted</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-sky-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>PayPal Account:</span>
                    <span className="font-bold text-slate-900">{paypalEmail || donorEmail || 'donor@paypal.com'}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Donation Recipient:</span>
                    <span className="font-semibold text-slate-900 truncate max-w-[200px]">{campaign.title}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-1.5 text-sm font-bold">
                    <span>Total Amount (USD):</span>
                    <span className="text-sky-700">${approxUSD} USD ({formatUGX(transaction.amount)})</span>
                  </div>
                </div>

                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => handleConfirmAuthorization()}
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black text-sm rounded-xl shadow-md border-b-4 border-yellow-600 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Capturing PayPal Donation...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Donation with PayPal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Cancel and return to donation options
                  </button>
                </div>

              </div>
            )}

            <p className="text-center text-xs text-slate-500">
              Kusanya.org ensures all payment streams are instantly encrypted and credited directly to the cause.
            </p>

          </div>
        )}

        {/* Step 3: Verified Official Printable Receipt */}
        {step === 3 && transaction && (
          <div className="p-5 sm:p-6 space-y-4">
            
            {/* Success Banner */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-black text-slate-900">
                Donation Successful & Credited!
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Thank you, <strong>{transaction.donorName}</strong>! Your donation of <strong>{formatUGX(transaction.amount)}</strong> (~${(transaction.amount / USD_UGX_RATE).toFixed(2)} USD) has been credited to the fundraiser.
              </p>
            </div>

            {/* Official Verifiable Receipt Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-800 space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-sans font-bold text-slate-900">
                <span>KUSANYA.ORG OFFICIAL RECEIPT</span>
                <span className="text-emerald-700 font-bold">VERIFIED</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Beneficiary Cause:</span>
                <span className="font-bold font-sans text-right truncate max-w-[200px]">{campaign.title}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Transaction Ref:</span>
                <span className="font-bold">{transaction.transactionRef || transaction.reference}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Network ID:</span>
                <span>{transaction.networkTransactionId || transaction.networkRef}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Payment Channel:</span>
                <span className="uppercase font-bold text-slate-900">
                  {transaction.provider === 'visa' 
                    ? 'Visa Card (3D Secure)' 
                    : transaction.provider === 'paypal' 
                    ? 'PayPal Global Giving' 
                    : `${transaction.provider.toUpperCase()} Mobile Money`}
                </span>
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-1.5 font-sans">
                <span className="text-slate-500">Gross Amount Paid:</span>
                <span className="font-black text-slate-900 text-sm">
                  {formatUGX(transaction.amount)} (~${(transaction.amount / USD_UGX_RATE).toFixed(2)} USD)
                </span>
              </div>

              <div className="flex justify-between font-sans">
                <span className="text-slate-500">App Maintenance Fee (5%):</span>
                <span className="text-slate-700 font-semibold">
                  {formatUGX(transaction.platformFee || Math.round(transaction.amount * 0.05))}
                </span>
              </div>

              <div className="flex justify-between font-sans text-emerald-800 font-bold">
                <span>Net Credited to Beneficiary (95%):</span>
                <span className="text-sm">
                  {formatUGX(transaction.netBeneficiaryAmount || Math.round(transaction.amount * 0.95))}
                </span>
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="text-slate-500 font-sans">Timestamp:</span>
                <span className="text-[11px]">{new Date(transaction.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Receipt Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  generateDonationReceiptPDF({
                    transaction,
                    campaignTitle: campaign.title,
                    campaignCategory: campaign.category,
                    organizerName: campaign.organizerName,
                    beneficiaryName: campaign.beneficiaryName,
                    beneficiaryPhone: campaign.beneficiaryPhone || campaign.organizerPhone,
                  });
                }}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD OFFICIAL PDF RECEIPT</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
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
                  className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                >
                  Back to Fundraiser
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
