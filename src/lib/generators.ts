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

// Generate kick pattern for one bar
export function generateKickPattern(
  bars: number = 1,
  intensity: number = 100,
  seed: number = Date.now()
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];

  for (let bar = 0; bar < bars; bar++) {
    // Basic 4-on-the-floor pattern
    for (let beat = 0; beat < 4; beat++) {
      // Skip some kicks at lower intensity
      if (intensity < 100 && random() > intensity / 100 && beat !== 0) {
        continue;
      }

      events.push({
        note: 'C1',
        time: `${bar}:${beat}:0`,
        duration: '8n',
        velocity: 0.8 + random() * 0.2,
      });
    }

    // Add some variation at higher intensities
    if (intensity > 70 && random() > 0.7) {
      const extraBeat = Math.floor(random() * 4);
      events.push({
        note: 'C1',
        time: `${bar}:${extraBeat}:2`,
        duration: '16n',
        velocity: 0.5 + random() * 0.3,
      });
    }
  }

  return events;
}

// Generate bassline pattern
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

  // Different bass patterns based on intensity
  const patterns = [
    // Simple root pattern
    [0, 0, 0, 0],
    // Root and fifth
    [0, 0, 4, 0],
    // Walking bass
    [0, 2, 3, 4],
    // Syncopated
    [0, 0, 0, 3],
  ];

  const patternIndex = Math.min(Math.floor(intensity / 25), patterns.length - 1);
  const pattern = patterns[patternIndex];

  for (let bar = 0; bar < bars; bar++) {
    for (let beat = 0; beat < 4; beat++) {
      const noteIndex = pattern[beat] % scaleNotes.length;
      const shouldPlay = random() < (intensity / 100);

      if (shouldPlay || beat === 0) {
        events.push({
          note: scaleNotes[noteIndex],
          time: `${bar}:${beat}:0`,
          duration: '4n',
          velocity: 0.7 + random() * 0.3,
        });
      }

      // Add 16th note variations at high intensity
      if (intensity > 80 && random() > 0.6) {
        const subNoteIndex = Math.floor(random() * 3);
        events.push({
          note: scaleNotes[subNoteIndex],
          time: `${bar}:${beat}:2`,
          duration: '16n',
          velocity: 0.5 + random() * 0.2,
        });
      }
    }
  }

  return events;
}

// Generate melody pattern
export function generateMelodyPattern(
  bars: number = 1,
  params: MelodyParams,
  seed: number = Date.now()
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];
  const scaleNotes = getScaleNotes(params.rootNote, params.scale, params.octave);

  // Extended scale (include octave above)
  const extendedScale = [
    ...scaleNotes,
    ...getScaleNotes(params.rootNote, params.scale, params.octave + 1).slice(0, 3),
  ];

  const noteDensity = Math.floor((params.density / 100) * 16); // Max 16 notes per bar

  for (let bar = 0; bar < bars; bar++) {
    let lastNoteIndex = Math.floor(random() * scaleNotes.length);

    for (let i = 0; i < noteDensity; i++) {
      // Determine note position
      const subdivision = 16; // 16th notes
      const position = Math.floor(random() * subdivision);
      const beat = Math.floor(position / 4);
      const sixteenth = position % 4;

      // Apply variation - step up/down or jump
      let noteJump = 0;
      if (random() > params.variation / 100) {
        // Melodic movement (step-wise)
        noteJump = random() > 0.5 ? 1 : -1;
      } else {
        // Larger jump
        noteJump = Math.floor(random() * 5) - 2;
      }

      lastNoteIndex = Math.max(0, Math.min(extendedScale.length - 1, lastNoteIndex + noteJump));

      // Arpeggiation influence
      if (params.arpSpeed > 50) {
        lastNoteIndex = (lastNoteIndex + Math.floor(i / 2)) % extendedScale.length;
      }

      const durations = ['16n', '8n', '8n', '4n'];
      const durationIndex = Math.floor(random() * durations.length);

      events.push({
        note: extendedScale[lastNoteIndex],
        time: `${bar}:${beat}:${sixteenth}`,
        duration: durations[durationIndex],
        velocity: 0.5 + random() * 0.4,
      });
    }
  }

  // Sort by time for proper playback
  return events.sort((a, b) => {
    const parseTime = (t: string) => {
      const [bar, beat, sixteenth] = t.split(':').map(Number);
      return bar * 16 + beat * 4 + sixteenth;
    };
    return parseTime(a.time) - parseTime(b.time);
  });
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
    straight: [0, 2, 4, 6, 8, 10, 12, 14], // Every 8th note
    offbeat: [2, 6, 10, 14], // Off-beat only
    shuffle: [0, 3, 4, 7, 8, 11, 12, 15], // Shuffle feel
    complex: [0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15], // Busy pattern
  };

  const selectedPattern = patterns[params.pattern];

  for (let bar = 0; bar < bars; bar++) {
    for (const pos of selectedPattern) {
      // Skip some hits based on intensity
      if (random() > intensity / 100) continue;

      const beat = Math.floor(pos / 4);
      const sixteenth = pos % 4;

      // Velocity variation
      const isDownbeat = pos % 4 === 0;
      const baseVelocity = isDownbeat ? 0.8 : 0.5;

      events.push({
        note: 'C5',
        time: `${bar}:${beat}:${sixteenth}`,
        duration: '32n',
        velocity: (baseVelocity + random() * 0.2) * (params.velocity / 100),
      });
    }
  }

  return events;
}

// Generate pad chord pattern
export function generatePadPattern(
  bars: number = 1,
  root: string = 'A',
  scale: Scale = 'minor',
  params: PadParams,
  seed: number = Date.now()
): NoteEvent[] {
  const random = seededRandom(seed);
  const events: NoteEvent[] = [];
  const scaleNotes = getScaleNotes(root, scale, 3); // Lower octave for pads

  // Chord voicings based on scale
  const chordVoicings: Record<typeof params.chord, number[]> = {
    minor: [0, 2, 4], // Root, 3rd, 5th
    major: [0, 2, 4],
    sus4: [0, 3, 4],
    dim: [0, 2, 4],
    aug: [0, 2, 4],
  };

  const voicing = chordVoicings[params.chord];

  // Pads change less frequently
  for (let bar = 0; bar < bars; bar += 2) {
    const chordRoot = Math.floor(random() * 3); // Use first few notes of scale

    voicing.forEach((interval) => {
      const noteIndex = (chordRoot + interval) % scaleNotes.length;
      events.push({
        note: scaleNotes[noteIndex],
        time: `${bar}:0:0`,
        duration: '1m', // Whole measure
        velocity: 0.4 + random() * 0.2,
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
  return {
    kick: section.hasKick
      ? generateKickPattern(section.bars, section.intensity, seed)
      : [],
    bass: section.hasBass
      ? generateBassPattern(section.bars, root, scale, bassParams, section.intensity, seed + 1)
      : [],
    melody: section.hasMelody
      ? generateMelodyPattern(section.bars, { ...melodyParams, rootNote: root, scale }, seed + 2)
      : [],
    hihat: section.hasHihat
      ? generateHihatPattern(section.bars, hihatParams, section.intensity, seed + 3)
      : [],
    pad: section.hasPad
      ? generatePadPattern(section.bars, root, scale, padParams, seed + 4)
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
