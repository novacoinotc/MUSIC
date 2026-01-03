'use client';

import type {
  NoteEvent, KickParams, BassParams, MelodyParams, HiHatParams, PadParams,
  PluckParams, StabParams, PianoParams, StringsParams, AcidParams, PercParams,
  ArpParams, VocalParams, Scale, SectionConfig, TechnoStyle, GrooveType, ChordProgression
} from '@/types';
import { getMicroTimingMs, isGoosebumpsEnabled, shouldApplyTensionNote, getTensionNote } from './composeFromBlueprint';

// ========== KA:ST / AFTERLIFE DARK SOUND DESIGN ==========
// Reglas: dark, underground, emotivo, hipnótico
// - Máximo 4-6 capas activas por sección
// - Low-end dominante (bass es protagonista)
// - High-end controlado (opaco/cálido)
// - Emoción viene de repetición + automatización lenta

// Ka:st preferred keys (dark, emotional)
const KAST_KEYS = ['A', 'D', 'F#', 'C', 'G', 'E'];

// Ka:st preferred scales (dark only)
const KAST_SCALES: Scale[] = ['minor', 'phrygian', 'harmonicMinor'];

// Ka:st tempo range
const KAST_BPM_MIN = 122;
const KAST_BPM_MAX = 124;

// Hook motif patterns (2-4 notes, hypnotic, repetitive)
const KAST_HOOK_MOTIFS = [
  // Simple 2-note hooks (most hypnotic)
  { notes: [0, 4], positions: [0, 8], durations: ['4n', '4n'] },
  { notes: [0, 7], positions: [0, 12], durations: ['4n.', '8n'] },
  { notes: [4, 0], positions: [4, 12], durations: ['4n', '4n'] },
  // 3-note hooks
  { notes: [0, 2, 4], positions: [0, 6, 12], durations: ['4n', '8n', '4n'] },
  { notes: [0, 4, 2], positions: [0, 8, 14], durations: ['4n', '4n', '8n'] },
  // 4-note hooks (maximum complexity)
  { notes: [0, 2, 4, 2], positions: [0, 4, 8, 12], durations: ['8n', '8n', '8n', '8n'] },
  { notes: [0, 4, 7, 4], positions: [0, 4, 8, 14], durations: ['8n', '8n', '4n', '8n'] },
];

// Energy levels by section type (1-10)
const KAST_ENERGY_MAP: Record<string, { min: number; max: number }> = {
  intro: { min: 2, max: 3 },
  buildup: { min: 4, max: 6 },
  drop: { min: 8, max: 9 },
  breakdown: { min: 3, max: 4 },
  bridge: { min: 5, max: 6 },
  outro: { min: 3, max: 4 },
};

// Maximum simultaneous elements per section type
const KAST_MAX_ELEMENTS: Record<string, number> = {
  intro: 3,
  buildup: 5,
  drop: 6,
  breakdown: 4,
  bridge: 5,
  outro: 4,
};

// Extended scales for more variety
const SCALES: Record<Scale, number[]> = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  pentatonicMinor: [0, 3, 5, 7, 10],
  pentatonicMajor: [0, 2, 4, 7, 9],
  blues: [0, 3, 5, 6, 7, 10],
  wholeNote: [0, 2, 4, 6, 8, 10],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  arabic: [0, 1, 4, 5, 7, 8, 11],
  japanese: [0, 1, 5, 7, 8],
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Chord numeral to scale degree mapping (for minor key)
// i = 1 (tonic), ii° = 2, III = 3, iv = 4, v = 5, VI = 6, VII = 7
const CHORD_NUMERALS: Record<string, number> = {
  'i': 0,    // Tonic minor
  'ii': 1,   // Supertonic (dim in minor)
  'III': 2,  // Mediant major
  'iv': 3,   // Subdominant minor
  'v': 4,    // Dominant minor (natural minor)
  'V': 4,    // Dominant major (harmonic minor)
  'VI': 5,   // Submediant major
  'VII': 6,  // Subtonic major
  'vii': 6,  // Leading tone dim
  'IV': 3,   // Subdominant major (borrowed)
};

// Parse chord progression string into array of scale degrees
function parseChordProgression(progression: ChordProgression): number[] {
  const parts = progression.split('-');
  return parts.map(numeral => CHORD_NUMERALS[numeral] ?? 0);
}

// Get chord tones for a given scale degree (triads: root, 3rd, 5th)
function getChordTones(scaleDegree: number, scaleNotes: string[]): string[] {
  const root = scaleDegree % scaleNotes.length;
  const third = (scaleDegree + 2) % scaleNotes.length;
  const fifth = (scaleDegree + 4) % scaleNotes.length;
  return [scaleNotes[root], scaleNotes[third], scaleNotes[fifth]];
}

// Get the current chord based on bar position and progression
function getCurrentChord(
  bar: number,
  barsPerChord: number,
  progression: number[],
  scaleNotes: string[]
): string[] {
  const chordIndex = Math.floor(bar / barsPerChord) % progression.length;
  const scaleDegree = progression[chordIndex];
  return getChordTones(scaleDegree, scaleNotes);
}

// Get root note for current chord
function getCurrentRoot(
  bar: number,
  barsPerChord: number,
  progression: number[],
  scaleNotes: string[]
): string {
  const chordIndex = Math.floor(bar / barsPerChord) % progression.length;
  const scaleDegree = progression[chordIndex];
  return scaleNotes[scaleDegree % scaleNotes.length];
}

// Seeded random for reproducibility
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

// ========== GOOSEBUMPS: MICRO-TIMING HUMANIZATION ==========
// Add subtle timing jitter to make patterns feel more human/organic

/**
 * Apply micro-timing jitter to a time string (bar:beat:sixteenth)
 * Returns the jittered time as seconds offset
 */
