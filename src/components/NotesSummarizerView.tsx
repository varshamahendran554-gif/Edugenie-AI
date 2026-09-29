import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Layers,
  Copy,
  Check,
  RotateCw,
  HelpCircle,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  BookMarked,
  Brain,
} from 'lucide-react';
import { NotesSummaryData, StudentLevel, SubjectCategory, LanguageMode } from '../types';

interface NotesSummarizerViewProps {
  studentLevel: StudentLevel;
  selectedSubject: SubjectCategory;
  language?: LanguageMode;
}

const SAMPLE_STUDY_MATERIALS: Record<string, { title: string; text: string }> = {
  'Computer Science - Operating Systems': {
    title: 'Operating Systems: Process Synchronization & Deadlocks',
    text: `A process is a program in execution. In modern multi-programmed systems, multiple processes execute concurrently. When concurrent processes share resources (such as memory, files, or hardware devices), race conditions can occur. A race condition is an undesirable situation that occurs when a device or system attempts to perform two or more operations at the same time, but, because of the nature of the device or system, the operations must be done in the proper sequence to be done correctly.

To prevent race conditions, we enforce Mutual Exclusion in the Critical Section. The critical section problem requires three conditions to be met:
1. Mutual Exclusion: If process Pi is executing in its critical section, then no other processes can be executing in their critical sections.
2. Progress: If no process is executing in its critical section and there exist some processes that wish to enter their critical section, then only those processes not executing in their remainder sections can participate in the decision of which will enter its critical section next.
3. Bounded Waiting: There must be a bound on the number of times other processes are allowed to enter their critical sections after a process has made a request to enter and before that request is granted.

A deadlock occurs when a set of blocked processes each holds a resource and waits to acquire a resource held by another process in the set. Coffman stated the four necessary and sufficient conditions for deadlock to occur:
1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.
2. Hold and Wait: A process must be holding at least one resource and waiting to acquire additional resources currently being held by other processes.
3. No Preemption: Resources cannot be preempted; that is, a resource can be released only voluntarily by the process holding it after that process has completed its task.
4. Circular Wait: A closed chain of processes exists such that each process holds at least one resource needed by the next process in the chain.

Methods for handling deadlocks include deadlock prevention (invalidating at least one of the 4 conditions), deadlock avoidance (Banker's Algorithm), and deadlock detection and recovery.`,
  },
  'Science - Photosynthesis': {
    title: 'Biology: Light Reactions and the Calvin Cycle',
    text: `Photosynthesis is the biological process by which autotrophic organisms convert solar energy into chemical energy stored in glucose bonds. The overarching chemical formula is:
6CO2 + 6H2O + Light Energy -> C6H12O6 + 6O2

Photosynthesis occurs in two distinct, sequential stages inside the chloroplasts:
1. The Light-Dependent Reactions:
These reactions occur across the thylakoid membranes. Chlorophyll pigments in Photosystem II (P680) absorb photons, elevating electrons to a higher energy state. Photolysis of water (splitting of H2O) replenishes lost electrons, releasing molecular oxygen (O2) and protons (H+) into the thylakoid lumen. High-energy electrons pass through an electron transport chain (ETC) consisting of Plastoquinone, Cytochrome b6f complex, and Plastocyanin, creating a proton gradient. This proton motive force powers ATP Synthase to generate ATP via photophosphorylation. Electrons reach Photosystem I (P700), are re-excited by light, and ultimately reduce NADP+ to NADPH via Ferredoxin and NADP+ reductase.

2. The Light-Independent Reactions (Calvin Cycle / Dark Reactions):
These occur in the stroma of the chloroplast. The cycle requires the ATP and NADPH produced by the light reactions to fix atmospheric carbon dioxide into triose phosphate (G3P).
Phase 1: Carbon Fixation catalyzed by RuBisCO (Ribulose-1,5-bisphosphate carboxylase/oxygenase), combining CO2 with 5-carbon RuBP to form 3-phosphoglycerate (3-PGA).
Phase 2: Reduction, where ATP and NADPH convert 3-PGA into glyceraldehyde-3-phosphate (G3P). For every 3 molecules of CO2 fixed, 1 net G3P molecule exits to synthesize glucose and other sugars.
Phase 3: Regeneration of RuBP, consuming additional ATP so the cycle can continue.`,
  },
  'Commerce - Macroeconomics': {
    title: 'Economics: Central Banking, Inflation & Monetary Policy',
    text: `Inflation represents a sustained, general increase in the price level of goods and services in an economy over a period of time, leading to a loss in the purchasing power of the domestic currency.
Key causes of inflation:
1. Demand-Pull Inflation: Occurs when aggregate demand for goods and services outpaces aggregate supply ('too much money chasing too few goods').
2. Cost-Push Inflation: Occurs when aggregate supply decreases due to increased production costs, such as spikes in oil prices, wage increases, or supply chain bottlenecks.

Central Banks (such as the Federal Reserve, RBI, or ECB) use Monetary Policy to maintain price stability and foster sustainable employment.
Monetary Policy Instruments:
1. Policy Interest Rates (Repo Rate / Federal Funds Rate): When inflation rises above the target (typically 2%), the central bank executes contractionary monetary policy by raising interest rates. Higher interest rates increase borrowing costs for businesses and mortgages for consumers, which dampens consumption and investment spending, thus cooling aggregate demand.
2. Open Market Operations (OMO): The purchase or sale of government securities. Selling securities absorbs liquidity from the commercial banking system, reducing money supply.
3. Reserve Requirements: The mandatory percentage of deposits that commercial banks must keep in liquid reserve. Raising reserve ratios reduces the credit creation multiplier.

The Trade-off and Philips Curve: In the short run, lowering inflation can result in temporary spikes in unemployment or slower GDP growth, though expectations-augmented models show no permanent trade-off in the long run.`,
  },
};

