import { GoogleGenAI } from '@google/genai';

/**
 * IMPORTANT:
 * This code runs in the browser.
 * `process.env.GEMINI_API_KEY` is replaced at build time by Vite's `define` config.
 * If the key is missing at build time, we must NOT crash the app at module load.
 */
const apiKey: string = (process.env.GEMINI_API_KEY as unknown as string) ?? '';

export function hasGeminiApiKey(): boolean {
  return typeof apiKey === 'string' && apiKey.trim().length > 0;
}

export function getGeminiClient(): GoogleGenAI | null {
  if (!hasGeminiApiKey()) return null;
  return new GoogleGenAI({ apiKey });
}
