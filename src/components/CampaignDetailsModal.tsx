import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ChevronLeft,
  ChevronRight,
  Clock, 
  Copy, 
  Download,
  ExternalLink,
  FileText,
  Flame,
  Heart, 
  Image as ImageIcon,
  Mail,
  MapPin, 
  MessageCircle,
  MessageSquare, 
  Phone,
  PhoneCall,
  Pin,
  PlusCircle,
  Send, 
  Share2, 
  ShieldCheck, 
  Smartphone, 
  Sparkles,
  Tag,
  ThumbsUp,
  Users, 
  X,
  Calculator,
  ArrowRight
} from 'lucide-react';
import { Campaign, DonorCheer, PaymentTransaction } from '../types';
import { formatUGX, formatSignedUGX, calculateDonationMinusTarget, timeAgo, formatSocialTimestamp } from '../utils/formatters';
import { generateDonationReceiptPDF } from '../utils/pdfReceiptGenerator';
import { getCampaignUrgencyInfo } from '../utils/urgency';

interface CampaignDetailsModalProps {
  campaign: Campaign | null;
  donations: DonorCheer[];
  onClose: () => void;
  onDonate: (campaign: Campaign) => void;
  onPostUpdate: (
    campaignId: string,
    title: string,
    content: string,
    author?: string,
    imageUrl?: string,
    category?: 'update' | 'milestone' | 'receipt' | 'story' | 'gratitude'
  ) => Promise<void>;
}

