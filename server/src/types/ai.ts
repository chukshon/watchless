export type AiAnalysisResultT = {
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  topics: string[];
  suggestedTags: string[];
};
