import { GoogleGenAI } from "@google/genai";

export interface GeminiToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface GeminiMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  name?: string;
  tool_calls?: GeminiToolCall[];
  tool_call_id?: string;
}

export async function callGemini(
  messages: GeminiMessage[],
  tools?: any[]
): Promise<GeminiMessage> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  let systemInstruction = "";
  const contents: any[] = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      systemInstruction = msg.content || "";
      continue;
    }

    if (msg.role === "user") {
      contents.push({
        role: "user",
        parts: [{ text: msg.content || "" }],
      });
    } else if (msg.role === "assistant") {
      const parts: any[] = [];
      if (msg.content) {
        parts.push({ text: msg.content });
      }
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        for (const tc of msg.tool_calls) {
          parts.push({
            functionCall: {
              name: tc.function.name,
              args: JSON.parse(tc.function.arguments),
              thoughtSignature: "skip_thought_signature_validator",
            },
          });
        }
      }
      contents.push({
        role: "model",
        parts,
      });
    } else if (msg.role === "tool") {
      let functionName = "";
      // Match function name by traversing backwards to find assistant's tool call matching this tool_call_id
      for (let i = messages.length - 1; i >= 0; i--) {
        const prev = messages[i];
        if (prev.role === "assistant" && prev.tool_calls) {
          const tc = prev.tool_calls.find((t) => t.id === msg.tool_call_id);
          if (tc) {
            functionName = tc.function.name;
            break;
          }
        }
      }

      if (!functionName) {
        functionName = "search_listings";
      }

      let parsedResult = {};
      try {
        parsedResult = JSON.parse(msg.content || "{}");
      } catch {}

      contents.push({
        role: "user",
        parts: [
          {
            functionResponse: {
              name: functionName,
              response: parsedResult,
            },
          },
        ],
      });
    }
  }

  const formattedTools =
    tools && tools.length > 0
      ? [
          {
            functionDeclarations: tools.map((t) => ({
              name: t.function.name,
              description: t.function.description,
              parameters: t.function.parameters,
            })),
          },
        ]
      : undefined;

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-flash-latest",
    contents,
    config: {
      systemInstruction: systemInstruction || undefined,
      tools: formattedTools,
      temperature: 0.2,
    },
  });

  const toolCalls =
    response.functionCalls?.map((fc) => {
      const callId = `call_${Math.random().toString(36).substring(7)}`;
      return {
        id: callId,
        type: "function" as const,
        function: {
          name: fc.name || "",
          arguments: JSON.stringify(fc.args),
        },
      };
    }) || [];

  return {
    role: "assistant",
    content: response.text || null,
    tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
  };
}
