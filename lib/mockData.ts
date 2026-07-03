import {
  PropertyListing,
  NeighborhoodInfo,
  CommuteTimeResult,
  PriceHistoryResult,
} from "./types";

import propertiesData from "../mock_data/properties.json";
import neighborhoodsData from "../mock_data/neighborhoods.json";
import commuteData from "../mock_data/commute.json";
import priceHistoryData from "../mock_data/price-history.json";

const MOCK_LISTINGS = propertiesData as PropertyListing[];
const NEIGHBORHOOD_DATA = neighborhoodsData as NeighborhoodInfo[];
const COMMUTE_DATA = commuteData as CommuteTimeResult[];
const PRICE_HISTORY_DATA = priceHistoryData as PriceHistoryResult[];

function verifyDatasetsLoaded(): void {
  if (!MOCK_LISTINGS || !Array.isArray(MOCK_LISTINGS)) {
    throw new Error("Failed to load properties dataset.");
  }
  if (!NEIGHBORHOOD_DATA || !Array.isArray(NEIGHBORHOOD_DATA)) {
    throw new Error("Failed to load neighborhoods dataset.");
  }
  if (!COMMUTE_DATA || !Array.isArray(COMMUTE_DATA)) {
    throw new Error("Failed to load commute dataset.");
  }
  if (!PRICE_HISTORY_DATA || !Array.isArray(PRICE_HISTORY_DATA)) {
    throw new Error("Failed to load price history dataset.");
  }
}

export function filterMockListings(
  city: string,
  minPrice?: number,
  maxPrice?: number,
  bedrooms?: number,
  bathrooms?: number,
  propertyType?: string
): PropertyListing[] {
  verifyDatasetsLoaded();

  if (!city) {
    throw new Error("City parameter is required for searching listings.");
  }

  const results = MOCK_LISTINGS.filter((p) => {
    if (city && p.city && !p.city.toLowerCase().includes(city.toLowerCase())) return false;
    if (minPrice !== undefined && minPrice !== null && p.listingPrice < minPrice) return false;
    if (maxPrice !== undefined && maxPrice !== null && p.listingPrice > maxPrice) return false;
    if (bedrooms !== undefined && bedrooms !== null && p.bedrooms < bedrooms) return false;
    if (bathrooms !== undefined && bathrooms !== null && p.bathrooms < bathrooms) return false;
    if (
      propertyType &&
      propertyType.toLowerCase() !== "any" &&
      !p.propertyType.toLowerCase().includes(propertyType.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  if (results.length === 0) {
    throw new Error("No property listings found matching the specified filters.");
  }

  const sorted = [...results]
    .sort((a, b) => {
      if (maxPrice !== undefined && maxPrice !== null) {
        return b.listingPrice - a.listingPrice; // Closest to max budget first
      }
      return a.listingPrice - b.listingPrice; // Cheapest first
    })
    .slice(0, 15);

  return sorted.map((p) => ({
    id: p.id,
    address: p.address,
    city: p.city,
    propertyType: p.propertyType,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    listingPrice: p.listingPrice,
    squareFeet: p.squareFeet,
  } as unknown as PropertyListing));
}

export function getFullPropertyDetails(propertyId: string): PropertyListing {
  verifyDatasetsLoaded();
  const prop = MOCK_LISTINGS.find((p) => p.id === propertyId);
  if (!prop) {
    throw new Error(`Property ID ${propertyId} not found.`);
  }
  return prop;
}

export function getMockNeighborhoodInfo(propertyId: string): NeighborhoodInfo {
  verifyDatasetsLoaded();
  if (!propertyId) {
    throw new Error("Property ID is required.");
  }
  const info = NEIGHBORHOOD_DATA.find((n) => n.propertyId === propertyId);
  if (!info) {
    throw new Error(`Invalid property ID: ${propertyId}. No neighborhood data found.`);
  }
  return info;
}

export function getMockCommuteTime(propertyId: string): CommuteTimeResult {
  verifyDatasetsLoaded();
  if (!propertyId) {
    throw new Error("Property ID is required.");
  }
  const info = COMMUTE_DATA.find((c) => c.propertyId === propertyId);
  if (!info) {
    throw new Error(`Invalid property ID: ${propertyId}. No commute data found.`);
  }
  return info;
}

export function getMockPriceHistory(propertyId: string): PriceHistoryResult {
  verifyDatasetsLoaded();
  if (!propertyId) {
    throw new Error("Property ID is required.");
  }
  const info = PRICE_HISTORY_DATA.find((p) => p.propertyId === propertyId);
  if (!info) {
    throw new Error(`Invalid property ID: ${propertyId}. No price history data found.`);
  }
  return info;
}
