import { useState, useEffect, FC } from 'react';
import { AdminUser, Campaign, DonorCheer, PaymentTransaction } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { FeaturedHeroSpotlight } from './components/FeaturedHeroSpotlight';
import { CampaignCard } from './components/CampaignCard';
import { CampaignDetailsModal } from './components/CampaignDetailsModal';
import { MobileMoneyModal } from './components/MobileMoneyModal';
import { CreateCampaignModal } from './components/CreateCampaignModal';
import { LiveDonationsTicker } from './components/LiveDonationsTicker';
import { OrganizerPayoutModal } from './components/OrganizerPayoutModal';
import { PaymentGatewayInfoModal } from './components/PaymentGatewayInfoModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { EditCampaignModal } from './components/EditCampaignModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { FloatingStartFundraiserButton } from './components/FloatingStartFundraiserButton';
import { Footer } from './components/Footer';
import { CommunityUpdatesModal } from './components/CommunityUpdatesModal';
import { AllCampaignUpdatesFeed } from './components/AllCampaignUpdatesFeed';
import { 
  Flame, 
  MessageSquare, 
  RefreshCw, 
  Search, 
  Share2, 
  ShieldCheck, 
  Sparkles, 
  Wifi, 
  WifiOff, 
  X 
} from 'lucide-react';
import { formatSocialTimestamp } from './utils/formatters';
import { getCampaignUrgencyInfo } from './utils/urgency';
import { subscribeToCampaigns, subscribeToDonations, seedInitialFirestoreDataIfEmpty } from './services/firestoreService';

