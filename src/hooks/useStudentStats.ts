import { useState, useEffect } from 'react';

export interface RecentActivity {
  id: string;
  type: 'quiz' | 'tutor' | 'plan' | 'summary' | 'interview';
  title: string;
  timestamp: string;
  badge: string;
}

export interface StudentStats {
  topicsLearned: number;
  quizzesCompleted: number;
  studyStreak: number;
  studyHours: number;
  quizAccuracy: number;
  questionsAnswered: number;
  learnedTopicTitles: string[];
  subjectMastery: Record<string, number>;
  weeklyHours: { day: string; hours: number }[];
  recentActivities: RecentActivity[];
}

const STORAGE_KEY = 'edugenie_student_stats_v2';

const DEFAULT_STATS: StudentStats = {
  topicsLearned: 14,
  quizzesCompleted: 9,
  studyStreak: 6,
  studyHours: 19.5,
  quizAccuracy: 88,
  questionsAnswered: 45,
  learnedTopicTitles: [
    'Data Structures: Arrays & Linked Lists',
    "Dijkstra's Algorithm",
    'Photosynthesis Light Reactions',
    'Bayes Theorem & Probability',
    "Newton's Laws of Motion",
    'Double-Entry Bookkeeping',
    'SQL Joins & Normalization',
    'Binary Search Trees',
    'Supply & Demand Curves',
    'Operating System Deadlocks',
    'Hydrogen Bonding in Water',
    'The Scientific Method',
    'Differential Calculus: Chain Rule',
    'Central Banking & Monetary Policy',
  ],
  subjectMastery: {
    'Computer Science': 88,
    'Mathematics': 76,
    'Science': 84,
    'Commerce': 72,
    'General Knowledge': 92,
  },
  weeklyHours: [
    { day: 'Mon', hours: 2.5 },
    { day: 'Tue', hours: 3.0 },
    { day: 'Wed', hours: 2.0 },
    { day: 'Thu', hours: 3.5 },
    { day: 'Fri', hours: 2.5 },
    { day: 'Sat', hours: 4.0 },
    { day: 'Sun', hours: 2.0 },
  ],
  recentActivities: [
    {
      id: 'act-1',
      type: 'quiz',
      title: 'Scored 5/5 on Data Structures Quiz',
      timestamp: 'Today, 10:30 AM',
      badge: '100% Score',
    },
    {
      id: 'act-2',
      type: 'tutor',
      title: 'Learned Dijkstra Algorithm with AI Tutor',
      timestamp: 'Today, 9:15 AM',
      badge: 'Concept Mastered',
    },
    {
      id: 'act-3',
      type: 'plan',
      title: 'Created 7-Day Semester Finals Study Plan',
      timestamp: 'Yesterday',
      badge: 'Scheduled',
    },
    {
      id: 'act-4',
      type: 'summary',
      title: 'Summarized Operating Systems Notes & 5 Flashcards',
      timestamp: '2 days ago',
      badge: 'Active Recall',
    },
    {
      id: 'act-5',
      type: 'interview',
      title: 'Completed DSA Intern Mock Interview (8/10)',
      timestamp: '3 days ago',
      badge: 'Viva Coach',
    },
  ],
};

export function useStudentStats() {
  const [stats, setStats] = useState<StudentStats>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_STATS, ...parsed };
      }
    } catch (e) {
      // fallback
    }
    return DEFAULT_STATS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      // ignore
    }
  }, [stats]);

  const addLearnedTopic = (topic: string) => {
    if (!topic || !topic.trim()) return;
    const cleanTopic = topic.trim();
    setStats((prev) => {
      const alreadyLearned = prev.learnedTopicTitles.includes(cleanTopic);
      const newTopics = alreadyLearned
        ? prev.learnedTopicTitles
        : [cleanTopic, ...prev.learnedTopicTitles];

      const newActivities: RecentActivity[] = [
        {
          id: `act-${Date.now()}`,
          type: 'tutor',
          title: `Explored: ${cleanTopic}`,
          timestamp: 'Just now',
          badge: 'Tutor Session',
        },
        ...prev.recentActivities.slice(0, 7),
      ];

      return {
        ...prev,
        topicsLearned: alreadyLearned ? prev.topicsLearned : prev.topicsLearned + 1,
        learnedTopicTitles: newTopics,
        studyHours: Math.round((prev.studyHours + 0.25) * 10) / 10,
        recentActivities: newActivities,
      };
    });
  };

  const incrementQuizzesCompleted = (correctCount = 4, totalCount = 5) => {
    setStats((prev) => {
      const newTotalAnswered = prev.questionsAnswered + totalCount;
      const prevTotalCorrect = Math.round((prev.quizAccuracy / 100) * prev.questionsAnswered);
      const newAccuracy = Math.round(((prevTotalCorrect + correctCount) / newTotalAnswered) * 100);

      const newActivities: RecentActivity[] = [
        {
          id: `act-${Date.now()}`,
          type: 'quiz',
          title: `Completed Quiz: ${correctCount}/${totalCount} Score`,
          timestamp: 'Just now',
          badge: `${Math.round((correctCount / totalCount) * 100)}% Result`,
        },
        ...prev.recentActivities.slice(0, 7),
      ];

      return {
        ...prev,
        quizzesCompleted: prev.quizzesCompleted + 1,
        questionsAnswered: newTotalAnswered,
        quizAccuracy: newAccuracy,
        studyHours: Math.round((prev.studyHours + 0.3) * 10) / 10,
        recentActivities: newActivities,
      };
    });
  };

  const incrementStreak = () => {
    setStats((prev) => ({
      ...prev,
      studyStreak: prev.studyStreak + 1,
    }));
  };

  const logActivity = (type: RecentActivity['type'], title: string, badge: string) => {
    setStats((prev) => ({
      ...prev,
      recentActivities: [
        {
          id: `act-${Date.now()}`,
          type,
          title,
          timestamp: 'Just now',
          badge,
        },
        ...prev.recentActivities.slice(0, 7),
      ],
    }));
  };

  const getFormattedDashboard = () => {
    return `━━━━━━━━━━━━━━━━━━━━━━
📊 STUDENT DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━

📚 Topics Learned: ${stats.topicsLearned}
📝 Quizzes Completed: ${stats.quizzesCompleted}
🔥 Study Streak: ${stats.studyStreak} Days
⏱️ Study Hours: ${stats.studyHours} hrs
🎯 Quiz Accuracy: ${stats.quizAccuracy}%

━━━━━━━━━━━━━━━━━━━━━━`;
  };

  return {
    stats,
    addLearnedTopic,
    incrementQuizzesCompleted,
    incrementStreak,
    logActivity,
    getFormattedDashboard,
    setStats,
  };
}
