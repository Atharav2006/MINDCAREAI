// backend/services/emotionDetector.js
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

export async function detectEmotion(text) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an emotion and risk classifier for a mental health chatbot.
Classify the user's message into one of these emotions: happy, anxious, stressed, depressed, neutral.
Also detect if the message contains any risk indicators: harassment, self-harm, suicidal thoughts, abuse, bullying, trauma.
Respond ONLY with valid JSON. Do not include any extra text, explanations, or formatting.
Example:
{"emotion":"depressed","risk":["harassment","bullying"]}`
          },
          { role: "user", content: text }
        ]
      })
    });

    const data = await response.json();

    // Log full API response
    console.log("🔎 Full API response:", JSON.stringify(data, null, 2));

    if (!data.choices || !data.choices[0].message) {
      console.error("❌ No choices in response:", data);
      return { emotion: "neutral", risk: [] };
    }

    const raw = data.choices[0].message.content.trim();
    console.log("🔎 Raw model output:", raw);

    let emotion = "neutral";
    let risk = [];

    try {
      const parsed = JSON.parse(raw);
      emotion = parsed.emotion || "neutral";
      risk = Array.isArray(parsed.risk) ? parsed.risk : [];
    } catch {
      const emoMatch = raw.match(/emotion[:\- ]+(\w+)/i);
      const riskMatch = raw.match(/risk[:\- ]+(.+)/i);

      if (emoMatch) emotion = emoMatch[1].toLowerCase();
      if (riskMatch) {
        risk = riskMatch[1]
          .split(/[,;]/)
          .map(r => r.trim().toLowerCase())
          .filter(r => r.length > 0);
      }
    }

    return { emotion, risk };
  } catch (err) {
    console.error("OpenRouter error:", err);
    return { emotion: "neutral", risk: [] };
  }
}