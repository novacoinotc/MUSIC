'use client';

import { useState, useCallback } from 'react';
import { useTrackStore } from '@/stores/trackStore';
import { Sparkles, Loader2, Wand2, Brain, AlertCircle, CheckCircle } from 'lucide-react';
import type { Scale, TechnoStyle, GrooveType } from '@/types';
import type { ComposeResponse, StyleHint } from '@/types/composer';

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
    groove: 'straight',
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

  let bestMatch = 'euphoric';
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

// Detect style hint from prompt
function detectStyleHint(prompt: string): StyleHint {
  const lower = prompt.toLowerCase();
  if (lower.includes('anyma') || lower.includes('ethereal')) {
    return 'afterlife_anyma';
  }
  if (lower.includes('underground') || lower.includes('warehouse')) {
    return 'melodic_underground';
  }
  return 'afterlife_kast';
}

interface AIPromptProps {
  onGenerate?: () => void;
}

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  type: NotificationType;
  message: string;
}

export function AIPrompt({ onGenerate }: AIPromptProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [lastMood, setLastMood] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  const setBPM = useTrackStore((s) => s.setBPM);
  const setKey = useTrackStore((s) => s.setKey);
  const setScale = useTrackStore((s) => s.setScale);
  const setStyle = useTrackStore((s) => s.setStyle);
  const setGroove = useTrackStore((s) => s.setGroove);
  const randomizeAll = useTrackStore((s) => s.randomizeAll);
  const applyComposerPlan = useTrackStore((s) => s.applyComposerPlan);

  const showNotification = useCallback((type: NotificationType, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // Local keyword-based generation (fast)
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const mood = parsePrompt(prompt);
    const preset = MOOD_PRESETS[mood];

    if (preset) {
      randomizeAll();

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
      showNotification('success', `Generated ${mood} mood`);
    }

    setIsGenerating(false);
    onGenerate?.();
  };

  // GPT-5.2 AI Composer (detailed plan)
  const handleCompose = async () => {
    if (!prompt.trim()) return;

    setIsComposing(true);
    setNotification(null);

    try {
      const response = await fetch('/api/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          durationBars: 128,
          bpmHint: extractBPM(prompt) || undefined,
          styleHint: detectStyleHint(prompt),
        }),
      });

      const data: ComposeResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to compose');
      }

      if (data.plan) {
        // Apply the AI-generated plan to the store
        applyComposerPlan(data.plan);

        setLastMood(`AI: ${data.plan.style}`);
        showNotification('success', `AI composed ${data.plan.sections.length} sections at ${data.plan.bpm} BPM`);

        // Trigger regeneration
        onGenerate?.();
      }
    } catch (error) {
      console.error('Compose error:', error);
      showNotification('error', error instanceof Error ? error.message : 'Failed to compose. Check API key.');
    } finally {
      setIsComposing(false);
    }
  };

  const suggestions = [
    "Dark warehouse techno, 3am Berlin",
    "Melodic Afterlife style, emotional",
    "Hypnotic minimal, Ka:st vibes",
    "Deep underground, phrygian",
    "Euphoric sunrise set, Adriatique",
    "Dark melodic breakdown, 123bpm",
    "Progressive journey, emotional",
    "Minimal hypnotic, repetitive",
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
        Describe el ambiente o estilo. Usa <span className="text-cyan-400">Quick</span> para generar rápido o{' '}
        <span className="text-purple-400">AI Compose</span> para un plan detallado con GPT.
      </p>

      {/* Notification toast */}
      {notification && (
        <div
          className={`mb-3 p-3 rounded-lg flex items-center gap-2 text-sm ${
            notification.type === 'error'
              ? 'bg-red-500/20 border border-red-500/30 text-red-300'
              : notification.type === 'success'
              ? 'bg-green-500/20 border border-green-500/30 text-green-300'
              : 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          )}
          {notification.message}
        </div>
      )}

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          placeholder="Ej: Dark melodic techno, emotional breakdown, 123bpm..."
          className="flex-1 bg-zinc-900/80 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none transition-colors"
          disabled={isGenerating || isComposing}
        />

        {/* Quick generate button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || isComposing || !prompt.trim()}
          className="px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-medium hover:from-cyan-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          title="Quick generate (local keywords)"
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Wand2 className="w-5 h-5" />
          )}
          <span className="hidden sm:inline">Quick</span>
        </button>

        {/* AI Compose button (GPT-5.2) */}
        <button
          onClick={handleCompose}
          disabled={isGenerating || isComposing || !prompt.trim()}
          className="px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium hover:from-purple-700 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          title="AI Compose with GPT (detailed plan)"
        >
          {isComposing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Brain className="w-5 h-5" />
          )}
          <span className="hidden sm:inline">AI Compose</span>
        </button>
      </div>

      {/* Quick suggestions */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => setPrompt(suggestion)}
            disabled={isGenerating || isComposing}
            className="text-xs px-3 py-1.5 rounded-full bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-300 transition-colors disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* AI Compose info */}
      <div className="mt-3 pt-3 border-t border-zinc-700/50">
        <p className="text-xs text-zinc-500">
          <Brain className="w-3 h-3 inline mr-1" />
          AI Compose usa GPT para generar un plan musical completo con estructura,
          energía, y parámetros optimizados para el estilo Ka:st/Afterlife.
        </p>
      </div>
    </div>
  );
}
