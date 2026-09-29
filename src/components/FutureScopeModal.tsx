import React from 'react';
import { X, Rocket, Sparkles, CheckCircle2 } from 'lucide-react';

interface FutureScopeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FUTURE_FEATURES = [
  {
    title: '🚀 AI Voice Assistant',
    desc: 'Real-time conversational voice dialogue with natural pronunciation and instant clarification.',
    status: 'In Development',
  },
  {
    title: '🚀 Personalized Learning Paths',
    desc: 'Dynamic mastery trees customized to syllabus requirements, exam boards, and weak-point diagnostics.',
    status: 'Planned',
  },
  {
    title: '🚀 Tamil Language Support',
    desc: 'Full bilingual Tamil and English explanations, viva tutoring, and vernacular conceptual guides.',
    status: 'Active Feature',
  },
  {
    title: '🚀 Performance Analytics Dashboard',
    desc: 'Retention graphs, time-per-question metrics, accuracy breakdowns, and subject mastery radar charts.',
    status: 'In Development',
  },
  {
    title: '🚀 Smart Flashcards',
    desc: 'Spaced repetition engine (SM-2 algorithm) for long-term memory retention and scheduled daily reviews.',
    status: 'Active Feature',
  },
  {
    title: '🚀 Attendance & Reminder System',
    desc: 'Automated study session alerts, timetable tracking, and exam countdown notifications.',
    status: 'Planned',
  },
  {
    title: '🚀 AI Assignment Generator',
    desc: 'Customized problem sets, case studies, coding assignments, and rubric-based auto-grading.',
    status: 'Planned',
  },
];

export const FutureScopeModal: React.FC<FutureScopeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-100">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Future Scope & Roadmap
              </h2>
              <p className="text-xs text-slate-500">Upcoming innovations for EduGenie AI</p>
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

        {/* Feature List */}
        <div className="mt-4 space-y-3">
          {FUTURE_FEATURES.map((feat, index) => (
            <div
              key={index}
              className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-indigo-50/40 hover:border-indigo-200 transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-slate-900">{feat.title}</h3>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    feat.status === 'Active Feature'
                      ? 'bg-emerald-100 text-emerald-800'
                      : feat.status === 'In Development'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {feat.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Powered by Google Gemini
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Roadmap
          </button>
        </div>
      </div>
    </div>
  );
};
