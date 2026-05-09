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
}): {
  total: number;
  breakdown: {
    verification: number;
    status: number;
    completeness: number;
    onchain: number;
  };
} {
  // 1. Verification Score (40 points max)
  let verification = 0;
  if (project.ecosystem_verified) verification += 20;
  if (project.social_verified) verification += 10;
  if (project.product_verified) verification += 10;

  // 2. Status Score (20 points max)
  let statusScore = 0;
  if (project.status === 'Live') statusScore = 20;
  else if (project.status === 'Beta') statusScore = 10;
  else if (project.status === 'Coming Soon') statusScore = 5;

  // 3. Data Completeness Score (20 points max)
  let completeness = 0;
  if (project.website) completeness += 5;
  if (project.x_link) completeness += 5;
  if (project.description) completeness += 5;
  if (project.logo) completeness += 5;

  // 4. On-chain Score (20 points max)
  let onchain = 0;
  if (project.tracking_mode === 'program') onchain = 20;
  else if (project.tracking_mode === 'wallet') onchain = 10;
  else if (project.tracking_mode === 'none') onchain = 0;

  let total = verification + statusScore + completeness + onchain;
  if (total > 100) total = 100;

  // Round to 1 decimal
  total = Math.round(total * 10) / 10;

  return {
    total,
    breakdown: {
      verification,
      status: statusScore,
      completeness,
      onchain
    }
  };
}
