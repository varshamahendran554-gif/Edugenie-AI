/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ChatView } from './components/ChatView';
import { StudyPlannerView } from './components/StudyPlannerView';
import { NotesSummarizerView } from './components/NotesSummarizerView';
import { QuizGeneratorView } from './components/QuizGeneratorView';
import { DoubtClarifierView } from './components/DoubtClarifierView';
import { ExamPrepView } from './components/ExamPrepView';
import { InterviewPrepView } from './components/InterviewPrepView';
import { DashboardModal } from './components/DashboardModal';
import { FutureScopeModal } from './components/FutureScopeModal';
import { GithubExportModal } from './components/GithubExportModal';
import { useStudentStats } from './hooks/useStudentStats';
import { AppMode, StudentLevel, SubjectCategory, LanguageMode } from './types';
import {
  Sparkles,
  BarChart3,
  Rocket,
  Flame,
  Download,
  MessageSquare,
  Award,
  Calendar,
  FileText,
  Briefcase,
  Wifi,
  BatteryCharging,
  SignalHigh,
  HelpCircle,
  GraduationCap,
} from 'lucide-react';

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('dashboard');
  const [studentLevel, setStudentLevel] = useState<StudentLevel>('Beginner');
  const [selectedSubject, setSelectedSubject] = useState<SubjectCategory>('Computer Science');
  const [language, setLanguage] = useState<LanguageMode>('en');
  const [isDeviceFrameActive, setIsDeviceFrameActive] = useState(false);

  // Modals
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isFutureScopeOpen, setIsFutureScopeOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Live Clock
  const [currentTime, setCurrentTime] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Student stats management
  const {
    stats,
    addLearnedTopic,
    incrementQuizzesCompleted,
    incrementStreak,
    getFormattedDashboard,
  } = useStudentStats();

  // Bottom Navigation tabs for compact / mobile screens
  const navTabs: { id: AppMode; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'chat', label: 'AI Tutor', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'quiz', label: 'Quiz', icon: <Award className="w-5 h-5" /> },
    { id: 'study-planner', label: 'Planner', icon: <Calendar className="w-5 h-5" /> },
    { id: 'notes-summarizer', label: 'Summarizer', icon: <FileText className="w-5 h-5" /> },
    { id: 'interview-prep', label: 'Viva', icon: <Briefcase className="w-5 h-5" /> },
  ];

  const appContent = (
    <div className="flex flex-col min-h-screen bg-slate-50/70 text-slate-900 font-sans selection:bg-blue-700 selection:text-white">
      {/* Mobile Android System Status Bar (Shown on compact or inside phone frame) */}
      <div className="lg:hidden bg-white border-b border-slate-200/80 px-4 py-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-600 select-none">
        <span className="font-bold tracking-tight text-slate-900">{currentTime}</span>
        <div className="flex items-center gap-2 text-slate-500">
          <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-mono font-bold">5G</span>
          <SignalHigh className="w-3.5 h-3.5 text-slate-600" />
          <Wifi className="w-3.5 h-3.5 text-slate-600" />
          <div className="flex items-center gap-0.5">
            <span className="text-[10px] text-slate-700">100%</span>
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Top Academic Navigation Bar */}
      <Header
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        studentLevel={studentLevel}
        onSelectLevel={setStudentLevel}
        selectedSubject={selectedSubject}
        onSelectSubject={setSelectedSubject}
        language={language}
        onSelectLanguage={setLanguage}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenFutureScope={() => setIsFutureScopeOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        streakCount={stats.studyStreak}
        isDeviceFrameActive={isDeviceFrameActive}
        onToggleDeviceFrame={() => setIsDeviceFrameActive(!isDeviceFrameActive)}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-20 lg:pb-10 overflow-y-auto">
        {currentMode === 'dashboard' && (
          <DashboardView
            stats={stats}
            studentLevel={studentLevel}
            selectedSubject={selectedSubject}
            onSelectMode={setCurrentMode}
            onIncrementStreak={incrementStreak}
            onAddTopic={addLearnedTopic}
            formattedText={getFormattedDashboard()}
          />
        )}

        {currentMode === 'chat' && (
          <ChatView
            studentLevel={studentLevel}
            selectedSubject={selectedSubject}
            language={language}
            onOpenMode={setCurrentMode}
            stats={stats}
            onAddTopic={addLearnedTopic}
            onOpenDashboard={() => setIsDashboardOpen(true)}
            onOpenFutureScope={() => setIsFutureScopeOpen(true)}
          />
        )}

        {currentMode === 'quiz' && (
          <QuizGeneratorView
            studentLevel={studentLevel}
            selectedSubject={selectedSubject}
            language={language}
            onQuizCompleted={incrementQuizzesCompleted}
            onTopicLearned={addLearnedTopic}
          />
        )}

        {currentMode === 'study-planner' && (
          <StudyPlannerView
            studentLevel={studentLevel}
            selectedSubject={selectedSubject}
            language={language}
          />
        )}

        {currentMode === 'notes-summarizer' && (
          <NotesSummarizerView
            studentLevel={studentLevel}
            selectedSubject={selectedSubject}
            language={language}
          />
        )}

        {currentMode === 'interview-prep' && (
          <InterviewPrepView
            studentLevel={studentLevel}
            selectedSubject={selectedSubject}
            language={language}
          />
        )}

        {currentMode === 'doubt-clarifier' && (
          <DoubtClarifierView
            studentLevel={studentLevel}
            selectedSubject={selectedSubject}
            language={language}
            onTopicLearned={addLearnedTopic}
          />
        )}

        {currentMode === 'exam-prep' && (
          <ExamPrepView
            studentLevel={studentLevel}
            selectedSubject={selectedSubject}
            language={language}
          />
        )}
      </main>

      {/* Collegiate Academic Footer (Desktop) */}
      <footer className="hidden lg:block border-t border-slate-200/90 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">🎓 EduGenie AI</span>
            <span>·</span>
            <span>Collegiate Academic Platform</span>
            <span>·</span>
            <span className="text-[11px] text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
              Powered by Google Gemini AI
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => setIsDashboardOpen(true)}
              className="text-slate-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Academic Transcript ({stats.topicsLearned} Topics · {stats.studyStreak}d Streak)
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setIsFutureScopeOpen(true)}
              className="text-slate-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Roadmap
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setIsExportOpen(true)}
              className="text-slate-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Export Codebase (GitHub ZIP)
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Action Button (FAB) for Instant AI Tutor */}
      {currentMode !== 'chat' && (
        <button
          type="button"
          onClick={() => setCurrentMode('chat')}
          title="Consult EduGenie Academic Tutor"
          aria-label="Consult EduGenie Academic Tutor"
          className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-700/25 transition-all hover:scale-105 active:scale-95 border-2 border-white"
        >
          <Sparkles className="w-4 h-4 animate-spin text-sky-200" />
          <span>Ask AI Tutor</span>
        </button>
      )}

      {/* Mobile Bottom Navigation Bar (Shown on Mobile / Small screens) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 sm:px-6 py-1.5 flex items-center justify-around max-w-7xl mx-auto">
        {navTabs.map((tab) => {
          const isActive = currentMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCurrentMode(tab.id)}
              className="flex flex-col items-center gap-0.5 py-1 px-2.5 sm:px-4 rounded-xl transition-all select-none group"
            >
              <div
                className={`flex items-center justify-center w-10 h-6 rounded-full transition-all ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-500 group-hover:text-blue-700 group-hover:bg-blue-50/70'
                }`}
              >
                {tab.icon}
              </div>
              <span
                className={`text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-blue-700 font-bold' : 'text-slate-500 group-hover:text-slate-800'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Mobile Gesture Bar */}
      <div className="lg:hidden fixed bottom-0.5 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        <div className="w-24 h-1 bg-slate-300 rounded-full mx-auto" />
      </div>

      {/* Interactive Modals */}
      <DashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        stats={stats}
        onAddTopic={addLearnedTopic}
        onIncrementStreak={incrementStreak}
        formattedText={getFormattedDashboard()}
      />

      <FutureScopeModal
        isOpen={isFutureScopeOpen}
        onClose={() => setIsFutureScopeOpen(false)}
      />

      <GithubExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );

  // If Android Smartphone Simulation Frame mode is toggled
  if (isDeviceFrameActive) {
    return (
      <div className="min-h-screen bg-slate-900 py-6 px-4 flex flex-col items-center justify-center">
        {/* Device Switcher Bar on Top of Frame */}
        <div className="w-full max-w-[430px] flex items-center justify-between text-white text-xs mb-3 px-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-300">Android Simulation View</span>
          </div>
          <button
            type="button"
            onClick={() => setIsDeviceFrameActive(false)}
            className="px-3 py-1 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-medium shadow-xs transition-colors"
          >
            Switch to Fullscreen Desktop
          </button>
        </div>

        {/* Android Smartphone Chassis */}
        <div className="w-full max-w-[420px] h-[860px] max-h-[92vh] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-[5px] border-slate-700/80 relative flex flex-col overflow-hidden">
          {/* Top Camera Punch Hole & Speaker */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-50 flex items-center justify-center gap-2 border border-slate-800">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
            <div className="w-8 h-1 rounded-full bg-slate-800" />
          </div>

          {/* Screen Display Container */}
          <div className="w-full h-full rounded-[38px] overflow-hidden flex flex-col bg-white relative">
            {appContent}
          </div>
        </div>
      </div>
    );
  }

  // Default Fullscreen Collegiate Web App Layout
  return appContent;
}
