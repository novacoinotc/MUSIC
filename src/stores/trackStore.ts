'use client';

import { create } from 'zustand';
import type {
  TrackState,
  KickParams,
  BassParams,
  MelodyParams,
  HiHatParams,
  PadParams,
  PluckParams,
  StabParams,
  PianoParams,
  StringsParams,
  AcidParams,
  PercParams,
  ArpParams,
  SectionConfig,
  Scale,
  TechnoStyle,
  GrooveType,
  KickStyle,
  BassType,
} from '@/types';
import { RANDOM_POOLS, DEFAULT_SECTIONS } from '@/types';

interface TrackStore extends TrackState {
  // Setters
  setBPM: (bpm: number) => void;
  setKey: (key: string) => void;
  setScale: (scale: Scale) => void;
  setStyle: (style: TechnoStyle) => void;
  setGroove: (groove: GrooveType) => void;
  setMasterVolume: (volume: number) => void;

  // Instrument updates
  updateKick: (params: Partial<KickParams>) => void;
  updateBass: (params: Partial<BassParams>) => void;
  updateMelody: (params: Partial<MelodyParams>) => void;
  updateHihat: (params: Partial<HiHatParams>) => void;
  updatePad: (params: Partial<PadParams>) => void;
  updatePluck: (params: Partial<PluckParams>) => void;
  updateStab: (params: Partial<StabParams>) => void;
  updatePiano: (params: Partial<PianoParams>) => void;
  updateStrings: (params: Partial<StringsParams>) => void;
  updateAcid: (params: Partial<AcidParams>) => void;
  updatePerc: (params: Partial<PercParams>) => void;
  updateArp: (params: Partial<ArpParams>) => void;

  // Section management
  updateSection: (index: number, config: Partial<SectionConfig>) => void;
  addSection: (section: SectionConfig) => void;
  removeSection: (index: number) => void;
  reorderSections: (sections: SectionConfig[]) => void;
  randomizeSections: () => void;

  // Random generation - MASSIVE variety
  randomizeAll: () => void;
  randomizeKick: () => void;
  randomizeBass: () => void;
  randomizeMelody: () => void;
  randomizeRhythm: () => void;

  // Reset
  reset: () => void;
}

const DEFAULT_STATE: TrackState = {
  bpm: 126,
  key: 'A',
  scale: 'minor',
  style: 'melodic',
  groove: 'straight',
  masterVolume: 80,
  sections: DEFAULT_SECTIONS,
  kick: {
    style: 'punchy',
    punch: 70,
    sub: 80,
    decay: 50,
    pitch: 55,
    drive: 30,
    tone: 50,
  },
  bass: {
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
  },
  melody: {
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
  },
  hihat: {
    decay: 30,
    pitch: 50,
    pattern: 'straight',
    velocity: 70,
    openRatio: 20,
  },
  pad: {
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
  },
  pluck: {
    synthType: 'triangle',
    decay: 300,
    brightness: 60,
    resonance: 40,
    reverbMix: 50,
    delayMix: 40,
    octave: 4,
  },
  stab: {
    synthType: 'sawtooth',
    attack: 5,
    release: 200,
    filterCutoff: 3000,
    voices: 4,
    detune: 20,
    reverbMix: 30,
  },
  piano: {
    brightness: 60,
    reverb: 40,
    velocity: 70,
    octave: 4,
  },
  strings: {
    attack: 800,
    release: 1500,
    brightness: 50,
    ensemble: 60,
    reverbMix: 70,
  },
  acid: {
    cutoff: 400,
    resonance: 70,
    envMod: 80,
    decay: 200,
    accent: 60,
    slide: 30,
  },
  perc: {
    type: 'clap',
    pitch: 50,
    decay: 50,
    reverb: 30,
    pattern: 'regular',
  },
  fx: {
    type: 'riser',
    intensity: 50,
    duration: 4000,
    filter: 50,
  },
  arp: {
    pattern: 'up',
    speed: 50,
    octaves: 2,
    gate: 50,
    swing: 0,
  },
};

function randomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const useTrackStore = create<TrackStore>((set, get) => ({
  ...DEFAULT_STATE,

  setBPM: (bpm) => set({ bpm }),
  setKey: (key) => set({ key }),
  setScale: (scale) => set({ scale }),
  setStyle: (style) => set({ style }),
  setGroove: (groove) => set({ groove }),
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

  updatePluck: (params) =>
    set((state) => ({ pluck: { ...state.pluck, ...params } })),

  updateStab: (params) =>
    set((state) => ({ stab: { ...state.stab, ...params } })),

  updatePiano: (params) =>
    set((state) => ({ piano: { ...state.piano, ...params } })),

  updateStrings: (params) =>
    set((state) => ({ strings: { ...state.strings, ...params } })),

  updateAcid: (params) =>
    set((state) => ({ acid: { ...state.acid, ...params } })),

  updatePerc: (params) =>
    set((state) => ({ perc: { ...state.perc, ...params } })),

  updateArp: (params) =>
    set((state) => ({ arp: { ...state.arp, ...params } })),

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

  randomizeSections: () => {
    const sectionTypes = ['intro', 'buildup', 'drop', 'breakdown', 'bridge', 'outro'] as const;
    const numSections = randomRange(4, 8);
    const sections: SectionConfig[] = [];

    for (let i = 0; i < numSections; i++) {
      const isFirst = i === 0;
      const isLast = i === numSections - 1;
      let type = randomChoice([...sectionTypes]);

      if (isFirst) type = 'intro';
      if (isLast) type = 'outro';

      const intensity = type === 'drop' ? randomRange(80, 100) :
                       type === 'breakdown' ? randomRange(20, 40) :
                       type === 'buildup' ? randomRange(50, 70) :
                       randomRange(30, 60);

      sections.push({
        type,
        bars: randomChoice([4, 8, 8, 16, 16]),
        hasKick: type !== 'intro' && type !== 'breakdown' && Math.random() > 0.2,
        hasBass: type !== 'intro' && Math.random() > 0.3,
        hasMelody: type === 'drop' || type === 'breakdown' || Math.random() > 0.5,
        hasHihat: Math.random() > 0.3,
        hasPad: type === 'intro' || type === 'breakdown' || type === 'outro' || Math.random() > 0.6,
        hasPluck: type === 'drop' && Math.random() > 0.5,
        hasStab: type === 'drop' && Math.random() > 0.6,
        hasPiano: type === 'breakdown' && Math.random() > 0.5,
        hasStrings: (type === 'intro' || type === 'breakdown') && Math.random() > 0.4,
        hasAcid: Math.random() > 0.8,
        hasPerc: type !== 'breakdown' && Math.random() > 0.4,
        hasFx: (type === 'buildup' || type === 'intro') && Math.random() > 0.3,
        hasArp: (type === 'drop' || type === 'buildup') && Math.random() > 0.4,
        intensity,
      });
    }

    set({ sections });
  },

  // MASSIVE randomization for total variety
  randomizeAll: () => {
    const style = randomChoice(RANDOM_POOLS.styles);
    const groove = randomChoice(RANDOM_POOLS.grooves);
    const key = randomChoice(RANDOM_POOLS.keys);
    const scale = randomChoice(RANDOM_POOLS.scales);
    const bpm = randomRange(RANDOM_POOLS.bpmRanges.min, RANDOM_POOLS.bpmRanges.max);

    // Randomize sections too
    get().randomizeSections();

    set({
      bpm,
      key,
      scale,
      style,
      groove,
      kick: {
        style: randomChoice(RANDOM_POOLS.kickStyles),
        punch: randomRange(40, 100),
        sub: randomRange(50, 100),
        decay: randomRange(20, 80),
        pitch: randomRange(40, 70),
        drive: randomRange(0, 60),
        tone: randomRange(30, 70),
      },
      bass: {
        type: randomChoice(RANDOM_POOLS.bassTypes),
        synthType: randomChoice(['sawtooth', 'square', 'triangle', 'sine'] as const),
        cutoff: randomRange(200, 1200),
        resonance: randomRange(20, 80),
        attack: randomRange(1, 30),
        decay: randomRange(100, 500),
        sustain: randomRange(30, 80),
        release: randomRange(50, 300),
        octave: randomRange(-2, 0),
        glide: randomRange(0, 60),
        distortion: randomRange(0, 50),
        subMix: randomRange(30, 80),
      },
      melody: {
        scale,
        rootNote: key,
        octave: randomRange(3, 5),
        density: randomRange(20, 80),
        variation: randomRange(10, 70),
        arpSpeed: randomRange(20, 90),
        synthType: randomChoice(['sine', 'triangle', 'sawtooth'] as const),
        attack: randomRange(5, 80),
        release: randomRange(100, 800),
        filterCutoff: randomRange(1000, 5000),
        reverbMix: randomRange(20, 70),
        delayMix: randomRange(10, 60),
      },
      hihat: {
        decay: randomRange(15, 60),
        pitch: randomRange(30, 80),
        pattern: randomChoice(['straight', 'offbeat', 'shuffle', 'complex', 'minimal', 'rolling'] as const),
        velocity: randomRange(50, 90),
        openRatio: randomRange(0, 50),
      },
      pad: {
        synthType: randomChoice(['sine', 'triangle'] as const),
        attack: randomRange(300, 1200),
        release: randomRange(500, 2000),
        filterCutoff: randomRange(600, 3000),
        lfoRate: Math.random() * 3,
        lfoDepth: randomRange(10, 60),
        reverbMix: randomRange(40, 80),
        chord: randomChoice(['minor', 'major', 'sus4', 'sus2', 'minor7', 'add9'] as const),
        brightness: randomRange(30, 70),
        movement: randomRange(20, 60),
      },
      pluck: {
        synthType: randomChoice(['triangle', 'sine'] as const),
        decay: randomRange(150, 500),
        brightness: randomRange(40, 80),
        resonance: randomRange(30, 70),
        reverbMix: randomRange(30, 70),
        delayMix: randomRange(20, 60),
        octave: randomRange(4, 5),
      },
      stab: {
        synthType: randomChoice(['sawtooth', 'square'] as const),
        attack: randomRange(2, 15),
        release: randomRange(100, 400),
        filterCutoff: randomRange(2000, 5000),
        voices: randomRange(2, 6),
        detune: randomRange(10, 40),
        reverbMix: randomRange(20, 50),
      },
      piano: {
        brightness: randomRange(40, 80),
        reverb: randomRange(30, 60),
        velocity: randomRange(50, 80),
        octave: randomRange(3, 5),
      },
      strings: {
        attack: randomRange(500, 1500),
        release: randomRange(800, 2500),
        brightness: randomRange(30, 70),
        ensemble: randomRange(40, 80),
        reverbMix: randomRange(50, 85),
      },
      acid: {
        cutoff: randomRange(200, 800),
        resonance: randomRange(50, 95),
        envMod: randomRange(50, 100),
        decay: randomRange(100, 400),
        accent: randomRange(40, 90),
        slide: randomRange(10, 60),
      },
      perc: {
        type: randomChoice(['clap', 'snare', 'rim', 'shaker'] as const),
        pitch: randomRange(30, 70),
        decay: randomRange(30, 70),
        reverb: randomRange(20, 50),
        pattern: randomChoice(['sparse', 'regular', 'busy'] as const),
      },
      arp: {
        pattern: randomChoice(['up', 'down', 'updown', 'random', 'order', 'chord'] as const),
        speed: randomRange(30, 80),
        octaves: randomRange(1, 3),
        gate: randomRange(30, 80),
        swing: randomRange(0, 40),
      },
    });
  },

  randomizeKick: () =>
    set({
      kick: {
        style: randomChoice(RANDOM_POOLS.kickStyles),
        punch: randomRange(40, 100),
        sub: randomRange(50, 100),
        decay: randomRange(20, 80),
        pitch: randomRange(40, 70),
        drive: randomRange(0, 60),
        tone: randomRange(30, 70),
      },
    }),

  randomizeBass: () =>
    set({
      bass: {
        type: randomChoice(RANDOM_POOLS.bassTypes),
        synthType: randomChoice(['sawtooth', 'square', 'triangle', 'sine'] as const),
        cutoff: randomRange(200, 1200),
        resonance: randomRange(20, 80),
        attack: randomRange(1, 30),
        decay: randomRange(100, 500),
        sustain: randomRange(30, 80),
        release: randomRange(50, 300),
        octave: randomRange(-2, 0),
        glide: randomRange(0, 60),
        distortion: randomRange(0, 50),
        subMix: randomRange(30, 80),
      },
    }),

  randomizeMelody: () => {
    const state = get();
    set({
      melody: {
        scale: state.scale,
        rootNote: state.key,
        octave: randomRange(3, 5),
        density: randomRange(20, 80),
        variation: randomRange(10, 70),
        arpSpeed: randomRange(20, 90),
        synthType: randomChoice(['sine', 'triangle', 'sawtooth'] as const),
        attack: randomRange(5, 80),
        release: randomRange(100, 800),
        filterCutoff: randomRange(1000, 5000),
        reverbMix: randomRange(20, 70),
        delayMix: randomRange(10, 60),
      },
    });
  },

  randomizeRhythm: () =>
    set({
      groove: randomChoice(RANDOM_POOLS.grooves),
      hihat: {
        decay: randomRange(15, 60),
        pitch: randomRange(30, 80),
        pattern: randomChoice(['straight', 'offbeat', 'shuffle', 'complex', 'minimal', 'rolling'] as const),
        velocity: randomRange(50, 90),
        openRatio: randomRange(0, 50),
      },
      perc: {
        type: randomChoice(['clap', 'snare', 'rim', 'shaker'] as const),
        pitch: randomRange(30, 70),
        decay: randomRange(30, 70),
        reverb: randomRange(20, 50),
        pattern: randomChoice(['sparse', 'regular', 'busy'] as const),
      },
    }),

  reset: () => set(DEFAULT_STATE),
}));
