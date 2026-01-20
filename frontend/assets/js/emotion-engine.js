export function suggestActivity(emotion) {
  if (emotion === "anxious") return ["Breathing Exercise", "Grounding"];
  if (emotion === "stressed") return ["Body Scan", "Breathing"];
  if (emotion === "depressed") return ["Gratitude Journaling"];
  return ["Reflection"];
}

export function suggestGame(emotion) {
  if (emotion === "anxious") return ["Breathing Bubble", "Color Focus"];
  if (emotion === "stressed") return ["Memory Light"];
  if (emotion === "depressed") return ["Gratitude Match"];
  return ["Nature Sound"];
}