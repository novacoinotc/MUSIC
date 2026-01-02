'use client';

import type {
  NoteEvent, KickParams, BassParams, MelodyParams, HiHatParams, PadParams,
  PluckParams, StabParams, PianoParams, StringsParams, AcidParams, PercParams,
  ArpParams, Scale, SectionConfig, TechnoStyle, GrooveType
} from '@/types';

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

// Seeded random for reproducibility
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
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
// Many different kick patterns for variety
const KICK_PATTERNS = {
  fourOnFloor: [0, 4, 8, 12],
  minimal: [0, 8],
  broken: [0, 3, 8, 11],
  offbeat: [2, 6, 10, 14],
  halftime: [0, 8],
  syncopated: [0, 3, 6, 10, 14],
  techno: [0, 4, 8, 12, 14],
  industrial: [0, 2, 4, 6, 8, 10, 12, 14],
  bounce: [0, 4, 7, 8, 12],
  shuffle: [0, 3, 8, 11],
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

  // Select pattern based on style
  const patternKeys = Object.keys(KICK_PATTERNS) as (keyof typeof KICK_PATTERNS)[];
  let patternName: keyof typeof KICK_PATTERNS;

  switch (style) {
    case 'minimal':
      patternName = random() > 0.5 ? 'minimal' : 'halftime';
      break;
    case 'industrial':
      patternName = random() > 0.5 ? 'industrial' : 'syncopated';
      break;
    case 'dark':
    case 'berlin':
      patternName = random() > 0.5 ? 'techno' : 'broken';
      break;
    case 'progressive':
    case 'melodic':
      patternName = random() > 0.5 ? 'fourOnFloor' : 'bounce';
      break;
    default:
      patternName = patternKeys[Math.floor(random() * patternKeys.length)];
  }

  const pattern = KICK_PATTERNS[patternName];

  for (let bar = 0; bar < bars; bar++) {
    // Vary patterns between bars
    const useVariation = random() > 0.7 && bar > 0;
    const currentPattern = useVariation
      ? KICK_PATTERNS[patternKeys[Math.floor(random() * patternKeys.length)]]
      : pattern;

    for (const pos of currentPattern) {
      if (random() * 100 > intensity) continue;

      const beat = Math.floor(pos / 4);
      const sixteenth = pos % 4;

      events.push({
        note: 'C1',
        time: `${bar}:${beat}:${sixteenth}`,
        duration: '8n',
        velocity: pos === 0 ? 0.9 : 0.7 + random() * 0.2,
      });
    }
  }

  return events;
}

// ========== BASS PATTERNS ==========
const BASS_PATTERNS = [
  // Root focused
  { notes: [0, 0, 0, 0], durations: ['4n', '4n', '4n', '4n'] },
  // Walking bass
  { notes: [0, 2, 3, 4, 3, 2, 0, 0], durations: ['8n', '8n', '8n', '8n', '8n', '8n', '8n', '8n'] },
  // Syncopated
  { notes: [0, -1, 3, 0, 4, -1, 0], durations: ['8n.', '16n', '8n', '8n', '8n', '16n', '8n'] },
  // Minimal
  { notes: [0, 0], durations: ['2n', '2n'] },
  // Groovy
  { notes: [0, 0, 4, 0, 3, 0, 0, 2], durations: ['8n', '8n', '8n', '8n', '8n', '8n', '8n', '8n'] },
  // Driving
  { notes: [0, 0, 0, 0, 0, 0, 0, 0], durations: ['16n', '16n', '16n', '16n', '16n', '16n', '16n', '16n'] },
  // Melodic
  { notes: [0, 2, 4, 2, 0, -1, 0, 2], durations: ['8n', '8n', '8n', '8n', '8n', '8n', '8n', '8n'] },
  // Acid style
  { notes: [0, 0, 7, 0, 0, 5, 0, 3], durations: ['16n', '8n', '16n', '8n', '16n', '8n', '16n', '8n'] },
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
      patternIndex = 3; // Minimal pattern
      break;
    case 'acid':
      patternIndex = 7; // Acid pattern
      break;
    case 'industrial':
      patternIndex = 5; // Driving pattern
      break;
    default:
      patternIndex = Math.floor(random() * BASS_PATTERNS.length);
  }

  for (let bar = 0; bar < bars; bar++) {
    // Occasionally switch patterns
    if (bar > 0 && random() > 0.75) {
      patternIndex = Math.floor(random() * BASS_PATTERNS.length);
    }

    const pattern = BASS_PATTERNS[patternIndex];
    let currentPos = 0;

    for (let i = 0; i < pattern.notes.length; i++) {
      if (random() * 100 > intensity && currentPos > 0) {
        currentPos += durationToSixteenths(pattern.durations[i]);
        continue;
      }

      let noteIdx = pattern.notes[i];
      // Handle negative indices (go down)
      while (noteIdx < 0) noteIdx += scaleNotes.length;
      noteIdx = noteIdx % scaleNotes.length;

      const beat = Math.floor(currentPos / 4);
      const sixteenth = currentPos % 4;

      if (currentPos < 16) {
        events.push({
          note: scaleNotes[noteIdx],
          time: `${bar}:${beat}:${sixteenth}`,
          duration: pattern.durations[i],
          velocity: 0.6 + random() * 0.25,
        });
      }

      currentPos += durationToSixteenths(pattern.durations[i]);
    }
  }

  return events;
}

