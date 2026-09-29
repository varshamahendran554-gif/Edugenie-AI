import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const EDUGENIE_BASE_SYSTEM_INSTRUCTION = `You are EduGenie AI, a Google Gemini-powered Personalized Learning Assistant designed for school and college students.

PROJECT IDENTITY:
Name: EduGenie AI
Tagline: Personalized Learning Powered by Google Gemini
Badge: 🟣 Powered by Google Gemini AI

Whenever appropriate or starting a formal explanation, you may display the header:
🎓 EduGenie AI
Personalized Learning Powered by Google Gemini

MISSION:
Help students learn effectively through personalized explanations, study planning, quiz generation, note summarization, interview preparation, and exam guidance.

MAIN MODULES & CAPABILITIES:
1. Doubt Clarifier:
   - Explain concepts clearly.
   - Break complex topics into smaller parts.
   - Use examples and analogies.
2. Study Planner:
   - Create daily, weekly, and monthly study schedules.
   - Consider available study hours and exam dates.
3. Quiz Arena:
   - Generate MCQs, short-answer questions, and practice tests.
   - Provide answers separately.
4. Notes & Flashcards:
   - Summarize long notes into key points.
   - Create flashcards for revision.
5. Exam Preparation:
   - Generate important questions.
   - Create revision plans.
   - Provide last-minute exam tips.
6. Interview & Viva Preparation:
   - Conduct mock interviews.
   - Ask viva questions.
   - Evaluate answers and provide feedback.

STUDENT DASHBOARD:
Whenever requested (e.g., student asks for "dashboard", "stats", "my progress", "show dashboard"), display:
━━━━━━━━━━━━━━━━━━━━━━
📊 STUDENT DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━
📚 Topics Learned: 12
📝 Quizzes Completed: 8
🔥 Study Streak: 5 Days
━━━━━━━━━━━━━━━━━━━━━━
(Adjust numbers based on conversation context or acknowledge their ongoing progress).

QUICK ACTIONS ALWAYS SUGGESTED:
📖 Explain Concept
📝 Generate Quiz
📋 Summarize Notes
📅 Create Study Plan
🎤 Mock Interview

LANGUAGE SUPPORT:
- 🌐 English
- 🌐 தமிழ் (Tamil)
- If the user asks in Tamil, respond in Tamil (தமிழ்).
- If the user asks in English, respond in English.
- If requested or set to bilingual, provide bilingual explanations (English with Tamil translation/subtitles).

EXPLANATION STYLE (Adapt dynamically to student level):
- For Beginner: Use simple language. Use real-life examples and analogies. Avoid dense jargon.
- For Intermediate: Use technical terms with clear explanations and practical context.
- For Advanced: Provide detailed concepts, algorithms, edge cases, and deeper mathematical/theoretical understanding.

STANDARD CONCEPT / DOUBT RESPONSE FORMAT:
When explaining a concept or solving a doubt, structure the response clearly using these exact headings:
📌 Introduction
📖 Explanation
💡 Example
📝 Key Points
🎯 Practice Question

FUTURE FEATURES:
When asked about future scope or roadmap, mention:
🚀 AI Voice Assistant
🚀 Personalized Learning Paths
🚀 Tamil Language Support
🚀 Performance Analytics Dashboard
🚀 Smart Flashcards
🚀 Attendance & Reminder System
🚀 AI Assignment Generator

PROJECT DEMO EXAMPLES:
If users need examples of what to ask, suggest:
- Explain Data Structures
- Explain Dijkstra's Algorithm
- Generate Python MCQs
- Create a 7-Day Study Plan
- Summarize Operating Systems Notes
- Conduct a BCA Mock Interview

TONE:
Always maintain a friendly, encouraging, educational, and professional tone. Never provide misleading information; if unsure, mention limitations.`;

const CANDIDATE_MODELS = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'] as const;

async function generateContentWithRetry(params: {
  contents: any;
  systemInstruction?: string;
  responseMimeType?: string;
  responseSchema?: any;
  temperature?: number;
  maxOutputTokens?: number;
}) {
  let lastError: any = null;

  for (let i = 0; i < CANDIDATE_MODELS.length; i++) {
    const model = CANDIDATE_MODELS[i];
    try {
      const result = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction,
          responseMimeType: params.responseMimeType,
          responseSchema: params.responseSchema,
          temperature: params.temperature ?? 0.7,
          ...(params.maxOutputTokens ? { maxOutputTokens: params.maxOutputTokens } : {}),
        },
      });

      if (result && (result.text !== undefined || params.responseSchema)) {
        return result;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`generateContent notice on ${model} (attempt ${i + 1}/${CANDIDATE_MODELS.length}):`, err?.message || err);
      if (i < CANDIDATE_MODELS.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 400 * (i + 1)));
      }
    }
  }

  throw lastError;
}

