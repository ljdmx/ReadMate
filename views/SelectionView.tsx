
import React, { useState } from 'react';
import { Translation } from '../types';
import { analyzeBook } from '../services/gemini';

interface SelectionViewProps {
  t: Translation;
  lang: string;
  selectedModel: string;
  onBack: () => void;
}

const SelectionView: React.FC<SelectionViewProps> = ({ t, lang, selectedModel, onBack }) => {
  const [bookTitle, setBookTitle] = useState('Atomic Habits');
  const [intent, setIntent] = useState(lang === 'zh' ? '我想建立更好的日常工作系统，改掉拖延的坏习惯。' : 'I want to build better systems for my daily work routine and break bad procrastination habits.');
  const [timeBudget, setTimeBudget] = useState(4.5);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeBook(bookTitle, intent, lang, selectedModel);
      setResults(analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen animate-fade-in pb-12">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-6 py-4 lg:px-20">
        <div className="flex items-center gap-4 cursor-pointer" onClick={onBack}>
          <span className="material-symbols-outlined text-primary-500">arrow_back</span>
          <h2 className="text-lg font-bold">ReadMate</h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span>{t.privateMode}</span>
          </div>
          <div className="rounded-full size-9 border-2 border-slate-100 bg-gradient-to-tr from-blue-400 to-emerald-400"></div>
        </div>
      </header>

      <main className="flex-1 flex justify-center py-12 px-4 sm:px-6">
        <div className="flex flex-col max-w-[800px] w-full gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {t.preReadingTitle}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              {t.preReadingTagline}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t.bookTitleLabel}</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-slate-400">search</span>
                <input 
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="flex w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-14 pl-12 pr-4 text-base focus:ring-2 focus:ring-primary-500 transition-all outline-none" 
                  placeholder="e.g. Deep Work by Cal Newport" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t.intentLabel}</label>
              <textarea 
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                className="flex w-full min-h-[120px] rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 text-base focus:ring-2 focus:ring-primary-500 transition-all outline-none resize-none" 
              />
            </div>

            <div className="flex flex-col gap-4 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t.timeBudgetLabel}</label>
                <span className="text-primary-500 font-bold bg-primary-500/10 px-3 py-1 rounded-full text-sm">~{timeBudget}h</span>
              </div>
              <input 
                type="range" min="0.25" max="20" step="0.25"
                value={timeBudget}
                onChange={(e) => setTimeBudget(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-primary-500" 
              />
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={`w-full h-14 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99]
                ${isAnalyzing ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-600 text-white shadow-primary-500/20'}
              `}
            >
              <span className={`material-symbols-outlined ${isAnalyzing ? 'animate-spin' : ''}`}>
                {isAnalyzing ? 'autorenew' : 'analytics'}
              </span>
              {isAnalyzing ? t.explaining : t.startAnalysis}
            </button>
          </div>

          {results && (
            <div className="flex flex-col gap-4 animate-slide-up">
              <div className="flex items-center gap-2 px-1">
                <span className="material-symbols-outlined text-primary-500">auto_awesome</span>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t.aiAnalysisResults}</h3>
              </div>
              
              <ResultCard 
                icon="check_circle" 
                title={t.problemSolvedLabel} 
                content={results.problemSolved} 
                confidence={results.confidence}
                t={t}
                colorClass="text-green-600 bg-green-100 dark:bg-green-900/20"
                expanded
              />
              <ResultCard 
                icon="warning" 
                title={t.notSolvedLabel} 
                content={results.limitations} 
                t={t}
                colorClass="text-amber-600 bg-amber-100 dark:bg-amber-900/20"
              />
              <ResultCard 
                icon="group" 
                title={t.audienceFitLabel} 
                content={results.audienceFit} 
                t={t}
                colorClass="text-blue-600 bg-blue-100 dark:bg-blue-900/20"
              />
              <ResultCard 
                icon="layers" 
                title={t.recDepthLabel} 
                content={results.recommendedDepth} 
                t={t}
                colorClass="text-purple-600 bg-purple-100 dark:bg-purple-900/20"
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const ResultCard: React.FC<{ icon: string, title: string, content: string, confidence?: number, colorClass: string, expanded?: boolean, t: Translation }> = ({ icon, title, content, confidence, colorClass, expanded, t }) => (
  <details className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all duration-300" open={expanded}>
    <summary className="flex items-center justify-between p-5 cursor-pointer select-none bg-slate-50/50 dark:bg-slate-800/30">
      <div className="flex items-center gap-3">
        <div className={`size-8 rounded-full flex items-center justify-center ${colorClass}`}>
          <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>
        <span className="text-base font-bold">{title}</span>
        {confidence !== undefined && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
            {confidence}% {t.confidenceLabel}
          </span>
        )}
      </div>
      <span className="material-symbols-outlined text-slate-400 transition-transform duration-300 group-open:rotate-180">expand_more</span>
    </summary>
    <div className="p-5 pt-2 text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-50 dark:border-slate-800">
      <p>{content}</p>
    </div>
  </details>
);

export default SelectionView;
