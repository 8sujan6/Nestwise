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
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
}

export interface NeighborhoodInfoInput {
  propertyId: string;
}

export interface CommuteTimeInput {
  propertyId: string;
}

export interface PriceHistoryInput {
  propertyId: string;
}

// ─── Dataset Interfaces ──────────────────────────────────────────────────────

export interface PropertyListing {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  lotSizeAcres: number;
  yearBuilt: number;
  listingPrice: number;
  estimatedValue: number;
  hoaFee: number;
  parkingSpaces: number;
  daysOnMarket: number;
  description: string;
}

export interface NeighborhoodInfo {
  propertyId: string;
  schoolRating: number;
  crimeLevel: string;
  walkability: number;
  transitScore: number;
  parksNearby: number;
  groceryStores: number;
  restaurantsNearby: number;
  hospitalDistanceKm: number;
  internet: string;
  noiseLevel: string;
  medianHouseholdIncome: number;
}

export interface CommuteTimeResult {
  propertyId: string;
  downtownMinutes: number;
  airportMinutes: number;
  businessDistrictMinutes: number;
  universityMinutes: number;
}

export interface PriceHistoryResult {
  propertyId: string;
  fiveYearGrowthPercent: number;
  averageAnnualGrowthPercent: number;
  trend: string;
  investmentRating: string;
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

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  recommendations?: RankedProperty[];
}

export interface ChatAgentRequest {
  messages: {
    role: "user" | "assistant" | "tool" | "system";
    content: string | null;
    tool_calls?: {
      id: string;
      type: "function";
      function: {
        name: string;
        arguments: string;
      };
    }[];
    tool_call_id?: string;
  }[];
  currentPreferences: SearchFormData;
}
