import express from "express";
import { detectEmotion } from "../services/emotionDetector.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { text, sessionId } = req.body;

  try {
    const { emotion, risk } = await detectEmotion(text);

    const response = {
      sessionId,
      type: "suggestion",
      emotion,
      risk,
      message: `Detected emotion: ${emotion}${risk.length ? " | Risk: " + risk.join(", ") : ""}`,
      suggestion: null
    };

    if (emotion === "depressed") {
      response.suggestion = {
        id: "grounding_54321",
        title: "5-4-3-2-1 Grounding",
        durationSec: 180
      };
    }

    res.json(response);
  } catch (err) {
    console.error("Error in /api/message:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;