import React, { useState } from 'react';
import { X, Copy, Check, Flame, BookOpen, Award, Plus, Sparkles } from 'lucide-react';
import { StudentStats } from '../hooks/useStudentStats';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: StudentStats;
  onAddTopic: (topic: string) => void;
  onIncrementStreak: () => void;
  formattedText: string;
}

export const DashboardModal: React.FC<DashboardModalProps> = ({
  isOpen,
  onClose,
  stats,
  onAddTopic,
  onIncrementStreak,
  formattedText,
}) => {
  const [copied, setCopied] = useState(false);
  const [newTopic, setNewTopic] = useState('');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTopic.trim()) {
      onAddTopic(newTopic.trim());
      setNewTopic('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Student Dashboard</h2>
              <p className="text-xs text-slate-500">Live progress & academic milestones</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Exact Formatted Dashboard Box */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Formatted Student Report
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs sm:text-sm rounded-2xl shadow-inner whitespace-pre overflow-x-auto leading-relaxed border border-slate-800">
            {formattedText}
          </pre>
        </div>

        {/* Visual Metric Cards */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-100 flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 mb-1.5">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold text-blue-950">{stats.topicsLearned}</span>
            <span className="text-[11px] font-medium text-blue-700">Topics Learned</span>
          </div>

          <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-100 flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 mb-1.5">
              <Award className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold text-purple-950">{stats.quizzesCompleted}</span>
            <span className="text-[11px] font-medium text-purple-700">Quizzes Done</span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-100 flex flex-col items-center text-center relative group">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 mb-1.5">
              <Flame className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold text-amber-950">{stats.studyStreak}</span>
            <span className="text-[11px] font-medium text-amber-700">Days Streak</span>
            <button
              type="button"
              onClick={onIncrementStreak}
              title="Add 1 day to streak"
              className="mt-1 text-[10px] text-amber-800 underline hover:text-amber-950"
            >
              +1 Day
            </button>
          </div>
        </div>

        {/* Recently Mastered Topics List & Add Topic */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
            Learned Topics Portfolio ({stats.learnedTopicTitles.length})
          </h3>

          <form onSubmit={handleAdd} className="flex gap-2 mb-3">
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Add another topic you just mastered..."
              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!newTopic.trim()}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
            {stats.learnedTopicTitles.map((t, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700"
              >
                <span className="truncate pr-2 font-medium">{t}</span>
                <span className="text-emerald-600 shrink-0 font-bold">✓</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