export const CampaignDetailsModal: React.FC<CampaignDetailsModalProps> = ({
  campaign,
  donations,
  onClose,
  onDonate,
  onPostUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'story' | 'gallery' | 'donors' | 'updates'>('story');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [updateAuthor, setUpdateAuthor] = useState('');
  const [updateImageUrl, setUpdateImageUrl] = useState('');
  const [updateCategory, setUpdateCategory] = useState<'update' | 'milestone' | 'receipt' | 'story' | 'gratitude'>('update');
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
  const [postSuccessNotice, setPostSuccessNotice] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  if (!campaign) return null;

  const beneficiaryContactNumber = campaign.beneficiaryPhone || campaign.organizerPhone;

  const handleCopyPhone = (phoneNum: string) => {
    navigator.clipboard.writeText(phoneNum);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  const galleryImages = campaign.images && campaign.images.length > 0 
    ? campaign.images 
    : [campaign.image];

  const activeImage = galleryImages[currentImageIndex] || campaign.image;
  const { amountDonatedMinusTarget, remainingAmount } = calculateDonationMinusTarget(campaign.raisedAmount, campaign.targetAmount);
  const campaignDonations = donations.filter(d => d.campaignId === campaign.id);
  const urgency = getCampaignUrgencyInfo(campaign);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

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
      await onPostUpdate(
        campaign.id,
        updateTitle.trim(),
        updateContent.trim(),
        updateAuthor.trim() || campaign.organizerName,
        updateImageUrl.trim() || undefined,
        updateCategory
      );
      setUpdateTitle('');
      setUpdateContent('');
      setUpdateImageUrl('');
      setUpdateAuthor('');
      setShowUpdateForm(false);
      setActiveTab('updates');
      setPostSuccessNotice(true);
      setTimeout(() => setPostSuccessNotice(false), 4500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  const handleLikePost = (postId: string) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      
      {/* Modal Container with Mobile Bottom Sheet Styling */}
      <div 
        className="relative w-full max-w-4xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden my-0 sm:my-6 border border-slate-200 animate-in fade-in slide-in-from-bottom-6 duration-250 max-h-[95dvh] sm:max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle indicator */}
        <div className="sm:hidden w-full flex items-center justify-center pt-2.5 pb-1 bg-slate-900">
          <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition-colors cursor-pointer shadow-lg active:scale-95"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto">

        {/* Hero Image Section with Cause Photo Gallery Controls */}
        <div className="relative h-60 sm:h-80 md:h-96 w-full bg-slate-900">
          <img
            src={activeImage}
            alt={campaign.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"></div>

          {/* Previous / Next buttons for cause photo gallery */}
          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-all cursor-pointer backdrop-blur-sm shadow-md"
                aria-label="Previous cause photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-all cursor-pointer backdrop-blur-sm shadow-md"
                aria-label="Next cause photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

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

            {galleryImages.length > 1 && (
              <span className="bg-slate-900/80 backdrop-blur-md text-slate-100 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 border border-slate-700">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentImageIndex + 1} of {galleryImages.length} Photos</span>
              </span>
            )}
          </div>

          {/* Title on Image overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight mb-2 drop-shadow-md">
              {campaign.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-200">
              <div className="flex items-center gap-1.5 bg-emerald-950/70 backdrop-blur-xs px-2.5 py-1 rounded-full border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Beneficiary: <strong>{campaign.beneficiaryName}</strong></span>
              </div>
              {beneficiaryContactNumber && (
                <a 
                  href={`tel:${beneficiaryContactNumber.replace(/\s+/g, '')}`}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-full text-xs shadow-sm transition-all"
                  title="Call beneficiary directly"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{beneficiaryContactNumber}</span>
                </a>
              )}
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <span>Organized by <strong>{campaign.organizerName}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Gallery Strip if multiple cause photos exist */}
        {galleryImages.length > 1 && (
          <div className="bg-slate-900 px-4 py-2 flex items-center gap-2 overflow-x-auto border-b border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-emerald-400" />
              <span>Cause Pictures:</span>
            </span>
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`h-10 w-16 shrink-0 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                  currentImageIndex === idx
                    ? 'border-emerald-500 ring-2 ring-emerald-400'
                    : 'border-slate-700 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Cause thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Modal Main Body */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Urgency Highlight Banner */}
          {urgency.isUrgent && (
            <div className={`mb-6 p-4 rounded-2xl border flex items-start gap-3.5 shadow-sm ${
              urgency.severity === 'critical'
                ? 'bg-rose-50/90 border-rose-200 text-rose-950'
                : 'bg-amber-50/90 border-amber-200 text-amber-950'
            }`}>
              <div className={`p-2 rounded-xl shrink-0 ${
                urgency.severity === 'critical' ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-500 text-slate-950'
              }`}>
                <Flame className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                    urgency.severity === 'critical' ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                  }`}>
                    {urgency.badgeLabel}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    Remaining: {formatUGX(remainingAmount)} • {campaign.daysRemaining} days left
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold leading-relaxed">
                  {urgency.badgeSubtext}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Columns: Story & Updates & Donors */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Navigation Tabs with horizontal scroll on mobile */}
              <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-1 sm:gap-0">
                <button
                  onClick={() => setActiveTab('story')}
                  className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                    activeTab === 'story'
                      ? 'border-emerald-600 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Full Story
                </button>

                {galleryImages.length > 1 && (
                  <button
                    onClick={() => setActiveTab('gallery')}
                    className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      activeTab === 'gallery'
                        ? 'border-emerald-600 text-emerald-800'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Photos ({galleryImages.length})</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('donors')}
                  className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    activeTab === 'donors'
                      ? 'border-emerald-600 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Donors ({campaignDonations.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('updates')}
                  className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    activeTab === 'updates'
                      ? 'border-emerald-600 text-emerald-800'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Posts & Updates ({campaign.updates.length})</span>
                </button>
              </div>

              {/* Tab 1: Full Story */}
              {activeTab === 'story' && (
                <div className="space-y-6 text-slate-800 leading-relaxed text-sm sm:text-base">
                  
                  {/* Social Media Post Metadata Bar */}
                  {(() => {
                    const postMeta = formatSocialTimestamp(campaign.createdAt);
                    return (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                            {campaign.organizerName ? campaign.organizerName.charAt(0).toUpperCase() : 'K'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                              <span>{campaign.organizerName}</span>
                              <span className="text-[11px] font-normal text-slate-500">(Campaign Organizer)</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                              <Clock className="w-3 h-3 text-emerald-600" />
                              <span title={postMeta.full}>Published {postMeta.relative} ({postMeta.full})</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {postMeta.isToday && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              ✨ Published Today
                            </span>
                          )}
                          <span className="text-[11px] text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                            District: <strong>{campaign.district}</strong>
                          </span>
                        </div>
                      </div>
                    );
                  })()}

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

                  {/* Beneficiary Details & Direct Contact Card */}
                  <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-emerald-100 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-emerald-600 text-white rounded-lg">
                            <PhoneCall className="w-4 h-4" />
                          </span>
                          <h4 className="font-black text-slate-900 text-sm sm:text-base">
                            Direct Beneficiary Contact & Fund Verification
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 ml-8">
                          Verified for direct communication, accountability, and well-wishes
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Public Contact Info</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Left: Beneficiary identity */}
                      <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200/80">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Beneficiary Information
                        </span>
                        <div className="text-sm font-bold text-slate-900">
                          {campaign.beneficiaryName}
                        </div>
                        <div className="text-xs text-slate-600">
                          Relationship: <span className="font-semibold text-slate-800">{campaign.beneficiaryRelationship}</span>
                        </div>
                        <div className="text-xs text-slate-600">
                          Fund Routing: <span className="font-semibold text-emerald-700 capitalize">{campaign.payoutProvider} MoMo Wallet</span>
                        </div>
                        {campaign.beneficiaryEmail && (
                          <div className="text-xs text-slate-600 flex items-center gap-1.5 pt-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <a href={`mailto:${campaign.beneficiaryEmail}`} className="text-emerald-700 hover:underline">
                              {campaign.beneficiaryEmail}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Right: Direct Phone & Instant Contact Actions */}
                      <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Direct Phone Number
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-base sm:text-lg font-black text-slate-900 tracking-wide">
                              {beneficiaryContactNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyPhone(beneficiaryContactNumber)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Copy phone number"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            {copiedPhone && (
                              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                                Copied!
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            Organizer contact: {campaign.organizerName} ({campaign.organizerPhone})
                          </span>
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                          <a
                            href={`tel:${beneficiaryContactNumber.replace(/\s+/g, '')}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition-all"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call Beneficiary</span>
                          </a>

                          <a
                            href={`https://api.whatsapp.com/send?phone=${beneficiaryContactNumber.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(`Hello ${campaign.beneficiaryName}, I am reaching out regarding your fundraiser "${campaign.title}" on Kusanya.org.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>

                          <a
                            href={`sms:${beneficiaryContactNumber.replace(/\s+/g, '')}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-all"
                          >
                            <span>SMS</span>
                          </a>
                        </div>
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

              {/* Tab: Cause Pictures Gallery */}
              {activeTab === 'gallery' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Pictures Showing Cause & Verification</h4>
                      <p className="text-xs text-slate-500">Provided by organizer {campaign.organizerName} to show the cause</p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {galleryImages.length} Photos Attached
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {galleryImages.map((img, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => {
                          setCurrentImageIndex(idx);
                        }}
                        className={`rounded-xl overflow-hidden border-2 cursor-pointer group relative aspect-video bg-slate-900 transition-all ${
                          currentImageIndex === idx ? 'border-emerald-500 ring-2 ring-emerald-400' : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <img 
                          src={img} 
                          alt={`Cause photo ${idx + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          {idx === 0 ? 'Cover Photo' : `Cause Photo #${idx + 1}`}
                        </div>
                      </div>
                    ))}
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
                      {campaignDonations.map((d) => {
                        const prov = d?.provider || 'mtn';
                        const provLabel =
                          prov === 'visa' || prov === 'card'
                            ? 'Visa Card'
                            : prov === 'paypal'
                            ? 'PayPal Global'
                            : `${prov.toUpperCase()} MoMo`;

                        return (
                          <div key={d.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 sm:p-4 flex items-start gap-3">
                            
                            {/* Provider Icon Avatar */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              prov === 'mtn' 
                                ? 'bg-yellow-400 text-slate-900 font-black border border-yellow-500' 
                                : prov === 'airtel' 
                                ? 'bg-red-600 text-white font-black' 
                                : prov === 'visa' || prov === 'card'
                                ? 'bg-blue-700 text-white font-black'
                                : prov === 'paypal'
                                ? 'bg-sky-600 text-white font-black'
                                : 'bg-slate-800 text-white'
                            }`}>
                              {prov === 'mtn' ? 'MTN' : prov === 'airtel' ? 'AIR' : prov === 'visa' || prov === 'card' ? 'VISA' : prov === 'paypal' ? 'PP' : 'UG'}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-sm text-slate-900 truncate">
                                  {d.isAnonymous ? 'Anonymous Well-Wisher' : d.donorName || 'Generous Giver'}
                                </span>
                                <div className="text-right shrink-0">
                                  <span className="font-black text-sm text-emerald-800 block">
                                    {formatUGX(d.amount || 0)}
                                  </span>
                                  {campaign.targetAmount > 0 && (
                                    <span className="text-[10px] text-slate-500 font-semibold block">
                                      Donated − Target: {formatSignedUGX((d.amount || 0) - campaign.targetAmount)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {d.message && (
                                <p className="text-xs text-slate-700 mt-1 italic bg-white p-2 rounded-lg border border-slate-200">
                                  “{d.message}”
                                </p>
                              )}

                              <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5 text-[11px] text-slate-500">
                                <div className="flex items-center gap-2">
                                  <span>{timeAgo(d.timestamp || new Date().toISOString())}</span>
                                  <span>•</span>
                                  <span className="uppercase text-[10px] font-semibold text-slate-600">
                                    {provLabel} ({d.transactionRef || 'UG-REF'})
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const txMock: PaymentTransaction = {
                                      id: d.id,
                                      reference: d.transactionRef || `REF-${d.id}`,
                                      transactionRef: d.transactionRef || `REF-${d.id}`,
                                      campaignId: campaign.id,
                                      donorName: d.donorName || 'Generous Giver',
                                      donorPhone: '',
                                      phoneNumber: '',
                                      amount: d.amount || 0,
                                      provider: prov,
                                      isAnonymous: d.isAnonymous || false,
                                      message: d.message || '',
                                      status: 'completed',
                                      platformFee: 0,
                                      feePercentage: 0,
                                      netBeneficiaryAmount: d.amount || 0,
                                      amountDonatedMinusTarget,
                                      remainingTargetBalance: remainingAmount,
                                      ussdPrompt: '',
                                      networkRef: d.transactionRef || `REF-${d.id}`,
                                      networkTransactionId: d.transactionRef || `REF-${d.id}`,
                                      createdAt: d.timestamp || new Date().toISOString(),
                                      receiptNumber: `RCP-${d.transactionRef || d.id}`,
                                      campaignTitle: campaign.title,
                                      campaignTarget: campaign.targetAmount,
                                      campaignRaised: campaign.raisedAmount,
                                    };
                                    generateDonationReceiptPDF({
                                      transaction: txMock,
                                      campaignTitle: campaign.title,
                                      campaignCategory: campaign.category,
                                      organizerName: campaign.organizerName,
                                      beneficiaryName: campaign.beneficiaryName,
                                      beneficiaryPhone: campaign.beneficiaryPhone || campaign.organizerPhone,
                                      targetAmount: campaign.targetAmount,
                                      raisedAmount: campaign.raisedAmount,
                                    });
                                  }}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors cursor-pointer"
                                  title="Download PDF Receipt for this donation"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>PDF Receipt</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Updates & Stories Timeline */}
              {activeTab === 'updates' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <span>Campaign Posts & Updates</span>
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {campaign.updates.length} {campaign.updates.length === 1 ? 'Post' : 'Posts'}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500">
                        Official progress updates, milestone receipts, and messages from {campaign.organizerName}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowUpdateForm(!showUpdateForm)}
                      className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-95"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>{showUpdateForm ? 'Close Composer' : '+ Create New Post'}</span>
                    </button>
                  </div>

                  {/* Post Success Banner */}
                  {postSuccessNotice && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        <strong>Post published successfully!</strong> Your post is now retained on this fundraiser page and visible to all donors.
                      </span>
                    </div>
                  )}

                  {/* Rich Post Composer */}
                  {showUpdateForm && (
                    <form onSubmit={submitOrganizerUpdate} className="bg-slate-50 border-2 border-emerald-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                            {campaign.organizerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold uppercase text-slate-800">
                              Publish New Post as Organizer
                            </h5>
                            <span className="text-[11px] text-slate-500">
                              Posts are stored and retained across all donor visits
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Live Feed
                        </span>
                      </div>

                      {/* Post Category Picker */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                          Post Category / Topic
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { key: 'update', label: '📢 General Update', desc: 'Progress & news' },
                            { key: 'receipt', label: '🧾 Medical / Expense Receipt', desc: 'Proof of spend' },
                            { key: 'milestone', label: '🎯 Target Milestone', desc: 'Funds reached' },
                            { key: 'story', label: '📖 Patient / Beneficiary Story', desc: 'Heartfelt note' },
                            { key: 'gratitude', label: '🙏 Thank You Message', desc: 'To donors' },
                          ].map((cat) => (
                            <button
                              key={cat.key}
                              type="button"
                              onClick={() => setUpdateCategory(cat.key as any)}
                              className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                                updateCategory === cat.key
                                  ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                              }`}
                            >
                              <span>{cat.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Title & Author */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Post Headline / Title *
                          </label>
                          <input
                            type="text"
                            value={updateTitle}
                            onChange={(e) => setUpdateTitle(e.target.value)}
                            placeholder="e.g. Hospital Admission Note & Doctor Consultation Receipt"
                            className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Posted By (Author Name)
                          </label>
                          <input
                            type="text"
                            value={updateAuthor}
                            onChange={(e) => setUpdateAuthor(e.target.value)}
                            placeholder={campaign.organizerName || 'Organizer Name'}
                            className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Photo / Receipt Attachment URL */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Attach Photo / Medical Receipt (Image URL) - Optional
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={updateImageUrl}
                            onChange={(e) => setUpdateImageUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/... or receipt link"
                            className="flex-1 text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          {updateImageUrl && (
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                              <img
                                src={updateImageUrl}
                                alt="Preview"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Post Content */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Post Content / Details *
                        </label>
                        <textarea
                          value={updateContent}
                          onChange={(e) => setUpdateContent(e.target.value)}
                          placeholder="Share the full update, breakdown of funds spent, surgery date, doctor notes, or a heartfelt message to donors..."
                          rows={4}
                          className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                          required
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Retained in local storage & synced instantly</span>
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowUpdateForm(false)}
                            className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmittingUpdate}
                            className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isSubmittingUpdate ? 'Publishing...' : 'Publish Post'}</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Empty state or Posts list */}
                  {campaign.updates.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 text-slate-500">
                      <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <h5 className="text-sm font-bold text-slate-700 mb-1">No posts or updates yet</h5>
                      <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                        The organizer has not published an update yet. Click the button above to create the first post with receipts or progress notes.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowUpdateForm(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Create First Post</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {campaign.updates.map((upd, idx) => {
                        const isLiked = likedPosts[upd.id];
                        const totalLikes = (upd.likesCount || 0) + (isLiked ? 1 : 0);
                        
                        return (
                          <div 
                            key={upd.id} 
                            className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all shadow-xs space-y-3 ${
                              upd.pinned ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200/90'
                            }`}
                          >
                            {/* Post Header */}
                            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                                  {upd.author ? upd.author.charAt(0).toUpperCase() : 'O'}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-sm text-slate-900">{upd.title}</span>
                                    {upd.pinned && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                                        <Pin className="w-3 h-3 text-amber-700" />
                                        <span>Pinned Post</span>
                                      </span>
                                    )}
                                    {upd.category && (
                                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                                        {upd.category === 'receipt' ? '🧾 Receipt' : upd.category === 'milestone' ? '🎯 Milestone' : upd.category === 'story' ? '📖 Story' : upd.category === 'gratitude' ? '🙏 Gratitude' : '📢 Update'}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                    <span>By <strong className="text-slate-700">{upd.author || campaign.organizerName}</strong></span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                      <span>{upd.date}</span>
                                    </div>
                                    <span>•</span>
                                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                                      Post #{campaign.updates.length - idx}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Post Image Attachment (if any) */}
                            {upd.imageUrl && (
                              <div className="rounded-xl overflow-hidden border border-slate-200 max-h-80 bg-slate-900">
                                <img
                                  src={upd.imageUrl}
                                  alt={upd.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full max-h-80 object-cover hover:scale-102 transition-transform duration-300"
                                />
                              </div>
                            )}

                            {/* Post Body Content */}
                            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                              {upd.content}
                            </p>

                            {/* Post Footer & Reactions */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                              <button
                                type="button"
                                onClick={() => handleLikePost(upd.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                  isLiked 
                                    ? 'bg-rose-50 border-rose-200 text-rose-600' 
                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600 text-rose-600' : 'text-slate-400'}`} />
                                <span>{totalLikes > 0 ? `${totalLikes} ${totalLikes === 1 ? 'Cheer' : 'Cheers'}` : 'Send Cheer'}</span>
                              </button>

                              <span className="text-[11px] text-slate-400">
                                Retained on Kusanya Uganda
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Right Column: Sticky Donation Card & Quick MoMo CTA */}
            <div className="space-y-6">
              
              {/* Financial Box */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xl space-y-4">
                
                {/* Clean Gross Financial Summary */}
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-0.5">Total Amount Donated</span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 block tracking-tight">
                      {formatUGX(campaign.raisedAmount)}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Total Target Goal:</span>
                      <span className="font-bold text-slate-900">{formatUGX(campaign.targetAmount)}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-slate-700 font-bold flex items-center gap-1">
                        <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Donated − Target:</span>
                      </span>
                      <span className={`font-mono font-black text-sm px-2 py-0.5 rounded ${
                        amountDonatedMinusTarget >= 0 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {formatSignedUGX(amountDonatedMinusTarget)}
                      </span>
                    </div>

                    {remainingAmount > 0 && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>Balance to Reach Target:</span>
                        <span className="font-semibold text-slate-700">{formatUGX(remainingAmount)}</span>
                      </div>
                    )}
                  </div>
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
                  <span>DONATE (MOMO, VISA, PAYPAL)</span>
                </button>

                {/* Zero Deductions Notice */}
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 text-[11px] text-emerald-900 text-center">
                  <strong>Zero Deductions:</strong> 100% of every donation goes directly to the campaign beneficiary.
                </div>

                {/* Accepted Payment Provider Badges */}
                <div className="pt-1 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-10 px-2 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-xs">
                      <div className="bg-yellow-400 px-2 py-0.5 rounded text-[10px] text-slate-900 font-black tracking-tighter">
                        MTN MoMo
                      </div>
                    </div>
                    <div className="h-10 px-2 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-xs">
                      <div className="bg-red-600 px-2 py-0.5 rounded text-[10px] text-white font-black">
                        Airtel
                      </div>
                    </div>
                    <div className="h-10 px-2 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-xs">
                      <div className="bg-blue-700 px-2 py-0.5 rounded text-[10px] text-white font-black">
                        VISA
                      </div>
                    </div>
                    <div className="h-10 px-2 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-xs">
                      <div className="bg-sky-600 px-2 py-0.5 rounded text-[10px] text-white font-black">
                        PayPal
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Secure Kusanya NPS Gateway</span>
                  </div>
                </div>

              </div>

              {/* Direct Beneficiary Contact Box in Right Column */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Beneficiary Contact</span>
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Direct
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-sm">
                    {campaign.beneficiaryName}
                  </div>
                  <div className="text-xs text-slate-500">
                    {campaign.beneficiaryRelationship} • {campaign.district}
                  </div>
                  <div className="text-sm font-black text-emerald-700 pt-1 tracking-wide">
                    {beneficiaryContactNumber}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={`tel:${beneficiaryContactNumber.replace(/\s+/g, '')}`}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-colors text-center"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Directly</span>
                  </a>

                  <a
                    href={`https://api.whatsapp.com/send?phone=${beneficiaryContactNumber.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(`Hello ${campaign.beneficiaryName}, I am contacting you from Kusanya.org regarding: ${campaign.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all text-center"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
                  <span>Organizer: <strong>{campaign.organizerName}</strong></span>
                  <span className="text-emerald-700 font-semibold">{campaign.organizerPhone}</span>
                </div>
              </div>

            </div>

          </div>
        </div>

        </div>

        {/* Mobile Sticky Bottom CTA Bar */}
        <div className="lg:hidden sticky bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 sm:p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-900 truncate">
              {formatUGX(campaign.raisedAmount)} <span className="text-[10px] text-slate-500 font-normal">donated</span>
            </div>
            <div className="text-[10px] text-slate-600 truncate font-mono">
              Donated − Target: {formatSignedUGX(amountDonatedMinusTarget)}
            </div>
          </div>

          {beneficiaryContactNumber && (
            <a
              href={`tel:${beneficiaryContactNumber.replace(/\s+/g, '')}`}
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 transition-colors shrink-0 active:scale-95 flex items-center justify-center"
              title="Call Beneficiary"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
            </a>
          )}

          <button
            type="button"
            onClick={() => onDonate(campaign)}
            className="py-2.5 px-4 sm:px-6 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-slate-900 font-black text-xs sm:text-sm rounded-xl shadow-md border-b-2 border-yellow-600 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-slate-900" />
            <span>DONATE NOW</span>
          </button>
        </div>

      </div>

    </div>
  );
};
