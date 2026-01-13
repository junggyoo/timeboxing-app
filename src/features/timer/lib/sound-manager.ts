import type { SoundType } from "../types";
import { SOUND_CONFIG } from "../constants";

/**
 * SoundManager - Manages Web Audio API for synthesized notification sounds.
 *
 * Uses the "unlock" strategy to work around browser autoplay restrictions:
 * - AudioContext must be created/resumed after a user gesture
 * - Call unlock() on first user interaction (click, touch, keypress)
 * - All sounds are synthesized using OscillatorNode - no external files needed
 */
class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;
  private isUnlocked = false;
  private unlockPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * Check if AudioContext is unlocked and ready to play sounds
   */
  get unlocked(): boolean {
    return this.isUnlocked;
  }

  /**
   * Unlock AudioContext - must be called from a user gesture event handler.
   * Safe to call multiple times; subsequent calls are no-ops.
   */
  async unlock(): Promise<void> {
    if (this.isUnlocked) return;

    // Prevent concurrent unlock attempts
    if (this.unlockPromise) {
      return this.unlockPromise;
    }

    this.unlockPromise = this.performUnlock();

    try {
      await this.unlockPromise;
    } finally {
      this.unlockPromise = null;
    }
  }

  private async performUnlock(): Promise<void> {
    try {
      // Create AudioContext if not exists
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }

      // Resume if suspended (Safari requirement)
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      // Play silent buffer to fully unlock
      const buffer = this.audioContext.createBuffer(1, 1, 22050);
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start();

      this.isUnlocked = true;
    } catch {
      // Silently ignore - this is expected on initial page load
      // AudioContext will be properly unlocked on user interaction
    }
  }

  /**
   * Play a synthesized sound based on type
   */
  play(type: SoundType): void {
    if (!this.isUnlocked || !this.audioContext) {
      console.warn("AudioContext not unlocked. Call unlock() first.");
      return;
    }

    // Resume context if it was suspended (can happen on mobile)
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    switch (type) {
      case "preStart":
        this.playDoubleBeep();
        break;
      case "focusEnd":
        this.playChime();
        break;
      case "breakEnd":
        this.playBuzzer();
        break;
    }
  }

  /**
   * Pre-start: Short subtle double-beep (high pitch)
   * Two quick sine wave beeps at A5 (880Hz)
   */
  private playDoubleBeep(): void {
    const ctx = this.audioContext!;
    const now = ctx.currentTime;
    const config = SOUND_CONFIG.preStart;

    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = config.type;
      osc.frequency.value = config.frequency;

      const startTime = now + i * 0.15;
      gain.gain.setValueAtTime(config.volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + config.duration);

      osc.start(startTime);
      osc.stop(startTime + config.duration + 0.05);
    }
  }

  /**
   * Focus End: Pleasant ascending major chord arpeggio (C-E-G-C)
   * Creates a rewarding, calm sound for completing focus time
   */
  private playChime(): void {
    const ctx = this.audioContext!;
    const now = ctx.currentTime;
    const config = SOUND_CONFIG.focusEnd;

    config.notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = config.type;
      osc.frequency.value = freq;

      const startTime = now + i * config.noteDuration;
      gain.gain.setValueAtTime(config.volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }

  /**
   * Break End: Slightly urgent buzzer-like tone
   * Three alternating square wave tones (A4/C#5) to signal "back to work"
   */
  private playBuzzer(): void {
    const ctx = this.audioContext!;
    const now = ctx.currentTime;
    const config = SOUND_CONFIG.breakEnd;

    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = config.type;
      // Alternate between two frequencies
      osc.frequency.value = config.frequencies[i % 2];

      const startTime = now + i * 0.2;
      gain.gain.setValueAtTime(config.volume, startTime);
      gain.gain.setValueAtTime(0.01, startTime + config.duration);

      osc.start(startTime);
      osc.stop(startTime + config.duration + 0.05);
    }
  }

  /**
   * Test all sounds (for debugging/development)
   */
  async testAllSounds(): Promise<void> {
    if (!this.isUnlocked) {
      console.warn("Cannot test sounds: AudioContext not unlocked");
      return;
    }

    console.log("Testing pre-start sound...");
    this.play("preStart");

    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("Testing focus-end sound...");
    this.play("focusEnd");

    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Testing break-end sound...");
    this.play("breakEnd");
  }
}

// Export singleton instance getter
export const getSoundManager = () => SoundManager.getInstance();

// Export class for type references
export { SoundManager };
