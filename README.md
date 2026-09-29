# 🎓 EduGenie AI - Android Application

> **Personalized Learning Powered by Google Gemini**  
> ✨ *Powered by Google Gemini AI (Blue & White Educational Theme)*

EduGenie AI is a modern, professional Android-styled learning assistant designed for school and college students. It combines Material Design 3 guidelines with Google Gemini AI to provide personalized concept explanations, interactive quizzes, customized study schedules, concise note summaries with flashcards, and technical mock interview coaching.

---

## 📱 Core Features

1. **AI Tutor (Gemini AI Chat)**:
   - Interactive conversational learning assistant powered by Google Gemini (`gemini-3.8-flash`).
   - Structured pedagogical explanations: 📌 Introduction, 📖 Explanation, 💡 Real-world Analogy, 📝 Key Points, 🎯 Practice Question.
   - Built-in Text-To-Speech (TTS) voice read-aloud and quick action buttons ("Break into simpler parts", "Practice MCQ").

2. **Quiz Generator**:
   - Adaptive multiple-choice quiz generator with subject selection and difficulty calibration.
   - Instant pedagogical hints, detailed answer explanations, score calculation, and celebration confetti.

3. **Study Planner**:
   - Science-backed day-by-day revision timetables based on target exam dates and daily study hours.
   - Interactive task completion tracker, spaced-repetition tips, and markdown export.

4. **Notes Summarizer**:
   - Long-text summarization into 1-minute executive overviews, key takeaways, and core formulas.
   - Interactive 3D flip flashcards for active recall and self-check questions.

5. **Interview & Viva Preparation**:
   - Technical viva and placement interview coach with scenario and conceptual questions.
   - Answer evaluation scoring out of 10, highlighting key strengths, areas for improvement, and exemplary model answers.

---

## 🎨 Theme & Material Design

- **Theme**: Blue and white educational theme with royal and sky blue accents (`#1d4ed8`, `#2563eb`, `#3b82f6`, `#eff6ff`) and clean white cards.
- **Material Design 3**: Android status bar with live clock, Material 3 Top App Bar, elevated tonal cards, pill navigation indicators, Floating Action Button (FAB), and Android gesture navigation bar.
- **Subject Selection**: Instant filtering for Computer Science, Mathematics, Science, Commerce, and General Knowledge.
- **Learning Levels**: Dynamic calibration for Beginner, Intermediate, and Advanced students.
- **Device Viewport Toggle**: Switch between authentic Android smartphone frame and tablet/fullscreen mode.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti
- **Backend**: Node.js, Express, Vite middleware
- **AI Engine**: Google GenAI SDK (`@google/genai`) with Gemini models (`gemini-3.8-flash`, `gemini-flash-latest`, `gemini-3.1-flash-lite`)
- **Streaming**: Server-Sent Events (SSE) for real-time response generation

---

## 🚀 Running Locally

1. Clone or extract this repository:
```bash
git clone https://github.com/your-username/edugenie-ai.git
cd edugenie-ai
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
PORT=3000
```

4. Start development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to interact with EduGenie AI.