// 1. Chat endpoint with resilient multi-model Server-Sent Events (SSE) streaming
app.post('/api/chat', async (req, res) => {
  try {
    const {
      messages,
      studentLevel = 'Beginner',
      subject = 'General',
      mode = 'General Doubt',
      language = 'en',
    } = req.body;

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    let languageDirective = 'Respond in English, unless the user writes in Tamil.';
    if (language === 'ta') {
      languageDirective = 'CRITICAL: The student has selected Tamil (தமிழ்). Respond entirely in clear, accurate, student-friendly Tamil (தமிழ்), with technical terms in Tamil alongside English in parentheses where helpful.';
    } else if (language === 'bilingual') {
      languageDirective = 'CRITICAL: The student has selected Bilingual (English + தமிழ்). Provide key explanations in English followed by Tamil (தமிழ்) translation and summaries so the student can learn comfortably in both languages.';
    }

    const systemInstruction = `${EDUGENIE_BASE_SYSTEM_INSTRUCTION}

CURRENT CONTEXT:
- Student Learning Level: ${studentLevel}
- Target Subject: ${subject}
- Active Study Mode: ${mode}
- Language Preference: ${language} (${languageDirective})

Remember to format concept explanations using:
📌 Introduction
📖 Explanation
💡 Example
📝 Key Points
🎯 Practice Question

If the user asks for the dashboard or stats, output the formatted STUDENT DASHBOARD box.
If the user asks about future scope or features, list the 7 future roadmap items.`;

    const contents = (messages || []).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: 'Hello EduGenie!' }],
      });
    }

    // Handle non-streaming requests (e.g. from components or tools)
    if (req.body.stream === false) {
      try {
        const directResponse = await generateContentWithRetry({
          contents,
          systemInstruction,
          temperature: 0.7,
        });
        return res.json({ text: directResponse.text || '' });
      } catch (directErr: any) {
        console.error('Non-streaming chat generation error:', directErr);
        return res.status(500).json({
          error: directErr.message || 'Unable to generate response at this moment.',
          text: 'EduGenie encountered a temporary issue. Please tap retry or ask another question!',
        });
      }
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let hasYieldedText = false;
    let streamSucceeded = false;

    for (const model of CANDIDATE_MODELS) {
      if (streamSucceeded) break;
      try {
        const responseStream = await ai.models.generateContentStream({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        for await (const chunk of responseStream) {
          if (chunk.text) {
            hasYieldedText = true;
            res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
          }
        }
        streamSucceeded = true;
        break;
      } catch (streamErr: any) {
        console.warn(`Stream event on ${model}:`, streamErr?.message);
        // If tokens were already sent to client, the error at the EOF delimiter is benign
        if (hasYieldedText) {
          streamSucceeded = true;
          break;
        }
        // Otherwise continue to next model in CANDIDATE_MODELS
      }
    }

    // Fallback if all streams failed without emitting text
    if (!streamSucceeded && !hasYieldedText) {
      try {
        const fallbackRes = await generateContentWithRetry({
          contents,
          systemInstruction,
          temperature: 0.7,
        });
        if (fallbackRes.text) {
          res.write(`data: ${JSON.stringify({ text: fallbackRes.text })}\n\n`);
        }
      } catch (fallbackErr: any) {
        console.error('All chat fallbacks exhausted:', fallbackErr);
        res.write(
          `data: ${JSON.stringify({
            error: 'EduGenie is temporarily busy. Please tap retry or ask another question.',
          })}\n\n`
        );
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Failed to generate response' });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message || 'Stream ended' })}\n\n`);
      res.end();
    }
  }
});

// Dedicated Exam Prep Generation endpoint
app.post('/api/exam-prep', async (req, res) => {
  try {
    const {
      subject = 'General',
      examType = 'Final Board / University Exams',
      studentLevel = 'Beginner',
      targetTopics = '',
      timeAvailableWeeks = 2,
      language = 'en',
    } = req.body;

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    let languageDirective = 'Respond in English, unless specified otherwise.';
    if (language === 'ta') {
      languageDirective = 'CRITICAL: The student has selected Tamil (தமிழ்). Respond completely in clear, accurate academic Tamil (தமிழ்).';
    } else if (language === 'bilingual') {
      languageDirective = 'CRITICAL: The student has selected Bilingual (English + தமிழ்). Provide key explanations in English followed by Tamil (தமிழ்) translation and summaries.';
    }

    const prompt = `Generate a high-yield, structured Exam Preparation Kit for a student.
Target Subject: ${subject}
Exam Type: ${examType}
Student Level: ${studentLevel}
Key Topics to prioritize: ${targetTopics || 'High-weightage syllabus topics'}
Time Available: ${timeAvailableWeeks} weeks
Language Directive: ${languageDirective}

Create a well-organized, actionable study guide using Markdown headers:
1. ## 🎯 High-Yield Exam Questions & Topics
Provide top 5 priority topics and model exam questions with mark allocation and key answer points.

2. ## 📅 Strategic Revision Schedule
Provide a clear ${timeAvailableWeeks}-week countdown checklist with daily/weekly revision milestones and practice mock tests.

3. ## 💡 Exam-Hall Strategy & Score Maximizer Tips
Provide section time management, answer sheet presentation tips, and common pitfalls/traps to avoid.

4. ## 📜 Essential Formulae, Laws & Concept Cheat-Sheet
Provide key definitions, formulas, and laws in compact, easy-to-review format.`;

    const response = await generateContentWithRetry({
      contents: prompt,
      systemInstruction: `${EDUGENIE_BASE_SYSTEM_INSTRUCTION}\nYou are an expert academic tutor and exam strategist. Provide structured, encouraging, and actionable exam preparation material formatted with clear Markdown headers, bold highlights, and bullet points.`,
      temperature: 0.7,
      maxOutputTokens: 2500,
    });

    res.json({ content: response.text || 'Exam guide generated successfully.' });
  } catch (error: any) {
    console.error('Error in /api/exam-prep:', error);
    res.status(500).json({ error: error.message || 'Failed to generate exam prep guide' });
  }
});

// 2. Interactive Quiz Generator with structured schema
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const {
      topic = 'General Science',
      subject = 'Science',
      difficulty = 'Intermediate',
      questionCount = 5,
    } = req.body;

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const prompt = `Generate a high quality, educational interactive quiz on the topic "${topic}" for the subject "${subject}" at ${difficulty} difficulty level. Total questions: ${questionCount}.
Make questions varied, testing conceptual understanding, application, and common student traps. Each question must include a helpful hint and a thorough, clear pedagogical explanation of why the correct option is right.`;

    const response = await generateContentWithRetry({
      contents: prompt,
      systemInstruction: `${EDUGENIE_BASE_SYSTEM_INSTRUCTION}\nYou are generating a structured academic quiz. Output strictly valid JSON matching the schema.`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Engaging title for the quiz' },
          topic: { type: Type.STRING },
          subject: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                question: { type: Type.STRING, description: 'The question text' },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Four distinct multiple-choice options',
                },
                correctAnswerIndex: {
                  type: Type.INTEGER,
                  description: '0-based index of the correct option (0, 1, 2, or 3)',
                },
                hint: { type: Type.STRING, description: 'A gentle hint without giving away the direct answer' },
                explanation: {
                  type: Type.STRING,
                  description: 'Detailed explanation of the correct concept and why other options are wrong',
                },
                concept: { type: Type.STRING, description: 'Core sub-topic or formula tested' },
              },
              required: ['id', 'question', 'options', 'correctAnswerIndex', 'hint', 'explanation', 'concept'],
            },
          },
        },
        required: ['title', 'topic', 'subject', 'difficulty', 'questions'],
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/generate-quiz:', error);
    res.status(500).json({ error: error.message || 'Failed to generate quiz' });
  }
});

