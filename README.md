# Startup Idea Validator

A minimal, functional single-page web application that allows users to submit startup ideas and receive structured, constructive criticism from an AI behaving like a brutally honest Silicon Valley venture capitalst.

## 1. User Guide
1. **Setup**: Clone or extract this project folder to your local machine.
2. **API Key Setup**: Open `script.js` in a text editor and replace the `API_KEY` placeholder on line 6 with your actual Google Gemini API Key.
3. **Run**: Because this is a static, dependency-free application, simply open `index.html` directly in any modern web browser. No local server or build process is required!
4. **Usage**: Type your startup idea into the input field at the bottom of the screen and press **Validate** (or hit Enter). The AI Venture Capitalist will return three structured critiques.

## 2. Tech Stack
- **HTML5**: Used for semantic layout structure and accessibility.
- **Vanilla CSS3**: Minimalist, stoic UI with responsive flexbox design, CSS variables, and native micro-animations. No component libraries (like Bootstrap or Tailwind) were used. 
- **Vanilla JavaScript**: Handles asynchronous API calls, DOM manipulation, state management, and event handling directly in the browser environment.
- **Google Gemini API**: Utilizing the `gemini-1.5-flash` model via the native browser `fetch` API for lightning-fast, zero-dependency generated responses.

## 3. Development Journey
- **Concept & Design**: The objective was to prioritize clarity, functionality, and simplicity over visual bloat. The UI features a strictly neutral palette (whites, grays, off-blacks) to mimic modern, professional AI interfaces.
- **Prompt Engineering**: The core value proposition relies heavily on a strict system prompt. The model is constrained via `systemInstruction` to adopt a specific persona (a Silicon Valley VC) and strictly conform its output to three pre-defined structural headings (Market Reality, Execution Risk, Improvement Suggestion).
- **Implementation Constraints**: Maintained a 0-dependency constraint. Logic handles dynamic textarea resizing, automatic scrolling mechanisms, and native loading indicators. A custom lightweight markdown parser was built into `script.js` to securely map the AI's plain-text structural markdown into specific HTML UI elements without needing heavy external parser libraries. Graceful error handling was added for network or API key oversights.
