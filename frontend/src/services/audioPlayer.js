// Web Audio Synthesizer & Player for interactive audio playback without external asset dependency
class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.oscillator = null;
    this.gainNode = null;
    this.isPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playChillBeat() {
    this.init();
    if (!this.ctx) return;
    this.stop();

    this.isPlaying = true;
    const now = this.ctx.currentTime;

    // Ambient warm chord synth
    const chordFrequencies = [220, 277.18, 329.63, 440]; // A major 7th chill chord
    this.oscillators = chordFrequencies.map(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Subtle LFO vibrato
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.5, now);
      lfoGain.gain.setValueAtTime(2, now);
      lfo.connect(osc.frequency);
      lfo.start();

      gain.gain.setValueAtTime(0.02, now);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      return { osc, lfo, gain };
    });
  }

  stop() {
    if (this.oscillators) {
      this.oscillators.forEach(({ osc, lfo, gain }) => {
        try {
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.1);
          setTimeout(() => {
            osc.stop();
            lfo.stop();
          }, 150);
        } catch (e) {}
      });
      this.oscillators = null;
    }
    this.isPlaying = false;
  }
}

export const synth = new SoundSynthesizer();
