// Deterministic high-risk phrase detector
const highRiskPhrases = [
  "i want to die",
  "kill myself",
  "i'm going to kill myself",
  "no reason to live",
  "i can't go on",
  "i want to end it"
];

function normalize(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
}

function checkHighRisk(text) {
  const n = normalize(text);
  for (const phrase of highRiskPhrases) {
    if (n.includes(phrase)) {
      return {
        isHighRisk: true,
        matchedPhrase: phrase,
        escalationMessage: "I'm really sorry you're feeling this way. I can't provide emergency help, but please contact local emergency services or a trusted person right now."
      };
    }
  }
  return { isHighRisk: false };
}

module.exports = { checkHighRisk };