
export type View = 'home' | 'selection' | 'focus' | 'discovery';

export type AIModel = 'gemini' | 'openai' | 'grok' | 'deepseek' | 'doubao';

export interface Translation {
  // Common
  title: string;
  tagline: string;
  back: string;
  search: string;
  privateMode: string;
  
  // Home View
  selection: string;
  selectionSub: string;
  selectionDesc: string;
  focus: string;
  focusSub: string;
  focusDesc: string;
  discovery: string;
  discoverySub: string;
  discoveryDesc: string;
  lastRead: string;
  
  // Selection View
  preReadingTitle: string;
  preReadingTagline: string;
  bookTitleLabel: string;
  intentLabel: string;
  timeBudgetLabel: string;
  startAnalysis: string;
  aiAnalysisResults: string;
  worthReading: string;
  notForMe: string;
  problemSolvedLabel: string;
  notSolvedLabel: string;
  audienceFitLabel: string;
  recDepthLabel: string;
  confidenceLabel: string;

  // Focus View
  navigation: string;
  library: string;
  structure: string;
  notes: string;
  questions: string;
  aiAssistant: string;
  chapter: string;
  lastEdited: string;
  minRead: string;
  askQuestion: string;
  restate: string;
  simplify: string;
  assumptions: string;
  errors: string;
  explaining: string;
  uploadBook: string;
  dropFile: string;
  readingSettings: string;
  fontSize: string;
  fontFamily: string;
  toc: string;
  searchBook: string;
  highlight: string;
  aiInterpret: string;
  noBookSelected: string;

  // Discovery View
  explore: string;
  insights: string;
  readingDNA: string;
  pathMastery: string;
  interestTags: string;
  skillFocus: string;
  recommendedForYou: string;
  buy: string;
  preview: string;
  edit: string;
  updateRecs: string;
  generatePath: string;
  plottingPath: string;
  visualizingJourney: string;
  recentTrace: string;
  growthReport: string;
  growthReportDesc: string;
  viewReport: string;
  match: string;
  selectAll: string;
  clearAll: string;
  showMore: string;
  showLess: string;
  tags: {
    psychology: string;
    economics: string;
    philosophy: string;
    science: string;
    business: string;
    technology: string;
    art: string;
    history: string;
    selfImprovement: string;
    health: string;
    design: string;
    marketing: string;
    sociology: string;
    education: string;
    anthropology: string;
    environment: string;
    politics: string;
    law: string;
    math: string;
    physics: string;
    music: string;
    literature: string;
    cinema: string;
    culinary: string;
    biology: string;
    chemistry: string;
    astronomy: string;
    geography: string;
    languages: string;
    sports: string;
    travel: string;
    fashion: string;
    photography: string;
    gaming: string;
  };

  // Synthesis View
  synthesisDesc: string;
  authorViewpoint: string;
  myUnderstanding: string;
  differenceHint: string;
  refineNote: string;
  markAsReviewed: string;

  // App / Model Selection
  modelSelect: string;
}

export interface BookRecommendation {
  id: string;
  title: string;
  author: string;
  matchScore: number;
  reason: string;
  coverUrl: string;
  price: string;
}

export interface Insight {
  id: string;
  title: string;
  authorView: string;
  myUnderstanding: string;
  status: 'new' | 'review' | 'mastered';
  lastEdited: string;
}
