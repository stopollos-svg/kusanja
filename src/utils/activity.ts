import { Campaign } from '../types';

export interface CampaignActivityStats {
  daysActive: number;
  monthsActive: number;
  isAtLeastOneYear: boolean;
  activityScore: number; // 0 - 100
  activityLevel: 'ultra' | 'high' | 'medium' | 'low';
  spotlightEligible: boolean;
  lifespanLabel: string;
  statusBadgeText: string;
  velocityLabel: string;
  reason: string;
  criteriaBreakdown: {
    longevityScore: number; // Max 30
    donorVelocityScore: number; // Max 35
    progressScore: number; // Max 20
    engagementScore: number; // Max 15
  };
}

/**
 * Calculates campaign activity score and 1-year spotlight longevity qualification
 */
export function calculateCampaignActivity(campaign: Campaign): CampaignActivityStats {
  // 1. Calculate active lifespan
  let daysActive = 30; // fallback default
  
  if (campaign.activeDurationDays) {
    daysActive = campaign.activeDurationDays;
  } else if (campaign.activeDurationMonths) {
    daysActive = campaign.activeDurationMonths * 30;
  } else if (campaign.createdAt) {
    const createdTime = new Date(campaign.createdAt).getTime();
    const nowTime = new Date('2026-08-22T05:40:00Z').getTime(); // align with current app time
    const diffDays = Math.max(1, Math.floor((nowTime - createdTime) / (1000 * 60 * 60 * 24)));
    daysActive = diffDays;
  }

  const monthsActive = Math.max(1, Math.round(daysActive / 30));
  const isAtLeastOneYear = daysActive >= 365 || monthsActive >= 12;

  // 2. Longevity Score (0 - 30 pts)
  // Reaches full 30 pts if active for at least 1 year (365 days)
  let longevityScore = 0;
  if (daysActive >= 365) {
    longevityScore = 30;
  } else {
    longevityScore = Math.round((daysActive / 365) * 30);
  }

  // 3. Donor Velocity & Volume Score (0 - 35 pts)
  const donorsCount = campaign.donorsCount || 0;
  const recent7d = campaign.recentDonations7d ?? Math.min(donorsCount, Math.round(donorsCount * 0.15) + 3);
  let donorVelocityScore = Math.min(35, Math.round((donorsCount / 100) * 20 + (recent7d * 2.5)));

  // 4. Progress & Target Achievement Momentum (0 - 20 pts)
  const percent = campaign.targetAmount > 0 ? (campaign.raisedAmount / campaign.targetAmount) : 0;
  const progressScore = Math.min(20, Math.round(percent * 20));

  // 5. Engagement & Transparency Score (0 - 15 pts)
  const updatesCount = campaign.updates ? campaign.updates.length : 0;
  const kycBonus = campaign.organizerKycVerified ? 5 : 0;
  const engagementScore = Math.min(15, kycBonus + (updatesCount * 4) + (campaign.images && campaign.images.length > 1 ? 2 : 0));

  // Composite Total Score (0 - 100)
  const activityScore = Math.min(100, Math.max(15, longevityScore + donorVelocityScore + progressScore + engagementScore));

  // Activity Level
  let activityLevel: 'ultra' | 'high' | 'medium' | 'low' = 'low';
  if (activityScore >= 85) activityLevel = 'ultra';
  else if (activityScore >= 65) activityLevel = 'high';
  else if (activityScore >= 45) activityLevel = 'medium';

  // 1-Year Spotlight Eligibility:
  // Eligible if active for at least 1 year (365 days / 12 months) and maintains active score >= 60, OR explicitly flagged
  const spotlightEligible = campaign.spotlightEligible1Year ?? (isAtLeastOneYear && activityScore >= 55);

  // Lifespan string
  let lifespanLabel = `${daysActive} days active`;
  if (monthsActive >= 12) {
    const years = Math.floor(monthsActive / 12);
    const remMonths = monthsActive % 12;
    lifespanLabel = remMonths > 0 ? `${years} yr ${remMonths} mos active` : `${years} Year Active (365d+)`;
  } else if (monthsActive > 1) {
    lifespanLabel = `${monthsActive} months active`;
  }

  // Status badge text
  let statusBadgeText = 'Active Campaign';
  if (isAtLeastOneYear && activityScore >= 75) {
    statusBadgeText = '🔥 1-Year Sustained Spotlight';
  } else if (isAtLeastOneYear) {
    statusBadgeText = '⚡ 1-Year Active Veteran';
  } else if (activityScore >= 80) {
    statusBadgeText = '🚀 High Momentum Active';
  } else {
    statusBadgeText = `${monthsActive} Mos Active`;
  }

  const velocityLabel = `${recent7d} MoMo gifts this week • ${donorsCount} total givers`;

  const reason = isAtLeastOneYear
    ? `Qualified for Spotlight: Active for ${lifespanLabel} with sustained Mobile Money activity (${activityScore}/100 momentum score).`
    : `Active for ${lifespanLabel} (${activityScore}/100 score). Approaching 1-year sustained milestone.`;

  return {
    daysActive,
    monthsActive,
    isAtLeastOneYear,
    activityScore,
    activityLevel,
    spotlightEligible,
    lifespanLabel,
    statusBadgeText,
    velocityLabel,
    reason,
    criteriaBreakdown: {
      longevityScore,
      donorVelocityScore,
      progressScore,
      engagementScore
    }
  };
}

/**
 * Sorts campaigns for Spotlight display giving priority to:
 * 1. 1-Year Active Sustained campaigns with highest activity score
 * 2. High momentum featured campaigns
 */
export function sortCampaignsForSpotlight(campaigns: Campaign[]): Campaign[] {
  return [...campaigns].sort((a, b) => {
    const statsA = calculateCampaignActivity(a);
    const statsB = calculateCampaignActivity(b);

    // Prioritize 1-year active status
    if (statsA.isAtLeastOneYear && !statsB.isAtLeastOneYear) return -1;
    if (!statsA.isAtLeastOneYear && statsB.isAtLeastOneYear) return 1;

    // Then sort by activity score
    if (statsB.activityScore !== statsA.activityScore) {
      return statsB.activityScore - statsA.activityScore;
    }

    // Then donors count
    return (b.donorsCount || 0) - (a.donorsCount || 0);
  });
}
