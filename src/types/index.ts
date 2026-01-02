// Core types for Synth Forge - Ultimate Techno Producer

export type TrackSection = 'intro' | 'buildup' | 'drop' | 'breakdown' | 'outro' | 'bridge';

// Section types with energy levels (1-10)
export type EnergyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// Chord progression types for melodic techno (2-4 chord progressions)
export type ChordProgression =
  | 'i-VI-III-VII'      // Classic emotional minor
  | 'i-VII-VI-VII'      // Dark repetitive
  | 'i-iv'              // Minimal hypnotic (2 chords)
  | 'i-VI-iv-VII'       // Tale Of Us style
  | 'i-III-VII-VI'      // Afterlife style
  | 'i-v-VI-IV'         // Emotional progressive
  | 'i-VII-i-VI'        // Hypnotic minimal
  | 'i-VI'              // Super minimal (2 chords)
  | 'i-iv-VII-III';     // Dark melodic

// Expanded synth types for different timbres
export type SynthType =
  | 'sine' | 'triangle' | 'sawtooth' | 'square' | 'pulse'
  | 'fm' | 'am' | 'fat' | 'pwm';

// Many more scales for variety
export type Scale =
  | 'minor' | 'major' | 'phrygian' | 'harmonicMinor' | 'melodicMinor'
  | 'dorian' | 'locrian' | 'lydian' | 'mixolydian'
  | 'pentatonicMinor' | 'pentatonicMajor' | 'blues'
  | 'wholeNote' | 'chromatic' | 'arabic' | 'japanese';

// Techno sub-genres/styles
export type TechnoStyle =
  | 'melodic' | 'minimal' | 'progressive' | 'dark' | 'industrial'
  | 'acid' | 'detroit' | 'berlin' | 'trance' | 'hypnotic';

// Groove types for rhythmic variety
export type GrooveType =
  | 'straight' | 'shuffle' | 'swing' | 'triplet' | 'syncopated'
  | 'broken' | 'halftime' | 'doubletime';

// Kick styles
export type KickStyle =
  | 'punchy' | 'deep' | 'hard' | 'soft' | 'distorted'
  | 'clicky' | 'boomy' | 'tight' | 'long' | 'short';

// Bass types
export type BassType =
  | 'sub' | 'reese' | 'acid' | 'pluck' | 'wobble'
  | 'growl' | 'clean' | 'distorted' | 'fm' | 'saw';

// Lead types
export type LeadType =
  | 'pad' | 'pluck' | 'stab' | 'arp' | 'piano'
  | 'strings' | 'brass' | 'bell' | 'vocal' | 'supersaw';

export interface KickParams {
  style: KickStyle;
  punch: number; // 0-100
  sub: number; // 0-100
  decay: number; // 0-100
  pitch: number; // Hz
  drive: number; // 0-100
  tone: number; // 0-100 - bright vs dark
}

export interface BassParams {
  type: BassType;
  synthType: SynthType;
  cutoff: number;
  resonance: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  octave: number;
  glide: number;
  distortion: number; // 0-100
  subMix: number; // 0-100 - how much sub layer
}

export interface MelodyParams {
  scale: Scale;
  rootNote: string;
  octave: number;
  density: number;
  variation: number;
  arpSpeed: number;
  synthType: SynthType;
  attack: number;
  release: number;
  filterCutoff: number;
  reverbMix: number;
  delayMix: number;
}

export interface HiHatParams {
  decay: number;
  pitch: number;
  pattern: 'straight' | 'offbeat' | 'shuffle' | 'complex' | 'minimal' | 'rolling';
  velocity: number;
  openRatio: number; // 0-100 - how many open hats
}

export interface PadParams {
  synthType: SynthType;
  attack: number;
  release: number;
  filterCutoff: number;
  lfoRate: number;
  lfoDepth: number;
  reverbMix: number;
  chord: 'minor' | 'major' | 'sus4' | 'sus2' | 'dim' | 'aug' | 'add9' | 'minor7' | 'major7';
  brightness: number; // 0-100
  movement: number; // 0-100 - filter modulation
}

