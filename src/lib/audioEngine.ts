'use client';

import * as Tone from 'tone';
import type { KickParams, BassParams, MelodyParams, HiHatParams, PadParams, NoteEvent } from '@/types';

class AudioEngine {
  private initialized = false;

  // Kick - Punchy but warm
  private kickBody: Tone.MembraneSynth | null = null;
  private kickClick: Tone.NoiseSynth | null = null;
  private kickGain: Tone.Gain | null = null;

  // Bass - Deep and warm with sub layer
  private bassSynth: Tone.MonoSynth | null = null;
  private bassSubSynth: Tone.Synth | null = null;
  private bassGain: Tone.Gain | null = null;
  private bassFilter: Tone.Filter | null = null;

  // Lead Melody - Emotional with rich effects
  private melodySynth: Tone.PolySynth | null = null;
  private melodyGain: Tone.Gain | null = null;
  private melodyFilter: Tone.Filter | null = null;
  private melodyChorus: Tone.Chorus | null = null;
  private melodyReverb: Tone.Reverb | null = null;
  private melodyDelay: Tone.PingPongDelay | null = null;

  // Arpeggiator - Signature melodic techno sound
  private arpSynth: Tone.PolySynth | null = null;
  private arpGain: Tone.Gain | null = null;
  private arpFilter: Tone.Filter | null = null;
  private arpDelay: Tone.PingPongDelay | null = null;
  private arpReverb: Tone.Reverb | null = null;

  // Hi-hat - Crisp
  private hihatSynth: Tone.NoiseSynth | null = null;
  private hihatFilter: Tone.Filter | null = null;
  private hihatGain: Tone.Gain | null = null;

  // Pad - Lush and atmospheric
  private padSynth: Tone.PolySynth | null = null;
  private padSynth2: Tone.PolySynth | null = null;
  private padGain: Tone.Gain | null = null;
  private padFilter: Tone.Filter | null = null;
  private padChorus: Tone.Chorus | null = null;
  private padReverb: Tone.Reverb | null = null;

  // Master
  private masterCompressor: Tone.Compressor | null = null;
  private masterLimiter: Tone.Limiter | null = null;
  private masterGain: Tone.Gain | null = null;

  private recorder: Tone.Recorder | null = null;