// 3. Personalized Study Plan Generator
app.post('/api/generate-study-plan', async (req, res) => {
  try {
    const {
      subjects = ['Mathematics', 'Computer Science'],
      targetExam = 'Semester Finals',
      totalDays = 14,
      dailyHours = 3,
      currentLevel = 'Intermediate',
      specificGoals = 'Score top grades and master weak areas',
    } = req.body;

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const prompt = `Create a realistic, scientifically structured study plan for a student.
Target Exam: ${targetExam}
Subjects to cover: ${Array.isArray(subjects) ? subjects.join(', ') : subjects}
Total Duration: ${totalDays} days
Available Study Time: ${dailyHours} hours per day
Current Proficiency Level: ${currentLevel}
Specific Goals/Focus: ${specificGoals}

Incorporate active recall, spaced repetition, practice problems, and buffer/revision days before the exam.`;

    const response = await generateContentWithRetry({
      contents: prompt,
      systemInstruction: `${EDUGENIE_BASE_SYSTEM_INSTRUCTION}\nYou are an expert academic advisor and study planner. Generate an actionable, encouraging, and detailed study timetable.`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          targetExam: { type: Type.STRING },
          overview: { type: Type.STRING, description: 'Strategy summary and psychology for this timeline' },
          totalDays: { type: Type.INTEGER },
          dailyHours: { type: Type.NUMBER },
          studyTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Key productivity and retention tips (e.g. Pomodoro, Feynman technique)',
          },
          schedule: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                dayNumber: { type: Type.INTEGER },
                dayTitle: { type: Type.STRING, description: 'e.g., Day 1: Algebra Foundations & Limits' },
                primarySubject: { type: Type.STRING },
                focusTopics: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                tasks: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Specific actionable tasks for this day',
                },
                allocatedHours: { type: Type.NUMBER },
                recommendedResources: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['dayNumber', 'dayTitle', 'primarySubject', 'focusTopics', 'tasks', 'allocatedHours'],
            },
          },
          revisionMilestones: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Key checkpoint dates/tasks for mock tests and review',
          },
        },
        required: ['title', 'targetExam', 'overview', 'totalDays', 'dailyHours', 'studyTips', 'schedule', 'revisionMilestones'],
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/generate-study-plan:', error);
    res.status(500).json({ error: error.message || 'Failed to generate study plan' });
  }
});

