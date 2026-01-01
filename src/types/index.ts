// Core types for Synth Forge

export type TrackSection = 'intro' | 'buildup' | 'drop' | 'breakdown' | 'outro';

export type SynthType = 'fm' | 'subtractive' | 'granular';

export type Scale = 'minor' | 'phrygian' | 'harmonicMinor' | 'dorian' | 'locrian';

export interface KickParams {
  punch: number; // 0-100 - High frequency click
  sub: number; // 0-100 - Sub bass amount
  decay: number; // 0-100 - Tail length
  pitch: number; // Hz - Base frequency
  drive: number; // 0-100 - Distortion
}

export interface BassParams {
  synthType: SynthType;
  cutoff: number; // Hz - Filter cutoff
  resonance: number; // 0-100 - Filter Q
  attack: number; // ms
  decay: number; // ms
  sustain: number; // 0-100
  release: number; // ms
  octave: number; // -2 to 2
  glide: number; // 0-100 - Portamento
}

export interface MelodyParams {
  scale: Scale;
  rootNote: string; // e.g., 'C', 'D#', 'F'
  octave: number; // 3-6
  density: number; // 0-100 - How many notes
  variation: number; // 0-100 - How random
  arpSpeed: number; // 0-100 - Arpeggiation speed
  synthType: SynthType;
  attack: number;
  release: number;
  filterCutoff: number;
  reverbMix: number; // 0-100
  delayMix: number; // 0-100
}

export interface HiHatParams {
  decay: number; // 0-100
  pitch: number; // 0-100
  pattern: 'straight' | 'offbeat' | 'shuffle' | 'complex';
  velocity: number; // 0-100
}

export interface PadParams {
  synthType: SynthType;
  attack: number;
  release: number;
  filterCutoff: number;
  lfoRate: number;
  lfoDepth: number;
  reverbMix: number;
  chord: 'minor' | 'major' | 'sus4' | 'dim' | 'aug';
}

export interface TrackState {
  bpm: number;
  key: string;
  scale: Scale;
  sections: SectionConfig[];
  kick: KickParams;
  bass: BassParams;
  melody: MelodyParams;
  hihat: HiHatParams;
  pad: PadParams;
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
  intensity: number; // 0-100
}

export interface GeneratedPattern {
  notes: NoteEvent[];
  duration: string; // Tone.js time format
}

export interface NoteEvent {
  note: string;
  time: string;
  duration: string;
  velocity: number;
}

export const DEFAULT_KICK: KickParams = {
  punch: 70,
  sub: 80,
  decay: 50,
  pitch: 55,
  drive: 30,
};

export const DEFAULT_BASS: BassParams = {
  synthType: 'subtractive',
  cutoff: 800,
  resonance: 40,
  attack: 5,
  decay: 200,
  sustain: 60,
  release: 100,
  octave: -1,
  glide: 20,
};

export const DEFAULT_MELODY: MelodyParams = {
  scale: 'minor',
  rootNote: 'A',
  octave: 4,
  density: 50,
  variation: 30,
  arpSpeed: 50,
  synthType: 'fm',
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
};

export const DEFAULT_PAD: PadParams = {
  synthType: 'subtractive',
  attack: 500,
  release: 1000,
  filterCutoff: 1500,
  lfoRate: 0.5,
  lfoDepth: 30,
  reverbMix: 60,
  chord: 'minor',
};

export const DEFAULT_SECTIONS: SectionConfig[] = [
  { type: 'intro', bars: 8, hasKick: false, hasBass: false, hasMelody: false, hasHihat: true, hasPad: true, intensity: 30 },
  { type: 'buildup', bars: 8, hasKick: true, hasBass: true, hasMelody: false, hasHihat: true, hasPad: true, intensity: 60 },
  { type: 'drop', bars: 16, hasKick: true, hasBass: true, hasMelody: true, hasHihat: true, hasPad: false, intensity: 100 },
  { type: 'breakdown', bars: 8, hasKick: false, hasBass: false, hasMelody: true, hasHihat: false, hasPad: true, intensity: 40 },
  { type: 'drop', bars: 16, hasKick: true, hasBass: true, hasMelody: true, hasHihat: true, hasPad: false, intensity: 100 },
  { type: 'outro', bars: 8, hasKick: true, hasBass: false, hasMelody: false, hasHihat: true, hasPad: true, intensity: 30 },
];
