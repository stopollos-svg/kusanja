import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { Campaign, DonorCheer, PaymentTransaction, PayoutRequest } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory Database with persistent seed data
const initialCampaigns: Campaign[] = [
  {
    id: 'ug-camp-001',
    title: 'Mulago Heart Institute Emergency Surgery for Baby Trevor',
    slug: 'baby-trevor-heart-surgery',
    tagline: 'Urgent pediatric ventricular septal defect surgery at Uganda Heart Institute, Mulago Hospital.',
    category: 'medical',
    region: 'Central',
    district: 'Kampala',
    targetAmount: 25000000, // 25M UGX
    raisedAmount: 18450000, // 18.45M UGX
    currency: 'UGX',
    story: `Baby Trevor Sserwadda is a 14-month-old energetic boy from Kawempe, Kampala. Two months ago, he was diagnosed with a large Ventricular Septal Defect (a hole in his heart) at Mulago National Referral Hospital's Uganda Heart Institute (UHI).

His mother, Nalubega Sarah, is a single mother working as a vegetable vendor in Kasubi Market. Trevor requires urgent corrective open-heart surgery scheduled for next month to prevent irreversible pulmonary hypertension. 

The total cost of surgical consumables, pediatric ICU care, and post-operative medications is UGX 25,000,000. Through the kindness of neighbors and church members, we have started this fund to give Baby Trevor a healthy chance at life.

Every single 5,000, 10,000, or 50,000 UGX sent via MTN MoMo or Airtel Money directly pays the hospital admission and surgical consumable invoice. May God bless your generous giving (Webale nnyo!).`,
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    beneficiaryName: 'Trevor Sserwadda',
    beneficiaryRelationship: 'Son of organizer',
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
    updates: [
      {
        id: 'upd-1',
        date: '2026-08-12',
        title: 'Pre-surgery consultation completed at UHI',
        content: 'Dr. Mwambu reviewed Trevor today. His vitals are stable, and preliminary laboratory tests have been processed. We are only UGX 6.5M away from the surgical booking threshold.',
        author: 'Sarah Nalubega'
      }
    ]
  },
  {
    id: 'ug-camp-002',
    title: 'Solar Water Pump & Purifier for Gulu Rural Primary School',
    slug: 'gulu-school-solar-water-pump',
    tagline: 'Providing clean, safe drinking water for 850 pupils in Paicho Sub-county, Gulu District.',
    category: 'community',
    region: 'Northern',
    district: 'Gulu',
    targetAmount: 14500000, // 14.5M UGX
    raisedAmount: 11200000, // 11.2M UGX
    currency: 'UGX',
    story: `Paicho Community Primary School in rural Gulu serves over 850 primary school pupils and 18 teachers. Currently, young girls and boys must walk 3 kilometers twice a day to fetch water from an unprotected stream, resulting in frequent outbreaks of typhoid and lost classroom hours.

We are raising funds to install a heavy-duty solar-powered borehole pump, 10,000-liter storage tank, and UV filtration kiosk directly on the school compound. This system will serve both the school and over 1,200 surrounding community members in Paicho.

Local engineers from Gulu University have completed the site survey and volunteered to oversee installation free of labor charges. We only need funds for the solar panels, submersible pump, steel tank stand, and PVC piping.`,
    image: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80',
    beneficiaryName: 'Paicho Primary School Pupils',
    beneficiaryRelationship: 'Headteacher & PTA Board',
    organizerName: 'Okello Denis',
    organizerPhone: '+256 754 119834',
    organizerKycVerified: true,
    payoutProvider: 'airtel',
    payoutPhone: '+256 754 119834',
    donorsCount: 89,
    featured: true,
    createdAt: '2026-08-04T10:30:00Z',
    daysRemaining: 21,
    status: 'active',
    updates: []
  },
  {
    id: 'ug-camp-003',
    title: 'Makerere Final Year Tuition Aid for Grace Atim (Civil Engineering)',
    slug: 'grace-atim-makerere-tuition',
    tagline: 'Help a first-generation female engineer clear final semester arrears and sit graduation exams.',
    category: 'education',
    region: 'Central',
    district: 'Kampala',
    targetAmount: 3800000, // 3.8M UGX
    raisedAmount: 3150000, // 3.15M UGX
    currency: 'UGX',
    story: `My name is Grace Atim, a final year student pursuing a Bachelor of Science in Civil Engineering at Makerere University (College of Engineering, Design, Art and Technology - CEDAT).

I come from a humble farming background in Lira District. Throughout my 4 years, I have maintained a First Class CGPA of 4.42 while tutoring high school mathematics on weekends. Unfortunately, my sponsor passed away earlier this year, leaving an outstanding tuition balance of UGX 3,800,000 required by the Academic Registrar to receive an exam permit.

Final examinations commence in three weeks. Graduating will enable me to start my engineering internship and support my four younger siblings' education. Apwoyo matek (Thank you very much) for standing with me!`,
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    beneficiaryName: 'Grace Atim',
    beneficiaryRelationship: 'Self (Student)',
    organizerName: 'Grace Atim',
    organizerPhone: '+256 779 883201',
    organizerKycVerified: true,
    payoutProvider: 'mtn',
    payoutPhone: '+256 779 883201',
    donorsCount: 63,
    featured: false,
    createdAt: '2026-08-08T14:15:00Z',
    daysRemaining: 9,
    status: 'active',
    updates: []
  },
  {
    id: 'ug-camp-004',
    title: 'Emergency Flood Relief for 45 Displaced Budondo Families (Jinja)',
    slug: 'jinja-budondo-flood-relief',
    tagline: 'Providing dry food rations, tarpaulins, iron sheets, and malaria mosquito nets in Jinja District.',
    category: 'emergency',
    region: 'Eastern',
    district: 'Jinja',
    targetAmount: 18000000, // 18M UGX
    raisedAmount: 9600000, // 9.6M UGX
    currency: 'UGX',
    story: `Torrential seasonal rains in Busoga sub-region led to severe flash flooding in Budondo Sub-county, Jinja District. 45 homesteads have had their mud-brick houses collapsed, food stores washed away, and crops destroyed.

Families are currently sheltering in a local church hall with limited access to clean water, food, and warm blankets. The Jinja Red Cross branch and local council leaders have compiled an emergency relief priority list:
1. Posho (Maize flour) and beans (UGX 6,000,000)
2. Treated Long-Lasting Mosquito Nets for children and mothers (UGX 3,500,000)
3. Iron sheets and timber for temporary shelter reconstruction (UGX 8,500,000)

All mobile money funds raised here are disbursed directly under the supervision of LC3 Chairperson and Jinja Disaster Response Committee.`,
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80',
    beneficiaryName: 'Budondo Flood Victims',
    beneficiaryRelationship: 'Community Action Committee',
    organizerName: 'Mugerwa Emmanuel (LC3 Secretary)',
    organizerPhone: '+256 701 554320',
    organizerKycVerified: true,
    payoutProvider: 'airtel',
    payoutPhone: '+256 701 554320',
    donorsCount: 76,
    featured: true,
    createdAt: '2026-08-10T12:00:00Z',
    daysRemaining: 18,
    status: 'active',
    updates: []
  },
  {
    id: 'ug-camp-005',
    title: 'Mbale Youth Arabica Coffee Pulping Machine (Mount Elgon)',
    slug: 'mbale-coffee-pulping-machine',
    tagline: 'Equipping 30 young farmers in Wanale with eco-pulper machinery to double their coffee bean earnings.',
    category: 'business',
    region: 'Eastern',
    district: 'Mbale',
    targetAmount: 8500000, // 8.5M UGX
    raisedAmount: 5100000, // 5.1M UGX
    currency: 'UGX',
    story: `On the fertile slopes of Mount Elgon in Mbale, 30 young smallholder farmers have united under the Wanale Arabica Youth Cooperative. Currently, farmers are forced to sell freshly picked wet coffee cherries to middlemen at a meager UGX 3,000/kg because they lack a mechanized eco-pulping machine.

With our own motorized eco-pulper and drying beds, our youth cooperative can process Grade-AA specialty parchment coffee and sell directly to roasters for over UGX 12,000/kg, immediately tripling household incomes for over 150 family dependents.

We have already contributed 30% from our collective savings. This campaign will bridge the remaining cost to purchase the eco-pulper from a verified supplier in Kampala.`,
    image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=1200&q=80',
    beneficiaryName: 'Wanale Youth Coffee Cooperative',
    beneficiaryRelationship: 'Cooperative Chairperson',
    organizerName: 'Wepukhulu Isaac',
    organizerPhone: '+256 788 903211',
    organizerKycVerified: true,
    payoutProvider: 'mtn',
    payoutPhone: '+256 788 903211',
    donorsCount: 41,
    featured: false,
    createdAt: '2026-08-05T09:00:00Z',
    daysRemaining: 25,
    status: 'active',
    updates: []
  },
  {
    id: 'ug-camp-006',
    title: 'Mbarara Rural Maternity Transit Vehicle (Ambulance)',
    slug: 'mbarara-maternity-transit-ambulance',
    tagline: 'Procuring a customized 4WD transport van for emergency maternal care in Kashari North.',
    category: 'medical',
    region: 'Western',
    district: 'Mbarara',
    targetAmount: 35000000, // 35M UGX
    raisedAmount: 22800000, // 22.8M UGX
    currency: 'UGX',
    story: `Expectant mothers in hilly rural Kashari North, Mbarara District face severe transport bottlenecks when complications arise during labor. The nearest hospital (Mbarara Regional Referral Hospital) is 45km away over rugged terrain.

Boda-boda transport during labor carries high risks of maternal and neonatal mortality. St. Luke Health Centre is fundraising to acquire a ruggedized, reconditioned 4WD Toyota HiAce equipped with an oxygen cylinder, stretcher, and basic resuscitation kit.

This vehicle will be dedicated 24/7 to emergency obstetric referrals across 6 parish clinics, serving over 28,000 residents.`,
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
    beneficiaryName: 'Expectant Mothers of Kashari North',
    beneficiaryRelationship: 'Clinic Medical Director',
    organizerName: 'Dr. Tumusiime Brian',
    organizerPhone: '+256 774 309188',
    organizerKycVerified: true,
    payoutProvider: 'mtn',
    payoutPhone: '+256 774 309188',
    donorsCount: 118,
    featured: true,
    createdAt: '2026-08-02T11:00:00Z',
    daysRemaining: 12,
    status: 'active',
    updates: []
  },
  {
    id: 'ug-camp-007',
    title: 'Namirembe Cathedral Youth & Community Ministry Center Renovation',
    slug: 'namirembe-cathedral-youth-ministry',
    tagline: 'Refurbishing the 120-year historical youth hall, sound system, and community digital skills room.',
    category: 'faith',
    region: 'Central',
    district: 'Kampala',
    targetAmount: 45000000, // 45M UGX
    raisedAmount: 29800000, // 29.8M UGX
    currency: 'UGX',
    story: `St. Paul's Cathedral Namirembe is the oldest cathedral in Uganda and the seat of the Anglican Church of Uganda (Namirembe Diocese). The historic youth & outreach pavilion serves over 600 choir members, university youth fellowships, Sunday school teachers, and neighborhood community counseling programs every week.
    
Due to roof water leakages and aging electrical wiring, the youth ministry hall requires urgent structural restoration:
1. Complete timber truss replacement and high-durability clay tile roofing (UGX 22,000,000)
2. Professional acoustic treatment, digital audio mixer, and worship instruments (UGX 15,000,000)
3. Free community youth ICT lab with 12 workstations for vocational digital literacy (UGX 8,000,000)

We invite all faithful congregants, alumni, diaspora Christians, and well-wishers to contribute tithes, offerings, and pledges via MTN MoMo and Airtel Money directly on Kusanya.org. Mukama Akuwe Omukisa (May the Lord bless you abundantly!).`,
    image: 'https://images.unsplash.com/photo-1548625361-195972844e13?auto=format&fit=crop&w=1200&q=80',
    beneficiaryName: 'Namirembe Cathedral Youth Ministry',
    beneficiaryRelationship: 'Diocese Youth Pastor & Guild Committee',
    organizerName: 'Rev. Canon Peter Musisi',
    organizerPhone: '+256 772 819034',
    organizerKycVerified: true,
    payoutProvider: 'mtn',
    payoutPhone: '+256 772 819034',
    donorsCount: 165,
    featured: true,
    createdAt: '2026-08-03T07:00:00Z',
    daysRemaining: 18,
    status: 'active',
    updates: [
      {
        id: 'upd-church-1',
        date: '2026-08-14',
        title: 'Roofing contractor mobilized on site',
        content: 'Engineering inspections concluded and the first consignment of timber and treated roofing shingles arrived at Namirembe hill. Thank you to all donors who sent MoMo pledges!',
        author: 'Rev. Canon Peter Musisi'
      }
    ]
  },
  {
    id: 'ug-camp-008',
    title: 'Kasubi Market Women Traders SACCO Emergency Revolving Loan Pool',
    slug: 'kasubi-women-traders-sacco-fund',
    tagline: 'Capitalizing a zero-interest micro-credit pool for 180 female market vendors recovering from wholesale price spikes.',
    category: 'sacco',
    region: 'Central',
    district: 'Kampala',
    targetAmount: 30000000, // 30M UGX
    raisedAmount: 21500000, // 21.5M UGX
    currency: 'UGX',
    story: `The Kasubi Market Women Twegatte SACCO brings together 180 hardworking female fruit, vegetable, cereal, and poultry vendors in Lubaga Division, Kampala. Many members are sole breadwinners supporting extended families and paying school fees for over 450 school-going children.

Informal money lenders and predatory quick-loan apps charge extortionate interest rates of 20% to 30% per month, trapping market mamas in cycles of debt. Our SACCO is raising collective equity capital to build an independent, member-owned Revolving Liquidity Pool.

How the SACCO Fund Operates:
- Members access affordable working capital loans (UGX 200,000 - UGX 1,500,000) at 1% administration rate to purchase fresh wholesale produce in bulk directly from farmers in Masaka and Mubende.
- As loans are repaid weekly via Mobile Money, capital immediately cycles out to the next vendor.
- 100% of contributions are tracked transparently on Kusanya with quarterly financial audits published for all donors and members.

Your mobile money support directly empowers Ugandan women to build sustainable family wealth and business resilience.`,
    image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80',
    beneficiaryName: 'Kasubi Market Women Twegatte SACCO',
    beneficiaryRelationship: 'SACCO Board Executive Committee',
    organizerName: 'Hajjati Mariam Nabatanzi (SACCO Chairperson)',
    organizerPhone: '+256 702 449102',
    organizerKycVerified: true,
    payoutProvider: 'airtel',
    payoutPhone: '+256 702 449102',
    donorsCount: 134,
    featured: true,
    createdAt: '2026-08-06T09:30:00Z',
    daysRemaining: 15,
    status: 'active',
    updates: []
  },
  {
    id: 'ug-camp-009',
    title: 'Jinja Boda-Boda Riders SACCO Electric Bike & Safety Helmet Fund',
    slug: 'jinja-boda-boda-sacco-green-transport',
    tagline: 'Co-funding down-payments for 50 youth riders to transition to electric motorcycles and standard DOT helmets.',
    category: 'sacco',
    region: 'Eastern',
    district: 'Jinja',
    targetAmount: 22000000, // 22M UGX
    raisedAmount: 14800000, // 14.8M UGX
    currency: 'UGX',
    story: `The Jinja City Central Boda Riders Cooperative SACCO represents 120 registered youth motorcyclists operating across Jinja City, Kakira, and Bugembe. Rising petrol costs (UGX 5,600/litre) and motorcycle rental exploitation leave riders with barely UGX 8,000 net income per 14-hour workday.

Our SACCO has partnered with a Ugandan electric vehicle assembler in Namanve to acquire swap-battery electric motorcycles, cutting operational costs by 65%. 

This campaign provides matching group equity to clear the initial 25% down-payment per electric bike and purchase 100 certified safety helmets with reflective night gear for every rider. By contributing through Kusanya, you help keep youth in safe, profitable employment while decarbonizing public transport in Jinja.`,
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
    beneficiaryName: 'Jinja Central Boda SACCO Members',
    beneficiaryRelationship: 'Cooperative Board & Safety Officer',
    organizerName: 'Waiswa Godfrey',
    organizerPhone: '+256 775 901452',
    organizerKycVerified: true,
    payoutProvider: 'mtn',
    payoutPhone: '+256 775 901452',
    donorsCount: 92,
    featured: false,
    createdAt: '2026-08-07T11:20:00Z',
    daysRemaining: 20,
    status: 'active',
    updates: []
  },
  {
    id: 'ug-camp-010',
    title: 'Mukono St. Luke Anglican Church Solar Sound & Brass Band Instruments',
    slug: 'mukono-st-luke-church-solar-sound',
    tagline: 'Installing solar power and purchasing choir brass instruments for youth fellowship outreach.',
    category: 'faith',
    region: 'Central',
    district: 'Mukono',
    targetAmount: 12000000, // 12M UGX
    raisedAmount: 8200000, // 8.2M UGX
    currency: 'UGX',
    story: `St. Luke Anglican Church in rural Kyampisi, Mukono District is a vibrant community church serving over 400 weekly worshippers and 150 youth fellowship members. Frequent power blackouts disrupt Sunday services, evening bible study, and youth choir rehearsals.

We are fundraising to:
- Install a 3kVA hybrid solar inverter with lithium batteries for uninterrupted lighting and sound amplification (UGX 6,500,000).
- Procure brass band instruments (trumpets, saxophones, drums) to mentor at-risk youth in music and community evangelism (UGX 5,500,000).

Every contribution sent via MTN MoMo and Airtel Money directly empowers the church community. Webale nnyo okutuwaayo!`,
    image: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80',
    beneficiaryName: 'St. Luke Church Youth Choir',
    beneficiaryRelationship: 'Parish Lay Reader & Choir Director',
    organizerName: 'Kibirige Daniel',
    organizerPhone: '+256 756 220911',
    organizerKycVerified: true,
    payoutProvider: 'airtel',
    payoutPhone: '+256 756 220911',
    donorsCount: 57,
    featured: false,
    createdAt: '2026-08-09T08:45:00Z',
    daysRemaining: 16,
    status: 'active',
    updates: []
  }
];

