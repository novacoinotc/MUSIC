// ============================================================
// MUSIC BLUEPRINT SCHEMA - Strict JSON Schema for OpenAI
// ============================================================
// This schema enforces strict mode with:
// - additionalProperties: false on all objects
// - required: all properties listed
// ============================================================

export const MUSIC_BLUEPRINT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'seed',
    'bpm',
    'key',
    'scale',
    'style',
    'groove',
    'swing',
    'macros',
    'structure',
    'instruments',
    'goosebumps',
    'production_notes',
  ],
  properties: {
    seed: {
      type: 'number',
      description: 'Random seed for reproducibility',
    },
    bpm: {
      type: 'number',
      description: 'Tempo in BPM (118-138 for melodic techno)',
    },
    key: {
      type: 'string',
      enum: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
      description: 'Musical key root note',
    },
    scale: {
      type: 'string',
      enum: ['minor', 'phrygian', 'harmonicMinor', 'dorian', 'melodicMinor', 'locrian'],
      description: 'Musical scale (dark scales preferred)',
    },
    style: {
      type: 'string',
      enum: ['afterlife_karst', 'afterlife_anyma', 'hypnotic', 'progressive', 'minimal', 'acid', 'industrial'],
      description: 'Production style/aesthetic',
    },
    groove: {
      type: 'string',
      enum: ['straight', 'shuffle', 'syncopated', 'broken'],
      description: 'Rhythmic groove type',
    },
    swing: {
      type: 'number',
      description: 'Swing amount 0-40',
    },
    macros: {
      type: 'object',
      additionalProperties: false,
      required: ['darkness', 'warmth', 'weight', 'emotion', 'tension', 'space', 'hype'],
      properties: {
        darkness: { type: 'number', description: '0-100: how dark/filtered the sound' },
        warmth: { type: 'number', description: '0-100: analog warmth level' },
        weight: { type: 'number', description: '0-100: sub/low-end emphasis' },
        emotion: { type: 'number', description: '0-100: emotional intensity' },
        tension: { type: 'number', description: '0-100: overall tension level' },
        space: { type: 'number', description: '0-100: reverb/spatial width' },
        hype: { type: 'number', description: '0-100: energy/drive level' },
      },
    },
    structure: {
      type: 'array',
      description: 'Track structure as array of sections',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['type', 'bars', 'intensity', 'automation_plan', 'arrangement'],
        properties: {
          type: {
            type: 'string',
            enum: ['intro', 'buildup', 'tension', 'drop', 'breakdown', 'bridge', 'release', 'outro'],
          },
          bars: {
            type: 'number',
            description: 'Section length in bars (4-64)',
          },
          intensity: {
            type: 'number',
            description: 'Energy level 0-100',
          },
          automation_plan: {
            type: 'object',
            additionalProperties: false,
            required: ['filter_sweep', 'reverb_bloom', 'tension_riser', 'drop_impact', 'micro_silence'],
            properties: {
              filter_sweep: { type: 'boolean' },
              reverb_bloom: { type: 'boolean' },
              tension_riser: { type: 'boolean' },
              drop_impact: { type: 'boolean' },
              micro_silence: { type: 'boolean' },
            },
          },
          arrangement: {
            type: 'object',
            additionalProperties: false,
            required: ['kick', 'bass', 'pad', 'arp', 'lead', 'pluck', 'stab', 'piano', 'strings', 'perc', 'hats', 'fx', 'vocal'],
            properties: {
              kick: { type: 'boolean' },
              bass: { type: 'boolean' },
              pad: { type: 'boolean' },
              arp: { type: 'boolean' },
              lead: { type: 'boolean' },
              pluck: { type: 'boolean' },
              stab: { type: 'boolean' },
              piano: { type: 'boolean' },
              strings: { type: 'boolean' },
              perc: { type: 'boolean' },
              hats: { type: 'boolean' },
              fx: { type: 'boolean' },
              vocal: { type: 'boolean' },
            },
          },
        },
      },
    },
    instruments: {
      type: 'object',
      additionalProperties: false,
      required: ['kick', 'bass', 'pad', 'arp', 'lead', 'pluck', 'stab', 'piano', 'strings', 'perc', 'hats', 'fx', 'vocal'],
      properties: {
        kick: {
          type: 'object',
          additionalProperties: false,
          required: ['enabled', 'character', 'punch', 'sub', 'decay', 'drive'],
          properties: {
            enabled: { type: 'boolean' },
            character: { type: 'string', description: 'Sound character like "deep thud" or "punchy"' },
            punch: { type: 'number' },
            sub: { type: 'number' },
            decay: { type: 'number' },
            drive: { type: 'number' },
          },
        },
        bass: {
          type: 'object',
          additionalProperties: false,
          required: ['enabled', 'character', 'cutoff', 'resonance', 'glide', 'sub_layer', 'distortion', 'sidechain'],
          properties: {
            enabled: { type: 'boolean' },
            character: { type: 'string', description: 'Like "dark warm sub" or "heavy analog rumble"' },
            cutoff: { type: 'number' },
            resonance: { type: 'number' },
            glide: { type: 'number' },
            sub_layer: { type: 'number' },
            distortion: { type: 'number' },
            sidechain: { type: 'number' },
          },
        },
        pad: {
          type: 'object',
          additionalProperties: false,
          required: ['enabled', 'character', 'cutoff', 'motion_rate', 'width', 'reverb'],
          properties: {
            enabled: { type: 'boolean' },
            character: { type: 'string', description: 'Like "ethereal dark cloud" or "filtered warmth"' },
            cutoff: { type: 'number' },
            motion_rate: { type: 'number' },
            width: { type: 'number' },
            reverb: { type: 'number' },
          },
        },
        arp: {
          type: 'object',
          additionalProperties: false,
          required: ['enabled', 'character', 'pattern', 'speed', 'octaves', 'gate'],
          properties: {
            enabled: { type: 'boolean' },
            character: { type: 'string' },
            pattern: { type: 'string', enum: ['up', 'down', 'updown', 'random', 'order'] },
            speed: { type: 'number' },
            octaves: { type: 'number' },
            gate: { type: 'number' },
          },
        },
        lead: {
          type: 'object',
          additionalProperties: false,
          required: ['enabled', 'character', 'attack', 'release', 'filter_cutoff', 'reverb_mix', 'delay_mix'],
          properties: {
            enabled: { type: 'boolean' },
            character: { type: 'string', description: 'Like "dark mid-range" or "filtered analog"' },
            attack: { type: 'number' },
            release: { type: 'number' },
            filter_cutoff: { type: 'number' },
            reverb_mix: { type: 'number' },
            delay_mix: { type: 'number' },
          },
        },
        pluck: {
          type: 'object',
          additionalProperties: false,
          required: ['enabled', 'character', 'decay', 'brightness', 'reverb_mix'],
          properties: {
            enabled: { type: 'boolean' },
            character: { type: 'string' },
            decay: { type: 'number' },
            brightness: { type: 'number' },
            reverb_mix: { type: 'number' },
          },
        },
        stab: {
          type: 'object',
          additionalProperties: false,
          required: ['enabled', 'character', 'attack', 'release', 'filter_cutoff'],
          properties: {
            enabled: { type: 'boolean' },
            character: { type: 'string' },
            attack: { type: 'number' },
            release: { type: 'number' },
            filter_cutoff: { type: 'number' },
          },
        },
        piano: {
          type: 'object',
          additionalProperties: false,
          required: ['enabled', 'character', 'brightness', 'reverb', 'velocity'],
          properties: {
            enabled: { type: 'boolean' },
            character: { type: 'string', description: 'ONLY use as distant texture - never bright' },
            brightness: { type: 'number' },
            reverb: { type: 'number' },
            velocity: { type: 'number' },
          },
        },
        strings: {
          type: 'object',
          additionalProperties: false,
          required: ['enabled', 'character', 'attack', 'release', 'brightness'],
          properties: {
            enabled: { type: 'boolean' },
            character: { type: 'string' },
            attack: { type: 'number' },
            release: { type: 'number' },
            brightness: { type: 'number' },
          },
        },
        perc: {
          type: 'object',
          additionalProperties: false,
          required: ['enabled', 'type', 'decay', 'reverb'],
          properties: {
            enabled: { type: 'boolean' },
            type: { type: 'string', enum: ['clap', 'rim', 'shaker', 'tom'] },
            decay: { type: 'number' },
            reverb: { type: 'number' },
          },
        },
        hats: {
          type: 'object',
          additionalProperties: false,
          required: ['enabled', 'character', 'decay', 'velocity', 'open_ratio'],
          properties: {
            enabled: { type: 'boolean' },
            character: { type: 'string', description: 'Like "subtle ghostly" or "minimal tick"' },
            decay: { type: 'number' },
            velocity: { type: 'number' },
            open_ratio: { type: 'number' },
          },
        },
        fx: {
          type: 'object',
          additionalProperties: false,
          required: ['enabled', 'type', 'intensity'],
          properties: {
            enabled: { type: 'boolean' },
            type: { type: 'string', enum: ['riser', 'impact', 'sweep', 'texture', 'atmosphere'] },
            intensity: { type: 'number' },
          },
        },
        vocal: {
          type: 'object',
          additionalProperties: false,
          required: ['enabled', 'type', 'gender', 'brightness', 'attack', 'release', 'reverb_mix', 'mix'],
          properties: {
            enabled: { type: 'boolean' },
            type: { type: 'string', enum: ['ooh', 'aah', 'eeh', 'choir'] },
            gender: { type: 'string', enum: ['female', 'male', 'both'] },
            brightness: { type: 'number', description: '0-100: keep low for dark sound (30-50)' },
            attack: { type: 'number' },
            release: { type: 'number' },
            reverb_mix: { type: 'number' },
            mix: { type: 'number', description: 'Overall vocal level 0-100' },
          },
        },
      },
    },
    goosebumps: {
      type: 'object',
      additionalProperties: false,
      required: ['enabled', 'micro_timing', 'exotic_fx', 'tension_notes'],
      properties: {
        enabled: { type: 'boolean', description: 'Enable goosebumps mode for emotional moments' },
        micro_timing: {
          type: 'object',
          additionalProperties: false,
          required: ['hats_ms', 'perc_ms', 'bass_ms'],
          properties: {
            hats_ms: { type: 'number', description: 'Humanize hats timing +-ms (8-25)' },
            perc_ms: { type: 'number', description: 'Humanize perc timing +-ms (5-20)' },
            bass_ms: { type: 'number', description: 'Bass offbeat timing +-ms (5-15)' },
          },
        },
        exotic_fx: {
          type: 'object',
          additionalProperties: false,
          required: ['enabled', 'type', 'placement', 'density'],
          properties: {
            enabled: { type: 'boolean' },
            type: { type: 'string', enum: ['metal_scrape', 'breath', 'reverse_impact', 'ritual_hit'] },
            placement: { type: 'string', enum: ['breakdown', 'pre_drop', 'post_drop'] },
            density: { type: 'string', enum: ['rare', 'sparse', 'moderate'] },
          },
        },
        tension_notes: {
          type: 'object',
          additionalProperties: false,
          required: ['enabled', 'amount'],
          properties: {
            enabled: { type: 'boolean', description: 'Add controlled dissonance in pre-drop/breakdown' },
            amount: { type: 'number', description: 'Dissonance intensity 0-100 (keep low: 15-35)' },
          },
        },
      },
    },
    production_notes: {
      type: 'array',
      items: { type: 'string' },
      description: 'Production tips and notes for this track',
    },
  },
} as const;

