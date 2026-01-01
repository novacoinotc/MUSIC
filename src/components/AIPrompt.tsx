'use client';

import { useState } from 'react';
import { useTrackStore } from '@/stores/trackStore';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import type { Scale } from '@/types';

// AI Mood presets - these map descriptions to parameter configurations
const MOOD_PRESETS: Record<string, Partial<ReturnType<typeof useTrackStore.getState>>> = {
  dark: {
    scale: 'phrygian' as Scale,
    bpm: 130,
    kick: { punch: 85, sub: 90, decay: 45, pitch: 50, drive: 60 },
    bass: { synthType: 'subtractive', cutoff: 600, resonance: 50, attack: 5, decay: 300, sustain: 50, release: 100, octave: -2, glide: 30 },
    melody: { scale: 'phrygian', rootNote: 'A', octave: 4, density: 35, variation: 40, arpSpeed: 30, synthType: 'fm', attack: 20, release: 400, filterCutoff: 1500, reverbMix: 50, delayMix: 40 },
    hihat: { decay: 25, pitch: 40, pattern: 'straight', velocity: 65 },
    pad: { synthType: 'subtractive', attack: 800, release: 1500, filterCutoff: 1000, lfoRate: 0.3, lfoDepth: 40, reverbMix: 70, chord: 'minor' },
  },
  euphoric: {
    scale: 'harmonicMinor' as Scale,
    bpm: 132,
    kick: { punch: 75, sub: 85, decay: 50, pitch: 55, drive: 35 },
    bass: { synthType: 'subtractive', cutoff: 1000, resonance: 35, attack: 5, decay: 200, sustain: 60, release: 150, octave: -1, glide: 15 },
    melody: { scale: 'harmonicMinor', rootNote: 'C', octave: 5, density: 60, variation: 50, arpSpeed: 70, synthType: 'fm', attack: 10, release: 300, filterCutoff: 3000, reverbMix: 55, delayMix: 45 },
    hihat: { decay: 35, pitch: 60, pattern: 'shuffle', velocity: 75 },
    pad: { synthType: 'subtractive', attack: 600, release: 1200, filterCutoff: 2000, lfoRate: 0.5, lfoDepth: 25, reverbMix: 65, chord: 'major' },
  },
  industrial: {
    scale: 'locrian' as Scale,
    bpm: 138,
    kick: { punch: 95, sub: 70, decay: 35, pitch: 45, drive: 80 },
    bass: { synthType: 'subtractive', cutoff: 500, resonance: 70, attack: 2, decay: 150, sustain: 40, release: 50, octave: -2, glide: 5 },
    melody: { scale: 'locrian', rootNote: 'D', octave: 4, density: 45, variation: 60, arpSpeed: 40, synthType: 'fm', attack: 5, release: 200, filterCutoff: 2000, reverbMix: 30, delayMix: 25 },
    hihat: { decay: 20, pitch: 70, pattern: 'complex', velocity: 85 },
    pad: { synthType: 'subtractive', attack: 300, release: 800, filterCutoff: 1200, lfoRate: 1, lfoDepth: 50, reverbMix: 40, chord: 'dim' },
  },
  hypnotic: {
    scale: 'minor' as Scale,
    bpm: 124,
    kick: { punch: 70, sub: 85, decay: 55, pitch: 52, drive: 25 },
    bass: { synthType: 'subtractive', cutoff: 700, resonance: 45, attack: 10, decay: 250, sustain: 70, release: 200, octave: -1, glide: 40 },
    melody: { scale: 'minor', rootNote: 'G', octave: 4, density: 40, variation: 25, arpSpeed: 60, synthType: 'fm', attack: 15, release: 350, filterCutoff: 1800, reverbMix: 60, delayMix: 55 },
    hihat: { decay: 30, pitch: 50, pattern: 'offbeat', velocity: 60 },
    pad: { synthType: 'subtractive', attack: 700, release: 1400, filterCutoff: 1500, lfoRate: 0.2, lfoDepth: 35, reverbMix: 75, chord: 'sus4' },
  },
  energetic: {
    scale: 'dorian' as Scale,
    bpm: 136,
    kick: { punch: 80, sub: 80, decay: 40, pitch: 58, drive: 45 },
    bass: { synthType: 'subtractive', cutoff: 900, resonance: 40, attack: 3, decay: 180, sustain: 55, release: 80, octave: -1, glide: 20 },
    melody: { scale: 'dorian', rootNote: 'E', octave: 5, density: 70, variation: 45, arpSpeed: 80, synthType: 'fm', attack: 8, release: 250, filterCutoff: 2500, reverbMix: 35, delayMix: 35 },
    hihat: { decay: 40, pitch: 65, pattern: 'complex', velocity: 80 },
    pad: { synthType: 'subtractive', attack: 400, release: 900, filterCutoff: 1800, lfoRate: 0.8, lfoDepth: 30, reverbMix: 50, chord: 'minor' },
  },
  minimal: {
    scale: 'minor' as Scale,
    bpm: 126,
    kick: { punch: 65, sub: 75, decay: 50, pitch: 50, drive: 20 },
    bass: { synthType: 'subtractive', cutoff: 600, resonance: 30, attack: 8, decay: 220, sustain: 65, release: 120, octave: -1, glide: 10 },
    melody: { scale: 'minor', rootNote: 'A', octave: 4, density: 25, variation: 20, arpSpeed: 35, synthType: 'fm', attack: 12, release: 300, filterCutoff: 1600, reverbMix: 45, delayMix: 40 },
    hihat: { decay: 28, pitch: 55, pattern: 'offbeat', velocity: 55 },
    pad: { synthType: 'subtractive', attack: 900, release: 1600, filterCutoff: 1200, lfoRate: 0.15, lfoDepth: 20, reverbMix: 80, chord: 'minor' },
  },
  progressive: {
    scale: 'harmonicMinor' as Scale,
    bpm: 122,
    kick: { punch: 72, sub: 82, decay: 52, pitch: 54, drive: 30 },
    bass: { synthType: 'subtractive', cutoff: 850, resonance: 38, attack: 6, decay: 210, sustain: 58, release: 140, octave: -1, glide: 25 },
    melody: { scale: 'harmonicMinor', rootNote: 'F', octave: 4, density: 55, variation: 35, arpSpeed: 55, synthType: 'fm', attack: 18, release: 380, filterCutoff: 2200, reverbMix: 50, delayMix: 50 },
    hihat: { decay: 32, pitch: 52, pattern: 'shuffle', velocity: 68 },
    pad: { synthType: 'subtractive', attack: 650, release: 1300, filterCutoff: 1700, lfoRate: 0.4, lfoDepth: 28, reverbMix: 60, chord: 'minor' },
  },
  acid: {
    scale: 'phrygian' as Scale,
    bpm: 135,
    kick: { punch: 78, sub: 72, decay: 38, pitch: 48, drive: 55 },
    bass: { synthType: 'subtractive', cutoff: 1200, resonance: 75, attack: 2, decay: 120, sustain: 45, release: 60, octave: -1, glide: 60 },
    melody: { scale: 'phrygian', rootNote: 'A', octave: 3, density: 50, variation: 55, arpSpeed: 45, synthType: 'fm', attack: 5, release: 180, filterCutoff: 2800, reverbMix: 25, delayMix: 30 },
    hihat: { decay: 22, pitch: 58, pattern: 'straight', velocity: 72 },
    pad: { synthType: 'subtractive', attack: 350, release: 700, filterCutoff: 1400, lfoRate: 0.7, lfoDepth: 45, reverbMix: 35, chord: 'dim' },
  },
};