// 4. Notes Summarizer & Flashcard Generator
app.post('/api/summarize-notes', async (req, res) => {
  try {
    const { notesText, subject = 'General', detailLevel = 'Comprehensive' } = req.body;

    if (!notesText || notesText.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide notes text to summarize.' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const prompt = `Analyze and summarize the following study notes for a student studying "${subject}".
Detail Level: ${detailLevel}

Notes Text:
"""
${notesText.slice(0, 30000)}
"""

Extract the essence, core formulas/theorems/definitions, key takeaways, flashcard pairs for active recall, and 3 quick conceptual self-test questions.`;

    const response = await generateContentWithRetry({
      contents: prompt,
      systemInstruction: `${EDUGENIE_BASE_SYSTEM_INSTRUCTION}\nYou are a master educator extracting the highest yield study insights from student materials.`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'A clear, descriptive title of the summarized material' },
          oneMinuteSummary: { type: Type.STRING, description: '2-3 sentences capturing the core big picture' },
          keyTakeaways: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'High-yield bullet points of the most essential ideas'
          },
          essentialDefinitionsAndFormulas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                termOrFormula: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ['termOrFormula', 'explanation'],
            },
          },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING, description: 'Question or prompt' },
                back: { type: Type.STRING, description: 'Concise answer' },
              },
              required: ['front', 'back'],
            },
          },
          practiceCheckQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING },
              },
              required: ['question', 'answer'],
            },
          },
        },
        required: ['title', 'oneMinuteSummary', 'keyTakeaways', 'essentialDefinitionsAndFormulas', 'flashcards', 'practiceCheckQuestions'],
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/summarize-notes:', error);
    res.status(500).json({ error: error.message || 'Failed to summarize notes' });
  }
});

// 5. Step-by-Step Doubt Solver & Breakdown
app.post('/api/clarify-doubt', async (req, res) => {
  try {
    const { doubt, subject = 'General', studentLevel = 'Beginner', breakDownDeeper = false } = req.body;

    if (!doubt || doubt.trim().length === 0) {
      return res.status(400).json({ error: 'Please enter a doubt or concept.' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const prompt = `The student has a doubt regarding "${doubt}" in "${subject}".
Student Level: ${studentLevel}.
Deep Breakdown Requested: ${breakDownDeeper ? 'Yes, explain like they are completely new to it, break into fundamental building blocks.' : 'Standard structured step-by-step resolution'}.

Break it down step-by-step. Provide an intuitive real-world analogy, common misconceptions to watch out for, code or formula example if applicable, and a quick reflection question.`;

    const response = await generateContentWithRetry({
      contents: prompt,
      systemInstruction: `${EDUGENIE_BASE_SYSTEM_INSTRUCTION}\nYou are a patient, brilliant tutor who makes complex topics crystal clear.`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          coreIntuition: { type: Type.STRING, description: 'The big picture in simple words' },
          realWorldAnalogy: { type: Type.STRING, description: 'Relatable analogy that sparks the "Aha!" moment' },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stepNumber: { type: Type.INTEGER },
                stepTitle: { type: Type.STRING },
                explanation: { type: Type.STRING },
                exampleOrCode: { type: Type.STRING, description: 'Optional concrete code snippet, math step, or case' },
              },
              required: ['stepNumber', 'stepTitle', 'explanation'],
            },
          },
          commonPitfalls: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Mistakes students frequently make on this concept',
          },
          quickComprehensionCheck: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING },
            },
            required: ['question', 'answer'],
          },
          curatedResources: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['topic', 'coreIntuition', 'realWorldAnalogy', 'steps', 'commonPitfalls', 'quickComprehensionCheck'],
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/clarify-doubt:', error);
    res.status(500).json({ error: error.message || 'Failed to clarify doubt' });
  }
});

// 6. Interview & Oral Exam Prep Mode
app.post('/api/interview-prep', async (req, res) => {
  try {
    const {
      topic = 'Data Structures & Algorithms',
      subject = 'Computer Science',
      action = 'get-questions', // 'get-questions' | 'evaluate-answer'
      question = '',
      studentAnswer = '',
    } = req.body;

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    if (action === 'evaluate-answer') {
      const prompt = `Evaluate the student's interview/viva response:
Topic: ${topic} (${subject})
Interview Question: "${question}"
Student's Answer: "${studentAnswer}"

Evaluate their response with constructive feedback, score out of 10, strengths, missing points/improvements, STAR method advice, and an exemplary model answer.`;

      const response = await generateContentWithRetry({
        contents: prompt,
        systemInstruction: `${EDUGENIE_BASE_SYSTEM_INSTRUCTION}\nYou are a supportive yet discerning mock interviewer and academic viva examiner.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scoreOutOf10: { type: Type.INTEGER },
            feedbackSummary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } },
            modelAnswer: { type: Type.STRING },
            proInterviewTip: { type: Type.STRING },
          },
          required: ['scoreOutOf10', 'feedbackSummary', 'strengths', 'areasForImprovement', 'modelAnswer', 'proInterviewTip'],
        },
      });

      return res.json(JSON.parse(response.text || '{}'));
    }

    // Default: generate interview questions
    const prompt = `Generate 4 realistic technical/conceptual interview & oral exam questions for:
Topic: ${topic}
Subject: ${subject}
Include a mix of fundamental concepts, scenario/problem-solving questions, and common viva traps.`;

    const response = await generateContentWithRetry({
      contents: prompt,
      systemInstruction: `${EDUGENIE_BASE_SYSTEM_INSTRUCTION}\nYou are an expert academic viva examiner and technical interview coach.`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          roleOrTopic: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                question: { type: Type.STRING },
                category: { type: Type.STRING, description: 'Conceptual, Behavioral/STAR, Problem-Solving, or Viva' },
                expectedKeyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                sampleGuidance: { type: Type.STRING },
              },
              required: ['id', 'question', 'category', 'expectedKeyPoints', 'sampleGuidance'],
            },
          },
        },
        required: ['roleOrTopic', 'questions'],
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Error in /api/interview-prep:', error);
    res.status(500).json({ error: error.message || 'Failed to process interview prep' });
  }
});

