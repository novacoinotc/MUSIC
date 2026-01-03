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
  VocalParams,
  SectionConfig,
  Scale,
  TechnoStyle,
  GrooveType,
  KickStyle,
  BassType,
  ChordProgression,
} from '@/types';
import { RANDOM_POOLS, DEFAULT_SECTIONS, DEFAULT_VOCAL } from '@/types';

// ========== KA:ST / AFTERLIFE DARK SOUND DESIGN ==========
// Reglas estrictas para sonido oscuro, hipnótico, emocional
// - BPM: 122-124 (rango muy cerrado para cohesión)
// - Keys: A, D, F# (preferidos), C, G, E (secundarios)
// - Scales: minor, phrygian, harmonicMinor SOLO
// - Máximo 4-6 capas por sección

const KAST_KEYS = ['A', 'D', 'F#', 'C', 'G', 'E'];
const KAST_SCALES: Scale[] = ['minor', 'phrygian', 'harmonicMinor'];
const KAST_BPM_MIN = 122;
const KAST_BPM_MAX = 124;

// Chord progressions pool - DARK and HYPNOTIC only
const CHORD_PROGRESSIONS: ChordProgression[] = [
  'i-VI-III-VII',   // Classic emotional minor
  'i-VII-VI-VII',   // Dark repetitive
  'i-iv',           // Minimal hypnotic (2 chords)
  'i-VI-iv-VII',    // Tale Of Us style
  'i-III-VII-VI',   // Afterlife style
  'i-VII-i-VI',     // Hypnotic minimal
  'i-VI',           // Super minimal (2 chords)
  'i-iv-VII-III',   // Dark melodic
];

// ============ PRODUCER BLUEPRINT TYPES ============
// High-level musical decisions from AI producer, not DSP parameters

export interface SectionBlueprint {
  type: 'intro' | 'buildup' | 'tension' | 'drop' | 'breakdown' | 'release' | 'outro';
  bars: number;
  energy: number; // 1-10
  purpose: string;
  active_instruments: string[];
  tension_source: string;
  release_moment: string;
}

export interface InstrumentRole {
  role: 'protagonist' | 'texture' | 'rhythm' | 'accent' | 'atmosphere';
  character: string;
  presence: 'dominant' | 'supportive' | 'subtle';
  entry_section: number;
  exit_section: number;
}

export interface VocalRole {
  enabled: boolean;
  type: 'ooh' | 'aah' | 'choir';
  character: string;
  sections: number[]; // Which section indices have vocals
}

export interface GoosebumpsConfig {
  enabled: boolean;
  micro_timing_ms: number; // 8-25ms humanization
  exotic_fx_type: 'metal_scrape' | 'breath' | 'reverse_impact' | 'ritual_hit' | 'none';
  exotic_fx_placement: number[]; // Section indices
  tension_notes_enabled: boolean;
}

export interface ProducerBlueprint {
  bpm: number;
  key: string;
  scale: string;
  vibe: string[];
  narrative: string;
  energy_curve: number[];
  sections: SectionBlueprint[];
  instruments: {
    kick: InstrumentRole;
    bass: InstrumentRole;
    pad: InstrumentRole;
    lead: InstrumentRole;
    hihat: InstrumentRole;
  };
  // Vocals - CRITICAL: must be present and audible
  vocal?: VocalRole;
  // Goosebumps mode for emotional moments
  goosebumps?: GoosebumpsConfig;
  production_notes: string[];
}

// Legacy blueprint type for backward compatibility
export interface MusicBlueprint {
  bpm: number;
  key: string;
  scale: string;
  vibe: string[];
  structure: Array<{
    type: 'intro' | 'buildup' | 'drop' | 'breakdown' | 'outro';
    bars: number;
    intensity: number;
  }>;
  instruments: Record<string, Record<string, number>>;
  patterns: Record<string, Array<{
    time: string;
    note: string;
    duration: string;
    velocity: number;
  }>>;
}

interface TrackStore extends TrackState {
  // Setters
  setBPM: (bpm: number) => void;
  setKey: (key: string) => void;
  setScale: (scale: Scale) => void;
  setSecondaryScale: (scale: Scale) => void;
  setChordProgression: (prog: ChordProgression) => void;
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
  updateVocal: (params: Partial<VocalParams>) => void;

  // Section management
  updateSection: (index: number, config: Partial<SectionConfig>) => void;
  addSection: (section: SectionConfig) => void;
  removeSection: (index: number) => void;
  reorderSections: (sections: SectionConfig[]) => void;
  setSections: (sections: SectionConfig[]) => void;
  randomizeSections: () => void;

  // AI Composer integration
  applyComposerPlan: (plan: import('@/types/composer').ComposerPlan) => void;

