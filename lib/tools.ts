export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<
        string,
        {
          type: "string" | "number" | "boolean";
          description: string;
        }
      >;
      required: string[];
    };
  };
}

export const toolDeclarations: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "search_listings",
      description: "Search for available property listings. Always call this first to discover properties.",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "The city name to search properties in, for example Austin.",
          },
          minPrice: {
            type: "number",
            description: "Minimum property price in USD.",
          },
          maxPrice: {
            type: "number",
            description: "Maximum property price in USD.",
          },
          bedrooms: {
            type: "number",
            description: "Minimum number of bedrooms required.",
          },
          bathrooms: {
            type: "number",
            description: "Minimum number of bathrooms required.",
          },
          propertyType: {
            type: "string",
            description: "The type of property, such as Single Family or Condo.",
          },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_neighborhood_info",
      description: "Get neighborhood details for a specific property ID, including school rating, crime level, walkability score, and nearby amenities.",
      parameters: {
        type: "object",
        properties: {
          propertyId: {
            type: "string",
            description: "The unique ID of the property, for example PROP-0001.",
          },
        },
        required: ["propertyId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_commute_time",
      description: "Get estimated commute times from a property to key destinations (downtown, airport, business district, university) by property ID.",
      parameters: {
        type: "object",
        properties: {
          propertyId: {
            type: "string",
            description: "The unique ID of the property, for example PROP-0001.",
          },
        },
        required: ["propertyId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_price_history",
      description: "Get the 5-year price appreciation history, average growth, and investment rating for a property by property ID.",
      parameters: {
        type: "object",
        properties: {
          propertyId: {
            type: "string",
            description: "The unique ID of the property, for example PROP-0001.",
          },
        },
        required: ["propertyId"],
      },
    },
  },
];
