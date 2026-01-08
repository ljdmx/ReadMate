
import React from 'react';
import { View, Translation } from '../types';

interface HomeViewProps {
  t: Translation;
  onNavigate: (view: View) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ t, onNavigate }) => {
  return (
    <main className="flex-1 flex flex-col items-center justify-center py-12 md:py-24 px-6 relative w-full min-h-screen">
      <div className="w-full max-w-7xl flex flex-col gap-12 md:gap-16 items-center">
        
        <header className="text-center space-y-4 animate-fade-in-up">
          <div className="inline-flex items-center justify-center size-16 md:size-24 bg-white dark:bg-slate-900 rounded-[28px] md:rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 text-primary-500 mb-4 transform hover:rotate-6 transition-transform">
             <span className="material-symbols-outlined text-[40px] md:text-[56px] filled">auto_stories</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white">
              {t.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-xl font-light tracking-[0.2em] uppercase">
              {t.tagline}
            </p>
          </div>
        </header>

        <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          <NavCard 
            icon="search_check" 
            title={t.selection} 
            subtitle={t.selectionSub}
            desc={t.selectionDesc}
            onClick={() => onNavigate('selection')} 
            color="bg-blue-50 dark:bg-blue-900/20"
            iconColor="text-blue-500"
          />
          <NavCard 
            icon="menu_book" 
            title={t.focus} 
            subtitle={t.focusSub}
            desc={t.focusDesc}
            onClick={() => onNavigate('focus')} 
            color="bg-emerald-50 dark:bg-emerald-900/20"
            iconColor="text-emerald-500"
          />
          <NavCard 
            icon="auto_awesome_motion" 
            title={t.discovery} 
            subtitle={t.discoverySub}
            desc={t.discoveryDesc}
            onClick={() => onNavigate('discovery')} 
            color="bg-orange-50 dark:bg-orange-900/20"
            iconColor="text-orange-500"
          />
        </nav>
      </div>
    </main>
  );
};

const NavCard: React.FC<{ icon: string, title: string, subtitle: string, desc: string, onClick: () => void, color: string, iconColor: string }> = ({ icon, title, subtitle, desc, onClick, color, iconColor }) => (
  <div 
    onClick={onClick}
    className="group relative flex flex-col items-start p-6 md:p-8 rounded-[32px] md:rounded-[40px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-2xl hover:border-primary-500/20 dark:hover:border-primary-500/40 transition-all duration-500 cursor-pointer min-h-[280px] md:min-h-[320px] active:scale-[0.97]"
  >
    <div className={`size-12 md:size-14 rounded-2xl md:rounded-2xl ${color} flex items-center justify-center ${iconColor} group-hover:scale-110 transition-all duration-500 shadow-sm mb-6`}>
      <span className="material-symbols-outlined text-[24px] md:text-[28px]">
        {icon}
      </span>
    </div>
    
    <div className="w-full space-y-3">
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-primary-500 transition-colors">{title}</h2>
        <p className="text-[10px] md:text-[11px] uppercase tracking-[0.15em] text-primary-500 font-black opacity-90">{subtitle}</p>
      </div>
      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
        {desc}
      </p>
    </div>

    <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
      <span className="material-symbols-outlined text-primary-500 text-lg font-black">arrow_forward</span>
    </div>
  </div>
);

export default HomeView;