  async init() {
    if (this.initialized) return;

    try {
      await Tone.start();

      // Master chain
      this.masterGain = new Tone.Gain(0.75);
      this.masterCompressor = new Tone.Compressor({
        threshold: -15,
        ratio: 3,
        attack: 0.01,
        release: 0.15,
      });
      this.masterLimiter = new Tone.Limiter(-0.5);

      this.masterGain.chain(this.masterCompressor, this.masterLimiter, Tone.getDestination());

      // Recorder
      this.recorder = new Tone.Recorder();
      this.masterLimiter.connect(this.recorder);

      // ============ KICK - Deep and punchy ============
      this.kickGain = new Tone.Gain(0.8).connect(this.masterGain);

      this.kickBody = new Tone.MembraneSynth({
        pitchDecay: 0.06,
        octaves: 4,
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.002,
          decay: 0.4,
          sustain: 0,
          release: 0.4,
        },
      }).connect(this.kickGain);

      // Click layer for attack
      const kickClickFilter = new Tone.Filter({ frequency: 3000, type: 'bandpass', Q: 2 }).connect(this.kickGain);
      this.kickClick = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: {
          attack: 0.001,
          decay: 0.015,
          sustain: 0,
          release: 0.01,
        },
      }).connect(kickClickFilter);

      // ============ BASS - Warm and deep ============
      this.bassGain = new Tone.Gain(0.65).connect(this.masterGain);
      this.bassFilter = new Tone.Filter({
        frequency: 300,
        type: 'lowpass',
        rolloff: -24,
        Q: 1,
      }).connect(this.bassGain);

      this.bassSynth = new Tone.MonoSynth({
        oscillator: { type: 'sawtooth' },
        filter: {
          Q: 2,
          type: 'lowpass',
          rolloff: -24,
        },
        envelope: {
          attack: 0.02,
          decay: 0.25,
          sustain: 0.35,
          release: 0.15,
        },
        filterEnvelope: {
          attack: 0.02,
          decay: 0.3,
          sustain: 0.2,
          release: 0.2,
          baseFrequency: 60,
          octaves: 2,
        },
      }).connect(this.bassFilter);

      // Sub bass - pure sine
      this.bassSubSynth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.02,
          decay: 0.3,
          sustain: 0.4,
          release: 0.2,
        },
      }).connect(this.bassGain);

      // ============ LEAD MELODY - Emotional Afterlife style ============
      this.melodyReverb = new Tone.Reverb({ decay: 4, wet: 0.4 }).connect(this.masterGain);
      this.melodyDelay = new Tone.PingPongDelay({ delayTime: '8n.', feedback: 0.3, wet: 0.3 }).connect(this.melodyReverb);
      this.melodyChorus = new Tone.Chorus({ frequency: 2, depth: 0.4, wet: 0.3 }).connect(this.melodyDelay);
      this.melodyFilter = new Tone.Filter({ frequency: 2500, type: 'lowpass', rolloff: -12 }).connect(this.melodyChorus);
      this.melodyGain = new Tone.Gain(0.4).connect(this.melodyFilter);

      this.melodySynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.08,
          decay: 0.5,
          sustain: 0.25,
          release: 1.2,
        },
      }).connect(this.melodyGain);

      // ============ ARPEGGIATOR - Classic melodic techno ============
      this.arpReverb = new Tone.Reverb({ decay: 5, wet: 0.45 }).connect(this.masterGain);
      this.arpDelay = new Tone.PingPongDelay({ delayTime: '16n', feedback: 0.4, wet: 0.35 }).connect(this.arpReverb);
      this.arpFilter = new Tone.Filter({ frequency: 3500, type: 'lowpass', rolloff: -12 }).connect(this.arpDelay);
      this.arpGain = new Tone.Gain(0.25).connect(this.arpFilter);

      this.arpSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.005,
          decay: 0.15,
          sustain: 0.05,
          release: 0.3,
        },
      }).connect(this.arpGain);

      // ============ HI-HAT ============
      this.hihatGain = new Tone.Gain(0.2).connect(this.masterGain);
      this.hihatFilter = new Tone.Filter({
        frequency: 8000,
        type: 'highpass',
      }).connect(this.hihatGain);

      this.hihatSynth = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: {
          attack: 0.001,
          decay: 0.06,
          sustain: 0,
          release: 0.03,
        },
      }).connect(this.hihatFilter);

      // ============ PAD - Lush atmospheric ============
      this.padReverb = new Tone.Reverb({ decay: 7, wet: 0.55 }).connect(this.masterGain);
      this.padChorus = new Tone.Chorus({ frequency: 0.3, depth: 0.8, wet: 0.5 }).connect(this.padReverb);
      this.padFilter = new Tone.Filter({ frequency: 1800, type: 'lowpass', rolloff: -12 }).connect(this.padChorus);
      this.padGain = new Tone.Gain(0.3).connect(this.padFilter);

      // Main pad layer
      this.padSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: {
          attack: 2,
          decay: 1.5,
          sustain: 0.7,
          release: 4,
        },
      }).connect(this.padGain);

      // Second pad layer - slight detune for richness
      this.padSynth2 = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 2.5,
          decay: 1,
          sustain: 0.6,
          release: 4,
        },
      }).connect(this.padGain);

      this.initialized = true;
    } catch (error) {
      console.error('Audio init error:', error);
    }
  }

  setBPM(bpm: number) {
    if (Tone.getTransport()) {
      Tone.getTransport().bpm.value = bpm;
    }
  }

  updateKick(params: KickParams) {
    if (!this.kickBody) return;

    this.kickBody.set({
      pitchDecay: 0.03 + (params.punch / 100) * 0.08,
      octaves: 3 + (params.sub / 100) * 3,
      envelope: {
        decay: 0.15 + (params.decay / 100) * 0.4,
      },
    });

    if (this.kickGain) {
      this.kickGain.gain.value = 0.5 + (params.drive / 100) * 0.4;
    }
  }

  updateBass(params: BassParams) {
    if (!this.bassSynth || !this.bassFilter) return;

    this.bassFilter.frequency.value = Math.min(params.cutoff, 500);
    this.bassFilter.Q.value = 0.5 + (params.resonance / 100) * 3;

    this.bassSynth.set({
      envelope: {
        attack: Math.max(0.01, params.attack / 1000),
        decay: params.decay / 1000,
        sustain: params.sustain / 100,
        release: params.release / 1000,
      },
    });
  }

  updateMelody(params: MelodyParams) {
    if (!this.melodySynth || !this.melodyReverb || !this.melodyDelay || !this.melodyFilter) return;

    this.melodySynth.set({
      envelope: {
        attack: Math.max(0.02, params.attack / 1000),
        release: params.release / 1000,
      },
    });

    this.melodyFilter.frequency.value = params.filterCutoff;
    this.melodyReverb.wet.value = params.reverbMix / 100;
    this.melodyDelay.wet.value = params.delayMix / 100;
  }

  updateHihat(params: HiHatParams) {
    if (!this.hihatSynth || !this.hihatFilter) return;

    this.hihatSynth.set({
      envelope: {
        decay: 0.03 + (params.decay / 100) * 0.1,
      },
    });

    this.hihatFilter.frequency.value = 6000 + (params.pitch / 100) * 6000;

    if (this.hihatGain) {
      this.hihatGain.gain.value = (params.velocity / 100) * 0.25;
    }
  }

  updatePad(params: PadParams) {
    if (!this.padSynth || !this.padReverb || !this.padFilter) return;

    this.padSynth.set({
      envelope: {
        attack: Math.max(0.5, params.attack / 1000),
        release: params.release / 1000,
      },
    });

    if (this.padSynth2) {
      this.padSynth2.set({
        envelope: {
          attack: Math.max(0.8, params.attack / 1000),
          release: params.release / 1000,
        },
      });
    }

    this.padFilter.frequency.value = params.filterCutoff;
    this.padReverb.wet.value = params.reverbMix / 100;
  }

  setMasterVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = (volume / 100) * 0.8;
    }
  }

  playKick(time?: number) {
    if (!this.kickBody) return;
    const t = time ?? Tone.now();
    this.kickBody.triggerAttackRelease('C1', '8n', t);
    if (this.kickClick) {
      this.kickClick.triggerAttackRelease('32n', t, 0.15);
    }
  }

  playBass(note: string, duration: string, time?: number) {
    if (!this.bassSynth) return;
    const t = time ?? Tone.now();
    this.bassSynth.triggerAttackRelease(note, duration, t, 0.7);

    // Sub layer one octave below
    if (this.bassSubSynth) {
      const subNote = note.replace(/(\d)/, (match) => String(Math.max(0, parseInt(match) - 1)));
      this.bassSubSynth.triggerAttackRelease(subNote, duration, t, 0.4);
    }
  }

  playMelody(note: string | string[], duration: string, time?: number, velocity?: number) {
    if (!this.melodySynth) return;
    this.melodySynth.triggerAttackRelease(note, duration, time ?? Tone.now(), velocity ?? 0.6);
  }

  playArp(note: string, duration: string, time?: number, velocity?: number) {
    if (!this.arpSynth) return;
    this.arpSynth.triggerAttackRelease(note, duration, time ?? Tone.now(), velocity ?? 0.4);
  }

  playHihat(time?: number, velocity?: number) {
    if (!this.hihatSynth) return;
    this.hihatSynth.triggerAttackRelease('16n', time ?? Tone.now(), velocity ?? 0.4);
  }

  playPad(notes: string[], duration: string, time?: number) {
    if (!this.padSynth) return;
    const t = time ?? Tone.now();
    this.padSynth.triggerAttackRelease(notes, duration, t, 0.35);

    // Second layer with slight timing offset for richness
    if (this.padSynth2) {
      this.padSynth2.triggerAttackRelease(notes, duration, t + 0.05, 0.25);
    }
  }

  schedulePattern(
    pattern: NoteEvent[],
    instrument: 'kick' | 'bass' | 'melody' | 'arp' | 'hihat' | 'pad',
    startTime: number = 0
  ) {
    pattern.forEach((event) => {
      const time = Tone.Time(event.time).toSeconds() + startTime;

      Tone.getTransport().schedule((t) => {
        switch (instrument) {
          case 'kick':
            this.playKick(t);
            break;
          case 'bass':
            this.playBass(event.note, event.duration, t);
            break;
          case 'melody':
            this.playMelody(event.note, event.duration, t, event.velocity);
            break;
          case 'arp':
            this.playArp(event.note, event.duration, t, event.velocity);
            break;
          case 'hihat':
            this.playHihat(t, event.velocity);
            break;
          case 'pad':
            this.playPad([event.note], event.duration, t);
            break;
        }
      }, time);
    });
  }

  play() {
    Tone.getTransport().start();
  }

  stop() {
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    Tone.getTransport().cancel();
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
    try {
      Tone.getTransport().cancel();
      this.kickBody?.dispose();
      this.kickClick?.dispose();
      this.bassSynth?.dispose();
      this.bassSubSynth?.dispose();
      this.melodySynth?.dispose();
      this.arpSynth?.dispose();
      this.hihatSynth?.dispose();
      this.padSynth?.dispose();
      this.padSynth2?.dispose();
      this.melodyReverb?.dispose();
      this.melodyDelay?.dispose();
      this.melodyChorus?.dispose();
      this.arpReverb?.dispose();
      this.arpDelay?.dispose();
      this.padReverb?.dispose();
      this.padChorus?.dispose();
      this.masterCompressor?.dispose();
      this.masterLimiter?.dispose();
      this.masterGain?.dispose();
      this.recorder?.dispose();
    } catch (e) {
      // Ignore dispose errors
    }
    this.initialized = false;
  }
}

export const audioEngine = new AudioEngine();
