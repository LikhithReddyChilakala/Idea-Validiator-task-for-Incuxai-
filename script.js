/**
 * Startup Idea Validator
 *
 * Replace YOUR_API_KEY with your Gemini API key
 * https://aistudio.google.com/
 */

const API_KEY = "YOUR_API_KEY";

const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/* ---------------- SYSTEM PROMPT ---------------- */

const SYSTEM_PROMPT = `
You are a harsh but fair Silicon Valley venture capitalist.

Your job is to evaluate startup ideas realistically.

Return exactly THREE sections:

1. Market Reality
Explain the real market demand and competition.

2. Execution Risk
Explain the main technical or business challenges.

3. Improvement Suggestion
Suggest a practical way to improve or pivot the idea.

Rules:
- Be honest, logical and practical
- Be concise
- Use clear headings
- No extra commentary
`;

/* ---------------- DOM ELEMENTS ---------------- */

const chatContainer = document.getElementById("chat-container");
const ideaInput = document.getElementById("idea-input");
const sendBtn = document.getElementById("send-btn");

/* ---------------- INPUT EVENTS ---------------- */

ideaInput.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
  sendBtn.disabled = this.value.trim() === "";
});

ideaInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (!sendBtn.disabled) handleSend();
  }
});

sendBtn.addEventListener("click", handleSend);

/* ---------------- MAIN HANDLER ---------------- */

async function handleSend() {
  const userIdea = ideaInput.value.trim();

  if (!userIdea) return;

  ideaInput.value = "";
  ideaInput.style.height = "auto";
  sendBtn.disabled = true;

  addMessage(userIdea, "user");

  const loadingId = addLoadingIndicator();

  try {
    const aiResponse = await fetchGeminiResponse(userIdea);

    removeElement(loadingId);

    addMessage(formatAIResponse(aiResponse), "ai", true);
  } catch (error) {
    removeElement(loadingId);

    addMessage(
      "System Error: Unable to validate idea. Check API key configuration.",
      "ai"
    );
  }

  sendBtn.disabled = ideaInput.value.trim() === "";
}

/* ---------------- CHAT RENDERING ---------------- */

function addMessage(text, sender, isHTML = false) {
  const messageDiv = document.createElement("div");

  messageDiv.classList.add("message", sender);

  if (isHTML) messageDiv.innerHTML = text;
  else messageDiv.textContent = text;

  chatContainer.appendChild(messageDiv);

  scrollToBottom();
}

function addLoadingIndicator() {
  const id = "loading-" + Date.now();

  const loadingDiv = document.createElement("div");

  loadingDiv.id = id;
  loadingDiv.classList.add("loading");

  loadingDiv.innerHTML =
    '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';

  chatContainer.appendChild(loadingDiv);

  scrollToBottom();

  return id;
}

function removeElement(id) {
  const el = document.getElementById(id);

  if (el) el.remove();
}

function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

/* ---------------- GEMINI API ---------------- */

async function fetchGeminiResponse(userIdea) {

  /* ⭐ REQUIRED PROMPT COMBINATION ⭐ */

  const prompt = SYSTEM_PROMPT + "\nStartup Idea: " + userIdea;

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.7
    }
  };

  const response = await fetch(API_URL + "?key=" + API_KEY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error("API request failed");
  }

  const data = await response.json();

  return data.candidates[0].content.parts[0].text;
}

/* ---------------- RESPONSE FORMATTER ---------------- */

function formatAIResponse(text) {

  let html = text.trim();

  html = html.replace(/(?:^|\n)###?\s*(.*)/g, "<h3>$1</h3>");

  html = html.replace(/(?:^|\n)(1|2|3)\.\s*\**([^:\n]+)\**:?/g, "<h3>$2</h3>");

  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  html = html.replace(/\n/g, "<br>");

  html = html.replace(/<\/h3><br>/g, "</h3>");

  html = html.replace(/<br><br>/g, "<br>");

  return html;
}
