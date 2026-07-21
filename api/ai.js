// /api/ai.js
// Vercel Serverless Function — secure proxy to the Anthropic API.
// The API key lives ONLY here, on the server, via an environment variable.
// The browser never sees it.

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
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

    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json({ text: text || "No response generated." });
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