// ========== ACID BASS PATTERNS ==========
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
  const allNotes = [...scaleNotes, ...upperNotes];

  // 303-style patterns - lots of 16th notes
  const acidPatterns = [
    [0, 0, 7, 0, 5, 0, 7, 12, 0, 0, 5, 0, 7, 0, 10, 0],
    [0, 3, 0, 5, 0, 7, 0, 5, 0, 3, 0, 5, 0, 7, 12, 7],
    [0, 0, 0, 5, 0, 0, 7, 0, 0, 0, 0, 5, 0, 0, 3, 0],
    [0, 12, 0, 7, 0, 5, 0, 3, 0, 12, 0, 7, 0, 5, 7, 10],
  ];

  const patternIdx = Math.floor(random() * acidPatterns.length);

  for (let bar = 0; bar < bars; bar++) {
    const pattern = acidPatterns[(patternIdx + bar) % acidPatterns.length];

    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] === 0 && random() > 0.4) continue;
      if (random() * 100 > intensity) continue;

      const noteIdx = pattern[i] % allNotes.length;
      const beat = Math.floor(i / 4);
      const sixteenth = i % 4;

      // Accent on certain notes
      const isAccent = random() > (1 - params.accent / 100);

      events.push({
        note: allNotes[noteIdx],
        time: `${bar}:${beat}:${sixteenth}`,
        duration: random() > 0.5 ? '16n' : '8n',
        velocity: isAccent ? 0.85 : 0.55 + random() * 0.2,
      });
    }
  }

  return events;
}

// ========== MELODY PATTERNS ==========
const MELODY_PHRASES = [
  // Ascending emotional
  [0, 2, 4, 5, 7, 5, 4],
  // Descending melancholic
  [7, 5, 4, 2, 0, 2],
  // Climactic
  [0, 4, 7, 9, 7, 4, 0],
  // Question-answer
  [0, 2, 4, 2, 5, 4, 2],
  // Ethereal
  [4, 7, 9, 7, 5, 7, 4],
  // Dark
  [0, 1, 3, 1, 0, 3, 5, 3],
  // Hopeful
  [0, 4, 5, 7, 9, 7, 5, 4],
  // Mysterious
  [0, 5, 3, 7, 5, 2, 0],
  // Driving
  [0, 0, 4, 0, 7, 0, 4, 0],
  // Hypnotic
  [0, 2, 0, 4, 0, 2, 0, 5],
];

