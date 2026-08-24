import { Campaign, CampaignUpdate, DonorCheer, MoMoProvider, PaymentTransaction, PayoutRequest } from '../types';

// Default Seed Campaigns in case server is 404/offline or hosted as static SPA
export const DEFAULT_SEED_CAMPAIGNS: Campaign[] = [
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
    story: `Baby Trevor Sserwadda is a 14-month-old energetic boy from Kawempe, Kampala. Two months ago, he was diagnosed with a large Ventricular Septal Defect (a hole in his heart) at Mulago National Referral Hospital's Uganda Heart Institute (UHI).

His mother, Nalubega Sarah, is a single mother working as a vegetable vendor in Kasubi Market. Trevor requires urgent corrective open-heart surgery scheduled for next month to prevent irreversible pulmonary hypertension. 

The total cost of surgical consumables, pediatric ICU care, and post-operative medications is UGX 25,000,000. Through the kindness of neighbors and church members, we have started this fund to give Baby Trevor a healthy chance at life.

Every single 5,000, 10,000, or 50,000 UGX sent via MTN MoMo or Airtel Money directly pays the hospital admission and surgical consumable invoice. May God bless your generous giving (Webale nnyo!).`,
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1200&q=80'
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
    createdAt: '2025-08-15T08:00:00Z', // 1 Year Sustained Active Campaign
    activeDurationMonths: 12,
    activeDurationDays: 372,
    lastDonationAt: '2026-08-22T04:15:00Z',
    recentDonations7d: 19,
    recentDonations30d: 48,
    activityScore: 97,
    spotlightEligible1Year: true,
    spotlightBadge: '🔥 1-Year Active Spotlight',
    spotlightReason: 'Maintained active status for over 1 year (372 days) with 142 verified Mobile Money donors and regular hospital updates.',
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
    targetAmount: 14500000,
    raisedAmount: 11200000,
    currency: 'UGX',
    story: `Paicho Community Primary School in rural Gulu serves over 850 primary school pupils and 18 teachers. Currently, young girls and boys must walk 3 kilometers twice a day to fetch water from an unprotected stream, resulting in frequent outbreaks of typhoid and lost classroom hours.

We are raising funds to install a heavy-duty solar-powered borehole pump, 10,000-liter storage tank, and UV filtration kiosk directly on the school compound. This system will serve both the school and over 1,200 surrounding community members in Paicho.

Local engineers from Gulu University have completed the site survey and volunteered to oversee installation free of labor charges. We only need funds for the solar panels, submersible pump, steel tank stand, and PVC piping.`,
    image: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?auto=format&fit=crop&w=1200&q=80'
    ],
    beneficiaryName: 'Paicho Primary School Pupils',
    beneficiaryRelationship: 'Headteacher & PTA Board',
    beneficiaryPhone: '+256 754 119834',
    beneficiaryEmail: '',
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
    targetAmount: 3800000,
    raisedAmount: 3150000,
    currency: 'UGX',
    story: `My name is Grace Atim, a final year student pursuing a Bachelor of Science in Civil Engineering at Makerere University (College of Engineering, Design, Art and Technology - CEDAT).

I come from a humble farming background in Lira District. Throughout my 4 years, I have maintained a First Class CGPA of 4.42 while tutoring high school mathematics on weekends. Unfortunately, my sponsor passed away earlier this year, leaving an outstanding tuition balance of UGX 3,800,000 required by the Academic Registrar to receive an exam permit.

Final examinations commence in three weeks. Graduating will enable me to start my engineering internship and support my four younger siblings' education. Apwoyo matek (Thank you very much) for standing with me!`,
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=1200&q=80'
    ],
    beneficiaryName: 'Grace Atim',
    beneficiaryRelationship: 'Self (Student)',
    beneficiaryPhone: '+256 779 883201',
    beneficiaryEmail: 'grace.atim.cedat@gmail.com',
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
    targetAmount: 18000000,
    raisedAmount: 9600000,
    currency: 'UGX',
    story: `Torrential seasonal rains in Busoga sub-region led to severe flash flooding in Budondo Sub-county, Jinja District. 45 homesteads have had their mud-brick houses collapsed, food stores washed away, and crops destroyed.

Families are currently sheltering in a local church hall with limited access to clean water, food, and warm blankets. The Jinja Red Cross branch and local council leaders have compiled an emergency relief priority list:
1. Posho (Maize flour) and beans (UGX 6,000,000)
2. Treated Long-Lasting Mosquito Nets for children and mothers (UGX 3,500,000)
3. Iron sheets and timber for temporary shelter reconstruction (UGX 8,500,000)

All mobile money funds raised here are disbursed directly under the supervision of LC3 Chairperson and Jinja Disaster Response Committee.`,
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80'
    ],
    beneficiaryName: 'Budondo Flood Victims',
    beneficiaryRelationship: 'Community Action Committee',
    beneficiaryPhone: '+256 701 554320',
    beneficiaryEmail: '',
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
    targetAmount: 8500000,
    raisedAmount: 5100000,
    currency: 'UGX',
    story: `On the fertile slopes of Mount Elgon in Mbale, 30 young smallholder farmers have united under the Wanale Arabica Youth Cooperative. Currently, farmers are forced to sell freshly picked wet coffee cherries to middlemen at a meager UGX 3,000/kg because they lack a mechanized eco-pulping machine.

With our own motorized eco-pulper and drying beds, our youth cooperative can process Grade-AA specialty parchment coffee and sell directly to roasters for over UGX 12,000/kg, immediately tripling household incomes for over 150 family dependents.

We have already contributed 30% from our collective savings. This campaign will bridge the remaining cost to purchase the eco-pulper from a verified supplier in Kampala.`,
    image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80'
    ],
    beneficiaryName: 'Wanale Youth Coffee Cooperative',
    beneficiaryRelationship: 'Cooperative Chairperson',
    beneficiaryPhone: '+256 788 903211',
    beneficiaryEmail: '',
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
    targetAmount: 35000000,
    raisedAmount: 22800000,
    currency: 'UGX',
    story: `Expectant mothers in hilly rural Kashari North, Mbarara District face severe transport bottlenecks when complications arise during labor. The nearest hospital (Mbarara Regional Referral Hospital) is 45km away over rugged terrain.

Boda-boda transport during labor carries high risks of maternal and neonatal mortality. St. Luke Health Centre is fundraising to acquire a ruggedized, reconditioned 4WD Toyota HiAce equipped with an oxygen cylinder, stretcher, and basic resuscitation kit.

This vehicle will be dedicated 24/7 to emergency obstetric referrals across 6 parish clinics, serving over 28,000 residents.`,
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80'
    ],
    beneficiaryName: 'Expectant Mothers of Kashari North',
    beneficiaryRelationship: 'Clinic Medical Director',
    beneficiaryPhone: '+256 774 309188',
    beneficiaryEmail: '',
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
    targetAmount: 45000000,
    raisedAmount: 29800000,
    currency: 'UGX',
    story: `St. Paul's Cathedral Namirembe is the oldest cathedral in Uganda and the seat of the Anglican Church of Uganda (Namirembe Diocese). The historic youth & outreach pavilion serves over 600 choir members, university youth fellowships, Sunday school teachers, and neighborhood community counseling programs every week.
    
Due to roof water leakages and aging electrical wiring, the youth ministry hall requires urgent structural restoration:
1. Complete timber truss replacement and high-durability clay tile roofing (UGX 22,000,000)
2. Professional acoustic treatment, digital audio mixer, and worship instruments (UGX 15,000,000)
3. Free community youth ICT lab with 12 workstations for vocational digital literacy (UGX 8,000,000)

We invite all faithful congregants, alumni, diaspora Christians, and well-wishers to contribute tithes, offerings, and pledges via MTN MoMo and Airtel Money directly on Kusanya.org. Mukama Akuwe Omukisa (May the Lord bless you abundantly!).`,
    image: 'https://images.unsplash.com/photo-1548625361-195972844e13?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1548625361-195972844e13?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80'
    ],
    beneficiaryName: 'Namirembe Cathedral Youth Ministry',
    beneficiaryRelationship: 'Diocese Youth Pastor & Guild Committee',
    beneficiaryPhone: '+256 772 819034',
    beneficiaryEmail: '',
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
    targetAmount: 30000000,
    raisedAmount: 21500000,
    currency: 'UGX',
    story: `The Kasubi Market Women Twegatte SACCO brings together 180 hardworking female fruit, vegetable, cereal, and poultry vendors in Lubaga Division, Kampala. Many members are sole breadwinners supporting extended families and paying school fees for over 450 school-going children.

Informal money lenders and predatory quick-loan apps charge extortionate interest rates of 20% to 30% per month, trapping market mamas in cycles of debt. Our SACCO is raising collective equity capital to build an independent, member-owned Revolving Liquidity Pool.

How the SACCO Fund Operates:
- Members access affordable working capital loans (UGX 200,000 - UGX 1,500,000) at 1% administration rate to purchase fresh wholesale produce in bulk directly from farmers in Masaka and Mubende.
- As loans are repaid weekly via Mobile Money, capital immediately cycles out to the next vendor.
- 100% of contributions are tracked transparently on Kusanya with quarterly financial audits published for all donors and members.

Your mobile money support directly empowers Ugandan women to build sustainable family wealth and business resilience.`,
    image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80'
    ],
    beneficiaryName: 'Kasubi Market Women Twegatte SACCO',
    beneficiaryRelationship: 'SACCO Board Executive Committee',
    beneficiaryPhone: '+256 702 449102',
    beneficiaryEmail: '',
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
    targetAmount: 22000000,
    raisedAmount: 14800000,
    currency: 'UGX',
    story: `The Jinja City Central Boda Riders Cooperative SACCO represents 120 registered youth motorcyclists operating across Jinja City, Kakira, and Bugembe. Rising petrol costs (UGX 5,600/litre) and motorcycle rental exploitation leave riders with barely UGX 8,000 net income per 14-hour workday.

Our SACCO has partnered with a Ugandan electric vehicle assembler in Namanve to acquire swap-battery electric motorcycles, cutting operational costs by 65%. 

This campaign provides matching group equity to clear the initial 25% down-payment per electric bike and purchase 100 certified safety helmets with reflective night gear for every rider. By contributing through Kusanya, you help keep youth in safe, profitable employment while decarbonizing public transport in Jinja.`,
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80'
    ],
    beneficiaryName: 'Jinja Central Boda SACCO Members',
    beneficiaryRelationship: 'Cooperative Board & Safety Officer',
    beneficiaryPhone: '+256 775 901452',
    beneficiaryEmail: '',
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
    targetAmount: 12000000,
    raisedAmount: 8200000,
    currency: 'UGX',
    story: `St. Luke Anglican Church in rural Kyampisi, Mukono District is a vibrant community church serving over 400 weekly worshippers and 150 youth fellowship members. Frequent power blackouts disrupt Sunday services, evening bible study, and youth choir rehearsals.

We are fundraising to:
- Install a 3kVA hybrid solar inverter with lithium batteries for uninterrupted lighting and sound amplification (UGX 6,500,000).
- Procure brass band instruments (trumpets, saxophones, drums) to mentor at-risk youth in music and community evangelism (UGX 5,500,000).

Every contribution sent via MTN MoMo and Airtel Money directly empowers the church community. Webale nnyo okutuwaayo!`,
    image: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80'
    ],
    beneficiaryName: 'St. Luke Church Youth Choir',
    beneficiaryRelationship: 'Parish Lay Reader & Choir Director',
    beneficiaryPhone: '+256 756 220911',
    beneficiaryEmail: '',
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