function applyMicroTiming(
  timeStr: string,
  msJitter: number,
  random: () => number,
  bpm: number = 122
): string {
  if (msJitter === 0) return timeStr;

  // Parse time string
  const [bar, beat, sixteenth] = timeStr.split(':').map(Number);

  // Calculate the time in sixteenths
  const totalSixteenths = bar * 16 + beat * 4 + sixteenth;

  // Apply jitter (±msJitter in ms converted to sixteenth note offset)
  const msPerSixteenth = (60000 / bpm) / 4; // ms per sixteenth note
  const jitterSixteenths = ((random() * 2 - 1) * msJitter) / msPerSixteenth;

  // Add jitter but clamp to avoid going negative
  const jitteredSixteenths = Math.max(0, totalSixteenths + jitterSixteenths);

  // Convert back to bar:beat:sixteenth
  const newBar = Math.floor(jitteredSixteenths / 16);
  const remaining = jitteredSixteenths % 16;
  const newBeat = Math.floor(remaining / 4);
  const newSixteenth = Math.round(remaining % 4);

  return `${newBar}:${newBeat}:${newSixteenth}`;
}

/**
 * Humanize a pattern's timing with micro-timing jitter
 */
function humanizePatternTiming(
  events: NoteEvent[],
  msJitter: number,
  random: () => number,
  bpm: number = 122
): NoteEvent[] {
  if (msJitter === 0) return events;

  return events.map(event => ({
    ...event,
    time: applyMicroTiming(event.time, msJitter, random, bpm),
  }));
}

function noteToMidi(note: string): number {
  const match = note.match(/([A-G]#?)(\d+)/);
  if (!match) return 60;
  const [, name, octave] = match;
  const noteIndex = NOTE_NAMES.indexOf(name);
  return noteIndex + (parseInt(octave) + 1) * 12;
}

function midiToNote(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

function getScaleNotes(root: string, scale: Scale, octave: number): string[] {
  const rootMidi = noteToMidi(`${root}${octave}`);
  return SCALES[scale].map((interval) => midiToNote(rootMidi + interval));
}

// ========== KICK PATTERNS ==========
// Clean, danceable kick patterns - the foundation of the groove
const KICK_PATTERNS = {
  fourOnFloor: [0, 4, 8, 12],  // Classic techno
  minimal: [0, 8],            // Very minimal
  skipBeat: [0, 4, 12],       // Skip beat 3 for tension
  bounce: [0, 4, 8, 14],      // Slight shuffle feel
  halftime: [0, 8],           // Half time feel
  punchy: [0, 4, 10, 12],     // Syncopated but groovy
};

export function generateKickPattern(
  bars: number,
  intensity: number,
  style: TechnoStyle,
  groove: GrooveType,
  seed: number
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];

  // Select pattern based on style - prioritize solid groove
  let patternName: keyof typeof KICK_PATTERNS;

  switch (style) {
    case 'minimal':
    case 'hypnotic':
      patternName = 'fourOnFloor'; // Steady foundation
      break;
    case 'progressive':
    case 'melodic':
      patternName = random() > 0.3 ? 'fourOnFloor' : 'skipBeat';
      break;
    case 'dark':
    case 'berlin':
      patternName = random() > 0.5 ? 'fourOnFloor' : 'punchy';
      break;
    default:
      patternName = 'fourOnFloor'; // Default to solid groove
  }

  // Groove variations
  if (groove === 'halftime') patternName = 'halftime';
  if (groove === 'broken') patternName = 'punchy';

  const pattern = KICK_PATTERNS[patternName];

  for (let bar = 0; bar < bars; bar++) {
    // Keep pattern consistent for better groove - only vary occasionally
    const useVariation = random() > 0.85 && bar > 0 && bar % 4 === 3;
    const currentPattern = useVariation && intensity > 70
      ? KICK_PATTERNS.bounce
      : pattern;

    for (const pos of currentPattern) {
      // High intensity = more kicks
      if (intensity < 50 && random() > 0.8) continue;

      const beat = Math.floor(pos / 4);
      const sixteenth = pos % 4;

      events.push({
        note: 'C1',
        time: `${bar}:${beat}:${sixteenth}`,
        duration: '8n',
        velocity: pos === 0 ? 0.95 : 0.85, // Downbeat accent
      });
    }
  }

  return events;
}

// ========== BASS PATTERNS ==========
// Less dense, more groove - leave space for the kick
const BASS_PATTERNS = [
  // Minimal - just root on offbeats, leaving space for kick
  { positions: [2, 10], notes: [0, 0], durations: ['8n', '8n'] },
  // Syncopated groove
  { positions: [3, 11], notes: [0, 2], durations: ['8n', '8n'] },
  // Melodic minimal
  { positions: [2, 6, 14], notes: [0, 2, 0], durations: ['8n', '8n', '8n'] },
  // Rolling but sparse
  { positions: [2, 7, 10, 15], notes: [0, 0, 2, 0], durations: ['16n', '16n', '16n', '16n'] },
  // Long notes
  { positions: [2], notes: [0], durations: ['2n'] },
  // Punchy
  { positions: [2, 10], notes: [0, 3], durations: ['16n', '16n'] },
];

export function generateBassPattern(
  bars: number,
  root: string,
  scale: Scale,
  params: BassParams,
  intensity: number,
  style: TechnoStyle,
  seed: number
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];
  const octave = 1 + params.octave;
  const scaleNotes = getScaleNotes(root, scale, octave);

  // Pick pattern based on style
  let patternIndex: number;
  switch (style) {
    case 'minimal':
      patternIndex = 0;
      break;
    case 'hypnotic':
      patternIndex = 4; // Long notes
      break;
    case 'melodic':
    case 'progressive':
      patternIndex = 2; // Melodic minimal
      break;
    default:
      patternIndex = Math.floor(random() * BASS_PATTERNS.length);
  }

  for (let bar = 0; bar < bars; bar++) {
    // Switch pattern every 4 bars for variety
    if (bar > 0 && bar % 4 === 0 && random() > 0.6) {
      patternIndex = Math.floor(random() * BASS_PATTERNS.length);
    }

    const pattern = BASS_PATTERNS[patternIndex];

    for (let i = 0; i < pattern.positions.length; i++) {
      if (random() * 100 > intensity * 1.2) continue;

      const noteIdx = Math.abs(pattern.notes[i]) % scaleNotes.length;
      const pos = pattern.positions[i];
      const beat = Math.floor(pos / 4);
      const sixteenth = pos % 4;

      events.push({
        note: scaleNotes[noteIdx],
        time: `${bar}:${beat}:${sixteenth}`,
        duration: pattern.durations[i],
        velocity: 0.7 + random() * 0.15,
      });
    }
  }

  return events;
}

// ========== ACID BASS PATTERNS ==========
// 303-style but not overwhelming
export function generateAcidPattern(
  bars: number,
  root: string,
  scale: Scale,
  params: AcidParams,
  intensity: number,
  seed: number
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];
  const scaleNotes = getScaleNotes(root, scale, 1);
  const upperNotes = getScaleNotes(root, scale, 2);

  // Sparser acid patterns - not every 16th
  const acidPatterns = [
    [0, -1, -1, 4, -1, -1, 7, -1, 0, -1, -1, 4, -1, -1, 5, -1],
    [-1, 0, -1, -1, 4, -1, -1, 7, -1, 0, -1, -1, 5, -1, -1, 7],
    [0, -1, 0, -1, 4, -1, 7, -1, 0, -1, 0, -1, 5, -1, 3, -1],
  ];

  const patternIdx = Math.floor(random() * acidPatterns.length);

  for (let bar = 0; bar < bars; bar++) {
    const pattern = acidPatterns[(patternIdx + Math.floor(bar / 2)) % acidPatterns.length];

    for (let i = 0; i < 16; i++) {
      if (pattern[i] === -1) continue; // Rest
      if (random() * 100 > intensity) continue;

      const allNotes = [...scaleNotes, ...upperNotes];
      const noteIdx = pattern[i] % allNotes.length;
      const beat = Math.floor(i / 4);
      const sixteenth = i % 4;

      const isAccent = random() > (1 - params.accent / 100);

      events.push({
        note: allNotes[noteIdx],
        time: `${bar}:${beat}:${sixteenth}`,
        duration: '16n',
        velocity: isAccent ? 0.85 : 0.6,
      });
    }
  }

  return events;
}

