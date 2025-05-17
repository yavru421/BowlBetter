<!-- filepath: c:\Users\John\Desktop\FFC\groq_vision\README.md -->
# BowlBetter! v1.2

[![Open BowlBetter! Live](https://img.shields.io/badge/Open%20App-BowlBetter!-00bfff?style=for-the-badge&logo=googlechrome)](https://yavru421.github.io/BowlBetter/bowling_approach_analyzer.html)

Welcome to **BowlBetter!** — your friendly, AI-powered bowling approach analyzer and tournament companion.

---

## 🎳 For Bowlers: What is BowlBetter!?

BowlBetter! is a simple, private, and easy-to-use web app that helps you improve your bowling approach and prepare for tournaments.

**Key Features in v1.2:**

- **AI-Powered Approach Analysis:** Upload photos of each step in your approach, and BowlBetter! will give you clear, supportive feedback and tips.
- **Tournament Day Companion:** A new section to help you prepare for tournaments, including:
  - **Personalized Tips:** Get quick tips based on common bowling advice (future versions may integrate AI for more personalized tips).
  - **Score Keeping:** Easily track your game scores during a tournament or practice session.
  - **Statistics:** View your total games, total pinfall, average score, high score, and low score.
  - **Performance Analysis (Placeholder):** Future feature to provide deeper insights into your game.

**How to get the best images for Approach Analysis:**

- **Tip:** The easiest way to capture great images of your approach is to record a video of yourself bowling (slo-motion at 240fps is best if your phone supports it).
- **Then:** Play back the video, pause at each key step of your approach, and take a screenshot. This gives you clear, frame-by-frame images to upload.

**How it works:**

1. **Upload your step images:** Take a photo or screenshot of each step in your approach (for example, 4-step or 5-step approach) and upload them all at once, or one by one.
2. **Get friendly analysis:** The app will analyze each step, pointing out what you’re doing well and where you can improve, using easy-to-understand language and positive encouragement.
3. **See overall tips:** After all steps are analyzed, you’ll get a summary with actionable advice to help you bowl better next time!

**Your privacy:**

- Your images are only used for analysis and are not stored or shared.
- API keys are stored locally in your browser and are not transmitted elsewhere except to the Groq API.
- Score data for Tournament Day is stored locally in your browser.
- You control your data—just refresh the page to clear everything (except locally stored API key and scores).

---

## 🧑‍💻 For Technical Users & Developers

BowlBetter! v1.2 continues to leverage the [Groq API](https://groq.com) for image analysis and introduces new client-side features for tournament preparation.

### Features

- **AI Image Analysis:**
  - Bulk image upload: Drag and drop or select multiple images to auto-assign them to steps.
  - Step-by-step feedback: Each image is analyzed individually, with results shown per step.
  - Comprehensive summary: All step analyses are synthesized into a final, actionable recommendation.
- **Tournament Day Tools:**
  - Score tracking with `localStorage` persistence.
  - Basic statistical calculations (total games, pinfall, average, high/low).
  - Simulated personalized tips.
- **General:**
  - API key privacy: API key is hidden by default, with a toggle to show/hide.
  - Mobile-friendly: Swipe between steps on touch devices. The layout and text wrap for easy reading on phones.
  - Navigation between Approach Analyzer and Tournament Day sections.

### How It Works (Technical)

- **Frontend:** Pure HTML, CSS, and JavaScript. No backend required.
- **Image Analysis:** Each step image is sent as a base64-encoded data URL to the Groq API `/openai/v1/chat/completions` endpoint, using a user-selectable vision model (defaulting to `llama3-groq-vision-alpha`).
- **Prompt Engineering:** Prompts are crafted to elicit friendly, coach-like, and beginner-friendly feedback.
- **Final Recommendation:** After all steps are analyzed, a comprehensive prompt is sent to the Groq API to generate a holistic summary and improvement plan.
- **Tournament Day Data:** Scores are stored in `localStorage` for persistence across sessions.

### Example API Call

```js
const payload = {
  messages: [
    {
      role: "user",
      content: [
        { type: "text", text: "Analyze this bowling approach step..." },
        { type: "image_url", image_url: { url: "data:image/jpeg;base64,..." } }
      ]
    }
  ],
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  max_tokens: 1000
};
fetch('https://api.groq.com/openai/v1/chat/completions', { ... });
```

### Customization

- **Model:** You can swap the model or adjust prompts for more technical or advanced analysis.
- **UI:** All logic is in a single HTML file for easy modification.

---

## 🏷️ Credits

- **Created by:** J.D.Dondlinger
- **Powered by:** [Groq](https://groq.com)

---

## 🛠️ Getting Started (Developers)

[**▶️ Try BowlBetter! Live**](https://yavru421.github.io/BowlBetter/bowling_approach_analyzer.html)

1. Clone or download this repository.
2. Open `bowling_approach_analyzer.html` in your browser.
3. Enter your Groq API key (get one at [groq.com](https://groq.com)).
4. Start uploading and analyzing!

---

## 📄 License

This project is for educational and personal use. For commercial or redistribution, please contact the author.

---

**BowlBetter! — Analyze. Improve. Enjoy your game!**
