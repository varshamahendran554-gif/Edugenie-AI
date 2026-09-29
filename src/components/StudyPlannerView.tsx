import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  Circle,
  Sparkles,
  Download,
  Copy,
  Check,
  Target,
  Flame,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { StudyPlanData, StudentLevel, SubjectCategory, LanguageMode } from '../types';

interface StudyPlannerViewProps {
  studentLevel: StudentLevel;
  selectedSubject: SubjectCategory;
  language?: LanguageMode;
}

export const StudyPlannerView: React.FC<StudyPlannerViewProps> = ({
  studentLevel,
  selectedSubject,
  language,
}) => {
  const [examName, setExamName] = useState('Final Semester Examinations');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    selectedSubject,
    'Mathematics',
  ]);
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [totalDays, setTotalDays] = useState(14);
  const [dailyHours, setDailyHours] = useState(3.5);
  const [specificGoals, setSpecificGoals] = useState(
    'Master high-weightage topics, practice previous year questions, and eliminate weak areas.'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlanData | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  // Load saved plan from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('edugenie_study_plan');
      if (saved) {
        setPlan(JSON.parse(saved));
      }
      const savedTasks = localStorage.getItem('edugenie_completed_tasks');
      if (savedTasks) {
        setCompletedTasks(JSON.parse(savedTasks));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: selectedSubjects,
          targetExam: examName,
          totalDays,
          dailyHours,
          currentLevel: studentLevel,
          specificGoals,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate study plan');
      }

      const data: StudyPlanData = await response.json();
      setPlan(data);
      localStorage.setItem('edugenie_study_plan', JSON.stringify(data));
    } catch (err: any) {
      console.error('Error creating study plan:', err);
      alert('Could not generate plan. Please verify the Gemini API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const updated = { ...prev, [taskId]: !prev[taskId] };
      localStorage.setItem('edugenie_completed_tasks', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleSubject = (sub: string) => {
    if (selectedSubjects.includes(sub)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== sub));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const addCustomSubject = () => {
    if (newSubjectInput.trim() && !selectedSubjects.includes(newSubjectInput.trim())) {
      setSelectedSubjects([...selectedSubjects, newSubjectInput.trim()]);
      setNewSubjectInput('');
    }
  };

  const handleCopyMarkdown = () => {
    if (!plan) return;
    let md = `# ${plan.title}\n\n`;
    md += `**Target Exam:** ${plan.targetExam} | **Total Days:** ${plan.totalDays} | **Daily Hours:** ${plan.dailyHours} hrs/day\n\n`;
    md += `### Strategy Overview\n${plan.overview}\n\n`;
    md += `### Study Tips\n${plan.studyTips.map((t) => `- ${t}`).join('\n')}\n\n`;
    md += `### Day-by-Day Schedule\n\n`;

    plan.schedule.forEach((day) => {
      md += `#### Day ${day.dayNumber}: ${day.dayTitle} (${day.primarySubject} - ${day.allocatedHours} hrs)\n`;
      md += `**Topics:** ${day.focusTopics.join(', ')}\n`;
      md += `**Tasks:**\n`;
      day.tasks.forEach((t) => {
        md += `- [ ] ${t}\n`;
      });
      if (day.recommendedResources?.length) {
        md += `**Resources:** ${day.recommendedResources.join(', ')}\n`;
      }
      md += `\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Progress calculations
  const allTasksCount =
    plan?.schedule.reduce((acc, curr) => acc + (curr.tasks ? curr.tasks.length : 0), 0) || 0;
  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = allTasksCount > 0 ? Math.round((completedCount / allTasksCount) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Intro Header - Blue and White Educational Theme */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-blue-500/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Personalized AI Study Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Personalized Study Planner
          </h1>
          <p className="mt-2 text-blue-100 text-sm max-w-xl leading-relaxed">
            Build a science-backed, day-by-day revision roadmap customized to your exam date,
            daily study capacity, subjects, and current mastery level.
          </p>
        </div>

        {plan && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 text-center min-w-[160px]">
            <div className="text-3xl font-extrabold text-white">{progressPercent}%</div>
            <div className="text-xs text-blue-200 mt-1">Study Progress</div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div
                className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="text-[11px] text-blue-200 mt-1">
              {completedCount} of {allTasksCount} tasks done
            </div>
          </div>
        )}
      </div>

      {/* Configuration Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span>Configure Your Study Routine</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Target Exam */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target Exam / Objective
            </label>
            <input
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="e.g. Term 2 Finals, Calculus Midterm, AP Computer Science"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Duration & Daily Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Duration</span>
                <span className="text-blue-600 font-bold">{totalDays} Days</span>
              </label>
              <select
                aria-label="Study Plan Duration"
                value={totalDays}
                onChange={(e) => setTotalDays(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 bg-white"
              >
                <option value={3}>3 Days (Daily Crunch / Urgent)</option>
                <option value={7}>7 Days (Weekly Sprint - Recommended)</option>
                <option value={14}>14 Days (2 Weeks Balanced)</option>
                <option value={30}>30 Days (Monthly Comprehensive)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Daily Hours</span>
                <span className="text-blue-600 font-bold">{dailyHours} hrs</span>
              </label>
              <input
                aria-label="Daily Study Hours"
                type="range"
                min={1}
                max={8}
                step={0.5}
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full accent-blue-600 mt-2"
              />
            </div>
          </div>

          {/* Subjects Selection */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Subjects to Include
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {[
                'Computer Science',
                'Mathematics',
                'Science',
                'Commerce',
                'General Knowledge',
                'Physics',
                'Chemistry',
                'Economics',
              ].map((sub) => {
                const isSelected = selectedSubjects.includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => toggleSubject(sub)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {sub}
                  </button>
                );
              })}
            </div>
            {/* Custom Subject Adder */}
            <div className="flex items-center gap-2 max-w-sm mt-2">
              <input
                type="text"
                value={newSubjectInput}
                onChange={(e) => setNewSubjectInput(e.target.value)}
                placeholder="Add other subject (e.g. World History)"
                className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomSubject();
                  }
                }}
              />
              <button
                type="button"
                onClick={addCustomSubject}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-medium hover:bg-slate-900"
              >
                Add
              </button>
            </div>
          </div>

          {/* Specific Focus / Weak Areas */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Focus Goal / Specific Challenges
            </label>
            <input
              type="text"
              value={specificGoals}
              onChange={(e) => setSpecificGoals(e.target.value)}
              placeholder="e.g. Need extra practice in dynamic programming and calculus derivatives."
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            disabled={isLoading || selectedSubjects.length === 0}
            onClick={handleGeneratePlan}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md ${
              isLoading
                ? 'bg-blue-400 text-white cursor-wait'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 hover:scale-102'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Crafting Your Master Plan...' : 'Generate Personalized Plan'}</span>
          </button>
        </div>
      </div>

      {/* Generated Study Plan Display */}
      {plan && (
        <div className="space-y-6">
          {/* Plan Meta & Actions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">{plan.title}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500">
                <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  {plan.targetExam}
                </span>
                <span>&bull;</span>
                <span>{plan.totalDays} Days Timeline</span>
                <span>&bull;</span>
                <span>{plan.dailyHours} Hours/Day</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied Markdown' : 'Export Plan'}</span>
              </button>
            </div>
          </div>

          {/* Strategy & Tips Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-blue-50/70 border border-blue-100 rounded-2xl p-4 text-xs">
              <div className="font-bold text-blue-900 text-sm mb-1 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-600" />
                <span>Strategy Overview</span>
              </div>
              <p className="text-blue-800 leading-relaxed">{plan.overview}</p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs">
              <div className="font-bold text-amber-900 text-sm mb-1.5 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>High-Yield Retention Tips</span>
              </div>
              <ul className="space-y-1.5 text-amber-900">
                {plan.studyTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold shrink-0">&bull;</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Revision Milestones Banner */}
          {plan.revisionMilestones && plan.revisionMilestones.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="text-xs font-bold text-emerald-900 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span>Revision & Mock Checkpoints</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {plan.revisionMilestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="bg-white/80 border border-emerald-200/80 rounded-xl p-2.5 text-xs text-emerald-950 font-medium"
                  >
                    🚩 {m}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Schedule Cards */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider px-1">
              Daily Action Plan
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {plan.schedule.map((day) => {
                const dayTasks = day.tasks || [];
                const dayDone =
                  dayTasks.length > 0 &&
                  dayTasks.every((_, tIdx) => completedTasks[`d${day.dayNumber}-t${tIdx}`]);

                return (
                  <div
                    key={day.dayNumber}
                    className={`bg-white border rounded-2xl p-4 transition-all shadow-xs ${
                      dayDone
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            dayDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {day.dayNumber}
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{day.dayTitle}</h4>
                          <span className="text-xs text-blue-600 font-semibold">
                            {day.primarySubject}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {day.allocatedHours} hrs
                        </span>
                      </div>
                    </div>

                    {/* Topics Covered */}
                    <div className="py-2.5">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Topics:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {day.focusTopics.map((top, tIdx) => (
                          <span
                            key={tIdx}
                            className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-xs font-medium"
                          >
                            {top}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actionable Checklist */}
                    <div className="pt-1 space-y-1.5">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Tasks to Complete:
                      </span>
                      {dayTasks.map((task, tIdx) => {
                        const taskId = `d${day.dayNumber}-t${tIdx}`;
                        const isDone = !!completedTasks[taskId];

                        return (
                          <div
                            key={tIdx}
                            onClick={() => toggleTask(taskId)}
                            className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-xs transition-colors group"
                          >
                            <button
                              type="button"
                              className="mt-0.5 text-slate-400 group-hover:text-blue-600"
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Circle className="w-4 h-4" />
                              )}
                            </button>
                            <span
                              className={`flex-1 ${
                                isDone ? 'line-through text-slate-400' : 'text-slate-800'
                              }`}
                            >
                              {task}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Recommended Resources */}
                    {day.recommendedResources && day.recommendedResources.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">Resources:</span>
                        <span>{day.recommendedResources.join(' • ')}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
