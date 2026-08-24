import { Campaign } from '../types';

export interface CampaignUrgencyInfo {
  isUrgent: boolean;
  isEndingSoon: boolean; // Ending within 48 hours (daysRemaining <= 2)
  isNearTarget: boolean; // Reached >= 80% of goal
  urgencyType: 'critical_both' | 'ending_48h' | 'near_target' | 'none';
  badgeLabel: string;
  badgeSubtext: string;
  hoursRemainingApprox: number;
  percentage: number;
  remainingAmountUGX: number;
  severity: 'critical' | 'high' | 'moderate' | 'none';
}

/**
 * Calculates whether a campaign qualifies as urgent:
 * 1. Ending within the next 48 hours (daysRemaining <= 2 or <= 48h)
 * 2. Reaching its target (>= 80% raised and remaining amount is within final reach)
 */
export function getCampaignUrgencyInfo(campaign: Campaign): CampaignUrgencyInfo {
  const percentage = campaign.targetAmount > 0 
    ? Math.round((campaign.raisedAmount / campaign.targetAmount) * 100) 
    : 0;

  const remainingAmountUGX = Math.max(0, campaign.targetAmount - campaign.raisedAmount);

  // Ending within 48 hours (daysRemaining <= 2)
  const isEndingSoon = campaign.daysRemaining !== undefined && campaign.daysRemaining <= 2 && campaign.daysRemaining >= 0;
  
  // Hours remaining estimation
  const hoursRemainingApprox = isEndingSoon 
    ? Math.max(4, Math.round(campaign.daysRemaining * 24)) 
    : (campaign.daysRemaining || 30) * 24;

  // Reached at least 80% of target
  const isNearTarget = percentage >= 80 && remainingAmountUGX > 0;

  let isUrgent = false;
  let urgencyType: 'critical_both' | 'ending_48h' | 'near_target' | 'none' = 'none';
  let badgeLabel = '';
  let badgeSubtext = '';
  let severity: 'critical' | 'high' | 'moderate' | 'none' = 'none';

  if (isEndingSoon && isNearTarget) {
    isUrgent = true;
    urgencyType = 'critical_both';
    severity = 'critical';
    badgeLabel = `⚡ Final ${hoursRemainingApprox}h • ${percentage}% Reached`;
    badgeSubtext = `Ends in ${campaign.daysRemaining === 1 ? '24 hours' : `${hoursRemainingApprox} hours`} with only ${percentage}% to target`;
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
    badgeLabel = `🎯 ${percentage}% Raised • Final Push`;
    badgeSubtext = `Only ${(100 - percentage)}% remaining to reach 100% goal`;
  }

  return {
    isUrgent,
    isEndingSoon,
    isNearTarget,
    urgencyType,
    badgeLabel,
    badgeSubtext,
    hoursRemainingApprox,
    percentage,
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
