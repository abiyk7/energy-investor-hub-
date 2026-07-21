// /api/ai.js
// Vercel Serverless Function — secure proxy to the Anthropic API.
// The API key lives ONLY here, on the server, via an environment variable.
// The browser never sees it.
//
// This also includes basic abuse protection:
// 1. Origin check — rejects requests that didn't come from this site.
// 2. Simple per-IP rate limiting — caps how many requests one visitor
//    can make in a short window. This uses in-memory storage, which is
//    a best-effort limiter (it resets if the serverless function cold-starts,
//    and doesn't share state across multiple instances) — but it stops
//    casual scripted abuse without needing any extra paid service.

// Change this to your real domain(s) once you know them for certain.
const ALLOWED_ORIGINS = [
  "https://www.energyinvestorhub.com",
  "https://energy-investor-hub.vercel.app",
];

// In-memory rate limit store (resets on cold start — good enough as a first line of defense)
const requestLog = new Map(); // ip -> array of timestamps
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 8; // max requests per IP per window

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Origin check — allow same-site requests, block everything else.
  // (Requests without an Origin header, e.g. from curl/Postman, are also blocked here;
  // this is intentional since normal browser usage always sends one.)
  const origin = req.headers.origin;
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Basic per-IP rate limiting
  const ip = (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
  }

  // Basic rate limiting safeguard: reject if prompt is missing or absurdly long
  const { prompt, maxTokens } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'prompt'" });
  }
  if (prompt.length > 4000) {
    return res.status(400).json({ error: "Prompt too long" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Fails safely if the env var wasn't set in Vercel — never leaks a blank key to the client
    return res.status(500).json({ error: "Server is not configured. Missing ANTHROPIC_API_KEY." });
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
        max_tokens: maxTokens && Number.isInteger(maxTokens) ? Math.min(maxTokens, 1500) : 1000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Anthropic API error:", anthropicRes.status, errText);
      return res.status(502).json({ error: "AI service temporarily unavailable" });
    }

    const data = await anthropicRes.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join(" ");

    // Simple in-memory-per-request cache header (helps repeated identical requests within CDN edge, optional)
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json({ text: text || "No response generated." });
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