  // AI Blueprint integration (supports both Producer and Legacy formats)
  applyBlueprint: (blueprint: ProducerBlueprint | MusicBlueprint) => void;

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
  bpm: 122,
  key: 'A',
  scale: 'minor',
  secondaryScale: 'phrygian', // Secondary scale for variety
  chordProgression: 'i-VI-III-VII', // Classic emotional progression
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
  vocal: DEFAULT_VOCAL,
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
  setSecondaryScale: (secondaryScale) => set({ secondaryScale }),
  setChordProgression: (chordProgression) => set({ chordProgression }),
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

  updateVocal: (params) =>
    set((state) => ({ vocal: { ...state.vocal, ...params } })),

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

  setSections: (sections) => set({ sections }),

  randomizeSections: () => {
    // ========== KA:ST ARRANGEMENT RULES ==========
    // REGLA: "Menos es más" - Máximo 4-6 elementos por sección
    // REGLA: Pre-drop silence (solo FX/riser antes del drop)
    // REGLA: Breakdown SIN kick
    // REGLA: Estructura 16/32 bars
    // Jerarquía: Intro(3) -> Groove(4) -> Dev(5) -> PRE-DROP(1-2) -> Drop(6) ->
    //            Breakdown(4) -> Build(5) -> PRE-DROP(1-2) -> Drop(6) -> Outro(4)
    const sections: SectionConfig[] = [];

    // ===== INTRO - 16 bars: Pad + Strings + FX (3 elementos) =====
    sections.push({
      type: 'intro',
      bars: 16,
      hasKick: false,
      hasBass: false,
      hasMelody: false,
      hasHihat: false,
      hasPad: true,
      hasPluck: false,
      hasStab: false,
      hasPiano: false,
      hasStrings: true,
      hasAcid: false,
      hasPerc: false,
      hasFx: true,
      hasArp: false,
      hasVocal: false,
      intensity: randomRange(15, 25),
    });

    // ===== GROOVE - 16 bars: Kick + Bass + Hats + Pad (4 elementos) =====
    sections.push({
      type: 'buildup',
      bars: 16,
      hasKick: true,
      hasBass: true,
      hasMelody: false,
      hasHihat: true,
      hasPad: true,
      hasPluck: false,
      hasStab: false,
      hasPiano: false,
      hasStrings: false,
      hasAcid: false,
      hasPerc: false,
      hasFx: false,
      hasArp: false,
      hasVocal: false,
      intensity: randomRange(45, 55),
    });

    // ===== DESARROLLO - 16 bars: Kick + Bass + Hats + Arp + Perc (5 elementos) =====
    sections.push({
      type: 'buildup',
      bars: 16,
      hasKick: true,
      hasBass: true,
      hasMelody: false,
      hasHihat: true,
      hasPad: false,
      hasPluck: false,
      hasStab: false,
      hasPiano: false,
      hasStrings: false,
      hasAcid: false,
      hasPerc: true,
      hasFx: false,
      hasArp: true,
      hasVocal: false,
      intensity: randomRange(60, 70),
    });

    // ===== PRE-DROP 1 - 2 bars: SILENCIO + FX (tensión máxima) =====
    sections.push({
      type: 'buildup',
      bars: 2,
      hasKick: false,   // Sin kick = tensión
      hasBass: false,   // Sin bass = expectativa
      hasMelody: false,
      hasHihat: false,
      hasPad: true,     // Solo pad para mantener armonía
      hasPluck: false,
      hasStab: false,
      hasPiano: false,
      hasStrings: false,
      hasAcid: false,
      hasPerc: false,
      hasFx: true,      // FX/riser para tensión
      hasArp: false,
      hasVocal: false,
      intensity: randomRange(25, 35),
    });

    // ===== DROP 1 - 32 bars: Kick + Bass + Hats + Melody + Arp + Perc (6 elementos) =====
    sections.push({
      type: 'drop',
      bars: 32,
      hasKick: true,
      hasBass: true,
      hasMelody: true,
      hasHihat: true,
      hasPad: false,
      hasPluck: false,
      hasStab: false,
      hasPiano: false,
      hasStrings: false,
      hasAcid: false,
      hasPerc: true,
      hasFx: false,
      hasArp: true,
      hasVocal: false,
      intensity: 95,
    });

    // ===== BREAKDOWN - 16 bars: Pad + Melody + Strings + Vocal (4 elementos, SIN KICK) =====
    sections.push({
      type: 'breakdown',
      bars: 16,
      hasKick: false,   // NUNCA kick en breakdown
      hasBass: false,   // Sin bass = espacio emocional
      hasMelody: true,
      hasHihat: false,
      hasPad: true,
      hasPluck: false,
      hasStab: false,
      hasPiano: false,  // Piano muy ocasional
      hasStrings: true,
      hasAcid: false,
      hasPerc: false,
      hasFx: false,
      hasArp: false,
      hasVocal: true,
      intensity: randomRange(25, 35),
    });

    // ===== BUILD - 16 bars: Kick + Bass + Hats + Arp + FX (5 elementos) =====
    sections.push({
      type: 'buildup',
      bars: 16,
      hasKick: true,
      hasBass: true,
      hasMelody: false,
      hasHihat: true,
      hasPad: false,
      hasPluck: false,
      hasStab: false,
      hasPiano: false,
      hasStrings: false,
      hasAcid: false,
      hasPerc: false,
      hasFx: true,
      hasArp: true,
      hasVocal: false,
      intensity: randomRange(70, 80),
    });

    // ===== PRE-DROP 2 - 2 bars: SILENCIO + FX =====
    sections.push({
      type: 'buildup',
      bars: 2,
      hasKick: false,
      hasBass: false,
      hasMelody: false,
      hasHihat: false,
      hasPad: true,
      hasPluck: false,
      hasStab: false,
      hasPiano: false,
      hasStrings: false,
      hasAcid: false,
      hasPerc: false,
      hasFx: true,
      hasArp: false,
      hasVocal: false,
      intensity: randomRange(25, 35),
    });

    // ===== DROP 2 - 32 bars: Kick + Bass + Hats + Melody + Pluck + Perc (6 elementos) =====
    sections.push({
      type: 'drop',
      bars: 32,
      hasKick: true,
      hasBass: true,
      hasMelody: true,
      hasHihat: true,
      hasPad: false,
      hasPluck: true,   // Variación: pluck en lugar de arp
      hasStab: false,
      hasPiano: false,
      hasStrings: false,
      hasAcid: false,
      hasPerc: true,
      hasFx: false,
      hasArp: false,    // Sin arp para diferenciar del drop 1
      hasVocal: false,
      intensity: 100,
    });

    // ===== OUTRO - 16 bars: Kick + Pad + Strings (3 elementos) =====
    sections.push({
      type: 'outro',
      bars: 16,
      hasKick: true,
      hasBass: false,
      hasMelody: false,
      hasHihat: false,  // Sin hihats en outro = más cinematográfico
      hasPad: true,
      hasPluck: false,
      hasStab: false,
      hasPiano: false,
      hasStrings: true,
      hasAcid: false,
      hasPerc: false,
      hasFx: false,
      hasArp: false,
      hasVocal: false,
      intensity: randomRange(20, 30),
    });

    set({ sections });
  },

