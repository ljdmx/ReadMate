
import React, { useState } from 'react';
import { Translation, Insight } from '../types';
import { refineInsight } from '../services/gemini';

interface SynthesisViewProps {
  t: Translation;
  lang: string;
  selectedModel: string;
  onBack: () => void;
}

const SynthesisView: React.FC<SynthesisViewProps> = ({ t, lang, selectedModel, onBack }) => {
  const [isRefining, setIsRefining] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([
    {
      id: '1',
      title: lang === 'zh' ? "真正的财富是你看不见的那些支出。" : "Wealth is the part of money that you don't see.",
      authorView: lang === 'zh' ? "豪塞尔认为真正的财富是你决定不买的那辆法拉利，而不是你买下的那辆。" : "Morgan Housel argues that true wealth is the Ferrari you decide NOT to buy, not the one you drive.",
      myUnderstanding: lang === 'zh' ? "我觉得财富就是存下来的钱。" : "I think wealth is just money saved.",
      status: 'new',
      lastEdited: 'Just now'
    }
  ]);

  const handleRefine = async (id: string) => {
    const insight = insights.find(i => i.id === id);
    if (!insight) return;

    setIsRefining(true);
    try {
      const result = await refineInsight(insight.authorView, insight.myUnderstanding, lang, selectedModel);
      setInsights(prev => prev.map(i => i.id === id ? { ...i, myUnderstanding: result.refined, status: 'review' } : i));
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 animate-fade-in pb-12">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 lg:px-20">
        <div className="flex items-center gap-4 cursor-pointer" onClick={onBack}>
          <span className="material-symbols-outlined text-primary-500">arrow_back</span>
          <h1 className="text-lg font-bold">ReadMate</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white">The Psychology of Money</h2>
              <p className="mt-2 text-slate-500">{t.synthesisDesc}</p>
           </div>
        </div>

        <div className="flex flex-col gap-6">
           {insights.map((insight) => (
             <div key={insight.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                   <h3 className="text-xl font-bold">{insight.title}</h3>
                   <span className={`size-2 rounded-full ${insight.status === 'new' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                </div>
                <div className="p-6 grid gap-8 lg:grid-cols-[1fr_320px]">
                  <div className="space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-primary-500 text-[18px]">psychology</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.authorViewpoint}</span>
                      </div>
                      <p className="font-serif text-lg leading-relaxed italic">{insight.authorView}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{t.myUnderstanding}</label>
                      <textarea 
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm leading-relaxed min-h-[120px] outline-none"
                        value={insight.myUnderstanding}
                        onChange={(e) => setInsights(prev => prev.map(i => i.id === insight.id ? { ...i, myUnderstanding: e.target.value } : i))}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-xl border border-amber-100 dark:border-amber-800/30">
                      <h4 className="text-xs font-bold text-amber-900 dark:text-amber-100 mb-2">{t.differenceHint}</h4>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mb-4">{lang === 'zh' ? '点击精炼以合并作者核心逻辑。' : 'Refine to merge author insights.'}</p>
                      <button 
                        disabled={isRefining}
                        onClick={() => handleRefine(insight.id)}
                        className="w-full py-2 bg-white dark:bg-slate-800 border border-amber-200 rounded-lg text-xs font-bold shadow-sm hover:bg-amber-100 transition-all flex items-center justify-center gap-2"
                      >
                        <span className={`material-symbols-outlined text-sm ${isRefining ? 'animate-spin' : ''}`}>auto_awesome</span>
                        {isRefining ? t.explaining : t.refineNote}
                      </button>
                    </div>
                    <button className="w-full py-3 bg-primary-500 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                       <span className="material-symbols-outlined text-[18px]">check_circle</span>
                       {t.markAsReviewed}
                    </button>
                  </div>
                </div>
             </div>
           ))}
        </div>
      </main>
    </div>
  );
};

export default SynthesisView;
