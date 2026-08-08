import { Building2, Rocket } from 'lucide-react';
import type { DirectoryTier } from '../data/projects';

interface TierBadgeProps {
  tier: DirectoryTier;
  /** Icon + text size in px (badge text stays mono/uppercase from `.badge`). */
  iconSize?: number;
  className?: string;
}

/**
 * Two-Tier Ecosystem Registry badge.
 * - Institutional → amber/gold, Building2 icon.
 * - Innovation    → Solana purple (#9945FF), Rocket icon.
 * Builds on the shared `.badge` class for pill shape + mono/uppercase treatment.
 */
export default function TierBadge({ tier, iconSize = 12, className = '' }: TierBadgeProps) {
  const isInstitutional = tier === 'institutional';

  const tone = isInstitutional
    ? 'bg-amber-400/10 text-amber-300 border-amber-400/30'
    : 'bg-[#9945FF]/10 text-[#9945FF] border-[#9945FF]/30';

  return (
    <span className={`badge gap-1.5 ${tone} ${className}`}>
      {isInstitutional ? <Building2 size={iconSize} /> : <Rocket size={iconSize} />}
      {isInstitutional ? 'Institutional' : 'Innovation'}
    </span>
  );
}