const initialDonations: DonorCheer[] = [
  {
    id: 'don-001',
    campaignId: 'ug-camp-001',
    donorName: 'Dr. Kato Patrick',
    isAnonymous: false,
    amount: 500000,
    provider: 'mtn',
    message: 'Quick recovery to Baby Trevor! Standing with you in prayer.',
    timestamp: '2026-08-17T08:15:00Z',
    transactionRef: 'MOMO-UG-982143',
    verified: true
  },
  {
    id: 'don-002',
    campaignId: 'ug-camp-007',
    donorName: 'Elder Ssenyonga Wilson',
    isAnonymous: false,
    amount: 1500000,
    provider: 'mtn',
    message: 'For the glory of God and the preservation of Namirembe Cathedral youth pavilion.',
    timestamp: '2026-08-17T07:55:00Z',
    transactionRef: 'MOMO-UG-994320',
    verified: true
  },
  {
    id: 'don-003',
    campaignId: 'ug-camp-008',
    donorName: 'Nabukeera Diana',
    isAnonymous: false,
    amount: 350000,
    provider: 'airtel',
    message: 'Proud to support our Kasubi market mothers. Women empowerment builds the nation!',
    timestamp: '2026-08-17T07:10:00Z',
    transactionRef: 'AM-UG-883012',
    verified: true
  },
  {
    id: 'don-004',
    campaignId: 'ug-camp-002',
    donorName: 'Eng. Akello Harriet',
    isAnonymous: false,
    amount: 250000,
    provider: 'mtn',
    message: 'Every child deserves clean water. Well done Gulu team!',
    timestamp: '2026-08-17T06:20:00Z',
    transactionRef: 'MOMO-UG-774190',
    verified: true
  },
  {
    id: 'don-005',
    campaignId: 'ug-camp-003',
    donorName: 'Makerere CEDAT Alumni 2018',
    isAnonymous: false,
    amount: 1000000,
    provider: 'mtn',
    message: 'Finish strong Grace! We believe in you engineer.',
    timestamp: '2026-08-17T05:10:00Z',
    transactionRef: 'MOMO-UG-662319',
    verified: true
  }
];