// Keywords that map to moods
const KEYWORD_MAP: Record<string, string[]> = {
  dark: ['dark', 'warehouse', 'underground', 'obscuro', 'oscuro', 'berlin', 'bunker', 'night', 'noche', 'midnight', 'shadows', 'sombras', '3am', 'afterhours'],
  euphoric: ['euphoric', 'euforico', 'sunrise', 'amanecer', 'happy', 'feliz', 'uplifting', 'emotional', 'emocional', 'beautiful', 'bonito', 'festival', 'main stage', 'peak time'],
  industrial: ['industrial', 'aggressive', 'agresivo', 'hard', 'duro', 'harsh', 'raw', 'crudo', 'machine', 'metal', 'noise', 'ruido', 'distorted'],
  hypnotic: ['hypnotic', 'hipnotico', 'trance', 'trippy', 'psychedelic', 'psicodelico', 'deep', 'profundo', 'meditative', 'repetitive', 'loop', 'mesmerizing'],
  energetic: ['energetic', 'energetico', 'driving', 'powerful', 'potente', 'fast', 'rapido', 'intense', 'intenso', 'rave', 'party', 'fiesta', 'peak'],
  minimal: ['minimal', 'minimalista', 'simple', 'clean', 'limpio', 'subtle', 'sutil', 'groovy', 'tech house', 'micro', 'less is more'],
  progressive: ['progressive', 'progresivo', 'melodic', 'melodico', 'emotional', 'journey', 'viaje', 'story', 'historia', 'build', 'evolving', 'anjunadeep'],
  acid: ['acid', 'acido', '303', 'squelchy', 'resonant', 'tb303', 'chicago', 'classic', 'retro', 'oldschool', 'analog'],
};

