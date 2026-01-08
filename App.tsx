
import React, { useState } from 'react';
import { View, AIModel } from './types';
import { translations } from './i18n';
import HomeView from './views/HomeView';
import SelectionView from './views/SelectionView';
import FocusView from './views/FocusView';
import DiscoveryView from './views/DiscoveryView';
import SynthesisView from './views/SynthesisView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini');
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);

  const t = translations[lang];

  const models: { id: AIModel; name: string; icon: string; modelName: string }[] = [
    { id: 'gemini', name: 'Gemini 3 (Google)', icon: 'auto_awesome', modelName: 'gemini-3-flash-preview' },
    { id: 'openai', name: 'GPT-4o (OpenAI)', icon: 'hub', modelName: 'gemini-3-pro-preview' },
    { id: 'deepseek', name: 'DeepSeek-V3', icon: 'deployed_code', modelName: 'gemini-3-flash-preview' },
    { id: 'grok', name: 'Grok-2 (xAI)', icon: 'terminal', modelName: 'gemini-3-flash-preview' },
    { id: 'doubao', name: '豆包 (Doubao)', icon: 'chat_bubble', modelName: 'gemini-3-flash-preview' },
  ];

  const activeModelName = models.find(m => m.id === selectedModel)?.modelName || 'gemini-3-flash-preview';

  const renderView = () => {
    const props = { t, lang, selectedModel: activeModelName, onBack: () => setCurrentView('home') };
    switch (currentView) {
      case 'home': return <HomeView t={t} onNavigate={setCurrentView} />;
      case 'selection': return <SelectionView {...props} />;
      case 'focus': return <FocusView {...props} />;
      case 'discovery': return <DiscoveryView {...props} />;
      case 'synthesis': return <SynthesisView {...props} />;
      default: return <HomeView t={t} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen transition-colors duration-300 font-sans`}>
      <div className="bg-surface-background dark:bg-surface-background-dark min-h-screen flex flex-col items-center">
        <div className="w-full min-h-screen flex flex-col relative">
          
          {/* Global Toolbar - ONLY visible on home view as requested */}
          {currentView === 'home' && (
            <div className="fixed top-6 right-6 z-[100] flex items-center gap-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button 
                    onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all group"
                  >
                    <span className="material-symbols-outlined text-primary-500 text-[20px]">
                      {models.find(m => m.id === selectedModel)?.icon}
                    </span>
                    <span className="text-sm font-bold hidden sm:inline text-slate-700 dark:text-slate-200">
                      {models.find(m => m.id === selectedModel)?.name.split(' ')[0]}
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-primary-500 transition-colors">
                      expand_more
                    </span>
                  </button>

                  {isModelMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-[-1]" onClick={() => setIsModelMenuOpen(false)}></div>
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-2 animate-slide-down">
                        <p className="px-3 py-2 text-[10px] font-black uppercase tracking_widest text-slate-400">
                          {t.modelSelect}
                        </p>
                        {models.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedModel(model.id);
                              setIsModelMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                              selectedModel === model.id 
                                ? 'bg-primary-500/10 text-primary-500 font-bold' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[20px]">{model.icon}</span>
                            <span>{model.name}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Free Books Link */}
                <a 
                  href="https://github.com/jbiaojerry/ebook-treasure-chest?tab=readme-ov-file" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center size-10 bg-white dark:bg-slate-800 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 text-primary-500 hover:scale-110 transition-all"
                  title={lang === 'zh' ? '获取免费图书' : 'Get Free Books'}
                >
                  <span className="material-symbols-outlined text-[22px]">local_library</span>
                </a>
              </div>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <button 
                onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                className="flex items-center justify-center size-10 bg-white dark:bg-slate-800 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 text-xs font-black hover:scale-110 hover:text-primary-500 transition-all text-slate-600 dark:text-slate-300"
              >
                {lang === 'zh' ? 'EN' : '中'}
              </button>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="flex items-center justify-center size-10 bg-white dark:bg-slate-800 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 hover:scale-110 hover:text-primary-500 transition-all text-slate-600 dark:text-slate-300"
              >
                <span className="material-symbols-outlined text-lg">
                  {isDarkMode ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
            </div>
          )}

          {renderView()}
        </div>
      </div>
    </div>
  );
};

export default App;
