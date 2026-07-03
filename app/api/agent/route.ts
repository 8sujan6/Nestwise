import { NextRequest } from "next/server";
import { callGroq, GroqMessage } from "@/lib/groq";
import { toolDeclarations } from "@/lib/tools";
import { SYSTEM_PROMPT } from "@/lib/prompts";
import {
  filterMockListings,
  getMockNeighborhoodInfo,
  getMockCommuteTime,
  getMockPriceHistory,
  getFullPropertyDetails,
} from "@/lib/mockData";
import { ChatAgentRequest, AgentResponse } from "@/lib/types";
import { validateRequestSize } from "@/lib/tokenHelper";

function executeTool(
  toolName: string,
  args: Record<string, unknown>
): unknown {
  try {
    switch (toolName) {
      case "search_listings": {
        const listings = filterMockListings(
          String(args.city ?? ""),
          args.minPrice !== undefined && args.minPrice !== null ? Number(args.minPrice) : undefined,
          args.maxPrice !== undefined && args.maxPrice !== null ? Number(args.maxPrice) : undefined,
          args.bedrooms !== undefined && args.bedrooms !== null ? Number(args.bedrooms) : undefined,
          args.bathrooms !== undefined && args.bathrooms !== null ? Number(args.bathrooms) : undefined,
          args.propertyType !== undefined && args.propertyType !== null ? String(args.propertyType) : undefined
        );
        return { listings };
      }

      case "get_neighborhood_info": {
        const info = getMockNeighborhoodInfo(String(args.propertyId ?? ""));
        return {
          schoolRating: info.schoolRating,
          crimeLevel: info.crimeLevel,
          walkability: info.walkability,
          restaurantsNearby: info.restaurantsNearby,
          parksNearby: info.parksNearby,
          hospitalDistanceKm: info.hospitalDistanceKm,
          internet: info.internet,
        };
      }

      case "get_commute_time": {
        const commute = getMockCommuteTime(String(args.propertyId ?? ""));
        return {
          downtownMinutes: commute.downtownMinutes,
          airportMinutes: commute.airportMinutes,
          businessDistrictMinutes: commute.businessDistrictMinutes,
          universityMinutes: commute.universityMinutes,
        };
      }

      case "get_price_history": {
        const history = getMockPriceHistory(String(args.propertyId ?? ""));
        return {
          fiveYearGrowthPercent: history.fiveYearGrowthPercent,
          averageAnnualGrowthPercent: history.averageAnnualGrowthPercent,
          trend: history.trend,
          investmentRating: history.investmentRating,
        };
      }

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "An error occurred during tool execution." };
  }
}

