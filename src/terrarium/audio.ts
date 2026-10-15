import { WeatherType } from './types.ts';

/**
 * 100% Procedural Web Audio API Sound Synthesizer.
 * No external .mp3 or audio files to avoid 404 errors.
 */

export class TerrariumAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private cricketsGain: GainNode | null = null;
  private birdsGain: GainNode | null = null;

  private isRunning = false;
  private enabled = false;
  private volume = 0.5;

  private birdInterval: number | null = null;
  private cricketInterval: number | null = null;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.enabled ? this.volume : 0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.setupNoiseGenerators();
      this.setupProceduralCritters();
      this.isRunning = true;
    } catch (e) {
      console.warn('Web Audio could not be initialized:', e);
    }
  }

  private setupNoiseGenerators() {
    if (!this.ctx || !this.masterGain) return;

    // 1. Generate 5 seconds of looping pink/white noise buffer
    const bufferSize = this.ctx.sampleRate * 5;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filter approximation
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
      b6 = white * 0.115926;
    }

    // Rain generator node
    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0, this.ctx.currentTime);

    rainSource.connect(rainFilter);
    rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);
    rainSource.start();

    // Wind / Breeze generator node
    const windSource = this.ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
    windFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    windSource.connect(windFilter);
    windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    windSource.start();

    // Crickets and birds main gain
    this.cricketsGain = this.ctx.createGain();
    this.cricketsGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.cricketsGain.connect(this.masterGain);

    this.birdsGain = this.ctx.createGain();
    this.birdsGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.birdsGain.connect(this.masterGain);
  }

  private setupProceduralCritters() {
    // Schedule periodic peaceful birdsong during daytime
    this.birdInterval = window.setInterval(() => {
      if (this.enabled && this.birdsGain && this.birdsGain.gain.value > 0.01) {
        this.synthesizeBirdChirp();
      }
    }, 4500);

    // Schedule crickets chirps at night
    this.cricketInterval = window.setInterval(() => {
      if (this.enabled && this.cricketsGain && this.cricketsGain.gain.value > 0.01) {
        this.synthesizeCricketStridulation();
      }
    }, 2800);
  }

  // Synthesize bird chirp with pitch bend
  private synthesizeBirdChirp() {
    if (!this.ctx || !this.birdsGain) return;
    const now = this.ctx.currentTime;

    const notes = [
      [2800, 3400, 0.12],
      [3400, 3900, 0.09],
      [3900, 3100, 0.15],
    ];

    let t = now;
    notes.forEach(([f1, f2, dur]) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f1, t);
      osc.frequency.exponentialRampToValueAtTime(f2, t + dur);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(gain);
      gain.connect(this.birdsGain!);

      osc.start(t);
      osc.stop(t + dur);
      t += dur + 0.04;
    });
  }

  // Synthesize night cricket stridulation pulse
  private synthesizeCricketStridulation() {
    if (!this.ctx || !this.cricketsGain) return;
    const now = this.ctx.currentTime;
    const pulses = 4;
    const pulseLen = 0.035;

    for (let p = 0; p < pulses; p++) {
      const t = now + p * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(4500 + Math.random() * 200, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + pulseLen);

      osc.connect(gain);
      gain.connect(this.cricketsGain);

      osc.start(t);
      osc.stop(t + pulseLen);
    }
  }

  // Play water droplet splash sound
  public playWaterDroplet() {
    if (!this.ctx || !this.masterGain) {
      this.init();
    }
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const freq = 900 + Math.random() * 400;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 0.7, now);
    osc.frequency.exponentialRampToValueAtTime(freq, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.18);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.19);
  }

  // Synthesize realistic thunder rumble
  public playThunder() {
    if (!this.ctx || !this.masterGain || !this.enabled) return;
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 2.5;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, now);
    filter.frequency.exponentialRampToValueAtTime(50, now + 2.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.7, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start(now);
    source.stop(now + 2.5);
  }

  // Update dynamic mix based on weather and time of day
  public updateState(
    enabled: boolean,
    volume: number,
    weather: WeatherType,
    timeOfDay: number
  ) {
    this.enabled = enabled;
    this.volume = volume;

    if (!this.ctx || !this.masterGain) {
      if (enabled) this.init();
      else return;
    }

    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended' && enabled) {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const targetMaster = enabled ? volume : 0;
    this.masterGain.gain.setTargetAtTime(targetMaster, now, 0.1);

    // Weather audio gains
    let targetRain = 0;
    if (weather === 'rain') targetRain = 0.35;
    else if (weather === 'storm') targetRain = 0.65;
    else if (weather === 'mist') targetRain = 0.08;

    if (this.rainGain) {
      this.rainGain.gain.setTargetAtTime(targetRain, now, 0.2);
    }

    // Day vs Night critters
    const isNight = timeOfDay < 5.5 || timeOfDay > 19.5;
    if (this.birdsGain) {
      const birdVol = !isNight && weather === 'clear' ? 0.3 : 0.0;
      this.birdsGain.gain.setTargetAtTime(birdVol, now, 0.3);
    }
    if (this.cricketsGain) {
      const cricketVol = isNight && weather !== 'storm' ? 0.25 : 0.0;
      this.cricketsGain.gain.setTargetAtTime(cricketVol, now, 0.3);
    }
  }

  public dispose() {
    if (this.birdInterval) clearInterval(this.birdInterval);
    if (this.cricketInterval) clearInterval(this.cricketInterval);
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