export function generateMelodyPattern(
  bars: number,
  params: MelodyParams,
  style: TechnoStyle,
  seed: number
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];

  const baseOctave = Math.max(3, params.octave - 1);
  const scaleNotes = getScaleNotes(params.rootNote, params.scale, baseOctave);
  const upperNotes = getScaleNotes(params.rootNote, params.scale, baseOctave + 1);
  const allNotes = [...scaleNotes, ...upperNotes.slice(0, 5)];

  // Pick phrases based on style
  let phrasePool: number[][];
  switch (style) {
    case 'dark':
    case 'industrial':
      phrasePool = [MELODY_PHRASES[5], MELODY_PHRASES[7]];
      break;
    case 'melodic':
    case 'progressive':
      phrasePool = [MELODY_PHRASES[0], MELODY_PHRASES[2], MELODY_PHRASES[6]];
      break;
    case 'hypnotic':
    case 'minimal':
      phrasePool = [MELODY_PHRASES[8], MELODY_PHRASES[9]];
      break;
    default:
      phrasePool = MELODY_PHRASES;
  }

  const notesPerBar = Math.max(2, Math.floor((params.density / 100) * 8));

  for (let bar = 0; bar < bars; bar++) {
    const phrase = phrasePool[Math.floor(random() * phrasePool.length)];

    for (let i = 0; i < Math.min(notesPerBar, phrase.length); i++) {
      const noteIndex = phrase[i] % allNotes.length;

      const basePos = Math.floor((i / notesPerBar) * 16);
      const variation = params.variation > 50 ? Math.floor(random() * 3) - 1 : 0;
      const position = Math.max(0, Math.min(15, basePos + variation));

      const beat = Math.floor(position / 4);
      const sixteenth = position % 4;

      // Varied durations
      const durations = ['4n', '4n.', '2n', '8n.', '4n'];
      const duration = durations[Math.floor(random() * durations.length)];

      events.push({
        note: allNotes[noteIndex],
        time: `${bar}:${beat}:${sixteenth}`,
        duration,
        velocity: 0.45 + random() * 0.3,
      });
    }
  }

  return events.sort((a, b) => parseTime(a.time) - parseTime(b.time));
}

// ========== ARPEGGIATOR PATTERNS ==========
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
    pattern = Array.from({ length: 8 }, () => Math.floor(random() * 7));
  } else {
    pattern = ARP_PATTERNS[patternType] || ARP_PATTERNS.up;
  }

  // Speed determines notes per bar
  const notesPerBar = Math.floor(4 + (arpParams.speed / 100) * 12);
  const stepSize = Math.max(1, Math.floor(16 / notesPerBar));

  for (let bar = 0; bar < bars; bar++) {
    for (let i = 0; i < notesPerBar; i++) {
      const noteIdx = pattern[i % pattern.length] % allNotes.length;
      const position = i * stepSize;

      if (position >= 16) break;

      const beat = Math.floor(position / 4);
      const sixteenth = position % 4;

      // Gate affects duration
      const durations = ['32n', '16n', '8n'];
      const durIdx = Math.min(2, Math.floor((arpParams.gate / 100) * 3));

      // Swing
      let swingOffset = 0;
      if (arpParams.swing > 0 && i % 2 === 1) {
        swingOffset = (arpParams.swing / 100) * 0.02;
      }

      const velocityBase = i % 4 === 0 ? 0.5 : 0.35;

      events.push({
        note: allNotes[noteIdx],
        time: `${bar}:${beat}:${sixteenth}`,
        duration: durations[durIdx],
        velocity: velocityBase + random() * 0.2,
      });
    }
  }

  return events;
}

// ========== PLUCK PATTERNS ==========
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

  // Pluck patterns - more sparse, melodic
  const pluckPhrases = [
    [0, 4, 7],
    [0, 2, 4, 7],
    [4, 7, 9, 7],
    [0, 0, 4, 7],
    [7, 4, 0],
  ];

  for (let bar = 0; bar < bars; bar++) {
    const phrase = pluckPhrases[Math.floor(random() * pluckPhrases.length)];
    const notesThisBar = Math.floor(2 + random() * (intensity / 30));

    for (let i = 0; i < Math.min(notesThisBar, phrase.length); i++) {
      const noteIdx = phrase[i] % allNotes.length;
      const position = Math.floor(random() * 16);
      const beat = Math.floor(position / 4);
      const sixteenth = position % 4;

      events.push({
        note: allNotes[noteIdx],
        time: `${bar}:${beat}:${sixteenth}`,
        duration: '8n',
        velocity: 0.4 + random() * 0.25,
      });
    }
  }

  return events;
}

