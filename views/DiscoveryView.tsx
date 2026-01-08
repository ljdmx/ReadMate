
import React, { useState, useEffect } from 'react';
import { Translation } from '../types';
import { getDiscoveryRecs } from '../services/gemini';

interface DiscoveryViewProps {
  t: Translation;
  lang: string;
  selectedModel: string;
  onBack: () => void;
}

interface EnhancedRec {
  id: string;
  title: string;
  author: string;
  matchScore: number;
  whyItMatters: string;
  utilityType: string;
  keyTakeaway: string;
  price: string;
}

const DiscoveryView: React.FC<DiscoveryViewProps> = ({ t, lang, selectedModel, onBack }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [userGoal, setUserGoal] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['psychology', 'business']);
  const [recommendations, setRecommendations] = useState<EnhancedRec[]>([]);
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);

  const availableTags = [
    'psychology', 'economics', 'philosophy', 'science', 'business', 'technology', 
    'art', 'history', 'selfImprovement', 'health', 'design', 'marketing',
    'sociology', 'education', 'anthropology', 'environment', 'politics', 'law',
    'math', 'physics', 'music', 'literature', 'cinema', 'culinary',
    'biology', 'chemistry', 'astronomy', 'geography', 'languages', 'sports',
    'travel', 'fashion', 'photography', 'gaming'
  ];

  const visibleTags = isTagsExpanded ? availableTags : availableTags.slice(0, 12);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSelectAll = () => setSelectedTags([...availableTags]);
  const handleClearAll = () => setSelectedTags([]);

  const handleRecommend = async () => {
    if (!userGoal.trim() && selectedTags.length === 0) return;
    setIsUpdating(true);
    try {
      const tagNames = selectedTags.map(tag => t.tags[tag as keyof typeof t.tags]);
      const recs = await getDiscoveryRecs(tagNames, userGoal, lang, selectedModel);
      setRecommendations(recs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-slate-950 animate-fade-in relative">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 md:px-8 shrink-0 z-50">
        <div className="flex items-center gap-4 cursor-pointer" onClick={onBack}>
          <div className="size-9 bg-primary-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
             <span className="material-symbols-outlined text-[22px] filled">explore</span>
          </div>
          <h2 className="text-xl font-black tracking-tight dark:text-white">ReadMate</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-1.5 items-center gap-2 border border-slate-200 dark:border-slate-700">
            <span className="material-symbols-outlined text-[16px] text-emerald-500 filled">vitals</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Cognitive Navigator</span>
          </div>
          <button onClick={onBack} className="material-symbols-outlined text-slate-400 hover:text-slate-600 transition-colors">close</button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        
        {/* Input Sidebar */}
        <aside className="w-full lg:w-[400px] flex flex-col border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 md:p-8 overflow-y-auto shrink-0 z-10 no-scrollbar">
           <div className="mb-8">
              <h1 className="text-3xl font-black mb-2 dark:text-white leading-tight">{lang === 'zh' ? '探索知识边界' : 'Explore Boundaries'}</h1>
              <p className="text-xs text-slate-400 font-medium">{lang === 'zh' ? '输入您的愿景，让 AI 为您绘制成长路径。' : 'Input your vision, let AI map your growth path.'}</p>
           </div>

           <div className="space-y-8">
              <div className="space-y-4">
                 <div className="flex justify-between items-center mb-1">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.interestTags}</h3>
                    <div className="flex gap-3">
                       <button onClick={handleSelectAll} className="text-[10px] font-bold text-primary-500 hover:underline">{t.selectAll}</button>
                       <button onClick={handleClearAll} className="text-[10px] font-bold text-slate-400 hover:underline">{t.clearAll}</button>
                    </div>
                 </div>
                 <div className="flex flex-wrap gap-2 p-1">
                    {visibleTags.map(tag => (
                      <button 
                        key={tag} 
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border shadow-sm ${
                          selectedTags.includes(tag) 
                          ? 'bg-primary-500 border-primary-500 text-white shadow-primary-500/20 scale-105' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary-500/50'
                        }`}
                      >
                        {t.tags[tag as keyof typeof t.tags]}
                      </button>
                    ))}
                 </div>
                 <button 
                   onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                   className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-primary-500 transition-colors py-1"
                 >
                    <span className="material-symbols-outlined text-[16px]">{isTagsExpanded ? 'expand_less' : 'expand_more'}</span>
                    {isTagsExpanded ? t.showLess : t.showMore}
                 </button>
              </div>

              <div className="space-y-4">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.skillFocus}</h3>
                 <div className="relative">
                    <textarea 
                      value={userGoal}
                      onChange={(e) => setUserGoal(e.target.value)}
                      placeholder={lang === 'zh' ? '例如：我想通过学习心理学提升在初创团队中的领导力。' : 'e.g., I want to use psychology to improve my leadership in a startup.'}
                      className="w-full min-h-[140px] bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl p-5 text-sm outline-none focus:border-primary-500 transition-all shadow-inner resize-none dark:text-white"
                    />
                    <div className="absolute bottom-4 right-4 text-[10px] text-slate-300 font-bold uppercase">{userGoal.length}/200</div>
                 </div>
              </div>

              <button 
                onClick={handleRecommend}
                disabled={isUpdating || (!userGoal.trim() && selectedTags.length === 0)}
                className="w-full py-5 bg-slate-900 dark:bg-primary-500 text-white rounded-[2rem] text-sm font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl disabled:opacity-50 disabled:grayscale"
              >
                 <span className={`material-symbols-outlined ${isUpdating ? 'animate-spin' : 'filled'}`}>
                   {isUpdating ? 'autorenew' : 'magic_button'}
                 </span>
                 <span className="uppercase tracking-widest">{isUpdating ? t.plottingPath : t.generatePath}</span>
              </button>
           </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1 overflow-y-auto p-6 md:p-12 space-y-12 no-scrollbar bg-white dark:bg-slate-950">
           
           {/* Recommendations List */}
           <div className="space-y-10 pb-20">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                 <div>
                    <h2 className="text-3xl font-black dark:text-white tracking-tight">{t.recommendedForYou}</h2>
                    <p className="text-sm text-slate-400 font-medium mt-1">{lang === 'zh' ? '基于您的认知偏好与成长目标的深度匹配' : 'Deeply matched to your preferences and goals'}</p>
                 </div>
              </div>
              
              {isUpdating && (
                <div className="grid gap-10">
                   {[1,2,3].map(i => <div key={i} className="h-72 bg-slate-50 dark:bg-slate-900 rounded-[4rem] animate-pulse"></div>)}
                </div>
              )}

              <div className="grid gap-12">
                 {!isUpdating && recommendations.map(rec => (
                   <div key={rec.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[4rem] p-10 md:p-12 shadow-soft hover:shadow-2xl transition-all group flex flex-col md:flex-row gap-12 animate-fade-in-up relative overflow-hidden">
                      <div className="absolute top-10 right-10 flex flex-col items-end">
                         <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em] mb-1">Affinity</p>
                         <p className="text-3xl font-black text-primary-500">{rec.matchScore}%</p>
                      </div>

                      <div className="w-full md:w-52 flex flex-col items-center gap-6 shrink-0">
                         <div className="w-full aspect-[2/3] bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl transition-transform group-hover:-rotate-2 group-hover:scale-105 duration-700 flex items-center justify-center border-4 border-white dark:border-slate-700 relative">
                            <span className="material-symbols-outlined text-slate-200 dark:text-slate-700 text-8xl">book_2</span>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                         </div>
                         <div className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${
                           rec.utilityType === 'Actionable' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                           rec.utilityType === 'Theory' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-purple-50 text-purple-600 border border-purple-100'
                         }`}>
                           {rec.utilityType}
                         </div>
                      </div>

                      <div className="flex-1 flex flex-col justify-center">
                         <div className="space-y-8">
                            <div className="max-w-[70%]">
                               <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors leading-[1.1] tracking-tight">{rec.title}</h3>
                               <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">{rec.author}</p>
                            </div>

                            <div className="space-y-8">
                               <div className="space-y-3">
                                  <p className="text-[11px] font-black text-primary-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm filled">stars</span>
                                    {lang === 'zh' ? '核心价值' : 'CORE VALUE'}
                                  </p>
                                  <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{rec.whyItMatters}</p>
                               </div>
                               <div className="bg-slate-50/50 dark:bg-slate-800/40 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                                  <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-slate-100 dark:text-slate-800 text-9xl pointer-events-none">format_quote</span>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 relative z-10">{lang === 'zh' ? '关键洞察' : 'KEY INSIGHT'}</p>
                                  <p className="text-base italic text-slate-700 dark:text-slate-200 font-serif leading-relaxed relative z-10">"{rec.keyTakeaway}"</p>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                 ))}

                 {recommendations.length === 0 && !isUpdating && (
                   <div className="flex flex-col items-center justify-center py-24 opacity-40 text-center grayscale">
                      <div className="size-40 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-8 border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <span className="material-symbols-outlined text-7xl text-slate-300">visibility_off</span>
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-widest text-slate-400">{lang === 'zh' ? '暂无推荐内容' : 'No recommendations yet'}</h3>
                      <p className="text-sm mt-3 font-medium text-slate-400/80">{lang === 'zh' ? '请在左侧侧边栏设置您的兴趣领域与目标' : 'Define your interests and goals to start discovery'}</p>
                   </div>
                 )}
              </div>
           </div>
        </section>
      </main>
    </div>
  );
};

export default DiscoveryView;
