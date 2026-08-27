import { Campaign } from '../types';
import { formatUGX } from './formatters';

export interface CampaignUrgencyInfo {
  isUrgent: boolean;
  isEndingSoon: boolean; // Ending within 48 hours (daysRemaining <= 2)
  isNearTarget: boolean; // Close to target
  urgencyType: 'critical_both' | 'ending_48h' | 'near_target' | 'none';
  badgeLabel: string;
  badgeSubtext: string;
  hoursRemainingApprox: number;
  remainingAmountUGX: number;
  severity: 'critical' | 'high' | 'moderate' | 'none';
}

/**
 * Calculates whether a campaign qualifies as urgent:
 * 1. Ending within the next 48 hours (daysRemaining <= 2 or <= 48h)
 * 2. Reaching its target (remaining amount is within final reach)
 */
export function getCampaignUrgencyInfo(campaign: Campaign): CampaignUrgencyInfo {
  const remainingAmountUGX = Math.max(0, campaign.targetAmount - campaign.raisedAmount);

  // Ending within 48 hours (daysRemaining <= 2)
  const isEndingSoon = campaign.daysRemaining !== undefined && campaign.daysRemaining <= 2 && campaign.daysRemaining >= 0;
  
  // Hours remaining estimation
  const hoursRemainingApprox = isEndingSoon 
    ? Math.max(4, Math.round(campaign.daysRemaining * 24)) 
    : (campaign.daysRemaining || 30) * 24;

  // Reached near target (remaining amount <= 20% of target or <= 500,000 UGX)
  const isNearTarget = (campaign.targetAmount > 0 && remainingAmountUGX > 0 && remainingAmountUGX <= campaign.targetAmount * 0.2);

  let isUrgent = false;
  let urgencyType: 'critical_both' | 'ending_48h' | 'near_target' | 'none' = 'none';
  let badgeLabel = '';
  let badgeSubtext = '';
  let severity: 'critical' | 'high' | 'moderate' | 'none' = 'none';

  if (isEndingSoon && isNearTarget) {
    isUrgent = true;
    urgencyType = 'critical_both';
    severity = 'critical';
    badgeLabel = `⚡ Final ${hoursRemainingApprox}h • ${formatUGX(remainingAmountUGX)} Needed`;
    badgeSubtext = `Ends in ${campaign.daysRemaining === 1 ? '24 hours' : `${hoursRemainingApprox} hours`} with ${formatUGX(remainingAmountUGX)} to complete target`;
  } else if (isEndingSoon) {
    isUrgent = true;
    urgencyType = 'ending_48h';
    severity = 'high';
    badgeLabel = campaign.daysRemaining <= 1 ? '⚡ Ends in 24 Hours' : `⚡ Ends in ${hoursRemainingApprox}h (48h Window)`;
    badgeSubtext = `Time-sensitive: Closing in ${campaign.daysRemaining === 1 ? '1 day' : '2 days'}`;
  } else if (isNearTarget) {
    isUrgent = true;
    urgencyType = 'near_target';
    severity = 'moderate';
    badgeLabel = `🎯 ${formatUGX(remainingAmountUGX)} Remaining • Final Push`;
    badgeSubtext = `Only ${formatUGX(remainingAmountUGX)} needed to fulfill target goal`;
  }

  return {
    isUrgent,
    isEndingSoon,
    isNearTarget,
    urgencyType,
    badgeLabel,
    badgeSubtext,
    hoursRemainingApprox,
    remainingAmountUGX,
    severity
  };
}

/**
 * Filter campaigns by urgency
 */
export function filterUrgentCampaigns(campaigns: Campaign[]): Campaign[] {
  return campaigns.filter(c => {
    const urgency = getCampaignUrgencyInfo(c);
    return urgency.isUrgent;
  });
}
