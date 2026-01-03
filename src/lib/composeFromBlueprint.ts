/**
 * Compose From Blueprint - Engine for translating AI blueprints to Tone.js
 *
 * This module bridges the gap between high-level producer decisions
 * and actual DSP parameters for the synthesis engine.
 */

import { useTrackStore, type ProducerBlueprint } from '@/stores/trackStore';
import type {
  SectionConfig,
  Scale,
  TechnoStyle,
  GrooveType,
  VocalParams,
} from '@/types';

// ============================================================
// GOOSEBUMPS HELPER FUNCTIONS
// ============================================================

/**
 * Apply micro-timing jitter to humanize timing
 * @param seconds - Original time in seconds
 * @param msRange - Range in milliseconds (e.g., 15 = ±15ms)
 * @param rnd - Random function (0-1)
 */
export function jitter(seconds: number, msRange: number, rnd: () => number): number {
  const offset = (rnd() * 2 - 1) * (msRange / 1000);
  return seconds + offset;
}

/**
 * Calculate micro-timing values based on goosebumps config
 */
export function getMicroTiming(goosebumpsMs: number) {
  return {
    hatsMs: goosebumpsMs * 1.0,  // Full jitter on hats
    percMs: goosebumpsMs * 0.8,  // Slightly less on perc
    bassMs: goosebumpsMs * 0.5,  // Subtle on bass (maintain pocket)
    kickMs: 0,                    // NEVER jitter the kick
  };
}

/**
 * Check if a section should have micro-silence (breath gap before drop)
 */
export function shouldHaveMicroSilence(
  sectionType: string,
  nextSectionType?: string
): boolean {
  // Micro-silence in buildup right before drop
  return sectionType === 'buildup' && nextSectionType === 'drop';
}

/**
 * Generate tension note (controlled dissonance)
 * Returns a note that creates tension (b2 or #4 relative to root)
 */
export function getTensionNote(rootNote: string, scale: string): string {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const rootIndex = notes.indexOf(rootNote);
  if (rootIndex === -1) return rootNote;

  // b2 (minor second) or #4 (tritone) for tension
  const tensionOffsets = [1, 6]; // b2 = +1, #4/b5 = +6
  const offset = tensionOffsets[Math.floor(Math.random() * tensionOffsets.length)];
  const tensionIndex = (rootIndex + offset) % 12;

  return notes[tensionIndex] + '3'; // Low octave for subtlety
}

// ============================================================
// EXOTIC FX PRESETS
// ============================================================

export const EXOTIC_FX_PRESETS = {
  metal_scrape: {
    type: 'noise_resonant',
    filterFreq: 800,
    filterQ: 15,
    decay: 2.5,
    reverb: 0.7,
  },
  breath: {
    type: 'noise_formant',
    filterFreq: 1200,
    filterQ: 3,
    decay: 1.5,
    reverb: 0.6,
  },
  reverse_impact: {
    type: 'reverse_envelope',
    filterFreq: 600,
    filterQ: 2,
    decay: 3.0,
    reverb: 0.8,
  },
  ritual_hit: {
    type: 'low_impact',
    filterFreq: 200,
    filterQ: 1,
    decay: 4.0,
    reverb: 0.5,
  },
};

// ============================================================
// BLUEPRINT TO STORE MAPPING
// ============================================================

/**
 * Apply a ProducerBlueprint to the Zustand store
 * This translates producer decisions into DSP parameters
 */