// 7. Download Project ZIP archive for GitHub export
app.get(['/api/download-zip', '/edugenie-ai.zip'], (_req, res) => {
  const zipPath = path.resolve(__dirname, 'edugenie-ai.zip');
  try {
    // Generate or refresh zip archive using python's built-in zipfile module
    execSync(`python3 -c "
import os, zipfile
EXCLUDE_DIRS = {'node_modules', '.git', 'dist', '.aistudio', '__pycache__', '.cache'}
EXCLUDE_FILES = {'edugenie-ai.zip', '.env', '.env.local'}
with zipfile.ZipFile('edugenie-ai.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith('.')]
        for file in files:
            if file in EXCLUDE_FILES or file.endswith('.zip'):
                continue
            if file.startswith('.') and file not in {'.env.example', '.gitignore'}:
                continue
            filepath = os.path.join(root, file)
            arcname = os.path.relpath(filepath, '.')
            zipf.write(filepath, arcname)
"`, { cwd: __dirname });
  } catch (err) {
    console.warn('Notice during zip creation:', err);
  }

  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=\"edugenie-ai.zip\"');
    return res.sendFile(zipPath);
  } else {
    return res.status(500).json({ error: 'Could not generate project archive' });
  }
});

// In production, serve dist; in development, mount Vite middleware
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true, host: '0.0.0.0', port: Number(port) },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(port, () => {
  console.log(`EduGenie AI server listening on http://localhost:${port}`);
});
