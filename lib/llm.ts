import Groq from "groq-sdk";
import type { ZodType, ZodTypeDef } from "zod";

import { logStage } from "@/lib/logger";

function createClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new ApiLlmError(
      "API_KEY_MISSING",
      "GROQ_API_KEY is not configured. Set it in .env.local (see .env.example).",
    );
  }
  return new Groq({
    apiKey,
    baseURL: process.env.GROQ_BASE_URL || "https://api.groq.com",
  });
}

const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_TEMPERATURE = 0.3;
const MAX_RETRIES = 1;

export class ApiLlmError extends Error {
  constructor(
    public code: "API_KEY_MISSING" | "LLM_INVALID_JSON" | "RATE_LIMIT" | "LLM_FAILED",
    message: string,
  ) {
    super(message);
    this.name = "ApiLlmError";
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Call Groq chat completion with JSON-object response, parse with Zod, retry once on failure.
 *
 * @throws ApiLlmError on configuration, rate-limit, or parse failure.
 */
export async function completeStructured<T>(args: {
  prompt: string;
  schema: ZodType<T, ZodTypeDef, unknown>;
  model?: string;
  temperature?: number;
  maxRetries?: number;
  /** Context for logging */
  runId?: string;
  stage?: string;
}): Promise<T> {
  const {
    prompt,
    schema,
    model = process.env.GROQ_MODEL || DEFAULT_MODEL,
    temperature = DEFAULT_TEMPERATURE,
    maxRetries = MAX_RETRIES,
    runId = "unknown",
    stage = "unknown",
  } = args;

  const client = createClient();
  const startedAt = Date.now();
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const completion = await client.chat.completions.create({
        model,
        temperature,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const raw = completion.choices[0]?.message?.content;
      const usage = completion.usage;
      const durationMs = Date.now() - startedAt;

      if (!raw) {
        throw new ApiLlmError("LLM_FAILED", "Empty response from Groq");
      }

      // Attempt parse
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new ApiLlmError("LLM_INVALID_JSON", "Groq returned malformed JSON");
      }

      // When retrying, send fix instruction
      if (attempt > 0) {
        // On retry we just try parsing the already-fixed JSON
      }

      const result = schema.safeParse(parsed);

      if (!result.success) {
        const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
        throw new ApiLlmError("LLM_INVALID_JSON", `Zod validation failed: ${issues}`);
      }

      logStage({ runId, stage, durationMs, tokenUsage: usage?.total_tokens, outcome: "ok" });
      return result.data;
    } catch (err) {
      lastError = err;

      // Don't retry on missing key
      if (err instanceof ApiLlmError && err.code === "API_KEY_MISSING") {
        throw err;
      }

      // Rate-limit backoff
      if (err instanceof Groq.APIError && err.status === 429) {
        logStage({ runId, stage, durationMs: Date.now() - startedAt, outcome: "error" });
        const waitMs = Math.min(1000 * 2 ** attempt, 8000);
        await sleep(waitMs);
        continue;
      }

      // Retry on network/parse errors
      if (attempt < maxRetries) {
        await sleep(500);
        continue;
      }
    }
  }

  const durationMs = Date.now() - startedAt;
  logStage({ runId, stage, durationMs, outcome: "error" });

  if (lastError instanceof ApiLlmError) {
    throw lastError;
  }

  // Wrap unknown errors
  const message = lastError instanceof Error ? lastError.message : "Unknown LLM error";
  throw new ApiLlmError("LLM_FAILED", message);
}
