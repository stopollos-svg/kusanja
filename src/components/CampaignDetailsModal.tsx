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
  Heart, 
  Image as ImageIcon,
  Mail,
  MapPin, 
  MessageCircle,
  MessageSquare, 
  Phone,
  PhoneCall,
  Send, 
  Share2, 
  ShieldCheck, 
  Smartphone, 
  Users, 
  X 
} from 'lucide-react';
import { Campaign, DonorCheer, PaymentTransaction } from '../types';
import { formatUGX, timeAgo } from '../utils/formatters';
import { generateDonationReceiptPDF } from '../utils/pdfReceiptGenerator';

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
  const [activeTab, setActiveTab] = useState<'story' | 'gallery' | 'donors' | 'updates'>('story');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);

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
  const percentage = Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100));
  const campaignDonations = donations.filter(d => d.campaignId === campaign.id);

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      
      {/* Modal Container with Mobile Bottom Sheet Styling */}
      <div 
        className="relative w-full max-w-4xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden my-0 sm:my-6 border border-slate-200 animate-in fade-in slide-in-from-bottom-6 duration-250 max-h-[94vh] sm:max-h-[90vh] flex flex-col"
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
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                      {campaignDonations.map((d) => (
                        <div key={d.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 sm:p-4 flex items-start gap-3">
                          
                          {/* Provider Icon Avatar */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            d.provider === 'mtn' 
                              ? 'bg-yellow-400 text-slate-900 font-black border border-yellow-500' 
                              : d.provider === 'airtel' 
                              ? 'bg-red-600 text-white font-black' 
                              : d.provider === 'visa' || d.provider === 'card'
                              ? 'bg-blue-700 text-white font-black'
                              : d.provider === 'paypal'
                              ? 'bg-sky-600 text-white font-black'
                              : 'bg-slate-800 text-white'
                          }`}>
                            {d.provider === 'mtn' ? 'MTN' : d.provider === 'airtel' ? 'AIR' : d.provider === 'visa' || d.provider === 'card' ? 'VISA' : d.provider === 'paypal' ? 'PP' : 'UG'}
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

                            <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5 text-[11px] text-slate-500">
                              <div className="flex items-center gap-2">
                                <span>{timeAgo(d.timestamp)}</span>
                                <span>•</span>
                                <span className="uppercase text-[10px] font-semibold text-slate-600">
                                  {d.provider === 'visa' || d.provider === 'card' ? 'Visa Card' : d.provider === 'paypal' ? 'PayPal Global' : `${d.provider.toUpperCase()} MoMo`} ({d.transactionRef})
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const txMock: PaymentTransaction = {
                                    id: d.id,
                                    reference: d.transactionRef,
                                    transactionRef: d.transactionRef,
                                    campaignId: campaign.id,
                                    donorName: d.donorName,
                                    donorPhone: '',
                                    phoneNumber: '',
                                    amount: d.amount,
                                    provider: d.provider,
                                    isAnonymous: d.isAnonymous,
                                    message: d.message || '',
                                    status: 'completed',
                                    platformFee: Math.round(d.amount * 0.05),
                                    feePercentage: 5,
                                    netBeneficiaryAmount: d.amount - Math.round(d.amount * 0.05),
                                    ussdPrompt: '',
                                    networkRef: d.transactionRef,
                                    networkTransactionId: d.transactionRef,
                                    createdAt: d.timestamp,
                                    receiptNumber: `RCP-${d.transactionRef}`,
                                  };
                                  generateDonationReceiptPDF({
                                    transaction: txMock,
                                    campaignTitle: campaign.title,
                                    campaignCategory: campaign.category,
                                    organizerName: campaign.organizerName,
                                    beneficiaryName: campaign.beneficiaryName,
                                    beneficiaryPhone: campaign.beneficiaryPhone || campaign.organizerPhone,
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
                  <span>DONATE (MOMO, VISA, PAYPAL)</span>
                </button>

                {/* Platform Maintenance Transparent Notice */}
                <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-2.5 text-[11px] text-emerald-900 text-center">
                  <strong>Transparent 5% Model:</strong> 95% goes directly to beneficiary. 5% covers telecoms and app maintenance.
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
              {formatUGX(campaign.raisedAmount)}
            </div>
            <div className="text-[10px] text-slate-500 truncate">
              {percentage}% of {formatUGX(campaign.targetAmount)}
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