// New instrument types
export interface PluckParams {
  synthType: SynthType;
  decay: number;
  brightness: number;
  resonance: number;
  reverbMix: number;
  delayMix: number;
  octave: number;
}

export interface StabParams {
  synthType: SynthType;
  attack: number;
  release: number;
  filterCutoff: number;
  voices: number; // 1-8 unison voices
  detune: number; // 0-100
  reverbMix: number;
}

export interface PianoParams {
  brightness: number;
  reverb: number;
  velocity: number;
  octave: number;
}

export interface StringsParams {
  attack: number;
  release: number;
  brightness: number;
  ensemble: number; // 0-100 - chorus/ensemble effect
  reverbMix: number;
}

export interface AcidParams {
  cutoff: number;
  resonance: number;
  envMod: number; // 0-100 - envelope to filter
  decay: number;
  accent: number; // 0-100
  slide: number; // 0-100
}

export interface PercParams {
  type: 'clap' | 'snare' | 'rim' | 'tom' | 'conga' | 'shaker' | 'perc';
  pitch: number;
  decay: number;
  reverb: number;
  pattern: 'sparse' | 'regular' | 'busy' | 'fill';
}

export interface FxParams {
  type: 'riser' | 'impact' | 'sweep' | 'noise' | 'texture' | 'atmosphere';
  intensity: number;
  duration: number;
  filter: number;
}

export interface VocalParams {
  type: 'ooh' | 'aah' | 'eeh' | 'choir';
  gender: 'female' | 'male' | 'both';
  brightness: number; // 0-100
  attack: number;
  release: number;
  reverbMix: number;
  mix: number; // 0-100 overall level
}

export interface ArpParams {
  pattern: 'up' | 'down' | 'updown' | 'random' | 'order' | 'chord';
  speed: number; // in divisions (16n, 8n, etc)
  octaves: number; // 1-4
  gate: number; // 0-100 - note length
  swing: number; // 0-100
}

export interface TrackState {
  bpm: number;
  key: string;
  scale: Scale;
  secondaryScale: Scale; // For 2-scale system (Tale Of Us/Anyma style)
  chordProgression: ChordProgression;
  style: TechnoStyle;
  groove: GrooveType;
  sections: SectionConfig[];
  kick: KickParams;
  bass: BassParams;
  melody: MelodyParams;
  hihat: HiHatParams;
  pad: PadParams;
  pluck: PluckParams;
  stab: StabParams;
  piano: PianoParams;
  strings: StringsParams;
  acid: AcidParams;
  perc: PercParams;
  fx: FxParams;
  arp: ArpParams;
  vocal: VocalParams;
  masterVolume: number;
}

export interface SectionConfig {
  type: TrackSection;
  bars: number;
  hasKick: boolean;
  hasBass: boolean;
  hasMelody: boolean;
  hasHihat: boolean;
  hasPad: boolean;
  hasPluck: boolean;
  hasStab: boolean;
  hasPiano: boolean;
  hasStrings: boolean;
  hasAcid: boolean;
  hasPerc: boolean;
  hasFx: boolean;
  hasArp: boolean;
  hasVocal: boolean;
  intensity: number;
}

export interface GeneratedPattern {
  notes: NoteEvent[];
  duration: string;
}

export interface NoteEvent {
  note: string;
  time: string;
  duration: string;
  velocity: number;
}

// Default values
export const DEFAULT_KICK: KickParams = {
  style: 'punchy',
  punch: 70,
  sub: 80,
  decay: 50,
  pitch: 55,
  drive: 30,
  tone: 50,
};

export const DEFAULT_BASS: BassParams = {
  type: 'sub',
  synthType: 'sawtooth',
  cutoff: 800,
  resonance: 40,
  attack: 5,
  decay: 200,
  sustain: 60,
  release: 100,
  octave: -1,
  glide: 20,
  distortion: 0,
  subMix: 50,
};

export const DEFAULT_MELODY: MelodyParams = {
  scale: 'minor',
  rootNote: 'A',
  octave: 4,
  density: 50,
  variation: 30,
  arpSpeed: 50,
  synthType: 'triangle',
  attack: 10,
  release: 300,
  filterCutoff: 2000,
  reverbMix: 40,
  delayMix: 30,
};