// ========== STAB PATTERNS ==========
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

  // Stabs are punchy chord hits
  const stabPositions = [
    [0, 8], // Basic
    [0, 6, 12], // Syncopated
    [4, 12], // Offbeat
    [0, 4, 8, 12], // Regular
    [2, 10], // Offbeat minimal
  ];

  const positions = stabPositions[Math.floor(random() * stabPositions.length)];

  for (let bar = 0; bar < bars; bar++) {
    if (random() * 100 > intensity) continue;

    for (const pos of positions) {
      if (random() > 0.7) continue;

      const beat = Math.floor(pos / 4);
      const sixteenth = pos % 4;

      // Play a chord (root + 3rd + 5th)
      const chordNotes = [0, 2, 4].map(i => scaleNotes[i % scaleNotes.length]);

      chordNotes.forEach(note => {
        events.push({
          note,
          time: `${bar}:${beat}:${sixteenth}`,
          duration: '16n',
          velocity: 0.5 + random() * 0.2,
        });
      });
    }
  }

  return events;
}

// ========== PIANO PATTERNS ==========
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

  // Piano patterns - more melodic and chord-based
  const chordProgressions = [
    [[0, 2, 4], [3, 5, 0], [4, 6, 1], [0, 2, 4]],
    [[0, 2, 4], [5, 0, 2], [3, 5, 0], [0, 2, 4]],
    [[0, 4, 7], [2, 5, 9], [4, 7, 11], [0, 4, 7]],
  ];

  const progression = chordProgressions[Math.floor(random() * chordProgressions.length)];
  const barsPerChord = Math.max(1, Math.floor(bars / progression.length));

  for (let i = 0; i < progression.length && i * barsPerChord < bars; i++) {
    const chord = progression[i];
    const barStart = i * barsPerChord;

    // Add some rhythmic variation
    const positions = random() > 0.5 ? [0, 8] : [0, 4, 8, 12];

    for (const pos of positions) {
      if (random() > 0.7 && pos > 0) continue;

      const beat = Math.floor(pos / 4);
      const sixteenth = pos % 4;

      chord.forEach((noteIdx, voiceIdx) => {
        const notes = voiceIdx < 2 ? scaleNotes : upperNotes;
        const note = notes[noteIdx % notes.length];

        events.push({
          note,
          time: `${barStart}:${beat}:${sixteenth}`,
          duration: random() > 0.5 ? '4n' : '8n',
          velocity: (params.velocity / 100) * (0.5 + random() * 0.2),
        });
      });
    }
  }

  return events;
}

// ========== STRINGS PATTERNS ==========
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

  // Long, sustained chord progressions
  const progressions = [
    [[0, 2, 4], [5, 0, 2], [3, 5, 0]],
    [[0, 4, 7], [2, 5, 9], [0, 4, 7]],
    [[0, 2, 4, 6], [0, 2, 4, 6]],
  ];

  const progression = progressions[Math.floor(random() * progressions.length)];
  const barsPerChord = Math.max(2, Math.floor(bars / progression.length));

  for (let i = 0; i < progression.length && i * barsPerChord < bars; i++) {
    const chord = progression[i];
    const barStart = i * barsPerChord;

    chord.forEach((noteIdx, voiceIdx) => {
      const notes = voiceIdx < chord.length / 2 ? scaleNotes : upperNotes;
      const note = notes[noteIdx % notes.length];

      events.push({
        note,
        time: `${barStart}:0:0`,
        duration: `${barsPerChord}m`,
        velocity: 0.35 + random() * 0.15,
      });
    });
  }

  return events;
}

