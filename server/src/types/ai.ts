import { AnalysisSentiment } from '@/constants/analysis';
export type AiAnalysisResultT = {
  summary: string;
  keyPoints: string[];
  sentiment: AnalysisSentiment;
  topics: string[];
  suggestedTags: string[];
};
