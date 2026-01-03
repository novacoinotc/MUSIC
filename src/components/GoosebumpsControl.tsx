'use client';

import { useState, useCallback } from 'react';
import { Sparkles, Zap, Timer, Music } from 'lucide-react';
import { setGoosebumpsConfig, getGoosebumpsConfig } from '@/lib/composeFromBlueprint';
import { Slider } from './Slider';

interface GoosebumpsSettings {
  enabled: boolean;
  microTimingMs: number;
  exoticFxType: 'metal_scrape' | 'breath' | 'reverse_impact' | 'ritual_hit' | 'none';
}

const EXOTIC_FX_TYPES = [
  { value: 'none', label: 'None' },
  { value: 'breath', label: 'Breath' },
  { value: 'metal_scrape', label: 'Metal' },
  { value: 'reverse_impact', label: 'Reverse' },
  { value: 'ritual_hit', label: 'Ritual' },
] as const;

export function GoosebumpsControl() {
  const [settings, setSettings] = useState<GoosebumpsSettings>({
    enabled: false,
    microTimingMs: 15,
    exoticFxType: 'breath',
  });

  const handleToggle = useCallback(() => {
    const newEnabled = !settings.enabled;
    const newSettings = { ...settings, enabled: newEnabled };
    setSettings(newSettings);

    // Apply to global config
    setGoosebumpsConfig({
      enabled: newEnabled,
      microTimingMs: newSettings.microTimingMs,
      exoticFxType: newSettings.exoticFxType,
      exoticFxPlacements: [],
      tensionNotesEnabled: newEnabled,
    });

    console.log('[GoosebumpsControl] Goosebumps mode:', newEnabled ? 'ENABLED' : 'DISABLED');
  }, [settings]);

  const handleMicroTimingChange = useCallback((value: number) => {
    const newSettings = { ...settings, microTimingMs: value };
    setSettings(newSettings);

    if (settings.enabled) {
      setGoosebumpsConfig({
        enabled: true,
        microTimingMs: value,
        exoticFxType: settings.exoticFxType,
        exoticFxPlacements: [],
        tensionNotesEnabled: true,
      });
    }
  }, [settings]);

  const handleFxTypeChange = useCallback((type: typeof settings.exoticFxType) => {
    const newSettings = { ...settings, exoticFxType: type };
    setSettings(newSettings);

    if (settings.enabled) {
      setGoosebumpsConfig({
        enabled: true,
        microTimingMs: settings.microTimingMs,
        exoticFxType: type,
        exoticFxPlacements: [],
        tensionNotesEnabled: true,
      });
    }
  }, [settings]);

  return (
    <div className={`border rounded-xl p-4 transition-all ${
      settings.enabled
        ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/10 border-purple-500/50'
        : 'bg-zinc-900/50 border-zinc-800'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className={`w-5 h-5 ${settings.enabled ? 'text-purple-400' : 'text-zinc-500'}`} />
          <h3 className={`text-lg font-bold ${settings.enabled ? 'text-white' : 'text-zinc-400'}`}>
            GOOSEBUMPS
          </h3>
        </div>
        <button
          onClick={handleToggle}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            settings.enabled
              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          {settings.enabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-zinc-500 mb-3">
        Add emotional micro-details: humanized timing, exotic FX, tension notes
      </p>

      {/* Controls (visible when enabled) */}
      {settings.enabled && (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Micro-timing */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Timer className="w-3 h-3" />
              <span>Micro-Timing: {settings.microTimingMs}ms</span>
            </div>
            <Slider
              label=""
              value={settings.microTimingMs}
              min={5}
              max={30}
              onChange={handleMicroTimingChange}
              color="#a855f7"
            />
          </div>

          {/* Exotic FX Type */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
              <Music className="w-3 h-3" />
              <span>Exotic FX</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {EXOTIC_FX_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleFxTypeChange(value as typeof settings.exoticFxType)}
                  className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                    settings.exoticFxType === value
                      ? 'bg-purple-500/50 text-purple-200 border border-purple-500/50'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-transparent'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Features enabled indicator */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800">
            <div className="flex items-center gap-1 text-xs text-green-400">
              <Zap className="w-3 h-3" />
              <span>Tension notes</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-400">
              <Timer className="w-3 h-3" />
              <span>Humanized groove</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
