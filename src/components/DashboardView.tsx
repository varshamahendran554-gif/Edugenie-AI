import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Flame,
  Award,
  BookOpen,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  FileText,
  Briefcase,
  HelpCircle,
  Copy,
  Check,
  TrendingUp,
  Brain,
  GraduationCap,
  Layers,
  ChevronRight,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Target,
  BookmarkCheck,
  CheckSquare,
} from 'lucide-react';
import { AppMode, StudentLevel, SubjectCategory } from '../types';
import { StudentStats } from '../hooks/useStudentStats';

interface DashboardViewProps {
  stats: StudentStats;
  studentLevel: StudentLevel;
  selectedSubject: SubjectCategory;
  onSelectMode: (mode: AppMode) => void;
  onIncrementStreak: () => void;
  onAddTopic: (topic: string) => void;
  formattedText: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  studentLevel,
  selectedSubject,
  onSelectMode,
  onIncrementStreak,
  onAddTopic,
  formattedText,
}) => {
  const [copied, setCopied] = useState(false);
  const [newTopicInput, setNewTopicInput] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // College Student Pomodoro Focus Timer
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'study' | 'break'>('study');

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      if (timerMode === 'study') {
        alert('🎉 Study block complete! Take a 5-minute break.');
        setTimerMode('break');
        setTimerSeconds(5 * 60);
      } else {
        alert('☕ Break finished! Ready for the next study block.');
        setTimerMode('study');
        setTimerSeconds(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, timerMode]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = (mode: 'study' | 'break') => {
    setIsTimerRunning(false);
    setTimerMode(mode);
    setTimerSeconds(mode === 'study' ? 25 * 60 : 5 * 60);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCopyFormatted = () => {
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddNewTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTopicInput.trim()) {
      onAddTopic(newTopicInput.trim());
      setNewTopicInput('');
      setShowAddModal(false);
    }
  };

  // Collegiate Courses Structure
  const courseCards = [
    {
      code: 'CS 201',
      title: 'Computer Science & Algorithms',
      subject: 'Computer Science' as SubjectCategory,
      credits: 4,
      mastery: stats.subjectMastery['Computer Science'] || 88,
      status: 'On Track',
      color: 'border-blue-200 bg-white hover:border-blue-300',
    },
    {
      code: 'MATH 152',
      title: 'Calculus & Linear Algebra',
      subject: 'Mathematics' as SubjectCategory,
      credits: 4,
      mastery: stats.subjectMastery['Mathematics'] || 76,
      status: 'Midterm Prep',
      color: 'border-blue-200 bg-white hover:border-blue-300',
    },
    {
      code: 'SCI 210',
      title: 'General & Applied Sciences',
      subject: 'Science' as SubjectCategory,
      credits: 3,
      mastery: stats.subjectMastery['Science'] || 84,
      status: 'Lab Review',
      color: 'border-blue-200 bg-white hover:border-blue-300',
    },
    {
      code: 'COMM 101',
      title: 'Commerce & Financial Systems',
      subject: 'Commerce' as SubjectCategory,
      credits: 3,
      mastery: stats.subjectMastery['Commerce'] || 72,
      status: 'Case Study',
      color: 'border-blue-200 bg-white hover:border-blue-300',
    },
    {
      code: 'GEN 100',
      title: 'General Knowledge & Logic',
      subject: 'General Knowledge' as SubjectCategory,
      credits: 2,
      mastery: stats.subjectMastery['General Knowledge'] || 92,
      status: 'Exemplary',
      color: 'border-blue-200 bg-white hover:border-blue-300',
    },
  ];

  // Core Learning Modules
  const coreFeatures = [
    {
      id: 'chat' as AppMode,
      title: 'AI Tutor',
      subtitle: 'Gemini Socratic Explanations',
      desc: 'Ask complex technical doubts, request step-by-step mathematical proofs, and listen to voice tutor readings.',
      icon: <Brain className="w-5 h-5 text-blue-700" />,
      tag: 'Interactive AI',
      btnText: 'Open Tutor',
    },
    {
      id: 'quiz' as AppMode,
      title: 'Quiz Arena',
      subtitle: 'Adaptive MCQ Drills',
      desc: 'Test your grasp of exam concepts with hints, detailed pedagogical keys, and real-time score tracking.',
      icon: <Award className="w-5 h-5 text-blue-700" />,
      tag: `${stats.quizzesCompleted} Quizzes Done`,
      btnText: 'Start Quiz',
    },
    {
      id: 'study-planner' as AppMode,
      title: 'Study Planner',
      subtitle: 'Syllabus & Exam Countdown',
      desc: 'Generate day-by-day revision timetables with Pomodoro intervals and active spaced recall checkpoints.',
      icon: <Calendar className="w-5 h-5 text-blue-700" />,
      tag: 'Timetable',
      btnText: 'View Schedule',
    },
    {
      id: 'notes-summarizer' as AppMode,
      title: 'Notes & Flashcards',
      subtitle: 'Executive Summaries & Recall',
      desc: 'Condense dense lecture handouts and textbook chapters into key takeaways, formula sheets, and flip cards.',
      icon: <FileText className="w-5 h-5 text-blue-700" />,
      tag: 'Active Recall',
      btnText: 'Summarize',
    },
    {
      id: 'interview-prep' as AppMode,
      title: 'Viva & Oral Defense',
      subtitle: 'Placement & Lab Coach',
      desc: 'Practice technical viva voce questions. Receive AI grading out of 10, STAR method feedback, and model answers.',
      icon: <Briefcase className="w-5 h-5 text-blue-700" />,
      tag: 'Placement Prep',
      btnText: 'Practice Viva',
    },
  ];

  // Upcoming Academic Milestones
  const upcomingMilestones = [
    { name: 'Semester Midterm Examinations', due: 'In 12 days', course: 'All Courses', weight: '30% of Grade' },
    { name: 'CS 201 Data Structures Lab Viva', due: 'In 18 days', course: 'CS 201', weight: 'Oral Defense' },
    { name: 'Calculus Series Assignment', due: 'This Friday', course: 'MATH 152', weight: 'Problem Set' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* College Hero Header Banner with University Workspace Imagery */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-sm border border-slate-200">
        {/* Background Image with Measured Scrim */}
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/college_study_workspace_1790693172317.jpg"
            alt="University College Study Workspace"
            className="w-full h-full object-cover object-center opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/90 to-blue-950/80" />
        </div>

        {/* Banner Content */}
        <div className="relative z-10 p-6 sm:p-8 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-200 mb-2">
              <span className="uppercase tracking-wider">Academic Year 2026–2027</span>
              <span aria-hidden="true">·</span>
              <span>Semester Term II</span>
              <span aria-hidden="true">·</span>
              <span className="bg-blue-600/60 px-2 py-0.5 rounded text-white text-[11px]">
                {studentLevel} Level
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Student Academic Workspace
            </h1>
            <p className="mt-2 text-slate-200 text-sm leading-relaxed">
              Welcome back. You are currently studying <strong>{selectedSubject}</strong>. Your study streak is active at{' '}
              <strong className="text-amber-300">{stats.studyStreak} consecutive days</strong> with {stats.studyHours} study hours logged.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-4 text-xs">
              <button
                type="button"
                onClick={() => onSelectMode('chat')}
                className="px-4 py-2 rounded-xl bg-white text-blue-950 hover:bg-slate-100 font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                <span>Ask AI Tutor</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectMode('quiz')}
                className="px-4 py-2 rounded-xl bg-blue-800/80 hover:bg-blue-800 text-white font-semibold transition-all border border-blue-400/30 flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Test Knowledge</span>
              </button>
            </div>
          </div>

          {/* Quick Streak & Focus Widget */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
            {/* Streak Counter */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-xl">
                  🔥
                </div>
                <div>
                  <div className="text-lg font-black text-white tabular-nums">
                    {stats.studyStreak} Days Streak
                  </div>
                  <span className="text-xs text-slate-300">Daily Study Habit</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onIncrementStreak}
                className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors"
                title="Log today's study activity"
              >
                Check In
              </button>
            </div>

            {/* Quick Milestone Reminder */}
            <div className="bg-blue-800/40 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-xs text-slate-200 flex items-center gap-2">
              <Target className="w-4 h-4 text-sky-300 shrink-0" />
              <span>Next Exam Milestone: <strong>Midterms in 12 days</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 4 Academic KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Syllabus Topics Mastered</span>
            <BookOpen className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
            {stats.topicsLearned}
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span>Portfolio Entries</span>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="text-blue-700 font-bold hover:underline"
            >
              + Add Topic
            </button>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Practice Quizzes Completed</span>
            <Award className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
            {stats.quizzesCompleted}
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span>Accuracy: <strong className="text-blue-700">{stats.quizAccuracy}%</strong></span>
            <span className="text-slate-400 font-mono">{stats.questionsAnswered} MCQs</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Consecutive Study Streak</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
            {stats.studyStreak} <span className="text-sm font-semibold text-slate-500">Days</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> High Retention
            </span>
            <span className="text-slate-400">Target: 14d</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Credit Study Hours Logged</span>
            <Clock className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
            {stats.studyHours} <span className="text-sm font-semibold text-slate-500">hrs</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span>Level: <strong className="text-blue-700">{studentLevel}</strong></span>
            <span className="text-slate-400">Term II</span>
          </div>
        </div>
      </div>

      {/* Two-Column Midsection: Pomodoro Focus Timer & Weekly Study Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pomodoro Focus Timer for College Students */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  ⏱
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Study Session Focus Timer</h2>
                  <p className="text-[11px] text-slate-500">Science-backed 25/5 Pomodoro intervals</p>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                timerMode === 'study' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {timerMode === 'study' ? 'Deep Study' : 'Rest Break'}
              </span>
            </div>

            {/* Timer Display */}
            <div className="my-6 text-center">
              <div className="text-5xl font-mono font-black text-slate-900 tracking-tight tabular-nums">
                {formatTimer(timerSeconds)}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {isTimerRunning ? 'Focus block in progress...' : 'Ready to start your next study interval'}
              </p>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTimer}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs ${
                  isTimerRunning
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-blue-700 hover:bg-blue-800 text-white'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause Session</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Start Study Block (25 min)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => resetTimer('study')}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                title="Reset timer to 25 mins"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
              <button
                type="button"
                onClick={() => resetTimer('study')}
                className={`px-2 py-1 rounded text-[11px] font-semibold ${
                  timerMode === 'study' ? 'text-blue-700 font-bold underline' : 'hover:text-slate-900'
                }`}
              >
                25m Study
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => resetTimer('break')}
                className={`px-2 py-1 rounded text-[11px] font-semibold ${
                  timerMode === 'break' ? 'text-emerald-700 font-bold underline' : 'hover:text-slate-900'
                }`}
              >
                5m Short Break
              </button>
            </div>
          </div>
        </div>

        {/* Weekly Study Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-700" />
                  <span>Weekly Study Distribution</span>
                </h2>
                <p className="text-[11px] text-slate-500">Daily hours dedicated to syllabus review</p>
              </div>
              <div className="text-right text-xs">
                <span className="font-bold text-blue-700 tabular-nums">19.5 hrs</span>
                <span className="text-slate-400 block text-[10px]">Weekly Total</span>
              </div>
            </div>

            {/* Bar Chart Visualization */}
            <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
              {stats.weeklyHours.map((item, idx) => {
                const heightPercent = Math.min(100, Math.round((item.hours / 4.5) * 100));
                const isPeak = item.hours >= 3.5;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[11px] font-bold text-slate-500 group-hover:text-blue-700 transition-colors tabular-nums">
                      {item.hours}h
                    </span>
                    <div className="w-full max-w-[42px] bg-slate-100 rounded-t-lg overflow-hidden h-28 flex items-end">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          isPeak
                            ? 'bg-blue-700 group-hover:bg-blue-800'
                            : 'bg-blue-400 group-hover:bg-blue-500'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Average: <strong>2.8 hrs/day</strong></span>
            <span className="text-blue-700 font-medium">Optimal Retention Target: 3.0 hrs/day</span>
          </div>
        </div>
      </div>

      {/* College Courses Syllabus & Mastery Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Enrolled Course Mastery</h2>
            <p className="text-xs text-slate-500">Track comprehension and credit requirements</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">5 Active Courses</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {courseCards.map((course) => (
            <div
              key={course.code}
              className={`p-4 rounded-2xl border ${course.color} transition-all shadow-2xs flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {course.code}
                  </span>
                  <span className="text-[11px] text-slate-400">{course.credits} Credits</span>
                </div>
                <h3 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                  {course.title}
                </h3>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500 text-[11px]">Mastery</span>
                  <span className="font-bold text-blue-700 tabular-nums">{course.mastery}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-700 h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${course.mastery}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5 Core Academic Tools Launchers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Collegiate Learning Modules</h2>
            <p className="text-xs text-slate-500">Primary AI-powered study instruments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coreFeatures.map((feat) => (
            <div
              key={feat.id}
              onClick={() => onSelectMode(feat.id)}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {feat.icon}
                  </div>
                  <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-700 transition-colors">
                  {feat.title}
                </h3>
                <span className="text-xs font-semibold text-blue-600 block mb-2">
                  {feat.subtitle}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {feat.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700 group-hover:text-blue-800">
                <span>{feat.btnText}</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}

          {/* Doubt Clarifier & Exam Prep Quick Card */}
          <div
            onClick={() => onSelectMode('doubt-clarifier')}
            className="bg-gradient-to-br from-blue-50/50 via-white to-slate-50 rounded-2xl p-5 border border-blue-200/80 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded border border-blue-200">
                  Concept Demystifier
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-700 transition-colors">
                Step-by-Step Doubt Solver
              </h3>
              <span className="text-xs font-semibold text-blue-600 block mb-2">
                Atomic Concept Resolution
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Break any counter-intuitive theorem, mathematical derivation, or coding trap into clear logical building blocks with real-world analogies.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-blue-700 group-hover:text-blue-800">
              <span>Clarify a Concept</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Mastered Topics Portfolio & Official Report */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mastered Topics Portfolio */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-700" />
                <span>Mastered Topics Syllabus Log ({stats.learnedTopicTitles.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Concepts clarified and verified through tutor sessions & active recall
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 font-semibold text-xs flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Topic</span>
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {stats.learnedTopicTitles.map((title, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800 hover:bg-blue-50/50 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="truncate font-medium">{title}</span>
                </div>
                <span className="text-emerald-700 shrink-0 font-bold">✓</span>
              </div>
            ))}
          </div>
        </div>

        {/* Official Formatted Academic Report Box */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Official Academic Summary
              </h2>
              <button
                type="button"
                onClick={handleCopyFormatted}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors border border-blue-200"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3.5 bg-slate-900 text-sky-300 font-mono text-xs rounded-xl shadow-inner whitespace-pre overflow-x-auto leading-relaxed border border-slate-800">
              {formattedText}
            </pre>
          </div>

          <p className="text-[11px] text-slate-500 mt-3 text-center">
            Type <code className="text-blue-700 font-semibold font-mono">&quot;show dashboard&quot;</code> in the AI Tutor at any time to generate this transcript.
          </p>
        </div>
      </div>

      {/* Add Topic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Record Mastered Topic</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Concept or Syllabus Module
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newTopicInput}
                  onChange={(e) => setNewTopicInput(e.target.value)}
                  placeholder="e.g. Riemann Integration, Graph Neural Networks, IS-LM Model..."
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTopicInput.trim()}
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs disabled:opacity-40"
                >
                  Save to Transcript
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
