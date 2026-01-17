export class MindCareAPI {
  async analyzeSentiment(text) {
    try {
      const response = await fetch("http://127.0.0.1:8080/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, sessionId: "frontend" })
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error("Error calling backend:", err);
      return { emotion: "neutral", risk: [], message: "Backend error", suggestion: null };
    }
  }
}

export const api = new MindCareAPI();