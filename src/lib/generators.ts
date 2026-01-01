'use client';

import type {
  NoteEvent,
  KickParams,
  BassParams,
  MelodyParams,
  HiHatParams,
  PadParams,
  Scale,
  SectionConfig
} from '@/types';

// Musical scales (semitones from root)
const SCALES: Record<Scale, number[]> = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Convert note name to MIDI number
function noteToMidi(note: string): number {
  const match = note.match(/([A-G]#?)(\d+)/);
  if (!match) return 60;
  const [, name, octave] = match;
  const noteIndex = NOTE_NAMES.indexOf(name);
  return noteIndex + (parseInt(octave) + 1) * 12;
}

// Convert MIDI number to note name
function midiToNote(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

// Get notes in a scale
function getScaleNotes(root: string, scale: Scale, octave: number): string[] {
  const rootMidi = noteToMidi(`${root}${octave}`);
  return SCALES[scale].map((interval) => midiToNote(rootMidi + interval));
}

// Seeded random for reproducibility
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

// Generate kick pattern - Deep house/techno style
export function generateKickPattern(
  bars: number = 1,
  intensity: number = 100,
  seed: number = Date.now()
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];

  for (let bar = 0; bar < bars; bar++) {
    // 4-on-the-floor
    for (let beat = 0; beat < 4; beat++) {
      // At low intensity, skip some kicks (but always keep beat 0)
      if (intensity < 50 && beat !== 0 && random() > 0.6) {
        continue;
      }

      events.push({
        note: 'C1',
        time: `${bar}:${beat}:0`,
        duration: '8n',
        velocity: beat === 0 ? 0.9 : 0.75 + random() * 0.15,
      });
    }
  }

  return events;
}

// Generate bassline - Deep, groovy, melodic
export function generateBassPattern(
  bars: number = 1,
  root: string = 'A',
  scale: Scale = 'minor',
  params: BassParams,
  intensity: number = 100,
  seed: number = Date.now()
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];
  const octave = 1 + params.octave;
  const scaleNotes = getScaleNotes(root, scale, octave);

  // Melodic bass patterns - more musical movement
  const bassPatterns = [
    // Simple but effective
    [[0, '4n'], [0, '4n'], [0, '4n'], [0, '4n']],
    // With fifth
    [[0, '4n'], [0, '8n'], [4, '8n'], [0, '4n']],
    // Walking
    [[0, '8n'], [2, '8n'], [3, '8n'], [4, '8n'], [3, '8n'], [2, '8n'], [0, '8n'], [0, '8n']],
    // Syncopated groove
    [[0, '8n.'], [0, '16n'], [3, '8n'], [0, '8n'], [4, '8n'], [0, '8n']],
  ];

  const patternIndex = Math.min(Math.floor(random() * bassPatterns.length), bassPatterns.length - 1);
  const selectedPattern = bassPatterns[patternIndex];

  for (let bar = 0; bar < bars; bar++) {
    let currentTime = 0;

    for (const [noteIdx, duration] of selectedPattern) {
      if (random() < intensity / 100 || currentTime === 0) {
        const noteIndex = (noteIdx as number) % scaleNotes.length;
        const beat = Math.floor(currentTime / 4);
        const sixteenth = currentTime % 4;

        events.push({
          note: scaleNotes[noteIndex],
          time: `${bar}:${beat}:${sixteenth}`,
          duration: duration as string,
          velocity: 0.65 + random() * 0.2,
        });
      }

      // Calculate next position based on duration
      const durationMap: Record<string, number> = {
        '16n': 1, '8n': 2, '8n.': 3, '4n': 4, '4n.': 6, '2n': 8
      };
      currentTime += durationMap[duration as string] || 2;
      if (currentTime >= 16) break;
    }
  }

  return events;
}

// Generate melody - Emotional, Afterlife style
export function generateMelodyPattern(
  bars: number = 1,
  params: MelodyParams,
  seed: number = Date.now()
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];

  // Use octave 3-4 for warmer melodies
  const baseOctave = Math.max(3, params.octave - 1);
  const scaleNotes = getScaleNotes(params.rootNote, params.scale, baseOctave);
  const upperScaleNotes = getScaleNotes(params.rootNote, params.scale, baseOctave + 1);
  const allNotes = [...scaleNotes, ...upperScaleNotes.slice(0, 4)];

  // Emotional melodic phrases - longer notes, more musical
  const phrases = [
    // Ascending emotional phrase
    [0, 2, 4, 5, 4, 2],
    // Descending melancholic
    [7, 5, 4, 2, 0],
    // Question-answer
    [0, 2, 4, 2, 4, 5, 4],
    // Simple but beautiful
    [4, 5, 7, 5, 4, 2, 0],
    // Climactic
    [0, 4, 7, 9, 7, 4],
  ];

  const phraseIndex = Math.floor(random() * phrases.length);
  const phrase = phrases[phraseIndex];

  // Calculate notes per bar based on density
  const notesPerBar = Math.max(2, Math.floor((params.density / 100) * 6));

  for (let bar = 0; bar < bars; bar++) {
    const barPhrase = random() > 0.3 ? phrase : phrases[Math.floor(random() * phrases.length)];

    for (let i = 0; i < Math.min(notesPerBar, barPhrase.length); i++) {
      const noteIndex = barPhrase[i] % allNotes.length;

      // Spread notes across the bar with some variation
      const basePosition = Math.floor((i / notesPerBar) * 16);
      const variation = params.variation > 50 ? Math.floor(random() * 2) : 0;
      const position = Math.min(15, basePosition + variation);

      const beat = Math.floor(position / 4);
      const sixteenth = position % 4;

      // Longer, more emotional note durations
      const durations = ['4n', '4n.', '2n', '8n.'];
      const durationIndex = Math.floor(random() * durations.length);

      events.push({
        note: allNotes[noteIndex],
        time: `${bar}:${beat}:${sixteenth}`,
        duration: durations[durationIndex],
        velocity: 0.5 + random() * 0.25,
      });
    }
  }

  return events.sort((a, b) => {
    const parseTime = (t: string) => {
      const [bar, beat, sixteenth] = t.split(':').map(Number);
      return bar * 16 + beat * 4 + sixteenth;
    };
    return parseTime(a.time) - parseTime(b.time);
  });
}