// ============================================================
// SYSTEM PROMPT FOR OPENAI - KA:ST / AFTERLIFE PRODUCER
// ============================================================

export const PRODUCER_SYSTEM_PROMPT = `You are an elite underground melodic techno producer with deep expertise in the Afterlife Records / KA:ST aesthetic.

Your job is NOT to write audio or DSP code - it's to make HIGH-LEVEL MUSICAL DECISIONS that a synthesis engine will execute.

=== PRIMARY DNA (ALWAYS PRESENT) ===
- Afterlife Records aesthetic (Tale Of Us, Anyma, Adriatique)
- KA:ST emotional depth and darkness
- Dark, hypnotic, underground sound
- Melodic but restrained - never "EDM pretty"
- Heavy, dominant LOW-END (sub-bass is the protagonist)
- Slow evolution and tension curves
- Minimal but powerful arrangements (max 4-5 elements per section)

=== SECONDARY EXPLORATION (ALLOWED, CONTROLLED 30%) ===
You may subtly explore other techno territories ONLY if they enhance emotion:
- Hypnotic techno (repetitive, trance-like)
- Deep progressive techno (long builds)
- Raw underground Berlin techno (stripped, driving)
- Organic/cinematic textures (field recordings, pads)
- Minimal trance influences (very subtle, never cheesy)

=== CRITICAL RULES ===

INSTRUMENTS - STRICT HIERARCHY:
1. BASS = PROTAGONIST (always loudest, always present in drops)
2. KICK = FOUNDATION (supports bass, never overpowers)
3. PAD/STRINGS = ATMOSPHERE (filtered, background)
4. LEAD/MELODY = TEXTURE (filtered, secondary, never bright)
5. ARP = HYPNOTIC TEXTURE (filtered, subtle, never melodic focus)
6. HATS/PERC = SUBTLE GROOVE (low in mix, not driving)
7. VOCAL = RARE EMOTIONAL MOMENTS (breakdowns only, ooh/aah/choir, never lyrics)
8. PIANO = ALMOST NEVER (only as distant filtered texture in breakdowns)

ANTI-BRIGHT RULES:
- NO piano as protagonist - ONLY distant filtered texture
- NO bright plucks - use dark filtered textures instead
- NO clear melodic leads - prefer dark mid-range analog textures
- NO arpeggios as melodic focus - arp is ONLY for subtle hypnotic texture
- If it sounds "beautiful", "pretty", or conventionally "melodic" = FAILURE
- Sound must be: dark, filtered, mid-low focused, hypnotic, restrained

VOCALS (CRITICAL - THEY MUST SOUND):
- Type: ONLY ooh, aah, or choir formants - NO real words
- When: ONLY in breakdowns and pre-drop moments
- Character: Ethereal, distant, heavily reverbed
- Mix: Present enough to create emotion but not dominating
- Brightness: Keep 30-50 (dark, filtered)
- ALWAYS enable vocals in at least ONE breakdown section

STRUCTURE:
- Max 4-5 instruments per section
- Long tension curves (16-32 bars minimum)
- Intro: Atmosphere only (pad, strings, FX)
- Buildup: Add groove elements gradually
- Drop: Full groove BUT bass dominates
- Breakdown: Emotional moment, NO drums, expose melody + vocals
- Outro: Wind down, elements exit, leave space

GOOSEBUMPS MODE:
When enabled, add:
- Micro-timing humanization on hats/perc (8-25ms)
- Rare exotic FX (metal scrape, breath, reverse impact) every 8-16 bars
- Controlled dissonance (b2 or #4) in pre-drop tension moments
- Micro-silences before drops (1 bar, cut pad/arp on beat 4)

VARIETY RULE:
Every track MUST be different. Vary:
- Energy curve shape
- Instrument entry/exit patterns
- Section lengths
- Emotional arc
- Which section has the peak

Return ONLY valid JSON matching the schema exactly.`;

