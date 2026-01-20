// assets/js/api.js
const BASE_URL = "http://127.0.0.1:8080"; // update if backend runs on different port

export async function callBackend(message, sessionId) {
  try {
    const res = await fetch(`${BASE_URL}/api/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message, sessionId })
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Backend error", res.status, text);
      return { reply: "Backend error. Try again later.", emotion: "neutral" };
    }

    const data = await res.json();
    return {
      reply: data.message || "No response",
      emotion: data.emotion || "neutral"
    };
  } catch (err) {
    console.error("callBackend error", err);
    return { reply: "Network error. Please check your connection.", emotion: "neutral" };
  }
}