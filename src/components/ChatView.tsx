import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Puzzle,
  Lightbulb,
  ArrowRight,
  User,
  GraduationCap,
  Calendar,
  Award,
  FileText,
  Briefcase,
  HelpCircle,
  BarChart3,
  Rocket,
  Brain,
  BookOpen,
} from 'lucide-react';
import { ChatMessage, StudentLevel, SubjectCategory, LanguageMode, AppMode } from '../types';
import { renderMarkdown } from '../utils/markdown';
import { StudentStats } from '../hooks/useStudentStats';

interface ChatViewProps {
  studentLevel: StudentLevel;
  selectedSubject: SubjectCategory;
  language: LanguageMode;
  onOpenMode: (mode: AppMode) => void;
  stats: StudentStats;
  onAddTopic: (topic: string) => void;
  onOpenDashboard: () => void;
  onOpenFutureScope: () => void;
}

const WELCOME_MESSAGE = `Greetings! I am EduGenie AI, your personalized academic tutor powered by Google Gemini.

I can assist your university studies across five core competencies:
• **Rigorous Concept Tutoring**: Break down complex theorems, algorithms, and models step-by-step.
• **Academic Quiz Generation**: Generate practice problem sets with detailed derivations.
• **Lecture Note Summaries**: Condense long readings into executive takeaways and active recall flashcards.
• **Syllabus & Exam Scheduling**: Build realistic study timetables for your upcoming midterms and finals.
• **Oral Viva & Placement Prep**: Practice answering technical questions with scoring out of 10.

What academic topic or problem set would you like to explore today?`;

const COLLEGE_PROMPT_EXAMPLES: Record<SubjectCategory, string[]> = {
  'Computer Science': [
    "Explain Dijkstra's Algorithm step-by-step with Big-O complexity",
    'Compare Process vs Thread in Operating Systems with memory layout',
    'Demonstrate Binary Search Tree insertion and balancing logic',
    'Conduct a technical mock interview on OOP principles',
  ],
  Mathematics: [
    'Derive the Chain Rule in Differential Calculus with intuitive proof',
    "Explain Bayes' Theorem with a real-world probabilistic example",
    'How do eigenvalues and eigenvectors work in Matrix transformation?',
    'Solve an optimization problem using Lagrange Multipliers',
  ],
  Science: [
    'Explain Cellular Respiration and the Krebs Cycle biochemistry',
    "Break down Maxwell's Equations and Electromagnetic Induction",
    'Explain the Second Law of Thermodynamics and entropy in closed systems',
    'Walk through chemical equilibrium and Le Chatelier’s principle',
  ],
  Commerce: [
    'Explain the mechanics of Quantitative Easing and Central Bank balance sheets',
    'How does Double-Entry Bookkeeping prevent reconciliation errors?',
    'Break down the IS-LM macroeconomic model for monetary policy',
    'Explain discounted cash flow (DCF) valuation and WACC',
  ],
  'General Knowledge': [
    'Explain the structure and jurisdiction of the United Nations Security Council',
    'Timeline of major milestones in space exploration and satellite orbits',
    'Break down cognitive biases: Confirmation Bias vs Dunning-Kruger effect',
    'Summarize global environmental treaties from Kyoto to Paris',
  ],
};