// Generate arpeggio pattern - Signature melodic techno sound
export function generateArpPattern(
  bars: number = 1,
  root: string = 'A',
  scale: Scale = 'minor',
  params: MelodyParams,
  seed: number = Date.now()
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];

  // Higher octave for arps
  const octave = Math.max(4, params.octave);
  const scaleNotes = getScaleNotes(root, scale, octave);
  const upperNotes = getScaleNotes(root, scale, octave + 1);
  const allNotes = [...scaleNotes, ...upperNotes.slice(0, 3)];

  // Arp patterns (note indices in the scale)
  const arpPatterns = [
    [0, 2, 4, 7, 4, 2], // Up-down triad
    [0, 4, 7, 4], // Simple triad
    [0, 2, 4, 2, 0, 2, 4, 7], // Extended
    [7, 4, 2, 0, 2, 4], // Descending
    [0, 4, 2, 7, 4, 0], // Broken
  ];

  const patternIndex = Math.floor(random() * arpPatterns.length);
  const pattern = arpPatterns[patternIndex];

  // Speed based on arpSpeed parameter
  const notesPerBar = Math.floor(4 + (params.arpSpeed / 100) * 12);
  const stepSize = Math.floor(16 / notesPerBar);

  for (let bar = 0; bar < bars; bar++) {
    for (let i = 0; i < notesPerBar; i++) {
      const noteIndex = pattern[i % pattern.length] % allNotes.length;
      const position = i * stepSize;
      const beat = Math.floor(position / 4);
      const sixteenth = position % 4;

      // Slight velocity variation for groove
      const velocityBase = (i % 4 === 0) ? 0.5 : 0.35;

      events.push({
        note: allNotes[noteIndex],
        time: `${bar}:${beat}:${sixteenth}`,
        duration: '16n',
        velocity: velocityBase + random() * 0.15,
      });
    }
  }

  return events;
}

