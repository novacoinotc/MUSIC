'use client';

import { useState } from 'react';
import { useTrackStore } from '@/stores/trackStore';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import type { Scale, TechnoStyle, GrooveType } from '@/types';

// AI Mood presets - these map descriptions to parameter configurations
const MOOD_PRESETS: Record<string, {
  scale: Scale;
  style: TechnoStyle;
  groove: GrooveType;
  bpm: number;
}> = {
  dark: {
    scale: 'phrygian',
    style: 'dark',
    groove: 'syncopated',
    bpm: 130,
  },
  euphoric: {
    scale: 'harmonicMinor',
    style: 'melodic',
    groove: 'straight',
    bpm: 126,
  },
  industrial: {
    scale: 'locrian',
    style: 'industrial',
    groove: 'broken',
    bpm: 138,
  },
  hypnotic: {
    scale: 'dorian',
    style: 'hypnotic',
    groove: 'triplet',
    bpm: 124,
  },
  energetic: {
    scale: 'minor',
    style: 'progressive',
    groove: 'straight',
    bpm: 134,
  },
  minimal: {
    scale: 'pentatonicMinor',
    style: 'minimal',
    groove: 'shuffle',
    bpm: 126,
  },
  progressive: {
    scale: 'melodicMinor',
    style: 'progressive',
    groove: 'straight',
    bpm: 122,
  },
  acid: {
    scale: 'blues',
    style: 'acid',
    groove: 'shuffle',
    bpm: 132,
  },
};

// Keywords that map to moods
const KEYWORD_MAP: Record<string, string[]> = {
  dark: ['dark', 'warehouse', 'underground', 'obscuro', 'oscuro', 'berlin', 'bunker', 'night', 'noche', 'midnight', 'shadows', 'sombras', '3am', 'afterhours'],
  euphoric: ['euphoric', 'euforico', 'sunrise', 'amanecer', 'happy', 'feliz', 'uplifting', 'emotional', 'emocional', 'beautiful', 'bonito', 'festival', 'main stage', 'peak time', 'afterlife', 'ka:st', 'adriatique'],
  industrial: ['industrial', 'aggressive', 'agresivo', 'hard', 'duro', 'harsh', 'raw', 'crudo', 'machine', 'metal', 'noise', 'ruido', 'distorted'],
  hypnotic: ['hypnotic', 'hipnotico', 'trance', 'trippy', 'psychedelic', 'psicodelico', 'deep', 'profundo', 'meditative', 'repetitive', 'loop', 'mesmerizing'],
  energetic: ['energetic', 'energetico', 'driving', 'powerful', 'potente', 'fast', 'rapido', 'intense', 'intenso', 'rave', 'party', 'fiesta', 'peak'],
  minimal: ['minimal', 'minimalista', 'simple', 'clean', 'limpio', 'subtle', 'sutil', 'groovy', 'tech house', 'micro', 'less is more'],
  progressive: ['progressive', 'progresivo', 'melodic', 'melodico', 'journey', 'viaje', 'story', 'historia', 'build', 'evolving', 'anjunadeep'],
  acid: ['acid', 'acido', '303', 'squelchy', 'resonant', 'tb303', 'chicago', 'classic', 'retro', 'oldschool', 'analog'],
};

// Parse prompt and find matching mood
function parsePrompt(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();

  let bestMatch = 'euphoric'; // default to melodic
  let maxScore = 0;

  for (const [mood, keywords] of Object.entries(KEYWORD_MAP)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerPrompt.includes(keyword)) {
        score += keyword.length;
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
  const setStyle = useTrackStore((s) => s.setStyle);
  const setGroove = useTrackStore((s) => s.setGroove);
  const randomizeAll = useTrackStore((s) => s.randomizeAll);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Parse the prompt
    const mood = parsePrompt(prompt);
    const preset = MOOD_PRESETS[mood];

    if (preset) {
      // First randomize everything for variety
      randomizeAll();

      // Then apply the mood-specific settings
      const extractedBPM = extractBPM(prompt);
      setBPM(extractedBPM || preset.bpm + Math.floor(Math.random() * 8) - 4);

      setScale(preset.scale);
      setStyle(preset.style);
      setGroove(preset.groove);

      const extractedKey = extractKey(prompt);
      if (extractedKey) {
        setKey(extractedKey);
      }

      setLastMood(mood);
    }

    setIsGenerating(false);
    onGenerate?.();
  };

  const suggestions = [
    "Dark warehouse techno, 3am Berlin",
    "Melodic Afterlife style, emotional",
    "Industrial hard techno, aggressive",
    "Hypnotic minimal, deep groove",
    "Euphoric sunrise set, Ka:st vibes",
    "Acid techno, 303 squelch, 132bpm",
    "Progressive journey, Adriatique style",
    "Dark melodic, phrygian scale",
  ];

  return (
    <div className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 border border-purple-500/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold text-white">AI Sound Designer</h3>
        {lastMood && (
          <span className="ml-auto text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
            {lastMood}
          </span>
        )}
      </div>

      <p className="text-sm text-zinc-400 mb-3">
        Describe el ambiente o estilo y todo se randomizará con ese mood.
      </p>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          placeholder="Ej: Dark melodic techno, emotional breakdown, 128bpm..."
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
          Create
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
