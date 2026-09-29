import React, { useState } from 'react';
import { X, Download, Copy, Check, Terminal, ExternalLink, FolderArchive, Sparkles, GitBranch } from 'lucide-react';

interface GithubExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GithubExportModal: React.FC<GithubExportModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const gitCommands = [
    `# 1. Unzip the downloaded folder and navigate to it:
unzip edugenie-ai.zip -d edugenie-ai
cd edugenie-ai`,
    `# 2. Initialize a git repository and commit your files:
git init
git add .
git commit -m "Initial commit: EduGenie AI learning assistant"`,
    `# 3. Create a new repository on GitHub (https://github.com/new), then link and push:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/edugenie-ai.git
git push -u origin main`,
    `# 4. Running locally:
npm install
cp .env.example .env
# Add your GEMINI_API_KEY inside .env
npm run dev`,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/40 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <FolderArchive className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Export to GitHub</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Ready to Push
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Download the complete codebase as a clean zip file and push to your GitHub
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Download Card */}
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>edugenie-ai.zip</span>
                <span className="text-xs text-indigo-700 bg-white px-2 py-0.5 rounded-md font-mono border border-indigo-200">
                  ~91 KB
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-md">
                Includes all source code, components, Express Gemini backend, Tailwind styling, configuration files, and a comprehensive GitHub <code className="text-indigo-600 font-mono">README.md</code>.
              </p>
            </div>
            <a
              href="/api/download-zip"
              download="edugenie-ai.zip"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-200 transition-all hover:scale-102 shrink-0 w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP</span>
            </a>
          </div>

          {/* Step-by-Step GitHub Instructions */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-500" />
              <span>Step-by-Step GitHub Upload Instructions</span>
            </h4>

            {gitCommands.map((cmd, idx) => (
              <div key={idx} className="bg-slate-900 rounded-2xl p-3.5 text-xs font-mono text-slate-200 border border-slate-800 relative group">
                <button
                  type="button"
                  onClick={() => copyToClipboard(cmd, idx)}
                  className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-sans transition-colors border border-slate-700"
                  title="Copy command"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed pr-16 text-slate-300">
                  {cmd}
                </pre>
              </div>
            ))}
          </div>

          {/* Quick info note */}
          <div className="rounded-xl p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <span className="text-base">💡</span>
            <div>
              <span className="font-semibold">Security Note:</span> Your personal <code className="font-mono text-amber-800 font-bold">.env</code> file containing your secret API key is automatically ignored by <code className="font-mono text-amber-800 font-bold">.gitignore</code> and is not included in the zip, protecting your credentials on public GitHub repositories.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <a
            href="https://github.com/new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-600 font-medium transition-colors"
          >
            <span>Create new repo on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
