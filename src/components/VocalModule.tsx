'use client';

import { useTrackStore } from '@/stores/trackStore';
import { Slider } from './Slider';
import { Mic2 } from 'lucide-react';

const VOCAL_TYPES = ['ooh', 'aah', 'eeh', 'choir'] as const;
const GENDER_OPTIONS = ['female', 'male', 'both'] as const;

export function VocalModule() {
  const vocal = useTrackStore((s) => s.vocal);
  const updateVocal = useTrackStore((s) => s.updateVocal);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Mic2 className="w-5 h-5 text-pink-400" />
        <h3 className="text-lg font-bold text-white">VOCALS</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Type & Gender */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-zinc-500 block mb-1">Type</label>
              <div className="flex gap-1">
                {VOCAL_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => updateVocal({ type })}
                    className={`flex-1 py-1.5 text-xs rounded font-medium transition-colors ${
                      vocal.type === type
                        ? 'bg-pink-500 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-500 block mb-1">Voice</label>
            <div className="flex gap-1">
              {GENDER_OPTIONS.map((gender) => (
                <button
                  key={gender}
                  onClick={() => updateVocal({ gender })}
                  className={`flex-1 py-1.5 text-xs rounded font-medium transition-colors ${
                    vocal.gender === gender
                      ? 'bg-purple-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {gender === 'female' ? '♀' : gender === 'male' ? '♂' : '♀♂'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-2">
          <Slider
            label="Brightness"
            value={vocal.brightness}
            min={0}
            max={100}
            onChange={(v) => updateVocal({ brightness: v })}
            color="#ec4899"
          />
          <Slider
            label="Mix"
            value={vocal.mix}
            min={0}
            max={100}
            onChange={(v) => updateVocal({ mix: v })}
            color="#a855f7"
          />
          <Slider
            label="Reverb"
            value={vocal.reverbMix}
            min={0}
            max={100}
            onChange={(v) => updateVocal({ reverbMix: v })}
            color="#8b5cf6"
          />
        </div>
      </div>
    </div>
  );
}
