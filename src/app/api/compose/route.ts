/**
 * Composer Brain API Route - GPT Integration
 * POST /api/compose
 *
 * Generates a structured musical plan using OpenAI's API.
 * Returns a ComposerPlan JSON that can be applied to the track store.
 *
 * Example Request:
 * POST /api/compose
 * {
 *   "prompt": "Dark hypnotic track with emotional breakdown, Ka:st style",
 *   "durationBars": 128,
 *   "bpmHint": 123,
 *   "styleHint": "afterlife_kast"
 * }
 *
 * Example Response:
 * {
 *   "success": true,
 *   "plan": {
 *     "style": "afterlife_kast",
 *     "bpm": 123,
 *     "key": "A",
 *     "scale": "minor",
 *     "groove": "straight",
 *     "energy_curve": [2, 3, 5, 7, 9, 4, 6, 8, 10, 3],
 *     "global_rules": {
 *       "max_simultaneous_layers": 4,
 *       "high_end_limit_hz": 10000,
 *       "silence_before_drop": true,
 *       "melody_density_cap": 35,
 *       "arp_density_cap": 40,
 *       "bass_movement": "filter_only"
 *     },
 *     "sections": [
 *       { "type": "intro", "bars": 16, "focus": "space", "allowed_layers": ["pad", "strings"] },
 *       ...
 *     ],
 *     "instrument_targets": { ... }
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, getComposerModel } from '@/lib/openaiClient';
import {
  ComposeRequestSchema,
  ComposerPlanSchema,
  type ComposeResponse,
} from '@/types/composer';

// Simple in-memory rate limiting (1 request per 2 seconds per IP)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 2000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimitMap.get(ip) || 0;

  if (now - lastRequest < RATE_LIMIT_MS) {
    return false;
  }

  rateLimitMap.set(ip, now);
  return true;
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamp] of rateLimitMap.entries()) {
    if (now - timestamp > 60000) {
      rateLimitMap.delete(ip);
    }
  }
}, 60000);

// System prompt for the AI composer
const SYSTEM_PROMPT = `Eres un productor de melodic techno estilo Afterlife, específicamente Ka:st. Debes devolver SOLO JSON válido según el schema proporcionado.

PRIORIDADES DE PRODUCCIÓN:
- Bajo profundo, oscuro, underground
- Emoción contenida, no explosiva
- Progresión lenta y cinematográfica
- Pocos elementos simultáneos (máximo 4, solo 5 en drop)
- Repetición hipnótica con micro-evolución

REGLAS DE MELODÍA:
- Sparse y memorable: 2-5 notas por frase
- Frase de 4-8 compases que repite
- Variación con filtro/reverb, NO con notas nuevas
- Prohibido: leads agudos chillones

REGLAS DE BAJO:
- Nota larga + movimiento de filtro
- NO walking bass
- Sub profundo, protagonista del mix

REGLAS DE RITMO:
- Hi-hats: offbeat con swing sutil
- Kick: cuatro en el suelo, limpio
- Clap/rim en 2 y 4, sutil

ESTRUCTURA BASE (ajustable):
- Intro: 16-32 bars (pad + strings, sin ritmo)
- Groove: 16-32 bars (kick + bass + hats)
- Development: 16 bars (añadir arp o melody)
- Pre-drop: 2 bars silencio (solo pad/FX)
- Drop: 32-64 bars (máximo 5 capas)
- Breakdown: 16 bars (sin kick, emocional)
- Build: 16 bars (kick vuelve, tensión)
- Drop 2: 32 bars (variación del drop 1)
- Outro: 16 bars (elementos salen)

ESCALAS PREFERIDAS: minor, phrygian, harmonicMinor
KEYS PREFERIDOS: A, D, F#, C, G, E
BPM: 122-124 ideal

Devuelve style SIEMPRE como "afterlife_kast".
El JSON debe seguir exactamente el schema ComposerPlan.`;

// JSON Schema for structured output
const COMPOSER_PLAN_JSON_SCHEMA = {
  name: 'ComposerPlan',
  strict: false,
  schema: {
    type: 'object',
    properties: {
      style: { type: 'string' },
      bpm: { type: 'number' },
      key: { type: 'string' },
      scale: { type: 'string' },
      groove: { type: 'string' },
      energy_curve: {
        type: 'array',
        items: { type: 'number' },
      },
      global_rules: {
        type: 'object',
        properties: {
          max_simultaneous_layers: { type: 'number' },
          high_end_limit_hz: { type: 'number' },
          silence_before_drop: { type: 'boolean' },
          melody_density_cap: { type: 'number' },
          arp_density_cap: { type: 'number' },
          bass_movement: { type: 'string', enum: ['filter_only', 'note_sparse'] },
        },
        required: [
          'max_simultaneous_layers',
          'high_end_limit_hz',
          'silence_before_drop',
          'melody_density_cap',
          'arp_density_cap',
          'bass_movement',
        ],
        additionalProperties: false,
      },
      sections: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['intro', 'buildup', 'breakdown', 'drop', 'outro'] },
            bars: { type: 'number' },
            focus: { type: 'string', enum: ['space', 'groove', 'tension', 'emotion', 'release'] },
            allowed_layers: {
              type: 'array',
              items: {
                type: 'string',
                enum: [
                  'kick', 'bass', 'hihat', 'openhat', 'perc', 'pad', 'melody',
                  'arp', 'pluck', 'stab', 'piano', 'strings', 'acid', 'vocal', 'fx',
                ],
              },
            },
          },
          required: ['type', 'bars', 'focus', 'allowed_layers'],
          additionalProperties: false,
        },
      },
      instrument_targets: {
        type: 'object',
        properties: {
          kick: { type: 'object', additionalProperties: true },
          bass: { type: 'object', additionalProperties: true },
          melody: { type: 'object', additionalProperties: true },
          hihat: { type: 'object', additionalProperties: true },
          pad: { type: 'object', additionalProperties: true },
          arp: { type: 'object', additionalProperties: true },
          pluck: { type: 'object', additionalProperties: true },
          stab: { type: 'object', additionalProperties: true },
          piano: { type: 'object', additionalProperties: true },
          strings: { type: 'object', additionalProperties: true },
          acid: { type: 'object', additionalProperties: true },
          perc: { type: 'object', additionalProperties: true },
          vocal: { type: 'object', additionalProperties: true },
        },
        required: [],
        additionalProperties: false,
      },
    },
    required: [
      'style',
      'bpm',
      'key',
      'scale',
      'groove',
      'energy_curve',
      'global_rules',
      'sections',
      'instrument_targets',
    ],
    additionalProperties: false,
  },
};

export async function POST(request: NextRequest): Promise<NextResponse<ComposeResponse>> {
  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';

  // Check rate limit
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded. Please wait 2 seconds.' },
      { status: 429 }
    );
  }

  try {
    // Parse and validate request body
    const body = await request.json();
    const parseResult = ComposeRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid request: ${parseResult.error.issues.map(e => e.message).join(', ')}`,
        },
        { status: 400 }
      );
    }

    const { prompt, seed, durationBars, bpmHint, styleHint } = parseResult.data;

    // Build user message
    const userMessage = `
Genera un plan musical para: "${prompt}"

Parámetros:
- Duración total aproximada: ${durationBars} bars
${bpmHint ? `- BPM sugerido: ${bpmHint}` : '- BPM: elige entre 122-124'}
${styleHint ? `- Estilo: ${styleHint}` : '- Estilo: afterlife_kast'}
${seed ? `- Seed para reproducibilidad: ${seed}` : ''}

Genera el JSON del ComposerPlan siguiendo todas las reglas de producción Ka:st/Afterlife.
Asegúrate de que:
1. La suma de bars de todas las secciones sea aproximadamente ${durationBars}
2. energy_curve tenga un valor por cada sección
3. instrument_targets incluya parámetros oscuros y cálidos
4. Máximo 4 capas por sección (5 en drop)
5. silence_before_drop = true si hay un pre-drop de 2 bars
`;

    // Call OpenAI API
    const openai = getOpenAI();
    const model = getComposerModel();

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 4000,
    });

    // Extract content
    const content = response.choices[0]?.message?.content;

    if (!content) {
      console.error('[Compose API] Empty response from OpenAI');
      return NextResponse.json(
        { success: false, error: 'Empty response from AI' },
        { status: 500 }
      );
    }

    // Parse JSON response
    let planData: unknown;
    try {
      planData = JSON.parse(content);
    } catch (parseError) {
      console.error('[Compose API] Failed to parse JSON:', content.substring(0, 200));
      return NextResponse.json(
        { success: false, error: 'Invalid JSON response from AI' },
        { status: 500 }
      );
    }

    // Validate against schema
    const planResult = ComposerPlanSchema.safeParse(planData);

    if (!planResult.success) {
      console.error('[Compose API] Schema validation failed:', planResult.error.issues);
      return NextResponse.json(
        {
          success: false,
          error: `Invalid plan structure: ${planResult.error.issues.map(e => e.message).join(', ')}`,
        },
        { status: 500 }
      );
    }

    // Success!
    return NextResponse.json({
      success: true,
      plan: planResult.data,
    });
  } catch (error) {
    // Log error server-side without exposing details
    console.error('[Compose API] Error:', error instanceof Error ? error.message : 'Unknown error');

    // Check for specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { success: false, error: 'API configuration error' },
          { status: 500 }
        );
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { success: false, error: 'AI service rate limit exceeded' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate composition plan' },
      { status: 500 }
    );
  }
}