function translateError(err: unknown): string {
  const message = err instanceof Error ? err.message : "Unknown error";
  if (message.includes("429") || message.includes("rate_limit")) {
    return "The AI service is currently busy. Please wait a few seconds and try again.";
  }
  if (message.includes("401") || message.includes("auth") || message.includes("credentials")) {
    return "Unable to contact the AI service due to authentication issues. Please check the environment variables.";
  }
  if (message.includes("413") || message.includes("too large") || message.includes("context_length")) {
    return "The search criteria resulted in a query that is too large. Please narrow down your search constraints.";
  }
  if (message.includes("fetch") || message.includes("network") || message.includes("connect")) {
    return "Unable to contact the AI service. Please check your network connection and try again.";
  }
  return "An unexpected error occurred. Please adjust your criteria and try again.";
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendProgress = (status: string) => {
        controller.enqueue(
          encoder.encode(JSON.stringify({ type: "progress", status }) + "\n")
        );
      };

      try {
        const body: ChatAgentRequest = await req.json();
        const { messages, currentPreferences } = body;

        if (!currentPreferences.city || !currentPreferences.budget || !currentPreferences.bedrooms) {
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "result",
                data: {
                  recommendations: [],
                  summary: "",
                  error: "Missing required fields: city, budget, bedrooms",
                },
              }) + "\n"
            )
          );
          controller.close();
          return;
        }

        const history: GroqMessage[] = [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ];

        let finalText = "";
        const MAX_ITERATIONS = 20;
        let iterations = 0;

        sendProgress("searching");

        while (iterations < MAX_ITERATIONS) {
          iterations++;

          const messagesToSend: GroqMessage[] = [];
          if (history.length > 0) {
            messagesToSend.push(history[0]);
          }

          const recentCount = 24;
          const startIdx = Math.max(1, history.length - recentCount);
          for (let i = startIdx; i < history.length; i++) {
            messagesToSend.push(history[i]);
          }

          validateRequestSize(messagesToSend, toolDeclarations);
          const message = await callGroq(messagesToSend, toolDeclarations);

          history.push({
            role: "assistant",
            content: message.content,
            tool_calls: message.tool_calls,
          });

          if (!message.tool_calls || message.tool_calls.length === 0) {
            finalText = message.content ?? "";
            break;
          }

          for (const tc of message.tool_calls) {
            const toolName = tc.function.name;
            let args: Record<string, unknown> = {};
            try {
              args = JSON.parse(tc.function.arguments);
            } catch (e) {
              console.error("Failed to parse tool arguments:", e);
            }

            if (toolName === "search_listings") {
              sendProgress("searching");
            } else if (toolName === "get_neighborhood_info") {
              sendProgress("neighborhood");
            } else if (toolName === "get_commute_time") {
              sendProgress("commute");
            } else if (toolName === "get_price_history") {
              sendProgress("investment");
            }

            const result = executeTool(toolName, args);

            history.push({
              role: "tool",
              tool_call_id: tc.id,
              content: JSON.stringify({ result }),
            });
          }
        }

        if (!finalText) {
          throw new Error("Agent did not produce a final response.");
        }

        sendProgress("ranking");

        let agentResponse: AgentResponse;
        try {
          let parsed: Record<string, unknown> | null = null;
          const trimmed = finalText.trim();
          try {
            parsed = JSON.parse(trimmed) as Record<string, unknown>;
          } catch {
            const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
              try {
                parsed = JSON.parse(jsonMatch[1].trim());
              } catch {}
            }
          }

          if (!parsed) {
            const firstBrace = trimmed.indexOf("{");
            const lastBrace = trimmed.lastIndexOf("}");
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
              const candidate = trimmed.substring(firstBrace, lastBrace + 1);
              try {
                parsed = JSON.parse(candidate.trim());
              } catch {}
            }
          }

          if (parsed && typeof parsed === "object" && ("recommendations" in parsed || "summary" in parsed)) {
            const recs = parsed.recommendations;
            const summ = parsed.summary;
            agentResponse = {
              recommendations: Array.isArray(recs) ? (recs as unknown as AgentResponse["recommendations"]) : [],
              summary: typeof summ === "string" ? summ : "",
            };
          } else {
            throw new Error("Missing keys");
          }
        } catch {
          agentResponse = {
            recommendations: [],
            summary: finalText,
          };
        }

        if (agentResponse.recommendations && Array.isArray(agentResponse.recommendations)) {
          agentResponse.recommendations = agentResponse.recommendations
            .map((rec) => {
              if (rec.property && rec.property.id) {
                try {
                  const fullProp = { ...getFullPropertyDetails(rec.property.id) };
                  
                  let neighborhood = rec.neighborhood;
                  if (!neighborhood || !neighborhood.schoolRating || neighborhood.schoolRating === 0) {
                    try {
                      neighborhood = getMockNeighborhoodInfo(rec.property.id);
                    } catch {}
                  }

                  let commute = rec.commute;
                  if (!commute || !commute.downtownMinutes || commute.downtownMinutes === 0) {
                    try {
                      commute = getMockCommuteTime(rec.property.id);
                    } catch {}
                  }

                  let priceHistory = rec.priceHistory;
                  if (!priceHistory || !priceHistory.fiveYearGrowthPercent || priceHistory.fiveYearGrowthPercent === 0) {
                    try {
                      priceHistory = getMockPriceHistory(rec.property.id);
                    } catch {}
                  }

                  return {
                    ...rec,
                    property: fullProp,
                    neighborhood,
                    commute,
                    priceHistory,
                  };
                } catch (e) {
                  console.error(`[Backend Enrichment] Failed to enrich property details for ${rec.property.id}:`, e);
                }
              }
              return rec;
            });
        }

        const resultResponse = {
          ...agentResponse,
          history: history.filter((m) => m.role !== "system"),
        };

        controller.enqueue(
          encoder.encode(JSON.stringify({ type: "result", data: resultResponse }) + "\n")
        );
      } catch (err: unknown) {
        console.error("[/api/agent] Error:", err);
        const friendlyMessage = translateError(err);
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              type: "result",
              data: { recommendations: [], summary: "", error: friendlyMessage },
            }) + "\n"
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson" },
  });
}
