'use client';

import * as Tone from 'tone';
import type {
  KickParams, BassParams, MelodyParams, HiHatParams, PadParams,
  PluckParams, StabParams, PianoParams, StringsParams, AcidParams,
  PercParams, ArpParams, VocalParams, NoteEvent, TechnoStyle, GrooveType
} from '@/types';

type InstrumentType = 'kick' | 'bass' | 'melody' | 'arp' | 'hihat' | 'pad' |
  'pluck' | 'stab' | 'piano' | 'strings' | 'acid' | 'perc' | 'openhat' | 'vocal';

class AudioEngine {
  private initialized = false;

  // ========== KICK DRUMS ==========
  private kickBody: Tone.MembraneSynth | null = null;
  private kickClick: Tone.NoiseSynth | null = null;
  private kickDistortion: Tone.Distortion | null = null;
  private kickGain: Tone.Gain | null = null;

  // ========== BASS ==========
  private bassSynth: Tone.MonoSynth | null = null;
  private bassSubSynth: Tone.Synth | null = null;
  private bassDistortion: Tone.Distortion | null = null;
  private bassFilter: Tone.Filter | null = null;
  private bassGain: Tone.Gain | null = null;

  // ========== ACID BASS (303 style) ==========
  private acidSynth: Tone.MonoSynth | null = null;
  private acidFilter: Tone.Filter | null = null;
  private acidDistortion: Tone.Distortion | null = null;
  private acidGain: Tone.Gain | null = null;

  // ========== LEAD MELODY ==========
  private melodySynth: Tone.PolySynth | null = null;
  private melodyFilter: Tone.Filter | null = null;
  private melodyChorus: Tone.Chorus | null = null;
  private melodyReverb: Tone.Reverb | null = null;
  private melodyDelay: Tone.PingPongDelay | null = null;
  private melodyGain: Tone.Gain | null = null;

  // ========== ARPEGGIATOR ==========
  private arpSynth: Tone.PolySynth | null = null;
  private arpFilter: Tone.Filter | null = null;
  private arpDelay: Tone.PingPongDelay | null = null;
  private arpReverb: Tone.Reverb | null = null;
  private arpGain: Tone.Gain | null = null;

  // ========== PLUCK SYNTH ==========
  private pluckSynth: Tone.PluckSynth | null = null;
  private pluckSynth2: Tone.PolySynth | null = null;
  private pluckFilter: Tone.Filter | null = null;
  private pluckDelay: Tone.PingPongDelay | null = null;
  private pluckReverb: Tone.Reverb | null = null;
  private pluckGain: Tone.Gain | null = null;

  // ========== STAB SYNTH ==========
  private stabSynth: Tone.PolySynth | null = null;
  private stabFilter: Tone.Filter | null = null;
  private stabReverb: Tone.Reverb | null = null;
  private stabGain: Tone.Gain | null = null;

  // ========== PIANO ==========
  private pianoSynth: Tone.PolySynth | null = null;
  private pianoReverb: Tone.Reverb | null = null;
  private pianoGain: Tone.Gain | null = null;

  // ========== STRINGS ==========
  private stringsSynth: Tone.PolySynth | null = null;
  private stringsSynth2: Tone.PolySynth | null = null;
  private stringsChorus: Tone.Chorus | null = null;
  private stringsReverb: Tone.Reverb | null = null;
  private stringsFilter: Tone.Filter | null = null;
  private stringsGain: Tone.Gain | null = null;

  // ========== PADS ==========
  private padSynth: Tone.PolySynth | null = null;
  private padSynth2: Tone.PolySynth | null = null;
  private padFilter: Tone.Filter | null = null;
  private padChorus: Tone.Chorus | null = null;
  private padReverb: Tone.Reverb | null = null;
  private padGain: Tone.Gain | null = null;

  // ========== HI-HATS ==========
  private hihatClosed: Tone.NoiseSynth | null = null;
  private hihatOpen: Tone.NoiseSynth | null = null;
  private hihatFilter: Tone.Filter | null = null;
  private hihatGain: Tone.Gain | null = null;

