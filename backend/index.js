// backend/index.js (ESM)
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  console.warn("WARNING: OPENROUTER_API_KEY is not set. Set it in your environment or .env file.");
}

const app = express();
app.use(cors({ origin: ["http://localhost:5500", "http://127.0.0.1:5500"] }));
app.use(express.json());

// Few-shot system prompt that forces strict JSON output
const SYSTEM_PROMPT = `
You are an empathetic assistant. ALWAYS respond with a single valid JSON object and nothing else.
The JSON must have exactly two keys:
  "emotion": one of ["happy","sad","anxious","stressed","angry","neutral"]
  "reply": a natural, human-like, empathetic response to the user's message

Examples:
User: "I have exams next week and I can't sleep."
Output:
{"emotion":"stressed","reply":"Exams can be overwhelming. Let's try a short breathing exercise together: breathe in for 4, hold 4, out 6. Would you like that?"}

User: "I just got great news!"
Output:
{"emotion":"happy","reply":"That's wonderful — congratulations! What happened that made your day?"}

Now respond to the user message below. Output must be valid JSON exactly as shown.
`;

// Helper: exponential backoff retry wrapper
async function fetchWithRetry(fn, retries = 3, baseDelayMs = 500) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      const delay = baseDelayMs * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

// Call OpenRouter and return raw model content
async function callOpenRouterRaw(userText) {
  if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not set");

  const body = {
    model: "openai/gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userText }
    ],
    temperature: 0.45,
    max_tokens: 400
  };

  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const text = await resp.text().catch(() => "");
  if (!resp.ok) {
    const err = new Error(`OpenRouter returned ${resp.status}: ${text}`);
    err.status = resp.status;
    err.bodyText = text;
    throw err;
  }

  const data = JSON.parse(text);
  const raw = data.choices?.[0]?.message?.content ?? "";
  return { raw, data };
}

// Lightweight local fallback emotion guess (used only if model output is not parseable)
function guessEmotionFromText(text) {
  if (!text) return "neutral";
  const t = text.toLowerCase();
  if (/\b(sad|depress|tear|unhappy|miserable)\b/.test(t)) return "sad";
  if (/\b(anxious|anxiety|nervous|panic|worried)\b/.test(t)) return "anxious";
  if (/\b(stress|stressed|overwhelmed|burnout)\b/.test(t)) return "stressed";
  if (/\b(happy|joy|glad|great|excited)\b/.test(t)) return "happy";
  if (/\b(angry|mad|furious|irritat)\b/.test(t)) return "angry";
  return "neutral";
}

// Main route
app.post("/api/message", async (req, res) => {
  const { text, sessionId } = req.body || {};
  if (!text) return res.status(400).json({ error: "Missing text" });

  try {
    const { raw } = await fetchWithRetry(() => callOpenRouterRaw(text), 3, 400);

    // Try strict JSON parse
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      // Log raw output for debugging (remove in production)
      console.error("OpenRouter output not valid JSON:", raw);

      // Fallback: use raw text as reply and guess emotion heuristically
      const fallbackReply = raw.trim() || "I'm here to listen.";
      const fallbackEmotion = guessEmotionFromText(fallbackReply);

      return res.json({
        sessionId,
        emotion: fallbackEmotion,
        message: fallbackReply
      });
    }

    // Validate parsed shape
    const emotion = typeof parsed.emotion === "string" ? parsed.emotion : "neutral";
    const reply = typeof parsed.reply === "string" ? parsed.reply : "I'm here to listen.";

    // Return only the reply and emotion for internal use
    return res.json({ sessionId, emotion, message: reply });
  } catch (err) {
    console.error("Error in /api/message:", err);
    const status = err.status || 500;
    return res.status(status).json({ error: "LLM call failed", details: err.message || String(err) });
  }
});

// Defensive server start with optional port fallback
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`Port ${port} in use, trying ${Number(port) + 1}`);
      startServer(Number(port) + 1);
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });
}

const PORT = process.env.PORT || 8080;
startServer(PORT);