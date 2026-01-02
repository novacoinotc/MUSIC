'use client';

import { useTrackStore } from '@/stores/trackStore';
import { Slider } from './Slider';
import { Music2, Piano, Guitar, Waves, Zap, Speaker } from 'lucide-react';

export function InstrumentRack() {
  const pluck = useTrackStore((s) => s.pluck);
  const stab = useTrackStore((s) => s.stab);
  const piano = useTrackStore((s) => s.piano);
  const strings = useTrackStore((s) => s.strings);
  const acid = useTrackStore((s) => s.acid);
  const arp = useTrackStore((s) => s.arp);

  const updatePluck = useTrackStore((s) => s.updatePluck);
  const updateStab = useTrackStore((s) => s.updateStab);
  const updatePiano = useTrackStore((s) => s.updatePiano);
  const updateStrings = useTrackStore((s) => s.updateStrings);
  const updateAcid = useTrackStore((s) => s.updateAcid);
  const updateArp = useTrackStore((s) => s.updateArp);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Music2 className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-bold text-white">INSTRUMENTS</h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Pluck */}
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Guitar className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-white">Pluck</span>
          </div>
          <div className="space-y-2">
            <Slider
              label="Bright"
              value={pluck.brightness}
              min={0}
              max={100}
              onChange={(v) => updatePluck({ brightness: v })}
              color="#4ade80"
            />
            <Slider
              label="Delay"
              value={pluck.delayMix}
              min={0}
              max={100}
              onChange={(v) => updatePluck({ delayMix: v })}
              color="#22c55e"
            />
          </div>
        </div>

        {/* Stab */}
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-white">Stab</span>
          </div>
          <div className="space-y-2">
            <Slider
              label="Filter"
              value={stab.filterCutoff}
              min={500}
              max={8000}
              onChange={(v) => updateStab({ filterCutoff: v })}
              color="#fb923c"
            />
            <Slider
              label="Voices"
              value={stab.voices}
              min={1}
              max={8}
              onChange={(v) => updateStab({ voices: v })}
              color="#f97316"
            />
          </div>
        </div>

        {/* Piano */}
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Piano className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Piano</span>
          </div>
          <div className="space-y-2">
            <Slider
              label="Bright"
              value={piano.brightness}
              min={0}
              max={100}
              onChange={(v) => updatePiano({ brightness: v })}
              color="#60a5fa"
            />
            <Slider
              label="Reverb"
              value={piano.reverb}
              min={0}
              max={100}
              onChange={(v) => updatePiano({ reverb: v })}
              color="#3b82f6"
            />
          </div>
        </div>

        {/* Strings */}
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Waves className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-white">Strings</span>
          </div>
          <div className="space-y-2">
            <Slider
              label="Ensemble"
              value={strings.ensemble}
              min={0}
              max={100}
              onChange={(v) => updateStrings({ ensemble: v })}
              color="#c084fc"
            />
            <Slider
              label="Reverb"
              value={strings.reverbMix}
              min={0}
              max={100}
              onChange={(v) => updateStrings({ reverbMix: v })}
              color="#a855f7"
            />
          </div>
        </div>

        {/* Acid */}
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Speaker className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">Acid 303</span>
          </div>
          <div className="space-y-2">
            <Slider
              label="Cutoff"
              value={acid.cutoff}
              min={100}
              max={2000}
              onChange={(v) => updateAcid({ cutoff: v })}
              color="#facc15"
            />
            <Slider
              label="Reso"
              value={acid.resonance}
              min={0}
              max={100}
              onChange={(v) => updateAcid({ resonance: v })}
              color="#eab308"
            />
          </div>
        </div>

        {/* Arp */}
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Music2 className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-medium text-white">Arpeggiator</span>
          </div>
          <div className="space-y-2">
            <div className="flex gap-1">
              {(['up', 'down', 'updown'] as const).map((pattern) => (
                <button
                  key={pattern}
                  onClick={() => updateArp({ pattern })}
                  className={`flex-1 py-1 text-[10px] rounded font-medium ${
                    arp.pattern === pattern
                      ? 'bg-teal-500 text-white'
                      : 'bg-zinc-700 text-zinc-400'
                  }`}
                >
                  {pattern === 'updown' ? '↕' : pattern === 'up' ? '↑' : '↓'}
                </button>
              ))}
            </div>
            <Slider
              label="Speed"
              value={arp.speed}
              min={10}
              max={100}
              onChange={(v) => updateArp({ speed: v })}
              color="#2dd4bf"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