export default function App() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [recentDonations, setRecentDonations] = useState<DonorCheer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [newPostToast, setNewPostToast] = useState<{ campaign: Campaign; timestamp: string } | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [reconnectedToast, setReconnectedToast] = useState<boolean>(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [isUrgentOnly, setIsUrgentOnly] = useState<boolean>(false);

  // View Mode for Main Section: 'campaigns' | 'feed'
  const [mainViewMode, setMainViewMode] = useState<'campaigns' | 'feed'>('campaigns');

  // Modal States
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [donatingCampaign, setDonatingCampaign] = useState<Campaign | null>(null);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState<boolean>(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState<boolean>(false);
  const [isGatewayInfoOpen, setIsGatewayInfoOpen] = useState<boolean>(false);
  const [isUpdatesModalOpen, setIsUpdatesModalOpen] = useState<boolean>(false);

  // Admin States
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem('kusanya_admin_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState<boolean>(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Platform Live Stats
  const [totalRaisedUGX, setTotalRaisedUGX] = useState<number>(70300000);
  const [totalDonors, setTotalDonors] = useState<number>(529);
  const [, setDistrictsCount] = useState<number>(14);

  // Fetch campaigns from backend / local resilient fallback
  const fetchCampaigns = async () => {
    try {
      const data = await api.getCampaigns();
      if (data.success && data.campaigns) {
        setCampaigns(data.campaigns);
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  };

  // Fetch recent donations and stats
  const fetchRecentFeed = async () => {
    try {
      const data = await api.getRecentDonations();
      if (data.success) {
        setRecentDonations(data.donations || []);
        if (data.stats) {
          setTotalRaisedUGX(data.stats.totalRaisedUGX);
          setTotalDonors(data.stats.totalDonors);
          setDistrictsCount(data.stats.districtsCovered);
        }
      }
    } catch (err) {
      console.error('Error fetching donations feed:', err);
    }
  };

  useEffect(() => {
    let unsubscribeCampaigns: (() => void) | undefined;
    let unsubscribeDonations: (() => void) | undefined;

    const init = async () => {
      setIsLoading(true);
      // Seed Cloud Firestore if empty
      await seedInitialFirestoreDataIfEmpty();
      await Promise.all([fetchCampaigns(), fetchRecentFeed()]);
      setIsLoading(false);

      // Subscribe to real-time Firestore updates
      unsubscribeCampaigns = subscribeToCampaigns((firestoreCampaigns) => {
        if (firestoreCampaigns && firestoreCampaigns.length > 0) {
          setCampaigns(firestoreCampaigns);
          const totalRaised = firestoreCampaigns.reduce((acc, c) => acc + (c.raisedAmount || 0), 0);
          const donors = firestoreCampaigns.reduce((acc, c) => acc + (c.donorsCount || 0), 0);
          const districts = Array.from(new Set(firestoreCampaigns.map((c) => c.district))).length;
          setTotalRaisedUGX(totalRaised);
          setTotalDonors(donors);
          setDistrictsCount(districts);
        }
      });

      unsubscribeDonations = subscribeToDonations((firestoreDonations) => {
        if (firestoreDonations && firestoreDonations.length > 0) {
          setRecentDonations(firestoreDonations);
        }
      });
    };
    init();

    // Poll live donations ticker as secondary heartbeat
    const interval = setInterval(fetchRecentFeed, 20000);

    // Network status listener (handle offline & hide query parameters)
    const handleOffline = () => {
      setIsOffline(true);
      try {
        if (window.location.search || window.location.hash) {
          window.history.replaceState({}, '', window.location.pathname);
        }
      } catch {
        // ignore
      }
    };

    const handleOnline = () => {
      setIsOffline(false);
      setReconnectedToast(true);
      setTimeout(() => setReconnectedToast(false), 4000);
      fetchCampaigns();
      fetchRecentFeed();
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Cross-tab real-time sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kusanya_campaigns_v2' && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          if (Array.isArray(updated)) {
            setCampaigns(updated);
          }
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (unsubscribeCampaigns) unsubscribeCampaigns();
      if (unsubscribeDonations) unsubscribeDonations();
      clearInterval(interval);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Handle URL deep link to campaign
  useEffect(() => {
    if (campaigns.length > 0 && !selectedCampaign) {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const campaignParam = urlParams.get('campaign') || urlParams.get('c');
        if (campaignParam) {
          const found = campaigns.find((c) => c.id === campaignParam);
          if (found) {
            setSelectedCampaign(found);
          }
        }
      } catch {
        // Ignore
      }
    }
  }, [campaigns, selectedCampaign]);

  // Compute urgent campaigns count & total updates count
  const urgentCampaigns = campaigns.filter((c) => getCampaignUrgencyInfo(c).isUrgent);
  const urgentCount = urgentCampaigns.length;
  const totalUpdatesCount = campaigns.reduce((acc, c) => acc + (c.updates?.length || 0), 0);

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((c) => {
    const urgency = getCampaignUrgencyInfo(c);

    // Category filter (supports 'urgent' as a category tab)
    const matchesCat = 
      selectedCategory === 'all' 
        ? true 
        : selectedCategory === 'urgent' 
        ? urgency.isUrgent 
        : c.category.toLowerCase() === selectedCategory.toLowerCase();

    // Region filter
    const matchesReg = selectedRegion === 'all' || c.region.toLowerCase() === selectedRegion.toLowerCase();

    // Urgency toggle filter
    const matchesUrgency = !isUrgentOnly || urgency.isUrgent;

    // Search query filter
    const matchesSearch = !searchQuery || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.organizerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.beneficiaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.story.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesReg && matchesUrgency && matchesSearch;
  });

  // Handle successful donation
  const handleDonationComplete = (tx: PaymentTransaction, newRaisedAmount: number) => {
    // Update campaign in list
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === tx.campaignId) {
          return {
            ...c,
            raisedAmount: newRaisedAmount || c.raisedAmount + tx.amount,
            donorsCount: c.donorsCount + 1,
          };
        }
        return c;
      })
    );

    // If modal open, update selected campaign too
    if (selectedCampaign && selectedCampaign.id === tx.campaignId) {
      setSelectedCampaign((prev) =>
        prev
          ? {
              ...prev,
              raisedAmount: newRaisedAmount || prev.raisedAmount + tx.amount,
              donorsCount: prev.donorsCount + 1,
            }
          : null
      );
    }

    // Refresh feed to show new donation
    fetchRecentFeed();
  };

  // Handle new campaign creation
  const handleCampaignCreated = (newCamp: Campaign) => {
    setCampaigns((prev) => [newCamp, ...prev]);
    setSelectedCategory('all');
    setSelectedRegion('all');
    setIsUrgentOnly(false);
    setSearchQuery('');
    setSelectedCampaign(newCamp);
    
    // Trigger real-time post confirmation banner
    setNewPostToast({
      campaign: newCamp,
      timestamp: newCamp.createdAt || new Date().toISOString()
    });

    // Auto-scroll gently to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Refresh live stats & tickers
    fetchRecentFeed();
  };

  // Handle admin login click
  const handleOpenAdminPortal = () => {
    if (adminUser) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleAdminLoginSuccess = (admin: AdminUser) => {
    setAdminUser(admin);
    setIsAdminDashboardOpen(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('kusanya_admin_session');
    setAdminUser(null);
    setIsAdminDashboardOpen(false);
  };

  const handleSaveCampaignEdit = async (updated: Campaign) => {
    await api.updateCampaign(updated.id, updated);
    await fetchCampaigns();
    if (selectedCampaign && selectedCampaign.id === updated.id) {
      setSelectedCampaign(updated);
    }
  };

  // Post organizer update / story / receipt and persist it
  const handlePostUpdate = async (
    campaignId: string,
    title: string,
    content: string,
    author?: string,
    imageUrl?: string,
    category?: 'update' | 'milestone' | 'receipt' | 'story' | 'gratitude'
  ) => {
    try {
      const data = await api.postUpdate(campaignId, title, content, author, imageUrl, category);
      if (data.success && data.update) {
        setCampaigns((prev) =>
          prev.map((c) => {
            if (c.id === campaignId) {
              return { ...c, updates: [data.update, ...(c.updates || [])] };
            }
            return c;
          })
        );
        if (selectedCampaign && selectedCampaign.id === campaignId) {
          setSelectedCampaign((prev) =>
            prev ? { ...prev, updates: [data.update, ...(prev.updates || [])] } : null
          );
        }
      }
    } catch (err) {
      console.error('Error posting update:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white font-sans pb-16 md:pb-0">
      
      {/* Top Navigation */}
      <Navbar
        onStartCampaign={() => setIsCreatingCampaign(true)}
        onOpenPayouts={() => setIsPayoutModalOpen(true)}
        onOpenGatewayInfo={() => setIsGatewayInfoOpen(true)}
        onOpenAdmin={handleOpenAdminPortal}
        onOpenUpdatesFeed={() => setIsUpdatesModalOpen(true)}
        adminUser={adminUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isUrgentOnly={isUrgentOnly}
        onToggleUrgentOnly={() => setIsUrgentOnly((prev) => !prev)}
        urgentCount={urgentCount}
        totalUpdatesCount={totalUpdatesCount}
      />

      {/* Offline Status Safeguard Banner */}
      {isOffline && (
        <div className="bg-amber-900 text-amber-100 px-4 py-2.5 border-b border-amber-700/60 shadow-md sticky top-16 z-40 flex items-center justify-between text-xs sm:text-sm">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-300 shrink-0 animate-pulse" />
              <span>
                <strong className="text-amber-200">Kusanya Offline Mode:</strong> Browsing local cached fundraisers & Mobile Money directories.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (navigator.onLine) {
                  setIsOffline(false);
                  fetchCampaigns();
                }
              }}
              className="px-2.5 py-1 bg-amber-800 hover:bg-amber-700 text-white font-semibold rounded text-xs transition-colors shrink-0 cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Reconnected Toast */}
      {reconnectedToast && (
        <div className="bg-emerald-800 text-white px-4 py-2 border-b border-emerald-600 shadow-md sticky top-16 z-40 flex items-center justify-center text-xs sm:text-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-300" />
            <span className="font-semibold">Back Online — Connected to Kusanya Live Network</span>
          </div>
        </div>
      )}

      {/* Live Post Toast Notification */}
      {newPostToast && (
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white px-4 py-3 border-y border-emerald-500/40 shadow-xl sticky top-16 z-40 animate-in slide-in-from-top-4 duration-300">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-xs sm:text-sm text-emerald-300">🚀 Published Live to Kusanya Database!</span>
                  <span className="text-[11px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-200">
                    {formatSocialTimestamp(newPostToast.timestamp).full}
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                  <strong>{newPostToast.campaign.title}</strong> in {newPostToast.campaign.district} by {newPostToast.campaign.organizerName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCampaign(newPostToast.campaign)}
                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                View Post
              </button>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `🇺🇬 Check out this new fundraiser on Kusanya: "${newPostToast.campaign.title}" in ${newPostToast.campaign.district}, Uganda!\nSupport via MTN/Airtel MoMo: https://kusanya.org/?campaign=${newPostToast.campaign.id}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
              >
                <Share2 className="w-3 h-3" />
                <span>Share</span>
              </a>
              <button
                type="button"
                onClick={() => setNewPostToast(null)}
                className="p-1 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Ticker Bar */}
      <LiveDonationsTicker donations={recentDonations} />

      {/* Hero Spotlight on Top */}
      <FeaturedHeroSpotlight
        campaigns={campaigns}
        onSelectCampaign={(c) => setSelectedCampaign(c)}
        onDonateToCampaign={(c) => setDonatingCampaign(c)}
        onStartCampaign={() => setIsCreatingCampaign(true)}
        onOpenGatewayInfo={() => setIsGatewayInfoOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedRegion={selectedRegion}
        onSelectRegion={setSelectedRegion}
        totalRaisedUGX={totalRaisedUGX}
        totalDonors={totalDonors}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* Main View Switcher Header (Fundraisers vs Community Posts) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {mainViewMode === 'feed' ? 'Live Transparency & Post Updates' : (
                  selectedCategory === 'all' 
                    ? (isUrgentOnly ? '⚡ Urgent Fundraisers (<48h or Reaching Goal)' : 'Featured Fundraisers in Uganda')
                    : selectedCategory === 'urgent'
                    ? '⚡ Urgent Relief & Critical Cases'
                    : selectedCategory === 'faith'
                    ? 'Churches & Ministry Fundraisers'
                    : selectedCategory === 'sacco'
                    ? 'SACCOs & Group Savings'
                    : `${selectedCategory.toUpperCase()} Causes`
                )}
              </h2>

              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                isUrgentOnly 
                  ? 'bg-rose-100 text-rose-800 border-rose-200' 
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}>
                {mainViewMode === 'feed' ? `${totalUpdatesCount} Posts` : `${filteredCampaigns.length} active`}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {mainViewMode === 'feed'
                ? 'Read real-time story progress, hospital receipts, and community notes across all fundraisers in Uganda.'
                : 'Direct mobile money giving with real-time receipt generation and transparent fund release.'}
            </p>
          </div>

          {/* Controls: Mode switch & Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setMainViewMode('campaigns')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mainViewMode === 'campaigns'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fundraisers ({campaigns.length})
              </button>

              <button
                type="button"
                onClick={() => setMainViewMode('feed')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mainViewMode === 'feed'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>All Updates ({totalUpdatesCount})</span>
              </button>
            </div>

            {/* Urgency Quick Toggle */}
            <button
              type="button"
              onClick={() => {
                setMainViewMode('campaigns');
                setIsUrgentOnly((prev) => !prev);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isUrgentOnly
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
              }`}
              title="Filter campaigns ending in <48h or reaching target goal"
            >
              <Flame className={`w-3.5 h-3.5 ${isUrgentOnly ? 'text-white' : 'text-rose-600'}`} />
              <span>Urgent (&lt;48h/Goal)</span>
              {urgentCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isUrgentOnly ? 'bg-white text-rose-700' : 'bg-rose-200 text-rose-900'
                }`}>
                  {urgentCount}
                </span>
              )}
            </button>

            {adminUser && (
              <button
                type="button"
                onClick={() => setIsAdminDashboardOpen(true)}
                className="text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>Admin</span>
              </button>
            )}

            {(selectedCategory !== 'all' || selectedRegion !== 'all' || isUrgentOnly || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedRegion('all');
                  setIsUrgentOnly(false);
                  setSearchQuery('');
                  setMainViewMode('campaigns');
                }}
                className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer border border-red-200"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Content based on Mode */}
        {mainViewMode === 'feed' ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-sm">
            <AllCampaignUpdatesFeed
              campaigns={campaigns}
              onSelectCampaign={(c) => setSelectedCampaign(c)}
              onDonateToCampaign={(c) => setDonatingCampaign(c)}
              onPostUpdate={handlePostUpdate}
            />
          </div>
        ) : (
          <>
            {/* Loading State */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
                <p className="text-sm font-semibold">Loading Ugandan fundraisers & live MoMo feed...</p>
              </div>
            ) : filteredCampaigns.length === 0 ? (
              /* Empty Search State */
              <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
                <Search className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 mb-1">No fundraisers found</h3>
                <p className="text-xs text-slate-600 mb-5">
                  No active campaigns match your criteria{isUrgentOnly ? ' with urgent status' : ''} "{searchQuery || selectedCategory}".
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedRegion('all');
                      setIsUrgentOnly(false);
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-slate-800 text-white rounded-full text-xs font-bold hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    Clear Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCampaign(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-full text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer shadow-sm shadow-emerald-600/20"
                  >
                    + Start This Fundraiser
                  </button>
                </div>
              </div>
            ) : (
              /* Cards Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onSelect={(c) => setSelectedCampaign(c)}
                    onDonate={(c) => setDonatingCampaign(c)}
                  />
                ))}
              </div>
            )}
          </>
        )}

      </main>

      {/* Modals */}
      {selectedCampaign && (
        <CampaignDetailsModal
          campaign={selectedCampaign}
          donations={recentDonations}
          onClose={() => setSelectedCampaign(null)}
          onDonate={(c) => {
            setSelectedCampaign(null);
            setDonatingCampaign(c);
          }}
          onPostUpdate={handlePostUpdate}
        />
      )}

      {donatingCampaign && (
        <MobileMoneyModal
          campaign={donatingCampaign}
          onClose={() => setDonatingCampaign(null)}
          onDonationComplete={handleDonationComplete}
        />
      )}

      {isCreatingCampaign && (
        <CreateCampaignModal
          onClose={() => setIsCreatingCampaign(false)}
          onCampaignCreated={handleCampaignCreated}
        />
      )}

      {isPayoutModalOpen && (
        <OrganizerPayoutModal
          campaigns={campaigns}
          onClose={() => setIsPayoutModalOpen(false)}
        />
      )}

      {isGatewayInfoOpen && (
        <PaymentGatewayInfoModal
          onClose={() => setIsGatewayInfoOpen(false)}
        />
      )}

      {isUpdatesModalOpen && (
        <CommunityUpdatesModal
          isOpen={isUpdatesModalOpen}
          onClose={() => setIsUpdatesModalOpen(false)}
          campaigns={campaigns}
          onSelectCampaign={(c) => setSelectedCampaign(c)}
          onDonateToCampaign={(c) => setDonatingCampaign(c)}
          onPostUpdate={handlePostUpdate}
        />
      )}

      {/* Administrative Modals */}
      {isAdminLoginOpen && (
        <AdminLoginModal
          isOpen={isAdminLoginOpen}
          onClose={() => setIsAdminLoginOpen(false)}
          onLoginSuccess={handleAdminLoginSuccess}
        />
      )}

      {isAdminDashboardOpen && adminUser && (
        <AdminDashboardModal
          isOpen={isAdminDashboardOpen}
          onClose={() => setIsAdminDashboardOpen(false)}
          admin={adminUser}
          onLogout={handleAdminLogout}
          campaigns={campaigns}
          onRefreshCampaigns={fetchCampaigns}
          onSelectCampaignToEdit={(camp) => setEditingCampaign(camp)}
          onCreateNewCampaign={() => {
            setIsAdminDashboardOpen(false);
            setIsCreatingCampaign(true);
          }}
          onViewCampaign={(camp) => {
            setSelectedCampaign(camp);
          }}
        />
      )}

      {editingCampaign && (
        <EditCampaignModal
          campaign={editingCampaign}
          isOpen={!!editingCampaign}
          onClose={() => setEditingCampaign(null)}
          onSave={handleSaveCampaignEdit}
        />
      )}

      {/* Floating Hover Button for Starting a Fundraiser */}
      <FloatingStartFundraiserButton
        onClick={() => setIsCreatingCampaign(true)}
      />

      {/* Footer */}
      <Footer
        onStartCampaign={() => setIsCreatingCampaign(true)}
        onOpenGatewayInfo={() => setIsGatewayInfoOpen(true)}
        onOpenPayouts={() => setIsPayoutModalOpen(true)}
        onOpenAdmin={handleOpenAdminPortal}
        onSelectDistrict={(d) => setSearchQuery(d)}
      />

      {/* Mobile Fixed Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={mainViewMode === 'feed' ? 'updates' : 'explore'}
        onExplore={() => {
          setMainViewMode('campaigns');
          setSelectedCategory('all');
          setSelectedRegion('all');
          setIsUrgentOnly(false);
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenUpdates={() => {
          setIsUpdatesModalOpen(true);
        }}
        onStartCampaign={() => setIsCreatingCampaign(true)}
        onOpenPayouts={() => setIsPayoutModalOpen(true)}
        onOpenGatewayInfo={() => setIsGatewayInfoOpen(true)}
        updatesCount={totalUpdatesCount}
      />

    </div>
  );
}
