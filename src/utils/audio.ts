class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('trig_game_muted');
        this.isMuted = saved === 'true';
      } catch {
        this.isMuted = false;
      }
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('trig_game_muted', String(this.isMuted));
    return this.isMuted;
  }

  // Laser beam zap when correct answer fired
  public playLaser() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // AudioContext policy safe catch
    }
  }

  // Hit explosion when target vaporized
  public playHit() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(1040, now + 0.1);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // AudioContext policy safe catch
    }
  }

  // Combo rising chime with rich harmonic synth
  public playCombo(combo: number) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 1046.5, 1174.66, 1318.5];
      const baseNote = notes[Math.min(combo, notes.length - 1)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = combo >= 5 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(baseNote, now);
      osc.frequency.exponentialRampToValueAtTime(baseNote * 1.5, now + 0.14);

      gain.gain.setValueAtTime(combo >= 5 ? 0.24 : 0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);

      // Add harmonic sparkle overtone for combo >= 4
      if (combo >= 4) {
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(baseNote * 2, now + 0.04);
        subOsc.frequency.exponentialRampToValueAtTime(baseNote * 2.5, now + 0.18);
        subGain.gain.setValueAtTime(0.12, now + 0.04);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        subOsc.connect(subGain);
        subGain.connect(this.ctx.destination);
        subOsc.start(now + 0.04);
        subOsc.stop(now + 0.22);
      }
    } catch {
      // AudioContext policy safe catch
    }
  }

  // High Combo / Fever activation fanfare
  public playFever(tier: 1 | 2) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = tier === 2
        ? [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.5]
        : [440.0, 554.37, 659.25, 880.0];

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = tier === 2 ? 'triangle' : 'sine';
        osc.frequency.value = freq;
        const noteStart = now + idx * 0.06;
        gain.gain.setValueAtTime(0.2, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.005, noteStart + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(noteStart);
        osc.stop(noteStart + 0.22);
      });
    } catch {
      // AudioContext policy safe catch
    }
  }

  // Wrong answer buzz
  public playWrong() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.18);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // AudioContext policy safe catch
    }
  }

  // Base hit damage / life lost
  public playDamage() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // AudioContext policy safe catch
    }
  }

  // Game over theme
  public playGameOver() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [392, 349.2, 329.6, 261.6];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const noteStart = now + idx * 0.15;
        gain.gain.setValueAtTime(0.2, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.01, noteStart + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(noteStart);
        osc.stop(noteStart + 0.25);
      });
    } catch {
      // AudioContext policy safe catch
    }
  }

  // High score / victory fanfare
  public playLevelUp() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [261.6, 329.6, 392.0, 523.2, 659.2];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const noteStart = now + idx * 0.08;
        gain.gain.setValueAtTime(0.18, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.01, noteStart + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(noteStart);
        osc.stop(noteStart + 0.2);
      });
    } catch {
      // AudioContext policy safe catch
    }
  }
}

export const sounds = new SoundManager();
