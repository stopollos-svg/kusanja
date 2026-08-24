import { FC, useState, FormEvent } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  PlusCircle, 
  ExternalLink,
  Search,
  Filter,
  Check,
  Send,
  X,
  Phone,
  Smartphone,
  Flame,
  Pin
} from 'lucide-react';
import { Campaign, CampaignUpdate } from '../types';
import { formatUGX, formatSocialTimestamp } from '../utils/formatters';
import { getCampaignUrgencyInfo } from '../utils/urgency';

interface FlatUpdateItem {
  update: CampaignUpdate;
  campaign: Campaign;
}

interface AllCampaignUpdatesFeedProps {
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onDonateToCampaign: (campaign: Campaign) => void;
  onPostUpdate?: (
    campaignId: string,
    title: string,
    content: string,
    author?: string,
    imageUrl?: string,
    category?: 'update' | 'milestone' | 'receipt' | 'story' | 'gratitude'
  ) => Promise<void>;
  showComposerInitially?: boolean;
}

export const AllCampaignUpdatesFeed: FC<AllCampaignUpdatesFeedProps> = ({
  campaigns,
  onSelectCampaign,
  onDonateToCampaign,
  onPostUpdate,
  showComposerInitially = false,
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchPostQuery, setSearchPostQuery] = useState<string>('');
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // Quick Composer State
  const [showGlobalComposer, setShowGlobalComposer] = useState<boolean>(showComposerInitially);
  const [selectedCampaignForPost, setSelectedCampaignForPost] = useState<string>(campaigns[0]?.id || '');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newCategory, setNewCategory] = useState<'update' | 'milestone' | 'receipt' | 'story' | 'gratitude'>('update');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  // Flatten all updates across all campaigns
  const allUpdates: FlatUpdateItem[] = [];
  campaigns.forEach((campaign) => {
    if (campaign.updates && Array.isArray(campaign.updates)) {
      campaign.updates.forEach((update) => {
        allUpdates.push({
          update,
          campaign,
        });
      });
    }
  });

  // Sort chronologically (newest first, pinned updates on top)
  allUpdates.sort((a, b) => {
    if (a.update.pinned && !b.update.pinned) return -1;
    if (!a.update.pinned && b.update.pinned) return 1;
    const dateA = new Date(a.update.date).getTime() || 0;
    const dateB = new Date(b.update.date).getTime() || 0;
    return dateB - dateA;
  });

  // Filter updates
  const filteredUpdates = allUpdates.filter((item) => {
    const matchesCategory =
      selectedCategoryFilter === 'all' ||
      item.update.category === selectedCategoryFilter ||
      (selectedCategoryFilter === 'receipt' && item.update.category === 'receipt') ||
      (selectedCategoryFilter === 'urgent' && getCampaignUrgencyInfo(item.campaign).isUrgent);

    const matchesSearch =
      !searchPostQuery ||
      item.update.title.toLowerCase().includes(searchPostQuery.toLowerCase()) ||
      item.update.content.toLowerCase().includes(searchPostQuery.toLowerCase()) ||
      item.campaign.title.toLowerCase().includes(searchPostQuery.toLowerCase()) ||
      item.campaign.district.toLowerCase().includes(searchPostQuery.toLowerCase()) ||
      (item.update.author && item.update.author.toLowerCase().includes(searchPostQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleLike = (updateId: string) => {
    setLikedPosts((prev) => ({
      ...prev,
      [updateId]: !prev[updateId],
    }));
  };

  const handleSharePost = (item: FlatUpdateItem) => {
    const shareUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}${window.location.pathname}?campaign=${item.campaign.id}`
      : `https://kusanya.org/?campaign=${item.campaign.id}`;
    
    const text = `📢 Update on "${item.campaign.title}" (${item.campaign.district}, Uganda):\n"${item.update.title}"\n${item.update.content.slice(0, 140)}...\n\nRead more & support via MTN/Airtel MoMo: ${shareUrl}`;

    if (navigator.share) {
      navigator.share({
        title: item.update.title,
        text,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopiedPostId(item.update.id);
      setTimeout(() => setCopiedPostId(null), 2500);
    }
  };

  const handleSubmitPost = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignForPost || !newTitle.trim() || !newContent.trim() || !onPostUpdate) return;

    setIsSubmitting(true);
    try {
      const selectedCamp = campaigns.find(c => c.id === selectedCampaignForPost);
      await onPostUpdate(
        selectedCampaignForPost,
        newTitle.trim(),
        newContent.trim(),
        newAuthor.trim() || selectedCamp?.organizerName || 'Organizer',
        newImageUrl.trim() || undefined,
        newCategory
      );
      setNewTitle('');
      setNewContent('');
      setNewImageUrl('');
      setNewAuthor('');
      setShowGlobalComposer(false);
      setPostSuccess(true);
      setTimeout(() => setPostSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Live Community Posts & Updates Feed</span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {allUpdates.length} {allUpdates.length === 1 ? 'Post' : 'Posts'} Live
                </span>
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Transparent hospital receipts, progress milestones, and donor gratitude from verified Ugandan fundraisers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onPostUpdate && (
              <button
                type="button"
                onClick={() => setShowGlobalComposer(!showGlobalComposer)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{showGlobalComposer ? 'Close Composer' : '+ Publish New Post'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Success Alert */}
        {postSuccess && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Post published successfully!</strong> Your update is now retained and broadcast across all Kusanya web pages.
            </span>
          </div>
        )}

        {/* Global Post Composer Drawer */}
        {showGlobalComposer && onPostUpdate && (
          <form onSubmit={handleSubmitPost} className="mt-4 bg-slate-50 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  ✍️
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-900">
                    Publish Progress Update to Kusanya Feed
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Your post will appear on this universal updates page and inside the fundraiser details
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGlobalComposer(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Campaign Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Select Fundraiser Campaign *
              </label>
              <select
                value={selectedCampaignForPost}
                onChange={(e) => setSelectedCampaignForPost(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                required
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.district} - By {c.organizerName})
                  </option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                Post Category / Topic
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'update', label: '📢 General Update' },
                  { key: 'receipt', label: '🧾 Medical / Spend Receipt' },
                  { key: 'milestone', label: '🎯 Target Milestone' },
                  { key: 'story', label: '📖 Patient / Beneficiary Story' },
                  { key: 'gratitude', label: '🙏 Thank You Note' },
                ].map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setNewCategory(cat.key as any)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-all cursor-pointer ${
                      newCategory === cat.key
                        ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title and Author */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Post Headline / Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
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
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="Organizer Name"
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Photo / Receipt Image URL */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Attach Photo / Medical Receipt (Image URL) - Optional
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or uploaded receipt link"
                  className="flex-1 text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {newImageUrl && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                    <img
                      src={newImageUrl}
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

            {/* Content Body */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Post Content / Full Details *
              </label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Share the full update, hospital progress, expenditure breakdown, or note of thanks..."
                rows={3}
                className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Retained on Kusanya Live Network</span>
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowGlobalComposer(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Publishing...' : 'Publish Update'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Filter Pills & Search Bar */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Posts' },
              { id: 'receipt', label: '🧾 Receipts & Proof' },
              { id: 'milestone', label: '🎯 Milestones' },
              { id: 'story', label: '📖 Stories' },
              { id: 'gratitude', label: '🙏 Gratitude' },
              { id: 'urgent', label: '⚡ Urgent Causes' },
            ].map((cat) => {
              const isSelected = selectedCategoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Post Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchPostQuery}
              onChange={(e) => setSearchPostQuery(e.target.value)}
              placeholder="Search posts or causes..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none text-slate-900"
            />
            {searchPostQuery && (
              <button
                type="button"
                onClick={() => setSearchPostQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Posts Stream */}
      {filteredUpdates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800 mb-1">No posts found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {searchPostQuery || selectedCategoryFilter !== 'all'
              ? 'No updates match your current search criteria. Try clearing filters.'
              : 'Be the first organizer to post an update for your fundraiser.'}
          </p>
          {(searchPostQuery || selectedCategoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSelectedCategoryFilter('all');
                setSearchPostQuery('');
              }}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Reset Post Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredUpdates.map((item, idx) => {
            const { update, campaign } = item;
            const isLiked = likedPosts[update.id];
            const totalLikes = (update.likesCount || 0) + (isLiked ? 1 : 0);
            const urgency = getCampaignUrgencyInfo(campaign);
            const percentRaised = Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100));

            return (
              <article
                key={`${campaign.id}-${update.id}-${idx}`}
                className={`bg-white border rounded-2xl p-5 transition-all shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md ${
                  update.pinned ? 'border-amber-300 bg-amber-50/15' : 'border-slate-200/90'
                }`}
              >
                {/* Header: Linked Campaign Info */}
                <div className="space-y-2.5">
                  <div 
                    onClick={() => onSelectCampaign(campaign)}
                    className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 rounded-xl transition-colors cursor-pointer group"
                    title={`View fundraiser: ${campaign.title}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-200 border border-slate-200">
                        <img
                          src={campaign.image}
                          alt={campaign.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                            {campaign.category}
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5 text-slate-400" />
                            <span>{campaign.district}</span>
                          </span>
                          {urgency.isUrgent && (
                            <span className="text-[9px] font-black text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-200 flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5 text-rose-600 animate-pulse" />
                              <span>{urgency.badgeLabel}</span>
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                          {campaign.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 shrink-0">
                      <span className="hidden sm:inline">Cause</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Post Author & Category */}
                  <div className="flex flex-wrap items-start justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                        {update.author ? update.author.charAt(0).toUpperCase() : 'O'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-slate-900">{update.author || campaign.organizerName}</span>
                          <span className="text-[10px] text-slate-400">•</span>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{update.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {update.category && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                              {update.category === 'receipt'
                                ? '🧾 Verified Receipt'
                                : update.category === 'milestone'
                                ? '🎯 Milestone'
                                : update.category === 'story'
                                ? '📖 Story'
                                : update.category === 'gratitude'
                                ? '🙏 Gratitude'
                                : '📢 Progress Update'}
                            </span>
                          )}
                          {update.pinned && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                              <Pin className="w-2.5 h-2.5 text-amber-700" />
                              <span>Pinned</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Post Headline */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {update.title}
                  </h3>

                  {/* Optional Image / Receipt Attachment */}
                  {update.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 max-h-72 bg-slate-900 group">
                      <img
                        src={update.imageUrl}
                        alt={update.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full max-h-72 object-cover group-hover:scale-102 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Post Body */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {update.content}
                  </p>
                </div>

                {/* Footer: Reactions, Sharing, and MoMo Donate CTA */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  {/* Progress Mini Bar */}
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>
                      Raised <strong>{formatUGX(campaign.raisedAmount)}</strong> of {formatUGX(campaign.targetAmount)}
                    </span>
                    <span className="font-extrabold text-emerald-700">{percentRaised}% funded</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                    <div className="flex items-center gap-2">
                      {/* Cheer button */}
                      <button
                        type="button"
                        onClick={() => handleLike(update.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          isLiked
                            ? 'bg-rose-50 border-rose-200 text-rose-600'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600 text-rose-600' : 'text-slate-400'}`} />
                        <span>{totalLikes > 0 ? `${totalLikes} Cheer${totalLikes > 1 ? 's' : ''}` : 'Cheer'}</span>
                      </button>

                      {/* Share post */}
                      <button
                        type="button"
                        onClick={() => handleSharePost(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 transition-colors cursor-pointer"
                        title="Share update on WhatsApp"
                      >
                        {copiedPostId === update.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Share</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Quick MoMo Donate Button */}
                    <button
                      type="button"
                      onClick={() => onDonateToCampaign(campaign)}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl text-xs shadow-xs border-b-2 border-yellow-600 active:scale-95 transition-all cursor-pointer"
                    >
                      <Smartphone className="w-3 h-3 text-slate-900" />
                      <span>Support with MoMo</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
