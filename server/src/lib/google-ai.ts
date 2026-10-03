import { env } from '@/config/env';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const googleAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);

export const googleAIModel = googleAI.getGenerativeModel({
  model: env.GOOGLE_AI_MODEL,
});
