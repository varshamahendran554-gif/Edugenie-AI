import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Flame,
  CheckCircle,
  Clock,
  BookOpen,
  FileCheck,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { StudentLevel, SubjectCategory, LanguageMode } from '../types';
import { renderMarkdown } from '../utils/markdown';

interface ExamPrepViewProps {
  studentLevel: StudentLevel;
  selectedSubject: SubjectCategory;
  language?: LanguageMode;
}

export const ExamPrepView: React.FC<ExamPrepViewProps> = ({
  studentLevel,
  selectedSubject,
  language,
}) => {
  const [examType, setExamType] = useState('Final Board / University Exams');
  const [targetTopics, setTargetTopics] = useState('');
  const [timeAvailableWeeks, setTimeAvailableWeeks] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [prepContent, setPrepContent] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateExamKit = async () => {
    setIsLoading(true);
    setPrepContent(null);
    setErrorMessage(null);

    try {
      // Primary: call dedicated /api/exam-prep
      const response = await fetch('/api/exam-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          examType,
          studentLevel,
          targetTopics,
          timeAvailableWeeks,
          language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.content) {
          setPrepContent(data.content);
          return;
        }
      }

      // If /api/exam-prep had an issue, attempt fallback to /api/chat with non-streaming
      const chatPrompt = `Generate a high-yield, structured Exam Preparation Guide for a student.
Target Subject: ${selectedSubject}
Exam Type: ${examType}
Student Level: ${studentLevel}
Key Topics to prioritize: ${targetTopics || 'All standard syllabus high-weightage topics'}
Time Remaining: ${timeAvailableWeeks} weeks

Provide:
1. ## 🎯 Important Exam Questions & High-Yield Topics (Ranked by priority with model points)
2. ## 📅 Strategic Revision Plan (Daily/weekly countdown schedule)
3. ## 💡 Exam Tips & Hall Strategy (Time management, presentation, and avoiding traps)
4. ## 📜 Quick Formula & Definition Cheat-Sheet`;

      const fallbackResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: chatPrompt }],
          studentLevel,
          subject: selectedSubject,
          mode: 'Exam Preparation Mode',
          language,
          stream: false,
        }),
      });

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.text) {
          setPrepContent(fallbackData.text);
          return;
        }
      }

      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || 'Could not generate exam prep guide. Please tap retry.');
    } catch (err: any) {
      console.error('Error generating exam prep:', err);
      setErrorMessage(
        err.message || 'Could not generate exam kit. Please check your connection and tap retry.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!prepContent) return;
    navigator.clipboard.writeText(prepContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Banner - Blue and White Educational Theme */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-sky-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-blue-500/15 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold uppercase tracking-wider mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
            <span>High-Yield Revision & Score Maximizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Exam Preparation Mode
          </h1>
          <p className="mt-1 text-blue-100 text-sm max-w-xl">
            Get high-weightage topic tier lists, formula cheat-sheets, past-paper style model
            questions, and mark-saving time strategies.
          </p>
        </div>
      </div>

      {/* Input Parameters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Exam Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Exam Name / Format
            </label>
            <input
              type="text"
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              placeholder="e.g. University Semester Exam, AP Chemistry, CBSE Class 12, GRE Quantitative"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Time Remaining</span>
              <span className="text-blue-600 font-bold">{timeAvailableWeeks} Weeks</span>
            </label>
            <select
              aria-label="Time Remaining Before Exam"
              value={timeAvailableWeeks}
              onChange={(e) => setTimeAvailableWeeks(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 bg-white"
            >
              <option value={1}>1 Week (Emergency Sprint)</option>
              <option value={2}>2 Weeks (Core High-Yield)</option>
              <option value={4}>4 Weeks (Comprehensive Master)</option>
              <option value={8}>8 Weeks (Full Syllabus Coverage)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Specific High-Focus Chapters or Weak Areas (Optional)
            </label>
            <input
              type="text"
              value={targetTopics}
              onChange={(e) => setTargetTopics(e.target.value)}
              placeholder="e.g. Thermodynamics, Dynamic Programming, Integration by parts, Balance Sheet consolidation"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={handleGenerateExamKit}
              className="font-bold underline ml-2 hover:text-red-900"
            >
              Retry
            </button>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGenerateExamKit}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md ${
              isLoading
                ? 'bg-blue-400 text-white cursor-wait'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 hover:scale-102'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Generating Exam Master Kit...' : 'Generate Exam Prep Kit'}</span>
          </button>
        </div>
      </div>

      {/* Generated Content */}
      {prepContent && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Exam Preparation Kit
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {selectedSubject} &bull; {examType}
              </h3>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Kit' : 'Copy Kit'}</span>
            </button>
          </div>

          <div
            className="edugenie-prose text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(prepContent) }}
          />
        </div>
      )}
    </div>
  );
};