  // ========== PERCUSSION ==========
  private clapSynth: Tone.NoiseSynth | null = null;
  private clapReverb: Tone.Reverb | null = null;
  private rimSynth: Tone.MembraneSynth | null = null;
  private tomSynth: Tone.MembraneSynth | null = null;
  private shakerSynth: Tone.NoiseSynth | null = null;
  private percGain: Tone.Gain | null = null;

  // ========== VOCALS (Formant Synthesis) ==========
  private vocalSynth1: Tone.PolySynth | null = null;
  private vocalSynth2: Tone.PolySynth | null = null;
  private vocalSynth3: Tone.PolySynth | null = null;
  private vocalFilter1: Tone.Filter | null = null;
  private vocalFilter2: Tone.Filter | null = null;
  private vocalFilter3: Tone.Filter | null = null;
  private vocalChorus: Tone.Chorus | null = null;
  private vocalReverb: Tone.Reverb | null = null;
  private vocalDelay: Tone.PingPongDelay | null = null;
  private vocalGain: Tone.Gain | null = null;
  private vocalType: 'ooh' | 'aah' | 'eeh' | 'choir' = 'ooh';

  // ========== MASTER CHAIN ==========
  private masterCompressor: Tone.Compressor | null = null;
  private masterLimiter: Tone.Limiter | null = null;
  private masterGain: Tone.Gain | null = null;
  private recorder: Tone.Recorder | null = null;

  // Style/groove settings
  private currentStyle: TechnoStyle = 'melodic';
  private currentGroove: GrooveType = 'straight';
  private swingAmount = 0;

