/**
 * Music Blueprint API - GPT-5.2 Integration via Responses API
 * POST /api/compose
 *
 * Generates a structured Music Blueprint JSON for Tone.js interpretation.
 * Uses OpenAI Responses API (POST /v1/responses) with strict JSON schema.
 *
 * Example Request:
 * POST /api/compose
 * { "prompt": "Dark hypnotic track, Ka:st style", "seed": 42 }
 *
 * Example Response:
 * {
 *   "success": true,
 *   "blueprint": {
 *     "bpm": 123,
 *     "key": "A",
 *     "scale": "minor",
 *     "vibe": ["dark", "hypnotic", "deep"],
 *     "structure": [...],
 *     "instruments": {...},
 *     "patterns": {...}
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { randomUUID } from 'crypto';

// Force Node.js runtime (not Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Types
interface NoteEvent {
  time: string; // "bar:beat:sixteenth"
  note: string;
  duration: string;
  velocity: number;
}

interface InstrumentParams {
  cutoff?: number;
  resonance?: number;
  attack?: number;
  decay?: number;
  sustain?: number;
  release?: number;
  drive?: number;
  reverbMix?: number;
  delayMix?: number;
  pitch?: number;
  [key: string]: number | string | undefined;
}

interface Section {
  type: 'intro' | 'buildup' | 'drop' | 'breakdown' | 'outro';
  bars: number;
  intensity: number; // 0-10
}

interface MusicBlueprint {
  bpm: number;
  key: string;
  scale: string;
  vibe: string[];
  structure: Section[];
  instruments: Record<string, InstrumentParams>;
  patterns: Record<string, NoteEvent[]>;
}

interface ComposeRequest {
  prompt: string;
  seed?: number;
}

interface ComposeResponse {
  success: boolean;
  blueprint?: MusicBlueprint;
  error?: string;
  detail?: string;
  requestId?: string;
}

// JSON Schema for strict output (GPT-5.2 Responses API)
const BLUEPRINT_SCHEMA = {
  name: 'MusicBlueprint',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      bpm: { type: 'number' },
      key: { type: 'string' },
      scale: { type: 'string' },
      vibe: { type: 'array', items: { type: 'string' } },
      structure: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['intro', 'buildup', 'drop', 'breakdown', 'outro'] },
            bars: { type: 'number' },
            intensity: { type: 'number' },
          },
          required: ['type', 'bars', 'intensity'],
          additionalProperties: false,
        },
      },
      instruments: {
        type: 'object',
        additionalProperties: {
          type: 'object',
          properties: {
            cutoff: { type: 'number' },
            resonance: { type: 'number' },
            attack: { type: 'number' },
            decay: { type: 'number' },
            sustain: { type: 'number' },
            release: { type: 'number' },
            drive: { type: 'number' },
            reverbMix: { type: 'number' },
            delayMix: { type: 'number' },
            pitch: { type: 'number' },
          },
          additionalProperties: false,
        },
      },
      patterns: {
        type: 'object',
        additionalProperties: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              time: { type: 'string' },
              note: { type: 'string' },
              duration: { type: 'string' },
              velocity: { type: 'number' },
            },
            required: ['time', 'note', 'duration', 'velocity'],
            additionalProperties: false,
          },
        },
      },
    },
    required: ['bpm', 'key', 'scale', 'vibe', 'structure', 'instruments', 'patterns'],
    additionalProperties: false,
  },
};

// System instructions for Afterlife/Ka:st style
const SYSTEM_INSTRUCTIONS = `You are a melodic techno producer specializing in Afterlife / Ka:st style.
Generate a Music Blueprint JSON that Tone.js can interpret.

PRODUCTION RULES:
- BPM: 118-128 (prefer 122-124)
- Scales: minor, phrygian, harmonicMinor, dorian
- Keys: prefer A, D, F#, C, G, E

SOUND DESIGN:
- Deep, warm sub bass (protagonist of the mix)
- Discrete hi-hats with subtle swing
- Minimal, emotive melodies (2-5 notes per phrase)
- Slow cinematic progression
- Maximum 4 layers simultaneously (5 in drop)
- Lots of space between notes
- Filter movement over note changes

STRUCTURE:
- intro: 16-32 bars, intensity 1-3 (pads only)
- buildup: 16 bars, intensity 4-6 (add kick, bass)
- drop: 32-64 bars, intensity 7-9 (full groove)
- breakdown: 16 bars, intensity 3-5 (emotional, no kick)
- outro: 16 bars, intensity 2-4 (elements exit)

INSTRUMENTS TO INCLUDE:
- kick: punch 0-100, tone 0-100, decay ms
- bass: cutoff 0-100, resonance 0-100, drive 0-100
- hats: decay 0-100, pitch 0-100, swing 0-100
- clap: decay 0-100, reverbMix 0-100
- perc: pitch 0-100, decay 0-100
- pad: cutoff 0-100, attack ms, release ms, reverbMix 0-100
- arp: cutoff 0-100, rate 0-100, swing 0-100
- lead: cutoff 0-100, attack ms, release ms, delayMix 0-100
- pluck: decay 0-100, brightness 0-100, reverbMix 0-100
- vocalPad: brightness 0-100, reverbMix 0-100, attack ms

PATTERNS:
- Use time format "bar:beat:sixteenth" (e.g., "0:0:0", "1:2:0")
- Keep patterns sparse and hypnotic
- Bass: long notes with filter automation
- Kick: four-on-the-floor
- Hats: offbeat pattern
- Melodies: 4-8 bar phrases that repeat

Return ONLY valid JSON matching the schema exactly.`;

// Get OpenAI client
function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }
  return new OpenAI({ apiKey });
}

// Get model (default gpt-5.2)
function getModel(): string {
  return process.env.OPENAI_MODEL ?? 'gpt-5.2';
}

// Parse blueprint from Responses API output
function parseBlueprint(response: OpenAI.Responses.Response): MusicBlueprint {
  // Cast to any to handle various response formats
  const resp = response as unknown as Record<string, unknown>;

  // Try output_text first (simpler format)
  if (resp.output_text && typeof resp.output_text === 'string') {
    return JSON.parse(resp.output_text);
  }

  // Try output array (structured format)
  if (Array.isArray(resp.output)) {
    for (const item of resp.output) {
      const itemObj = item as Record<string, unknown>;
      if (itemObj.type === 'message' && Array.isArray(itemObj.content)) {
        for (const content of itemObj.content) {
          const contentObj = content as Record<string, unknown>;
          if (contentObj.text && typeof contentObj.text === 'string') {
            return JSON.parse(contentObj.text);
          }
        }
      }
    }
  }

  throw new Error('No parseable content in response');
}

export async function POST(request: NextRequest): Promise<NextResponse<ComposeResponse>> {
  const requestId = randomUUID().slice(0, 8);
  const startTime = Date.now();

  console.log(`[Compose API] [${requestId}] Request received`);

  // Check API key first
  if (!process.env.OPENAI_API_KEY) {
    console.error(`[Compose API] [${requestId}] Missing OPENAI_API_KEY`);
    return NextResponse.json(
      { success: false, error: 'Missing OPENAI_API_KEY', requestId },
      { status: 500 }
    );
  }

  try {
    // Parse request body
    const body = await request.json() as ComposeRequest;
    const { prompt, seed } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid request: prompt is required', requestId },
        { status: 400 }
      );
    }

    console.log(`[Compose API] [${requestId}] Prompt: "${prompt.slice(0, 50)}..."`);

    // Build user message
    const userMessage = `Create a Music Blueprint for: "${prompt}"
${seed ? `Use seed ${seed} for reproducibility.` : ''}
Follow all Afterlife/Ka:st production rules. Return valid JSON only.`;

    // Call OpenAI Responses API
    const openai = getOpenAI();
    const model = getModel();

    console.log(`[Compose API] [${requestId}] Calling OpenAI Responses API with model: ${model}`);

    const response = await openai.responses.create({
      model,
      input: [
        { role: 'system', content: SYSTEM_INSTRUCTIONS },
        { role: 'user', content: userMessage },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: BLUEPRINT_SCHEMA.name,
          schema: BLUEPRINT_SCHEMA.schema,
          strict: true,
        },
      },
    });

    const latency = Date.now() - startTime;
    console.log(`[Compose API] [${requestId}] OpenAI responded in ${latency}ms`);

    // Parse the blueprint
    let blueprint: MusicBlueprint;
    try {
      blueprint = parseBlueprint(response);
    } catch (parseError) {
      console.error(`[Compose API] [${requestId}] Parse error:`, parseError);
      console.error(`[Compose API] [${requestId}] Raw response:`, JSON.stringify(response).slice(0, 500));
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to parse AI response',
          detail: parseError instanceof Error ? parseError.message : 'Unknown parse error',
          requestId,
        },
        { status: 500 }
      );
    }

    // Validate basic structure
    if (!blueprint.bpm || !blueprint.key || !blueprint.structure) {
      console.error(`[Compose API] [${requestId}] Invalid blueprint structure`);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid blueprint structure',
          detail: 'Missing required fields: bpm, key, or structure',
          requestId,
        },
        { status: 500 }
      );
    }

    console.log(`[Compose API] [${requestId}] Success - BPM: ${blueprint.bpm}, Key: ${blueprint.key}, Sections: ${blueprint.structure.length}`);

    return NextResponse.json({
      success: true,
      blueprint,
      requestId,
    });

  } catch (error) {
    const latency = Date.now() - startTime;
    console.error(`[Compose API] [${requestId}] Error after ${latency}ms:`, error);

    // Handle OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      console.error(`[Compose API] [${requestId}] OpenAI API Error - Status: ${error.status}, Message: ${error.message}`);
      return NextResponse.json(
        {
          success: false,
          error: `OpenAI API error: ${error.status}`,
          detail: error.message,
          requestId,
        },
        { status: 500 }
      );
    }

    // Handle missing API key
    if (error instanceof Error && error.message === 'Missing OPENAI_API_KEY') {
      return NextResponse.json(
        { success: false, error: 'Missing OPENAI_API_KEY', requestId },
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate blueprint',
        detail: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    );
  }
}