// ========== MELODY PATTERNS ==========
// MUCH sparser - this is melodic techno, not EDM
const MELODY_PHRASES = [
  // Simple, emotional phrases - just 2-4 notes per bar
  { notes: [0, 4], positions: [0, 8], durations: ['2n', '2n'] },
  { notes: [4, 7, 4], positions: [0, 6, 12], durations: ['4n.', '4n.', '4n'] },
  { notes: [0, 2, 4], positions: [0, 8, 12], durations: ['2n', '4n', '4n'] },
  // Climactic
  { notes: [7, 9, 7, 5], positions: [0, 4, 8, 12], durations: ['4n', '4n', '4n', '4n'] },
  // Ethereal - very sparse
  { notes: [4, 7], positions: [0, 8], durations: ['2n.', '4n.'] },
  // Dark and minimal
  { notes: [0, 1], positions: [0, 12], durations: ['2n.', '4n'] },
  // Rising tension
  { notes: [0, 2, 4, 5], positions: [0, 4, 8, 12], durations: ['4n', '4n', '4n', '4n'] },
];

export function generateMelodyPattern(
  bars: number,
  params: MelodyParams,
  style: TechnoStyle,
  seed: number
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];

  const baseOctave = params.octave;
  const scaleNotes = getScaleNotes(params.rootNote, params.scale, baseOctave);
  const upperNotes = getScaleNotes(params.rootNote, params.scale, baseOctave + 1);
  const allNotes = [...scaleNotes, ...upperNotes.slice(0, 5)];

  // Select phrase pool based on style
  let phraseIndices: number[];
  switch (style) {
    case 'dark':
    case 'industrial':
      phraseIndices = [5]; // Dark minimal
      break;
    case 'melodic':
    case 'progressive':
      phraseIndices = [0, 1, 2, 4]; // Emotional, sparse
      break;
    case 'hypnotic':
    case 'minimal':
      phraseIndices = [0, 4, 5]; // Very sparse
      break;
    default:
      phraseIndices = [0, 1, 2, 3];
  }

  // Density affects how many bars have melody
  const playEveryNBars = params.density > 70 ? 1 : params.density > 40 ? 2 : 4;

  for (let bar = 0; bar < bars; bar++) {
    // Not every bar has melody - creates space
    if (bar % playEveryNBars !== 0 && random() > 0.3) continue;

    const phraseIdx = phraseIndices[Math.floor(random() * phraseIndices.length)];
    const phrase = MELODY_PHRASES[phraseIdx];

    for (let i = 0; i < phrase.notes.length; i++) {
      if (random() > 0.85) continue; // Occasional note skip

      const noteIndex = phrase.notes[i] % allNotes.length;
      const pos = phrase.positions[i];
      const beat = Math.floor(pos / 4);
      const sixteenth = pos % 4;

      events.push({
        note: allNotes[noteIndex],
        time: `${bar}:${beat}:${sixteenth}`,
        duration: phrase.durations[i],
        velocity: 0.4 + random() * 0.2,
      });
    }
  }

  return events;
}

// ========== ARPEGGIATOR PATTERNS ==========
// Much sparser - leave rhythmic space
const ARP_PATTERNS: Record<string, number[]> = {
  up: [0, 2, 4, 7],
  down: [7, 4, 2, 0],
  updown: [0, 2, 4, 7, 4, 2],
  random: [],
  order: [0, 2, 4, 7, 9, 7, 4, 2],
  chord: [0, 4, 7, 4],
};

