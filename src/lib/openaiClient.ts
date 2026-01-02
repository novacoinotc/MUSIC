/**
 * OpenAI Client - Server Only
 * This file should ONLY be imported in server-side code (API routes, server actions).
 * DO NOT import this in client components.
 */

import OpenAI from 'openai';

// Ensure this runs only on server
if (typeof window !== 'undefined') {
  throw new Error('openaiClient.ts must only be used on the server side');
}

let openaiInstance: OpenAI | null = null;

/**
 * Get OpenAI client instance (singleton pattern)
 */
export function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    openaiInstance = new OpenAI({
      apiKey,
    });
  }

  return openaiInstance;
}

/**
 * Get the model to use for composition
 */
export function getComposerModel(): string {
  return process.env.OPENAI_MODEL ?? 'gpt-4o';
}