// ========== PAD PATTERNS ==========
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
  const chordVoicings: Record<typeof params.chord, number[][]> = {
    minor: [[0, 2, 4], [0, 2, 4, 6]],
    major: [[0, 2, 4], [0, 2, 4, 6]],
    sus4: [[0, 3, 4], [0, 3, 4, 6]],
    sus2: [[0, 1, 4], [0, 1, 4, 6]],
    dim: [[0, 2, 3], [0, 2, 3, 5]],
    aug: [[0, 2, 5], [0, 2, 5, 7]],
    add9: [[0, 1, 2, 4], [0, 2, 4, 8]],
    minor7: [[0, 2, 4, 6], [0, 2, 4, 6]],
    major7: [[0, 2, 4, 6], [0, 2, 4, 6]],
  };

  const voicings = chordVoicings[params.chord] || chordVoicings.minor;
  const voicing = voicings[Math.floor(random() * voicings.length)];

  // One chord every 2-4 bars
  const barsPerChord = Math.max(2, Math.floor(bars / 3));

  for (let i = 0; i * barsPerChord < bars; i++) {
    const barStart = i * barsPerChord;

    voicing.forEach((noteIdx, voiceIdx) => {
      const notes = voiceIdx < voicing.length / 2 ? scaleNotes : upperNotes;
      const note = notes[noteIdx % notes.length];

      events.push({
        note,
        time: `${barStart}:0:0`,
        duration: `${Math.min(barsPerChord, bars - barStart)}m`,
        velocity: 0.3 + random() * 0.15,
      });
    });
  }

  return events;
}

// ========== HIHAT PATTERNS ==========
const HIHAT_PATTERNS = {
  straight: { closed: [2, 6, 10, 14], open: [] },
  offbeat: { closed: [2, 6, 10, 14], open: [6, 14] },
  shuffle: { closed: [2, 5, 6, 10, 13, 14], open: [6, 14] },
  complex: { closed: [0, 2, 4, 6, 8, 10, 12, 14], open: [4, 12] },
  minimal: { closed: [2, 10], open: [] },
  rolling: { closed: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], open: [4, 12] },
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
  if (style === 'minimal') patternName = 'minimal';
  if (style === 'industrial') patternName = 'rolling';

  const pattern = HIHAT_PATTERNS[patternName] || HIHAT_PATTERNS.straight;

  for (let bar = 0; bar < bars; bar++) {
    // Closed hats
    for (const pos of pattern.closed) {
      if (random() * 100 > intensity * 1.2) continue;

      const beat = Math.floor(pos / 4);
      const sixteenth = pos % 4;
      const isOffbeat = pos % 4 === 2;

      events.push({
        note: 'C5',
        time: `${bar}:${beat}:${sixteenth}`,
        duration: '32n',
        velocity: (isOffbeat ? 0.55 : 0.4 + random() * 0.15) * (params.velocity / 100),
      });
    }

    // Open hats
    if (params.openRatio > 0) {
      for (const pos of pattern.open) {
        if (random() * 100 > params.openRatio) continue;

        const beat = Math.floor(pos / 4);
        const sixteenth = pos % 4;

        events.push({
          note: 'open',
          time: `${bar}:${beat}:${sixteenth}`,
          duration: '8n',
          velocity: 0.35 + random() * 0.15,
        });
      }
    }
  }

  return events;
}