  async init() {
    if (this.initialized) return;

    try {
      await Tone.start();

      // ===== MASTER CHAIN =====
      this.masterGain = new Tone.Gain(0.7);
      this.masterCompressor = new Tone.Compressor({
        threshold: -12,
        ratio: 4,
        attack: 0.005,
        release: 0.1,
      });
      this.masterLimiter = new Tone.Limiter(-0.5);
      this.masterGain.chain(this.masterCompressor, this.masterLimiter, Tone.getDestination());

      this.recorder = new Tone.Recorder();
      this.masterLimiter.connect(this.recorder);

      // ===== KICK DRUM =====
      this.kickGain = new Tone.Gain(0.85).connect(this.masterGain);
      this.kickDistortion = new Tone.Distortion(0.1).connect(this.kickGain);

      this.kickBody = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 5,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.3 },
      }).connect(this.kickDistortion);

      const kickClickFilter = new Tone.Filter({ frequency: 4000, type: 'bandpass', Q: 3 }).connect(this.kickGain);
      this.kickClick = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.012, sustain: 0, release: 0.008 },
      }).connect(kickClickFilter);

      // ===== BASS =====
      this.bassGain = new Tone.Gain(0.6).connect(this.masterGain);
      this.bassDistortion = new Tone.Distortion(0).connect(this.bassGain);
      this.bassFilter = new Tone.Filter({ frequency: 400, type: 'lowpass', rolloff: -24, Q: 1.5 }).connect(this.bassDistortion);

      this.bassSynth = new Tone.MonoSynth({
        oscillator: { type: 'sawtooth' },
        filter: { Q: 3, type: 'lowpass', rolloff: -24 },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.12 },
        filterEnvelope: { attack: 0.01, decay: 0.25, sustain: 0.25, release: 0.15, baseFrequency: 80, octaves: 2.5 },
      }).connect(this.bassFilter);

      this.bassSubSynth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.25, sustain: 0.5, release: 0.15 },
      }).connect(this.bassGain);

      // ===== ACID BASS (303) =====
      this.acidGain = new Tone.Gain(0.45).connect(this.masterGain);
      this.acidDistortion = new Tone.Distortion(0.4).connect(this.acidGain);
      this.acidFilter = new Tone.Filter({ frequency: 500, type: 'lowpass', rolloff: -24, Q: 8 }).connect(this.acidDistortion);

      this.acidSynth = new Tone.MonoSynth({
        oscillator: { type: 'sawtooth' },
        filter: { Q: 6, type: 'lowpass', rolloff: -24 },
        envelope: { attack: 0.003, decay: 0.15, sustain: 0.1, release: 0.05 },
        filterEnvelope: { attack: 0.002, decay: 0.2, sustain: 0.1, release: 0.1, baseFrequency: 200, octaves: 4 },
      }).connect(this.acidFilter);

      // ===== LEAD MELODY =====
      this.melodyReverb = new Tone.Reverb({ decay: 3.5, wet: 0.35 }).connect(this.masterGain);
      this.melodyDelay = new Tone.PingPongDelay({ delayTime: '8n.', feedback: 0.25, wet: 0.25 }).connect(this.melodyReverb);
      this.melodyChorus = new Tone.Chorus({ frequency: 1.5, depth: 0.35, wet: 0.25 }).connect(this.melodyDelay);
      this.melodyFilter = new Tone.Filter({ frequency: 3000, type: 'lowpass', rolloff: -12 }).connect(this.melodyChorus);
      this.melodyGain = new Tone.Gain(0.35).connect(this.melodyFilter);

      this.melodySynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.06, decay: 0.4, sustain: 0.3, release: 1 },
      }).connect(this.melodyGain);

      // ===== ARPEGGIATOR =====
      this.arpReverb = new Tone.Reverb({ decay: 4, wet: 0.4 }).connect(this.masterGain);
      this.arpDelay = new Tone.PingPongDelay({ delayTime: '16n', feedback: 0.35, wet: 0.3 }).connect(this.arpReverb);
      this.arpFilter = new Tone.Filter({ frequency: 4000, type: 'lowpass', rolloff: -12 }).connect(this.arpDelay);
      this.arpGain = new Tone.Gain(0.22).connect(this.arpFilter);

      this.arpSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.003, decay: 0.12, sustain: 0.08, release: 0.25 },
      }).connect(this.arpGain);

      // ===== PLUCK SYNTH =====
      this.pluckReverb = new Tone.Reverb({ decay: 3, wet: 0.45 }).connect(this.masterGain);
      this.pluckDelay = new Tone.PingPongDelay({ delayTime: '8n', feedback: 0.3, wet: 0.35 }).connect(this.pluckReverb);
      this.pluckFilter = new Tone.Filter({ frequency: 3500, type: 'lowpass' }).connect(this.pluckDelay);
      this.pluckGain = new Tone.Gain(0.28).connect(this.pluckFilter);

      this.pluckSynth = new Tone.PluckSynth({
        attackNoise: 2,
        dampening: 3000,
        resonance: 0.95,
      }).connect(this.pluckGain);

      this.pluckSynth2 = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.002, decay: 0.3, sustain: 0, release: 0.3 },
      }).connect(this.pluckGain);

      // ===== STAB SYNTH =====
      this.stabReverb = new Tone.Reverb({ decay: 2, wet: 0.3 }).connect(this.masterGain);
      this.stabFilter = new Tone.Filter({ frequency: 4000, type: 'lowpass', rolloff: -12 }).connect(this.stabReverb);
      this.stabGain = new Tone.Gain(0.3).connect(this.stabFilter);

      this.stabSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.003, decay: 0.15, sustain: 0.1, release: 0.15 },
      }).connect(this.stabGain);

      // ===== PIANO =====
      this.pianoReverb = new Tone.Reverb({ decay: 2.5, wet: 0.35 }).connect(this.masterGain);
      this.pianoGain = new Tone.Gain(0.32).connect(this.pianoReverb);

      this.pianoSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.002, decay: 1.2, sustain: 0.1, release: 1.5 },
      }).connect(this.pianoGain);

      // ===== STRINGS =====
      this.stringsReverb = new Tone.Reverb({ decay: 5, wet: 0.5 }).connect(this.masterGain);
      this.stringsChorus = new Tone.Chorus({ frequency: 0.5, depth: 0.6, wet: 0.4 }).connect(this.stringsReverb);
      this.stringsFilter = new Tone.Filter({ frequency: 2500, type: 'lowpass' }).connect(this.stringsChorus);
      this.stringsGain = new Tone.Gain(0.25).connect(this.stringsFilter);

      this.stringsSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 1.5, decay: 0.8, sustain: 0.6, release: 2.5 },
      }).connect(this.stringsGain);

      this.stringsSynth2 = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 2, decay: 1, sustain: 0.5, release: 3 },
      }).connect(this.stringsGain);

      // ===== PADS =====
      this.padReverb = new Tone.Reverb({ decay: 6, wet: 0.55 }).connect(this.masterGain);
      this.padChorus = new Tone.Chorus({ frequency: 0.3, depth: 0.7, wet: 0.45 }).connect(this.padReverb);
      this.padFilter = new Tone.Filter({ frequency: 2000, type: 'lowpass', rolloff: -12 }).connect(this.padChorus);
      this.padGain = new Tone.Gain(0.28).connect(this.padFilter);

      this.padSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 1.8, decay: 1.2, sustain: 0.65, release: 3.5 },
      }).connect(this.padGain);

      this.padSynth2 = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 2.2, decay: 1, sustain: 0.55, release: 4 },
      }).connect(this.padGain);

      // ===== HI-HATS =====
      this.hihatGain = new Tone.Gain(0.18).connect(this.masterGain);
      this.hihatFilter = new Tone.Filter({ frequency: 9000, type: 'highpass' }).connect(this.hihatGain);

      this.hihatClosed = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.02 },
      }).connect(this.hihatFilter);

      this.hihatOpen = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.15 },
      }).connect(this.hihatFilter);

      // ===== PERCUSSION =====
      this.percGain = new Tone.Gain(0.35).connect(this.masterGain);
      this.clapReverb = new Tone.Reverb({ decay: 1.2, wet: 0.35 }).connect(this.percGain);

      this.clapSynth = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.08 },
      }).connect(this.clapReverb);

      const rimFilter = new Tone.Filter({ frequency: 2000, type: 'bandpass', Q: 5 }).connect(this.percGain);
      this.rimSynth = new Tone.MembraneSynth({
        pitchDecay: 0.008,
        octaves: 2,
        envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.02 },
      }).connect(rimFilter);

      this.tomSynth = new Tone.MembraneSynth({
        pitchDecay: 0.04,
        octaves: 3,
        envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.15 },
      }).connect(this.percGain);

      const shakerFilter = new Tone.Filter({ frequency: 6000, type: 'highpass' }).connect(this.percGain);
      this.shakerSynth = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.02 },
      }).connect(shakerFilter);

      // ===== VOCALS (Formant Synthesis for ooh/aah sounds) =====
      // Using 3 bandpass-filtered oscillators to simulate vocal formants
      this.vocalReverb = new Tone.Reverb({ decay: 4.5, wet: 0.5 }).connect(this.masterGain);
      this.vocalDelay = new Tone.PingPongDelay({ delayTime: '8n.', feedback: 0.2, wet: 0.25 }).connect(this.vocalReverb);
      this.vocalChorus = new Tone.Chorus({ frequency: 2, depth: 0.5, wet: 0.4 }).connect(this.vocalDelay);
      this.vocalGain = new Tone.Gain(0.28).connect(this.vocalChorus);

      // Formant 1 (low)
      this.vocalFilter1 = new Tone.Filter({ frequency: 500, type: 'bandpass', Q: 5 }).connect(this.vocalGain);
      this.vocalSynth1 = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.3, decay: 0.5, sustain: 0.6, release: 1.5 },
      }).connect(this.vocalFilter1);

      // Formant 2 (mid)
      this.vocalFilter2 = new Tone.Filter({ frequency: 1000, type: 'bandpass', Q: 4 }).connect(this.vocalGain);
      this.vocalSynth2 = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.35, decay: 0.6, sustain: 0.5, release: 1.8 },
      }).connect(this.vocalFilter2);

      // Formant 3 (high)
      this.vocalFilter3 = new Tone.Filter({ frequency: 2800, type: 'bandpass', Q: 6 }).connect(this.vocalGain);
      this.vocalSynth3 = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.4, decay: 0.4, sustain: 0.4, release: 2 },
      }).connect(this.vocalFilter3);

      this.initialized = true;
    } catch (error) {
      console.error('Audio init error:', error);
    }
  }

  setStyle(style: TechnoStyle) {
    this.currentStyle = style;
  }

  setGroove(groove: GrooveType, swing: number = 0) {
    this.currentGroove = groove;
    this.swingAmount = swing;
    Tone.getTransport().swing = swing / 100;
  }

  setBPM(bpm: number) {
    Tone.getTransport().bpm.value = bpm;
  }

  // ========== UPDATE METHODS ==========

  updateKick(params: KickParams) {
    if (!this.kickBody) return;

    const decayTime = 0.15 + (params.decay / 100) * 0.4;
    const pitchDecay = 0.02 + (params.punch / 100) * 0.08;
    const octaves = 3 + (params.sub / 100) * 4;

    this.kickBody.set({
      pitchDecay,
      octaves,
      envelope: { decay: decayTime },
    });

    if (this.kickDistortion) {
      this.kickDistortion.distortion = (params.drive / 100) * 0.5;
    }

    if (this.kickGain) {
      this.kickGain.gain.value = 0.6 + (params.drive / 100) * 0.3;
    }
  }

  updateBass(params: BassParams) {
    if (!this.bassSynth || !this.bassFilter) return;

    this.bassFilter.frequency.value = Math.min(params.cutoff, 600);
    this.bassFilter.Q.value = 0.5 + (params.resonance / 100) * 4;

    if (this.bassDistortion) {
      this.bassDistortion.distortion = (params.distortion / 100) * 0.6;
    }

    this.bassSynth.set({
      envelope: {
        attack: Math.max(0.005, params.attack / 1000),
        decay: params.decay / 1000,
        sustain: params.sustain / 100,
        release: params.release / 1000,
      },
    });
  }

  updateAcid(params: AcidParams) {
    if (!this.acidSynth || !this.acidFilter) return;

    this.acidFilter.frequency.value = params.cutoff;
    this.acidFilter.Q.value = 2 + (params.resonance / 100) * 10;

    this.acidSynth.set({
      filterEnvelope: {
        baseFrequency: 100 + params.cutoff * 0.3,
        octaves: 2 + (params.envMod / 100) * 4,
        decay: params.decay / 1000,
      },
    });

    if (this.acidDistortion) {
      this.acidDistortion.distortion = 0.2 + (params.accent / 100) * 0.5;
    }
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
    if (!this.hihatClosed || !this.hihatFilter) return;

    this.hihatClosed.set({
      envelope: { decay: 0.02 + (params.decay / 100) * 0.08 },
    });

    if (this.hihatOpen) {
      this.hihatOpen.set({
        envelope: { decay: 0.1 + (params.decay / 100) * 0.25 },
      });
    }

    this.hihatFilter.frequency.value = 7000 + (params.pitch / 100) * 5000;

    if (this.hihatGain) {
      this.hihatGain.gain.value = (params.velocity / 100) * 0.22;
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
          attack: Math.max(0.7, params.attack / 1000),
          release: params.release / 1000,
        },
      });
    }

    this.padFilter.frequency.value = params.filterCutoff;
    this.padReverb.wet.value = params.reverbMix / 100;
  }

  updatePluck(params: PluckParams) {
    if (!this.pluckSynth || !this.pluckFilter) return;

    this.pluckSynth.set({
      dampening: 1000 + (params.brightness / 100) * 4000,
      resonance: 0.9 + (params.resonance / 100) * 0.09,
    });

    this.pluckFilter.frequency.value = 2000 + (params.brightness / 100) * 4000;

    if (this.pluckReverb) {
      this.pluckReverb.wet.value = params.reverbMix / 100;
    }
    if (this.pluckDelay) {
      this.pluckDelay.wet.value = params.delayMix / 100;
    }
  }

  updateStab(params: StabParams) {
    if (!this.stabSynth || !this.stabFilter) return;

    this.stabSynth.set({
      envelope: {
        attack: Math.max(0.002, params.attack / 1000),
        release: params.release / 1000,
      },
    });

    this.stabFilter.frequency.value = params.filterCutoff;

    if (this.stabReverb) {
      this.stabReverb.wet.value = params.reverbMix / 100;
    }
  }

  updatePiano(params: PianoParams) {
    if (!this.pianoSynth) return;

    // Brightness affects decay
    this.pianoSynth.set({
      envelope: {
        decay: 0.8 + (params.brightness / 100) * 0.6,
      },
    });

    if (this.pianoReverb) {
      this.pianoReverb.wet.value = params.reverb / 100;
    }

    if (this.pianoGain) {
      this.pianoGain.gain.value = 0.2 + (params.velocity / 100) * 0.2;
    }
  }

  updateStrings(params: StringsParams) {
    if (!this.stringsSynth || !this.stringsFilter) return;

    this.stringsSynth.set({
      envelope: {
        attack: params.attack / 1000,
        release: params.release / 1000,
      },
    });

    if (this.stringsSynth2) {
      this.stringsSynth2.set({
        envelope: {
          attack: (params.attack / 1000) * 1.3,
          release: (params.release / 1000) * 1.2,
        },
      });
    }

    this.stringsFilter.frequency.value = 1500 + (params.brightness / 100) * 2500;

    if (this.stringsChorus) {
      this.stringsChorus.wet.value = params.ensemble / 100;
    }

    if (this.stringsReverb) {
      this.stringsReverb.wet.value = params.reverbMix / 100;
    }
  }

  updatePerc(params: PercParams) {
    if (!this.clapSynth) return;

    this.clapSynth.set({
      envelope: { decay: 0.08 + (params.decay / 100) * 0.12 },
    });

    if (this.tomSynth) {
      this.tomSynth.set({
        pitchDecay: 0.02 + (params.pitch / 100) * 0.06,
      });
    }

    if (this.clapReverb) {
      this.clapReverb.wet.value = params.reverb / 100;
    }
  }

  updateVocal(params: VocalParams) {
    if (!this.vocalFilter1 || !this.vocalFilter2 || !this.vocalFilter3) return;

    this.vocalType = params.type;

    // Formant frequencies for different vowels (approximations)
    // These simulate different vocal sounds
    const formants: Record<typeof params.type, [number, number, number]> = {
      ooh: [350, 850, 2500],     // "oo" sound - rounder, darker
      aah: [700, 1200, 2800],    // "ah" sound - open, warm
      eeh: [400, 2200, 3000],    // "ee" sound - brighter
      choir: [500, 1000, 2700],  // Choir pad - blend
    };

    const [f1, f2, f3] = formants[params.type];

    // Apply formant frequencies with brightness adjustment
    const brightnessOffset = (params.brightness - 50) * 20;
    this.vocalFilter1.frequency.value = f1 + brightnessOffset * 0.5;
    this.vocalFilter2.frequency.value = f2 + brightnessOffset;
    this.vocalFilter3.frequency.value = f3 + brightnessOffset;

    // Gender affects the resonance and pitch range
    // Lower Q for male (broader formants), higher Q for female (sharper)
    const qMultiplier = params.gender === 'female' ? 1.3 : params.gender === 'male' ? 0.7 : 1;
    this.vocalFilter1.Q.value = 5 * qMultiplier;
    this.vocalFilter2.Q.value = 4 * qMultiplier;
    this.vocalFilter3.Q.value = 6 * qMultiplier;

    // Update envelope for breathiness
    const attackTime = 0.2 + (params.attack / 1000);
    const releaseTime = 1 + (params.release / 500);

    if (this.vocalSynth1) {
      this.vocalSynth1.set({
        envelope: { attack: attackTime, release: releaseTime },
      });
    }
    if (this.vocalSynth2) {
      this.vocalSynth2.set({
        envelope: { attack: attackTime * 1.1, release: releaseTime * 1.1 },
      });
    }
    if (this.vocalSynth3) {
      this.vocalSynth3.set({
        envelope: { attack: attackTime * 1.2, release: releaseTime * 0.9 },
      });
    }

    if (this.vocalReverb) {
      this.vocalReverb.wet.value = params.reverbMix / 100;
    }
    if (this.vocalGain) {
      this.vocalGain.gain.value = 0.2 + (params.mix / 100) * 0.15;
    }
  }

  setMasterVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = (volume / 100) * 0.75;
    }
  }

  // ========== PLAY METHODS ==========

  playKick(time?: number) {
    if (!this.kickBody) return;
    const t = time ?? Tone.now();
    this.kickBody.triggerAttackRelease('C1', '8n', t);
    if (this.kickClick) {
      this.kickClick.triggerAttackRelease('32n', t, 0.12);
    }
  }

  playBass(note: string, duration: string, time?: number, velocity?: number) {
    if (!this.bassSynth) return;
    const t = time ?? Tone.now();
    const v = velocity ?? 0.7;
    this.bassSynth.triggerAttackRelease(note, duration, t, v);

    if (this.bassSubSynth) {
      const subNote = note.replace(/(\d)/, (m) => String(Math.max(0, parseInt(m) - 1)));
      this.bassSubSynth.triggerAttackRelease(subNote, duration, t, v * 0.5);
    }
  }

  playAcid(note: string, duration: string, time?: number, velocity?: number, slide?: boolean) {
    if (!this.acidSynth) return;
    const t = time ?? Tone.now();
    if (slide) {
      this.acidSynth.setNote(note, t);
    } else {
      this.acidSynth.triggerAttackRelease(note, duration, t, velocity ?? 0.7);
    }
  }

  playMelody(note: string | string[], duration: string, time?: number, velocity?: number) {
    if (!this.melodySynth) return;
    this.melodySynth.triggerAttackRelease(note, duration, time ?? Tone.now(), velocity ?? 0.55);
  }

  playArp(note: string, duration: string, time?: number, velocity?: number) {
    if (!this.arpSynth) return;
    this.arpSynth.triggerAttackRelease(note, duration, time ?? Tone.now(), velocity ?? 0.35);
  }

  playPluck(note: string, time?: number, velocity?: number) {
    if (!this.pluckSynth) return;
    const t = time ?? Tone.now();
    this.pluckSynth.triggerAttack(note, t);
    if (this.pluckSynth2) {
      this.pluckSynth2.triggerAttackRelease(note, '8n', t, (velocity ?? 0.4) * 0.6);
    }
  }

  playStab(notes: string[], duration: string, time?: number, velocity?: number) {
    if (!this.stabSynth) return;
    this.stabSynth.triggerAttackRelease(notes, duration, time ?? Tone.now(), velocity ?? 0.5);
  }

  playPiano(notes: string[], duration: string, time?: number, velocity?: number) {
    if (!this.pianoSynth) return;
    this.pianoSynth.triggerAttackRelease(notes, duration, time ?? Tone.now(), velocity ?? 0.55);
  }

  playStrings(notes: string[], duration: string, time?: number, velocity?: number) {
    if (!this.stringsSynth) return;
    const t = time ?? Tone.now();
    this.stringsSynth.triggerAttackRelease(notes, duration, t, velocity ?? 0.4);
    if (this.stringsSynth2) {
      this.stringsSynth2.triggerAttackRelease(notes, duration, t + 0.1, (velocity ?? 0.4) * 0.7);
    }
  }

  playPad(notes: string[], duration: string, time?: number) {
    if (!this.padSynth) return;
    const t = time ?? Tone.now();
    this.padSynth.triggerAttackRelease(notes, duration, t, 0.32);
    if (this.padSynth2) {
      this.padSynth2.triggerAttackRelease(notes, duration, t + 0.08, 0.22);
    }
  }

  playHihatClosed(time?: number, velocity?: number) {
    if (!this.hihatClosed) return;
    this.hihatClosed.triggerAttackRelease('16n', time ?? Tone.now(), velocity ?? 0.4);
  }

  playHihatOpen(time?: number, velocity?: number) {
    if (!this.hihatOpen) return;
    this.hihatOpen.triggerAttackRelease('8n', time ?? Tone.now(), velocity ?? 0.35);
  }

  playClap(time?: number, velocity?: number) {
    if (!this.clapSynth) return;
    this.clapSynth.triggerAttackRelease('16n', time ?? Tone.now(), velocity ?? 0.6);
  }

  playRim(time?: number, velocity?: number) {
    if (!this.rimSynth) return;
    this.rimSynth.triggerAttackRelease('G4', '32n', time ?? Tone.now(), velocity ?? 0.5);
  }

  playTom(note: string, time?: number, velocity?: number) {
    if (!this.tomSynth) return;
    this.tomSynth.triggerAttackRelease(note, '8n', time ?? Tone.now(), velocity ?? 0.6);
  }

  playShaker(time?: number, velocity?: number) {
    if (!this.shakerSynth) return;
    this.shakerSynth.triggerAttackRelease('32n', time ?? Tone.now(), velocity ?? 0.3);
  }

  playVocal(notes: string | string[], duration: string, time?: number, velocity?: number) {
    if (!this.vocalSynth1 || !this.vocalSynth2 || !this.vocalSynth3) return;
    const t = time ?? Tone.now();
    const v = velocity ?? 0.35;
    const notesArr = Array.isArray(notes) ? notes : [notes];

    // All three formant layers play the same notes
    this.vocalSynth1.triggerAttackRelease(notesArr, duration, t, v);
    this.vocalSynth2.triggerAttackRelease(notesArr, duration, t + 0.02, v * 0.8);
    this.vocalSynth3.triggerAttackRelease(notesArr, duration, t + 0.04, v * 0.5);
  }

  // ========== PATTERN SCHEDULING ==========

  schedulePattern(pattern: NoteEvent[], instrument: InstrumentType, startTime: number = 0) {
    pattern.forEach((event) => {
      const time = Tone.Time(event.time).toSeconds() + startTime;

      Tone.getTransport().schedule((t) => {
        switch (instrument) {
          case 'kick':
            this.playKick(t);
            break;
          case 'bass':
            this.playBass(event.note, event.duration, t, event.velocity);
            break;
          case 'acid':
            this.playAcid(event.note, event.duration, t, event.velocity);
            break;
          case 'melody':
            this.playMelody(event.note, event.duration, t, event.velocity);
            break;
          case 'arp':
            this.playArp(event.note, event.duration, t, event.velocity);
            break;
          case 'pluck':
            this.playPluck(event.note, t, event.velocity);
            break;
          case 'stab':
            this.playStab([event.note], event.duration, t, event.velocity);
            break;
          case 'piano':
            this.playPiano([event.note], event.duration, t, event.velocity);
            break;
          case 'strings':
            this.playStrings([event.note], event.duration, t, event.velocity);
            break;
          case 'pad':
            this.playPad([event.note], event.duration, t);
            break;
          case 'hihat':
            this.playHihatClosed(t, event.velocity);
            break;
          case 'openhat':
            this.playHihatOpen(t, event.velocity);
            break;
          case 'perc':
            // Use note to determine perc type
            if (event.note === 'clap') this.playClap(t, event.velocity);
            else if (event.note === 'rim') this.playRim(t, event.velocity);
            else if (event.note === 'shaker') this.playShaker(t, event.velocity);
            else this.playTom(event.note, t, event.velocity);
            break;
          case 'vocal':
            this.playVocal(event.note, event.duration, t, event.velocity);
            break;
        }
      }, time);
    });
  }

  // ========== TRANSPORT CONTROLS ==========

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
    return await this.recorder.stop();
  }

  getTransportPosition(): string {
    return Tone.getTransport().position.toString();
  }

  dispose() {
    try {
      Tone.getTransport().cancel();
      // Dispose all synths and effects
      [
        this.kickBody, this.kickClick, this.kickDistortion, this.kickGain,
        this.bassSynth, this.bassSubSynth, this.bassDistortion, this.bassFilter, this.bassGain,
        this.acidSynth, this.acidFilter, this.acidDistortion, this.acidGain,
        this.melodySynth, this.melodyFilter, this.melodyChorus, this.melodyReverb, this.melodyDelay, this.melodyGain,
        this.arpSynth, this.arpFilter, this.arpDelay, this.arpReverb, this.arpGain,
        this.pluckSynth, this.pluckSynth2, this.pluckFilter, this.pluckDelay, this.pluckReverb, this.pluckGain,
        this.stabSynth, this.stabFilter, this.stabReverb, this.stabGain,
        this.pianoSynth, this.pianoReverb, this.pianoGain,
        this.stringsSynth, this.stringsSynth2, this.stringsChorus, this.stringsReverb, this.stringsFilter, this.stringsGain,
        this.padSynth, this.padSynth2, this.padFilter, this.padChorus, this.padReverb, this.padGain,
        this.hihatClosed, this.hihatOpen, this.hihatFilter, this.hihatGain,
        this.clapSynth, this.clapReverb, this.rimSynth, this.tomSynth, this.shakerSynth, this.percGain,
        this.vocalSynth1, this.vocalSynth2, this.vocalSynth3, this.vocalFilter1, this.vocalFilter2, this.vocalFilter3,
        this.vocalChorus, this.vocalReverb, this.vocalDelay, this.vocalGain,
        this.masterCompressor, this.masterLimiter, this.masterGain, this.recorder,
      ].forEach(node => node?.dispose());
    } catch (e) {
      // Ignore dispose errors
    }
    this.initialized = false;
  }
}

export const audioEngine = new AudioEngine();
