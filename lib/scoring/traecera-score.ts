export function calculateTraeceraScore(project: {
  ecosystem_verified?: boolean;
  social_verified?: boolean;
  product_verified?: boolean;
  status?: string;
  website?: string;
  x_link?: string;
  description?: string;
  logo?: string;
  tracking_mode?: string;
  data_source?: string;
  active_users?: number;
}): {
  total: number;
  breakdown: {
    verification: number;
    status: number;
    completeness: number;
    onchain: number;
    activity: number;
  };
} {
  // 1. Verification Score (30 points max)
  let verification = 0;
  if (project.ecosystem_verified) verification += 15;
  if (project.social_verified) verification += 8;
  if (project.product_verified) verification += 7;

  // 2. Status Score (15 points max)
  let statusScore = 0;
  if (project.status === 'Live') statusScore = 15;
  else if (project.status === 'Beta') statusScore = 8;
  else if (project.status === 'Coming Soon') statusScore = 3;

  // 3. Data Completeness Score (25 points max)
  let completeness = 0;
  if (project.website) completeness += 8;
  if (project.x_link) completeness += 5;
  if (project.description && project.description.length > 100) completeness += 7;
  if (project.logo && !project.logo.includes('unavatar')) completeness += 5;

  // 4. On-chain Score (20 points max)
  let onchain = 0;
  if (project.tracking_mode === 'program') onchain = 20;
  else if (project.tracking_mode === 'wallet') onchain = 10;
  
  if (project.data_source === 'onchain_verified') onchain += 5;
  if (onchain > 20) onchain = 20; // Cap at 20 as requested

  // 5. Activity Score (10 points max)
  let activity = 0;
  const users = project.active_users || 0;
  if (users > 1000) activity = 10;
  else if (users > 100) activity = 5;
  else if (users > 0) activity = 2;

  let total = verification + statusScore + completeness + onchain + activity;
  if (total > 100) total = 100;

  // Round to 1 decimal
  total = Math.round(total * 10) / 10;

  return {
    total,
    breakdown: {
      verification,
      status: statusScore,
      completeness,
      onchain,
      activity
    }
  };
}