// Generate hi-hat pattern
export function generateHihatPattern(
  bars: number = 1,
  params: HiHatParams,
  intensity: number = 100,
  seed: number = Date.now()
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];

  const patterns: Record<typeof params.pattern, number[]> = {
    straight: [2, 6, 10, 14], // Offbeat 8ths - classic house
    offbeat: [2, 6, 10, 14], // Same for offbeat
    shuffle: [2, 5, 6, 10, 13, 14], // Swing feel
    complex: [0, 2, 4, 6, 8, 10, 12, 14], // 8th notes
  };

  const selectedPattern = patterns[params.pattern];

  for (let bar = 0; bar < bars; bar++) {
    for (const pos of selectedPattern) {
      if (random() > (intensity / 100) * 1.2) continue;

      const beat = Math.floor(pos / 4);
      const sixteenth = pos % 4;

      // Groove: offbeats slightly louder
      const isOffbeat = pos % 4 === 2;
      const baseVelocity = isOffbeat ? 0.55 : 0.4;

      events.push({
        note: 'C5',
        time: `${bar}:${beat}:${sixteenth}`,
        duration: '32n',
        velocity: (baseVelocity + random() * 0.15) * (params.velocity / 100),
      });
    }
  }

  return events;
}

// Generate pad pattern - Lush chords
export function generatePadPattern(
  bars: number = 1,
  root: string = 'A',
  scale: Scale = 'minor',
  params: PadParams,
  seed: number = Date.now()
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];

  // Lower octave for warm pads
  const scaleNotes = getScaleNotes(root, scale, 2);
  const upperNotes = getScaleNotes(root, scale, 3);

  // Rich chord voicings
  const chordProgressions = [
    // i - VI - III - VII (classic minor)
    [[0, 2, 4], [5, 0, 2], [2, 4, 6], [6, 1, 3]],
    // i - iv - i - v
    [[0, 2, 4], [3, 5, 0], [0, 2, 4], [4, 6, 1]],
    // Sustained i chord with variations
    [[0, 2, 4], [0, 2, 4], [0, 3, 4], [0, 2, 4]],
  ];

  const progressionIndex = Math.floor(random() * chordProgressions.length);
  const progression = chordProgressions[progressionIndex];

  // One chord every 2 bars for lush sustained pads
  const barsPerChord = Math.max(2, Math.floor(bars / progression.length));

  for (let i = 0; i < progression.length && i * barsPerChord < bars; i++) {
    const chord = progression[i];
    const barStart = i * barsPerChord;

    // Add each note of the chord
    chord.forEach((noteIdx, voiceIdx) => {
      // Use both octaves for richness
      const notes = voiceIdx < 2 ? scaleNotes : upperNotes;
      const note = notes[noteIdx % notes.length];

      events.push({
        note,
        time: `${barStart}:0:0`,
        duration: `${barsPerChord}m`,
        velocity: 0.3 + random() * 0.15,
      });
    });
  }

  return events;
}

// Generate complete section patterns
export function generateSectionPatterns(
  section: SectionConfig,
  root: string,
  scale: Scale,
  kickParams: KickParams,
  bassParams: BassParams,
  melodyParams: MelodyParams,
  hihatParams: HiHatParams,
  padParams: PadParams,
  seed: number = Date.now()
) {
  const melodyWithRoot = { ...melodyParams, rootNote: root, scale };

  return {
    kick: section.hasKick
      ? generateKickPattern(section.bars, section.intensity, seed)
      : [],
    bass: section.hasBass
      ? generateBassPattern(section.bars, root, scale, bassParams, section.intensity, seed + 1000)
      : [],
    melody: section.hasMelody
      ? generateMelodyPattern(section.bars, melodyWithRoot, seed + 2000)
      : [],
    arp: section.hasMelody && section.intensity > 60
      ? generateArpPattern(section.bars, root, scale, melodyWithRoot, seed + 3000)
      : [],
    hihat: section.hasHihat
      ? generateHihatPattern(section.bars, hihatParams, section.intensity, seed + 4000)
      : [],
    pad: section.hasPad
      ? generatePadPattern(section.bars, root, scale, padParams, seed + 5000)
      : [],
  };
}

// Calculate total duration in bars
export function calculateTotalBars(sections: SectionConfig[]): number {
  return sections.reduce((total, section) => total + section.bars, 0);
}

// Get section start time in bars
export function getSectionStartBar(sections: SectionConfig[], sectionIndex: number): number {
  return sections.slice(0, sectionIndex).reduce((total, section) => total + section.bars, 0);
}
