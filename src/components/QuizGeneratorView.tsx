import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Brain,
  Lightbulb,
  Check,
  ChevronRight,
} from 'lucide-react';
import { QuizData, StudentLevel, SubjectCategory, LanguageMode } from '../types';

  interface QuizGeneratorViewProps {
  studentLevel: StudentLevel;
  selectedSubject: SubjectCategory;
  language?: LanguageMode;
  onQuizCompleted?: (score?: number, total?: number) => void;
  onTopicLearned?: (topic: string) => void;
}

const SAMPLE_TOPICS: Record<SubjectCategory, string[]> = {
  'Computer Science': [
    'Python MCQs (Functions, Loops, OOP)',
    'Data Structures & Algorithms',
    "Dijkstra's Algorithm & Graph Traversals",
    'Object-Oriented Programming (OOP) Principles',
    'Time Complexity & Big-O Notation',
  ],
  Mathematics: [
    'Differential Calculus & Chain Rule',
    'Matrices & Determinants',
    'Probability Distributions',
    'Trigonometric Identities & Applications',
  ],
  Science: [
    'Cellular Respiration & Krebs Cycle',
    'Thermodynamics & Heat Engines',
    'Chemical Bonding & Hybridization',
    'Electromagnetism & Faraday’s Law',
  ],
  Commerce: [
    'Double-Entry Accounting & Trial Balance',
    'Market Structures (Monopoly vs Oligopoly)',
    'Financial Statements & Ratio Analysis',
    'Macroeconomic Fiscal Policy',
  ],
  'General Knowledge': [
    'World Geography & Major Capitals',
    'Milestones in Space Exploration',
    'Global Environmental Treaties',
    'Pioneers in Science & Computing',
  ],
};

