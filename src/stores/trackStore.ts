'use client';

import { create } from 'zustand';
import type {
  TrackState,
  KickParams,
  BassParams,
  MelodyParams,
  HiHatParams,
  PadParams,
  SectionConfig,
  Scale,
  DEFAULT_KICK,
  DEFAULT_BASS,
  DEFAULT_MELODY,
  DEFAULT_HIHAT,
  DEFAULT_PAD,
  DEFAULT_SECTIONS,
} from '@/types';

interface TrackStore extends TrackState {
  // Setters
  setBPM: (bpm: number) => void;
  setKey: (key: string) => void;
  setScale: (scale: Scale) => void;
  setMasterVolume: (volume: number) => void;

  // Instrument updates
  updateKick: (params: Partial<KickParams>) => void;
  updateBass: (params: Partial<BassParams>) => void;
  updateMelody: (params: Partial<MelodyParams>) => void;
  updateHihat: (params: Partial<HiHatParams>) => void;
  updatePad: (params: Partial<PadParams>) => void;

  // Section management
  updateSection: (index: number, config: Partial<SectionConfig>) => void;
  addSection: (section: SectionConfig) => void;
  removeSection: (index: number) => void;
  reorderSections: (sections: SectionConfig[]) => void;

  // Random generation
  randomizeAll: () => void;
  randomizeKick: () => void;
  randomizeBass: () => void;
  randomizeMelody: () => void;

  // Reset
  reset: () => void;
}

const DEFAULT_STATE: TrackState = {
  bpm: 128,
  key: 'A',
  scale: 'minor',
  masterVolume: 80,
  sections: [
    { type: 'intro', bars: 8, hasKick: false, hasBass: false, hasMelody: false, hasHihat: true, hasPad: true, intensity: 30 },
    { type: 'buildup', bars: 8, hasKick: true, hasBass: true, hasMelody: false, hasHihat: true, hasPad: true, intensity: 60 },
    { type: 'drop', bars: 16, hasKick: true, hasBass: true, hasMelody: true, hasHihat: true, hasPad: false, intensity: 100 },
    { type: 'breakdown', bars: 8, hasKick: false, hasBass: false, hasMelody: true, hasHihat: false, hasPad: true, intensity: 40 },
    { type: 'drop', bars: 16, hasKick: true, hasBass: true, hasMelody: true, hasHihat: true, hasPad: false, intensity: 100 },
    { type: 'outro', bars: 8, hasKick: true, hasBass: false, hasMelody: false, hasHihat: true, hasPad: true, intensity: 30 },
  ],
  kick: {
    punch: 70,
    sub: 80,
    decay: 50,
    pitch: 55,
    drive: 30,
  },
  bass: {
    synthType: 'subtractive',
    cutoff: 800,
    resonance: 40,
    attack: 5,
    decay: 200,
    sustain: 60,
    release: 100,
    octave: -1,
    glide: 20,
  },
  melody: {
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
  },
  hihat: {
    decay: 30,
    pitch: 50,
    pattern: 'straight',
    velocity: 70,
  },
  pad: {
    synthType: 'subtractive',
    attack: 500,
    release: 1000,
    filterCutoff: 1500,
    lfoRate: 0.5,
    lfoDepth: 30,
    reverbMix: 60,
    chord: 'minor',
  },
};

function randomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const useTrackStore = create<TrackStore>((set) => ({
  ...DEFAULT_STATE,

  setBPM: (bpm) => set({ bpm }),
  setKey: (key) => set({ key }),
  setScale: (scale) => set({ scale }),
  setMasterVolume: (masterVolume) => set({ masterVolume }),

  updateKick: (params) =>
    set((state) => ({ kick: { ...state.kick, ...params } })),

  updateBass: (params) =>
    set((state) => ({ bass: { ...state.bass, ...params } })),

  updateMelody: (params) =>
    set((state) => ({ melody: { ...state.melody, ...params } })),

  updateHihat: (params) =>
    set((state) => ({ hihat: { ...state.hihat, ...params } })),

  updatePad: (params) =>
    set((state) => ({ pad: { ...state.pad, ...params } })),

  updateSection: (index, config) =>
    set((state) => ({
      sections: state.sections.map((s, i) =>
        i === index ? { ...s, ...config } : s
      ),
    })),

  addSection: (section) =>
    set((state) => ({ sections: [...state.sections, section] })),

  removeSection: (index) =>
    set((state) => ({
      sections: state.sections.filter((_, i) => i !== index),
    })),

  reorderSections: (sections) => set({ sections }),

  randomizeAll: () =>
    set({
      bpm: randomRange(120, 140),
      key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][randomRange(0, 6)],
      scale: (['minor', 'phrygian', 'harmonicMinor', 'dorian'] as Scale[])[randomRange(0, 3)],
      kick: {
        punch: randomRange(50, 90),
        sub: randomRange(60, 100),
        decay: randomRange(30, 70),
        pitch: randomRange(45, 65),
        drive: randomRange(10, 50),
      },
      bass: {
        synthType: 'subtractive',
        cutoff: randomRange(400, 1500),
        resonance: randomRange(20, 60),
        attack: randomRange(1, 20),
        decay: randomRange(100, 400),
        sustain: randomRange(40, 80),
        release: randomRange(50, 200),
        octave: randomRange(-2, 0),
        glide: randomRange(0, 50),
      },
      melody: {
        scale: 'minor',
        rootNote: 'A',
        octave: randomRange(3, 5),
        density: randomRange(30, 70),
        variation: randomRange(20, 60),
        arpSpeed: randomRange(20, 80),
        synthType: 'fm',
        attack: randomRange(5, 50),
        release: randomRange(100, 500),
        filterCutoff: randomRange(1000, 4000),
        reverbMix: randomRange(20, 60),
        delayMix: randomRange(10, 50),
      },
      hihat: {
        decay: randomRange(20, 50),
        pitch: randomRange(30, 70),
        pattern: (['straight', 'offbeat', 'shuffle', 'complex'] as const)[randomRange(0, 3)],
        velocity: randomRange(50, 90),
      },
      pad: {
        synthType: 'subtractive',
        attack: randomRange(300, 800),
        release: randomRange(500, 1500),
        filterCutoff: randomRange(800, 2500),
        lfoRate: Math.random() * 2,
        lfoDepth: randomRange(10, 50),
        reverbMix: randomRange(40, 80),
        chord: (['minor', 'sus4', 'dim'] as const)[randomRange(0, 2)],
      },
    }),

  randomizeKick: () =>
    set({
      kick: {
        punch: randomRange(50, 90),
        sub: randomRange(60, 100),
        decay: randomRange(30, 70),
        pitch: randomRange(45, 65),
        drive: randomRange(10, 50),
      },
    }),

  randomizeBass: () =>
    set({
      bass: {
        synthType: 'subtractive',
        cutoff: randomRange(400, 1500),
        resonance: randomRange(20, 60),
        attack: randomRange(1, 20),
        decay: randomRange(100, 400),
        sustain: randomRange(40, 80),
        release: randomRange(50, 200),
        octave: randomRange(-2, 0),
        glide: randomRange(0, 50),
      },
    }),

  randomizeMelody: () =>
    set({
      melody: {
        scale: 'minor',
        rootNote: 'A',
        octave: randomRange(3, 5),
        density: randomRange(30, 70),
        variation: randomRange(20, 60),
        arpSpeed: randomRange(20, 80),
        synthType: 'fm',
        attack: randomRange(5, 50),
        release: randomRange(100, 500),
        filterCutoff: randomRange(1000, 4000),
        reverbMix: randomRange(20, 60),
        delayMix: randomRange(10, 50),
      },
    }),

  reset: () => set(DEFAULT_STATE),
}));
