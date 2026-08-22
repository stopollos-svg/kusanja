import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Copy, 
  Heart, 
  MapPin, 
  MessageSquare, 
  Send, 
  Share2, 
  ShieldCheck, 
  Smartphone, 
  Sparkles, 
  Users, 
  X 
} from 'lucide-react';
import { Campaign, DonorCheer } from '../types';
import { formatUGX, timeAgo } from '../utils/formatters';

interface CampaignDetailsModalProps {
  campaign: Campaign | null;
  donations: DonorCheer[];
  onClose: () => void;
  onDonate: (campaign: Campaign) => void;
  onPostUpdate: (campaignId: string, title: string, content: string) => Promise<void>;
}

export const CampaignDetailsModal: React.FC<CampaignDetailsModalProps> = ({
  campaign,
  donations,
  onClose,
  onDonate,
  onPostUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'story' | 'donors' | 'updates'>('story');
  const [copied, setCopied] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);

  if (!campaign) return null;

  const percentage = Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100));
  const campaignDonations = donations.filter(d => d.campaignId === campaign.id);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🇺🇬 Please support: "${campaign.title}" in ${campaign.district}.\nTarget: ${formatUGX(campaign.targetAmount)} (Raised: ${formatUGX(campaign.raisedAmount)}).\nDonate or pledge instantly via MTN MoMo (*165#) or Airtel Money (*185#) on Kusanya: https://kusanya.org/#${campaign.slug || campaign.id}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(
      `Support "${campaign.title}" (${campaign.district}, Uganda) on @KusanyaOrg. Donate directly via Mobile Money (MTN/Airtel):`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent('https://kusanya.org')}`, '_blank');
  };

  const submitOrganizerUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateTitle.trim() || !updateContent.trim()) return;

    setIsSubmittingUpdate(true);
    try {
      await onPostUpdate(campaign.id, updateTitle, updateContent);
      setUpdateTitle('');
      setUpdateContent('');
      setShowUpdateForm(false);
      setActiveTab('updates');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image Section */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full bg-slate-900">
          <img
            src={campaign.image}
            alt={campaign.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"></div>

          {/* District & Category Pills */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className={`text-white font-bold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md ${
              campaign.category === 'faith'
                ? 'bg-amber-600'
                : campaign.category === 'sacco'
                ? 'bg-blue-600'
                : 'bg-emerald-600'
            }`}>
              {campaign.category === 'faith'
                ? 'Church / Faith'
                : campaign.category === 'sacco'
                ? 'SACCO / Savings'
                : campaign.category}
            </span>
            <span className="bg-slate-900/80 backdrop-blur-md text-slate-100 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 border border-slate-700">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{campaign.district}, {campaign.region} Uganda</span>
            </span>
          </div>

          {/* Title on Image overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight mb-2 drop-shadow-md">
              {campaign.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-200">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Beneficiary: <strong>{campaign.beneficiaryName}</strong></span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <span>Organized by <strong>{campaign.organizerName}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Columns: Story & Updates & Donors */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('story')}
                  className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'story'
                      ? 'border-emerald-600 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Full Story
                </button>

                <button
                  onClick={() => setActiveTab('donors')}
                  className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'donors'
                      ? 'border-emerald-600 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Donors ({campaignDonations.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('updates')}
                  className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'updates'
                      ? 'border-emerald-600 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Updates ({campaign.updates.length})</span>
                </button>
              </div>

              {/* Tab 1: Full Story */}
              {activeTab === 'story' && (
                <div className="space-y-6 text-slate-800 leading-relaxed text-sm sm:text-base">
                  
                  {/* KYC Verification Callout */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm">
                      <p className="font-bold text-emerald-900">Kusanya (kusanya.org) Verified Fundraiser</p>
                      <p className="text-emerald-800 mt-0.5">
                        Organizer identity & Ugandan phone ({campaign.organizerPhone}) have been KYC verified. Mobile money payouts are routed directly to the designated beneficiary or official institutional MoMo wallet.
                      </p>
                    </div>
                  </div>

                  {/* Story Text */}
                  <div className="whitespace-pre-line text-slate-700 font-normal leading-relaxed">
                    {campaign.story}
                  </div>

                  {/* Beneficiary Details Card */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs sm:text-sm">
                    <h4 className="font-bold text-slate-800 mb-2 uppercase tracking-wide text-xs">
                      Fund Distribution Details
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      <div>
                        <span className="text-slate-500 block">Beneficiary</span>
                        <span className="font-semibold">{campaign.beneficiaryName} ({campaign.beneficiaryRelationship})</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Mobile Money Channel</span>
                        <span className="font-semibold capitalize">{campaign.payoutProvider} MoMo Account</span>
                      </div>
                    </div>
                  </div>

                  {/* Social Sharing */}
                  <div className="pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Share this fundraiser with friends & family
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleShareWhatsApp}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share on WhatsApp</span>
                      </button>

                      <button
                        onClick={handleShareTwitter}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition-all cursor-pointer"
                      >
                        <span>Share on X</span>
                      </button>

                      <button
                        onClick={handleCopyLink}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xl font-semibold text-xs transition-all cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                        <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* Tab 2: Donors Wall & Cheers */}
              {activeTab === 'donors' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800">
                      {campaignDonations.length} Kind Givers Supporting This Cause
                    </h4>
                    <span className="text-xs text-slate-500">Live MTN & Airtel Feed</span>
                  </div>

                  {campaignDonations.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100 text-slate-500">
                      <Heart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-medium">Be the first to donate via Mobile Money!</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {campaignDonations.map((d) => (
                        <div key={d.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 sm:p-4 flex items-start gap-3">
                          
                          {/* Provider Icon Avatar */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            d.provider === 'mtn' 
                              ? 'bg-yellow-400 text-slate-900 font-black border border-yellow-500' 
                              : d.provider === 'airtel' 
                              ? 'bg-red-600 text-white font-black' 
                              : 'bg-slate-800 text-white'
                          }`}>
                            {d.provider === 'mtn' ? 'MTN' : d.provider === 'airtel' ? 'AIR' : 'UG'}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-sm text-slate-900 truncate">
                                {d.isAnonymous ? 'Anonymous Well-Wisher' : d.donorName}
                              </span>
                              <span className="font-black text-sm text-emerald-800 shrink-0">
                                {formatUGX(d.amount)}
                              </span>
                            </div>

                            {d.message && (
                              <p className="text-xs text-slate-700 mt-1 italic bg-white p-2 rounded-lg border border-slate-200">
                                “{d.message}”
                              </p>
                            )}

                            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                              <span>{timeAgo(d.timestamp)}</span>
                              <span>•</span>
                              <span className="uppercase text-[10px] font-semibold text-slate-600">
                                {d.provider.toUpperCase()} MoMo ({d.transactionRef})
                              </span>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Updates Timeline */}
              {activeTab === 'updates' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800">Organizer Progress Updates</h4>
                    <button
                      onClick={() => setShowUpdateForm(!showUpdateForm)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-emerald-200"
                    >
                      {showUpdateForm ? 'Cancel' : '+ Post an Update'}
                    </button>
                  </div>

                  {showUpdateForm && (
                    <form onSubmit={submitOrganizerUpdate} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                      <h5 className="text-xs font-bold uppercase text-slate-600">Post update as organizer ({campaign.organizerName})</h5>
                      <input
                        type="text"
                        value={updateTitle}
                        onChange={(e) => setUpdateTitle(e.target.value)}
                        placeholder="Update Title (e.g. Doctor's receipt / Surgery booking confirmation)"
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                        required
                      />
                      <textarea
                        value={updateContent}
                        onChange={(e) => setUpdateContent(e.target.value)}
                        placeholder="Share the latest progress, receipts, or message to Mobile Money donors..."
                        rows={3}
                        className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                        required
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowUpdateForm(false)}
                          className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingUpdate}
                          className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
                        >
                          {isSubmittingUpdate ? 'Posting...' : 'Publish Update'}
                        </button>
                      </div>
                    </form>
                  )}

                  {campaign.updates.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-xs">
                      No updates posted yet. The organizer will post medical receipts or milestone notes here.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {campaign.updates.map((upd) => (
                        <div key={upd.id} className="border-l-2 border-emerald-500 pl-4 py-1">
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                            <span className="font-bold text-slate-900">{upd.title}</span>
                            <span>{upd.date}</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {upd.content}
                          </p>
                          <span className="text-[11px] text-slate-500 mt-1 block">By {upd.author}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Right Column: Sticky Donation Card & Quick MoMo CTA */}
            <div className="space-y-6">
              
              {/* Financial Box */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xl space-y-4">
                
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 block">
                    {formatUGX(campaign.raisedAmount)}
                  </span>
                  <div className="flex items-center justify-between text-xs text-slate-600 mt-1">
                    <span>raised of <strong>{formatUGX(campaign.targetAmount)}</strong> goal</span>
                    <span className="font-bold text-emerald-600">{percentage}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                {/* Donors & Days left stats */}
                <div className="grid grid-cols-2 gap-2 text-center py-2 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-lg font-black text-slate-900 block">{campaign.donorsCount}</span>
                    <span className="text-slate-500">Donors</span>
                  </div>
                  <div>
                    <span className="text-lg font-black text-slate-900 block">{campaign.daysRemaining}</span>
                    <span className="text-slate-500">Days Left</span>
                  </div>
                </div>

                {/* Big Donate CTA */}
                <button
                  onClick={() => onDonate(campaign)}
                  className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black text-sm rounded-xl shadow-sm border-b-4 border-yellow-600 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Smartphone className="w-5 h-5 text-slate-900" />
                  <span>DONATE VIA MOBILE MONEY</span>
                </button>

                {/* Accepted Payment Provider Badges */}
                <div className="pt-2 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg p-1.5 flex items-center justify-center shadow-sm">
                      <div className="w-full h-full bg-red-600 rounded-sm flex items-center justify-center text-[10px] text-white font-black">
                        Airtel
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg p-1.5 flex items-center justify-center shadow-sm">
                      <div className="w-full h-full bg-yellow-400 rounded-sm flex items-center justify-center text-[10px] text-slate-900 font-black tracking-tighter">
                        MTN
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Secure UG-Mobile Payment Gateway</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