export const ChatView: React.FC<ChatViewProps> = ({
  studentLevel,
  selectedSubject,
  language,
  onOpenMode,
  stats,
  onAddTopic,
  onOpenDashboard,
  onOpenFutureScope,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'initial-greeting',
      role: 'assistant',
      content: WELCOME_MESSAGE,
      timestamp: Date.now(),
      subject: selectedSubject,
      level: studentLevel,
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/[*#_`~>\[\]]/g, ' ')
      .replace(/\(https?:\/\/[^\)]+\)/g, '')
      .replace(/━━━━━━━━━━━━━━━━━━━━━━/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (language === 'ta') {
      utterance.lang = 'ta-IN';
    } else {
      utterance.lang = 'en-US';
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (userPrompt: string) => {
    const textToSend = userPrompt.trim();
    if (!textToSend || isLoading) return;

    const isDashboardQuery =
      /^(dashboard|student dashboard|my dashboard|show dashboard|stats|my stats)$/i.test(textToSend.toLowerCase());

    const isFutureScopeQuery =
      /^(future scope|roadmap|future features|upcoming features)$/i.test(textToSend.toLowerCase());

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
      subject: selectedSubject,
      level: studentLevel,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    if (isDashboardQuery) {
      const dashboardText = `━━━━━━━━━━━━━━━━━━━━━━\n📊 STUDENT DASHBOARD\n━━━━━━━━━━━━━━━━━━━━━━\n\n📚 Topics Learned: ${stats.topicsLearned}\n📝 Quizzes Completed: ${stats.quizzesCompleted}\n🔥 Study Streak: ${stats.studyStreak} Days\n⏱️ Study Hours: ${stats.studyHours} hrs\n🎯 Accuracy: ${stats.quizAccuracy}%\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n*Great consistency! What concept or subject would you like to conquer next?*`;
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: dashboardText,
          timestamp: Date.now(),
          subject: selectedSubject,
          level: studentLevel,
        },
      ]);
      return;
    }

    if (isFutureScopeQuery) {
      const scopeText = `Here is the upcoming feature roadmap for **EduGenie AI**:

🚀 **AI Voice Assistant** - Real-time conversational voice tutor with instant vocal explanations
🚀 **Personalized Learning Paths** - Dynamic mastery roadmap adapted to your syllabus and weak areas
🚀 **Tamil Language Support** - Full bilingual Tamil & English interactive learning (active now!)
🚀 **Performance Analytics Dashboard** - In-depth retention analysis and question accuracy metrics
🚀 **Smart Flashcards** - Spaced repetition engine for long-term memory
🚀 **Attendance & Reminder System** - Study session schedule notifications and exam countdowns
🚀 **AI Assignment Generator** - Practice problem sets and automatic rubric grading`;
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: scopeText,
          timestamp: Date.now(),
          subject: selectedSubject,
          level: studentLevel,
        },
      ]);
      return;
    }

    setIsLoading(true);
    const assistantMsgId = `assistant-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        subject: selectedSubject,
        level: studentLevel,
      },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          studentLevel,
          subject: selectedSubject,
          mode: 'EduGenie Tutoring',
          language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Streaming not supported');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, content: accumulatedText } : msg
                  )
                );
              } else if (parsed.error) {
                accumulatedText += `\n\n*(Error: ${parsed.error})*`;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, content: accumulatedText } : msg
                  )
                );
              }
            } catch (e) {
              // ignore
            }
          }
        }
      }

      if (textToSend.toLowerCase().startsWith('explain ') || textToSend.length > 10) {
        const topicName = textToSend.replace(/^explain\s+/i, '').slice(0, 45);
        onAddTopic(topicName);
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content:
                  'I encountered an issue connecting to the AI tutor service. Please check your connection or try again.',
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBreakIntoSimplerParts = (originalContent: string) => {
    sendMessage(
      `Can you break this down into even smaller, foundational building blocks with an everyday analogy? Explain like I am encountering this for the first time: "${originalContent.slice(0, 140)}..."`
    );
  };

  const handleRequestPracticeMCQ = (originalContent: string) => {
    sendMessage(
      `Provide 1 collegiate-level practice exam problem with 4 options testing conceptual understanding of: "${originalContent.slice(0, 120)}...". Include the question first, then provide the answer separately with step-by-step reasoning.`
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'initial-greeting',
        role: 'assistant',
        content: WELCOME_MESSAGE,
        timestamp: Date.now(),
        subject: selectedSubject,
        level: studentLevel,
      },
    ]);
  };

  const samplePrompts = COLLEGE_PROMPT_EXAMPLES[selectedSubject] || COLLEGE_PROMPT_EXAMPLES['Computer Science'];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto px-3 sm:px-6">
      {/* Collegiate Academic Context Bar */}
      <div className="flex items-center justify-between py-2.5 px-4 mb-3 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-slate-900">
                {selectedSubject} Tutorial Session
              </span>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {studentLevel} Level
              </span>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Powered by Google Gemini 3.8 Flash · Socratic Method
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={onOpenDashboard}
            className="text-slate-600 hover:text-blue-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-slate-50 transition-colors hidden sm:flex items-center gap-1"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Transcript</span>
          </button>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <button
            type="button"
            onClick={handleResetChat}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            title="Clear discussion history"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Session</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1 sm:px-2 py-2">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs font-bold text-xs ${
                  isUser
                    ? 'bg-slate-800 text-white'
                    : 'bg-blue-700 text-white shadow-blue-700/20'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
              </div>

              {/* Message Bubble Container */}
              <div
                className={`flex flex-col max-w-[92%] sm:max-w-[85%] ${
                  isUser ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`rounded-2xl p-4 sm:p-5 shadow-2xs text-sm leading-relaxed ${
                    isUser
                      ? 'bg-blue-700 text-white rounded-tr-xs font-medium'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  ) : (
                    <div
                      className="edugenie-prose"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(message.content || 'Analyzing syllabus principles...'),
                      }}
                    />
                  )}
                </div>

                {/* Assistant Action Tools */}
                {!isUser && message.content && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs text-slate-500 px-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(message.id, message.content)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
                      title="Copy response"
                    >
                      {copiedId === message.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSpeak(message.id, message.content)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors shadow-2xs ${
                        speakingId === message.id
                          ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                      title={speakingId === message.id ? 'Stop audio' : 'Listen to explanation'}
                    >
                      {speakingId === message.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 animate-pulse text-blue-700" />
                          <span>Stop Voice</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Listen (TTS)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBreakIntoSimplerParts(message.content)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-100 font-medium border border-sky-200 transition-colors shadow-2xs"
                      title="Break into foundational building blocks"
                    >
                      <Puzzle className="w-3.5 h-3.5 text-sky-600" />
                      <span>Deconstruct Steps</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRequestPracticeMCQ(message.content)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 font-medium border border-blue-200 transition-colors shadow-2xs"
                      title="Generate Practice Exam Problem"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
                      <span>Exam Problem</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && messages[messages.length - 1]?.content === '' && (
          <div className="flex items-center gap-3 text-slate-500 text-xs py-2 pl-2">
            <div className="w-8 h-8 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4 animate-spin text-sky-200" />
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-2xs">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
              <span className="inline-block w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]"></span>
              <span className="ml-2 font-medium text-slate-700">
                Formulating collegiate pedagogical response...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested University Discussion Prompts */}
      <div className="mb-2 p-3 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-700" />
            <span>Curated {selectedSubject} Prompts</span>
          </span>
          <span className="text-[10px] text-slate-400">Click to examine</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {samplePrompts.slice(0, 4).map((promptText, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => sendMessage(promptText)}
              className="flex items-center justify-between text-left p-2.5 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-xs group"
            >
              <span className="font-medium text-slate-700 group-hover:text-blue-800 truncate pr-2">
                {promptText}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-700 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Input Box Area */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-2 mb-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              language === 'ta'
                ? 'பாடப் பிரிவை பற்றி கேளுங்கள் (Enter to send)...'
                : `Ask about theorems, algorithms, formulas, or past-paper problems in ${selectedSubject}...`
            }
            className="flex-1 max-h-32 min-h-[44px] resize-none border-0 bg-transparent px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 leading-normal"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 transition-all ${
              input.trim() && !isLoading
                ? 'bg-blue-700 text-white shadow-sm shadow-blue-700/20 hover:bg-blue-800 hover:scale-102'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between pt-2 px-2 border-t border-slate-100 text-xs text-slate-500">
          <span className="hidden sm:inline">
            Active: <strong>{selectedSubject}</strong> · Depth: <strong>{studentLevel}</strong> · Language: <strong>{language === 'ta' ? 'தமிழ்' : 'English'}</strong>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">
              Response Model: 📌 Overview · 📖 Technical Logic · 💡 Analogy · 📝 Key Formulas · 🎯 Practice Problem
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