export function generateArpPattern(
  bars: number,
  root: string,
  scale: Scale,
  params: MelodyParams,
  arpParams: ArpParams,
  seed: number
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];

  const baseOctave = Math.max(4, params.octave);
  const allNotes: string[] = [];

  for (let oct = 0; oct < arpParams.octaves; oct++) {
    allNotes.push(...getScaleNotes(root, scale, baseOctave + oct));
  }

  // Select pattern
  let pattern: number[];
  const patternType = arpParams.pattern;

  if (patternType === 'random') {
    pattern = Array.from({ length: 4 }, () => Math.floor(random() * 5));
  } else {
    pattern = ARP_PATTERNS[patternType] || ARP_PATTERNS.up;
  }

  // MUCH fewer notes - 4-8 per bar max, not 16
  const notesPerBar = Math.max(4, Math.min(8, Math.floor(4 + (arpParams.speed / 100) * 4)));

  // Leave gaps - don't play every bar
  const playEveryNBars = arpParams.speed > 60 ? 1 : 2;

  for (let bar = 0; bar < bars; bar++) {
    // Skip some bars for breathing room
    if (bar % playEveryNBars !== 0 && random() > 0.4) continue;

    for (let i = 0; i < notesPerBar; i++) {
      const noteIdx = pattern[i % pattern.length] % allNotes.length;

      // Position with more space
      const position = i * Math.floor(16 / notesPerBar);
      if (position >= 16) break;

      const beat = Math.floor(position / 4);
      const sixteenth = position % 4;

      // Gate affects duration
      const durations = ['16n', '8n', '8n.'];
      const durIdx = Math.min(2, Math.floor((arpParams.gate / 100) * 3));

      // Accent on downbeats
      const velocityBase = i % 4 === 0 ? 0.45 : 0.3;

      events.push({
        note: allNotes[noteIdx],
        time: `${bar}:${beat}:${sixteenth}`,
        duration: durations[durIdx],
        velocity: velocityBase + random() * 0.15,
      });
    }
  }

  return events;
}

// ========== PLUCK PATTERNS ==========
// Sparse accents, not continuous
export function generatePluckPattern(
  bars: number,
  root: string,
  scale: Scale,
  params: PluckParams,
  intensity: number,
  seed: number
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];
  const scaleNotes = getScaleNotes(root, scale, params.octave);
  const upperNotes = getScaleNotes(root, scale, params.octave + 1);
  const allNotes = [...scaleNotes, ...upperNotes.slice(0, 3)];

  // Pluck on specific positions - accent moments
  const pluckPositions = [
    [0, 12],        // On beat 1 and 4
    [0, 8],         // Minimal
    [4, 12],        // Offbeat accents
    [0],            // Very minimal
  ];

  const posPattern = pluckPositions[Math.floor(random() * pluckPositions.length)];

  for (let bar = 0; bar < bars; bar++) {
    // Only play every 2-4 bars
    if (bar % 2 !== 0 && random() > 0.3) continue;

    for (const pos of posPattern) {
      if (random() * 100 > intensity) continue;

      const noteIdx = Math.floor(random() * 5) % allNotes.length;
      const beat = Math.floor(pos / 4);
      const sixteenth = pos % 4;

      events.push({
        note: allNotes[noteIdx],
        time: `${bar}:${beat}:${sixteenth}`,
        duration: '4n',
        velocity: 0.35 + random() * 0.2,
      });
    }
  }

  return events;
}

// ========== STAB PATTERNS ==========
// Occasional chord stabs - tension moments
export function generateStabPattern(
  bars: number,
  root: string,
  scale: Scale,
  params: StabParams,
  intensity: number,
  seed: number
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];
  const scaleNotes = getScaleNotes(root, scale, 3);

  // Stabs only every 4-8 bars, not every bar
  const stabEveryNBars = intensity > 70 ? 4 : 8;

  for (let bar = 0; bar < bars; bar++) {
    // Only stab occasionally
    if (bar % stabEveryNBars !== 0) continue;
    if (random() * 100 > intensity) continue;

    // Pick position - usually beat 1 or an offbeat
    const positions = random() > 0.5 ? [0] : [4];

    for (const pos of positions) {
      const beat = Math.floor(pos / 4);
      const sixteenth = pos % 4;

      // Play a chord (root + 3rd + 5th)
      const chordNotes = [0, 2, 4].map(i => scaleNotes[i % scaleNotes.length]);

      chordNotes.forEach(note => {
        events.push({
          note,
          time: `${bar}:${beat}:${sixteenth}`,
          duration: '8n',
          velocity: 0.4 + random() * 0.15,
        });
      });
    }
  }

  return events;
}

// ========== PIANO PATTERNS ==========
// Sparse, emotional chords - breakdown material
export function generatePianoPattern(
  bars: number,
  root: string,
  scale: Scale,
  params: PianoParams,
  seed: number
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];

  const octave = params.octave;
  const scaleNotes = getScaleNotes(root, scale, octave);
  const upperNotes = getScaleNotes(root, scale, octave + 1);

  // Simple chord progressions - one chord per 2-4 bars
  const chordProgressions = [
    [[0, 2, 4], [3, 5, 0], [4, 6, 1], [0, 2, 4]],
    [[0, 2, 4], [5, 0, 2], [3, 5, 0], [0, 2, 4]],
  ];

  const progression = chordProgressions[Math.floor(random() * chordProgressions.length)];
  const barsPerChord = Math.max(2, Math.floor(bars / progression.length));

  for (let i = 0; i < progression.length && i * barsPerChord < bars; i++) {
    const chord = progression[i];
    const barStart = i * barsPerChord;

    // Just hit the chord once per section
    chord.forEach((noteIdx, voiceIdx) => {
      const notes = voiceIdx < 2 ? scaleNotes : upperNotes;
      const note = notes[noteIdx % notes.length];

      events.push({
        note,
        time: `${barStart}:0:0`,
        duration: '1m',
        velocity: (params.velocity / 100) * (0.4 + random() * 0.15),
      });
    });
  }

  return events;
}

// ========== STRINGS PATTERNS ==========
// Long sustained pads - background texture
export function generateStringsPattern(
  bars: number,
  root: string,
  scale: Scale,
  params: StringsParams,
  seed: number
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];

  const scaleNotes = getScaleNotes(root, scale, 3);
  const upperNotes = getScaleNotes(root, scale, 4);

  // Very long, sustained chords
  const chord = [0, 2, 4]; // Simple triad
  const barsPerChord = Math.max(4, Math.floor(bars / 2));

  for (let i = 0; i * barsPerChord < bars; i++) {
    const barStart = i * barsPerChord;

    chord.forEach((noteIdx, voiceIdx) => {
      const notes = voiceIdx < 2 ? scaleNotes : upperNotes;
      const note = notes[noteIdx % notes.length];

      events.push({
        note,
        time: `${barStart}:0:0`,
        duration: `${Math.min(barsPerChord, bars - barStart)}m`,
        velocity: 0.25 + random() * 0.1,
      });
    });
  }

  return events;
}

