/**
 * Music Blueprint API - Producer-Focused AI Composer
 * POST /api/compose
 *
 * The AI thinks like an elite underground techno producer, not a sound engineer.
 * It generates high-level musical decisions: structure, roles, energy, tension.
 * The client-side engine translates these into actual DSP parameters.
 *
 * Example Request:
 * POST /api/compose
 * { "prompt": "Dark hypnotic track, Ka:st style", "seed": 42 }
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { randomUUID } from 'crypto';

// Force Node.js runtime (not Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============ PRODUCER BLUEPRINT TYPES ============
// These represent musical decisions, not DSP parameters

interface SectionBlueprint {
  type: 'intro' | 'buildup' | 'tension' | 'drop' | 'breakdown' | 'release' | 'outro';
  bars: number;
  energy: number; // 1-10
  purpose: string; // What this section achieves emotionally
  active_instruments: string[]; // Which instruments play here
  tension_source: string; // What creates tension (or "none")
  release_moment: string; // What provides release (or "none")
}

interface InstrumentRole {
  role: 'protagonist' | 'texture' | 'rhythm' | 'accent' | 'atmosphere';
  character: string; // e.g., "dark and warm", "hypnotic pulse", "ethereal"
  presence: 'dominant' | 'supportive' | 'subtle';
  entry_section: number; // Section index where it enters
  exit_section: number; // Section index where it exits (-1 = stays until end)
}

interface ProducerBlueprint {
  // Core musical identity
  bpm: number;
  key: string;
  scale: string;
  vibe: string[]; // 3 emotional descriptors

  // The emotional story
  narrative: string; // One sentence describing the track's journey

  // Energy progression (one value per section)
  energy_curve: number[];

  // Structure with purpose
  sections: SectionBlueprint[];

  // Instrument roles (not parameters!)
  instruments: {
    kick: InstrumentRole;
    bass: InstrumentRole;
    pad: InstrumentRole;
    lead: InstrumentRole;
    hihat: InstrumentRole;
  };

  // High-level producer notes
  production_notes: string[];
}

interface ComposeRequest {
  prompt: string;
  seed?: number;
}

interface ComposeResponse {
  success: boolean;
  blueprint?: ProducerBlueprint;
  error?: string;
  detail?: string;
  requestId?: string;
}

// Helper to create strict object schemas
function strictObj(properties: Record<string, unknown>) {
  return {
    type: 'object',
    properties,
    required: Object.keys(properties),
    additionalProperties: false,
  };
}

// JSON Schema for producer blueprint
const BLUEPRINT_SCHEMA = {
  name: 'ProducerBlueprint',
  strict: true,
  schema: strictObj({
    bpm: { type: 'number' },
    key: { type: 'string' },
    scale: { type: 'string' },
    vibe: { type: 'array', items: { type: 'string' } },
    narrative: { type: 'string' },
    energy_curve: { type: 'array', items: { type: 'number' } },
    sections: {
      type: 'array',
      items: strictObj({
        type: { type: 'string', enum: ['intro', 'buildup', 'tension', 'drop', 'breakdown', 'release', 'outro'] },
        bars: { type: 'number' },
        energy: { type: 'number' },
        purpose: { type: 'string' },
        active_instruments: { type: 'array', items: { type: 'string' } },
        tension_source: { type: 'string' },
        release_moment: { type: 'string' },
      }),
    },
    instruments: strictObj({
      kick: strictObj({
        role: { type: 'string', enum: ['protagonist', 'texture', 'rhythm', 'accent', 'atmosphere'] },
        character: { type: 'string' },
        presence: { type: 'string', enum: ['dominant', 'supportive', 'subtle'] },
        entry_section: { type: 'number' },
        exit_section: { type: 'number' },
      }),
      bass: strictObj({
        role: { type: 'string', enum: ['protagonist', 'texture', 'rhythm', 'accent', 'atmosphere'] },
        character: { type: 'string' },
        presence: { type: 'string', enum: ['dominant', 'supportive', 'subtle'] },
        entry_section: { type: 'number' },
        exit_section: { type: 'number' },
      }),
      pad: strictObj({
        role: { type: 'string', enum: ['protagonist', 'texture', 'rhythm', 'accent', 'atmosphere'] },
        character: { type: 'string' },
        presence: { type: 'string', enum: ['dominant', 'supportive', 'subtle'] },
        entry_section: { type: 'number' },
        exit_section: { type: 'number' },
      }),
      lead: strictObj({
        role: { type: 'string', enum: ['protagonist', 'texture', 'rhythm', 'accent', 'atmosphere'] },
        character: { type: 'string' },
        presence: { type: 'string', enum: ['dominant', 'supportive', 'subtle'] },
        entry_section: { type: 'number' },
        exit_section: { type: 'number' },
      }),
      hihat: strictObj({
        role: { type: 'string', enum: ['protagonist', 'texture', 'rhythm', 'accent', 'atmosphere'] },
        character: { type: 'string' },
        presence: { type: 'string', enum: ['dominant', 'supportive', 'subtle'] },
        entry_section: { type: 'number' },
        exit_section: { type: 'number' },
      }),
    }),
    production_notes: { type: 'array', items: { type: 'string' } },
  }),
};

// ============ PRODUCER SYSTEM INSTRUCTIONS ============
// This is the creative brain - thinks like a human producer

const SYSTEM_INSTRUCTIONS = `You are an elite underground techno producer and musical director.

Your role is NOT to design synths, DSP parameters, or sound engineering values.
Your role is to think like a human producer creating timeless underground techno.

PRIMARY DNA (always present):
- Afterlife Records aesthetic
- Ka:st emotional depth
- Dark, hypnotic, underground
- Melodic but restrained
- Heavy, dominant low-end
- Slow evolution and tension
- Minimal but powerful arrangements

SECONDARY EXPLORATION (allowed, controlled):
You may subtly explore other techno territories ONLY if they enhance emotion:
- Hypnotic techno
- Deep progressive techno
- Raw underground Berlin techno
- Organic / cinematic textures
- Minimal trance influences (very subtle)

DO NOT:
- Create random or chaotic music
- Use many instruments (max 4-5 total)
- Make bright, pop, EDM, or festival sounds
- Overcrowd the arrangement
- Use fast or playful rhythms
- Repeat the same structural decisions every time

CORE RULES (STRICT):
- Max 4 to 5 instruments total per section
- Bass is always the main character (role: protagonist)
- One main melodic motif only
- Drums are minimal and supportive
- Silence and space are musical elements
- Long tension curves (16–32 bars minimum)
- Every track must feel intentional and human-made

CREATIVITY RULE:
Even when keeping the same aesthetic, NEVER reuse the same combination of:
- Energy curve shape
- Instrument entry/exit patterns
- Section pacing and lengths
- Emotional arc

Each composition must feel like a different artistic statement.

MUSICAL DECISIONS TO MAKE:
1. BPM (118–126 range, chosen intentionally for the mood)
2. Key and scale (dark-focused: minor, phrygian, dorian, harmonic minor)
3. Emotional narrative (one sentence describing the journey)
4. Energy curve (slow burn, delayed payoff, deep hypnotic build, etc.)
5. Instrument ROLES (protagonist, texture, rhythm, accent, atmosphere)
6. Section structure and PURPOSE (what each section achieves emotionally)
7. When elements enter and exit (section indices)
8. Where tension is created and released

VARY THESE EVERY TIME:
- Structure length (total bars should differ)
- Energy progression shape
- Use of melody vs rhythm focus
- Breakdown intensity and length
- Bass dominance style
- Which section has the emotional peak

SECTION TYPES AND PURPOSES:
- intro: Establish atmosphere, create anticipation (8-32 bars, energy 1-3)
- buildup: Add elements gradually, build momentum (8-16 bars, energy 3-6)
- tension: Hold back, create anticipation before drop (4-8 bars, energy 4-7)
- drop: Full groove, emotional payoff (32-64 bars, energy 7-9)
- breakdown: Emotional moment, remove drums, expose melody (8-32 bars, energy 2-5)
- release: Return after breakdown, rebuild energy (8-16 bars, energy 5-8)
- outro: Wind down, elements exit, leave space (8-16 bars, energy 2-4)

INSTRUMENT ROLES:
- protagonist: The main character, commands attention (usually bass)
- texture: Adds depth without demanding attention (pads, atmospheres)
- rhythm: Provides groove and movement (kicks, hats, subtle percs)
- accent: Occasional emphasis, not constant (stabs, fx)
- atmosphere: Creates space and mood (reverb tails, ambient textures)

CHARACTER DESCRIPTIONS (examples):
- "dark and warm sub" (bass)
- "hypnotic pulse" (kick)
- "ethereal and distant" (pad)
- "emotive and restrained" (lead)
- "subtle and ghostly" (hihat)

Think like a producer crafting a record for a dark warehouse at 4am.
Aim for timelessness, not novelty.

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
function parseBlueprint(response: OpenAI.Responses.Response): ProducerBlueprint {
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

  if (!process.env.OPENAI_API_KEY) {
    console.error(`[Compose API] [${requestId}] Missing OPENAI_API_KEY`);
    return NextResponse.json(
      { success: false, error: 'Missing OPENAI_API_KEY', requestId },
      { status: 500 }
    );
  }

  try {
    const body = await request.json() as ComposeRequest;
    const { prompt, seed } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid request: prompt is required', requestId },
        { status: 400 }
      );
    }

    console.log(`[Compose API] [${requestId}] Prompt: "${prompt.slice(0, 80)}..."`);

    // Build user message - encourage creativity
    const userMessage = `Create a unique Music Blueprint for: "${prompt}"

Remember:
- Think like a producer, not an engineer
- Make intentional musical decisions
- Vary the structure and energy from typical patterns
- The bass is the protagonist
- Less is more - use space and silence
- Create an emotional journey

${seed ? `Use seed ${seed} for variation.` : 'Be creative and unique.'}

Return ONLY valid JSON.`;

    const openai = getOpenAI();
    const model = getModel();

    console.log(`[Compose API] [${requestId}] Calling OpenAI with model: ${model}`);

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

    let blueprint: ProducerBlueprint;
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
    if (!blueprint.bpm || !blueprint.key || !blueprint.sections) {
      console.error(`[Compose API] [${requestId}] Invalid blueprint structure`);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid blueprint structure',
          detail: 'Missing required fields: bpm, key, or sections',
          requestId,
        },
        { status: 500 }
      );
    }

    console.log(`[Compose API] [${requestId}] Success - ${blueprint.bpm} BPM, ${blueprint.key} ${blueprint.scale}`);
    console.log(`[Compose API] [${requestId}] Narrative: "${blueprint.narrative}"`);
    console.log(`[Compose API] [${requestId}] Sections: ${blueprint.sections.length}, Energy curve: [${blueprint.energy_curve.join(', ')}]`);

    return NextResponse.json({
      success: true,
      blueprint,
      requestId,
    });

  } catch (error) {
    const latency = Date.now() - startTime;
    console.error(`[Compose API] [${requestId}] Error after ${latency}ms:`, error);

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

    if (error instanceof Error && error.message === 'Missing OPENAI_API_KEY') {
      return NextResponse.json(
        { success: false, error: 'Missing OPENAI_API_KEY', requestId },
        { status: 500 }
      );
    }

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
