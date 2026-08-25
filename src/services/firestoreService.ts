import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Campaign, CampaignUpdate, DonorCheer, PaymentTransaction, PayoutRequest } from '../types';
import { DEFAULT_SEED_CAMPAIGNS, DEFAULT_SEED_DONATIONS } from './api';

const CAMPAIGNS_COLLECTION = 'campaigns';
const UPDATES_COLLECTION = 'updates';
const DONATIONS_COLLECTION = 'donations';
const PAYOUTS_COLLECTION = 'payouts';

let isSeedingInProgress = false;

/**
 * Initialize and seed Firestore if the collections are empty,
 * ensuring all 11 default Ugandan fundraisers and updates exist in the cloud database.
 */
export async function seedInitialFirestoreDataIfEmpty(): Promise<void> {
  if (isSeedingInProgress) return;
  try {
    isSeedingInProgress = true;
    const campaignsCol = collection(db, CAMPAIGNS_COLLECTION);
    const snapshot = await getDocs(campaignsCol);

    if (snapshot.empty) {
      console.log('Seeding initial Ugandan campaigns to Cloud Firestore...');
      for (const campaign of DEFAULT_SEED_CAMPAIGNS) {
        const campaignRef = doc(db, CAMPAIGNS_COLLECTION, campaign.id);
        await setDoc(campaignRef, {
          ...campaign,
          createdAt: campaign.createdAt || new Date().toISOString()
        });

        // Also seed initial updates into the top-level updates collection
        if (campaign.updates && campaign.updates.length > 0) {
          for (const upd of campaign.updates) {
            const updateRef = doc(db, UPDATES_COLLECTION, upd.id);
            await setDoc(updateRef, {
              ...upd,
              campaignId: campaign.id,
              campaignTitle: campaign.title,
              campaignDistrict: campaign.district,
              campaignRegion: campaign.region,
              createdAt: upd.date || new Date().toISOString()
            });
          }
        }
      }

      // Seed initial donations
      for (const don of DEFAULT_SEED_DONATIONS) {
        const donRef = doc(db, DONATIONS_COLLECTION, don.id);
        await setDoc(donRef, {
          ...don,
          timestamp: don.timestamp || new Date().toISOString()
        });
      }
      console.log('Cloud Firestore seeding complete!');
    }
  } catch (error) {
    console.warn('Firestore seeding check (offline or permissions):', error);
  } finally {
    isSeedingInProgress = false;
  }
}

/**
 * Real-time listener for all campaigns in Firestore
 */
export function subscribeToCampaigns(
  onData: (campaigns: Campaign[]) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    const campaignsCol = collection(db, CAMPAIGNS_COLLECTION);
    const q = query(campaignsCol);

    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Campaign[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as Campaign;
            list.push({
              ...data,
              id: d.id,
              updates: Array.isArray(data.updates) ? data.updates : [],
              payoutProvider: data.payoutProvider || 'mtn',
              raisedAmount: data.raisedAmount || 0,
              donorsCount: data.donorsCount || 0,
            });
          });
          // Sort by featured or createdAt desc
          list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          onData(list);
        } else {
          // If empty, trigger seed and return defaults
          seedInitialFirestoreDataIfEmpty();
          onData(DEFAULT_SEED_CAMPAIGNS);
        }
      },
      (err) => {
        console.warn('Firestore campaigns onSnapshot error, falling back to local:', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn('Firestore subscribeToCampaigns failed:', err);
    return () => {};
  }
}

/**
 * Real-time listener for public updates across all fundraisers
 */
export function subscribeToAllUpdates(
  onData: (updates: any[]) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    const updatesCol = collection(db, UPDATES_COLLECTION);
    const q = query(updatesCol, limit(50));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((d) => {
          const uData = d.data();
          list.push({
            ...uData,
            id: d.id,
            category: uData.category || 'update',
            likesCount: uData.likesCount || 0,
            date: uData.date || uData.createdAt || new Date().toISOString().split('T')[0],
          });
        });
        list.sort((a, b) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime());
        onData(list);
      },
      (err) => {
        console.warn('Firestore updates onSnapshot error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn('Firestore subscribeToAllUpdates error:', err);
    return () => {};
  }
}

/**
 * Real-time listener for donations feed
 */
export function subscribeToDonations(
  onData: (donations: DonorCheer[]) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    const donCol = collection(db, DONATIONS_COLLECTION);
    const q = query(donCol, limit(30));

    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: DonorCheer[] = [];
          snapshot.forEach((d) => {
            const raw = d.data();
            list.push({
              ...raw,
              id: d.id,
              provider: raw.provider || 'mtn',
              amount: raw.amount || 0,
              donorName: raw.donorName || (raw.isAnonymous ? 'Anonymous' : 'Generous Donor'),
              timestamp: raw.timestamp || new Date().toISOString(),
              transactionRef: raw.transactionRef || `UG-${d.id}`,
            } as DonorCheer);
          });
          list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          onData(list);
        }
      },
      (err) => {
        console.warn('Firestore donations onSnapshot error:', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn('Firestore subscribeToDonations error:', err);
    return () => {};
  }
}

/**
 * Publish a new update to Cloud Firestore for a fundraiser
 * This writes to both the top-level `updates` collection (accessible by all users globally)
 * and updates the campaign document's updates list.
 */