// ========== PAD PATTERNS ==========
// Atmospheric bed - evolves slowly
export function generatePadPattern(
  bars: number,
  root: string,
  scale: Scale,
  params: PadParams,
  seed: number
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];

  const scaleNotes = getScaleNotes(root, scale, 2);
  const upperNotes = getScaleNotes(root, scale, 3);

  // Chord voicings based on chord type
  const chordVoicings: Record<typeof params.chord, number[]> = {
    minor: [0, 2, 4],
    major: [0, 2, 4],
    sus4: [0, 3, 4],
    sus2: [0, 1, 4],
    dim: [0, 2, 3],
    aug: [0, 2, 5],
    add9: [0, 2, 4, 8],
    minor7: [0, 2, 4, 6],
    major7: [0, 2, 4, 6],
  };

  const voicing = chordVoicings[params.chord] || chordVoicings.minor;
  const barsPerChord = Math.max(4, Math.floor(bars / 2));

  for (let i = 0; i * barsPerChord < bars; i++) {
    const barStart = i * barsPerChord;

    voicing.forEach((noteIdx, voiceIdx) => {
      const notes = voiceIdx < voicing.length / 2 ? scaleNotes : upperNotes;
      const note = notes[noteIdx % notes.length];

      events.push({
        note,
        time: `${barStart}:0:0`,
        duration: `${Math.min(barsPerChord, bars - barStart)}m`,
        velocity: 0.25 + random() * 0.1,
      });
    });
  }

  return events;
}

// ========== HIHAT PATTERNS ==========
// Clean, groovy hi-hats - complement the kick
const HIHAT_PATTERNS = {
  straight: { closed: [2, 6, 10, 14], open: [] },         // Classic offbeat
  offbeat: { closed: [2, 6, 10, 14], open: [14] },        // With open hat accent
  shuffle: { closed: [2, 5, 10, 13], open: [6, 14] },     // Shuffled feel
  complex: { closed: [2, 4, 6, 10, 12, 14], open: [6] },  // Busier
  minimal: { closed: [6, 14], open: [] },                 // Very minimal
  rolling: { closed: [2, 4, 6, 8, 10, 12, 14], open: [8] }, // Driving
};

export function generateHihatPattern(
  bars: number,
  params: HiHatParams,
  intensity: number,
  style: TechnoStyle,
  seed: number
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];

  // Select pattern based on style
  let patternName = params.pattern;
  if (style === 'minimal' || style === 'hypnotic') patternName = 'minimal';
  if (style === 'industrial') patternName = 'rolling';

  const pattern = HIHAT_PATTERNS[patternName] || HIHAT_PATTERNS.straight;

  for (let bar = 0; bar < bars; bar++) {
    // Closed hats
    for (const pos of pattern.closed) {
      if (random() * 100 > intensity * 1.3) continue;

      const beat = Math.floor(pos / 4);
      const sixteenth = pos % 4;

      events.push({
        note: 'C5',
        time: `${bar}:${beat}:${sixteenth}`,
        duration: '32n',
        velocity: (0.35 + random() * 0.15) * (params.velocity / 100),
      });
    }

    // Open hats - sparser
    if (params.openRatio > 0) {
      for (const pos of pattern.open) {
        if (random() * 100 > params.openRatio * 0.5) continue;

        const beat = Math.floor(pos / 4);
        const sixteenth = pos % 4;

        events.push({
          note: 'open',
          time: `${bar}:${beat}:${sixteenth}`,
          duration: '8n',
          velocity: 0.3 + random() * 0.1,
        });
      }
    }
  }

  return events;
}

// ========== PERCUSSION PATTERNS ==========
// Claps and snares on 2 and 4 - the backbeat
export function generatePercPattern(
  bars: number,
  params: PercParams,
  intensity: number,
  style: TechnoStyle,
  seed: number
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];

  // Standard backbeat on 2 and 4 (positions 4 and 12)
  const clapPositions = {
    sparse: [4],             // Just beat 2
    regular: [4, 12],        // Beats 2 and 4
    busy: [4, 12, 14],       // With pickup
    fill: [4, 6, 12, 14],    // Fuller groove
  };

  const positions = clapPositions[params.pattern] || clapPositions.regular;

  for (let bar = 0; bar < bars; bar++) {
    if (params.type === 'clap' || params.type === 'snare') {
      for (const pos of positions) {
        if (random() * 100 > intensity * 1.1) continue;

        const beat = Math.floor(pos / 4);
        const sixteenth = pos % 4;

        events.push({
          note: 'clap',
          time: `${bar}:${beat}:${sixteenth}`,
          duration: '16n',
          velocity: 0.5 + random() * 0.15,
        });
      }
    }

    // Rim - very sparse accent
    if (params.type === 'rim' && bar % 4 === 3 && random() > 0.5) {
      events.push({
        note: 'rim',
        time: `${bar}:3:2`,
        duration: '32n',
        velocity: 0.35,
      });
    }

    // Shaker - subtle texture
    if (params.type === 'shaker') {
      for (const pos of [2, 6, 10, 14]) {
        if (random() > 0.6) continue;

        const beat = Math.floor(pos / 4);
        const sixteenth = pos % 4;

        events.push({
          note: 'shaker',
          time: `${bar}:${beat}:${sixteenth}`,
          duration: '32n',
          velocity: 0.2 + random() * 0.1,
        });
      }
    }
  }

  return events;
}

// ========== VOCAL PATTERNS ==========
// Ethereal "ooh/aah" style vocal patterns - emotional and present in the mix
export function generateVocalPattern(
  bars: number,
  root: string,
  scale: Scale,
  params: VocalParams,
  style: TechnoStyle,
  seed: number
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];

  // Vocals use higher octaves for that ethereal feel
  const octave = params.gender === 'male' ? 2 : params.gender === 'female' ? 4 : 3;
  const scaleNotes = getScaleNotes(root, scale, octave);
  const upperNotes = getScaleNotes(root, scale, octave + 1);

  // Play vocals more frequently - every 2-4 bars for melodic techno
  const playEveryNBars = style === 'melodic' || style === 'progressive' ? 2 : 4;

  // Simple chord progressions for vocal pads
  const vocalChords = [
    [0, 2, 4],     // Simple triad
    [0, 4, 7],     // Root, 5th, octave feel
    [2, 4, 7],     // 2nd inversion
    [0, 2],        // Simple 2-note harmony
  ];

  for (let bar = 0; bar < bars; bar++) {
    // Play on regular intervals
    if (bar % playEveryNBars !== 0) continue;

    const chord = vocalChords[Math.floor(random() * vocalChords.length)];
    const notes = params.gender === 'both'
      ? chord.map(i => [scaleNotes[i % scaleNotes.length], upperNotes[i % upperNotes.length]]).flat()
      : chord.map(i => scaleNotes[i % scaleNotes.length]);

    // Long, sustained notes - 2-4 bars duration
    const duration = random() > 0.5 ? '2m' : '1m';

    notes.forEach((note, i) => {
      events.push({
        note,
        time: `${bar}:0:0`,
        duration,
        velocity: 0.45 + random() * 0.15 - (i * 0.02), // Higher base velocity
      });
    });
  }

  return events;
}

