export type StudentLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type LanguageMode = 'en' | 'ta' | 'bilingual';

export type SubjectCategory =
  | 'General Knowledge'
  | 'Computer Science'
  | 'Mathematics'
  | 'Science'
  | 'Commerce';

export type AppMode =
  | 'dashboard'
  | 'chat'
  | 'quiz'
  | 'study-planner'
  | 'notes-summarizer'
  | 'interview-prep'
  | 'doubt-clarifier'
  | 'exam-prep';

export interface CollegeCourse {
  code: string;
  name: string;
  subject: SubjectCategory;
  credits: number;
  progress: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  subject?: string;
  level?: StudentLevel;
  mode?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  hint: string;
  explanation: string;
  concept: string;
}

export interface QuizData {
  title: string;
  topic: string;
  subject: string;
  difficulty: string;
  questions: QuizQuestion[];
}

export interface StudyDaySchedule {
  dayNumber: number;
  dayTitle: string;
  primarySubject: string;
  focusTopics: string[];
  tasks: string[];
  allocatedHours: number;
  recommendedResources?: string[];
  completed?: boolean;
}

export interface StudyPlanData {
  title: string;
  targetExam: string;
  overview: string;
  totalDays: number;
  dailyHours: number;
  studyTips: string[];
  schedule: StudyDaySchedule[];
  revisionMilestones: string[];
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface TermDefinition {
  termOrFormula: string;
  explanation: string;
}

export interface NotesSummaryData {
  title: string;
  oneMinuteSummary: string;
  keyTakeaways: string[];
  essentialDefinitionsAndFormulas: TermDefinition[];
  flashcards: Flashcard[];
  practiceCheckQuestions: {
    question: string;
    answer: string;
  }[];
}

export interface DoubtStep {
  stepNumber: number;
  stepTitle: string;
  explanation: string;
  exampleOrCode?: string;
}

export interface DoubtBreakdownData {
  topic: string;
  coreIntuition: string;
  realWorldAnalogy: string;
  steps: DoubtStep[];
  commonPitfalls: string[];
  quickComprehensionCheck: {
    question: string;
    answer: string;
  };
  curatedResources?: string[];
}

export interface InterviewQuestionItem {
  id: number;
  question: string;
  category: string;
  expectedKeyPoints: string[];
  sampleGuidance: string;
}

export interface InterviewEvalResult {
  scoreOutOf10: number;
  feedbackSummary: string;
  strengths: string[];
  areasForImprovement: string[];
  modelAnswer: string;
  proInterviewTip: string;
}
