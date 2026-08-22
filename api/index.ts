import express, { Request, Response } from 'express';
import { Campaign, DonorCheer, MoMoProvider, PaymentTransaction, PayoutRequest } from '../src/types';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initial Seed Data for Serverless function
const initialCampaigns: Campaign[] = [
  {
    id: 'ug-camp-001',
    title: 'Mulago Heart Institute Emergency Surgery for Baby Trevor',
    slug: 'baby-trevor-heart-surgery',
    tagline: 'Urgent pediatric ventricular septal defect surgery at Uganda Heart Institute, Mulago Hospital.',
    category: 'medical',
    region: 'Central',
    district: 'Kampala',
    targetAmount: 25000000,
    raisedAmount: 18450000,
    currency: 'UGX',
    story: `Baby Trevor Sserwadda is a 14-month-old energetic boy from Kawempe, Kampala. Two months ago, he was diagnosed with a large Ventricular Septal Defect (a hole in his heart) at Mulago National Referral Hospital's Uganda Heart Institute (UHI).`,
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80'
    ],
    beneficiaryName: 'Trevor Sserwadda',
    beneficiaryRelationship: 'Son of organizer',
    beneficiaryPhone: '+256 772 458912',
    beneficiaryEmail: '',
    organizerName: 'Sarah Nalubega',
    organizerPhone: '+256 772 458912',
    organizerKycVerified: true,
    payoutProvider: 'mtn',
    payoutPhone: '+256 772 458912',
    donorsCount: 142,
    featured: true,
    createdAt: '2026-08-01T08:00:00Z',
    daysRemaining: 14,
    status: 'active',
    updates: []
  }
];

let campaigns = [...initialCampaigns];
let donations: DonorCheer[] = [];
let transactions: Map<string, PaymentTransaction> = new Map();

app.get('/api/campaigns', (req: Request, res: Response) => {
  res.json({ success: true, total: campaigns.length, campaigns });
});

app.post('/api/campaigns', (req: Request, res: Response) => {
  const newCamp = {
    ...req.body,
    id: `ug-camp-${Date.now().toString().slice(-6)}`,
    raisedAmount: 0,
    donorsCount: 0,
    createdAt: new Date().toISOString(),
    status: 'active',
    updates: []
  };
  campaigns.unshift(newCamp);
  res.json({ success: true, campaign: newCamp });
});

app.get('/api/donations/recent', (req: Request, res: Response) => {
  res.json({
    success: true,
    donations: donations.slice(0, 10),
    stats: {
      totalRaisedUGX: campaigns.reduce((a, b) => a + b.raisedAmount, 0),
      totalDonors: campaigns.reduce((a, b) => a + b.donorsCount, 0),
      activeCampaigns: campaigns.length,
      districtsCovered: 14
    }
  });
});

export default app;
