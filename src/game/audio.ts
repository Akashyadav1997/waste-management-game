import type { GameSettings } from './types';

let audioContext: AudioContext | undefined;
let ambienceGain: GainNode | undefined;
let ambienceOscillators: OscillatorNode[] = [];
let cachedLadyVoice: SpeechSynthesisVoice | undefined;

function getAudioContext(): AudioContext | undefined {
  try {
    audioContext ??= new AudioContext();
    if (audioContext.state === 'suspended') void audioContext.resume();
    return audioContext;
  } catch {
    return undefined;
  }
}

function clampVolume(volume: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(volume) ? volume : 0));
}

function playTone(frequency: number, endFrequency: number, duration: number, volume: number): void {
  const context = getAudioContext();
  if (!context || volume <= 0) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(endFrequency, context.currentTime + duration * 0.58);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(clampVolume(volume) * 0.12, context.currentTime + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration + 0.02);
}

function playFirecrackerCrackles(volume: number): void {
  const context = getAudioContext();
  if (!context || volume <= 0) return;

  const now = context.currentTime;
  const clamped = clampVolume(volume) * 0.18;

  // 1. Festive pops / mini explosions
  const burstCount = 6;
  for (let i = 0; i < burstCount; i++) {
    const burstTime = now + i * 0.045 + Math.random() * 0.02;
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = i % 2 === 0 ? 'triangle' : 'square';
    const startFreq = 280 + Math.random() * 400;
    osc.frequency.setValueAtTime(startFreq, burstTime);
    osc.frequency.exponentialRampToValueAtTime(60, burstTime + 0.04);

    gain.gain.setValueAtTime(0.0001, burstTime);
    gain.gain.linearRampToValueAtTime(clamped * (0.8 + Math.random() * 0.4), burstTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, burstTime + 0.045);

    osc.connect(gain);
    gain.connect(context.destination);

    osc.start(burstTime);
    osc.stop(burstTime + 0.05);
  }

  // 2. Sparkling high chimes
  const chimeNotes = [784, 880, 1046, 1174, 1318];
  chimeNotes.forEach((freq, idx) => {
    const chimeTime = now + 0.08 + idx * 0.04;
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, chimeTime);

    gain.gain.setValueAtTime(0.0001, chimeTime);
    gain.gain.linearRampToValueAtTime(clamped * 0.5, chimeTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 0.22);

    osc.connect(gain);
    gain.connect(context.destination);

    osc.start(chimeTime);
    osc.stop(chimeTime + 0.24);
  });
}

function findLadyVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined;
  if (cachedLadyVoice) return cachedLadyVoice;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return undefined;

  // Keywords that identify friendly female / lady / girl voices across platforms
  const ladyKeywords = [
    'samantha', 'victoria', 'karen', 'veena', 'kavya', 'aditi',
    'sangeeta', 'serena', 'zira', 'fiona', 'tessa', 'moira',
    'female', 'woman', 'girl'
  ];

  // 1. Try English / Hindi female voice
  for (const voice of voices) {
    const nameLower = voice.name.toLowerCase();
    const langLower = voice.lang.toLowerCase();
    const isTargetLang = langLower.startsWith('en') || langLower.startsWith('hi');
    const isFemale = ladyKeywords.some((kw) => nameLower.includes(kw));
    if (isTargetLang && isFemale) {
      cachedLadyVoice = voice;
      return voice;
    }
  }

  // 2. Any English voice that matches common female voice names
  for (const voice of voices) {
    if (voice.lang.toLowerCase().startsWith('en')) {
      cachedLadyVoice = voice;
      return voice;
    }
  }

  cachedLadyVoice = voices[0];
  return voices[0];
}

// Keep voice cache warm when voices load
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedLadyVoice = undefined;
    findLadyVoice();
  };
}

export const audioController = {
  unlock() {
    void getAudioContext();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      findLadyVoice();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }
  },
  selection(settings: GameSettings) {
    if (settings.effects) playTone(440, 560, 0.1, settings.effectsVolume);
  },
  success(settings: GameSettings) {
    if (settings.effects) {
      // Crackers festive celebration sound!
      playFirecrackerCrackles(settings.effectsVolume);
    }
  },
  retry(settings: GameSettings) {
    if (settings.effects) playTone(260, 200, 0.2, settings.effectsVolume * 0.7);
  },
  complete(settings: GameSettings) {
    if (!settings.effects) return;
    playFirecrackerCrackles(settings.effectsVolume);
    window.setTimeout(() => playTone(659, 1046, 0.35, settings.effectsVolume), 180);
  },
  speak(text: string, settings: GameSettings) {
    if (!settings.narration || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (!text || text.trim() === '') return;

    this.stopSpeech();

    // Ensure voices are available or retry briefly if browser is still loading them
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      window.setTimeout(() => {
        this.speak(text, settings);
      }, 100);
      return;
    }

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const ladyVoice = findLadyVoice();
    if (ladyVoice) {
      utterance.voice = ladyVoice;
      utterance.lang = ladyVoice.lang;
    } else {
      utterance.lang = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
    }

    // Cheerful, friendly young girl / storyteller tone
    utterance.pitch = 1.25;
    utterance.rate = 0.94;
    utterance.volume = clampVolume(settings.narrationVolume);

    window.speechSynthesis.speak(utterance);
  },
  stopSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },
  setAmbience(settings: GameSettings) {
    const context = getAudioContext();
    if (!context) return;
    if (!settings.ambience || settings.ambienceVolume <= 0) {
      this.stopAmbience();
      return;
    }
    if (ambienceGain) {
      ambienceGain.gain.setTargetAtTime(clampVolume(settings.ambienceVolume) * 0.05, context.currentTime, 0.18);
      return;
    }

    ambienceGain = context.createGain();
    ambienceGain.gain.setValueAtTime(clampVolume(settings.ambienceVolume) * 0.04, context.currentTime);
    ambienceGain.connect(context.destination);

    ambienceOscillators = [96, 142].map((frequency) => {
      const oscillator = context.createOscillator();
      oscillator.type = 'triangle';
      oscillator.frequency.value = frequency;
      oscillator.connect(ambienceGain!);
      oscillator.start();
      return oscillator;
    });
  },
  stopAmbience() {
    ambienceOscillators.forEach((oscillator) => {
      try {
        oscillator.stop();
        oscillator.disconnect();
      } catch {
        // Already stopped.
      }
    });
    ambienceOscillators = [];
    ambienceGain?.disconnect();
    ambienceGain = undefined;
  },
  stopAll() {
    this.stopSpeech();
    this.stopAmbience();
  },
};
