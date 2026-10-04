import { GenerateContentRequest } from '@google/generative-ai';

import { googleAIModel } from '@/lib/google-ai';
import { logger } from '@/lib/logger';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@/errors/http-errors';
import { AiAnalysisResultT } from '@/types/ai';
import { AnalysisSentiment } from '@/constants/analysis';

export class AiService {
  private static readonly genAiModel = googleAIModel;

  private static generatePrompt(
    transcription: string,
    videoInfo?: any
  ): string {
    let prompt = `You are a video content analyzer. Your task is to analyze the provided video transcription and return a JSON response.

IMPORTANT: Your response must be valid JSON and match this exact structure:
{
  "summary": "2-3 sentences summarizing the main content",
  "keyPoints": ["point 1", "point 2", "etc"],
  "sentiment": "positive|negative|neutral",
  "topics": ["topic1", "topic2", "etc"],
  "suggestedTags": ["#tag1", "#tag2", "etc"]
}

DO NOT include any text outside the JSON structure. Your response should be parseable by JSON.parse().

Analyze this transcription:
"""
${transcription}
"""`;

    if (videoInfo) {
      prompt += `\n\nAdditional video context:
Title: "${videoInfo.title}"
Author: "${videoInfo.author}"
Duration: ${videoInfo.duration} seconds`;
    }

    return prompt;
  }

  static async analyzeTranscription(
    transcription: string,
    videoInfo?: any
  ): Promise<AiAnalysisResultT> {
    const prompt = this.generatePrompt(transcription, videoInfo);

    const generateConfig: GenerateContentRequest = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.5,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      },
    };

    const generateResult =
      await this.genAiModel.generateContent(generateConfig);
    const responseText = generateResult.response.text();

    try {
      // Try to extract the JSON if the response contains other text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : responseText;

      const analysisResult: AiAnalysisResultT = JSON.parse(jsonStr);

      // Validate the required fields are present
      if (
        !analysisResult.summary ||
        !Array.isArray(analysisResult.keyPoints) ||
        !analysisResult.sentiment ||
        !Array.isArray(analysisResult.topics) ||
        !Array.isArray(analysisResult.suggestedTags)
      ) {
        logger.error('Invalid response format', { analysisResult });
        throw new BadRequestException('Invalid response format');
      }

      //   ensure sentiment is one of the following: positive, negative, neutral
      if (
        ![
          AnalysisSentiment.POSITIVE,
          AnalysisSentiment.NEGATIVE,
          AnalysisSentiment.NEUTRAL,
        ].includes(analysisResult.sentiment)
      ) {
        analysisResult.sentiment = AnalysisSentiment.NEUTRAL;
        logger.error('Invalid sentiment', { analysisResult });
        throw new BadRequestException('Invalid sentiment');
      }

      return {
        summary: analysisResult.summary,
        keyPoints: analysisResult.keyPoints || [],
        sentiment: analysisResult.sentiment,
        topics: analysisResult.topics || [],
        suggestedTags: analysisResult.suggestedTags || [],
      };
    } catch (error) {
      logger.error('Failed to analyze transcription', { error });
      throw new InternalServerErrorException('Failed to analyze transcription');
    }
  }
}