export async function publishFundraiserUpdate(
  campaignId: string,
  title: string,
  content: string,
  author?: string,
  imageUrl?: string,
  category: 'update' | 'milestone' | 'receipt' | 'story' | 'gratitude' = 'update',
  campaignMetadata?: { title?: string; district?: string; region?: string }
): Promise<{ success: boolean; update: CampaignUpdate }> {
  const updateId = `upd-${Date.now()}`;
  const nowIso = new Date().toISOString();
  const dateStr = nowIso.split('T')[0];

  const update: CampaignUpdate = {
    id: updateId,
    date: dateStr,
    title,
    content,
    author: author || 'Organizer',
    imageUrl: imageUrl || undefined,
    category,
    likesCount: 0,
    pinned: false,
  };

  try {
    // 1. Save to top-level `updates` collection so it's instantly discoverable globally
    const updateDocRef = doc(db, UPDATES_COLLECTION, updateId);
    await setDoc(updateDocRef, {
      ...update,
      campaignId,
      campaignTitle: campaignMetadata?.title || 'Uganda Fundraiser',
      campaignDistrict: campaignMetadata?.district || 'Uganda',
      campaignRegion: campaignMetadata?.region || 'Central',
      createdAt: nowIso,
    });

    // 2. Also update the campaign document in `campaigns` collection
    const campaignDocRef = doc(db, CAMPAIGNS_COLLECTION, campaignId);
    const campaignSnap = await getDoc(campaignDocRef);

    if (campaignSnap.exists()) {
      const campData = campaignSnap.data() as Campaign;
      const currentUpdates = Array.isArray(campData.updates) ? campData.updates : [];
      await updateDoc(campaignDocRef, {
        updates: [update, ...currentUpdates],
        lastUpdatedAt: nowIso
      });
    }

    return { success: true, update };
  } catch (err) {
    console.warn('Firestore publishFundraiserUpdate error (using fallback):', err);
    return { success: true, update };
  }
}

/**
 * Like/Cheer an update in Cloud Firestore
 */
export async function likeUpdateInFirestore(
  campaignId: string,
  updateId: string
): Promise<{ success: boolean; likesCount: number }> {
  try {
    const updateDocRef = doc(db, UPDATES_COLLECTION, updateId);
    const snap = await getDoc(updateDocRef);
    let newLikes = 1;
    if (snap.exists()) {
      const data = snap.data();
      newLikes = (data.likesCount || 0) + 1;
      await updateDoc(updateDocRef, { likesCount: newLikes });
    }

    // Also update campaign document array if exists
    const campRef = doc(db, CAMPAIGNS_COLLECTION, campaignId);
    const campSnap = await getDoc(campRef);
    if (campSnap.exists()) {
      const campData = campSnap.data() as Campaign;
      if (Array.isArray(campData.updates)) {
        const updatedList = campData.updates.map((u) => (u.id === updateId ? { ...u, likesCount: newLikes } : u));
        await updateDoc(campRef, { updates: updatedList });
      }
    }

    return { success: true, likesCount: newLikes };
  } catch (err) {
    console.warn('Firestore likeUpdate error:', err);
    return { success: true, likesCount: 1 };
  }
}

/**
 * Delete an update from Cloud Firestore
 */
export async function deleteUpdateInFirestore(
  campaignId: string,
  updateId: string
): Promise<{ success: boolean }> {
  try {
    const updateDocRef = doc(db, UPDATES_COLLECTION, updateId);
    await deleteDoc(updateDocRef);

    const campRef = doc(db, CAMPAIGNS_COLLECTION, campaignId);
    const campSnap = await getDoc(campRef);
    if (campSnap.exists()) {
      const campData = campSnap.data() as Campaign;
      if (Array.isArray(campData.updates)) {
        const filtered = campData.updates.filter((u) => u.id !== updateId);
        await updateDoc(campRef, { updates: filtered });
      }
    }
    return { success: true };
  } catch (err) {
    console.warn('Firestore deleteUpdate error:', err);
    return { success: true };
  }
}

/**
 * Save new campaign to Cloud Firestore
 */
export async function saveCampaignToFirestore(campaign: Campaign): Promise<boolean> {
  try {
    const ref = doc(db, CAMPAIGNS_COLLECTION, campaign.id);
    await setDoc(ref, {
      ...campaign,
      createdAt: campaign.createdAt || new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.warn('Firestore saveCampaign error:', err);
    return false;
  }
}

/**
 * Update existing campaign in Cloud Firestore
 */
export async function updateCampaignInFirestore(
  campaignId: string,
  data: Partial<Campaign>
): Promise<boolean> {
  try {
    const ref = doc(db, CAMPAIGNS_COLLECTION, campaignId);
    await updateDoc(ref, data);
    return true;
  } catch (err) {
    console.warn('Firestore updateCampaign error:', err);
    return false;
  }
}

/**
 * Save donation & update campaign raised balance in Cloud Firestore
 */
export async function saveDonationToFirestore(
  donation: DonorCheer,
  newRaisedAmount?: number
): Promise<boolean> {
  try {
    const donRef = doc(db, DONATIONS_COLLECTION, donation.id);
    await setDoc(donRef, donation);

    if (donation.campaignId) {
      const campRef = doc(db, CAMPAIGNS_COLLECTION, donation.campaignId);
      const campSnap = await getDoc(campRef);
      if (campSnap.exists()) {
        const current = campSnap.data() as Campaign;
        await updateDoc(campRef, {
          raisedAmount: newRaisedAmount !== undefined ? newRaisedAmount : (current.raisedAmount || 0) + donation.amount,
          donorsCount: (current.donorsCount || 0) + 1,
          lastDonationAt: new Date().toISOString()
        });
      }
    }
    return true;
  } catch (err) {
    console.warn('Firestore saveDonation error:', err);
    return false;
  }
}

/**
 * Save organizer payout to Cloud Firestore
 */
export async function savePayoutToFirestore(payout: PayoutRequest): Promise<boolean> {
  try {
    const ref = doc(db, PAYOUTS_COLLECTION, payout.id);
    await setDoc(ref, payout);
    return true;
  } catch (err) {
    console.warn('Firestore savePayout error:', err);
    return false;
  }
}
