// ─── Search Form Input ───────────────────────────────────────────────────────

export interface SearchFormData {
  city: string;
  budget: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  maxCommuteTime: number;
  priorities: Priority[];
}

export type Priority =
  | "good_schools"
  | "low_crime"
  | "walkability"
  | "investment_potential";

// ─── Tool Inputs ─────────────────────────────────────────────────────────────

export interface SearchListingsInput {
  city: string;
  budget: number;
  bedrooms: number;
}

export interface NeighborhoodInfoInput {
  address: string;
}

export interface CommuteTimeInput {
  address: string;
}

export interface PriceHistoryInput {
  address: string;
}

// ─── Tool Outputs ─────────────────────────────────────────────────────────────

export interface PropertyListing {
  id: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  imageUrl: string;
  propertyType: string;
}

export interface NeighborhoodInfo {
  schoolRating: number; // 1–10
  crimeLevel: "Low" | "Moderate" | "High";
  walkabilityScore: number; // 0–100
  nearbyParks: number;
  groceryStores: number;
}

export interface CommuteTimeResult {
  commuteMinutes: number;
}

export interface PriceHistoryResult {
  fiveYearGrowthPercent: number;
  appreciationTrend: "Strong" | "Moderate" | "Slow";
}

// ─── Ranked Result ────────────────────────────────────────────────────────────

export interface RankedProperty {
  property: PropertyListing;
  score: number;
  reasons: string[];
  neighborhood?: NeighborhoodInfo;
  commute?: CommuteTimeResult;
  priceHistory?: PriceHistoryResult;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface AgentResponse {
  recommendations: RankedProperty[];
  summary: string;
  error?: string;
}
