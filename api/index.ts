import express, { Request, Response } from 'express';
import { Campaign, CampaignUpdate, DonorCheer, MoMoProvider, PaymentTransaction, PayoutRequest } from '../src/types';
import { DEFAULT_SEED_CAMPAIGNS, DEFAULT_SEED_DONATIONS } from '../src/services/api';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Memory caches for Serverless execution
let campaigns: Campaign[] = [...DEFAULT_SEED_CAMPAIGNS];
let donations: DonorCheer[] = [...DEFAULT_SEED_DONATIONS];
let payouts: PayoutRequest[] = [];
let transactions: Map<string, PaymentTransaction> = new Map();

// 1. Get campaigns with filtering
app.get('/api/campaigns', (req: Request, res: Response) => {
  const { category, region, search } = req.query;
  let result = [...campaigns];

  if (category && category !== 'all') {
    result = result.filter(c => c.category === category);
  }

  if (region && region !== 'all') {
    result = result.filter(c => c.region === region);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    result = result.filter(
      c =>
        c.title.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q) ||
        c.organizerName.toLowerCase().includes(q) ||
        c.story.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    total: result.length,
    campaigns: result
  });
});

// 2. Get single campaign
app.get('/api/campaigns/:id', (req: Request, res: Response) => {
  const campaign = campaigns.find(c => c.id === req.params.id || c.slug === req.params.id);
  if (!campaign) {
    return res.status(404).json({ success: false, error: 'Campaign not found' });
  }

  const campaignDonations = donations
    .filter(d => d.campaignId === campaign.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json({
    success: true,
    campaign,
    donations: campaignDonations
  });
});

// 3. Create campaign
app.post('/api/campaigns', (req: Request, res: Response) => {
  const {
    title,
    tagline,
    category,
    region,
    district,
    targetAmount,
    story,
    image,
    images,
    beneficiaryName,
    beneficiaryRelationship,
    beneficiaryPhone,
    beneficiaryEmail,
    organizerName,
    organizerPhone,
    payoutProvider,
    payoutPhone
  } = req.body;

  if (!title || !targetAmount || !story || !organizerPhone) {
    return res.status(400).json({ success: false, error: 'Missing required campaign details' });
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

  const primaryImage = image || (images && images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb9?auto=format&fit=crop&w=1200&q=80');
  const allImages = Array.isArray(images) && images.length > 0 ? images : [primaryImage];

  const newCampaign: Campaign = {
    id: `ug-camp-${Date.now().toString().slice(-6)}`,
    title,
    slug,
    tagline: tagline || title.slice(0, 80),
    category: category || 'community',
    region: region || 'Central',
    district: district || 'Kampala',
    targetAmount: Number(targetAmount),
    raisedAmount: 0,
    currency: 'UGX',
    story,
    image: primaryImage,
    images: allImages,
    beneficiaryName: beneficiaryName || organizerName,
    beneficiaryRelationship: beneficiaryRelationship || 'Self',
    beneficiaryPhone: beneficiaryPhone || organizerPhone,
    beneficiaryEmail: beneficiaryEmail || '',
    organizerName,
    organizerPhone,
    organizerKycVerified: true,
    payoutProvider: payoutProvider === 'airtel' ? 'airtel' : 'mtn',
    payoutPhone: payoutPhone || organizerPhone,
    donorsCount: 0,
    featured: false,
    createdAt: new Date().toISOString(),
    daysRemaining: 30,
    status: 'active',
    updates: []
  };

  campaigns.unshift(newCampaign);

  res.status(201).json({
    success: true,
    campaign: newCampaign
  });
});

// 4. Post campaign update (Allows fundraiser organizers to publish updates accessible to all)
app.post('/api/campaigns/:id/updates', (req: Request, res: Response) => {
  const { title, content, author, imageUrl, category } = req.body;
  const campaign = campaigns.find(c => c.id === req.params.id);
  if (!campaign) {
    return res.status(404).json({ success: false, error: 'Campaign not found' });
  }

  const update: CampaignUpdate = {
    id: `upd-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    title,
    content,
    author: author || campaign.organizerName,
    imageUrl: imageUrl || undefined,
    category: category || 'update',
    likesCount: 0,
    pinned: false
  };

  campaign.updates = [update, ...(campaign.updates || [])];
  res.json({ success: true, update });
});

// 5. Like an update
app.post('/api/campaigns/:id/updates/:updateId/like', (req: Request, res: Response) => {
  const campaign = campaigns.find(c => c.id === req.params.id);
  if (!campaign) {
    return res.status(404).json({ success: false, error: 'Campaign not found' });
  }
  const upd = campaign.updates.find(u => u.id === req.params.updateId);
  if (!upd) {
    return res.status(404).json({ success: false, error: 'Update not found' });
  }
  upd.likesCount = (upd.likesCount || 0) + 1;
  res.json({ success: true, likesCount: upd.likesCount });
});

// 6. Delete an update
app.delete('/api/campaigns/:id/updates/:updateId', (req: Request, res: Response) => {
  const campaign = campaigns.find(c => c.id === req.params.id);
  if (!campaign) {
    return res.status(404).json({ success: false, error: 'Campaign not found' });
  }
  campaign.updates = campaign.updates.filter(u => u.id !== req.params.updateId);
  res.json({ success: true, message: 'Update deleted' });
});

// 7. Donation Initiation
app.post('/api/donations/initiate', (req: Request, res: Response) => {
  const { 
    campaignId, 
    donorName, 
    donorPhone, 
    amount, 
    provider, 
    isAnonymous, 
    message,
    cardDetails,
    paypalEmail,
    donorEmail
  } = req.body;

  const campaign = campaigns.find(c => c.id === campaignId);
  if (!campaign) {
    return res.status(404).json({ success: false, error: 'Campaign not found' });
  }

  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount) || parsedAmount < 500) {
    return res.status(400).json({ success: false, error: 'Minimum donation is UGX 500' });
  }

  const platformFee = Math.round(parsedAmount * 0.05);
  const netBeneficiaryAmount = parsedAmount - platformFee;
  let resolvedProvider: MoMoProvider = provider || 'mtn';

  let prefix = 'MOMO-UG';
  if (resolvedProvider === 'airtel') prefix = 'AM-UG';
  else if (resolvedProvider === 'visa' || resolvedProvider === 'card') prefix = 'VISA-UG';
  else if (resolvedProvider === 'paypal') prefix = 'PP-INT';

  const refNumber = Math.floor(100000 + Math.random() * 900000);
  const reference = `${prefix}-${Date.now().toString().slice(-4)}${refNumber}`;
  const networkRef = `NW-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const receiptNumber = `RCP-UGX-${Math.floor(1000000 + Math.random() * 9000000)}`;

  let ussdPrompt = '';
  let promptText = '';
  let ussdManualCode = '';

  if (resolvedProvider === 'airtel') {
    ussdPrompt = `*185*9# (Authorize UGX ${parsedAmount.toLocaleString()} to Kusanya ref ${reference})`;
    promptText = `Enter Airtel Money PIN on your phone to authorize UGX ${parsedAmount.toLocaleString()}.`;
    ussdManualCode = `*185#`;
  } else if (resolvedProvider === 'mtn') {
    ussdPrompt = `*165*3# (MTN MoMo: Pay UGX ${parsedAmount.toLocaleString()})`;
    promptText = `Enter MTN MoMo PIN on your phone to authorize UGX ${parsedAmount.toLocaleString()}.`;
    ussdManualCode = `*165#`;
  } else if (resolvedProvider === 'visa' || resolvedProvider === 'card') {
    ussdPrompt = `3DS-VERIFIED: Visa Secure Gateway`;
    promptText = `Visa 3D-Secure initialized. Check OTP from issuing bank.`;
    ussdManualCode = `VISA 3D-SECURE`;
  } else if (resolvedProvider === 'paypal') {
    ussdPrompt = `PAYPAL-CHECKOUT: PayPal Express order authorized`;
    promptText = `PayPal secure checkout ready.`;
    ussdManualCode = `PAYPAL 1-CLICK`;
  }

  const tx: PaymentTransaction = {
    id: reference,
    reference,
    transactionRef: reference,
    campaignId,
    donorName: donorName || (isAnonymous ? 'Anonymous Well-Wisher' : 'Kind Giver'),
    donorPhone: donorPhone || '',
    phoneNumber: donorPhone || '',
    amount: parsedAmount,
    platformFee,
    feePercentage: 5,
    netBeneficiaryAmount,
    provider: resolvedProvider,
    isAnonymous: !!isAnonymous,
    message: message || '',
    status: (resolvedProvider === 'visa' || resolvedProvider === 'paypal' || resolvedProvider === 'card') ? 'processing' : 'ussd_sent',
    ussdPrompt,
    ussdPromptText: promptText,
    networkRef,
    networkTransactionId: networkRef,
    createdAt: new Date().toISOString(),
    receiptNumber
  };

  transactions.set(reference, tx);

  res.json({
    success: true,
    transaction: tx,
    instructions: {
      provider: resolvedProvider,
      phone: donorPhone,
      amount: parsedAmount,
      platformFee,
      netBeneficiaryAmount,
      promptText,
      ussdManualCode,
      reference
    }
  });
});

// 8. Payment PIN Confirm
app.post('/api/donations/simulate-pin-confirm', (req: Request, res: Response) => {
  const { reference, transactionId } = req.body;
  const refKey = reference || transactionId;
  const tx = transactions.get(refKey);

  if (!tx) {
    return res.status(404).json({ success: false, error: 'Transaction reference not found' });
  }

  if (tx.status === 'completed') {
    const campaign = campaigns.find(c => c.id === tx.campaignId);
    return res.json({ 
      success: true, 
      transaction: tx, 
      newRaisedAmount: campaign ? campaign.raisedAmount : 0 
    });
  }

  tx.status = 'completed';
  tx.completedAt = new Date().toISOString();

  const campaign = campaigns.find(c => c.id === tx.campaignId);
  if (campaign) {
    campaign.raisedAmount += tx.amount;
    campaign.donorsCount += 1;
  }

  const newDonation: DonorCheer = {
    id: `don-${Date.now()}`,
    campaignId: tx.campaignId,
    donorName: tx.donorName,
    isAnonymous: tx.isAnonymous,
    amount: tx.amount,
    provider: tx.provider,
    message: tx.message,
    timestamp: new Date().toISOString(),
    transactionRef: tx.reference,
    verified: true
  };

  donations.unshift(newDonation);

  res.json({
    success: true,
    transaction: tx,
    newRaisedAmount: campaign ? campaign.raisedAmount : 0,
    receipt: {
      receiptNumber: tx.receiptNumber,
      amount: tx.amount,
      campaignTitle: campaign ? campaign.title : 'Uganda Fundraiser',
      date: tx.completedAt,
      provider: tx.provider
    }
  });
});

// 9. Status & Live Donations
app.get('/api/donations/status/:reference', (req: Request, res: Response) => {
  const tx = transactions.get(req.params.reference);
  if (!tx) return res.status(404).json({ success: false, error: 'Transaction not found' });
  res.json({ success: true, transaction: tx });
});

app.get('/api/donations/recent', (req: Request, res: Response) => {
  const recent = donations.slice(0, 15).map(d => {
    const campaign = campaigns.find(c => c.id === d.campaignId);
    return {
      ...d,
      campaignTitle: campaign ? campaign.title : 'Uganda Fundraiser',
      campaignDistrict: campaign ? campaign.district : 'Uganda'
    };
  });

  res.json({
    success: true,
    donations: recent,
    stats: {
      totalRaisedUGX: campaigns.reduce((a, b) => a + (b.raisedAmount || 0), 0),
      totalDonors: campaigns.reduce((a, b) => a + (b.donorsCount || 0), 0),
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      districtsCovered: Array.from(new Set(campaigns.map(c => c.district))).length
    }
  });
});

// 10. Organizer Payout Request
app.post('/api/payouts/request', (req: Request, res: Response) => {
  const { campaignId, amount, provider, phoneNumber, recipientName } = req.body;
  const campaign = campaigns.find(c => c.id === campaignId);

  if (!campaign) {
    return res.status(404).json({ success: false, error: 'Campaign not found' });
  }

  const withdrawAmount = Number(amount);
  if (withdrawAmount > campaign.raisedAmount) {
    return res.status(400).json({ success: false, error: 'Requested amount exceeds available balance' });
  }

  const payout: PayoutRequest = {
    id: `pay-${Date.now()}`,
    campaignId,
    campaignTitle: campaign.title,
    amount: withdrawAmount,
    provider: provider || campaign.payoutProvider,
    phoneNumber: phoneNumber || campaign.payoutPhone,
    recipientName: recipientName || campaign.organizerName,
    requestedAt: new Date().toISOString(),
    status: 'disbursed',
    disbursementRef: `B2C-UGX-${Math.floor(100000 + Math.random() * 900000)}`
  };

  payouts.unshift(payout);
  res.json({ success: true, payout });
});

// 11. Admin Login & Analytics
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if ((cleanEmail.endsWith('@kusanya.com') || ['bright@kusanya.com', 'stephen@kusanya.com', 'billy@kusanya.com'].includes(cleanEmail)) && cleanPass === '1234') {
    const namePart = cleanEmail.split('@')[0];
    return res.json({
      success: true,
      admin: {
        email: cleanEmail,
        name: `${namePart.charAt(0).toUpperCase() + namePart.slice(1)} (Kusanya Admin)`,
        role: 'superadmin',
        token: `kusanya-token-${Date.now()}`
      }
    });
  }
  res.status(401).json({ success: false, error: 'Invalid credentials. Use bright@kusanya.com / 1234' });
});

app.get('/api/admin/analytics', (req: Request, res: Response) => {
  const totalRaisedUGX = campaigns.reduce((sum, c) => sum + (c.raisedAmount || 0), 0);
  const totalTargetUGX = campaigns.reduce((sum, c) => sum + (c.targetAmount || 0), 0);
  const totalDonors = campaigns.reduce((sum, c) => sum + (c.donorsCount || 0), 0);
  const totalPlatformFeesUGX = Math.round(totalRaisedUGX * 0.05);
  const totalBeneficiaryFundsUGX = totalRaisedUGX - totalPlatformFeesUGX;

  res.json({
    success: true,
    analytics: {
      totalRaisedUGX,
      totalTargetUGX,
      totalDonors,
      totalPlatformFeesUGX,
      totalBeneficiaryFundsUGX,
      activeCampaignsCount: campaigns.filter(c => c.status === 'active').length,
      kycVerifiedCount: campaigns.filter(c => c.organizerKycVerified).length,
      districtsCoveredCount: Array.from(new Set(campaigns.map(c => c.district))).length
    }
  });
});

// 12. Campaign update and delete
app.put('/api/campaigns/:id', (req: Request, res: Response) => {
  const idx = campaigns.findIndex(c => c.id === req.params.id || c.slug === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Campaign not found' });
  campaigns[idx] = { ...campaigns[idx], ...req.body };
  res.json({ success: true, campaign: campaigns[idx] });
});

app.delete('/api/campaigns/:id', (req: Request, res: Response) => {
  const idx = campaigns.findIndex(c => c.id === req.params.id || c.slug === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Campaign not found' });
  const [deleted] = campaigns.splice(idx, 1);
  res.json({ success: true, message: 'Deleted', id: deleted.id });
});

export default app;