// Parse prompt and find matching mood
function parsePrompt(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();

  let bestMatch = 'dark'; // default
  let maxScore = 0;

  for (const [mood, keywords] of Object.entries(KEYWORD_MAP)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerPrompt.includes(keyword)) {
        score += keyword.length; // longer matches = more specific
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = mood;
    }
  }

  return bestMatch;
}

// Extract BPM from prompt if mentioned
function extractBPM(prompt: string): number | null {
  const bpmMatch = prompt.match(/(\d{2,3})\s*bpm/i);
  if (bpmMatch) {
    const bpm = parseInt(bpmMatch[1]);
    if (bpm >= 80 && bpm <= 180) return bpm;
  }
  return null;
}

// Extract key from prompt if mentioned
function extractKey(prompt: string): string | null {
  const keyMatch = prompt.match(/\b([A-G]#?)\s*(minor|major|min|maj)?\b/i);
  if (keyMatch) {
    return keyMatch[1].toUpperCase();
  }
  return null;
}

interface AIPromptProps {
  onGenerate?: () => void;
}

export function AIPrompt({ onGenerate }: AIPromptProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastMood, setLastMood] = useState<string | null>(null);

  const setBPM = useTrackStore((s) => s.setBPM);
  const setKey = useTrackStore((s) => s.setKey);
  const setScale = useTrackStore((s) => s.setScale);
  const updateKick = useTrackStore((s) => s.updateKick);
  const updateBass = useTrackStore((s) => s.updateBass);
  const updateMelody = useTrackStore((s) => s.updateMelody);
  const updateHihat = useTrackStore((s) => s.updateHihat);
  const updatePad = useTrackStore((s) => s.updatePad);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Parse the prompt
    const mood = parsePrompt(prompt);
    const preset = MOOD_PRESETS[mood];

    if (preset) {
      // Apply preset with some randomization
      if (preset.bpm) setBPM(extractBPM(prompt) || preset.bpm + Math.floor(Math.random() * 6) - 3);
      if (preset.scale) setScale(preset.scale);

      const extractedKey = extractKey(prompt);
      if (extractedKey) {
        setKey(extractedKey);
      } else if (preset.melody?.rootNote) {
        setKey(preset.melody.rootNote);
      }

      if (preset.kick) updateKick(preset.kick);
      if (preset.bass) updateBass(preset.bass);
      if (preset.melody) updateMelody(preset.melody);
      if (preset.hihat) updateHihat(preset.hihat);
      if (preset.pad) updatePad(preset.pad);

      setLastMood(mood);
    }

    setIsGenerating(false);
    onGenerate?.();
  };

  const suggestions = [
    "Dark warehouse techno, 3am vibes",
    "Melodic progressive, sunrise set",
    "Industrial Berlin style, aggressive",
    "Hypnotic minimal, deep groove",
    "Euphoric festival peak time",
    "Acid techno, 303 squelch, 135bpm",
  ];

  return (
    <div className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 border border-purple-500/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold text-white">AI Sound Designer</h3>
        {lastMood && (
          <span className="ml-auto text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
            Mood: {lastMood}
          </span>
        )}
      </div>

      <p className="text-sm text-zinc-400 mb-3">
        Describe el ambiente, la energía o el escenario de tu track y la IA ajustará todos los parámetros.
      </p>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          placeholder="Ej: Dark melodic techno, emotional breakdown, 128bpm in A minor..."
          className="flex-1 bg-zinc-900/80 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none transition-colors"
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium hover:from-purple-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Wand2 className="w-5 h-5" />
          )}
          Generate
        </button>
      </div>

      {/* Quick suggestions */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => setPrompt(suggestion)}
            className="text-xs px-3 py-1.5 rounded-full bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-300 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
