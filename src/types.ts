export type MoMoProvider = 'mtn' | 'airtel' | 'card';

export interface CampaignUpdate {
  id: string;
  date: string;
  title: string;
  content: string;
  author: string;
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
  currency: string; // 'UGX'
  story: string;
  image: string;
  beneficiaryName: string;
  beneficiaryRelationship: string;
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
  reference: string;
  campaignId: string;
  donorName: string;
  donorPhone: string;
  amount: number;
  provider: MoMoProvider;
  isAnonymous: boolean;
  message?: string;
  status: 'pending' | 'ussd_sent' | 'processing' | 'completed' | 'failed';
  ussdPrompt: string;
  networkRef: string;
  createdAt: string;
  completedAt?: string;
  receiptNumber: string;
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
