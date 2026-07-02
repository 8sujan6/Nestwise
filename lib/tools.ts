import { FunctionDeclaration, Type } from "@google/genai";

// ─── Gemini Tool / Function Declarations ─────────────────────────────────────
// These are registered with Gemini so it knows what tools are available.

export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: "search_listings",
    description:
      "Search for available property listings that match the user's city, budget, and bedroom requirements. Always call this first.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        city: {
          type: Type.STRING,
          description: "The city to search properties in (e.g. 'Austin')",
        },
        budget: {
          type: Type.NUMBER,
          description: "Maximum property price in USD",
        },
        bedrooms: {
          type: Type.NUMBER,
          description: "Minimum number of bedrooms required",
        },
      },
      required: ["city", "budget", "bedrooms"],
    },
  },
  {
    name: "get_neighborhood_info",
    description:
      "Get neighborhood details for a specific property address, including school rating, crime level, walkability score, and nearby amenities.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        address: {
          type: Type.STRING,
          description: "The full street address of the property",
        },
      },
      required: ["address"],
    },
  },
  {
    name: "get_commute_time",
    description:
      "Get the estimated commute time in minutes from a property to the city center / downtown.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        address: {
          type: Type.STRING,
          description: "The full street address of the property",
        },
      },
      required: ["address"],
    },
  },
  {
    name: "get_price_history",
    description:
      "Get the 5-year price appreciation history and investment trend for a property.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        address: {
          type: Type.STRING,
          description: "The full street address of the property",
        },
      },
      required: ["address"],
    },
  },
];