let campaigns: Campaign[] = [...initialCampaigns];
let donations: DonorCheer[] = [...initialDonations];
let transactions: Map<string, PaymentTransaction> = new Map();
let payouts: PayoutRequest[] = [];

// ==========================================
// API ROUTES
// ==========================================

// 1. Get all campaigns (with filtering & sorting)
app.get('/api/campaigns', (req: Request, res: Response) => {
  const { category, region, search, featured } = req.query;
  let result = [...campaigns];

  if (category && category !== 'all') {
    result = result.filter(c => c.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (region && region !== 'all') {
    result = result.filter(c => c.region.toLowerCase() === (region as string).toLowerCase());
  }

  if (featured === 'true') {
    result = result.filter(c => c.featured);
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

// 2. Get single campaign with donations
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

// 3. Create new campaign
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
    beneficiaryName,
    beneficiaryRelationship,
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
    image: image || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb9?auto=format&fit=crop&w=1200&q=80',
    beneficiaryName: beneficiaryName || organizerName,
    beneficiaryRelationship: beneficiaryRelationship || 'Self',
    organizerName,
    organizerPhone,
    organizerKycVerified: true, // Initial level 1 phone KYC
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

// 4. Post campaign update
app.post('/api/campaigns/:id/updates', (req: Request, res: Response) => {
  const { title, content, author } = req.body;
  const campaign = campaigns.find(c => c.id === req.params.id);
  if (!campaign) {
    return res.status(404).json({ success: false, error: 'Campaign not found' });
  }

  const update = {
    id: `upd-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    title,
    content,
    author: author || campaign.organizerName
  };

  campaign.updates.unshift(update);
  res.json({ success: true, update });
});

// 5. Mobile Money Donation Initiation
app.post('/api/donations/initiate', (req: Request, res: Response) => {
  const { campaignId, donorName, donorPhone, amount, provider, isAnonymous, message } = req.body;

  const campaign = campaigns.find(c => c.id === campaignId);
  if (!campaign) {
    return res.status(404).json({ success: false, error: 'Campaign not found' });
  }

  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount) || parsedAmount < 500) {
    return res.status(400).json({ success: false, error: 'Minimum donation is UGX 500' });
  }

  // Determine provider by phone prefix if needed
  let resolvedProvider = provider || 'mtn';
  const cleanPhone = (donorPhone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('25670') || cleanPhone.startsWith('25675') || cleanPhone.startsWith('25674') || cleanPhone.startsWith('070') || cleanPhone.startsWith('075') || cleanPhone.startsWith('074')) {
    resolvedProvider = 'airtel';
  } else if (cleanPhone.startsWith('25677') || cleanPhone.startsWith('25678') || cleanPhone.startsWith('25676') || cleanPhone.startsWith('077') || cleanPhone.startsWith('078') || cleanPhone.startsWith('076')) {
    resolvedProvider = 'mtn';
  }

  const prefix = resolvedProvider === 'airtel' ? 'AM-UG' : resolvedProvider === 'card' ? 'CARD-UG' : 'MOMO-UG';
  const refNumber = Math.floor(100000 + Math.random() * 900000);
  const reference = `${prefix}-${Date.now().toString().slice(-4)}${refNumber}`;
  const networkRef = `NW-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const receiptNumber = `RCP-UGX-${Math.floor(1000000 + Math.random() * 9000000)}`;

  const ussdPrompt = resolvedProvider === 'airtel'
    ? `*185*9# (Authorize payment of UGX ${parsedAmount.toLocaleString()} to KUSANYA.ORG ref ${reference})`
    : `*165*3# (MTN MoMo: Pay UGX ${parsedAmount.toLocaleString()} to Kusanya)`;

  const tx: PaymentTransaction = {
    reference,
    campaignId,
    donorName: donorName || 'Kind Giver',
    donorPhone: donorPhone || '',
    amount: parsedAmount,
    provider: resolvedProvider,
    isAnonymous: !!isAnonymous,
    message: message || '',
    status: 'ussd_sent',
    ussdPrompt,
    networkRef,
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
      promptText: `A push prompt has been sent to ${donorPhone}. Please check your phone screen and enter your Mobile Money PIN to authorize UGX ${parsedAmount.toLocaleString()}.`,
      ussdManualCode: resolvedProvider === 'airtel' ? `*185#` : `*165#`
    }
  });
});

// 6. Instant Payment PIN Authorization Simulation / Webhook Handler
app.post('/api/donations/simulate-pin-confirm', (req: Request, res: Response) => {
  const { reference, pin } = req.body;
  const tx = transactions.get(reference);

  if (!tx) {
    return res.status(404).json({ success: false, error: 'Transaction reference not found' });
  }

  if (tx.status === 'completed') {
    return res.json({ success: true, transaction: tx, message: 'Already completed' });
  }

  // Mark completed
  tx.status = 'completed';
  tx.completedAt = new Date().toISOString();

  // Update campaign financials
  const campaign = campaigns.find(c => c.id === tx.campaignId);
  if (campaign) {
    campaign.raisedAmount += tx.amount;
    campaign.donorsCount += 1;
  }

  // Add to donations feed
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
    campaignTotalRaised: campaign ? campaign.raisedAmount : 0,
    receipt: {
      receiptNumber: tx.receiptNumber,
      amount: tx.amount,
      currency: 'UGX',
      campaignTitle: campaign ? campaign.title : 'Uganda Fundraiser',
      date: tx.completedAt,
      provider: tx.provider,
      networkRef: tx.networkRef,
      donor: tx.isAnonymous ? 'Anonymous' : tx.donorName
    }
  });
});

// 7. Check Payment Status
app.get('/api/donations/status/:reference', (req: Request, res: Response) => {
  const tx = transactions.get(req.params.reference);
  if (!tx) {
    return res.status(404).json({ success: false, error: 'Transaction not found' });
  }
  res.json({ success: true, transaction: tx });
});

// 8. Recent Live Donations Feed (Platform-wide)
app.get('/api/donations/recent', (req: Request, res: Response) => {
  const recent = donations.slice(0, 15).map(d => {
    const campaign = campaigns.find(c => c.id === d.campaignId);
    return {
      ...d,
      campaignTitle: campaign ? campaign.title : 'Uganda Fundraiser',
      campaignDistrict: campaign ? campaign.district : 'Uganda'
    };
  });

  const totalRaisedUGX = campaigns.reduce((acc, c) => acc + c.raisedAmount, 0);
  const totalDonors = campaigns.reduce((acc, c) => acc + c.donorsCount, 0);

  res.json({
    success: true,
    donations: recent,
    stats: {
      totalRaisedUGX,
      totalDonors,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      districtsCovered: Array.from(new Set(campaigns.map(c => c.district))).length
    }
  });
});

// 9. Organizer Payout / Disbursement Request
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
    status: 'disbursed', // Instant MoMo B2C automated settlement
    disbursementRef: `B2C-UGX-${Math.floor(100000 + Math.random() * 900000)}`
  };

  payouts.unshift(payout);
  res.json({ success: true, payout });
});

