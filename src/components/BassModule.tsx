'use client';

import { useTrackStore } from '@/stores/trackStore';
import { Knob } from './Knob';
import { audioEngine } from '@/lib/audioEngine';
import { Shuffle } from 'lucide-react';

export function BassModule() {
  const bass = useTrackStore((s) => s.bass);
  const key = useTrackStore((s) => s.key);
  const updateBass = useTrackStore((s) => s.updateBass);
  const randomizeBass = useTrackStore((s) => s.randomizeBass);

  const handleChange = (key: keyof typeof bass, value: number) => {
    updateBass({ [key]: value });
    audioEngine.updateBass({ ...bass, [key]: value });
  };

  const previewBass = () => {
    const notes = ['C', 'D', 'E', 'F'];
    const octave = 2 + bass.octave;
    notes.forEach((note, i) => {
      setTimeout(() => {
        audioEngine.playBass(`${note}${octave}`, '8n');
      }, i * 300);
    });
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50" />
          BASS
        </h3>
        <div className="flex gap-2">
          <button
            onClick={randomizeBass}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
            title="Randomize"
          >
            <Shuffle className="w-4 h-4 text-zinc-400" />
          </button>
          <button
            onClick={previewBass}
            className="px-3 py-1 text-xs rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
          >
            PREVIEW
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <Knob
          value={bass.cutoff}
          min={100}
          max={3000}
          label="CUTOFF"
          onChange={(v) => handleChange('cutoff', v)}
          color="#ff8844"
          size="sm"
        />
        <Knob
          value={bass.resonance}
          min={0}
          max={100}
          label="RES"
          onChange={(v) => handleChange('resonance', v)}
          color="#ff8844"
          size="sm"
        />
        <Knob
          value={bass.decay}
          min={50}
          max={500}
          label="DECAY"
          onChange={(v) => handleChange('decay', v)}
          color="#ff8844"
          size="sm"
        />
        <Knob
          value={bass.glide}
          min={0}
          max={100}
          label="GLIDE"
          onChange={(v) => handleChange('glide', v)}
          color="#ff8844"
          size="sm"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="text-xs text-zinc-400">OCTAVE</label>
        <div className="flex gap-1">
          {[-2, -1, 0, 1].map((oct) => (
            <button
              key={oct}
              onClick={() => handleChange('octave', oct)}
              className={`px-3 py-1 text-xs rounded ${
                bass.octave === oct
                  ? 'bg-orange-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {oct > 0 ? `+${oct}` : oct}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