// ========== CHORD PROGRESSION-AWARE GENERATORS ==========

// Bass pattern that follows chord progression
function generateBassPatternWithProgression(
  bars: number,
  root: string,
  scale: Scale,
  params: BassParams,
  intensity: number,
  style: TechnoStyle,
  progression: number[],
  seed: number
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];
  const octave = 1 + params.octave;
  const scaleNotes = getScaleNotes(root, scale, octave);

  // Each chord lasts 4 bars (melodic techno standard)
  const barsPerChord = 4;

  for (let bar = 0; bar < bars; bar++) {
    // Get root note for current chord in progression
    const bassRoot = getCurrentRoot(bar, barsPerChord, progression, scaleNotes);

    // Bass positions - play on offbeats
    const positions = [2, 10];

    for (const pos of positions) {
      if (random() * 100 > intensity * 1.2) continue;

      const beat = Math.floor(pos / 4);
      const sixteenth = pos % 4;

      events.push({
        note: bassRoot,
        time: `${bar}:${beat}:${sixteenth}`,
        duration: '8n',
        velocity: 0.7 + random() * 0.15,
      });
    }
  }

  return events;
}

// Melody pattern that follows chord progression
function generateMelodyPatternWithProgression(
  bars: number,
  params: MelodyParams,
  style: TechnoStyle,
  progression: number[],
  seed: number
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];

  const baseOctave = params.octave;
  const scaleNotes = getScaleNotes(params.rootNote, params.scale, baseOctave);
  const upperNotes = getScaleNotes(params.rootNote, params.scale, baseOctave + 1);

  const barsPerChord = 4;
  const playEveryNBars = params.density > 70 ? 1 : params.density > 40 ? 2 : 4;

  for (let bar = 0; bar < bars; bar++) {
    if (bar % playEveryNBars !== 0 && random() > 0.3) continue;

    // Get chord tones for current position
    const chordTones = getCurrentChord(bar, barsPerChord, progression, scaleNotes);
    const upperChordTones = getCurrentChord(bar, barsPerChord, progression, upperNotes);
    const availableNotes = [...chordTones, ...upperChordTones.slice(0, 2)];

    // Play 2-3 notes per bar
    const numNotes = 2 + Math.floor(random() * 2);

    for (let i = 0; i < numNotes; i++) {
      const noteIdx = Math.floor(random() * availableNotes.length);
      const positions = [0, 6, 12];
      const pos = positions[i % positions.length];

      events.push({
        note: availableNotes[noteIdx],
        time: `${bar}:${Math.floor(pos / 4)}:${pos % 4}`,
        duration: '4n',
        velocity: 0.4 + random() * 0.2,
      });
    }
  }

  return events;
}

// Pad pattern with chord progression
function generatePadPatternWithProgression(
  bars: number,
  root: string,
  scale: Scale,
  params: PadParams,
  progression: number[],
  seed: number
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];

  const scaleNotes = getScaleNotes(root, scale, 2);
  const upperNotes = getScaleNotes(root, scale, 3);

  // Each chord change every 4 bars
  const barsPerChord = 4;

  for (let bar = 0; bar < bars; bar += barsPerChord) {
    const chordTones = getCurrentChord(bar, barsPerChord, progression, scaleNotes);
    const upperTones = getCurrentChord(bar, barsPerChord, progression, upperNotes);

    // Play full chord
    [...chordTones, upperTones[0]].forEach((note, i) => {
      events.push({
        note,
        time: `${bar}:0:0`,
        duration: `${Math.min(barsPerChord, bars - bar)}m`,
        velocity: 0.25 + random() * 0.1 - (i * 0.02),
      });
    });
  }

  return events;
}

// Piano pattern with chord progression - SUBTLE, only in breakdowns
function generatePianoPatternWithProgression(
  bars: number,
  root: string,
  scale: Scale,
  params: PianoParams,
  progression: number[],
  seed: number
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];

  const octave = params.octave;
  const scaleNotes = getScaleNotes(root, scale, octave);
  const upperNotes = getScaleNotes(root, scale, octave + 1);

  // Piano should be VERY sparse - one chord every 8 bars, not 4
  const barsPerChord = 8;

  for (let bar = 0; bar < bars; bar += barsPerChord) {
    // Only play 60% of the time for more space
    if (random() > 0.6) continue;

    const chordTones = getCurrentChord(bar, barsPerChord, progression, scaleNotes);

    // Play just 2-3 notes, not full chord - more delicate
    const notesToPlay = random() > 0.5 ? chordTones.slice(0, 2) : chordTones;

    notesToPlay.forEach((note, i) => {
      events.push({
        note,
        time: `${bar}:0:0`,
        duration: '2m', // Long sustained notes
        velocity: (params.velocity / 100) * (0.2 + random() * 0.1), // Much lower velocity
      });
    });
  }

  return events;
}

// Strings pattern with chord progression
function generateStringsPatternWithProgression(
  bars: number,
  root: string,
  scale: Scale,
  params: StringsParams,
  progression: number[],
  seed: number
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];

  const scaleNotes = getScaleNotes(root, scale, 3);
  const upperNotes = getScaleNotes(root, scale, 4);

  const barsPerChord = 4;

  for (let bar = 0; bar < bars; bar += barsPerChord) {
    const chordTones = getCurrentChord(bar, barsPerChord, progression, scaleNotes);
    const upperTones = getCurrentChord(bar, barsPerChord, progression, upperNotes);

    // Strings play full sustained chords
    [...chordTones, upperTones[0]].forEach((note, i) => {
      events.push({
        note,
        time: `${bar}:0:0`,
        duration: `${Math.min(barsPerChord, bars - bar)}m`,
        velocity: 0.25 + random() * 0.1,
      });
    });
  }

  return events;
}

