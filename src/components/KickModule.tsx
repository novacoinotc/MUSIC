'use client';

import { useTrackStore } from '@/stores/trackStore';
import { Knob } from './Knob';
import { audioEngine } from '@/lib/audioEngine';
import { Shuffle } from 'lucide-react';

export function KickModule() {
  const kick = useTrackStore((s) => s.kick);
  const updateKick = useTrackStore((s) => s.updateKick);
  const randomizeKick = useTrackStore((s) => s.randomizeKick);

  const handleChange = (key: keyof typeof kick, value: number) => {
    updateKick({ [key]: value });
    audioEngine.updateKick({ ...kick, [key]: value });
  };

  const previewKick = () => {
    audioEngine.playKick();
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
          KICK
        </h3>
        <div className="flex gap-2">
          <button
            onClick={randomizeKick}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
            title="Randomize"
          >
            <Shuffle className="w-4 h-4 text-zinc-400" />
          </button>
          <button
            onClick={previewKick}
            className="px-3 py-1 text-xs rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
          >
            PREVIEW
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <Knob
          value={kick.punch}
          min={0}
          max={100}
          label="PUNCH"
          onChange={(v) => handleChange('punch', v)}
          color="#ff4444"
          size="sm"
        />
        <Knob
          value={kick.sub}
          min={0}
          max={100}
          label="SUB"
          onChange={(v) => handleChange('sub', v)}
          color="#ff4444"
          size="sm"
        />
        <Knob
          value={kick.decay}
          min={0}
          max={100}
          label="DECAY"
          onChange={(v) => handleChange('decay', v)}
          color="#ff4444"
          size="sm"
        />
        <Knob
          value={kick.pitch}
          min={30}
          max={80}
          label="PITCH"
          onChange={(v) => handleChange('pitch', v)}
          color="#ff4444"
          size="sm"
        />
        <Knob
          value={kick.drive}
          min={0}
          max={100}
          label="DRIVE"
          onChange={(v) => handleChange('drive', v)}
          color="#ff4444"
          size="sm"
        />
      </div>
    </div>
  );
}