// 10. AI Campaign Generator with Gemini
app.post('/api/ai/generate-campaign', async (req: Request, res: Response) => {
  const { beneficiary, needType, district, targetAmountUGX, rawNotes } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const prompt = `You are an expert fundraising copywriter and community organizer in Uganda for Kusanya (kusanya.org). 
Create an authentic, compassionate, and highly persuasive crowdfunding campaign in Ugandan context for:
- Beneficiary: ${beneficiary || 'A community member, Church ministry, SACCO cooperative, or family in need'}
- Category/Need: ${needType || 'Medical emergency / Tuition / Church renovation / SACCO revolving fund / Community clean water'}
- District/Region: ${district || 'Kampala, Uganda'}
- Target Amount: UGX ${Number(targetAmountUGX || 5000000).toLocaleString()}
- Key Story Details: ${rawNotes || 'Urgent financial assistance or group capital needed through mobile money on Kusanya.'}

Return a valid JSON object with:
{
  "title": "A strong, compassionate 8-12 word headline mentioning beneficiary and city",
  "tagline": "A concise 1-sentence emotional summary",
  "story": "A 3-paragraph authentic Ugandan story emphasizing urgency, transparency, breakdown of costs in UGX, and thanking donors (with a warm Luganda or local cultural blessing like Webale nnyo / Mukama abawe omukisa / Apwoyo matek / Mwebale munonga).",
  "suggestedMilestones": ["UGX milestone 1 breakdown", "UGX milestone 2 breakdown", "UGX milestone 3 breakdown"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return res.json({ success: true, generated: parsed });
      }
    } catch (err) {
      console.warn('Gemini API call encountered an error, falling back to Ugandan template:', err);
    }
  }

  // High quality fallback template if Gemini key is unset or error occurs
  const fallbackStory = `We are reaching out to all kind-hearted Ugandans and friends of Uganda to support ${beneficiary || 'our community cause'} in ${district || 'Uganda'}. 

Due to pressing milestones, we need to raise UGX ${Number(targetAmountUGX || 5000000).toLocaleString()} to cover essential ${needType || 'urgent'} costs. Every contribution, whether UGX 5,000, UGX 20,000, or UGX 100,000 sent through MTN Mobile Money or Airtel Money on Kusanya directly bridges this gap.

${rawNotes ? `Background: ${rawNotes}\n\n` : ''}We promise complete transparency with regular photo updates, receipts, and bank reconciliation statements posted directly on this page. May the Almighty bless the work of your hands. Webale nnyo!`;

  res.json({
    success: true,
    generated: {
      title: `Support for ${beneficiary || 'Our Community'} in ${district || 'Uganda'}`,
      tagline: `Helping raise UGX ${Number(targetAmountUGX || 5000000).toLocaleString()} for ${needType || 'essential support'}.`,
      story: fallbackStory,
      suggestedMilestones: [
        `Phase 1: Initial emergency or mobilization deposit (UGX ${(Number(targetAmountUGX || 5000000) * 0.4).toLocaleString()})`,
        `Phase 2: Core implementation & materials (UGX ${(Number(targetAmountUGX || 5000000) * 0.4).toLocaleString()})`,
        `Phase 3: Final audit, clearance and reporting (UGX ${(Number(targetAmountUGX || 5000000) * 0.2).toLocaleString()})`
      ]
    }
  });
});

// Vite Middleware & Static handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kusanya (kusanya.org) server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
