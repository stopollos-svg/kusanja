import React, { useState } from 'react';
import { 
  AlertCircle, 
  Check, 
  CheckCircle2, 
  Clock,
  DollarSign, 
  FileText, 
  Flame,
  Image as ImageIcon, 
  MapPin, 
  Phone, 
  Save, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  Timer,
  User, 
  X 
} from 'lucide-react';
import { Campaign } from '../types';

interface EditCampaignModalProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Campaign) => Promise<void>;
}

const CATEGORIES = [
  { id: 'medical', label: 'Medical & Surgery' },
  { id: 'faith', label: 'Churches & Ministry' },
  { id: 'sacco', label: 'SACCOs & Community Groups' },
  { id: 'emergency', label: 'Emergency Relief' },
  { id: 'education', label: 'School Fees & Tuition' },
  { id: 'community', label: 'Clean Water & Solar' },
  { id: 'business', label: 'Youth Enterprise & Farming' },
  { id: 'memorial', label: 'Memorial & Funeral' },
];

const REGIONS = ['Central', 'Eastern', 'Northern', 'Western'];

export const EditCampaignModal: React.FC<EditCampaignModalProps> = ({
  campaign,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(campaign.title);
  const [tagline, setTagline] = useState(campaign.tagline || '');
  const [category, setCategory] = useState(campaign.category);
  const [region, setRegion] = useState(campaign.region);
  const [district, setDistrict] = useState(campaign.district);
  const [targetAmount, setTargetAmount] = useState(campaign.targetAmount.toString());
  const [raisedAmount, setRaisedAmount] = useState(campaign.raisedAmount.toString());
  const [story, setStory] = useState(campaign.story);
  const [image, setImage] = useState(campaign.image);
  const [featured, setFeatured] = useState(campaign.featured);
  const [status, setStatus] = useState(campaign.status);
  const [organizerName, setOrganizerName] = useState(campaign.organizerName);
  const [organizerPhone, setOrganizerPhone] = useState(campaign.organizerPhone);
  const [organizerKycVerified, setOrganizerKycVerified] = useState(campaign.organizerKycVerified);
  const [payoutPhone, setPayoutPhone] = useState(campaign.payoutPhone || campaign.organizerPhone);
  const [payoutProvider, setPayoutProvider] = useState(campaign.payoutProvider || 'mtn');
  const [beneficiaryName, setBeneficiaryName] = useState(campaign.beneficiaryName || '');

  // 1-Year Sustained Activity & Spotlight fields
  const [activeDurationMonths, setActiveDurationMonths] = useState(
    campaign.activeDurationMonths !== undefined ? campaign.activeDurationMonths.toString() : '12'
  );
  const [activeDurationDays, setActiveDurationDays] = useState(
    campaign.activeDurationDays !== undefined ? campaign.activeDurationDays.toString() : '365'
  );
  const [spotlightEligible1Year, setSpotlightEligible1Year] = useState(
    campaign.spotlightEligible1Year ?? true
  );
  const [spotlightBadge, setSpotlightBadge] = useState(
    campaign.spotlightBadge || '⚡ 1-Year Sustained Spotlight'
  );
  const [spotlightReason, setSpotlightReason] = useState(
    campaign.spotlightReason || 'Over 12 months of active community updates & continuous MoMo donations.'
  );
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !story.trim()) {
      setError('Title and Story are required.');
      return;
    }

    const numTarget = Number(targetAmount);
    if (isNaN(numTarget) || numTarget <= 0) {
      setError('Please provide a valid target amount.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const updatedData: Campaign = {
        ...campaign,
        title: title.trim(),
        tagline: tagline.trim() || title.trim().slice(0, 80),
        category: category as any,
        region,
        district: district.trim(),
        targetAmount: numTarget,
        raisedAmount: Number(raisedAmount) || campaign.raisedAmount,
        story: story.trim(),
        image: image.trim() || campaign.image,
        featured,
        status: status as any,
        organizerName: organizerName.trim(),
        organizerPhone: organizerPhone.trim(),
        organizerKycVerified,
        payoutPhone: payoutPhone.trim(),
        payoutProvider: payoutProvider as any,
        beneficiaryName: beneficiaryName.trim() || organizerName.trim(),
        // Longevity fields
        activeDurationMonths: Number(activeDurationMonths) || 0,
        activeDurationDays: Number(activeDurationDays) || 0,
        spotlightEligible1Year,
        spotlightBadge: spotlightBadge.trim(),
        spotlightReason: spotlightReason.trim(),
      };

      await onSave(updatedData);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-0 sm:my-6 max-h-[94dvh] sm:max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle indicator */}
        <div className="sm:hidden w-full flex items-center justify-center pt-2.5 pb-1 bg-slate-900">
          <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="bg-slate-900 px-4 sm:px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                Admin Campaign Editor
              </span>
              <h3 className="text-base sm:text-lg font-black text-white truncate max-w-[200px] sm:max-w-md">
                Edit Fundraiser Details
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Featured Spotlight Toggle Banner */}
          <div className={`p-4 rounded-2xl border transition-all ${
            featured 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-950'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${featured ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'bg-slate-200 text-slate-500'}`}>
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="text-sm font-black">
                    Featured Fundraiser on Top (Hero Spotlight)
                  </h4>
                  <p className="text-xs text-slate-500">
                    {featured 
                      ? 'This fundraiser is currently pinned on top in the GoFundMe-style Hero Spotlight.'
                      : 'Enable to highlight this fundraiser as a lead spotlight cause on the homepage.'}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>

          {/* 1-Year Sustained Activity & Spotlight Eligibility Engine */}
          <div className="p-4 bg-slate-900 text-white border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Timer className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
                    1-Year Sustained Activity Spotlight Protocol
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Control active duration (≥12 months) and custom spotlight badge reasoning
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={spotlightEligible1Year}
                  onChange={(e) => setSpotlightEligible1Year(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                />
                <span className="text-xs font-bold text-amber-300">Eligible for 1-Yr Spotlight</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  Active Duration (Months)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={activeDurationMonths}
                  onChange={(e) => {
                    setActiveDurationMonths(e.target.value);
                    setActiveDurationDays((Number(e.target.value) * 30.5).toFixed(0));
                  }}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  Total Active Days
                </label>
                <input
                  type="number"
                  value={activeDurationDays}
                  onChange={(e) => setActiveDurationDays(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Spotlight Badge Text
                </label>
                <input
                  type="text"
                  value={spotlightBadge}
                  onChange={(e) => setSpotlightBadge(e.target.value)}
                  placeholder="⚡ 1-Year Sustained Spotlight"
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Spotlight Reason / Impact
                </label>
                <input
                  type="text"
                  value={spotlightReason}
                  onChange={(e) => setSpotlightReason(e.target.value)}
                  placeholder="Over 12 months of active community updates & continuous MoMo donations."
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Title and Tagline */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Campaign Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Short Tagline / Summary
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Financials & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Amount (UGX)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Raised Amount (UGX)
              </label>
              <input
                type="number"
                value={raisedAmount}
                onChange={(e) => setRaisedAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-emerald-700 focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Campaign Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
              >
                <option value="active">Active (Collecting)</option>
                <option value="completed">Completed / Goal Met</option>
                <option value="paused">Paused / Under Review</option>
              </select>
            </div>
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cause Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Region
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r} Region
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                District / Location
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                required
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
              Primary Photo URL
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
            />
            {image && (
              <div className="mt-2 h-24 w-full rounded-xl overflow-hidden border border-slate-200">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Story Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Full Fundraiser Story & Transparency Breakdown
            </label>
            <textarea
              rows={6}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 leading-relaxed font-sans"
              required
            />
          </div>

          {/* Organizer & Verification Details */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Organizer KYC & Payout Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Organizer Name
                </label>
                <input
                  type="text"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Phone (MTN/Airtel)
                </label>
                <input
                  type="text"
                  value={organizerPhone}
                  onChange={(e) => setOrganizerPhone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Beneficiary Name
                </label>
                <input
                  type="text"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={organizerKycVerified}
                  onChange={(e) => setOrganizerKycVerified(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Mark as KYC Verified Organizer (NIN / National ID Audited)
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

