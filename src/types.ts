export type MoMoProvider = 'mtn' | 'airtel' | 'visa' | 'paypal' | 'card';

export interface CampaignUpdate {
  id: string;
  date: string;
  title: string;
  content: string;
  author: string;
  imageUrl?: string;
  pinned?: boolean;
  category?: 'update' | 'milestone' | 'receipt' | 'story' | 'gratitude';
  likesCount?: number;
}

export interface DonorCheer {
  id: string;
  campaignId: string;
  donorName: string;
  isAnonymous: boolean;
  amount: number;
  provider: MoMoProvider;
  message?: string;
  timestamp: string;
  transactionRef: string;
  verified: boolean;
  campaignTitle?: string;
  campaignDistrict?: string;
  campaignTarget?: number;
  campaignRaised?: number;
}

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  category: 'medical' | 'education' | 'emergency' | 'community' | 'business' | 'faith' | 'sacco' | 'memorial';
  region: string;
  district: string;
  targetAmount: number; // in UGX
  raisedAmount: number; // in UGX
  amountDonatedMinusTarget?: number; // Database calculation: raisedAmount - targetAmount
  remainingAmount?: number; // Database calculation: Math.max(0, targetAmount - raisedAmount)
  currency: string; // 'UGX'
  story: string;
  image: string;
  images?: string[]; // Multiple pictures showing the cause
  beneficiaryName: string;
  beneficiaryRelationship: string;
  beneficiaryPhone?: string;
  beneficiaryEmail?: string;
  organizerName: string;
  organizerPhone: string;
  organizerKycVerified: boolean;
  payoutProvider: 'mtn' | 'airtel';
  payoutPhone: string;
  donorsCount: number;
  featured: boolean;
  createdAt: string;
  daysRemaining: number;
  status: 'active' | 'completed' | 'paused';
  updates: CampaignUpdate[];
  // 1-Year Activity & Spotlight Fields
  activeDurationMonths?: number; // e.g. 12 months (1 year sustained)
  activeDurationDays?: number; // e.g. 365 days
  lastDonationAt?: string;
  recentDonations7d?: number;
  recentDonations30d?: number;
  activityScore?: number; // 0 - 100
  spotlightEligible1Year?: boolean; // Meets 1-year sustained activity criteria
  spotlightBadge?: string; // e.g. "🔥 1-Year Active Spotlight"
  spotlightReason?: string;
}

export interface PaymentInitiationRequest {
  campaignId: string;
  donorName: string;
  donorPhone: string;
  amount: number;
  provider: MoMoProvider;
  isAnonymous: boolean;
  message?: string;
}

export interface PaymentTransaction {
  id?: string;
  reference: string;
  transactionRef?: string;
  campaignId: string;
  donorName: string;
  donorPhone: string;
  phoneNumber?: string;
  amount: number;
  platformFee: number; // 0 (Zero deductions)
  feePercentage: number; // 0
  netBeneficiaryAmount: number; // 100% to cause (zero deductions)
  amountDonatedMinusTarget?: number; // Updated raised amount - targetAmount
  remainingTargetBalance?: number; // Remaining target balance after donation
  provider: MoMoProvider;
  isAnonymous: boolean;
  message?: string;
  status: 'pending' | 'ussd_sent' | 'processing' | 'completed' | 'failed';
  ussdPrompt: string;
  ussdPromptText?: string;
  networkRef: string;
  networkTransactionId?: string;
  createdAt: string;
  completedAt?: string;
  receiptNumber: string;
  campaignTitle?: string;
  campaignTarget?: number;
  campaignRaised?: number;
}

export interface PayoutRequest {
  id: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  provider: 'mtn' | 'airtel';
  phoneNumber: string;
  recipientName: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'disbursed';
  disbursementRef?: string;
}

export interface AdminUser {
  email: string;
  name: string;
  role: 'superadmin' | 'finance_admin' | 'moderator';
  token?: string;
}

export interface AdminAnalytics {
  totalRaisedUGX: number;
  totalTargetUGX: number;
  totalAmountMinusTargetUGX: number; // Database calculation: totalRaisedUGX - totalTargetUGX
  totalRemainingUGX: number; // Database calculation: Math.max(0, totalTargetUGX - totalRaisedUGX)
  totalDonors: number;
  totalPlatformFeesUGX: number; // 0 (Zero deductions)
  totalBeneficiaryFundsUGX: number; // 100% of donations
  activeCampaignsCount: number;
  featuredCampaignsCount: number;
  completedCampaignsCount: number;
  districtsCoveredCount: number;
  categoryStats: Record<string, { count: number; raisedUGX: number }>;
  regionStats: Record<string, { count: number; raisedUGX: number }>;
  providerStats: Record<string, { name: string; totalUGX: number; count: number }>;
  payoutsCount: number;
  totalDisbursedUGX: number;
  recentTransactions?: PaymentTransaction[];
  recentPayouts?: PayoutRequest[];
}