// TypeScript types derived from the schema
export interface MusicBlueprintFull {
  seed: number;
  bpm: number;
  key: string;
  scale: string;
  style: string;
  groove: string;
  swing: number;
  macros: {
    darkness: number;
    warmth: number;
    weight: number;
    emotion: number;
    tension: number;
    space: number;
    hype: number;
  };
  structure: Array<{
    type: 'intro' | 'buildup' | 'tension' | 'drop' | 'breakdown' | 'bridge' | 'release' | 'outro';
    bars: number;
    intensity: number;
    automation_plan: {
      filter_sweep: boolean;
      reverb_bloom: boolean;
      tension_riser: boolean;
      drop_impact: boolean;
      micro_silence: boolean;
    };
    arrangement: {
      kick: boolean;
      bass: boolean;
      pad: boolean;
      arp: boolean;
      lead: boolean;
      pluck: boolean;
      stab: boolean;
      piano: boolean;
      strings: boolean;
      perc: boolean;
      hats: boolean;
      fx: boolean;
      vocal: boolean;
    };
  }>;
  instruments: {
    kick: { enabled: boolean; character: string; punch: number; sub: number; decay: number; drive: number };
    bass: { enabled: boolean; character: string; cutoff: number; resonance: number; glide: number; sub_layer: number; distortion: number; sidechain: number };
    pad: { enabled: boolean; character: string; cutoff: number; motion_rate: number; width: number; reverb: number };
    arp: { enabled: boolean; character: string; pattern: string; speed: number; octaves: number; gate: number };
    lead: { enabled: boolean; character: string; attack: number; release: number; filter_cutoff: number; reverb_mix: number; delay_mix: number };
    pluck: { enabled: boolean; character: string; decay: number; brightness: number; reverb_mix: number };
    stab: { enabled: boolean; character: string; attack: number; release: number; filter_cutoff: number };
    piano: { enabled: boolean; character: string; brightness: number; reverb: number; velocity: number };
    strings: { enabled: boolean; character: string; attack: number; release: number; brightness: number };
    perc: { enabled: boolean; type: string; decay: number; reverb: number };
    hats: { enabled: boolean; character: string; decay: number; velocity: number; open_ratio: number };
    fx: { enabled: boolean; type: string; intensity: number };
    vocal: { enabled: boolean; type: string; gender: string; brightness: number; attack: number; release: number; reverb_mix: number; mix: number };
  };
  goosebumps: {
    enabled: boolean;
    micro_timing: { hats_ms: number; perc_ms: number; bass_ms: number };
    exotic_fx: { enabled: boolean; type: string; placement: string; density: string };
    tension_notes: { enabled: boolean; amount: number };
  };
  production_notes: string[];
}
