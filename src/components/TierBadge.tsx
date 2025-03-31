'use client';

import { getTierName, getTierColorClass } from '@/utils/tierUtils';

interface TierBadgeProps {
  tier: number;
  showLabel?: boolean;
  className?: string;
}

export default function TierBadge({ tier, showLabel = true, className = '' }: TierBadgeProps) {
  // Get the background color class based on tier
  const getBgColorClass = (tier: number): string => {
    switch (true) {
      case tier === 0:
        return 'bg-yellow-100'; // Bronze
      case tier === 1:
        return 'bg-gray-100'; // Silver
      case tier === 2:
        return 'bg-yellow-50'; // Gold
      case tier === 3:
        return 'bg-blue-50'; // Platinum
      case tier >= 4:
        return 'bg-teal-50'; // Diamond and higher
      default:
        return 'bg-gray-100'; // Default fallback
    }
  };

  const tierName = getTierName(tier);
  const textColorClass = getTierColorClass(tier);
  const bgColorClass = getBgColorClass(tier);

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${textColorClass} ${bgColorClass} ${className}`}
    >
      {showLabel ? (
        <>
          <span className="mr-1 font-bold">Tier:</span> 
          {tierName}
        </>
      ) : (
        tierName
      )}
    </span>
  );
}