import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ArrowUpRight, 
  BarChart3, 
  Building2, 
  Check, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  DollarSign, 
  Download, 
  Edit3, 
  Eye, 
  FileText, 
  Filter, 
  Globe2, 
  Layers, 
  LogOut, 
  MapPin, 
  MoreVertical, 
  Percent, 
  Phone, 
  Plus, 
  Receipt, 
  RefreshCw, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  Trash2, 
  TrendingUp, 
  User, 
  Users, 
  Wallet, 
  X,
  Zap
} from 'lucide-react';
import { AdminAnalytics, AdminUser, Campaign, DonorCheer } from '../types';
import { api } from '../services/api';
import { KusanyaBrandLogo } from './KusanyaBrandLogo';
import { calculateCampaignActivity } from '../utils/activity';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: AdminUser;
  onLogout: () => void;
  campaigns: Campaign[];
  onRefreshCampaigns: () => void;
  onSelectCampaignToEdit: (campaign: Campaign) => void;
  onCreateNewCampaign: () => void;
  onViewCampaign: (campaign: Campaign) => void;
}

type TabType = 'overview' | 'campaigns' | 'featured' | 'transactions';

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  admin,
  onLogout,
  campaigns,
  onRefreshCampaigns,
  onSelectCampaignToEdit,
  onCreateNewCampaign,
  onViewCampaign,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminAnalytics();
      if (res.success && res.analytics) {
        setAnalytics(res.analytics);
      }
    } catch (err) {
      console.warn('Failed to load analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics();
    }
  }, [isOpen, campaigns]);

  if (!isOpen) return null;

  const totalRaised = campaigns.reduce((acc, c) => acc + (c.raisedAmount || 0), 0);
  const totalGoal = campaigns.reduce((acc, c) => acc + (c.targetAmount || 0), 0);
  const totalDonors = campaigns.reduce((acc, c) => acc + (c.donorsCount || 0), 0);
  const platformFee = Math.round(totalRaised * 0.05); // 5%
  const netDisbursements = totalRaised - platformFee; // 95%
  const overallProgress = totalGoal > 0 ? Math.min(Math.round((totalRaised / totalGoal) * 100), 100) : 0;
  const featuredCount = campaigns.filter(c => c.featured).length;

  const handleToggleFeatured = async (campaign: Campaign, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updatedFeatured = !campaign.featured;
      await api.toggleFeatured(campaign.id, updatedFeatured);
      onRefreshCampaigns();
      setActionMessage(`Updated "${campaign.title.slice(0, 30)}..." featured status to ${updatedFeatured ? 'Featured on Top ⭐' : 'Standard'}`);
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePromptDelete = (campaign: Campaign, e: React.MouseEvent) => {
    e.stopPropagation();
    setCampaignToDelete(campaign);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!campaignToDelete) return;
    setDeletingCampaignId(campaignToDelete.id);
    try {
      await api.deleteCampaign(campaignToDelete.id);
      onRefreshCampaigns();
      setDeleteConfirmOpen(false);
      setActionMessage(`Deleted campaign "${campaignToDelete.title}"`);
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err) {
      console.error('Delete failed', err);
    } finally {
      setDeletingCampaignId(null);
      setCampaignToDelete(null);
    }
  };

  // Filtered campaigns for table
  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = !searchQuery || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.organizerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || c.category === filterCategory;
    const matchesTab = activeTab !== 'featured' || c.featured;
    return matchesSearch && matchesCategory && matchesTab;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 text-slate-100">
        
        {/* Top App Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/80 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Administrative Backend
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Kusanya v2.6.4 Production
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                Progress & Collections Management
              </h2>
            </div>
          </div>

          {/* Admin User Info & Actions */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl px-3.5 py-1.5 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                {admin.email.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  {admin.name || admin.email.split('@')[0]}
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 font-black px-1.5 py-0.2 rounded">
                    Admin
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                  {admin.email}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Toast Notification */}
        {actionMessage && (
          <div className="bg-emerald-600 text-white px-6 py-2 text-xs font-bold flex items-center justify-between animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionMessage}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="text-white/80 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="bg-slate-950/60 px-6 border-b border-slate-800 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Collections & Progress</span>
            </button>

            <button
              onClick={() => setActiveTab('campaigns')}
              className={`px-4 py-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'campaigns'
                  ? 'border-emerald-500 text-emerald-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>All Fundraisers ({campaigns.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('featured')}
              className={`px-4 py-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'featured'
                  ? 'border-amber-500 text-amber-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Star className="w-4 h-4 fill-current" />
              <span>Featured Spotlight on Top ({featuredCount})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 py-2">
            <button
              onClick={onCreateNewCampaign}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Fundraiser</span>
            </button>
            <button
              onClick={fetchAnalytics}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900/50">
          
          {/* TAB 1: COLLECTIONS & FINANCIAL PROGRESS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Top High Impact Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Total Gross Collections */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700/80 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Total UGX Collections
                    </span>
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <Wallet className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white mb-1">
                    UGX {totalRaised.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Goal: UGX {totalGoal.toLocaleString()}</span>
                    <span className="text-emerald-400 font-bold">{overallProgress}% funded</span>
                  </div>
                  <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden mt-3">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>

                {/* 5% Platform Maintenance Fees */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700/80 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                      5% Platform Fee Reserve
                    </span>
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                      <Percent className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-amber-300 mb-1">
                    UGX {platformFee.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-400">
                    Dedicated to SMS gateway, server uptime & KYC verification
                  </p>
                </div>

                {/* 95% Net Beneficiary Payouts */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700/80 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-teal-400">
                      95% Net Direct Payouts
                    </span>
                    <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-teal-300 mb-1">
                    UGX {netDisbursements.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-400">
                    Disbursed directly via MTN MoMo & Airtel Money B2C
                  </p>
                </div>

                {/* Donors & Community Engagement */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700/80 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-sky-400">
                      Total Donors & Cheers
                    </span>
                    <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white mb-1">
                    {totalDonors.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>Avg Gift: ~UGX {totalDonors > 0 ? Math.round(totalRaised / totalDonors).toLocaleString() : '0'}</span>
                    <span className="text-sky-400 font-bold">{campaigns.length} Causes</span>
                  </div>
                </div>

              </div>

              {/* Payment Gateway Distribution & Category Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Gateway Share */}
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-emerald-400" />
                      Payment Collections by Provider
                    </h3>
                    <span className="text-[11px] text-slate-400">Uganda National Switch</span>
                  </div>

                  <div className="space-y-3">
                    {/* MTN MoMo */}
                    <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-black text-xs">
                          MTN
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">MTN Mobile Money (*165#)</div>
                          <div className="text-[10px] text-slate-400">58% of platform volume</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-white">
                          UGX {Math.round(totalRaised * 0.58).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-semibold">Instant Push</div>
                      </div>
                    </div>

                    {/* Airtel Money */}
                    <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-xs">
                          AIR
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Airtel Money (*185#)</div>
                          <div className="text-[10px] text-slate-400">32% of platform volume</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-white">
                          UGX {Math.round(totalRaised * 0.32).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-semibold">Instant Push</div>
                      </div>
                    </div>

                    {/* Visa / Mastercard */}
                    <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-xs">
                          VISA
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Visa & Mastercard (3D Secure)</div>
                          <div className="text-[10px] text-slate-400">7% diaspora / bank cards</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-white">
                          UGX {Math.round(totalRaised * 0.07).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-blue-400 font-semibold">3DS 2.0</div>
                      </div>
                    </div>

                    {/* PayPal */}
                    <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-black text-xs">
                          PP
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">PayPal International</div>
                          <div className="text-[10px] text-slate-400">3% cross-border diaspora</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-white">
                          UGX {Math.round(totalRaised * 0.03).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-sky-400 font-semibold">USD Auto-convert</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Regional & Category Breakdown */}
                <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Globe2 className="w-4 h-4 text-emerald-400" />
                      Cause Category Distribution
                    </h3>
                    <span className="text-[11px] text-slate-400">{campaigns.length} Fundraisers</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { cat: 'Medical & Surgery', key: 'medical', color: 'text-rose-400', bg: 'bg-rose-500/10' },
                      { cat: 'Churches & Ministry', key: 'faith', color: 'text-purple-400', bg: 'bg-purple-500/10' },
                      { cat: 'SACCOs & Group Savings', key: 'sacco', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                      { cat: 'Emergency Relief', key: 'emergency', color: 'text-orange-400', bg: 'bg-orange-500/10' },
                      { cat: 'Clean Water & Solar', key: 'community', color: 'text-teal-400', bg: 'bg-teal-500/10' },
                      { cat: 'School & Tuition', key: 'education', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    ].map((item) => {
                      const count = campaigns.filter(c => c.category === item.key).length;
                      const raised = campaigns.filter(c => c.category === item.key).reduce((a, b) => a + b.raisedAmount, 0);
                      return (
                        <div key={item.key} className={`p-3 rounded-xl border border-slate-700/60 ${item.bg}`}>
                          <div className="text-[11px] font-bold text-slate-300">{item.cat}</div>
                          <div className={`text-sm font-black ${item.color} mt-0.5`}>
                            UGX {(raised / 1000000).toFixed(1)}M
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {count} active {count === 1 ? 'campaign' : 'campaigns'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2 & 3: FUNDRAISER MANAGEMENT (EDIT & DELETE & FEATURED) */}
          {(activeTab === 'campaigns' || activeTab === 'featured') && (
            <div className="space-y-4">
              
              {/* Filter and Search Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                  <div className="relative w-full max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search campaign, organizer, or district..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="medical">Medical & Surgery</option>
                    <option value="faith">Churches & Ministry</option>
                    <option value="sacco">SACCOs & Group Savings</option>
                    <option value="emergency">Emergency Relief</option>
                    <option value="education">School & Tuition</option>
                    <option value="community">Clean Water & Solar</option>
                    <option value="business">Youth Enterprise</option>
                  </select>

                  <button
                    onClick={onCreateNewCampaign}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Campaign</span>
                  </button>
                </div>
              </div>

              {/* Fundraiser Cards / Table */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
                <div className="divide-y divide-slate-700/60">
                  {filteredCampaigns.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                      <Layers className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                      <p className="text-sm font-semibold">No fundraisers found matching criteria</p>
                    </div>
                  ) : (
                    filteredCampaigns.map((camp) => {
                      const percent = Math.min(Math.round((camp.raisedAmount / camp.targetAmount) * 100), 100);
                      const act = calculateCampaignActivity(camp);
                      return (
                        <div 
                          key={camp.id} 
                          className={`p-4 sm:p-5 hover:bg-slate-800/90 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                            camp.featured ? 'bg-amber-500/5' : ''
                          }`}
                        >
                          {/* Thumbnail & Title Info */}
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                              <img 
                                src={camp.image} 
                                alt={camp.title} 
                                className="w-full h-full object-cover" 
                              />
                              {camp.featured && (
                                <div className="absolute top-1 left-1 bg-amber-500 text-slate-950 p-1 rounded-md shadow-sm" title="Featured Spotlight">
                                  <Star className="w-3 h-3 fill-current" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  camp.featured 
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                                    : 'bg-slate-700 text-slate-300'
                                }`}>
                                  {camp.featured ? '⭐ Featured on Top' : 'Standard'}
                                </span>

                                <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                                  ⏳ {act.lifespanLabel} ({act.activityScore} pts)
                                </span>

                                <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase">
                                  {camp.category}
                                </span>

                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {camp.district}, Uganda
                                </span>
                              </div>

                              <h4 className="text-sm font-extrabold text-white truncate max-w-xl">
                                {camp.title}
                              </h4>

                              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                                <span>Organizer: <strong className="text-slate-200">{camp.organizerName}</strong></span>
                                <span>•</span>
                                <span>Payout: <strong className="text-emerald-400">{camp.payoutProvider?.toUpperCase()}: {camp.payoutPhone}</strong></span>
                                <span>•</span>
                                <span>Donors: <strong>{camp.donorsCount}</strong></span>
                                <span>•</span>
                                <span>Velocity: <strong className="text-amber-300">{act.velocityLabel}</strong></span>
                              </div>
                            </div>
                          </div>

                          {/* Progress & Financial Bar */}
                          <div className="w-full md:w-56 shrink-0 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-extrabold text-emerald-400">
                                UGX {(camp.raisedAmount / 1000000).toFixed(2)}M
                              </span>
                              <span className="text-slate-400 text-[11px]">
                                / {(camp.targetAmount / 1000000).toFixed(1)}M ({percent}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${camp.featured ? 'bg-gradient-to-r from-amber-500 to-emerald-400' : 'bg-emerald-500'}`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>

                          {/* Action Controls (Feature, Edit, Delete, View) */}
                          <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-700/60">
                            
                            {/* Toggle Featured Button */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleFeatured(camp, e)}
                              className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                camp.featured
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-amber-400 hover:border-amber-500/30'
                              }`}
                              title={camp.featured ? 'Remove from Featured on Top' : 'Feature on Top of Home Page'}
                            >
                              <Star className={`w-3.5 h-3.5 ${camp.featured ? 'fill-current' : ''}`} />
                              <span className="hidden sm:inline">{camp.featured ? 'Featured' : 'Feature'}</span>
                            </button>

                            {/* View Public Campaign */}
                            <button
                              type="button"
                              onClick={() => {
                                onViewCampaign(camp);
                                onClose();
                              }}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                              title="View Public Page"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Campaign */}
                            <button
                              type="button"
                              onClick={() => onSelectCampaignToEdit(camp)}
                              className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                              title="Edit Fundraiser Details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            {/* Delete Campaign */}
                            <button
                              type="button"
                              onClick={(e) => handlePromptDelete(camp, e)}
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 transition-all cursor-pointer"
                              title="Delete Fundraiser"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                          </div>

                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Note */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div>
            Logged in as: <strong className="text-slate-200">{admin.email}</strong> • Role: <strong className="text-emerald-400">Super Administrator</strong>
          </div>
          <div>
            Kusanya Platform Uganda • Secure Ledger Audit
          </div>
        </div>

      </div>

      {/* Confirmation Delete Dialog */}
      {deleteConfirmOpen && campaignToDelete && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">
                Delete Fundraiser?
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Are you sure you want to delete <strong className="text-white">"{campaignToDelete.title}"</strong>? This will permanently remove it from Kusanya platform and the public donation feeds.
              </p>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-400">
              Raised to date: <strong className="text-emerald-400">UGX {campaignToDelete.raisedAmount.toLocaleString()}</strong> ({campaignToDelete.donorsCount} donors)
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setCampaignToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingCampaignId !== null}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {deletingCampaignId ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