export function applyBlueprintToStore(blueprint: ProducerBlueprint): void {
  const store = useTrackStore.getState();

  // Map scale string to Scale type
  const mapScale = (s: string): Scale => {
    const validScales: Scale[] = [
      'minor', 'major', 'phrygian', 'harmonicMinor', 'melodicMinor',
      'dorian', 'locrian', 'lydian', 'mixolydian', 'pentatonicMinor',
    ];
    return validScales.includes(s as Scale) ? (s as Scale) : 'minor';
  };

  // Map vibe to style
  const mapVibeToStyle = (vibes: string[]): TechnoStyle => {
    const vibeStr = vibes.join(' ').toLowerCase();
    if (vibeStr.includes('dark') || vibeStr.includes('deep')) return 'dark';
    if (vibeStr.includes('hypnotic')) return 'hypnotic';
    if (vibeStr.includes('melodic')) return 'melodic';
    if (vibeStr.includes('progressive')) return 'progressive';
    if (vibeStr.includes('minimal')) return 'minimal';
    return 'melodic';
  };

  // Map section type
  const mapSectionType = (type: string): 'intro' | 'buildup' | 'drop' | 'breakdown' | 'outro' => {
    if (type === 'tension' || type === 'release') return 'buildup';
    if (['intro', 'buildup', 'drop', 'breakdown', 'outro'].includes(type)) {
      return type as 'intro' | 'buildup' | 'drop' | 'breakdown' | 'outro';
    }
    return 'buildup';
  };

  // Build sections from blueprint
  const sections: SectionConfig[] = blueprint.sections.map((section, index) => {
    // Check if instrument should be active
    const isInstrumentActive = (name: string) => {
      return section.active_instruments.some(i =>
        i.toLowerCase().includes(name) || name.includes(i.toLowerCase())
      );
    };

    // Check if this section has vocals
    const hasVocal = blueprint.vocal?.enabled &&
      blueprint.vocal.sections?.includes(index);

    return {
      type: mapSectionType(section.type),
      bars: section.bars,
      intensity: section.energy * 10,
      hasKick: isInstrumentActive('kick'),
      hasBass: isInstrumentActive('bass'),
      hasMelody: isInstrumentActive('lead') || isInstrumentActive('melody'),
      hasHihat: isInstrumentActive('hihat') || isInstrumentActive('hat'),
      hasPad: isInstrumentActive('pad'),
      hasPluck: isInstrumentActive('pluck'),
      hasStab: isInstrumentActive('stab'),
      hasPiano: false, // Piano almost never used
      hasStrings: isInstrumentActive('string'),
      hasAcid: isInstrumentActive('acid'),
      hasPerc: isInstrumentActive('perc') || isInstrumentActive('clap'),
      hasFx: isInstrumentActive('fx') || isInstrumentActive('riser'),
      hasArp: isInstrumentActive('arp'),
      hasVocal: hasVocal ?? false,
    };
  });

  // Apply global settings
  store.setBPM(blueprint.bpm);
  store.setKey(blueprint.key);
  store.setScale(mapScale(blueprint.scale));
  store.setStyle(mapVibeToStyle(blueprint.vibe));
  store.setSections(sections);

  // Apply vocal settings if present
  if (blueprint.vocal?.enabled) {
    const vocalParams: Partial<VocalParams> = {
      type: blueprint.vocal.type as 'ooh' | 'aah' | 'choir',
      brightness: 40, // Dark
      attack: 400,
      release: 1200,
      reverbMix: 70,
      mix: 65, // Present in mix
    };

    // Map character to gender
    if (blueprint.vocal.character.toLowerCase().includes('male')) {
      vocalParams.gender = 'male';
    } else if (blueprint.vocal.character.toLowerCase().includes('female')) {
      vocalParams.gender = 'female';
    } else {
      vocalParams.gender = 'both';
    }

    store.updateVocal(vocalParams);
    console.log('[composeFromBlueprint] Vocals enabled:', {
      type: blueprint.vocal.type,
      sections: blueprint.vocal.sections,
      character: blueprint.vocal.character,
    });
  }

  console.log('[composeFromBlueprint] Blueprint applied:', {
    bpm: blueprint.bpm,
    key: blueprint.key,
    scale: blueprint.scale,
    sections: sections.length,
    vocalEnabled: blueprint.vocal?.enabled,
    goosebumpsEnabled: blueprint.goosebumps?.enabled,
  });
}

// ============================================================
// GOOSEBUMPS STATE MANAGEMENT
// ============================================================

// Global goosebumps state (can be accessed by generators)
let goosebumpsConfig: {
  enabled: boolean;
  microTimingMs: number;
  exoticFxType: string;
  exoticFxPlacements: number[];
  tensionNotesEnabled: boolean;
} = {
  enabled: false,
  microTimingMs: 0,
  exoticFxType: 'none',
  exoticFxPlacements: [],
  tensionNotesEnabled: false,
};

export function setGoosebumpsConfig(config: typeof goosebumpsConfig): void {
  goosebumpsConfig = config;
  console.log('[composeFromBlueprint] Goosebumps config set:', config);
}

export function getGoosebumpsConfig(): typeof goosebumpsConfig {
  return goosebumpsConfig;
}

export function isGoosebumpsEnabled(): boolean {
  return goosebumpsConfig.enabled;
}

export function getExoticFxForSection(sectionIndex: number): string | null {
  if (!goosebumpsConfig.enabled) return null;
  if (goosebumpsConfig.exoticFxPlacements.includes(sectionIndex)) {
    return goosebumpsConfig.exoticFxType;
  }
  return null;
}

export function shouldApplyTensionNote(): boolean {
  return goosebumpsConfig.enabled && goosebumpsConfig.tensionNotesEnabled;
}

export function getMicroTimingMs(): number {
  return goosebumpsConfig.enabled ? goosebumpsConfig.microTimingMs : 0;
}
