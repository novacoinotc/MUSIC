/**
 * Composer Brain Types - GPT-5.2 Integration
 * Defines the structured output from the AI composer
 */

import { z } from 'zod';
import type {
  KickParams,
  BassParams,
  MelodyParams,
  HiHatParams,
  PadParams,
  ArpParams,
  PluckParams,
  StabParams,
  PianoParams,
  StringsParams,
  AcidParams,
  PercParams,
  VocalParams,
} from './index';

// Layer types that can be enabled per section
export const LayerSchema = z.enum([
  'kick', 'bass', 'hihat', 'openhat', 'perc', 'pad', 'melody',
  'arp', 'pluck', 'stab', 'piano', 'strings', 'acid', 'vocal', 'fx'
]);
export type Layer = z.infer<typeof LayerSchema>;

// Section focus types
export const SectionFocusSchema = z.enum([
  'space', 'groove', 'tension', 'emotion', 'release'
]);
export type SectionFocus = z.infer<typeof SectionFocusSchema>;

// Section type
export const SectionTypeSchema = z.enum([
  'intro', 'buildup', 'breakdown', 'drop', 'outro'
]);
export type ComposerSectionType = z.infer<typeof SectionTypeSchema>;

// Style hints
export const StyleHintSchema = z.enum([
  'afterlife_kast', 'afterlife_anyma', 'melodic_underground'
]);
export type StyleHint = z.infer<typeof StyleHintSchema>;

// Bass movement type
export const BassMovementSchema = z.enum(['filter_only', 'note_sparse']);
export type BassMovement = z.infer<typeof BassMovementSchema>;

// Global rules schema
export const GlobalRulesSchema = z.object({
  max_simultaneous_layers: z.number().min(2).max(5),
  high_end_limit_hz: z.number().min(9000).max(14000),
  silence_before_drop: z.boolean(),
  melody_density_cap: z.number().min(0).max(100),
  arp_density_cap: z.number().min(0).max(100),
  bass_movement: BassMovementSchema,
});
export type GlobalRules = z.infer<typeof GlobalRulesSchema>;

// Section schema
export const ComposerSectionSchema = z.object({
  type: SectionTypeSchema,
  bars: z.number().min(2).max(64),
  focus: SectionFocusSchema,
  allowed_layers: z.array(LayerSchema),
});
export type ComposerSection = z.infer<typeof ComposerSectionSchema>;

// Partial instrument params schemas (all fields optional)
export const PartialKickParamsSchema = z.object({
  style: z.string().optional(),
  punch: z.number().optional(),
  sub: z.number().optional(),
  decay: z.number().optional(),
  pitch: z.number().optional(),
  drive: z.number().optional(),
  tone: z.number().optional(),
}).partial();

export const PartialBassParamsSchema = z.object({
  type: z.string().optional(),
  synthType: z.string().optional(),
  cutoff: z.number().optional(),
  resonance: z.number().optional(),
  attack: z.number().optional(),
  decay: z.number().optional(),
  sustain: z.number().optional(),
  release: z.number().optional(),
  octave: z.number().optional(),
  glide: z.number().optional(),
  distortion: z.number().optional(),
  subMix: z.number().optional(),
}).partial();

export const PartialMelodyParamsSchema = z.object({
  octave: z.number().optional(),
  density: z.number().optional(),
  variation: z.number().optional(),
  arpSpeed: z.number().optional(),
  synthType: z.string().optional(),
  attack: z.number().optional(),
  release: z.number().optional(),
  filterCutoff: z.number().optional(),
  reverbMix: z.number().optional(),
  delayMix: z.number().optional(),
}).partial();

export const PartialHiHatParamsSchema = z.object({
  decay: z.number().optional(),
  pitch: z.number().optional(),
  pattern: z.string().optional(),
  velocity: z.number().optional(),
  openRatio: z.number().optional(),
}).partial();

export const PartialPadParamsSchema = z.object({
  synthType: z.string().optional(),
  attack: z.number().optional(),
  release: z.number().optional(),
  filterCutoff: z.number().optional(),
  lfoRate: z.number().optional(),
  lfoDepth: z.number().optional(),
  reverbMix: z.number().optional(),
  chord: z.string().optional(),
  brightness: z.number().optional(),
  movement: z.number().optional(),
}).partial();

export const PartialArpParamsSchema = z.object({
  pattern: z.string().optional(),
  speed: z.number().optional(),
  octaves: z.number().optional(),
  gate: z.number().optional(),
  swing: z.number().optional(),
}).partial();

export const PartialPluckParamsSchema = z.object({
  synthType: z.string().optional(),
  decay: z.number().optional(),
  brightness: z.number().optional(),
  resonance: z.number().optional(),
  reverbMix: z.number().optional(),
  delayMix: z.number().optional(),
  octave: z.number().optional(),
}).partial();

export const PartialStabParamsSchema = z.object({
  synthType: z.string().optional(),
  attack: z.number().optional(),
  release: z.number().optional(),
  filterCutoff: z.number().optional(),
  voices: z.number().optional(),
  detune: z.number().optional(),
  reverbMix: z.number().optional(),
}).partial();

export const PartialPianoParamsSchema = z.object({
  brightness: z.number().optional(),
  reverb: z.number().optional(),
  velocity: z.number().optional(),
  octave: z.number().optional(),
}).partial();

export const PartialStringsParamsSchema = z.object({
  attack: z.number().optional(),
  release: z.number().optional(),
  brightness: z.number().optional(),
  ensemble: z.number().optional(),
  reverbMix: z.number().optional(),
}).partial();

export const PartialAcidParamsSchema = z.object({
  cutoff: z.number().optional(),
  resonance: z.number().optional(),
  envMod: z.number().optional(),
  decay: z.number().optional(),
  accent: z.number().optional(),
  slide: z.number().optional(),
}).partial();

export const PartialPercParamsSchema = z.object({
  type: z.string().optional(),
  pitch: z.number().optional(),
  decay: z.number().optional(),
  reverb: z.number().optional(),
  pattern: z.string().optional(),
}).partial();

export const PartialVocalParamsSchema = z.object({
  type: z.string().optional(),
  gender: z.string().optional(),
  brightness: z.number().optional(),
  attack: z.number().optional(),
  release: z.number().optional(),
  reverbMix: z.number().optional(),
  mix: z.number().optional(),
}).partial();

// Instrument targets schema - permissive to accept varied GPT output
// Values can be strings or numbers, we'll coerce them in applyComposerPlan
export const InstrumentTargetsSchema = z.record(z.string(), z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])));
export type InstrumentTargets = z.infer<typeof InstrumentTargetsSchema>;

// Main ComposerPlan schema
export const ComposerPlanSchema = z.object({
  style: z.string(),
  bpm: z.number().min(118).max(128),
  key: z.string(),
  scale: z.string(),
  groove: z.string(),
  energy_curve: z.array(z.number().min(0).max(10)),
  global_rules: GlobalRulesSchema,
  sections: z.array(ComposerSectionSchema),
  instrument_targets: InstrumentTargetsSchema,
});
export type ComposerPlan = z.infer<typeof ComposerPlanSchema>;

// Request body schema
export const ComposeRequestSchema = z.object({
  prompt: z.string().min(1).max(500),
  seed: z.number().optional(),
  durationBars: z.number().min(16).max(256).default(128),
  bpmHint: z.number().min(100).max(140).optional(),
  styleHint: StyleHintSchema.optional(),
});
export type ComposeRequest = z.infer<typeof ComposeRequestSchema>;

// Response type
export interface ComposeResponse {
  success: boolean;
  plan?: ComposerPlan;
  error?: string;
}