export const NotesSummarizerView: React.FC<NotesSummarizerViewProps> = ({
  studentLevel,
  selectedSubject,
  language,
}) => {
  const [notesText, setNotesText] = useState(
    SAMPLE_STUDY_MATERIALS['Computer Science - Operating Systems'].text
  );
  const [detailLevel, setDetailLevel] = useState<'Concise' | 'Comprehensive' | 'Flashcards Focus'>(
    'Comprehensive'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<NotesSummaryData | null>(null);

  // Active Flashcard state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!notesText.trim()) return;
    setIsLoading(true);
    setCardIndex(0);
    setIsFlipped(false);
    setRevealedAnswers({});

    try {
      const response = await fetch('/api/summarize-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notesText,
          subject: selectedSubject,
          detailLevel,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to summarize notes');
      }

      const data: NotesSummaryData = await response.json();
      setSummaryData(data);
    } catch (err: any) {
      console.error('Summarize error:', err);
      alert('Could not summarize notes. Please check your Gemini API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!summaryData) return;
    let text = `# ${summaryData.title}\n\n`;
    text += `### 1-Minute Executive Summary\n${summaryData.oneMinuteSummary}\n\n`;
    text += `### Key Takeaways\n${summaryData.keyTakeaways.map((t) => `- ${t}`).join('\n')}\n\n`;
    text += `### Core Definitions & Formulas\n${summaryData.essentialDefinitionsAndFormulas
      .map((d) => `**${d.termOrFormula}:** ${d.explanation}`)
      .join('\n\n')}\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleAnswerReveal = (idx: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const currentFlashcard = summaryData?.flashcards?.[cardIndex];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Banner - Blue and White Educational Theme */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-blue-500/15 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>Smart Note Extractor & Active Recall</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Notes Summarizer & Flashcards
          </h1>
          <p className="mt-1 text-blue-100 text-sm max-w-xl">
            Turn dense chapters, lectures, and articles into executive bullet summaries, essential
            formulas, and interactive flashcards.
          </p>
        </div>
        <div className="hidden sm:block">
          <BookMarked className="w-16 h-16 text-blue-200/30" />
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Paste Your Notes or Study Material</span>
          </h2>
          {/* Sample Loader */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400">Load sample:</span>
            {Object.keys(SAMPLE_STUDY_MATERIALS).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setNotesText(SAMPLE_STUDY_MATERIALS[key].text)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium transition-colors"
              >
                {key.split(' - ')[1]}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={7}
          value={notesText}
          onChange={(e) => setNotesText(e.target.value)}
          placeholder="Paste lecture notes, textbook excerpts, research paper abstracts, or summaries here..."
          className="w-full p-3.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 font-normal leading-relaxed text-slate-800"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-600">Detail Level:</label>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
              {(['Concise', 'Comprehensive', 'Flashcards Focus'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDetailLevel(lvl)}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    detailLevel === lvl
                      ? 'bg-white text-blue-800 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-400">
              {notesText.trim() ? `${notesText.trim().split(/\s+/).length} words` : '0 words'}
            </span>
          </div>

          <button
            type="button"
            disabled={isLoading || !notesText.trim()}
            onClick={handleSummarize}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md ${
              isLoading
                ? 'bg-blue-400 text-white cursor-wait'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 hover:scale-102'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Extracting Key Concepts...' : 'Summarize & Generate Flashcards'}</span>
          </button>
        </div>
      </div>

      {/* Summary Output */}
      {summaryData && (
        <div className="space-y-6">
          {/* Header Action Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Summary Complete
              </span>
              <h2 className="text-lg font-bold text-slate-900">{summaryData.title}</h2>
            </div>
            <button
              type="button"
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Summary'}</span>
            </button>
          </div>

          {/* 1-Minute Executive Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 border border-blue-200/80 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-blue-700" />
              <span>1-Minute Executive Summary</span>
            </h3>
            <p className="text-sm text-blue-950 leading-relaxed font-medium">
              {summaryData.oneMinuteSummary}
            </p>
          </div>

          {/* Key Takeaways */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              High-Yield Key Takeaways
            </h3>
            <ul className="space-y-2.5">
              {summaryData.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-800">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Flashcard Study Arena */}
          {summaryData.flashcards && summaryData.flashcards.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Active Recall Flashcards</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click the card to flip between question and answer
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {cardIndex + 1} / {summaryData.flashcards.length}
                </span>
              </div>

              {/* 3D Flip Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="cursor-pointer min-h-[200px] sm:min-h-[220px] rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 border-2 shadow-sm relative overflow-hidden group select-none"
                style={{
                  backgroundColor: isFlipped ? '#f0fdf4' : '#f8fafc',
                  borderColor: isFlipped ? '#86efac' : '#cbd5e1',
                }}
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold uppercase tracking-wider text-slate-500">
                    {isFlipped ? 'Answer (Reverse)' : 'Prompt (Front)'}
                  </span>
                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-600 transition-colors">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Flip card</span>
                  </div>
                </div>

                <div className="my-auto py-4 text-center">
                  <p
                    className={`text-base sm:text-lg font-bold leading-relaxed ${
                      isFlipped ? 'text-emerald-900' : 'text-slate-800'
                    }`}
                  >
                    {isFlipped ? currentFlashcard?.back : currentFlashcard?.front}
                  </p>
                </div>

                <div className="text-center text-[11px] text-slate-400">
                  Click anywhere to flip
                </div>
              </div>

              {/* Flashcard Navigation */}
              <div className="flex items-center justify-between mt-4">
                <button
                  type="button"
                  disabled={cardIndex === 0}
                  onClick={() => {
                    setIsFlipped(false);
                    setCardIndex((prev) => prev - 1);
                  }}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {summaryData.flashcards.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setIsFlipped(false);
                        setCardIndex(i);
                      }}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        i === cardIndex ? 'bg-blue-600 w-5' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  disabled={cardIndex === summaryData.flashcards.length - 1}
                  onClick={() => {
                    setIsFlipped(false);
                    setCardIndex((prev) => prev + 1);
                  }}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-30"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Essential Definitions & Formulas */}
          {summaryData.essentialDefinitionsAndFormulas &&
            summaryData.essentialDefinitionsAndFormulas.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                  Core Formulas & Defined Terms
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {summaryData.essentialDefinitionsAndFormulas.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs"
                    >
                      <span className="font-bold text-slate-900 block mb-1 text-sm text-indigo-900">
                        {item.termOrFormula}
                      </span>
                      <p className="text-slate-600 leading-relaxed">{item.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Quick Practice Self-Check Questions */}
          {summaryData.practiceCheckQuestions &&
            summaryData.practiceCheckQuestions.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Self-Check Practice Questions
                </h3>
                {summaryData.practiceCheckQuestions.map((q, idx) => {
                  const isAnswerShown = !!revealedAnswers[idx];
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900">
                        <span>
                          Q{idx + 1}: {q.question}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleAnswerReveal(idx)}
                          className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors shrink-0"
                        >
                          {isAnswerShown ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Hide</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Reveal Answer</span>
                            </>
                          )}
                        </button>
                      </div>

                      {isAnswerShown && (
                        <div className="pt-2 border-t border-slate-200 text-xs text-slate-700 bg-white p-3 rounded-lg border">
                          <strong className="text-emerald-700 block mb-0.5">Answer:</strong>
                          <p>{q.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      )}
    </div>
  );
};