// ========== PERCUSSION PATTERNS ==========
export function generatePercPattern(
  bars: number,
  params: PercParams,
  intensity: number,
  style: TechnoStyle,
  seed: number
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];

  // Clap patterns
  const clapPositions = {
    sparse: [4, 12],
    regular: [4, 12],
    busy: [4, 8, 12],
    fill: [4, 6, 10, 12, 14],
  };

  const positions = clapPositions[params.pattern];

  for (let bar = 0; bar < bars; bar++) {
    // Claps
    if (params.type === 'clap' || params.type === 'snare') {
      for (const pos of positions) {
        if (random() * 100 > intensity) continue;

        const beat = Math.floor(pos / 4);
        const sixteenth = pos % 4;

        events.push({
          note: 'clap',
          time: `${bar}:${beat}:${sixteenth}`,
          duration: '16n',
          velocity: 0.5 + random() * 0.2,
        });
      }
    }

    // Rim shots
    if (params.type === 'rim' && random() > 0.3) {
      const rimPositions = [6, 14];
      for (const pos of rimPositions) {
        if (random() > 0.6) continue;

        const beat = Math.floor(pos / 4);
        const sixteenth = pos % 4;

        events.push({
          note: 'rim',
          time: `${bar}:${beat}:${sixteenth}`,
          duration: '32n',
          velocity: 0.4 + random() * 0.2,
        });
      }
    }

    // Shaker
    if (params.type === 'shaker') {
      for (let i = 0; i < 16; i += 2) {
        if (random() > 0.7) continue;

        const beat = Math.floor(i / 4);
        const sixteenth = i % 4;

        events.push({
          note: 'shaker',
          time: `${bar}:${beat}:${sixteenth}`,
          duration: '32n',
          velocity: 0.25 + random() * 0.15,
        });
      }
    }
  }

  return events;
}

// ========== HELPER FUNCTIONS ==========

function durationToSixteenths(duration: string): number {
  const map: Record<string, number> = {
    '32n': 0.5, '16n': 1, '8n': 2, '8n.': 3, '4n': 4, '4n.': 6, '2n': 8, '2n.': 12, '1m': 16,
  };
  return map[duration] || 2;
}

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
}

export function generateSectionPatterns(
  section: SectionConfig,
  root: string,
  scale: Scale,
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
  seed: number
): AllPatterns {
  const melodyWithRoot = { ...melodyParams, rootNote: root, scale };

  return {
    kick: section.hasKick
      ? generateKickPattern(section.bars, section.intensity, style, groove, seed)
      : [],
    bass: section.hasBass
      ? generateBassPattern(section.bars, root, scale, bassParams, section.intensity, style, seed + 1000)
      : [],
    acid: section.hasAcid
      ? generateAcidPattern(section.bars, root, scale, acidParams, section.intensity, seed + 1500)
      : [],
    melody: section.hasMelody
      ? generateMelodyPattern(section.bars, melodyWithRoot, style, seed + 2000)
      : [],
    arp: section.hasArp
      ? generateArpPattern(section.bars, root, scale, melodyWithRoot, arpParams, seed + 3000)
      : [],
    pluck: section.hasPluck
      ? generatePluckPattern(section.bars, root, scale, pluckParams, section.intensity, seed + 3500)
      : [],
    stab: section.hasStab
      ? generateStabPattern(section.bars, root, scale, stabParams, section.intensity, seed + 4000)
      : [],
    piano: section.hasPiano
      ? generatePianoPattern(section.bars, root, scale, pianoParams, seed + 4500)
      : [],
    strings: section.hasStrings
      ? generateStringsPattern(section.bars, root, scale, stringsParams, seed + 5000)
      : [],
    pad: section.hasPad
      ? generatePadPattern(section.bars, root, scale, padParams, seed + 5500)
      : [],
    hihat: section.hasHihat
      ? generateHihatPattern(section.bars, hihatParams, section.intensity, style, seed + 6000)
      : [],
    openhat: section.hasHihat && hihatParams.openRatio > 30
      ? generateHihatPattern(section.bars, { ...hihatParams, pattern: 'offbeat' }, section.intensity, style, seed + 6500)
        .filter(e => e.note === 'open')
      : [],
    perc: section.hasPerc
      ? generatePercPattern(section.bars, percParams, section.intensity, style, seed + 7000)
      : [],
  };
}

export function calculateTotalBars(sections: SectionConfig[]): number {
  return sections.reduce((total, section) => total + section.bars, 0);
}

export function getSectionStartBar(sections: SectionConfig[], sectionIndex: number): number {
  return sections.slice(0, sectionIndex).reduce((total, section) => total + section.bars, 0);
}
