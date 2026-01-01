'use client';

import { useTrackStore } from '@/stores/trackStore';
import { Knob } from './Knob';
import { audioEngine } from '@/lib/audioEngine';

type HiHatPattern = 'straight' | 'offbeat' | 'shuffle' | 'complex';

const PATTERNS: { value: HiHatPattern; label: string }[] = [
  { value: 'straight', label: '8ths' },
  { value: 'offbeat', label: 'Off' },
  { value: 'shuffle', label: 'Shfl' },
  { value: 'complex', label: 'Busy' },
];

export function HiHatModule() {
  const hihat = useTrackStore((s) => s.hihat);
  const updateHihat = useTrackStore((s) => s.updateHihat);

  const handleChange = (key: keyof typeof hihat, value: number | HiHatPattern) => {
    updateHihat({ [key]: value });
    if (typeof value === 'number') {
      audioEngine.updateHihat({ ...hihat, [key]: value });
    }
  };

  const previewHihat = () => {
    [0, 150, 300, 450].forEach((delay) => {
      setTimeout(() => {
        audioEngine.playHihat(undefined, 0.6 + Math.random() * 0.2);
      }, delay);
    });
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50" />
          HI-HAT
        </h3>
        <button
          onClick={previewHihat}
          className="px-3 py-1 text-xs rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors"
        >
          PREVIEW
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <Knob
          value={hihat.decay}
          min={10}
          max={80}
          label="DECAY"
          onChange={(v) => handleChange('decay', v)}
          color="#ffcc00"
          size="sm"
        />
        <Knob
          value={hihat.pitch}
          min={20}
          max={100}
          label="PITCH"
          onChange={(v) => handleChange('pitch', v)}
          color="#ffcc00"
          size="sm"
        />
        <Knob
          value={hihat.velocity}
          min={30}
          max={100}
          label="VEL"
          onChange={(v) => handleChange('velocity', v)}
          color="#ffcc00"
          size="sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-zinc-400">PATTERN</label>
        <div className="flex gap-1">
          {PATTERNS.map((p) => (
            <button
              key={p.value}
              onClick={() => handleChange('pattern', p.value)}
              className={`px-2 py-1 text-xs rounded ${
                hihat.pattern === p.value
                  ? 'bg-yellow-500 text-black font-medium'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