export const DEFAULT_HIHAT: HiHatParams = {
  decay: 30,
  pitch: 50,
  pattern: 'straight',
  velocity: 70,
  openRatio: 20,
};

export const DEFAULT_PAD: PadParams = {
  synthType: 'sine',
  attack: 500,
  release: 1000,
  filterCutoff: 1500,
  lfoRate: 0.5,
  lfoDepth: 30,
  reverbMix: 60,
  chord: 'minor',
  brightness: 50,
  movement: 30,
};

export const DEFAULT_PLUCK: PluckParams = {
  synthType: 'triangle',
  decay: 300,
  brightness: 60,
  resonance: 40,
  reverbMix: 50,
  delayMix: 40,
  octave: 4,
};

export const DEFAULT_STAB: StabParams = {
  synthType: 'sawtooth',
  attack: 5,
  release: 200,
  filterCutoff: 3000,
  voices: 4,
  detune: 20,
  reverbMix: 30,
};

export const DEFAULT_PIANO: PianoParams = {
  brightness: 60,
  reverb: 40,
  velocity: 70,
  octave: 4,
};

export const DEFAULT_STRINGS: StringsParams = {
  attack: 800,
  release: 1500,
  brightness: 50,
  ensemble: 60,
  reverbMix: 70,
};

export const DEFAULT_ACID: AcidParams = {
  cutoff: 400,
  resonance: 70,
  envMod: 80,
  decay: 200,
  accent: 60,
  slide: 30,
};

export const DEFAULT_PERC: PercParams = {
  type: 'clap',
  pitch: 50,
  decay: 50,
  reverb: 30,
  pattern: 'regular',
};

export const DEFAULT_FX: FxParams = {
  type: 'riser',
  intensity: 50,
  duration: 4000,
  filter: 50,
};

export const DEFAULT_ARP: ArpParams = {
  pattern: 'up',
  speed: 50,
  octaves: 2,
  gate: 50,
  swing: 0,
};

export const DEFAULT_VOCAL: VocalParams = {
  type: 'ooh',
  gender: 'female',
  brightness: 50,
  attack: 300,
  release: 800,
  reverbMix: 60,
  mix: 50,
};

// Default sections following 16/32 bar phrase structure (Afterlife style)
// Energy curve: Intro (2-3) -> Groove (4-5) -> Dev (5-6) -> Drop (8-9) -> Breakdown (3-4) -> Build (6-8) -> Drop (8-9) -> Outro (3-4)
// REGLA: "Menos es más" - Máximo 5-7 elementos a la vez, incluso en drops
export const DEFAULT_SECTIONS: SectionConfig[] = [
  // Intro - 16 bars: Pad + Strings + FX (3 elementos) - atmosférico
  { type: 'intro', bars: 16, hasKick: false, hasBass: false, hasMelody: false, hasHihat: false, hasPad: true, hasPluck: false, hasStab: false, hasPiano: false, hasStrings: true, hasAcid: false, hasPerc: false, hasFx: true, hasArp: false, hasVocal: false, intensity: 25 },
  // Groove - 16 bars: Kick + Bass + Hats + Pad (4 elementos) - solo el groove
  { type: 'buildup', bars: 16, hasKick: true, hasBass: true, hasMelody: false, hasHihat: true, hasPad: true, hasPluck: false, hasStab: false, hasPiano: false, hasStrings: false, hasAcid: false, hasPerc: false, hasFx: false, hasArp: false, hasVocal: false, intensity: 50 },
  // Desarrollo - 16 bars: Kick + Bass + Hats + Arp + Perc (5 elementos) - entra el motor
  { type: 'buildup', bars: 16, hasKick: true, hasBass: true, hasMelody: false, hasHihat: true, hasPad: false, hasPluck: false, hasStab: false, hasPiano: false, hasStrings: false, hasAcid: false, hasPerc: true, hasFx: false, hasArp: true, hasVocal: false, intensity: 65 },
  // Drop 1 - 32 bars: Kick + Bass + Hats + Melody + Arp + Perc (6 elementos) - full pero controlado
  { type: 'drop', bars: 32, hasKick: true, hasBass: true, hasMelody: true, hasHihat: true, hasPad: false, hasPluck: false, hasStab: false, hasPiano: false, hasStrings: false, hasAcid: false, hasPerc: true, hasFx: false, hasArp: true, hasVocal: false, intensity: 100 },
  // Breakdown - 16 bars: Pad + Melody + Piano + Strings + Vocal (5 elementos) - emocional, sin ritmo
  { type: 'breakdown', bars: 16, hasKick: false, hasBass: false, hasMelody: true, hasHihat: false, hasPad: true, hasPluck: false, hasStab: false, hasPiano: true, hasStrings: true, hasAcid: false, hasPerc: false, hasFx: false, hasArp: false, hasVocal: true, intensity: 35 },
  // Build - 8 bars: Kick + Bass + Hats + Arp + FX (5 elementos) - tensión antes del drop
  { type: 'buildup', bars: 8, hasKick: true, hasBass: true, hasMelody: false, hasHihat: true, hasPad: false, hasPluck: false, hasStab: false, hasPiano: false, hasStrings: false, hasAcid: false, hasPerc: false, hasFx: true, hasArp: true, hasVocal: false, intensity: 75 },
  // Drop 2 - 32 bars: Kick + Bass + Hats + Melody + Pluck + Perc (6 elementos) - variación
  { type: 'drop', bars: 32, hasKick: true, hasBass: true, hasMelody: true, hasHihat: true, hasPad: false, hasPluck: true, hasStab: false, hasPiano: false, hasStrings: false, hasAcid: false, hasPerc: true, hasFx: false, hasArp: false, hasVocal: false, intensity: 100 },
  // Outro - 16 bars: Kick + Hats + Pad + Strings (4 elementos) - fade out
  { type: 'outro', bars: 16, hasKick: true, hasBass: false, hasMelody: false, hasHihat: true, hasPad: true, hasPluck: false, hasStab: false, hasPiano: false, hasStrings: true, hasAcid: false, hasPerc: false, hasFx: false, hasArp: false, hasVocal: false, intensity: 30 },
];

