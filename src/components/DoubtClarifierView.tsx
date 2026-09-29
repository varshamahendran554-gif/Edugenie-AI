import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  Puzzle,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Brain,
  ChevronRight,
  Eye,
  EyeOff,
  Flame,
} from 'lucide-react';
import { DoubtBreakdownData, StudentLevel, SubjectCategory, LanguageMode } from '../types';

interface DoubtClarifierViewProps {
  studentLevel: StudentLevel;
  selectedSubject: SubjectCategory;
  language?: LanguageMode;
  onTopicLearned?: (topic: string) => void;
}

const COMMON_DOUBTS: Record<SubjectCategory, string[]> = {
  'Computer Science': [
    'Explain Data Structures (Arrays, Linked Lists, Stacks, Queues)',
    "Explain Dijkstra's Algorithm step-by-step with graph example",
    'Why is QuickSort O(n^2) in worst case and how does randomized pivot fix it?',
    'What actually is a closure in JavaScript/Python and where is its memory stored?',
  ],
  Mathematics: [
    'Why is the derivative of e^x equal to itself? Give an intuitive visual explanation.',
    'Why does dividing by a fraction mean multiplying by its reciprocal?',
    'How does the Central Limit Theorem guarantee a normal curve from any distribution?',
  ],
  Science: [
    'Why is light both a wave and a particle? How does the double-slit experiment prove it?',
    'How does mRNA vaccine technology teach the immune system without causing illness?',
    'Why do astronauts float in orbit if gravity is still ~90% as strong as on Earth?',
  ],
  Commerce: [
    'Why is depreciation added back to net income in the cash flow statement?',
    'How does fractional reserve banking actually create new money in an economy?',
    'What is the difference between operating leverage and financial leverage?',
  ],
  'General Knowledge': [
    'How do airplanes generate lift using Bernoulli’s principle and Newton’s 3rd law?',
    'How does GPS calculate my exact location using relativistic satellites?',
    'Why do seasons happen because of Earth’s axial tilt rather than distance to the sun?',
  ],
};

