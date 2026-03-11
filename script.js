/**
 * Startup Idea Validator
 * 
 * IMPORTANT: Replace 'YOUR_API_KEY' with a valid Google Gemini API Key.
 * You can get one at: https://aistudio.google.com/
 */
const API_KEY = 'AIzaSyDuo13_-V_iuFvAjweYd9ZeocvKZvmnsGQ';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

// Strict system prompt to enforce the persona and structural constraints
const SYSTEM_PROMPT = `You are a brutally honest Silicon Valley venture capitalist evaluating startup ideas.
Respond with realistic and constructive criticism.
You MUST format your entire response using exactly these three headings:
### Market Reality
### Execution Risk
### Improvement Suggestion

Do not include any introductory or concluding text outside of these headings. Be concise, direct, and stoic.`;

// DOM Elements
const chatContainer = document.getElementById('chat-container');
const ideaInput = document.getElementById('idea-input');
const sendBtn = document.getElementById('send-btn');

// Auto-sizes the text area based on input and manages button state
ideaInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    sendBtn.disabled = this.value.trim() === '';
});

// Handles submit on Enter (allows Shift+Enter for line breaks)
ideaInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) handleSend();
    }
});

sendBtn.addEventListener('click', handleSend);

/**
 * Main submission handler
 */
async function handleSend() {
    const userText = ideaInput.value.trim();
    if (!userText) return;

    // Lock UI and clear input
    ideaInput.value = '';
    ideaInput.style.height = 'auto';
    sendBtn.disabled = true;

    // Render user message
    addMessage(userText, 'user');

    // Render loading state
    const loadingId = addLoadingIndicator();

    try {
        const responseText = await fetchGeminiResponse(userText);
        removeElement(loadingId);
        addMessage(formatAIResponse(responseText), 'ai', true);
    } catch (error) {
        removeElement(loadingId);
        addMessage(`System Error: Unable to validate idea. Please ensure your API key is configured correctly. (${error.message})`, 'ai');
    }

    // Re-evaluate button state
    sendBtn.disabled = ideaInput.value.trim() === '';
}

/**
 * Appends a message bubble to the chat container
 */
function addMessage(text, sender, isHTML = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    if (isHTML) {
        messageDiv.innerHTML = text;
    } else {
        messageDiv.textContent = text;
    }

    chatContainer.appendChild(messageDiv);
    scrollToBottom();
}

/**
 * Creates an animated loading indicator
 */
function addLoadingIndicator() {
    const id = 'loading-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.id = id;
    loadingDiv.classList.add('loading');
    loadingDiv.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';

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

/**
 * Executes the REST API call to Google Gemini
 */
async function fetchGeminiResponse(prompt) {
    const requestBody = {
        contents: [
            { role: "user", parts: [{ text: prompt }] }
        ],
        systemInstruction: {
            role: "system",
            parts: [{ text: SYSTEM_PROMPT }]
        },
        generationConfig: {
            temperature: 0.7,
        }
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': API_KEY
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'API Request Failed');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

/**
 * Parses markdown into simple, secure HTML for the strict 3-section layout
 */
function formatAIResponse(text) {
    let html = text.trim();

    // Parse Markdown headings (###) or fallbacks (numbered headings)
    html = html.replace(/(?:^|\n)###?\s*(.*)/g, '<h3>$1</h3>');
    html = html.replace(/(?:^|\n)(1|2|3)\.\s*\**([^:\n]+)\**:?/g, '<h3>$2</h3>');

    // Parse Bold text
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert newlines to breaks
    html = html.replace(/\n/g, '<br>');

    // Clean up excessive breaks after headings
    html = html.replace(/<\/h3><br>/g, '</h3>');
    html = html.replace(/<br><br>/g, '<br>');

    return html;
}