export const QuizGeneratorView: React.FC<QuizGeneratorViewProps> = ({
  studentLevel,
  selectedSubject,
  language,
  onQuizCompleted,
  onTopicLearned,
}) => {
  const [topic, setTopic] = useState('Data Structures & Algorithms');
  const [difficulty, setDifficulty] = useState<StudentLevel>(studentLevel);
  const [questionCount, setQuestionCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);

  // Quiz taking state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);

  const handleGenerateQuiz = async (selectedTopic?: string) => {
    const topicToUse = selectedTopic || topic;
    setIsLoading(true);
    setQuizData(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowHint({});
    setIsQuizSubmitted(false);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToUse,
          subject: selectedSubject,
          difficulty,
          questionCount,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const data: QuizData = await response.json();
      setQuizData(data);
    } catch (err: any) {
      console.error('Quiz generation error:', err);
      alert('Unable to generate quiz. Please check your network and API key.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (isQuizSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
  };

  const toggleHint = (questionIdx: number) => {
    setShowHint((prev) => ({
      ...prev,
      [questionIdx]: !prev[questionIdx],
    }));
  };

  const calculateScore = () => {
    if (!quizData) return 0;
    let correct = 0;
    quizData.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        correct++;
      }
    });
    return correct;
  };

  const handleSubmitQuiz = () => {
    setIsQuizSubmitted(true);
    const score = calculateScore();
    const total = quizData?.questions.length || 1;
    const ratio = score / total;

    // Record stats
    if (onQuizCompleted) {
      onQuizCompleted(score, total);
    }
    if (quizData?.topic && onTopicLearned) {
      onTopicLearned(quizData.topic);
    }

    if (ratio >= 0.7) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore if confetti fails
      }
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowHint({});
    setIsQuizSubmitted(false);
  };

  const currentQ = quizData?.questions[currentQuestionIndex];
  const isOptionSelected = (optIdx: number) =>
    selectedAnswers[currentQuestionIndex] === optIdx;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Banner - Blue and White Educational Theme */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-blue-500/15 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Interactive Learning Arena</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            EduGenie Quiz Arena
          </h1>
          <p className="mt-1 text-blue-100 text-sm max-w-lg">
            Test and sharpen your comprehension with adaptive MCQs, instant pedagogical
            explanations, and smart hints.
          </p>
        </div>
        <div className="hidden sm:block">
          <Brain className="w-16 h-16 text-blue-200/40" />
        </div>
      </div>

      {/* Generator Form */}
      {!quizData && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Quiz Parameters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Topic or Concept
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Photosynthesis, Binary Trees, Inflation, Bayes Theorem"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Difficulty
                </label>
                <select
                  aria-label="Quiz Difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as StudentLevel)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 bg-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Questions
                </label>
                <select
                  aria-label="Number of Questions"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 bg-white"
                >
                  <option value={3}>3 MCQs</option>
                  <option value={5}>5 MCQs</option>
                  <option value={10}>10 MCQs</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick topic pills */}
          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-2">
              Suggested {selectedSubject} Topics:
            </span>
            <div className="flex flex-wrap gap-2">
              {(SAMPLE_TOPICS[selectedSubject] || SAMPLE_TOPICS['General Knowledge']).map(
                (sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTopic(sample);
                      handleGenerateQuiz(sample);
                    }}
                    className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 px-3 py-1.5 rounded-xl font-medium transition-colors"
                  >
                    + {sample}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              disabled={isLoading || !topic.trim()}
              onClick={() => handleGenerateQuiz()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Generating Questions...' : 'Start Quiz'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Quiz In Progress / Completed */}
      {quizData && (
        <div className="space-y-4">
          {/* Header Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                {quizData.subject} &bull; {quizData.difficulty}
              </span>
              <h2 className="text-base font-bold text-slate-900">{quizData.title}</h2>
            </div>
            <button
              type="button"
              onClick={() => setQuizData(null)}
              className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
            >
              New Quiz
            </button>
          </div>

          {!isQuizSubmitted ? (
            /* Active Question Card */
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              {/* Progress & Indicator */}
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span>
                  Question <strong>{currentQuestionIndex + 1}</strong> of{' '}
                  <strong>{quizData.questions.length}</strong>
                </span>
                <div className="flex items-center gap-1">
                  {quizData.questions.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-6 h-6 rounded-md text-xs font-semibold transition-all ${
                        idx === currentQuestionIndex
                          ? 'bg-blue-600 text-white'
                          : selectedAnswers[idx] !== undefined
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {currentQ && (
                <div className="space-y-4">
                  {/* Concept pill */}
                  <span className="inline-block text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    Concept: {currentQ.concept}
                  </span>

                  {/* Question */}
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {currentQ.question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-2.5 pt-2">
                    {currentQ.options.map((option, optIdx) => {
                      const isSelected = isOptionSelected(optIdx);
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(currentQuestionIndex, optIdx)}
                          className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-start gap-3 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-semibold shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1">{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Hint Toggle */}
                  <div className="pt-2">
                    {showHint[currentQuestionIndex] ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block mb-0.5">EduGenie Hint:</strong>
                          <span>{currentQ.hint}</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleHint(currentQuestionIndex)}
                        className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 font-medium"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Need a hint?</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  Previous
                </button>

                {currentQuestionIndex < quizData.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-200"
                  >
                    <Check className="w-4 h-4" />
                    <span>Submit Quiz</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Quiz Results Summary & Review */
            <div className="space-y-6">
              {/* Scorecard */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-xs">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">Academic Evaluation Complete</h3>
                <div className="flex items-center justify-center gap-3 my-3">
                  <div className="text-4xl font-black text-blue-700 tabular-nums">
                    {calculateScore()} / {quizData.questions.length}
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 font-bold text-sm">
                    {calculateScore() / quizData.questions.length >= 0.9
                      ? 'Grade: A+ (Distinction)'
                      : calculateScore() / quizData.questions.length >= 0.8
                      ? 'Grade: A (Honours)'
                      : calculateScore() / quizData.questions.length >= 0.7
                      ? 'Grade: B+ (Merit)'
                      : calculateScore() / quizData.questions.length >= 0.6
                      ? 'Grade: B (Satisfactory)'
                      : 'Grade: Review Required'}
                  </div>
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  {calculateScore() / quizData.questions.length >= 0.8
                    ? 'Outstanding grasp of the theoretical framework! You demonstrated strong conceptual precision across all test scenarios.'
                    : calculateScore() / quizData.questions.length >= 0.5
                    ? 'Solid foundation with minor conceptual gaps. Review the specific derivations and distractor explanations below to lock in mastery.'
                    : 'Valuable diagnostic benchmark. Carefully examine the detailed reasoning provided for each question below to master the core principles.'}
                </p>

                <div className="flex items-center justify-center gap-3 mt-5">
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Quiz</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuizData(null)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>New Topic Quiz</span>
                  </button>
                </div>
              </div>

              {/* Detailed Review per Question */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Detailed Answer Key & Explanations
                </h4>

                {quizData.questions.map((q, idx) => {
                  const studentAns = selectedAnswers[idx];
                  const isCorrect = studentAns === q.correctAnswerIndex;

                  return (
                    <div
                      key={q.id}
                      className={`bg-white border rounded-2xl p-5 shadow-xs transition-all ${
                        isCorrect ? 'border-emerald-200' : 'border-rose-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="font-bold text-sm text-slate-900">
                          {idx + 1}. {q.question}
                        </span>
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-xs bg-rose-50 px-2 py-0.5 rounded-md shrink-0">
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </span>
                        )}
                      </div>

                      {/* Options breakdown */}
                      <div className="space-y-1.5 text-xs my-3">
                        {q.options.map((opt, optIdx) => {
                          const isKey = optIdx === q.correctAnswerIndex;
                          const wasChosen = optIdx === studentAns;

                          return (
                            <div
                              key={optIdx}
                              className={`p-2 rounded-lg flex items-center justify-between ${
                                isKey
                                  ? 'bg-emerald-50 text-emerald-950 font-semibold border border-emerald-200'
                                  : wasChosen
                                  ? 'bg-rose-50 text-rose-950 font-medium border border-rose-200'
                                  : 'text-slate-600 bg-slate-50'
                              }`}
                            >
                              <span>
                                {String.fromCharCode(65 + optIdx)}. {opt}
                              </span>
                              {isKey && <span className="text-[10px] text-emerald-700 font-bold">CORRECT ANSWER</span>}
                              {wasChosen && !isKey && (
                                <span className="text-[10px] text-rose-600 font-bold">YOUR ANSWER</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Pedagogical Explanation */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700">
                        <strong className="text-slate-900 block mb-1">
                          Why this is correct:
                        </strong>
                        <p className="leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
