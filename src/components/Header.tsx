import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  FileText,
  Award,
  GraduationCap,
  Briefcase,
  Flame,
  Globe,
  BarChart3,
  MessageSquare,
  Download,
  Smartphone,
  Monitor,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AppMode, StudentLevel, SubjectCategory, LanguageMode } from '../types';

interface HeaderProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  studentLevel: StudentLevel;
  onSelectLevel: (level: StudentLevel) => void;
  selectedSubject: SubjectCategory;
  onSelectSubject: (subject: SubjectCategory) => void;
  language: LanguageMode;
  onSelectLanguage: (lang: LanguageMode) => void;
  onOpenDashboard: () => void;
  onOpenFutureScope: () => void;
  onOpenExport: () => void;
  streakCount: number;
  isDeviceFrameActive?: boolean;
  onToggleDeviceFrame?: () => void;
}

const COURSES: { code: string; name: string; subject: SubjectCategory }[] = [
  { code: 'CS 201', name: 'Computer Science & Algorithms', subject: 'Computer Science' },
  { code: 'MATH 152', name: 'Calculus & Linear Algebra', subject: 'Mathematics' },
  { code: 'SCI 210', name: 'General & Applied Sciences', subject: 'Science' },
  { code: 'COMM 101', name: 'Commerce & Financial Systems', subject: 'Commerce' },
  { code: 'GEN 100', name: 'General Knowledge & Logic', subject: 'General Knowledge' },
];

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  studentLevel,
  onSelectLevel,
  selectedSubject,
  onSelectSubject,
  language,
  onSelectLanguage,
  onOpenDashboard,
  onOpenFutureScope,
  onOpenExport,
  streakCount,
  isDeviceFrameActive = false,
  onToggleDeviceFrame,
}) => {
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);

  const currentCourse = COURSES.find((c) => c.subject === selectedSubject) || COURSES[0];

  const navLinks: { id: AppMode; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'chat', label: 'AI Tutor' },
    { id: 'quiz', label: 'Quiz Arena' },
    { id: 'study-planner', label: 'Study Planner' },
    { id: 'notes-summarizer', label: 'Notes & Flashcards' },
    { id: 'interview-prep', label: 'Viva & Interview' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Navbar Row */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Collegiate Brand Title */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onSelectMode('dashboard')}
              className="flex items-center gap-2.5 text-left group transition-transform active:scale-98"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center text-white font-bold shadow-sm shadow-blue-700/20 group-hover:bg-blue-800 transition-colors">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                    EduGenie <span className="text-blue-700 font-extrabold">AI</span>
                  </span>
                  <span className="hidden sm:inline text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    University Edition
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium hidden md:inline">
                  Personalized Learning Platform
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Text with subtle underline / active state) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = currentMode === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => onSelectMode(link.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200/70 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Academic Course Selector & Functional Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Course Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 text-xs text-slate-800 font-semibold transition-all shadow-2xs"
                title="Select Academic Course"
              >
                <span className="text-blue-700 font-mono font-bold">{currentCourse.code}</span>
                <span className="hidden sm:inline text-slate-600 truncate max-w-[110px]">
                  {selectedSubject}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isCourseDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Enrolled Courses & Subjects
                  </div>
                  {COURSES.map((course) => (
                    <button
                      key={course.code}
                      type="button"
                      onClick={() => {
                        onSelectSubject(course.subject);
                        setIsCourseDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                        selectedSubject === course.subject
                          ? 'bg-blue-50/80 text-blue-900 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-700 text-[11px] bg-white px-1.5 py-0.5 rounded border border-blue-200">
                          {course.code}
                        </span>
                        <span className="truncate">{course.name}</span>
                      </div>
                      {selectedSubject === course.subject && (
                        <span className="text-blue-600 font-bold text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Academic Level Selector */}
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-xl text-xs border border-slate-200/80">
              {(['Beginner', 'Intermediate', 'Advanced'] as StudentLevel[]).map((lvl) => {
                const isActive = studentLevel === lvl;
                const label = lvl === 'Beginner' ? 'Undergrad' : lvl === 'Intermediate' ? 'Core' : 'Honours';
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => onSelectLevel(lvl)}
                    title={`Curriculum Depth: ${lvl}`}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-blue-800 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Language Selector */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs border border-slate-200/80">
              <button
                type="button"
                onClick={() => onSelectLanguage('en')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  language === 'en'
                    ? 'bg-white text-blue-800 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onSelectLanguage('ta')}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  language === 'ta'
                    ? 'bg-white text-blue-800 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="தமிழ் (Tamil)"
              >
                தமிழ்
              </button>
            </div>

            {/* Study Streak Badge */}
            <div
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold shadow-2xs cursor-pointer hover:bg-amber-100 transition-colors"
              onClick={onOpenDashboard}
              title="Consecutive Daily Study Streak"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{streakCount}d</span>
            </div>

            {/* Device Viewport Toggle (Android Smartphone vs Fullscreen Tablet) */}
            {onToggleDeviceFrame && (
              <button
                type="button"
                onClick={onToggleDeviceFrame}
                title={isDeviceFrameActive ? "Switch to Fullscreen Tablet View" : "Simulate Android Smartphone Frame"}
                className={`hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isDeviceFrameActive
                    ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isDeviceFrameActive ? (
                  <>
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Android</span>
                  </>
                ) : (
                  <>
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Tablet</span>
                  </>
                )}
              </button>
            )}

            {/* GitHub Project Archive Export */}
            <button
              type="button"
              onClick={onOpenExport}
              title="Download Project Source ZIP for GitHub"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-98"
            >
              <Download className="w-3.5 h-3.5 text-sky-300" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Mobile / Compact Navigation Bar */}
        <div className="flex lg:hidden items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {navLinks.map((link) => {
            const isActive = currentMode === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => onSelectMode(link.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