  // KA:ST / AFTERLIFE DARK randomization
  // Todas las generaciones siguen el ADN sonoro Ka:st
  randomizeAll: () => {
    // ESTILO: Siempre melodic/hypnotic para Ka:st
    const style = randomChoice(['melodic', 'hypnotic'] as TechnoStyle[]);
    // GROOVE: straight o shuffle (nunca broken para mantener hipnosis)
    const groove = randomChoice(['straight', 'shuffle'] as GrooveType[]);
    // KEY: Solo keys oscuras/emocionales
    const key = randomChoice(KAST_KEYS);
    // SCALE: Solo minor, phrygian, harmonicMinor
    const scale = randomChoice(KAST_SCALES);
    // Secondary scale for breakdowns (diferente de primary)
    const availableSecondaryScales = KAST_SCALES.filter(s => s !== scale);
    const secondaryScale = randomChoice(availableSecondaryScales);
    const chordProgression = randomChoice(CHORD_PROGRESSIONS);
    // BPM: Rango cerrado 122-124
    const bpm = randomRange(KAST_BPM_MIN, KAST_BPM_MAX);

    // Randomize sections too
    get().randomizeSections();

    // ========== KA:ST SOUND DESIGN PARAMETERS ==========
    // Todo más oscuro, más cálido, menos brillo
    set({
      bpm,
      key,
      scale,
      secondaryScale,
      chordProgression,
      style,
      groove,
      // KICK: Cálido, con mucho sub, poco click
      kick: {
        style: randomChoice(['punchy', 'deep', 'warm'] as KickStyle[]),
        punch: randomRange(50, 70),      // Moderado, no agresivo
        sub: randomRange(70, 95),        // MUCHO sub - protagonista
        decay: randomRange(40, 60),      // Tail medio
        pitch: randomRange(45, 55),      // Pitch bajo
        drive: randomRange(10, 30),      // Poco drive, limpio
        tone: randomRange(30, 50),       // Tono oscuro
      },
      // BASS: Protagonista, profundo, cálido
      bass: {
        type: randomChoice(['sub', 'deep'] as BassType[]),
        synthType: randomChoice(['sine', 'triangle'] as const), // Solo formas suaves
        cutoff: randomRange(300, 600),   // BAJO - oscuro
        resonance: randomRange(30, 50),  // Resonancia moderada
        attack: randomRange(5, 20),
        decay: randomRange(150, 350),
        sustain: randomRange(50, 70),
        release: randomRange(100, 250),
        octave: randomRange(-2, -1),     // Octavas bajas
        glide: randomRange(20, 50),      // Glide para movimiento
        distortion: randomRange(0, 20),  // Mínima distorsión
        subMix: randomRange(60, 85),     // MUCHO sub
      },
      // MELODY: Sutil, etérea, no protagonista
      melody: {
        scale,
        rootNote: key,
        octave: randomRange(4, 5),
        density: randomRange(20, 45),    // POCA densidad - espacio
        variation: randomRange(10, 30),  // Poca variación - hipnótico
        arpSpeed: randomRange(30, 50),   // Velocidad moderada
        synthType: randomChoice(['sine', 'triangle'] as const), // Suave
        attack: randomRange(30, 100),    // Ataque suave
        release: randomRange(400, 1000), // Release largo
        filterCutoff: randomRange(1200, 2500), // BAJO - oscuro
        reverbMix: randomRange(45, 70),  // Mucho reverb
        delayMix: randomRange(30, 55),   // Delay para espacio
      },
      // HIHAT: Sutil, bajo volumen
      hihat: {
        decay: randomRange(20, 40),
        pitch: randomRange(40, 60),      // No muy brillante
        pattern: randomChoice(['straight', 'minimal'] as const), // Simple
        velocity: randomRange(40, 60),   // BAJO volumen
        openRatio: randomRange(10, 30),  // Pocos open hats
      },
      // PAD: Atmosférica, oscura, envolvente
      pad: {
        synthType: randomChoice(['sine', 'triangle'] as const),
        attack: randomRange(800, 1500),  // Ataque MUY lento
        release: randomRange(1500, 3000), // Release MUY largo
        filterCutoff: randomRange(800, 1800), // OSCURO
        lfoRate: Math.random() * 1.5,    // LFO lento
        lfoDepth: randomRange(15, 40),
        reverbMix: randomRange(55, 80),  // Mucho reverb
        chord: randomChoice(['minor', 'minor7', 'sus2'] as const), // Solo oscuros
        brightness: randomRange(25, 45), // BAJO brillo
        movement: randomRange(25, 50),
      },
      // PLUCK: Sutil, mucho espacio
      pluck: {
        synthType: randomChoice(['triangle', 'sine'] as const),
        decay: randomRange(200, 450),
        brightness: randomRange(35, 55), // OSCURO
        resonance: randomRange(35, 55),
        reverbMix: randomRange(50, 75),  // Mucho reverb
        delayMix: randomRange(40, 65),   // Mucho delay
        octave: randomRange(4, 5),
      },
      // STAB: Ocasional, no brillante
      stab: {
        synthType: 'sawtooth' as const,
        attack: randomRange(5, 20),
        release: randomRange(150, 350),
        filterCutoff: randomRange(1500, 3000), // NO muy brillante
        voices: randomRange(3, 5),
        detune: randomRange(15, 30),
        reverbMix: randomRange(35, 55),
      },
      // PIANO: MUY sutil, solo breakdowns
      piano: {
        brightness: randomRange(30, 50), // OSCURO
        reverb: randomRange(50, 70),     // Mucho reverb
        velocity: randomRange(35, 55),   // BAJO volumen
        octave: randomRange(3, 4),
      },
      // STRINGS: Atmosféricas, envolventes
      strings: {
        attack: randomRange(1000, 2000), // Muy lento
        release: randomRange(1500, 3000),
        brightness: randomRange(30, 50), // OSCURO
        ensemble: randomRange(50, 75),
        reverbMix: randomRange(60, 85),
      },
      // ACID: Solo ocasionalmente, filtrado bajo
      acid: {
        cutoff: randomRange(250, 500),   // MUY bajo
        resonance: randomRange(55, 80),
        envMod: randomRange(40, 70),
        decay: randomRange(150, 350),
        accent: randomRange(40, 65),
        slide: randomRange(25, 50),
      },
      // PERC: Solo clap/rim, sutil
      perc: {
        type: randomChoice(['clap', 'rim'] as const), // No shaker ni snare
        pitch: randomRange(40, 60),
        decay: randomRange(35, 55),
        reverb: randomRange(35, 55),
        pattern: randomChoice(['sparse', 'regular'] as const), // Nunca busy
      },
      // ARP: Hipnótico, simple
      arp: {
        pattern: randomChoice(['up', 'down', 'order'] as const), // Simple
        speed: randomRange(35, 55),
        octaves: randomRange(1, 2),      // Max 2 octavas
        gate: randomRange(40, 65),
        swing: randomRange(0, 20),       // Poco swing
      },
      // VOCAL: Etérea, ooh/aah, mucho espacio
      vocal: {
        type: randomChoice(['ooh', 'aah', 'choir'] as const), // No eeh (muy brillante)
        gender: randomChoice(['female', 'both'] as const), // Preferir femenino
        brightness: randomRange(30, 50), // OSCURO
        attack: randomRange(350, 700),   // Lento
        release: randomRange(800, 1500), // Largo
        reverbMix: randomRange(55, 80),  // MUCHO reverb
        mix: randomRange(45, 65),
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

  // Apply AI Composer Plan - converts ComposerPlan to store state
  applyComposerPlan: (plan) => {
    // Helper to map allowed_layers to section config flags
    const mapLayersToFlags = (layers: string[]) => ({
      hasKick: layers.includes('kick'),
      hasBass: layers.includes('bass'),
      hasMelody: layers.includes('melody'),
      hasHihat: layers.includes('hihat'),
      hasPad: layers.includes('pad'),
      hasPluck: layers.includes('pluck'),
      hasStab: layers.includes('stab'),
      hasPiano: layers.includes('piano'),
      hasStrings: layers.includes('strings'),
      hasAcid: layers.includes('acid'),
      hasPerc: layers.includes('perc'),
      hasFx: layers.includes('fx'),
      hasArp: layers.includes('arp'),
      hasVocal: layers.includes('vocal'),
    });

    // Map focus to intensity
    const focusToIntensity: Record<string, number> = {
      space: 25,
      groove: 55,
      tension: 70,
      emotion: 40,
      release: 90,
    };

    // Convert sections from ComposerPlan to SectionConfig[]
    const sections: SectionConfig[] = plan.sections.map((section, index) => ({
      type: section.type,
      bars: section.bars,
      intensity: plan.energy_curve[index]
        ? plan.energy_curve[index] * 10
        : focusToIntensity[section.focus] || 50,
      ...mapLayersToFlags(section.allowed_layers),
    }));

    // Map scale string to Scale type
    const mapScale = (s: string): Scale => {
      const validScales: Scale[] = [
        'minor', 'major', 'phrygian', 'harmonicMinor', 'melodicMinor',
        'dorian', 'locrian', 'lydian', 'mixolydian', 'pentatonicMinor',
        'pentatonicMajor', 'blues', 'wholeNote', 'chromatic', 'arabic', 'japanese',
      ];
      return validScales.includes(s as Scale) ? (s as Scale) : 'minor';
    };

    // Map groove string to GrooveType
    const mapGroove = (g: string): GrooveType => {
      const validGrooves: GrooveType[] = ['straight', 'shuffle', 'syncopated', 'broken', 'halftime'];
      return validGrooves.includes(g as GrooveType) ? (g as GrooveType) : 'straight';
    };

    // Map style string to TechnoStyle
    const mapStyle = (s: string): TechnoStyle => {
      if (s.includes('kast') || s.includes('underground')) return 'melodic';
      if (s.includes('anyma')) return 'progressive';
      return 'melodic';
    };

    // Apply all settings
    set({
      bpm: plan.bpm,
      key: plan.key,
      scale: mapScale(plan.scale),
      secondaryScale: plan.scale === 'minor' ? 'phrygian' : 'minor',
      style: mapStyle(plan.style),
      groove: mapGroove(plan.groove),
      sections,
    });

    // Apply instrument targets if provided
    // Use type assertions since the AI output is validated but types are partial
    const targets = plan.instrument_targets;

    if (targets.kick && Object.keys(targets.kick).length > 0) {
      set((state) => ({ kick: { ...state.kick, ...(targets.kick as Partial<KickParams>) } }));
    }
    if (targets.bass && Object.keys(targets.bass).length > 0) {
      set((state) => ({ bass: { ...state.bass, ...(targets.bass as Partial<BassParams>) } }));
    }
    if (targets.melody && Object.keys(targets.melody).length > 0) {
      set((state) => ({ melody: { ...state.melody, ...(targets.melody as Partial<MelodyParams>) } }));
    }
    if (targets.hihat && Object.keys(targets.hihat).length > 0) {
      set((state) => ({ hihat: { ...state.hihat, ...(targets.hihat as Partial<HiHatParams>) } }));
    }
    if (targets.pad && Object.keys(targets.pad).length > 0) {
      set((state) => ({ pad: { ...state.pad, ...(targets.pad as Partial<PadParams>) } }));
    }
    if (targets.arp && Object.keys(targets.arp).length > 0) {
      set((state) => ({ arp: { ...state.arp, ...(targets.arp as Partial<ArpParams>) } }));
    }
    if (targets.pluck && Object.keys(targets.pluck).length > 0) {
      set((state) => ({ pluck: { ...state.pluck, ...(targets.pluck as Partial<PluckParams>) } }));
    }
    if (targets.stab && Object.keys(targets.stab).length > 0) {
      set((state) => ({ stab: { ...state.stab, ...(targets.stab as Partial<StabParams>) } }));
    }
    if (targets.piano && Object.keys(targets.piano).length > 0) {
      set((state) => ({ piano: { ...state.piano, ...(targets.piano as Partial<PianoParams>) } }));
    }
    if (targets.strings && Object.keys(targets.strings).length > 0) {
      set((state) => ({ strings: { ...state.strings, ...(targets.strings as Partial<StringsParams>) } }));
    }
    if (targets.acid && Object.keys(targets.acid).length > 0) {
      set((state) => ({ acid: { ...state.acid, ...(targets.acid as Partial<AcidParams>) } }));
    }
    if (targets.perc && Object.keys(targets.perc).length > 0) {
      set((state) => ({ perc: { ...state.perc, ...(targets.perc as Partial<PercParams>) } }));
    }
    if (targets.vocal && Object.keys(targets.vocal).length > 0) {
      set((state) => ({ vocal: { ...state.vocal, ...(targets.vocal as Partial<VocalParams>) } }));
    }
  },

  // ============ APPLY PRODUCER BLUEPRINT ============
  // Translates high-level producer decisions into concrete DSP parameters
  // The AI thinks like a producer; this function is the "sound engineer"
  applyBlueprint: (blueprint: ProducerBlueprint | MusicBlueprint) => {
    // Detect if this is the new ProducerBlueprint format
    const isProducerFormat = 'narrative' in blueprint && 'energy_curve' in blueprint;

    if (isProducerFormat) {
      const pb = blueprint as ProducerBlueprint;
      console.log('[TrackStore] Applying Producer Blueprint:', pb.narrative);

      // ===== MAP SCALE =====
      const mapScale = (s: string): Scale => {
        const validScales: Scale[] = [
          'minor', 'major', 'phrygian', 'harmonicMinor', 'melodicMinor',
          'dorian', 'locrian', 'lydian', 'mixolydian', 'pentatonicMinor',
          'pentatonicMajor', 'blues', 'wholeNote', 'chromatic', 'arabic', 'japanese',
        ];
        return validScales.includes(s as Scale) ? (s as Scale) : 'minor';
      };

      // ===== MAP VIBE TO STYLE =====
      const mapVibeToStyle = (vibes: string[]): TechnoStyle => {
        const vibeStr = vibes.join(' ').toLowerCase();
        if (vibeStr.includes('dark') || vibeStr.includes('deep')) return 'dark';
        if (vibeStr.includes('hypnotic') || vibeStr.includes('repetitive')) return 'hypnotic';
        if (vibeStr.includes('melodic') || vibeStr.includes('emotional')) return 'melodic';
        if (vibeStr.includes('progressive') || vibeStr.includes('journey')) return 'progressive';
        if (vibeStr.includes('minimal')) return 'minimal';
        return 'melodic';
      };

      // ===== TRANSLATE CHARACTER TO DSP =====
      // This is the "sound engineer" interpreting the producer's vision
      const characterToDSP = (character: string, presence: string) => {
        const charLower = character.toLowerCase();
        const isDominant = presence === 'dominant';
        const isSubtle = presence === 'subtle';

        // Base values
        let brightness = 50;
        let warmth = 50;
        let space = 50;
        let attack = 50;
        let decay = 50;

        // Character interpretation
        if (charLower.includes('dark')) { brightness = 25; warmth = 70; }
        if (charLower.includes('warm')) { brightness = 35; warmth = 80; }
        if (charLower.includes('bright')) { brightness = 70; warmth = 40; }
        if (charLower.includes('ethereal')) { space = 80; attack = 70; brightness = 40; }
        if (charLower.includes('hypnotic')) { decay = 60; space = 50; }
        if (charLower.includes('punchy')) { attack = 20; decay = 40; }
        if (charLower.includes('deep')) { brightness = 30; warmth = 75; }
        if (charLower.includes('subtle') || charLower.includes('ghostly')) { brightness = 35; space = 70; }
        if (charLower.includes('emotive')) { space = 60; decay = 65; }
        if (charLower.includes('restrained')) { brightness = 40; attack = 60; }
        if (charLower.includes('distant')) { space = 85; brightness = 30; }

        // Presence adjustments
        if (isDominant) { brightness += 10; warmth += 5; }
        if (isSubtle) { brightness -= 15; space += 10; }

        return { brightness, warmth, space, attack, decay };
      };

      // ===== DETERMINE ACTIVE INSTRUMENTS PER SECTION =====
      const getInstrumentFlags = (
        sectionIndex: number,
        activeInstruments: string[],
        instruments: ProducerBlueprint['instruments']
      ) => {
        // Check if instrument should be active based on entry/exit and active_instruments
        const isActive = (name: string, role: InstrumentRole) => {
          const inRange = sectionIndex >= role.entry_section &&
            (role.exit_section === -1 || sectionIndex <= role.exit_section);
          const inList = activeInstruments.some(i =>
            i.toLowerCase().includes(name) || name.includes(i.toLowerCase())
          );
          return inRange && inList;
        };

        return {
          hasKick: isActive('kick', instruments.kick),
          hasBass: isActive('bass', instruments.bass),
          hasMelody: isActive('lead', instruments.lead),
          hasHihat: isActive('hihat', instruments.hihat),
          hasPad: isActive('pad', instruments.pad),
          hasPluck: false,
          hasStab: false,
          hasPiano: false,
          hasStrings: activeInstruments.some(i => i.toLowerCase().includes('string')),
          hasAcid: false,
          hasPerc: activeInstruments.some(i => i.toLowerCase().includes('perc') || i.toLowerCase().includes('clap')),
          hasFx: activeInstruments.some(i => i.toLowerCase().includes('fx') || i.toLowerCase().includes('riser')),
          hasArp: activeInstruments.some(i => i.toLowerCase().includes('arp')),
          hasVocal: activeInstruments.some(i => i.toLowerCase().includes('vocal')),
        };
      };

      // ===== MAP SECTION TYPE =====
      const mapSectionType = (type: string): 'intro' | 'buildup' | 'drop' | 'breakdown' | 'outro' => {
        if (type === 'tension' || type === 'release') return 'buildup';
        if (['intro', 'buildup', 'drop', 'breakdown', 'outro'].includes(type)) {
          return type as 'intro' | 'buildup' | 'drop' | 'breakdown' | 'outro';
        }
        return 'buildup';
      };

      // ===== BUILD SECTIONS =====
      const sections: SectionConfig[] = pb.sections.map((section, index) => ({
        type: mapSectionType(section.type),
        bars: section.bars,
        intensity: section.energy * 10, // Convert 1-10 to 10-100
        ...getInstrumentFlags(index, section.active_instruments, pb.instruments),
      }));

      // ===== APPLY GLOBAL SETTINGS =====
      set({
        bpm: pb.bpm,
        key: pb.key,
        scale: mapScale(pb.scale),
        secondaryScale: pb.scale === 'minor' ? 'phrygian' : 'minor',
        style: mapVibeToStyle(pb.vibe),
        groove: 'straight' as GrooveType,
        sections,
      });

      // ===== TRANSLATE INSTRUMENT ROLES TO DSP =====

      // KICK - interpret character
      const kickDSP = characterToDSP(pb.instruments.kick.character, pb.instruments.kick.presence);
      set((state) => ({
        kick: {
          ...state.kick,
          punch: Math.round(100 - kickDSP.brightness), // Dark = less punch click
          sub: Math.round(kickDSP.warmth),
          decay: Math.round(kickDSP.decay),
          tone: Math.round(50 - (kickDSP.brightness - 50) * 0.5), // Inverse relationship
        },
      }));

      // BASS - protagonist, interpret character
      const bassDSP = characterToDSP(pb.instruments.bass.character, pb.instruments.bass.presence);
      set((state) => ({
        bass: {
          ...state.bass,
          cutoff: Math.round(200 + bassDSP.brightness * 4), // 200-600 range
          resonance: Math.round(30 + bassDSP.warmth * 0.3),
          distortion: Math.round(bassDSP.warmth * 0.2),
          subMix: Math.round(50 + bassDSP.warmth * 0.4),
        },
      }));

      // PAD - texture/atmosphere
      const padDSP = characterToDSP(pb.instruments.pad.character, pb.instruments.pad.presence);
      set((state) => ({
        pad: {
          ...state.pad,
          filterCutoff: Math.round(800 + padDSP.brightness * 10),
          attack: Math.round(500 + padDSP.attack * 10),
          release: Math.round(1000 + padDSP.space * 20),
          reverbMix: Math.round(40 + padDSP.space * 0.5),
          brightness: Math.round(padDSP.brightness),
        },
      }));

      // LEAD/MELODY - emotive, restrained
      const leadDSP = characterToDSP(pb.instruments.lead.character, pb.instruments.lead.presence);
      set((state) => ({
        melody: {
          ...state.melody,
          filterCutoff: Math.round(1200 + leadDSP.brightness * 15),
          attack: Math.round(leadDSP.attack * 0.5),
          release: Math.round(300 + leadDSP.decay * 5),
          reverbMix: Math.round(35 + leadDSP.space * 0.4),
          delayMix: Math.round(25 + leadDSP.space * 0.3),
          density: Math.round(20 + (100 - leadDSP.space) * 0.3), // More space = less density
        },
      }));

      // HIHAT - subtle, ghostly
      const hihatDSP = characterToDSP(pb.instruments.hihat.character, pb.instruments.hihat.presence);
      set((state) => ({
        hihat: {
          ...state.hihat,
          decay: Math.round(20 + hihatDSP.decay * 0.3),
          pitch: Math.round(40 + hihatDSP.brightness * 0.3),
          velocity: Math.round(40 + (100 - hihatDSP.space) * 0.3), // Subtle = lower velocity
        },
      }));

      console.log('[TrackStore] Producer Blueprint applied:', {
        bpm: pb.bpm,
        key: pb.key,
        scale: pb.scale,
        narrative: pb.narrative,
        vibe: pb.vibe,
        sections: sections.length,
        energy_curve: pb.energy_curve,
        sectionsDetail: sections.map((s, i) => ({
          index: i,
          type: s.type,
          bars: s.bars,
          energy: pb.sections[i].energy,
          hasKick: s.hasKick,
          hasBass: s.hasBass,
          hasMelody: s.hasMelody,
          hasPad: s.hasPad,
          hasHihat: s.hasHihat,
          purpose: pb.sections[i].purpose,
        })),
        instrumentRoles: {
          kick: pb.instruments.kick.role,
          bass: pb.instruments.bass.role,
          pad: pb.instruments.pad.role,
          lead: pb.instruments.lead.role,
          hihat: pb.instruments.hihat.role,
        },
        production_notes: pb.production_notes,
      });

      return;
    }

    // ===== LEGACY BLUEPRINT FORMAT (backward compatibility) =====
    const legacyBlueprint = blueprint as MusicBlueprint;

    const mapScale = (s: string): Scale => {
      const validScales: Scale[] = [
        'minor', 'major', 'phrygian', 'harmonicMinor', 'melodicMinor',
        'dorian', 'locrian', 'lydian', 'mixolydian', 'pentatonicMinor',
        'pentatonicMajor', 'blues', 'wholeNote', 'chromatic', 'arabic', 'japanese',
      ];
      return validScales.includes(s as Scale) ? (s as Scale) : 'minor';
    };

    const mapVibeToStyle = (vibes: string[]): TechnoStyle => {
      const vibeStr = vibes.join(' ').toLowerCase();
      if (vibeStr.includes('dark')) return 'dark';
      if (vibeStr.includes('hypnotic')) return 'hypnotic';
      if (vibeStr.includes('melodic')) return 'melodic';
      return 'melodic';
    };

    const getActiveInstruments = (intensity: number, sectionType: string) => ({
      hasKick: intensity >= 4 && sectionType !== 'breakdown',
      hasBass: intensity >= 4 && sectionType !== 'breakdown',
      hasMelody: intensity >= 6 || sectionType === 'breakdown',
      hasHihat: intensity >= 5 && sectionType !== 'intro' && sectionType !== 'breakdown',
      hasPad: intensity <= 6 || sectionType === 'intro' || sectionType === 'breakdown',
      hasPluck: intensity >= 7 && sectionType === 'drop',
      hasStab: false,
      hasPiano: sectionType === 'breakdown',
      hasStrings: sectionType === 'intro' || sectionType === 'breakdown' || sectionType === 'outro',
      hasAcid: false,
      hasPerc: intensity >= 6,
      hasFx: sectionType === 'buildup' || intensity <= 3,
      hasArp: intensity >= 6 && intensity <= 8,
      hasVocal: sectionType === 'breakdown',
    });

    const sections: SectionConfig[] = legacyBlueprint.structure.map((section) => ({
      type: section.type,
      bars: section.bars,
      intensity: section.intensity * 10,
      ...getActiveInstruments(section.intensity, section.type),
    }));

    set({
      bpm: legacyBlueprint.bpm,
      key: legacyBlueprint.key,
      scale: mapScale(legacyBlueprint.scale),
      style: mapVibeToStyle(legacyBlueprint.vibe),
      sections,
    });

    console.log('[TrackStore] Legacy blueprint applied:', {
      bpm: legacyBlueprint.bpm,
      key: legacyBlueprint.key,
      sections: sections.length,
    });
  },

  reset: () => set(DEFAULT_STATE),
}));
