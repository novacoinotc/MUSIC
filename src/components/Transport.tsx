'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTrackStore } from '@/stores/trackStore';
import { audioEngine } from '@/lib/audioEngine';
import { generateSectionPatterns } from '@/lib/generators';
import {
  Play,
  Square,
  Download,
  Shuffle,
  RotateCcw,
  Volume2,
  Zap,
} from 'lucide-react';
import { Slider } from './Slider';
import * as Tone from 'tone';
import type { Scale, TechnoStyle, GrooveType } from '@/types';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SCALES: Scale[] = ['minor', 'phrygian', 'harmonicMinor', 'dorian', 'pentatonicMinor', 'melodicMinor', 'mixolydian'];
const STYLES: TechnoStyle[] = ['melodic', 'minimal', 'progressive', 'dark', 'acid', 'hypnotic'];
const GROOVES: GrooveType[] = ['straight', 'shuffle', 'syncopated', 'triplet', 'broken'];

export function Transport() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentTime, setCurrentTime] = useState('0:0:0');
  const [seed, setSeed] = useState(Date.now());

  // Get all store values
  const bpm = useTrackStore((s) => s.bpm);
  const key = useTrackStore((s) => s.key);
  const scale = useTrackStore((s) => s.scale);
  const secondaryScale = useTrackStore((s) => s.secondaryScale);
  const chordProgression = useTrackStore((s) => s.chordProgression);
  const style = useTrackStore((s) => s.style);
  const groove = useTrackStore((s) => s.groove);
  const masterVolume = useTrackStore((s) => s.masterVolume);
  const sections = useTrackStore((s) => s.sections);

  // All instruments
  const kick = useTrackStore((s) => s.kick);
  const bass = useTrackStore((s) => s.bass);
  const melody = useTrackStore((s) => s.melody);
  const hihat = useTrackStore((s) => s.hihat);
  const pad = useTrackStore((s) => s.pad);
  const pluck = useTrackStore((s) => s.pluck);
  const stab = useTrackStore((s) => s.stab);
  const piano = useTrackStore((s) => s.piano);
  const strings = useTrackStore((s) => s.strings);
  const acid = useTrackStore((s) => s.acid);
  const perc = useTrackStore((s) => s.perc);
  const arp = useTrackStore((s) => s.arp);
  const vocal = useTrackStore((s) => s.vocal);

  // Actions
  const setBPM = useTrackStore((s) => s.setBPM);
  const setKey = useTrackStore((s) => s.setKey);
  const setScale = useTrackStore((s) => s.setScale);
  const setStyle = useTrackStore((s) => s.setStyle);
  const setGroove = useTrackStore((s) => s.setGroove);
  const setMasterVolume = useTrackStore((s) => s.setMasterVolume);
  const randomizeAll = useTrackStore((s) => s.randomizeAll);
  const reset = useTrackStore((s) => s.reset);

  const initAudio = useCallback(async () => {
    if (isInitialized) return;
    await audioEngine.init();
    audioEngine.setBPM(bpm);
    audioEngine.setMasterVolume(masterVolume);
    audioEngine.setStyle(style);
    audioEngine.setGroove(groove, 0);

    // Initialize all instruments
    audioEngine.updateKick(kick);
    audioEngine.updateBass(bass);
    audioEngine.updateMelody(melody);
    audioEngine.updateHihat(hihat);
    audioEngine.updatePad(pad);
    audioEngine.updatePluck(pluck);
    audioEngine.updateStab(stab);
    audioEngine.updatePiano(piano);
    audioEngine.updateStrings(strings);
    audioEngine.updateAcid(acid);
    audioEngine.updatePerc(perc);
    audioEngine.updateVocal(vocal);

    setIsInitialized(true);
  }, [isInitialized, bpm, masterVolume, style, groove, kick, bass, melody, hihat, pad, pluck, stab, piano, strings, acid, perc, vocal]);

  // Sync settings
  useEffect(() => {
    if (isInitialized) audioEngine.setBPM(bpm);
  }, [bpm, isInitialized]);

  useEffect(() => {
    if (isInitialized) audioEngine.setMasterVolume(masterVolume);
  }, [masterVolume, isInitialized]);

  useEffect(() => {
    if (isInitialized) audioEngine.setStyle(style);
  }, [style, isInitialized]);

  useEffect(() => {
    if (isInitialized) audioEngine.setGroove(groove, 0);
  }, [groove, isInitialized]);

  // Sync all instrument parameters
  useEffect(() => { if (isInitialized) audioEngine.updateKick(kick); }, [kick, isInitialized]);
  useEffect(() => { if (isInitialized) audioEngine.updateBass(bass); }, [bass, isInitialized]);
  useEffect(() => { if (isInitialized) audioEngine.updateMelody(melody); }, [melody, isInitialized]);
  useEffect(() => { if (isInitialized) audioEngine.updateHihat(hihat); }, [hihat, isInitialized]);
  useEffect(() => { if (isInitialized) audioEngine.updatePad(pad); }, [pad, isInitialized]);
  useEffect(() => { if (isInitialized) audioEngine.updatePluck(pluck); }, [pluck, isInitialized]);
  useEffect(() => { if (isInitialized) audioEngine.updateStab(stab); }, [stab, isInitialized]);
  useEffect(() => { if (isInitialized) audioEngine.updatePiano(piano); }, [piano, isInitialized]);
  useEffect(() => { if (isInitialized) audioEngine.updateStrings(strings); }, [strings, isInitialized]);
  useEffect(() => { if (isInitialized) audioEngine.updateAcid(acid); }, [acid, isInitialized]);
  useEffect(() => { if (isInitialized) audioEngine.updatePerc(perc); }, [perc, isInitialized]);
  useEffect(() => { if (isInitialized) audioEngine.updateVocal(vocal); }, [vocal, isInitialized]);

  // Time display update
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(audioEngine.getTransportPosition());
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Stop handler
  const handleStop = useCallback(() => {
    audioEngine.stop();
    setIsPlaying(false);
    setCurrentTime('0:0:0');
  }, []);

  // Schedule all patterns to the transport
  const scheduleAllPatterns = useCallback((currentSeed: number) => {
    Tone.getTransport().cancel();

    let startBar = 0;
    sections.forEach((section, index) => {
      const patterns = generateSectionPatterns(
        section,
        key,
        scale,
        secondaryScale,
        chordProgression,
        style,
        groove,
        kick,
        bass,
        melody,
        hihat,
        pad,
        pluck,
        stab,
        piano,
        strings,
        acid,
        perc,
        arp,
        vocal,
        currentSeed + index
      );

      const startTime = Tone.Time(`${startBar}:0:0`).toSeconds();

      // Schedule all instruments
      audioEngine.schedulePattern(patterns.kick, 'kick', startTime);
      audioEngine.schedulePattern(patterns.bass, 'bass', startTime);
      audioEngine.schedulePattern(patterns.acid, 'acid', startTime);
      audioEngine.schedulePattern(patterns.melody, 'melody', startTime);
      audioEngine.schedulePattern(patterns.arp, 'arp', startTime);
      audioEngine.schedulePattern(patterns.pluck, 'pluck', startTime);
      audioEngine.schedulePattern(patterns.stab, 'stab', startTime);
      audioEngine.schedulePattern(patterns.piano, 'piano', startTime);
      audioEngine.schedulePattern(patterns.strings, 'strings', startTime);
      audioEngine.schedulePattern(patterns.pad, 'pad', startTime);
      audioEngine.schedulePattern(patterns.hihat, 'hihat', startTime);
      audioEngine.schedulePattern(patterns.openhat, 'openhat', startTime);
      audioEngine.schedulePattern(patterns.perc, 'perc', startTime);
      audioEngine.schedulePattern(patterns.vocal, 'vocal', startTime);

      startBar += section.bars;
    });

    // Schedule stop at end
    const totalBars = sections.reduce((sum, s) => sum + s.bars, 0);
    Tone.getTransport().schedule(() => {
      audioEngine.stop();
      setIsPlaying(false);
      setCurrentTime('0:0:0');
    }, `${totalBars}:0:0`);
  }, [sections, key, scale, secondaryScale, chordProgression, style, groove, kick, bass, melody, hihat, pad, pluck, stab, piano, strings, acid, perc, arp, vocal]);

  // Reschedule patterns when parameters change while playing
  useEffect(() => {
    if (isPlaying && isInitialized && !isRecording) {
      Tone.getTransport().stop();
      scheduleAllPatterns(seed);
      Tone.getTransport().position = 0;
      Tone.getTransport().start();
    }
  }, [key, scale, secondaryScale, chordProgression, style, groove, sections, isPlaying, isInitialized, isRecording, seed, scheduleAllPatterns]);

  const handlePlay = async () => {
    await initAudio();
    const newSeed = Date.now();
    setSeed(newSeed);
    scheduleAllPatterns(newSeed);
    audioEngine.play();
    setIsPlaying(true);
  };

  const handleRegenerate = async () => {
    await initAudio();
    const newSeed = Date.now();
    setSeed(newSeed);

    if (isPlaying) {
      Tone.getTransport().stop();
      Tone.getTransport().position = 0;
      scheduleAllPatterns(newSeed);
      Tone.getTransport().start();
    }
  };

  const handleRandomizeAll = async () => {
    await initAudio();
    randomizeAll();
    const newSeed = Date.now();
    setSeed(newSeed);

    setTimeout(() => {
      if (isPlaying) {
        Tone.getTransport().stop();
        Tone.getTransport().position = 0;
      }
    }, 50);
  };

  const handleExport = async () => {
    await initAudio();
    setIsRecording(true);

    const exportSeed = Date.now();
    await audioEngine.startRecording();
    scheduleAllPatterns(exportSeed);
    audioEngine.play();
    setIsPlaying(true);

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
        a.download = `synthforge-${style}-${key}${scale}-${bpm}bpm.webm`;
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
      <div className="flex items-center gap-4 flex-wrap">
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

          <div className="text-2xl font-mono text-white w-16">
            {formatTime(currentTime)}
          </div>
        </div>

        {/* BPM */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">BPM</label>
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBPM(parseInt(e.target.value) || 128)}
            className="w-14 bg-zinc-800 text-white text-center text-sm font-mono py-1 px-1 rounded border border-zinc-700 focus:border-green-500 outline-none"
            min={80}
            max={180}
          />
        </div>

        {/* Key */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">KEY</label>
          <select
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="bg-zinc-800 text-white text-sm py-1 px-2 rounded border border-zinc-700 focus:border-green-500 outline-none"
          >
            {NOTES.map((note) => (
              <option key={note} value={note}>{note}</option>
            ))}
          </select>
        </div>

        {/* Scale */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">SCALE</label>
          <select
            value={scale}
            onChange={(e) => setScale(e.target.value as Scale)}
            className="bg-zinc-800 text-white text-sm py-1 px-2 rounded border border-zinc-700 focus:border-green-500 outline-none"
          >
            {SCALES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Style */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">STYLE</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as TechnoStyle)}
            className="bg-zinc-800 text-white text-sm py-1 px-2 rounded border border-zinc-700 focus:border-purple-500 outline-none"
          >
            {STYLES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Groove */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">GROOVE</label>
          <select
            value={groove}
            onChange={(e) => setGroove(e.target.value as GrooveType)}
            className="bg-zinc-800 text-white text-sm py-1 px-2 rounded border border-zinc-700 focus:border-purple-500 outline-none"
          >
            {GROOVES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Master Volume */}
        <div className="flex items-center gap-2 min-w-[140px]">
          <Volume2 className="w-4 h-4 text-zinc-500" />
          <Slider
            value={masterVolume}
            min={0}
            max={100}
            label=""
            onChange={setMasterVolume}
            color="#00ff88"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300 text-sm"
            title="Generate new pattern"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </button>

          <button
            onClick={handleRandomizeAll}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors text-purple-400 text-sm"
            title="Randomize everything"
          >
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Random</span>
          </button>

          <button
            onClick={handleExport}
            disabled={isRecording}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-colors text-green-400 disabled:opacity-50 text-sm"
            title="Export to audio file"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{isRecording ? '...' : 'Export'}</span>
          </button>

          <button
            onClick={reset}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-500"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isRecording && (
        <div className="mt-3 p-2 rounded-lg bg-red-500/20 border border-red-500/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-xs">Recording...</span>
          </div>
        </div>
      )}
    </div>
  );
}
