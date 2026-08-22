import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Church,
  Coins,
  GraduationCap, 
  HeartHandshake, 
  Image as ImageIcon, 
  Landmark,
  MapPin, 
  RefreshCw, 
  ShieldCheck, 
  Smartphone, 
  Sparkles, 
  Stethoscope, 
  X 
} from 'lucide-react';
import { Campaign } from '../types';
import { formatUGX } from '../utils/formatters';

interface CreateCampaignModalProps {
  onClose: () => void;
  onCampaignCreated: (newCampaign: Campaign) => void;
}

const DISTRICTS = [
  'Kampala', 'Wakiso', 'Gulu', 'Jinja', 'Mbarara', 'Mbale', 
  'Fort Portal', 'Arua', 'Lira', 'Masaka', 'Soroti', 'Mukono', 
  'Kasese', 'Kabale', 'Tororo', 'Entebbe'
];

const DEFAULT_IMAGES = [
  { label: 'Church / Ministry', url: 'https://images.unsplash.com/photo-1548625361-195972844e13?auto=format&fit=crop&w=1200&q=80' },
  { label: 'SACCO / Group Savings', url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Medical / Hospital', url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80' },
  { label: 'School / Education', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Community / Water', url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Youth Agribusiness', url: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=1200&q=80' },
];

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  onClose,
  onCampaignCreated,
}) => {
  const [step, setStep] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'medical' | 'education' | 'emergency' | 'community' | 'business' | 'faith' | 'sacco'>('faith');
  const [district, setDistrict] = useState('Kampala');
  const [region, setRegion] = useState('Central');
  const [targetAmount, setTargetAmount] = useState<string>('5000000');
  const [story, setStory] = useState('');
  const [image, setImage] = useState(DEFAULT_IMAGES[0].url);
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryRelationship, setBeneficiaryRelationship] = useState('Self');
  const [organizerName, setOrganizerName] = useState('');
  const [organizerPhone, setOrganizerPhone] = useState('');
  const [payoutProvider, setPayoutProvider] = useState<'mtn' | 'airtel'>('mtn');
  const [payoutPhone, setPayoutPhone] = useState('');

  // AI Assistant state
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiNotes, setAiNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleDistrictChange = (d: string) => {
    setDistrict(d);
    if (['Kampala', 'Wakiso', 'Mukono', 'Masaka', 'Entebbe'].includes(d)) {
      setRegion('Central');
    } else if (['Jinja', 'Mbale', 'Soroti', 'Tororo'].includes(d)) {
      setRegion('Eastern');
    } else if (['Gulu', 'Arua', 'Lira'].includes(d)) {
      setRegion('Northern');
    } else {
      setRegion('Western');
    }
  };

  const handleGenerateWithAI = async () => {
    setIsGeneratingAI(true);
    setError('');

    try {
      const res = await fetch('/api/ai/generate-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beneficiary: beneficiaryName || 'Family member',
          needType: category,
          district,
          targetAmountUGX: Number(targetAmount) || 5000000,
          rawNotes: aiNotes || `Need urgent help with ${category} costs in ${district}`
        })
      });

      const data = await res.json();
      if (data.success && data.generated) {
        if (data.generated.title) setTitle(data.generated.title);
        if (data.generated.story) setStory(data.generated.story);
      }
    } catch (err) {
      console.error(err);
      setError('AI service temporarily unavailable. You can type your story manually.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount || !story || !organizerName || !organizerPhone) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          region,
          district,
          targetAmount: Number(targetAmount),
          story,
          image,
          beneficiaryName: beneficiaryName || organizerName,
          beneficiaryRelationship,
          organizerName,
          organizerPhone,
          payoutProvider,
          payoutPhone: payoutPhone || organizerPhone
        })
      });

      const data = await res.json();
      if (data.success && data.campaign) {
        onCampaignCreated(data.campaign);
        onClose();
      } else {
        setError(data.error || 'Failed to create campaign');
      }
    } catch (err) {
      setError('Network error creating campaign.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Start a Ugandan Fundraiser</span>
            </h3>
            <p className="text-xs text-slate-400">
              Raise funds directly in UGX via MTN Mobile Money & Airtel Money
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Header */}
        <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span className={step === 1 ? 'text-emerald-700 font-bold' : ''}>1. Basic Details</span>
          <span>→</span>
          <span className={step === 2 ? 'text-emerald-700 font-bold' : ''}>2. Story & AI Assistant</span>
          <span>→</span>
          <span className={step === 3 ? 'text-emerald-700 font-bold' : ''}>3. Mobile Money Payout</span>
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 text-xs p-3 border-b border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          
          {/* STEP 1: Basic Cause & Target */}
          {step === 1 && (
            <div className="space-y-4">
              
              {/* Category */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                  Fundraiser Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'faith', label: 'Church / Ministry', icon: Church },
                    { id: 'sacco', label: 'SACCO / Savings Group', icon: Landmark },
                    { id: 'medical', label: 'Medical & Surgery', icon: Stethoscope },
                    { id: 'education', label: 'School Tuition', icon: GraduationCap },
                    { id: 'community', label: 'Water / Solar', icon: HeartHandshake },
                    { id: 'emergency', label: 'Disaster Relief', icon: Sparkles },
                    { id: 'business', label: 'Youth Agribusiness', icon: Building2 },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Fundraiser Headline
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mulago Hospital Emergency Pediatric Care for Baby Trevor"
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              {/* District & Region */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    District in Uganda
                  </label>
                  <select
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Target Goal (UGX)
                  </label>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="5000000"
                    min={10000}
                    className="w-full p-2.5 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
                    required
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Formatted: {formatUGX(Number(targetAmount) || 0)}
                  </span>
                </div>
              </div>

              {/* Photo Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Cover Photo
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {DEFAULT_IMAGES.map((img) => (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() => setImage(img.url)}
                      className={`h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        image === img.url ? 'border-emerald-500 ring-2 ring-emerald-400' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-md cursor-pointer"
                >
                  Next: Write Story →
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: Story & Gemini AI Assistant */}
          {step === 2 && (
            <div className="space-y-4">
              
              {/* Beneficiary details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Beneficiary Full Name
                  </label>
                  <input
                    type="text"
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryName(e.target.value)}
                    placeholder="e.g. Trevor Sserwadda"
                    className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Relationship
                  </label>
                  <input
                    type="text"
                    value={beneficiaryRelationship}
                    onChange={(e) => setBeneficiaryRelationship(e.target.value)}
                    placeholder="e.g. Mother / Headteacher / Friend"
                    className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Gemini AI Story Assistant Box */}
              <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gemini AI Fundraising Story Writer</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Ugandan Context</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Provide brief notes below, and Gemini AI will draft an authentic, compassionate appeal in Ugandan Shillings with transparency breakdown.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiNotes}
                    onChange={(e) => setAiNotes(e.target.value)}
                    placeholder="e.g. Namirembe Cathedral youth roof renovation / Kasubi market SACCO revolving fund / Mulago heart surgery..."
                    className="flex-1 p-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateWithAI}
                    disabled={isGeneratingAI}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-sm"
                  >
                    {isGeneratingAI ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Drafting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Appeal</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Story Field */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Campaign Story & Budget Breakdown
                </label>
                <textarea
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  rows={6}
                  placeholder="Explain why you are raising funds, what the money will be spent on, and thank donors in advance..."
                  className="w-full p-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 leading-relaxed"
                  required
                />
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-md cursor-pointer"
                >
                  Next: Payout Setup →
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: Organizer & Payout Phone */}
          {step === 3 && (
            <div className="space-y-4">
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  All Mobile Money donations made to your fundraiser can be withdrawn in real-time to your registered Ugandan MTN or Airtel phone number.
                </p>
              </div>

              {/* Organizer Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Organizer Full Name (As registered on MoMo ID)
                </label>
                <input
                  type="text"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  placeholder="e.g. Sarah Nalubega"
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Organizer Contact Phone
                </label>
                <input
                  type="tel"
                  value={organizerPhone}
                  onChange={(e) => setOrganizerPhone(e.target.value)}
                  placeholder="0772 458912"
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              {/* Payout Provider & Number */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Mobile Money Payout Account
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutProvider('mtn')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      payoutProvider === 'mtn'
                        ? 'bg-yellow-400 text-slate-900 border-yellow-500 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>MTN MoMo (*165#)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutProvider('airtel')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      payoutProvider === 'airtel'
                        ? 'bg-red-600 text-white border-red-700 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>Airtel Money (*185#)</span>
                  </button>
                </div>

                <input
                  type="tel"
                  value={payoutPhone}
                  onChange={(e) => setPayoutPhone(e.target.value)}
                  placeholder="Registered MoMo Payout Phone (e.g. 0772 458912)"
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 mt-2"
                />
              </div>

              <div className="pt-3 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-full shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Publishing Fundraiser...' : '🚀 Launch Fundraiser Live'}
                </button>
              </div>

            </div>
          )}

        </form>

      </div>

    </div>
  );
};
