'use client';

import { useTrackStore } from '@/stores/trackStore';
import { Knob } from './Knob';
import { audioEngine } from '@/lib/audioEngine';
import { Shuffle } from 'lucide-react';
import type { Scale } from '@/types';

const SCALES: { value: Scale; label: string }[] = [
  { value: 'minor', label: 'Minor' },
  { value: 'phrygian', label: 'Phrygian' },
  { value: 'harmonicMinor', label: 'Harmonic' },
  { value: 'dorian', label: 'Dorian' },
  { value: 'locrian', label: 'Locrian' },
];

export function MelodyModule() {
  const melody = useTrackStore((s) => s.melody);
  const key = useTrackStore((s) => s.key);
  const scale = useTrackStore((s) => s.scale);
  const updateMelody = useTrackStore((s) => s.updateMelody);
  const randomizeMelody = useTrackStore((s) => s.randomizeMelody);
  const setScale = useTrackStore((s) => s.setScale);

  const handleChange = (paramKey: keyof typeof melody, value: number) => {
    updateMelody({ [paramKey]: value });
    audioEngine.updateMelody({ ...melody, [paramKey]: value });
  };

  const previewMelody = () => {
    const notes = [`${key}${melody.octave}`, `${key}${melody.octave + 1}`];
    notes.forEach((note, i) => {
      setTimeout(() => {
        audioEngine.playMelody(note, '8n', undefined, 0.7);
      }, i * 200);
    });
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50" />
          MELODY
        </h3>
        <div className="flex gap-2">
          <button
            onClick={randomizeMelody}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
            title="Randomize"
          >
            <Shuffle className="w-4 h-4 text-zinc-400" />
          </button>
          <button
            onClick={previewMelody}
            className="px-3 py-1 text-xs rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
          >
            PREVIEW
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-4">
        <Knob
          value={melody.density}
          min={10}
          max={100}
          label="DENSITY"
          onChange={(v) => handleChange('density', v)}
          color="#00ccff"
          size="sm"
        />
        <Knob
          value={melody.variation}
          min={0}
          max={100}
          label="VARIATION"
          onChange={(v) => handleChange('variation', v)}
          color="#00ccff"
          size="sm"
        />
        <Knob
          value={melody.arpSpeed}
          min={0}
          max={100}
          label="ARP"
          onChange={(v) => handleChange('arpSpeed', v)}
          color="#00ccff"
          size="sm"
        />
        <Knob
          value={melody.reverbMix}
          min={0}
          max={100}
          label="REVERB"
          onChange={(v) => handleChange('reverbMix', v)}
          color="#00ccff"
          size="sm"
        />
        <Knob
          value={melody.delayMix}
          min={0}
          max={100}
          label="DELAY"
          onChange={(v) => handleChange('delayMix', v)}
          color="#00ccff"
          size="sm"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="text-xs text-zinc-400">SCALE</label>
        <div className="flex gap-1 flex-wrap">
          {SCALES.map((s) => (
            <button
              key={s.value}
              onClick={() => setScale(s.value)}
              className={`px-2 py-1 text-xs rounded ${
                scale === s.value
                  ? 'bg-cyan-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
