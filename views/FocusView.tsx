
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Translation } from '../types';
import { assistReading, getAIResponse } from '../services/gemini';
import * as pdfjsLib from 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.mjs';
import JSZip from 'https://esm.sh/jszip@3.10.1';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs';

interface ChapterSection {
  id: string;
  title: string;
  content: string;
}

interface FocusViewProps {
  t: Translation;
  lang: string;
  selectedModel: string;
  onBack: () => void;
}

type ReadingTheme = 'light' | 'sepia' | 'dark' | 'contrast' | 'nature';

const FocusView: React.FC<FocusViewProps> = ({ t, lang, selectedModel, onBack }) => {
  const [bookTitle, setBookTitle] = useState('');
  const [bookContent, setBookContent] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [fontSerif, setFontSerif] = useState(true);
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('light');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [messages, setMessages] = useState([
    { role: 'ai', content: lang === 'zh' ? '欢迎阅读。阅伴 AI 已准备好协助您深度解析书籍。请导入您的电子书。' : 'Welcome. ReadMate AI is ready. Please upload your eBook.' }
  ]);
  const [userQuery, setUserQuery] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 书籍章节解析
  const bookSections = useMemo((): ChapterSection[] => {
    if (!bookContent) return [];
    const chapterRegex = /^(Chapter|Section|Part|第)\s*(\d+|[一二三四五六七八九十百]+)\s*(章|节|部分|回)?|^\s*#+\s+(.+)/im;
    const lines = bookContent.split('\n');
    const sections: ChapterSection[] = [];
    let currentTitle = lang === 'zh' ? '前言/开始' : 'Introduction';
    let currentBuffer: string[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.length > 0 && trimmed.length < 120 && chapterRegex.test(trimmed)) {
        if (currentBuffer.length > 0) {
          sections.push({ id: `reader-sec-${sections.length}`, title: currentTitle, content: currentBuffer.join('\n') });
          currentBuffer = [];
        }
        currentTitle = trimmed;
      } else {
        currentBuffer.push(line);
      }
    });
    if (currentBuffer.length > 0 || sections.length === 0) {
      sections.push({ id: `reader-sec-${sections.length}`, title: currentTitle, content: currentBuffer.join('\n') });
    }
    return sections;
  }, [bookContent, lang]);

  // AI 上下文摘要
  const bookContext = useMemo(() => {
    if (!bookTitle) return "";
    return `Book: "${bookTitle}". Structure: ${bookSections.map(s => s.title).slice(0, 15).join(' -> ')}.`;
  }, [bookTitle, bookSections]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setReadProgress(progress || 0);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 0) {
      setSelectedText(text);
    } else {
      // 稍微延迟，避免点击清除瞬间菜单闪烁
      setTimeout(() => {
        if (!window.getSelection()?.toString().trim()) {
          setSelectedText('');
        }
      }, 50);
    }
  };

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer) => {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      text += pageText + '\n\n';
    }
    return text;
  };

  const extractTextFromEPUB = async (file: File) => {
    const zip = await JSZip.loadAsync(file);
    let text = '';
    const files = Object.keys(zip.files).filter(name => 
      name.endsWith('.xhtml') || name.endsWith('.html') || name.endsWith('.htm')
    );
    files.sort();
    for (const filename of files) {
      const content = await zip.files[filename].async('string');
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      text += (doc.body.innerText || doc.body.textContent || '') + '\n\n';
    }
    return text;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const title = file.name.replace(/\.[^/.]+$/, "");
      setBookTitle(title);
      setIsExtracting(true);
      
      try {
        let text = '';
        if (ext === 'pdf') {
          const buffer = await file.arrayBuffer();
          text = await extractTextFromPDF(buffer);
        } else if (ext === 'epub') {
          text = await extractTextFromEPUB(file);
        } else {
          text = await file.text();
        }
        setBookContent(text);
        setReadProgress(0);
        setMessages([{ 
          role: 'ai', 
          content: lang === 'zh' 
            ? `已加载《${title}》。我已了解本书目录结构，你可以随时针对内容向我提问，或选中文本进行解析。` 
            : `Loaded: "${title}". I've scanned the structure and I'm ready for your deep-reading questions.` 
        }]);
        if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
      } catch (err) {
        console.error('File parsing error:', err);
      } finally {
        setIsExtracting(false);
      }
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // 配合 CSS 的 scroll-mt-24 确保跳转位置在 Header 下方
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (window.innerWidth < 1024) setIsSidebarCollapsed(true);
    }
  };

  const handleAIAction = async (action: string) => {
    if (!selectedText) return;
    setIsExplaining(true);
    setIsMobileDrawerOpen(true);
    
    try {
      const response = await assistReading(selectedText, action, lang, selectedModel, bookContext);
      setMessages(prev => [...prev, 
        { role: 'user', content: `${t[action as keyof Translation] || action}: "${selectedText.substring(0, 60)}..."` },
        { role: 'ai', content: response || "..." }
      ]);
      setSelectedText('');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleCustomQuery = async () => {
    if (!userQuery.trim()) return;
    const q = userQuery;
    setUserQuery('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setIsExplaining(true);
    setIsMobileDrawerOpen(true);
    
    // 全局系统提示：让 AI 始终知道它是在一本特定的书里担任助手
    const systemInstruction = `You are an expert cognitive assistant for the book "${bookTitle}". Context: ${bookContext}. Provide structured, logical, and evidence-based answers derived from the book's specific concepts. Focus on helping the user build a long-term knowledge system.`;
    
    try {
      const response = await getAIResponse(q, selectedModel, systemInstruction);
      setMessages(prev => [...prev, { role: 'ai', content: response || "" }]);
    } finally {
      setIsExplaining(false);
    }
  };

  const getThemeStyles = () => {
    switch(readingTheme) {
      case 'sepia': return 'bg-[#f4ecd8] text-[#5b4636] selection:bg-amber-800/20';
      case 'dark': return 'bg-[#1a1a1a] text-[#d1d1d1] selection:bg-primary-500/30';
      case 'nature': return 'bg-[#f0f4ef] text-[#2d3a3a] selection:bg-emerald-800/20';
      default: return 'bg-white text-slate-900 selection:bg-primary-500/10';
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-slate-950" onMouseUp={handleTextSelection}>
      {/* 侧边栏 */}
      <aside className={`flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 z-20 transition-all duration-300 ${isSidebarCollapsed || isImmersiveMode ? 'w-0 opacity-0 overflow-hidden' : 'w-72 md:w-80'}`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800 cursor-pointer shrink-0" onClick={onBack}>
          <span className="material-symbols-outlined text-primary-500 mr-2 text-xl">arrow_back</span>
          <h1 className="text-sm font-black uppercase tracking-widest truncate">{t.title}</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
          <div className="space-y-3">
            <p className="px-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.library}</p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isExtracting}
              className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-primary-50 transition-all flex items-center gap-3 border border-slate-200/50 dark:border-slate-700/50"
            >
              <span className="material-symbols-outlined text-sm">{isExtracting ? 'sync' : 'upload_file'}</span>
              <span className="truncate">{isExtracting ? (lang === 'zh' ? '正在提取文本...' : 'Extracting...') : t.uploadBook}</span>
            </button>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.md,.pdf,.epub" onChange={handleFileUpload} />
          
          <div className="space-y-2">
            <p className="px-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.toc}</p>
            <div className="space-y-0.5">
              {bookSections.map((sec) => (
                <button 
                  key={sec.id} 
                  onClick={() => scrollToSection(sec.id)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-primary-500 transition-all truncate"
                >
                  {sec.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* 主阅读区 */}
      <main className="flex-1 flex flex-col relative bg-slate-50 dark:bg-slate-950 overflow-hidden">
        <div className="absolute top-0 left-0 h-0.5 bg-primary-500 z-50 transition-all duration-300" style={{ width: `${readProgress}%` }}></div>

        <header className="h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all">
              <span className="material-symbols-outlined text-[22px]">{isSidebarCollapsed ? 'side_navigation' : 'menu_open'}</span>
            </button>
            <h2 className="text-xs font-bold truncate max-w-[250px] text-slate-700 dark:text-slate-200">{bookTitle || t.noBookSelected}</h2>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </button>
            <button onClick={() => setIsImmersiveMode(!isImmersiveMode)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
              <span className="material-symbols-outlined text-[20px]">{isImmersiveMode ? 'fullscreen_exit' : 'fullscreen'}</span>
            </button>
          </div>
        </header>

        {showSettings && (
          <div className="absolute top-16 right-6 z-50 w-64 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-100 dark:border-slate-800 p-6 animate-slide-down">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t.fontSize}</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="flex-1 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">-</button>
                  <span className="text-sm font-bold">{fontSize}</span>
                  <button onClick={() => setFontSize(Math.min(32, fontSize + 2))} className="flex-1 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">+</button>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">阅读主题</p>
                <div className="flex gap-2">
                  {['light', 'sepia', 'nature', 'dark'].map(th => (
                    <button key={th} onClick={() => setReadingTheme(th as ReadingTheme)} className={`size-7 rounded-full border-2 transition-all ${readingTheme === th ? 'border-primary-500 scale-110 shadow-sm' : 'border-transparent'} ${th === 'light' ? 'bg-white' : th === 'sepia' ? 'bg-[#f4ecd8]' : th === 'nature' ? 'bg-[#f0f4ef]' : 'bg-slate-800'}`}></button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div 
          ref={scrollContainerRef} 
          onScroll={handleScroll} 
          className="flex-1 overflow-y-auto no-scrollbar scroll-smooth"
        >
          <article className={`mx-auto transition-all duration-500 ${isImmersiveMode ? 'max-w-none px-4' : 'max-w-3xl px-8 py-12 md:py-20'}`}>
            {bookSections.length > 0 ? (
              <div 
                className={`p-10 md:p-16 rounded-[2.5rem] shadow-sm border border-slate-200/40 dark:border-slate-800/40 leading-[1.85] text-justify ${getThemeStyles()} ${fontSerif ? 'font-serif' : 'font-sans'}`}
                style={{ fontSize: `${fontSize}px` }}
              >
                {bookSections.map((sec) => (
                  <section 
                    key={sec.id} 
                    id={sec.id} 
                    className="mb-20 last:mb-0 scroll-mt-24"
                  >
                    <h3 className="text-2xl md:text-3xl font-black mb-10 opacity-80 leading-tight">{sec.title}</h3>
                    <div className="whitespace-pre-wrap opacity-90">{sec.content}</div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="h-[60vh] flex flex-col items-center justify-center opacity-20 text-center grayscale">
                <span className="material-symbols-outlined text-[120px] mb-4">auto_stories</span>
                <p className="font-black text-sm uppercase tracking-[0.2em]">{t.noBookSelected}</p>
              </div>
            )}
          </article>
        </div>

        {/* 选中文本后的浮动 AI 面板 */}
        {selectedText && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-1.5 bg-slate-900/95 dark:bg-white text-white dark:text-slate-900 p-1.5 rounded-full shadow-2xl animate-bounce-in ring-4 ring-primary-500/10">
             <button onClick={() => handleAIAction('aiInterpret')} className="px-6 py-2.5 bg-primary-500 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary-600 transition-colors">
               <span className="material-symbols-outlined text-lg filled">auto_awesome</span>
               {t.aiInterpret}
             </button>
             <button onClick={() => handleAIAction('simplify')} className="px-5 py-2.5 hover:bg-white/10 dark:hover:bg-slate-100 rounded-full text-[10px] font-bold uppercase tracking-widest">{t.simplify}</button>
             <button onClick={() => handleAIAction('restate')} className="px-5 py-2.5 hover:bg-white/10 dark:hover:bg-slate-100 rounded-full text-[10px] font-bold uppercase tracking-widest">{t.restate}</button>
             <div className="w-px h-4 bg-white/20 dark:bg-slate-200 mx-1"></div>
             <button onClick={() => setSelectedText('')} className="p-2 hover:bg-white/10 dark:hover:bg-slate-100 rounded-full material-symbols-outlined text-sm">close</button>
          </div>
        )}
      </main>

      {/* AI 助手侧边栏 */}
      <aside className={`hidden lg:flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transition-all duration-300 ${isImmersiveMode ? 'w-0 opacity-0' : 'w-80 md:w-[350px]'}`}>
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cognitive Hub</h2>
          <div className="flex items-center gap-2">
             <span className="text-[9px] font-bold text-emerald-500 uppercase">Connected</span>
             <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar bg-slate-50/20 dark:bg-slate-950/20">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`size-7 rounded-lg flex-shrink-0 flex items-center justify-center text-white shadow-sm ${m.role === 'ai' ? 'bg-primary-500' : 'bg-slate-400'}`}>
                <span className="material-symbols-outlined text-[14px]">{m.role === 'ai' ? 'auto_awesome' : 'person'}</span>
              </div>
              <div className={`p-3.5 rounded-2xl text-[13px] leading-relaxed max-w-[85%] ${m.role === 'ai' ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700' : 'bg-primary-500 text-white'}`}>
                <p className="whitespace-pre-wrap font-medium">{m.content}</p>
              </div>
            </div>
          ))}
          {isExplaining && (
            <div className="flex gap-3 animate-pulse">
              <div className="size-7 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
              <div className="h-20 bg-white dark:bg-slate-800 rounded-2xl flex-1 border border-slate-100 dark:border-slate-700"></div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="relative flex items-center gap-2">
            <input 
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCustomQuery()}
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 pl-4 pr-12 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 transition-all dark:text-white" 
              placeholder={t.askQuestion} 
            />
            <button onClick={handleCustomQuery} className="absolute right-1.5 top-1/2 -translate-y-1/2 size-8 bg-slate-900 dark:bg-primary-500 text-white rounded-lg shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 移动端助手抽屉 */}
      <div className={`lg:hidden fixed inset-0 z-[100] transition-opacity duration-300 ${isMobileDrawerOpen ? 'bg-black/60 backdrop-blur-sm' : 'pointer-events-none opacity-0'}`} onClick={() => setIsMobileDrawerOpen(false)}>
        <div className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-2xl transition-transform duration-500 transform ${isMobileDrawerOpen ? 'translate-y-0' : 'translate-y-full'} h-[80vh] flex flex-col`} onClick={e => e.stopPropagation()}>
          <div className="w-10 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto my-4 shrink-0"></div>
          <header className="px-8 pb-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50 shrink-0">
             <h3 className="font-black text-xs uppercase tracking-widest">{t.aiAssistant}</h3>
             <button onClick={() => setIsMobileDrawerOpen(false)} className="material-symbols-outlined text-slate-400 p-2">close</button>
          </header>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`size-8 rounded-xl flex-shrink-0 flex items-center justify-center text-white shadow-md ${m.role === 'ai' ? 'bg-primary-500' : 'bg-slate-400'}`}>
                  <span className="material-symbols-outlined text-sm">{m.role === 'ai' ? 'auto_awesome' : 'person'}</span>
                </div>
                <div className={`p-4 rounded-2xl text-[13px] leading-relaxed flex-1 ${m.role === 'ai' ? 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200' : 'bg-primary-500 text-white'}`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            {isExplaining && (
              <div className="flex gap-3 animate-pulse">
                <div className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800"></div>
                <div className="h-24 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex-1"></div>
              </div>
            )}
          </div>
          <div className="p-6 border-t border-slate-50 dark:border-slate-800/50 pb-10 shrink-0 bg-white dark:bg-slate-900">
            <div className="relative flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2">
              <input value={userQuery} onChange={(e) => setUserQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCustomQuery()} className="flex-1 bg-transparent border-none text-sm outline-none dark:text-white h-10" placeholder={t.askQuestion} />
              <button onClick={handleCustomQuery} className="size-9 bg-primary-500 text-white rounded-lg shadow-lg flex items-center justify-center ml-2">
                <span className="material-symbols-outlined text-lg">bolt</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusView;
