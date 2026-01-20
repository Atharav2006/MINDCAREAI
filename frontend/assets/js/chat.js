// assets/js/chat.js
// assets/js/chat.js (top)
import { auth } from "./app.js";
import { callBackend } from "./api.js";

window.addEventListener("DOMContentLoaded", () => {
  const chatWindow = document.getElementById("chatWindow");
  const chatInput = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");

  if (!chatWindow || !chatInput || !sendBtn) {
    console.error("Chat elements missing from DOM");
    return;
  }

  let messageCount = 0;
  let lastSuggestionAt = 0;

  function appendMessage(text, cls = "bot-msg") {
    const el = document.createElement("div");
    el.className = cls;
    el.textContent = text;
    chatWindow.appendChild(el);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return el;
  }

  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage(text, "user-msg");
    chatInput.value = "";

    const user = auth?.currentUser;
    let sessionId = user ? user.uid : localStorage.getItem("guestSessionId");
    if (!sessionId) {
      sessionId = "guest-" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem("guestSessionId", sessionId);
    }

    sendBtn.disabled = true;
    const loadingEl = appendMessage("Thinking...", "bot-msg");

    const response = await callBackend(text, sessionId);

    loadingEl.remove();
    sendBtn.disabled = false;

    appendMessage(response.reply, "bot-msg");

    messageCount++;

    const shouldSuggest =
      messageCount - lastSuggestionAt >= 3 &&
      ["anxious", "stressed", "sad"].includes(response.emotion);

    if (shouldSuggest) {
      lastSuggestionAt = messageCount;
      const suggestEl = document.createElement("div");
      suggestEl.className = "bot-msg";
      suggestEl.innerHTML = `
        Would you like to try a calming 
        <button id="goActivityBtn">activity</button> 
        or <button id="goGameBtn">game</button>? 
        <button id="continueBtn">Not now</button>
      `;
      chatWindow.appendChild(suggestEl);
      chatWindow.scrollTop = chatWindow.scrollHeight;

      document.getElementById("goActivityBtn")?.addEventListener("click", () => (window.location.href = "activities.html"));
      document.getElementById("goGameBtn")?.addEventListener("click", () => (window.location.href = "games.html"));
      document.getElementById("continueBtn")?.addEventListener("click", () => appendMessage("No problem, let's keep chatting.", "bot-msg"));
    }
  }

  sendBtn.addEventListener("click", sendMessage);

  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});