// Vocal pattern with chord progression - ROBUST VERSION
// CRITICAL: Vocals MUST generate events when hasVocal=true
function generateVocalPatternWithProgression(
  bars: number,
  root: string,
  scale: Scale,
  params: VocalParams,
  style: TechnoStyle,
  progression: number[],
  seed: number
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];

  // Determine octave based on gender for proper formant range
  const octave = params.gender === 'male' ? 2 : params.gender === 'female' ? 4 : 3;
  const scaleNotes = getScaleNotes(root, scale, octave);
  const upperNotes = getScaleNotes(root, scale, octave + 1);

  const barsPerChord = 4;
  // Play more frequently for better audibility
  const playEveryNBars = style === 'melodic' || style === 'progressive' ? 2 : 4;

  console.log(`[generators] generateVocalPattern: bars=${bars}, root=${root}, scale=${scale}, gender=${params.gender}, type=${params.type}`);

  for (let bar = 0; bar < bars; bar++) {
    if (bar % playEveryNBars !== 0) continue;

    // Get chord tones for ethereal vocal harmonies
    const chordTones = getCurrentChord(bar, barsPerChord, progression, scaleNotes);
    const upperTones = getCurrentChord(bar, barsPerChord, progression, upperNotes);

    const notes = params.gender === 'both'
      ? [...chordTones, upperTones[0]]
      : chordTones;

    // Long sustained notes for that ethereal Afterlife feel
    const duration = random() > 0.5 ? '2m' : '1m';

    notes.forEach((note, i) => {
      events.push({
        note,
        time: `${bar}:0:0`,
        duration,
        velocity: 0.55 + random() * 0.15 - (i * 0.02), // INCREASED base velocity
      });
    });
  }

  // FALLBACK: If no events generated but we should have vocals, create at least one
  if (events.length === 0 && bars >= 4) {
    console.warn('[generators] generateVocalPattern: FALLBACK - no events generated, creating fallback');
    const fallbackNote = scaleNotes[0]; // Root note
    events.push({
      note: fallbackNote,
      time: '0:0:0',
      duration: '2m',
      velocity: 0.55,
    });
    // Add harmony
    if (scaleNotes.length > 2) {
      events.push({
        note: scaleNotes[2], // Third
        time: '0:0:0',
        duration: '2m',
        velocity: 0.50,
      });
    }
  }

  console.log(`[generators] generateVocalPattern: generated ${events.length} vocal events`);
  return events;
}

// Generate fallback vocal pattern - ensures vocals are ALWAYS present when requested
function generateVocalFallback(
  bars: number,
  root: string,
  scale: Scale,
  params: VocalParams,
  seed: number
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];

  const octave = params.gender === 'male' ? 2 : params.gender === 'female' ? 4 : 3;
  const scaleNotes = getScaleNotes(root, scale, octave);

  console.log(`[generators] generateVocalFallback: Creating guaranteed vocal events for ${bars} bars`);

  // One long sustained chord every 4 bars
  for (let bar = 0; bar < bars; bar += 4) {
    const chord = [0, 2, 4]; // Simple triad
    chord.forEach((idx, i) => {
      events.push({
        note: scaleNotes[idx % scaleNotes.length],
        time: `${bar}:0:0`,
        duration: '2m',
        velocity: 0.55 - (i * 0.05),
      });
    });
  }

  return events;
}

// ========== HELPER FUNCTIONS ==========

function parseTime(time: string): number {
  const [bar, beat, sixteenth] = time.split(':').map(Number);
  return bar * 16 + beat * 4 + sixteenth;
}

// ========== MAIN GENERATOR ==========

export interface AllPatterns {
  kick: NoteEvent[];
  bass: NoteEvent[];
  acid: NoteEvent[];
  melody: NoteEvent[];
  arp: NoteEvent[];
  pluck: NoteEvent[];
  stab: NoteEvent[];
  piano: NoteEvent[];
  strings: NoteEvent[];
  pad: NoteEvent[];
  hihat: NoteEvent[];
  openhat: NoteEvent[];
  perc: NoteEvent[];
  vocal: NoteEvent[];
}

