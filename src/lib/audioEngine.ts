'use client';

import * as Tone from 'tone';
import type { KickParams, BassParams, MelodyParams, HiHatParams, PadParams, NoteEvent } from '@/types';

class AudioEngine {
  private initialized = false;
  private kickSynth: Tone.MembraneSynth | null = null;
  private bassSynth: Tone.MonoSynth | null = null;
  private melodySynth: Tone.PolySynth | null = null;
  private hihatSynth: Tone.NoiseSynth | null = null;
  private hihatFilter: Tone.Filter | null = null;
  private padSynth: Tone.PolySynth | null = null;

  private kickGain: Tone.Gain | null = null;
  private bassGain: Tone.Gain | null = null;
  private melodyGain: Tone.Gain | null = null;
  private hihatGain: Tone.Gain | null = null;
  private padGain: Tone.Gain | null = null;

  private melodyReverb: Tone.Reverb | null = null;
  private melodyDelay: Tone.FeedbackDelay | null = null;
  private padReverb: Tone.Reverb | null = null;
  private masterCompressor: Tone.Compressor | null = null;
  private masterLimiter: Tone.Limiter | null = null;
  private masterGain: Tone.Gain | null = null;

  private recorder: Tone.Recorder | null = null;

  async init() {
    if (this.initialized) return;

    await Tone.start();

    // Master chain
    this.masterGain = new Tone.Gain(0.8);
    this.masterCompressor = new Tone.Compressor({
      threshold: -20,
      ratio: 4,
      attack: 0.003,
      release: 0.25,
    });
    this.masterLimiter = new Tone.Limiter(-1);

    this.masterGain.chain(this.masterCompressor, this.masterLimiter, Tone.getDestination());

    // Initialize recorder
    this.recorder = new Tone.Recorder();
    this.masterLimiter.connect(this.recorder);

    // Kick
    this.kickGain = new Tone.Gain(0.9).connect(this.masterGain);
    this.kickSynth = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 6,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.4,
        sustain: 0.01,
        release: 1.4,
      },
    }).connect(this.kickGain);

    // Bass
    this.bassGain = new Tone.Gain(0.7).connect(this.masterGain);
    this.bassSynth = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      filter: {
        Q: 4,
        type: 'lowpass',
        rolloff: -24,
      },
      envelope: {
        attack: 0.005,
        decay: 0.2,
        sustain: 0.6,
        release: 0.1,
      },
      filterEnvelope: {
        attack: 0.005,
        decay: 0.2,
        sustain: 0.5,
        release: 0.2,
        baseFrequency: 200,
        octaves: 3,
      },
    }).connect(this.bassGain);

    // Melody with effects
    this.melodyReverb = new Tone.Reverb({ decay: 2, wet: 0.4 });
    this.melodyDelay = new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.3, wet: 0.3 });
    this.melodyGain = new Tone.Gain(0.5);
    this.melodyGain.chain(this.melodyDelay, this.melodyReverb, this.masterGain);

    this.melodySynth = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 10,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.3,
        release: 0.3,
      },
      modulation: { type: 'square' },
      modulationEnvelope: {
        attack: 0.5,
        decay: 0,
        sustain: 1,
        release: 0.5,
      },
    }).connect(this.melodyGain);

    // Hi-hat (using NoiseSynth with highpass filter)
    this.hihatGain = new Tone.Gain(0.3).connect(this.masterGain);
    this.hihatFilter = new Tone.Filter({
      frequency: 5000,
      type: 'highpass',
    }).connect(this.hihatGain);
    this.hihatSynth = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.01,
      },
    }).connect(this.hihatFilter);

    // Pad with reverb
    this.padReverb = new Tone.Reverb({ decay: 4, wet: 0.6 });
    this.padGain = new Tone.Gain(0.4);
    this.padGain.chain(this.padReverb, this.masterGain);

    this.padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.5,
        decay: 0.3,
        sustain: 0.8,
        release: 1,
      },
    }).connect(this.padGain);

    this.initialized = true;
  }

  setBPM(bpm: number) {
    Tone.getTransport().bpm.value = bpm;
  }

  updateKick(params: KickParams) {
    if (!this.kickSynth) return;

    this.kickSynth.set({
      pitchDecay: 0.01 + (params.punch / 100) * 0.1,
      octaves: 4 + (params.sub / 100) * 4,
      envelope: {
        decay: 0.1 + (params.decay / 100) * 0.6,
      },
    });

    if (this.kickGain) {
      this.kickGain.gain.value = 0.6 + (params.drive / 100) * 0.4;
    }
  }

  updateBass(params: BassParams) {
    if (!this.bassSynth) return;

    this.bassSynth.set({
      filter: {
        frequency: params.cutoff,
        Q: 1 + (params.resonance / 100) * 10,
      },
      envelope: {
        attack: params.attack / 1000,
        decay: params.decay / 1000,
        sustain: params.sustain / 100,
        release: params.release / 1000,
      },
    });
  }

  updateMelody(params: MelodyParams) {
    if (!this.melodySynth || !this.melodyReverb || !this.melodyDelay) return;

    this.melodySynth.set({
      envelope: {
        attack: params.attack / 1000,
        release: params.release / 1000,
      },
    });

    this.melodyReverb.wet.value = params.reverbMix / 100;
    this.melodyDelay.wet.value = params.delayMix / 100;
  }

  updateHihat(params: HiHatParams) {
    if (!this.hihatSynth || !this.hihatFilter) return;

    this.hihatSynth.set({
      envelope: {
        decay: 0.02 + (params.decay / 100) * 0.3,
      },
    });

    // Adjust filter frequency based on pitch
    this.hihatFilter.frequency.value = 3000 + (params.pitch / 100) * 8000;

    if (this.hihatGain) {
      this.hihatGain.gain.value = (params.velocity / 100) * 0.4;
    }
  }

  updatePad(params: PadParams) {
    if (!this.padSynth || !this.padReverb) return;

    this.padSynth.set({
      envelope: {
        attack: params.attack / 1000,
        release: params.release / 1000,
      },
    });

    this.padReverb.wet.value = params.reverbMix / 100;
  }

  setMasterVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = volume / 100;
    }
  }

  playKick(time?: number) {
    if (!this.kickSynth) return;
    this.kickSynth.triggerAttackRelease('C1', '8n', time);
  }

  playBass(note: string, duration: string, time?: number) {
    if (!this.bassSynth) return;
    this.bassSynth.triggerAttackRelease(note, duration, time);
  }

  playMelody(note: string | string[], duration: string, time?: number, velocity?: number) {
    if (!this.melodySynth) return;
    this.melodySynth.triggerAttackRelease(note, duration, time, velocity);
  }

  playHihat(time?: number, velocity?: number) {
    if (!this.hihatSynth) return;
    this.hihatSynth.triggerAttackRelease('16n', time);
  }

  playPad(notes: string[], duration: string, time?: number) {
    if (!this.padSynth) return;
    this.padSynth.triggerAttackRelease(notes, duration, time);
  }

  schedulePattern(
    pattern: NoteEvent[],
    instrument: 'kick' | 'bass' | 'melody' | 'hihat' | 'pad',
    startTime: number = 0
  ) {
    pattern.forEach((event) => {
      const time = Tone.Time(event.time).toSeconds() + startTime;

      switch (instrument) {
        case 'kick':
          this.playKick(time);
          break;
        case 'bass':
          this.playBass(event.note, event.duration, time);
          break;
        case 'melody':
          this.playMelody(event.note, event.duration, time, event.velocity);
          break;
        case 'hihat':
          this.playHihat(time, event.velocity);
          break;
        case 'pad':
          this.playPad([event.note], event.duration, time);
          break;
      }
    });
  }

  play() {
    Tone.getTransport().start();
  }

  stop() {
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
  }

  pause() {
    Tone.getTransport().pause();
  }

  async startRecording() {
    if (!this.recorder) return;
    this.recorder.start();
  }

  async stopRecording(): Promise<Blob | null> {
    if (!this.recorder) return null;
    const recording = await this.recorder.stop();
    return recording;
  }

  getTransportPosition(): string {
    return Tone.getTransport().position.toString();
  }

  dispose() {
    this.kickSynth?.dispose();
    this.bassSynth?.dispose();
    this.melodySynth?.dispose();
    this.hihatSynth?.dispose();
    this.hihatFilter?.dispose();
    this.padSynth?.dispose();
    this.melodyReverb?.dispose();
    this.melodyDelay?.dispose();
    this.padReverb?.dispose();
    this.masterCompressor?.dispose();
    this.masterLimiter?.dispose();
    this.masterGain?.dispose();
    this.recorder?.dispose();
    this.initialized = false;
  }
}

export const audioEngine = new AudioEngine();
