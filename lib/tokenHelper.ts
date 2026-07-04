import { GeminiMessage } from "./gemini";

/**
 * Estimates the token count of a given string using character-based approximation.
 * Rule of thumb: ~3.8 characters per token for typical JSON/English mixtures.
 */
export function estimateTextTokens(text: string): number {
  return Math.round(text.length / 3.8);
}

/**
 * Estimates total tokens for the messages list and the tools declarations array.
 */
export function estimateRequestTokens(
  messages: GeminiMessage[],
  tools?: unknown[]
): number {
  return estimateTextTokens(JSON.stringify(messages)) + (tools ? estimateTextTokens(JSON.stringify(tools)) : 0);
}


/**
 * Validates request size. Logs warning if above 15000 tokens, throws if above 30000 tokens.
 */
export function validateRequestSize(
  messages: GeminiMessage[],
  tools?: unknown[]
): number {
  const estimatedTokens = estimateRequestTokens(messages, tools);

  console.log(`[Token Usage] Estimated request size: ${estimatedTokens} tokens.`);

  if (estimatedTokens > 30000) {
    throw new Error(
      `Request blocked: Estimated token count of ${estimatedTokens} exceeds the safety threshold of 30,000 tokens.`
    );
  }

  if (estimatedTokens > 15000) {
    console.warn(
      `[Token Warning] Request size (${estimatedTokens} tokens) is approaching the 30,000 token limit.`
    );
  }

  return estimatedTokens;
}
