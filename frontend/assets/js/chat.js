import { api } from "./api.js";

const messagesDiv = document.getElementById("messages");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

function addMessage(text, sender = "bot") {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.textContent = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  const result = await api.analyzeSentiment(text);

  // Show backend response
  let botMsg = result.message || "No response";
  addMessage(botMsg, "bot");

  // Show suggestion if available
  if (result.suggestion && result.suggestion.title) {
    addMessage(
      `Suggestion: ${result.suggestion.title} (${result.suggestion.durationSec} sec)`,
      "bot"
    );
  }
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});