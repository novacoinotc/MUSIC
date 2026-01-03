'use client';

import { useState, useEffect } from 'react';
import {
  KickModule,
  BassModule,
  MelodyModule,
  HiHatModule,
  PadModule,
  VocalModule,
  InstrumentRack,
  StructureBuilder,
  Transport,
  Visualizer,
  AIPrompt,
  GoosebumpsControl,
} from '@/components';
import { Zap, Music, Waves } from 'lucide-react';

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8 text-green-500 animate-pulse" />
          <span className="text-xl text-white">Loading Synth Forge...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                SYNTH FORGE
              </h1>
              <p className="text-xs text-zinc-500">AI-Powered Techno Generator</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Music className="w-4 h-4" />
              <span>Melodic Techno</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Waves className="w-4 h-4" />
              <span>Real-time Synthesis</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Transport & Visualizer */}
        <Transport />
        <Visualizer />

        {/* AI Prompt */}
        <AIPrompt />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Core Instruments */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              Core Instruments
            </h2>
            <KickModule />
            <BassModule />
            <MelodyModule />
          </div>

          {/* Right Column - Percussion & Atmosphere */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              Percussion & Atmosphere
            </h2>
            <HiHatModule />
            <PadModule />
            <VocalModule />
            <GoosebumpsControl />
          </div>
        </div>

        {/* Extended Instruments */}
        <InstrumentRack />

        {/* Structure Builder */}
        <StructureBuilder />

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-400" />
            Quick Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-zinc-400">
            <div>
              <span className="text-green-400 font-medium">Randomize All:</span> Press this button to generate a completely new track with random parameters.
            </div>
            <div>
              <span className="text-green-400 font-medium">Regenerate:</span> Keeps your parameters but creates new patterns and melodies.
            </div>
            <div>
              <span className="text-green-400 font-medium">Export:</span> Records the full track and downloads it as an audio file.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between text-sm text-zinc-500">
          <span>Synth Forge - Create Techno Music with AI</span>
          <span>Powered by Tone.js</span>
        </div>
      </footer>
    </div>
  );
}
