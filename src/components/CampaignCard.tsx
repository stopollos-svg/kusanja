import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Check, CheckCircle2, Clock, Copy, Flame, Heart, MapPin, MessageCircle, Phone, Share2, Smartphone, Users, X, Zap } from 'lucide-react';
import { Campaign } from '../types';
import { formatUGX, formatSocialTimestamp } from '../utils/formatters';
import { getCampaignUrgencyInfo } from '../utils/urgency';

interface CampaignCardProps {
  campaign: Campaign;
  onSelect: (campaign: Campaign) => void;
  onDonate: (campaign: Campaign) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onSelect,
  onDonate,
}) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const percentage = Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100));
  const contactNum = campaign.beneficiaryPhone || campaign.organizerPhone;
  const urgency = getCampaignUrgencyInfo(campaign);

  // Close share popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsShareOpen(false);
      }
    };
    if (isShareOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isShareOpen]);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set('campaign', campaign.id);
      return url.toString();
    }
    return `https://kusanya.org/?campaign=${campaign.id}`;
  };

  const getWhatsAppShareUrl = () => {
    const shareUrl = getShareUrl();
    const message = `🇺🇬 *Support "${campaign.title}" on Kusanya Uganda*\n\n` +
      `📍 *Location:* ${campaign.district}, Uganda\n` +
      `💰 *Raised:* ${formatUGX(campaign.raisedAmount)} of ${formatUGX(campaign.targetAmount)} (${percentage}% funded)\n` +
      `👥 *Contributors:* ${campaign.donorsCount} Mobile Money givers\n\n` +
      `📲 Support via MTN & Airtel MoMo:\n${shareUrl}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getShareUrl();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign.title,
          text: `Support "${campaign.title}" on Kusanya (Uganda)`,
          url: getShareUrl(),
        });
        setIsShareOpen(false);
      } catch {
        // User cancelled or share dismissed
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col group overflow-hidden relative">
      
      {/* Card Image Header */}
      <div 
        className="relative h-48 sm:h-52 overflow-hidden bg-slate-100 cursor-pointer"
        onClick={() => onSelect(campaign)}
      >
        <img
          src={campaign.image}
          alt={campaign.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/20"></div>

        {/* Category Pill */}
        <div className={`absolute top-3.5 left-3.5 flex items-center gap-1.5 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider ${
          campaign.category === 'faith'
            ? 'bg-amber-600'
            : campaign.category === 'sacco'
            ? 'bg-blue-600'
            : 'bg-emerald-600'
        }`}>
          <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
          <span>
            {campaign.category === 'faith'
              ? 'Church / Faith'
              : campaign.category === 'sacco'
              ? 'SACCO / Savings'
              : campaign.category}
          </span>
        </div>

        {/* District Location & Quick Share Icon */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md text-slate-100 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-700/60 shadow-xs">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>{campaign.district}</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsShareOpen(!isShareOpen);
            }}
            className="p-1.5 bg-slate-900/80 hover:bg-slate-900 backdrop-blur-md text-slate-200 hover:text-white rounded-lg border border-slate-700/60 shadow-xs transition-all cursor-pointer"
            title="Share on WhatsApp or copy link"
            aria-label="Share campaign"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Verified Badge & Urgency Pill */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-1.5 pointer-events-none">
          {campaign.organizerKycVerified ? (
            <div className="flex items-center gap-1 bg-slate-900/85 backdrop-blur-md text-emerald-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-md border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Verified Organizer</span>
            </div>
          ) : <div></div>}

          {urgency.isUrgent && (
            <div className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-md shadow-sm border backdrop-blur-md ${
              urgency.severity === 'critical'
                ? 'bg-rose-950/90 text-rose-200 border-rose-500/50 animate-pulse'
                : urgency.severity === 'high'
                ? 'bg-amber-950/90 text-amber-200 border-amber-500/50'
                : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
            }`}>
              <Flame className="w-3 h-3 text-amber-400 shrink-0 animate-bounce" />
              <span>{urgency.badgeLabel}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between relative">
        
        <div>
          {/* Social Media Post Timestamp & Organizer Header */}
          {(() => {
            const postTime = formatSocialTimestamp(campaign.createdAt);
            return (
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 font-medium">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span title={`Published: ${postTime.full}`} className="font-semibold text-slate-600">
                    Posted {postTime.relative}
                  </span>
                  {postTime.isToday && (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 animate-pulse">
                      NEW POST
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 truncate max-w-[120px]" title={`By ${campaign.organizerName}`}>
                  by {campaign.organizerName}
                </span>
              </div>
            );
          })()}

          {/* Title */}
          <h3 
            onClick={() => onSelect(campaign)}
            className="text-base sm:text-lg font-bold text-slate-900 hover:text-emerald-700 transition-colors line-clamp-2 leading-snug cursor-pointer mb-2"
          >
            {campaign.title}
          </h3>

          {/* Tagline */}
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {campaign.tagline || campaign.story.slice(0, 100) + '...'}
          </p>

          {/* Beneficiary & Direct Contact Tag */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-4 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
            <span className="truncate">
              For: <strong className="text-slate-800 font-semibold">{campaign.beneficiaryName}</strong>
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {campaign.updates && campaign.updates.length > 0 && (
                <span 
                  className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded"
                  title={`${campaign.updates.length} post updates published`}
                >
                  <MessageCircle className="w-2.5 h-2.5 text-emerald-700" />
                  <span>{campaign.updates.length} {campaign.updates.length === 1 ? 'post' : 'posts'}</span>
                </span>
              )}
              {contactNum && (
                <a 
                  href={`tel:${contactNum.replace(/\s+/g, '')}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-100/70 hover:bg-emerald-100 px-2 py-0.5 rounded-md transition-colors"
                  title="Direct call"
                >
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>{contactNum}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar & Financials */}
        <div className="space-y-3 pt-3 border-t border-slate-100 relative">
          
          {/* Progress Visual */}
          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-xs font-bold text-slate-900">
                {percentage}% <span className="font-normal text-slate-500">funded</span>
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Target: {formatUGX(campaign.targetAmount)}
              </span>
            </div>
            
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  urgency.severity === 'critical'
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 animate-pulse'
                    : urgency.severity === 'high'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Raised & Donors Summary */}
          <div className="flex items-center justify-between text-xs text-slate-700">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm sm:text-base font-black text-slate-900">
                  {formatUGX(campaign.raisedAmount)}
                </span>
                <span 
                  className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200/80 shadow-2xs"
                  title={`${campaign.donorsCount} verified unique contributors`}
                >
                  <Users className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                  <span>{campaign.donorsCount} {campaign.donorsCount === 1 ? 'contributor' : 'contributors'}</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block">Raised in UGX</span>
            </div>

            <div className="flex items-center text-slate-600">
              <div 
                className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg border ${
                  urgency.isEndingSoon
                    ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                    : 'bg-slate-50 text-slate-600 border-slate-100'
                }`} 
                title={urgency.isEndingSoon ? `Urgent: ${campaign.daysRemaining} days (${urgency.hoursRemainingApprox}h) left` : `${campaign.daysRemaining} days remaining`}
              >
                {urgency.isEndingSoon ? (
                  <Clock className="w-3 h-3 text-rose-600 shrink-0" />
                ) : (
                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                )}
                <span>
                  {campaign.daysRemaining === 1 
                    ? '24h left' 
                    : campaign.daysRemaining === 2 
                    ? '48h left' 
                    : `${campaign.daysRemaining}d left`}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons & Share Button */}
          <div className="flex items-center gap-1.5 pt-2">
            <button
              onClick={() => onSelect(campaign)}
              className="flex-1 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors text-center cursor-pointer truncate"
            >
              Read Story
            </button>

            {/* Social Share Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsShareOpen(!isShareOpen);
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                isShareOpen 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-200/90'
              }`}
              title="Share on WhatsApp or copy link"
              aria-label="Share campaign"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => onDonate(campaign)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-black text-slate-900 bg-yellow-400 hover:bg-yellow-300 rounded-xl shadow-sm border-b-2 border-yellow-600 active:scale-95 transition-all cursor-pointer truncate"
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-900 shrink-0" />
              <span>Donate</span>
            </button>
          </div>

          {/* Share Popover Dropdown */}
          {isShareOpen && (
            <div 
              ref={popoverRef}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-full left-0 right-0 mb-2 z-30 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3.5 space-y-2.5 transition-all animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Share Fundraiser</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsShareOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* WhatsApp Direct Share Button */}
              <a
                href={getWhatsAppShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsShareOpen(false)}
                className="w-full flex items-center justify-between p-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-bold text-xs shadow-sm transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageCircle className="w-3.5 h-3.5 fill-white text-[#25D366]" />
                  </div>
                  <div className="text-left">
                    <span className="block leading-none font-extrabold text-white">Share to WhatsApp</span>
                    <span className="text-[10px] text-emerald-100 font-medium">Chats & Status</span>
                  </div>
                </div>
                <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-bold">Fast</span>
              </a>

              {/* Copy Link Button */}
              <button
                type="button"
                onClick={handleCopyLink}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  copied 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${copied ? 'bg-emerald-200' : 'bg-slate-200'}`}>
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-700" />
                    )}
                  </div>
                  <span className="font-bold">
                    {copied ? 'Link Copied to Clipboard!' : 'Copy Campaign Link'}
                  </span>
                </div>
                {copied && (
                  <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    Done
                  </span>
                )}
              </button>

              {/* Native System Share (if supported) */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-full text-center text-[11px] font-semibold text-slate-500 hover:text-slate-800 pt-0.5 transition-colors"
                >
                  More sharing options...
                </button>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

