'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTrackStore } from '@/stores/trackStore';
import { audioEngine } from '@/lib/audioEngine';
import {
  generateSectionPatterns,
  getSectionStartBar,
} from '@/lib/generators';
import {
  Play,
  Square,
  Download,
  Shuffle,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { Slider } from './Slider';
import * as Tone from 'tone';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function Transport() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentTime, setCurrentTime] = useState('0:0:0');
  const [seed, setSeed] = useState(Date.now());

  const bpm = useTrackStore((s) => s.bpm);
  const key = useTrackStore((s) => s.key);
  const scale = useTrackStore((s) => s.scale);
  const masterVolume = useTrackStore((s) => s.masterVolume);
  const sections = useTrackStore((s) => s.sections);
  const kick = useTrackStore((s) => s.kick);
  const bass = useTrackStore((s) => s.bass);
  const melody = useTrackStore((s) => s.melody);
  const hihat = useTrackStore((s) => s.hihat);
  const pad = useTrackStore((s) => s.pad);

  const setBPM = useTrackStore((s) => s.setBPM);
  const setKey = useTrackStore((s) => s.setKey);
  const setMasterVolume = useTrackStore((s) => s.setMasterVolume);
  const randomizeAll = useTrackStore((s) => s.randomizeAll);
  const reset = useTrackStore((s) => s.reset);

  const initAudio = useCallback(async () => {
    if (isInitialized) return;
    await audioEngine.init();
    audioEngine.setBPM(bpm);
    audioEngine.setMasterVolume(masterVolume);
    audioEngine.updateKick(kick);
    audioEngine.updateBass(bass);
    audioEngine.updateMelody(melody);
    audioEngine.updateHihat(hihat);
    audioEngine.updatePad(pad);
    setIsInitialized(true);
  }, [isInitialized, bpm, masterVolume, kick, bass, melody, hihat, pad]);

  useEffect(() => {
    if (isInitialized) {
      audioEngine.setBPM(bpm);
    }
  }, [bpm, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      audioEngine.setMasterVolume(masterVolume);
    }
  }, [masterVolume, isInitialized]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(audioEngine.getTransportPosition());
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const scheduleAllPatterns = useCallback(() => {
    Tone.getTransport().cancel();

    let startBar = 0;
    sections.forEach((section, index) => {
      const patterns = generateSectionPatterns(
        section,
        key,
        scale,
        kick,
        bass,
        melody,
        hihat,
        pad,
        seed + index
      );

      const startTime = Tone.Time(`${startBar}:0:0`).toSeconds();

      audioEngine.schedulePattern(patterns.kick, 'kick', startTime);
      audioEngine.schedulePattern(patterns.bass, 'bass', startTime);
      audioEngine.schedulePattern(patterns.melody, 'melody', startTime);
      audioEngine.schedulePattern(patterns.hihat, 'hihat', startTime);
      audioEngine.schedulePattern(patterns.pad, 'pad', startTime);

      startBar += section.bars;
    });

    // Schedule stop at end
    const totalBars = sections.reduce((sum, s) => sum + s.bars, 0);
    Tone.getTransport().schedule(() => {
      handleStop();
    }, `${totalBars}:0:0`);
  }, [sections, key, scale, kick, bass, melody, hihat, pad, seed]);

  const handlePlay = async () => {
    await initAudio();
    scheduleAllPatterns();
    audioEngine.play();
    setIsPlaying(true);
  };

  const handleStop = () => {
    audioEngine.stop();
    setIsPlaying(false);
    setCurrentTime('0:0:0');
  };

  const handleRegenerate = () => {
    const newSeed = Date.now();
    setSeed(newSeed);
    if (isPlaying) {
      scheduleAllPatterns();
    }
  };

  const handleRandomizeAll = async () => {
    await initAudio();
    randomizeAll();
    handleRegenerate();
  };

  const handleExport = async () => {
    await initAudio();
    setIsRecording(true);

    await audioEngine.startRecording();
    scheduleAllPatterns();
    audioEngine.play();

    // Wait for the track to finish
    const totalBars = sections.reduce((sum, s) => sum + s.bars, 0);
    const durationMs = (totalBars * 4 * 60 * 1000) / bpm;

    setTimeout(async () => {
      audioEngine.stop();
      const blob = await audioEngine.stopRecording();
      setIsRecording(false);
      setIsPlaying(false);

      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `synthforge-${key}-${bpm}bpm-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }, durationMs + 1000);
  };

  const formatTime = (time: string) => {
    const parts = time.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1].padStart(2, '0')}`;
    }
    return time;
  };

  return (
    <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-6 flex-wrap">
        {/* Play/Stop buttons */}
        <div className="flex items-center gap-2">
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-green-500/30"
            >
              <Play className="w-6 h-6 text-white ml-1" fill="white" />
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-red-500/30"
            >
              <Square className="w-5 h-5 text-white" fill="white" />
            </button>
          )}

          <div className="text-2xl font-mono text-white w-20">
            {formatTime(currentTime)}
          </div>
        </div>

        {/* BPM */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-400">BPM</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={bpm}
              onChange={(e) => setBPM(parseInt(e.target.value) || 128)}
              className="w-16 bg-zinc-800 text-white text-center text-lg font-mono py-1 px-2 rounded border border-zinc-700 focus:border-green-500 outline-none"
              min={80}
              max={180}
            />
          </div>
        </div>

        {/* Key */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-400">KEY</label>
          <select
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="bg-zinc-800 text-white text-lg font-mono py-1 px-3 rounded border border-zinc-700 focus:border-green-500 outline-none"
          >
            {NOTES.map((note) => (
              <option key={note} value={note}>
                {note}
              </option>
            ))}
          </select>
        </div>

        {/* Master Volume */}
        <div className="flex items-center gap-3 min-w-[180px]">
          <Volume2 className="w-5 h-5 text-zinc-400" />
          <Slider
            value={masterVolume}
            min={0}
            max={100}
            label="MASTER"
            onChange={setMasterVolume}
            color="#00ff88"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300"
            title="Generate new pattern"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">Regenerate</span>
          </button>

          <button
            onClick={handleRandomizeAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors text-purple-400"
            title="Randomize all parameters"
          >
            <Shuffle className="w-4 h-4" />
            <span className="text-sm">Randomize All</span>
          </button>

          <button
            onClick={handleExport}
            disabled={isRecording}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-colors text-green-400 disabled:opacity-50"
            title="Export to audio file"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">
              {isRecording ? 'Recording...' : 'Export'}
            </span>
          </button>

          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-400"
            title="Reset all parameters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isRecording && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-sm">
              Recording in progress... The track will be exported when playback completes.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
