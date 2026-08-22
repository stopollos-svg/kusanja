import React, { useState, useEffect } from 'react';
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
import { Footer } from './components/Footer';
import { Heart, RefreshCw, Search, ShieldCheck, Sparkles } from 'lucide-react';

export default function App() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [recentDonations, setRecentDonations] = useState<DonorCheer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  // Modal States
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [donatingCampaign, setDonatingCampaign] = useState<Campaign | null>(null);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState<boolean>(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState<boolean>(false);
  const [isGatewayInfoOpen, setIsGatewayInfoOpen] = useState<boolean>(false);

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
  const [districtsCount, setDistrictsCount] = useState<number>(14);

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
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchCampaigns(), fetchRecentFeed()]);
      setIsLoading(false);
    };
    init();

    // Poll live donations ticker every 15 seconds
    const interval = setInterval(fetchRecentFeed, 15000);
    return () => clearInterval(interval);
  }, []);

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((c) => {
    const matchesCat = selectedCategory === 'all' || c.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesReg = selectedRegion === 'all' || c.region.toLowerCase() === selectedRegion.toLowerCase();
    const matchesSearch = !searchQuery || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.organizerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.story.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesReg && matchesSearch;
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
    setSearchQuery('');
    setSelectedCampaign(newCamp);
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

  // Post organizer update
  const handlePostUpdate = async (campaignId: string, title: string, content: string) => {
    try {
      const data = await api.postUpdate(campaignId, title, content);
      if (data.success && data.update) {
        setCampaigns((prev) =>
          prev.map((c) => {
            if (c.id === campaignId) {
              return { ...c, updates: [data.update, ...c.updates] };
            }
            return c;
          })
        );
        if (selectedCampaign && selectedCampaign.id === campaignId) {
          setSelectedCampaign((prev) =>
            prev ? { ...prev, updates: [data.update, ...prev.updates] } : null
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
        adminUser={adminUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Live Ticker Bar */}
      <LiveDonationsTicker
        donations={recentDonations}
      />

      {/* GoFundMe-Style Featured Fundraisers Hero Spotlight on Top */}
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

      {/* Main Campaign Grid Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {selectedCategory === 'all' 
                  ? 'Featured Fundraisers in Uganda' 
                  : selectedCategory === 'faith'
                  ? 'Churches & Ministry Fundraisers'
                  : selectedCategory === 'sacco'
                  ? 'SACCOs & Group Savings'
                  : `${selectedCategory.toUpperCase()} Causes`}
              </h2>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {filteredCampaigns.length} active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Direct mobile money giving with real-time receipt generation and transparent fund release.
            </p>
          </div>

          {/* Quick Active Filter Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {adminUser && (
              <button
                onClick={() => setIsAdminDashboardOpen(true)}
                className="text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>Admin Dashboard ({adminUser.email.split('@')[0]})</span>
              </button>
            )}

            {(selectedCategory !== 'all' || selectedRegion !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedRegion('all');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors self-start sm:self-auto cursor-pointer border border-red-200"
              >
                Reset Filters (Show All)
              </button>
            )}
          </div>
        </div>

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
              No active campaigns match your search for "{searchQuery || selectedCategory}".
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedRegion('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-slate-800 text-white rounded-full text-xs font-bold hover:bg-slate-900 transition-colors cursor-pointer"
              >
                Clear Search
              </button>
              <button
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
        onExplore={() => {
          setSelectedCategory('all');
          setSelectedRegion('all');
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onStartCampaign={() => setIsCreatingCampaign(true)}
        onOpenPayouts={() => setIsPayoutModalOpen(true)}
        onOpenGatewayInfo={() => setIsGatewayInfoOpen(true)}
      />

    </div>
  );
}