export const DoubtClarifierView: React.FC<DoubtClarifierViewProps> = ({
  studentLevel,
  selectedSubject,
  language,
  onTopicLearned,
}) => {
  const [doubtText, setDoubtText] = useState(
    'Why do astronauts float in orbit if Earth gravity is still ~90% strong?'
  );
  const [breakDownDeeper, setBreakDownDeeper] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [breakdown, setBreakdown] = useState<DoubtBreakdownData | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const handleClarify = async (deepMode = breakDownDeeper) => {
    if (!doubtText.trim()) return;
    setIsLoading(true);
    setShowAnswer(false);
    setActiveStep(0);

    try {
      const response = await fetch('/api/clarify-doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doubt: doubtText,
          subject: selectedSubject,
          studentLevel,
          breakDownDeeper: deepMode,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to clarify doubt');
      }

      const data: DoubtBreakdownData = await response.json();
      setBreakdown(data);
      if (onTopicLearned) {
        onTopicLearned(data.topic || doubtText);
      }
    } catch (err: any) {
      console.error('Error clarifying doubt:', err);
      alert('Could not clarify doubt. Please check your Gemini API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuperSimplify = () => {
    setBreakDownDeeper(true);
    handleClarify(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Banner - Blue and White Educational Theme */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-blue-500/15 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-sky-200" />
            <span>Step-by-Step Concept Demystifier</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Doubt Clarification Mode
          </h1>
          <p className="mt-1 text-blue-100 text-sm max-w-xl">
            Stuck on a tricky concept or paradoxical question? Get intuitive analogies,
            step-by-step logic, and common trap warnings.
          </p>
        </div>
        <div className="hidden sm:block">
          <Brain className="w-16 h-16 text-blue-200/30" />
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider">
          What concept or question is confusing you?
        </label>
        <textarea
          rows={3}
          value={doubtText}
          onChange={(e) => setDoubtText(e.target.value)}
          placeholder="e.g. Why does negative times negative equal positive? How does quicksort choose pivots? How does quantitative easing work?"
          className="w-full p-3.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-amber-600 leading-relaxed text-slate-800"
        />

        {/* Suggested doubts */}
        <div>
          <span className="text-xs font-semibold text-slate-500 block mb-2">
            Common {selectedSubject} Doubts:
          </span>
          <div className="flex flex-wrap gap-2">
            {(COMMON_DOUBTS[selectedSubject] || COMMON_DOUBTS['General Knowledge']).map(
              (sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setDoubtText(sample);
                  }}
                  className="text-xs bg-slate-100 hover:bg-amber-50 hover:text-amber-800 border border-slate-200 px-3 py-1.5 rounded-xl font-medium transition-colors text-left"
                >
                  &ldquo;{sample}&rdquo;
                </button>
              )
            )}
          </div>
        </div>

        {/* Deeper Breakdown Checkbox & Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
            <input
              type="checkbox"
              checked={breakDownDeeper}
              onChange={(e) => setBreakDownDeeper(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 accent-amber-600"
            />
            <span>Break down into simpler, bite-sized building blocks (Feynman method)</span>
          </label>

          <button
            type="button"
            disabled={isLoading || !doubtText.trim()}
            onClick={() => handleClarify()}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md ${
              isLoading
                ? 'bg-amber-400 text-white cursor-wait'
                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200 hover:scale-102'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Demystifying Concept...' : 'Clarify My Doubt'}</span>
          </button>
        </div>
      </div>

      {/* Doubt Breakdown Result */}
      {breakdown && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Concept Resolved
              </span>
              <h2 className="text-lg font-bold text-slate-900">{breakdown.topic}</h2>
            </div>
            <button
              type="button"
              onClick={handleSuperSimplify}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors"
            >
              <Puzzle className="w-3.5 h-3.5 text-amber-600" />
              <span>Still Confused? Break Down Further 🧩</span>
            </button>
          </div>

          {/* Big Picture & Real-World Analogy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50/60 border border-indigo-200 rounded-2xl p-5">
              <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-indigo-600" />
                <span>The Core Big Picture</span>
              </div>
              <p className="text-sm text-indigo-950 font-medium leading-relaxed">
                {breakdown.coreIntuition}
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200 rounded-2xl p-5">
              <div className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-600" />
                <span>Everyday Real-World Analogy</span>
              </div>
              <p className="text-sm text-amber-950 leading-relaxed font-medium">
                {breakdown.realWorldAnalogy}
              </p>
            </div>
          </div>

          {/* Interactive Step-by-Step Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>Step-by-Step Logic Progression</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {breakdown.steps.length} Key Steps
              </span>
            </div>

            <div className="space-y-4">
              {breakdown.steps.map((st, idx) => (
                <div
                  key={st.stepNumber}
                  className="border border-slate-200 rounded-2xl p-4.5 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {st.stepNumber}
                    </span>
                    <div className="flex-1 space-y-1.5">
                      <h4 className="text-sm font-bold text-slate-900">{st.stepTitle}</h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {st.explanation}
                      </p>

                      {st.exampleOrCode && (
                        <div className="mt-2 bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-xs overflow-x-auto">
                          {st.exampleOrCode}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pitfalls & Misconceptions to Avoid */}
          {breakdown.commonPitfalls && breakdown.commonPitfalls.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Common Student Traps & Misconceptions</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-rose-950">
                {breakdown.commonPitfalls.map((pitfall, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold shrink-0">&times;</span>
                    <span>{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Comprehension Check */}
          {breakdown.quickComprehensionCheck && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                    Quick Self-Check
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {breakdown.quickComprehensionCheck.question}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAnswer(!showAnswer)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-colors shrink-0"
                >
                  {showAnswer ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide Answer</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Reveal Answer</span>
                    </>
                  )}
                </button>
              </div>

              {showAnswer && (
                <div className="mt-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm text-emerald-950">
                  <strong className="block mb-1 text-emerald-800">Check Answer:</strong>
                  <p>{breakdown.quickComprehensionCheck.answer}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
