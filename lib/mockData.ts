import {
  PropertyListing,
  NeighborhoodInfo,
  CommuteTimeResult,
  PriceHistoryResult,
} from "./types";

// ─── Mock Property Listings ───────────────────────────────────────────────────

export const MOCK_LISTINGS: PropertyListing[] = [
  {
    id: "prop_001",
    address: "4821 Maple Grove Dr, Austin, TX 78701",
    price: 485000,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1850,
    imageUrl:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80",
    propertyType: "Single Family",
  },
  {
    id: "prop_002",
    address: "2210 Riverside Blvd, Austin, TX 78703",
    price: 620000,
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 2400,
    imageUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
    propertyType: "Single Family",
  },
  {
    id: "prop_003",
    address: "890 Lakeview Ct, Austin, TX 78735",
    price: 395000,
    bedrooms: 2,
    bathrooms: 2,
    squareFeet: 1320,
    imageUrl:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
    propertyType: "Condo",
  },
  {
    id: "prop_004",
    address: "3344 Cedar Ridge Ln, Austin, TX 78745",
    price: 540000,
    bedrooms: 3,
    bathrooms: 2,
    squareFeet: 1975,
    imageUrl:
      "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=600&q=80",
    propertyType: "Single Family",
  },
  {
    id: "prop_005",
    address: "7102 Sunset Hills Rd, Austin, TX 78759",
    price: 710000,
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 2800,
    imageUrl:
      "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=600&q=80",
    propertyType: "Single Family",
  },
];

// ─── Mock Neighborhood Info ───────────────────────────────────────────────────

const NEIGHBORHOOD_DATA: Record<string, NeighborhoodInfo> = {
  prop_001: {
    schoolRating: 9,
    crimeLevel: "Low",
    walkabilityScore: 72,
    nearbyParks: 4,
    groceryStores: 3,
  },
  prop_002: {
    schoolRating: 8,
    crimeLevel: "Low",
    walkabilityScore: 85,
    nearbyParks: 6,
    groceryStores: 5,
  },
  prop_003: {
    schoolRating: 6,
    crimeLevel: "Moderate",
    walkabilityScore: 91,
    nearbyParks: 2,
    groceryStores: 7,
  },
  prop_004: {
    schoolRating: 7,
    crimeLevel: "Low",
    walkabilityScore: 65,
    nearbyParks: 3,
    groceryStores: 2,
  },
  prop_005: {
    schoolRating: 9,
    crimeLevel: "Low",
    walkabilityScore: 58,
    nearbyParks: 5,
    groceryStores: 4,
  },
};

// ─── Mock Commute Times ───────────────────────────────────────────────────────

const COMMUTE_DATA: Record<string, CommuteTimeResult> = {
  prop_001: { commuteMinutes: 18 },
  prop_002: { commuteMinutes: 25 },
  prop_003: { commuteMinutes: 12 },
  prop_004: { commuteMinutes: 35 },
  prop_005: { commuteMinutes: 28 },
};

// ─── Mock Price History ───────────────────────────────────────────────────────

const PRICE_HISTORY_DATA: Record<string, PriceHistoryResult> = {
  prop_001: { fiveYearGrowthPercent: 42, appreciationTrend: "Strong" },
  prop_002: { fiveYearGrowthPercent: 38, appreciationTrend: "Strong" },
  prop_003: { fiveYearGrowthPercent: 21, appreciationTrend: "Moderate" },
  prop_004: { fiveYearGrowthPercent: 29, appreciationTrend: "Moderate" },
  prop_005: { fiveYearGrowthPercent: 11, appreciationTrend: "Slow" },
};

// ─── Lookup Helpers ───────────────────────────────────────────────────────────

/** Find which mock property id matches an address string */
function findIdByAddress(address: string): string | undefined {
  const normalized = address.toLowerCase().trim();
  return MOCK_LISTINGS.find((p) =>
    p.address.toLowerCase().includes(normalized.substring(0, 15))
  )?.id;
}

export function getMockNeighborhoodInfo(address: string): NeighborhoodInfo {
  const id = findIdByAddress(address);
  if (id && NEIGHBORHOOD_DATA[id]) return NEIGHBORHOOD_DATA[id];
  // Fallback: generate plausible random-ish data
  return {
    schoolRating: 7,
    crimeLevel: "Moderate",
    walkabilityScore: 68,
    nearbyParks: 3,
    groceryStores: 3,
  };
}

export function getMockCommuteTime(address: string): CommuteTimeResult {
  const id = findIdByAddress(address);
  if (id && COMMUTE_DATA[id]) return COMMUTE_DATA[id];
  return { commuteMinutes: 22 };
}

export function getMockPriceHistory(address: string): PriceHistoryResult {
  const id = findIdByAddress(address);
  if (id && PRICE_HISTORY_DATA[id]) return PRICE_HISTORY_DATA[id];
  return { fiveYearGrowthPercent: 25, appreciationTrend: "Moderate" };
}

/** Filter mock listings by search criteria */
export function filterMockListings(
  city: string,
  budget: number,
  bedrooms: number
): PropertyListing[] {
  return MOCK_LISTINGS.filter((p) => {
    const cityMatch = p.address.toLowerCase().includes(city.toLowerCase());
    const budgetMatch = p.price <= budget;
    const bedroomMatch = p.bedrooms >= bedrooms;
    return cityMatch && budgetMatch && bedroomMatch;
  });
}
