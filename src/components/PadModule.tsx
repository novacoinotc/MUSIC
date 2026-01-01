'use client';

import { useTrackStore } from '@/stores/trackStore';
import { Knob } from './Knob';
import { audioEngine } from '@/lib/audioEngine';

type ChordType = 'minor' | 'major' | 'sus4' | 'sus2' | 'dim' | 'aug' | 'add9' | 'minor7' | 'major7';

const CHORDS: { value: ChordType; label: string }[] = [
  { value: 'minor', label: 'Min' },
  { value: 'major', label: 'Maj' },
  { value: 'sus4', label: 'Sus4' },
  { value: 'sus2', label: 'Sus2' },
  { value: 'minor7', label: 'Min7' },
  { value: 'add9', label: 'Add9' },
];

export function PadModule() {
  const pad = useTrackStore((s) => s.pad);
  const key = useTrackStore((s) => s.key);
  const updatePad = useTrackStore((s) => s.updatePad);

  const handleChange = (paramKey: keyof typeof pad, value: number | ChordType) => {
    updatePad({ [paramKey]: value });
    if (typeof value === 'number') {
      audioEngine.updatePad({ ...pad, [paramKey]: value });
    }
  };

  const previewPad = () => {
    const chords: Record<ChordType, string[]> = {
      minor: ['C3', 'D#3', 'G3'],
      major: ['C3', 'E3', 'G3'],
      sus4: ['C3', 'F3', 'G3'],
      sus2: ['C3', 'D3', 'G3'],
      dim: ['C3', 'D#3', 'F#3'],
      aug: ['C3', 'E3', 'G#3'],
      add9: ['C3', 'E3', 'G3', 'D4'],
      minor7: ['C3', 'D#3', 'G3', 'A#3'],
      major7: ['C3', 'E3', 'G3', 'B3'],
    };
    audioEngine.playPad(chords[pad.chord] || chords.minor, '2n');
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50" />
          PAD
        </h3>
        <button
          onClick={previewPad}
          className="px-3 py-1 text-xs rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
        >
          PREVIEW
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <Knob
          value={pad.attack}
          min={100}
          max={2000}
          label="ATTACK"
          onChange={(v) => handleChange('attack', v)}
          color="#aa44ff"
          size="sm"
        />
        <Knob
          value={pad.release}
          min={200}
          max={3000}
          label="RELEASE"
          onChange={(v) => handleChange('release', v)}
          color="#aa44ff"
          size="sm"
        />
        <Knob
          value={pad.reverbMix}
          min={0}
          max={100}
          label="REVERB"
          onChange={(v) => handleChange('reverbMix', v)}
          color="#aa44ff"
          size="sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-zinc-400">CHORD</label>
        <div className="flex gap-1">
          {CHORDS.map((c) => (
            <button
              key={c.value}
              onClick={() => handleChange('chord', c.value)}
              className={`px-2 py-1 text-xs rounded ${
                pad.chord === c.value
                  ? 'bg-purple-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
