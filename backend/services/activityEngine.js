// Simple rule-based activity suggestions
const activities = {
  stressed: { id: 'box_breathing', title: 'Box Breathing', durationSec: 120 },
  anxious: { id: 'grounding_54321', title: '5-4-3-2-1 Grounding', durationSec: 180 },
  depressed: { id: 'journaling_prompt', title: 'Journaling Prompt', durationSec: 300 },
  neutral: { id: 'focus_reflection', title: 'Focus Reflection', durationSec: 120 },
  happy: { id: 'mood_reinforce', title: 'Mood Reinforcement', durationSec: 60 }
};

function suggestForEmotion(emotion) {
  return activities[emotion] || activities['neutral'];
}

module.exports = { suggestForEmotion, activities };