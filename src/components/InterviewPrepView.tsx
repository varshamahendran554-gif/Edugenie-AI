import React, { useState } from 'react';
import {
  Briefcase,
  Sparkles,
  MessageSquare,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  InterviewQuestionItem,
  InterviewEvalResult,
  StudentLevel,
  SubjectCategory,
  LanguageMode,
} from '../types';

interface InterviewPrepViewProps {
  studentLevel: StudentLevel;
  selectedSubject: SubjectCategory;
  language?: LanguageMode;
}

export const InterviewPrepView: React.FC<InterviewPrepViewProps> = ({
  studentLevel,
  selectedSubject,
  language,
}) => {
  const [targetRoleOrTopic, setTargetRoleOrTopic] = useState('Data Structures & Algorithms Intern');
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestionItem[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<InterviewQuestionItem | null>(null);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<InterviewEvalResult | null>(null);

  const handleFetchQuestions = async (presetTopic?: string) => {
    const topicToUse = presetTopic || targetRoleOrTopic;
    setIsLoadingQuestions(true);
    setQuestions([]);
    setActiveQuestion(null);
    setEvalResult(null);

    try {
      const response = await fetch('/api/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToUse,
          subject: selectedSubject,
          action: 'get-questions',
          language,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(data.questions || []);
      if (data.questions && data.questions.length > 0) {
        setActiveQuestion(data.questions[0]);
      }
    } catch (e: any) {
      console.error(e);
      alert('Could not fetch interview questions. Please verify API key.');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!activeQuestion || !studentAnswer.trim()) return;
    setIsEvaluating(true);
    setEvalResult(null);

    try {
      const response = await fetch('/api/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: targetRoleOrTopic,
          subject: selectedSubject,
          action: 'evaluate-answer',
          question: activeQuestion.question,
          studentAnswer,
          language,
        }),
      });

      if (!response.ok) throw new Error('Failed to evaluate answer');
      const data: InterviewEvalResult = await response.json();
      setEvalResult(data);
    } catch (e: any) {
      console.error(e);
      alert('Could not evaluate answer. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const setIsQuestionsLoading = setIsLoadingQuestions;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Banner - Blue and White Educational Theme */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-blue-900/15 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold uppercase tracking-wider mb-2">
            <Briefcase className="w-3.5 h-3.5 text-amber-300" />
            <span>Oral Exam, Placement & Viva Coach</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Interview & Viva Preparation Mode
          </h1>
          <p className="mt-1 text-blue-100 text-sm max-w-xl">
            Practice answering real technical and conceptual interview questions. EduGenie provides
            constructive scores, identifies missing key points, and teaches STAR method delivery.
          </p>
        </div>
      </div>

      {/* Role / Topic Setup */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider">
          Target Role, Viva Subject, or Core Topic
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={targetRoleOrTopic}
            onChange={(e) => setTargetRoleOrTopic(e.target.value)}
            placeholder="e.g. Software Engineer New Grad, Quantitative Analyst, Organic Chemistry Viva, AP Macroeconomics"
            className="flex-1 w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
          />
          <button
            type="button"
            disabled={isLoadingQuestions || !targetRoleOrTopic.trim()}
            onClick={() => handleFetchQuestions()}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md ${
              isLoadingQuestions
                ? 'bg-slate-400 text-white cursor-wait'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoadingQuestions ? 'Generating Questions...' : 'Start Mock Interview'}</span>
          </button>
        </div>

        {/* Suggested Presets */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
          <span className="text-slate-400 font-medium">Quick Presets:</span>
          {[
            'BCA Mock Interview',
            'Data Structures & Algorithms Intern',
            'Operating Systems & Networking Viva',
            'DBMS & SQL Queries',
            'College Physics Lab Viva',
          ].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setTargetRoleOrTopic(preset);
                handleFetchQuestions(preset);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 text-slate-700 text-[11px] font-medium transition-all"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Interview Question Arena */}
      {questions.length > 0 && (
        <div className="space-y-6">
          {/* Question Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setActiveQuestion(q);
                  setStudentAnswer('');
                  setEvalResult(null);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  activeQuestion?.id === q.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                Question {idx + 1} ({q.category})
              </button>
            ))}
          </div>

          {/* Active Question Box */}
          {activeQuestion && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Category: {activeQuestion.category}
                </span>
                <span className="text-xs text-slate-400">Oral Viva / Mock Interview</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                &ldquo;{activeQuestion.question}&rdquo;
              </h3>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
                <strong className="text-slate-800 block mb-0.5">Interviewer Guidance:</strong>
                <p>{activeQuestion.sampleGuidance}</p>
              </div>

              {/* Student Answer Box */}
              <div className="pt-2 space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Your Answer (Type your response as you would explain it to the interviewer):
                </label>
                <textarea
                  rows={5}
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  placeholder="Structure your answer clearly. E.g. Definition, intuition, complexity/formula, example, and trade-offs..."
                  className="w-full p-3.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 leading-relaxed text-slate-800"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={isEvaluating || !studentAnswer.trim()}
                    onClick={handleEvaluateAnswer}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md ${
                      isEvaluating
                        ? 'bg-blue-400 text-white cursor-wait'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{isEvaluating ? 'Evaluating Your Response...' : 'Submit Answer for Feedback'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Evaluation Results Card */}
          {evalResult && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    EduGenie Interview Evaluation
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Constructive Feedback & Score
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Viva Score</span>
                    <span className="text-2xl font-black text-blue-600">
                      {evalResult.scoreOutOf10} / 10
                    </span>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white ${
                      evalResult.scoreOutOf10 >= 8
                        ? 'bg-emerald-600'
                        : evalResult.scoreOutOf10 >= 6
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  >
                    <Award className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Feedback Summary */}
              <p className="text-sm text-slate-800 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                {evalResult.feedbackSummary}
              </p>

              {/* Strengths and Improvements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs">
                  <h4 className="font-bold text-emerald-900 text-sm mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Key Strengths Observed</span>
                  </h4>
                  <ul className="space-y-1.5 text-emerald-950">
                    {evalResult.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">&bull;</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs">
                  <h4 className="font-bold text-amber-900 text-sm mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <span>Areas to Elevate (Missing Points)</span>
                  </h4>
                  <ul className="space-y-1.5 text-amber-950">
                    {evalResult.areasForImprovement.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">&bull;</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Model Exemplary Answer */}
              <div className="bg-slate-900 text-slate-100 rounded-xl p-5 text-xs sm:text-sm space-y-2">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
                  Exemplary Model Answer:
                </span>
                <p className="leading-relaxed whitespace-pre-wrap">{evalResult.modelAnswer}</p>
              </div>

              {/* Pro Interview Tip */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-950 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block mb-0.5 text-blue-900">Interviewer Pro-Tip:</strong>
                  <span>{evalResult.proInterviewTip}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