export function generateSectionPatterns(
  section: SectionConfig,
  root: string,
  scale: Scale,
  secondaryScale: Scale,
  chordProgression: ChordProgression,
  style: TechnoStyle,
  groove: GrooveType,
  kickParams: KickParams,
  bassParams: BassParams,
  melodyParams: MelodyParams,
  hihatParams: HiHatParams,
  padParams: PadParams,
  pluckParams: PluckParams,
  stabParams: StabParams,
  pianoParams: PianoParams,
  stringsParams: StringsParams,
  acidParams: AcidParams,
  percParams: PercParams,
  arpParams: ArpParams,
  vocalParams: VocalParams,
  seed: number
): AllPatterns {
  const melodyWithRoot = { ...melodyParams, rootNote: root, scale };
  const random = seededRandom(seed);

  // Parse chord progression for harmonic content
  const progression = parseChordProgression(chordProgression);

  // Use secondary scale for breakdowns/outros for variety
  const useSecondaryScale = section.type === 'breakdown' || section.type === 'outro';
  const activeScale = useSecondaryScale ? secondaryScale : scale;

  // Get goosebumps config for micro-timing
  const microTimingMs = getMicroTimingMs();
  const goosebumpsEnabled = isGoosebumpsEnabled();

  // Generate base patterns
  let kick = section.hasKick
    ? generateKickPattern(section.bars, section.intensity, style, groove, seed)
    : [];
  let bass = section.hasBass
    ? generateBassPatternWithProgression(section.bars, root, activeScale, bassParams, section.intensity, style, progression, seed + 1000)
    : [];
  let acid = section.hasAcid
    ? generateAcidPattern(section.bars, root, activeScale, acidParams, section.intensity, seed + 1500)
    : [];
  let melody = section.hasMelody
    ? generateMelodyPatternWithProgression(section.bars, { ...melodyWithRoot, scale: activeScale }, style, progression, seed + 2000)
    : [];
  let arp = section.hasArp
    ? generateArpPattern(section.bars, root, activeScale, { ...melodyWithRoot, scale: activeScale }, arpParams, seed + 3000)
    : [];
  let pluck = section.hasPluck
    ? generatePluckPattern(section.bars, root, activeScale, pluckParams, section.intensity, seed + 3500)
    : [];
  let stab = section.hasStab
    ? generateStabPattern(section.bars, root, activeScale, stabParams, section.intensity, seed + 4000)
    : [];
  // AFTERLIFE DARK CORE: Piano is PROHIBITED as protagonist
  // Only allowed in breakdowns, and even then very sparse and filtered
  const isAfterlifeStyle = style === 'dark' || style === 'hypnotic' || style === 'minimal';
  const isPianoAllowedInSection = section.type === 'breakdown' && section.hasPiano;
  const shouldGeneratePiano = isAfterlifeStyle
    ? isPianoAllowedInSection  // Only in breakdowns for dark styles
    : section.hasPiano;        // Normal behavior for other styles

  let piano = shouldGeneratePiano
    ? generatePianoPatternWithProgression(section.bars, root, activeScale, pianoParams, progression, seed + 4500)
    : [];

  // AFTERLIFE: Even in breakdown, reduce piano events further
  if (isAfterlifeStyle && piano.length > 0) {
    console.log(`[generators] AFTERLIFE: Reducing piano events from ${piano.length} for ${section.type}`);
    // Keep only 30% of piano events - very sparse
    piano = piano.filter(() => random() < 0.3);
    // Lower velocity for remaining events
    piano = piano.map(e => ({ ...e, velocity: Math.min(e.velocity * 0.5, 0.25) }));
    console.log(`[generators] AFTERLIFE: Piano reduced to ${piano.length} events`);
  }
  let strings = section.hasStrings
    ? generateStringsPatternWithProgression(section.bars, root, activeScale, stringsParams, progression, seed + 5000)
    : [];
  let pad = section.hasPad
    ? generatePadPatternWithProgression(section.bars, root, activeScale, padParams, progression, seed + 5500)
    : [];
  let hihat = section.hasHihat
    ? generateHihatPattern(section.bars, hihatParams, section.intensity, style, seed + 6000)
    : [];
  let openhat = section.hasHihat && hihatParams.openRatio > 30
    ? generateHihatPattern(section.bars, { ...hihatParams, pattern: 'offbeat' }, section.intensity, style, seed + 6500)
        .filter(e => e.note === 'open')
    : [];
  let perc = section.hasPerc
    ? generatePercPattern(section.bars, percParams, section.intensity, style, seed + 7000)
    : [];

  // VOCALS: Generate with fallback to ensure they're present
  let vocal: NoteEvent[] = [];
  if (section.hasVocal) {
    vocal = generateVocalPatternWithProgression(section.bars, root, activeScale, vocalParams, style, progression, seed + 8000);
    // If still empty after generation, use fallback
    if (vocal.length === 0) {
      vocal = generateVocalFallback(section.bars, root, activeScale, vocalParams, seed + 8500);
    }
    console.log(`[generators] Section ${section.type}: Generated ${vocal.length} vocal events`);
  }

  // AFTERLIFE DARK CORE: Bass must be ABSOLUTE PROTAGONIST
  // Boost bass velocity, reduce all keys/lead instruments
  if (isAfterlifeStyle) {
    console.log('[generators] AFTERLIFE DARK CORE: Ensuring bass dominance');

    // BOOST BASS: +15% velocity, ensure minimum velocity
    bass = bass.map(e => ({
      ...e,
      velocity: Math.min(1.0, Math.max(0.75, e.velocity * 1.15))
    }));

    // REDUCE MELODY: -30% velocity for dark, filtered sound
    melody = melody.map(e => ({
      ...e,
      velocity: Math.min(0.4, e.velocity * 0.7)
    }));

    // REDUCE ARPs: -25% velocity
    arp = arp.map(e => ({
      ...e,
      velocity: Math.min(0.35, e.velocity * 0.75)
    }));

    // REDUCE PLUCKS: -35% velocity
    pluck = pluck.map(e => ({
      ...e,
      velocity: Math.min(0.3, e.velocity * 0.65)
    }));

    // REDUCE STABS: -30% velocity
    stab = stab.map(e => ({
      ...e,
      velocity: Math.min(0.35, e.velocity * 0.7)
    }));
  }

  // GOOSEBUMPS: Apply micro-timing humanization to select instruments
  if (goosebumpsEnabled && microTimingMs > 0) {
    console.log(`[generators] Applying Goosebumps micro-timing: ${microTimingMs}ms`);

    // Humanize hihats and perc - never kick (keeps pocket tight)
    hihat = humanizePatternTiming(hihat, microTimingMs, random);
    openhat = humanizePatternTiming(openhat, microTimingMs, random);
    perc = humanizePatternTiming(perc, microTimingMs * 0.8, random);

    // Subtle humanization on bass offbeats
    bass = humanizePatternTiming(bass, microTimingMs * 0.5, random);
  }

  // DEBUG: Log event counts for visibility
  const eventCounts = {
    kick: kick.length,
    bass: bass.length,
    melody: melody.length,
    hihat: hihat.length,
    pad: pad.length,
    vocal: vocal.length,
    arp: arp.length,
    perc: perc.length,
  };
  console.log(`[generators] Section "${section.type}" (${section.bars} bars) event counts:`, eventCounts);

  return {
    kick,
    bass,
    acid,
    melody,
    arp,
    pluck,
    stab,
    piano,
    strings,
    pad,
    hihat,
    openhat,
    perc,
    vocal,
  };
}

export function calculateTotalBars(sections: SectionConfig[]): number {
  return sections.reduce((total, section) => total + section.bars, 0);
}

export function getSectionStartBar(sections: SectionConfig[], sectionIndex: number): number {
  return sections.slice(0, sectionIndex).reduce((total, section) => total + section.bars, 0);
}