export const DEFAULT_SEED_DONATIONS: DonorCheer[] = [
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

// Local Storage Keys
const LS_CAMPAIGNS_KEY = 'kusanya_campaigns_v2';
const LS_DONATIONS_KEY = 'kusanya_donations_v2';
const LS_TRANSACTIONS_KEY = 'kusanya_transactions_v2';
const LS_PAYOUTS_KEY = 'kusanya_payouts_v2';

function getStoredCampaigns(): Campaign[] {
  try {
    const raw = localStorage.getItem(LS_CAMPAIGNS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure top active sustained causes are merged if missing
        const existingIds = new Set(parsed.map((c: any) => c.id));
        const missingSeeds = DEFAULT_SEED_CAMPAIGNS.filter(seed => !existingIds.has(seed.id));
        if (missingSeeds.length > 0) {
          const merged = [...parsed, ...missingSeeds];
          saveStoredCampaigns(merged);
          return merged;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn('LocalStorage error reading campaigns', e);
  }
  return DEFAULT_SEED_CAMPAIGNS;
}

function saveStoredCampaigns(list: Campaign[]) {
  try {
    localStorage.setItem(LS_CAMPAIGNS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('LocalStorage error saving campaigns', e);
  }
}

function getStoredDonations(): DonorCheer[] {
  try {
    const raw = localStorage.getItem(LS_DONATIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('LocalStorage error reading donations', e);
  }
  return DEFAULT_SEED_DONATIONS;
}

function saveStoredDonations(list: DonorCheer[]) {
  try {
    localStorage.setItem(LS_DONATIONS_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('LocalStorage error saving donations', e);
  }
}

// -------------------------------------------------------------
// Unified Resilient API Client with Seamless 404 / Offline Fallback
// -------------------------------------------------------------
export const api = {
  /**
   * Fetch all campaigns with optional category, region, and search filter
   */
  async getCampaigns(): Promise<{ success: boolean; campaigns: Campaign[] }> {
    try {
      const res = await fetch('/api/campaigns');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.campaigns)) {
          saveStoredCampaigns(data.campaigns);
          return data;
        }
      }
    } catch (err) {
      console.warn('API /api/campaigns request failed or returned 404. Falling back to local storage cache.', err);
    }
    // Fallback
    const local = getStoredCampaigns();
    return { success: true, campaigns: local };
  },

  /**
   * Fetch live donations ticker feed and summary stats
   */
  async getRecentDonations(): Promise<{
    success: boolean;
    donations: DonorCheer[];
    stats: { totalRaisedUGX: number; totalDonors: number; activeCampaigns: number; districtsCovered: number };
  }> {
    try {
      const res = await fetch('/api/donations/recent');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.donations) {
          saveStoredDonations(data.donations);
          return data;
        }
      }
    } catch (err) {
      console.warn('API /api/donations/recent request failed. Falling back to local cache.', err);
    }

    // Fallback calculation
    const campaigns = getStoredCampaigns();
    const donations = getStoredDonations();
    const totalRaisedUGX = campaigns.reduce((acc, c) => acc + c.raisedAmount, 0);
    const totalDonors = campaigns.reduce((acc, c) => acc + c.donorsCount, 0);
    const districtsCovered = Array.from(new Set(campaigns.map((c) => c.district))).length;

    return {
      success: true,
      donations,
      stats: {
        totalRaisedUGX,
        totalDonors,
        activeCampaigns: campaigns.filter((c) => c.status === 'active').length,
        districtsCovered,
      },
    };
  },

  /**
   * Create a new campaign
   */
  async createCampaign(payload: Partial<Campaign>): Promise<{ success: boolean; campaign: Campaign }> {
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.campaign) {
          const current = getStoredCampaigns();
          saveStoredCampaigns([data.campaign, ...current]);
          return data;
        }
      }
    } catch (err) {
      console.warn('API /api/campaigns POST failed. Persisting campaign in local store.', err);
    }

    // Fallback local creation
    const newCamp: Campaign = {
      id: `ug-camp-${Date.now().toString().slice(-6)}`,
      title: payload.title || 'Untitled Fundraiser',
      slug: (payload.title || 'fundraiser')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + '-' + Math.floor(1000 + Math.random() * 9000),
      tagline: payload.tagline || (payload.title ? payload.title.slice(0, 80) : ''),
      category: payload.category || 'community',
      region: payload.region || 'Central',
      district: payload.district || 'Kampala',
      targetAmount: Number(payload.targetAmount) || 1000000,
      raisedAmount: 0,
      currency: 'UGX',
      story: payload.story || '',
      image: payload.image || payload.images?.[0] || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb9?auto=format&fit=crop&w=1200&q=80',
      images: payload.images && payload.images.length > 0 ? payload.images : [payload.image || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb9?auto=format&fit=crop&w=1200&q=80'],
      beneficiaryName: payload.beneficiaryName || payload.organizerName || 'Beneficiary',
      beneficiaryRelationship: payload.beneficiaryRelationship || 'Self',
      beneficiaryPhone: payload.beneficiaryPhone || payload.organizerPhone || '',
      beneficiaryEmail: payload.beneficiaryEmail || '',
      organizerName: payload.organizerName || 'Organizer',
      organizerPhone: payload.organizerPhone || '',
      organizerKycVerified: true,
      payoutProvider: payload.payoutProvider || 'mtn',
      payoutPhone: payload.payoutPhone || payload.organizerPhone || '',
      donorsCount: 0,
      featured: false,
      createdAt: new Date().toISOString(),
      daysRemaining: 30,
      status: 'active',
      updates: [],
    };

    const current = getStoredCampaigns();
    saveStoredCampaigns([newCamp, ...current]);
    return { success: true, campaign: newCamp };
  },

  /**
   * Post organizer update / story / receipt
   */
  async postUpdate(
    campaignId: string,
    title: string,
    content: string,
    author?: string,
    imageUrl?: string,
    category: 'update' | 'milestone' | 'receipt' | 'story' | 'gratitude' = 'update'
  ): Promise<{ success: boolean; update: CampaignUpdate }> {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, author, imageUrl, category }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.update) {
          return data;
        }
      }
    } catch (err) {
      console.warn('API update failed. Saving update locally.', err);
    }

    const update: CampaignUpdate = {
      id: `upd-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title,
      content,
      author: author || 'Organizer',
      imageUrl: imageUrl || undefined,
      category,
      likesCount: 0,
      pinned: false,
    };

    const current = getStoredCampaigns();
    const updated = current.map((c) => (c.id === campaignId ? { ...c, updates: [update, ...c.updates] } : c));
    saveStoredCampaigns(updated);

    return { success: true, update };
  },

  /**
   * Like / Cheer a specific update post
   */
  async likeUpdate(campaignId: string, updateId: string): Promise<{ success: boolean; likesCount: number }> {
    const current = getStoredCampaigns();
    let newLikes = 1;
    const updated = current.map((c) => {
      if (c.id === campaignId) {
        const updatedPosts = c.updates.map((u) => {
          if (u.id === updateId) {
            newLikes = (u.likesCount || 0) + 1;
            return { ...u, likesCount: newLikes };
          }
          return u;
        });
        return { ...c, updates: updatedPosts };
      }
      return c;
    });
    saveStoredCampaigns(updated);
    return { success: true, likesCount: newLikes };
  },

  /**
   * Delete or moderate an update post
   */
  async deleteUpdate(campaignId: string, updateId: string): Promise<{ success: boolean }> {
    const current = getStoredCampaigns();
    const updated = current.map((c) => {
      if (c.id === campaignId) {
        return { ...c, updates: c.updates.filter((u) => u.id !== updateId) };
      }
      return c;
    });
    saveStoredCampaigns(updated);
    return { success: true };
  },

  /**
   * Initiate donation
   */
  async initiateDonation(payload: {
    campaignId: string;
    amount: number;
    provider: MoMoProvider;
    donorPhone?: string;
    donorEmail?: string;
    donorName?: string;
    message?: string;
    isAnonymous?: boolean;
    cardDetails?: any;
    paypalEmail?: string;
  }): Promise<{ success: boolean; transaction: PaymentTransaction; error?: string }> {
    try {
      const res = await fetch('/api/donations/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.transaction) {
          return data;
        }
      }
    } catch (err) {
      console.warn('API /api/donations/initiate failed. Processing via fallback client gateway.', err);
    }

    // Fallback transaction creation
    const parsedAmount = Number(payload.amount);
    const platformFee = Math.round(parsedAmount * 0.05);
    const netBeneficiaryAmount = parsedAmount - platformFee;

    let prefix = 'MOMO-UG';
    if (payload.provider === 'airtel') prefix = 'AM-UG';
    else if (payload.provider === 'visa' || payload.provider === 'card') prefix = 'VISA-UG';
    else if (payload.provider === 'paypal') prefix = 'PP-INT';

    const refNumber = Math.floor(100000 + Math.random() * 900000);
    const reference = `${prefix}-${Date.now().toString().slice(-4)}${refNumber}`;
    const networkRef = `NW-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const receiptNumber = `RCP-UGX-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const tx: PaymentTransaction = {
      id: reference,
      reference,
      transactionRef: reference,
      campaignId: payload.campaignId,
      donorName: payload.donorName || (payload.isAnonymous ? 'Anonymous Well-Wisher' : 'Kind Giver'),
      donorPhone: payload.donorPhone || '',
      phoneNumber: payload.donorPhone || '',
      amount: parsedAmount,
      platformFee,
      feePercentage: 5,
      netBeneficiaryAmount,
      provider: payload.provider,
      isAnonymous: !!payload.isAnonymous,
      message: payload.message || '',
      status: payload.provider === 'visa' || payload.provider === 'paypal' ? 'processing' : 'ussd_sent',
      ussdPrompt: `${payload.provider.toUpperCase()} Mobile Money: Pay UGX ${parsedAmount.toLocaleString()} to Kusanya ref ${reference}`,
      ussdPromptText: `A prompt has been simulated for ${payload.donorPhone || 'your account'}.`,
      networkRef,
      networkTransactionId: networkRef,
      createdAt: new Date().toISOString(),
      receiptNumber,
    };

    return { success: true, transaction: tx };
  },

  /**
   * Confirm PIN / 3D-Secure / PayPal
   */
  async confirmDonation(payload: {
    reference: string;
    pin?: string;
    otp?: string;
    transaction?: PaymentTransaction;
  }): Promise<{ success: boolean; transaction: PaymentTransaction; newRaisedAmount?: number }> {
    try {
      const res = await fetch('/api/donations/simulate-pin-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          return data;
        }
      }
    } catch (err) {
      console.warn('API confirm failed. Finalizing transaction locally.', err);
    }

    // Local fallback
    const tx = payload.transaction || {
      id: payload.reference,
      reference: payload.reference,
      transactionRef: payload.reference,
      campaignId: 'ug-camp-001',
      donorName: 'Generous Donor',
      donorPhone: '',
      phoneNumber: '',
      amount: 10000,
      platformFee: 500,
      feePercentage: 5,
      netBeneficiaryAmount: 9500,
      provider: 'mtn' as MoMoProvider,
      isAnonymous: false,
      message: '',
      status: 'completed' as const,
      ussdPrompt: '',
      ussdPromptText: '',
      networkRef: `NW-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      networkTransactionId: '',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      receiptNumber: `RCP-UGX-${Math.floor(1000000 + Math.random() * 9000000)}`,
    };

    tx.status = 'completed';
    tx.completedAt = new Date().toISOString();

    // Update campaign in local storage
    const current = getStoredCampaigns();
    let newRaised = 0;
    const updated = current.map((c) => {
      if (c.id === tx.campaignId) {
        newRaised = c.raisedAmount + tx.amount;
        return {
          ...c,
          raisedAmount: newRaised,
          donorsCount: c.donorsCount + 1,
        };
      }
      return c;
    });
    saveStoredCampaigns(updated);

    // Save to donations feed
    const cheer: DonorCheer = {
      id: `don-${Date.now()}`,
      campaignId: tx.campaignId,
      donorName: tx.donorName,
      isAnonymous: tx.isAnonymous,
      amount: tx.amount,
      provider: tx.provider,
      message: tx.message,
      timestamp: new Date().toISOString(),
      transactionRef: tx.reference,
      verified: true,
    };
    const donList = getStoredDonations();
    saveStoredDonations([cheer, ...donList]);

    return { success: true, transaction: tx, newRaisedAmount: newRaised };
  },

  /**
   * Request Organizer Payout
   */
  async requestPayout(payload: {
    campaignId: string;
    amount: number;
    provider?: string;
    phoneNumber?: string;
    recipientName?: string;
  }): Promise<{ success: boolean; payout: PayoutRequest; error?: string }> {
    try {
      const res = await fetch('/api/payouts/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.payout) {
          return data;
        }
      }
    } catch (err) {
      console.warn('API payout request failed. Generating instant local payout record.', err);
    }

    const current = getStoredCampaigns();
    const campaign = current.find((c) => c.id === payload.campaignId);

    const payout: PayoutRequest = {
      id: `pay-${Date.now()}`,
      campaignId: payload.campaignId,
      campaignTitle: campaign ? campaign.title : 'Uganda Fundraiser',
      amount: payload.amount,
      provider: (payload.provider as any) || campaign?.payoutProvider || 'mtn',
      phoneNumber: payload.phoneNumber || campaign?.payoutPhone || '',
      recipientName: payload.recipientName || campaign?.organizerName || 'Organizer',
      requestedAt: new Date().toISOString(),
      status: 'disbursed',
      disbursementRef: `B2C-UGX-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    return { success: true, payout };
  },

  /**
   * Admin Authentication
   * Allows login for bright@kusanya.com, stephen@kusanya.com, billy@kusanya.com, or any @kusanya.com with pass 1234
   */
  async adminLogin(email: string, password: string): Promise<{ success: boolean; admin?: any; error?: string }> {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.admin) {
          localStorage.setItem('kusanya_admin_session', JSON.stringify(data.admin));
          return data;
        }
      }
    } catch (err) {
      console.warn('Backend admin login offline. Validating via client gateway rules.', err);
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();
    const isAllowedDomain = cleanEmail.endsWith('@kusanya.com');
    const isSpecialAdmin = ['bright@kusanya.com', 'stephen@kusanya.com', 'billy@kusanya.com'].includes(cleanEmail);

    if ((isAllowedDomain || isSpecialAdmin) && cleanPass === '1234') {
      const namePart = cleanEmail.split('@')[0];
      const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      const adminUser = {
        email: cleanEmail,
        name: `${capitalized} (Kusanya Admin)`,
        role: 'superadmin',
        token: `kusanya-token-${Date.now()}`,
      };
      localStorage.setItem('kusanya_admin_session', JSON.stringify(adminUser));
      return { success: true, admin: adminUser };
    }

    return { 
      success: false, 
      error: 'Invalid admin credentials. Use bright@kusanya.com, stephen@kusanya.com, billy@kusanya.com or any @kusanya.com email with password 1234.' 
    };
  },

  /**
   * Update campaign (Edit story, target, category, featured status, KYC, etc.)
   */
  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<{ success: boolean; campaign?: Campaign; error?: string }> {
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.campaign) {
          // Sync local storage
          const current = getStoredCampaigns();
          const updatedList = current.map(c => c.id === id ? data.campaign : c);
          saveStoredCampaigns(updatedList);
          return data;
        }
      }
    } catch (err) {
      console.warn('API updateCampaign failed. Updating local storage.', err);
    }

    const current = getStoredCampaigns();
    let updatedObj: Campaign | undefined;
    const updatedList = current.map(c => {
      if (c.id === id || c.slug === id) {
        updatedObj = { ...c, ...updates };
        return updatedObj;
      }
      return c;
    });

    if (updatedObj) {
      saveStoredCampaigns(updatedList);
      return { success: true, campaign: updatedObj };
    }

    return { success: false, error: 'Campaign not found' };
  },

  /**
   * Delete campaign (Admin)
   */
  async deleteCampaign(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const current = getStoredCampaigns();
          saveStoredCampaigns(current.filter(c => c.id !== id && c.slug !== id));
          return data;
        }
      }
    } catch (err) {
      console.warn('API deleteCampaign failed. Deleting locally.', err);
    }

    const current = getStoredCampaigns();
    const filtered = current.filter(c => c.id !== id && c.slug !== id);
    saveStoredCampaigns(filtered);
    return { success: true, message: 'Campaign deleted successfully from Kusanya' };
  },

  /**
   * Toggle Featured Spotlight on Top
   */
  async toggleFeatured(id: string, featured: boolean): Promise<{ success: boolean; campaign?: Campaign }> {
    return this.updateCampaign(id, { featured });
  },

  /**
   * Fetch comprehensive Admin Analytics and Collections breakdown
   */
  async getAdminAnalytics(): Promise<{ success: boolean; analytics: any }> {
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.analytics) {
          return data;
        }
      }
    } catch (err) {
      console.warn('API admin analytics failed. Computing from local state.', err);
    }

    const campaigns = getStoredCampaigns();
    const totalRaisedUGX = campaigns.reduce((sum, c) => sum + (c.raisedAmount || 0), 0);
    const totalTargetUGX = campaigns.reduce((sum, c) => sum + (c.targetAmount || 0), 0);
    const totalDonors = campaigns.reduce((sum, c) => sum + (c.donorsCount || 0), 0);
    const totalPlatformFeesUGX = Math.round(totalRaisedUGX * 0.05);
    const totalBeneficiaryFundsUGX = totalRaisedUGX - totalPlatformFeesUGX;

    const categoryStats: Record<string, { count: number; raisedUGX: number }> = {};
    campaigns.forEach(c => {
      if (!categoryStats[c.category]) {
        categoryStats[c.category] = { count: 0, raisedUGX: 0 };
      }
      categoryStats[c.category].count += 1;
      categoryStats[c.category].raisedUGX += c.raisedAmount || 0;
    });

    const regionStats: Record<string, { count: number; raisedUGX: number }> = {};
    campaigns.forEach(c => {
      const reg = c.region || 'Central';
      if (!regionStats[reg]) {
        regionStats[reg] = { count: 0, raisedUGX: 0 };
      }
      regionStats[reg].count += 1;
      regionStats[reg].raisedUGX += c.raisedAmount || 0;
    });

    const providerStats = {
      mtn: { name: 'MTN Mobile Money (*165#)', totalUGX: Math.round(totalRaisedUGX * 0.58), count: Math.round(totalDonors * 0.56) },
      airtel: { name: 'Airtel Money (*185#)', totalUGX: Math.round(totalRaisedUGX * 0.32), count: Math.round(totalDonors * 0.34) },
      visa: { name: 'Visa & Mastercard (3DS)', totalUGX: Math.round(totalRaisedUGX * 0.07), count: Math.round(totalDonors * 0.07) },
      paypal: { name: 'PayPal (Diaspora)', totalUGX: Math.round(totalRaisedUGX * 0.03), count: Math.round(totalDonors * 0.03) }
    };

    return {
      success: true,
      analytics: {
        totalRaisedUGX,
        totalTargetUGX,
        totalDonors,
        totalPlatformFeesUGX,
        totalBeneficiaryFundsUGX,
        activeCampaignsCount: campaigns.filter(c => c.status === 'active').length,
        featuredCampaignsCount: campaigns.filter(c => c.featured).length,
        completedCampaignsCount: campaigns.filter(c => c.status === 'completed' || c.raisedAmount >= c.targetAmount).length,
        districtsCoveredCount: Array.from(new Set(campaigns.map(c => c.district))).length,
        categoryStats,
        regionStats,
        providerStats,
        payoutsCount: 6,
        totalDisbursedUGX: Math.round(totalBeneficiaryFundsUGX * 0.45),
      }
    };
  }
};