// Style presets - Afterlife/Ka:st/Tale Of Us/Anyma/Adriatique style
// Melodic techno typically runs 120-126 BPM
export const STYLE_PRESETS: Record<TechnoStyle, Partial<TrackState>> = {
  melodic: {
    bpm: 122,
    scale: 'minor',
    groove: 'straight',
  },
  minimal: {
    bpm: 124,
    scale: 'pentatonicMinor',
    groove: 'shuffle',
  },
  progressive: {
    bpm: 120,
    scale: 'dorian',
    groove: 'straight',
  },
  dark: {
    bpm: 124,
    scale: 'phrygian',
    groove: 'syncopated',
  },
  industrial: {
    bpm: 126,
    scale: 'locrian',
    groove: 'broken',
  },
  acid: {
    bpm: 125,
    scale: 'blues',
    groove: 'shuffle',
  },
  detroit: {
    bpm: 124,
    scale: 'minor',
    groove: 'syncopated',
  },
  berlin: {
    bpm: 126,
    scale: 'phrygian',
    groove: 'straight',
  },
  trance: {
    bpm: 126,
    scale: 'harmonicMinor',
    groove: 'straight',
  },
  hypnotic: {
    bpm: 122,
    scale: 'dorian',
    groove: 'triplet',
  },
};

// Random element pools for total variety
// BPM range adjusted for Afterlife/Ka:st/Tale Of Us style melodic techno (120-126)
export const RANDOM_POOLS = {
  keys: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  scales: ['minor', 'phrygian', 'harmonicMinor', 'dorian', 'pentatonicMinor', 'melodicMinor', 'mixolydian'] as Scale[],
  styles: ['melodic', 'minimal', 'progressive', 'dark', 'acid', 'hypnotic'] as TechnoStyle[],
  grooves: ['straight', 'shuffle', 'syncopated', 'triplet', 'broken'] as GrooveType[],
  kickStyles: ['punchy', 'deep', 'hard', 'tight', 'boomy'] as KickStyle[],
  bassTypes: ['sub', 'reese', 'acid', 'pluck', 'growl', 'fm'] as BassType[],
  bpmRanges: { min: 120, max: 126 },
};
