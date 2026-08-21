// app/api/ai/route.js
// Next.js Route Handler — secure proxy to the Anthropic API.
// The API key lives ONLY here, on the server, via an environment variable.
// The browser never sees it.
//
// Includes the same abuse protection as before:
// 1. Origin check — rejects requests that didn't come from this site.
// 2. Simple per-IP rate limiting (in-memory, best-effort).

const ALLOWED_ORIGINS = [
  "https://www.energyinvestorhub.com",
  "https://energyinvestorhub.com",
  "https://energy-investor-hub.vercel.app",
];

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  try {
    const host = new URL(origin).hostname;
    return host.endsWith(".vercel.app") && host.includes("energy-investor");
  } catch {
    return false;
  }
}

const requestLog = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 8;

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

export async function POST(request) {
  const origin = request.headers.get("origin");
  if (!isAllowedOrigin(origin)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = (request.headers.get("x-forwarded-for") || "unknown")
    .split(",")[0]
    .trim();
  if (isRateLimited(ip)) {
    return Response.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { prompt, maxTokens } = body || {};
  if (!prompt || typeof prompt !== "string") {
    return Response.json(
      { error: "Missing or invalid 'prompt'" },
      { status: 400 }
    );
  }
  if (prompt.length > 4000) {
    return Response.json({ error: "Prompt too long" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Server is not configured. Missing ANTHROPIC_API_KEY." },
      { status: 500 }
    );
  }

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens:
          maxTokens && Number.isInteger(maxTokens)
            ? Math.min(maxTokens, 1500)
            : 1000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Anthropic API error:", anthropicRes.status, errText);
      return Response.json(
        { error: "AI service temporarily unavailable" },
        { status: 502 }
      );
    }

    const data = await anthropicRes.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join(" ");

    return Response.json(
      { text: text || "No response generated." },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("Proxy error:", err);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
