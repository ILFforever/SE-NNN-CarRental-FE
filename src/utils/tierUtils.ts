/**
 * Calculate the tier name based on the numeric tier value
 * 
 * @param tier Numeric tier value
 * @returns The display name of the tier
 */
export function getTierName(tier: number): string {
    // Basic tier mapping
    const tierNames = [
      'Bronze',     // tier 0
      'Silver',     // tier 1
      'Gold',       // tier 2
      'Platinum',   // tier 3
      'Diamond'     // tier 4
    ];
  
    // If tier is within the basic range, return the corresponding name
    if (tier >= 0 && tier < tierNames.length) {
      return tierNames[tier];
    }
    
    // For tiers beyond Diamond (tier 4), add the level number
    // e.g., Diamond 2, Diamond 3, etc.
    if (tier >= tierNames.length) {
      const diamondLevel = tier - tierNames.length + 2; // +2 because Diamond 2 starts at tier 5
      return `Diamond ${diamondLevel}`;
    }
    
    // Fallback for negative tiers (shouldn't occur in normal usage)
    return 'Unknown';
  }
  
  /**
   * Get a CSS color class based on the tier
   * 
   * @param tier Numeric tier value
   * @returns CSS class name for the tier
   */
  export function getTierColorClass(tier: number): string {
    switch (true) {
      case tier === 0:
        return 'text-yellow-700'; // Bronze
      case tier === 1:
        return 'text-gray-500'; // Silver
      case tier === 2:
        return 'text-yellow-500'; // Gold
      case tier === 3:
        return 'text-blue-400'; // Platinum
      case tier >= 4:
        return 'text-teal-500'; // Diamond and higher
      default:
        return 'text-gray-700'; // Default fallback
    }
  }
  
  /**
   * Get a text description of the tier benefits
   * 
   * @param tier Numeric tier value
   * @returns Description of the tier benefits
   */
  export function getTierBenefits(tier: number): string {
    const tierName = getTierName(tier);
    
    switch (true) {
      case tier === 0:
        return `${tierName} members enjoy standard rental privileges.`;
      case tier === 1:
        return `${tierName} members receive 5% discount on rentals and priority booking.`;
      case tier === 2:
        return `${tierName} members receive 10% discount and access to premium vehicles.`;
      case tier === 3:
        return `${tierName} members enjoy 15% discount, free upgrades, and concierge service.`;
      case tier >= 4:
        return `${tierName} members receive 20% discount, free upgrades, concierge service, and exclusive access to luxury fleet.`;
      default:
        return 'Standard membership benefits.';
    }
  }