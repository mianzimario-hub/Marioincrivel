// Ambient sound generator using Web Audio API for customizable Waiting Room

class AmbientSoundPlayer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private intervalId: number | null = null;

  start() {
    if (this.isPlaying) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.isPlaying = true;

      // Play soft relaxing harmonic chords (Cmaj7 / Am9 soothing frequencies)
      const chordFrequencies = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 440.00], // Am
        [349.23, 440.00, 523.25, 659.25], // Fmaj7
        [196.00, 246.94, 293.66, 392.00], // G
      ];

      let step = 0;
      const playChord = () => {
        if (!this.ctx || !this.isPlaying) return;
        const freqs = chordFrequencies[step % chordFrequencies.length];
        step++;

        freqs.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          const startVol = 0.015 / (idx + 1);
          gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
          gain.gain.linearRampToValueAtTime(startVol, this.ctx.currentTime + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 4.5);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(this.ctx.currentTime);
          osc.stop(this.ctx.currentTime + 4.8);
        });
      };

      playChord();
      this.intervalId = window.setInterval(playChord, 4000);
    } catch {
      // Audio context might need user gesture
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }

  status(): boolean {
    return this.isPlaying;
  }
}

export const ambientPlayer = new AmbientSoundPlayer();
