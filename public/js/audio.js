// ============================================================
// STREET EMPIRE — Audio Engine
// Procedural trap music & SFX using Web Audio API
// ============================================================

(function() {
  'use strict';

  let audioCtx = null;
  let masterGain = null;
  let musicGain = null;
  let sfxGain = null;
  let currentBeat = null;
  let beatInterval = null;
  let isPlaying = false;
  let currentTrack = 'main';
  let beatStep = 0;
  let bpm = 140;

  // Initialize audio context (must be called after user gesture)
  function init() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.7;
    masterGain.connect(audioCtx.destination);

    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0.5;
    musicGain.connect(masterGain);

    sfxGain = audioCtx.createGain();
    sfxGain.gain.value = 0.8;
    sfxGain.connect(masterGain);
  }

  // ── SYNTHESIZER COMPONENTS ──

  // Deep 808 bass hit
  function play808(freq = 55, time = 0, duration = 0.5, volume = 0.8) {
    if (!audioCtx) return;
    const t = time || audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const distortion = audioCtx.createWaveShaper();

    // Warm distortion curve
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = (Math.PI + 3) * x / (Math.PI + 3 * Math.abs(x));
    }
    distortion.curve = curve;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.5, t);
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.05);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + duration);

    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(distortion);
    distortion.connect(gain);
    gain.connect(musicGain);

    osc.start(t);
    osc.stop(t + duration);
  }

  // Hi-hat (noise-based)
  function playHiHat(time = 0, open = false, volume = 0.3) {
    if (!audioCtx) return;
    const t = time || audioCtx.currentTime;
    const duration = open ? 0.2 : 0.05;

    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;

    // High-pass filter for metallic sound
    const hpFilter = audioCtx.createBiquadFilter();
    hpFilter.type = 'highpass';
    hpFilter.frequency.value = open ? 7000 : 9000;

    // Bandpass for character
    const bpFilter = audioCtx.createBiquadFilter();
    bpFilter.type = 'bandpass';
    bpFilter.frequency.value = 10000;
    bpFilter.Q.value = 1;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    source.connect(hpFilter);
    hpFilter.connect(bpFilter);
    bpFilter.connect(gain);
    gain.connect(musicGain);

    source.start(t);
    source.stop(t + duration);
  }

  // Snare/clap
  function playSnare(time = 0, volume = 0.5) {
    if (!audioCtx) return;
    const t = time || audioCtx.currentTime;

    // Noise component
    const noiseLen = audioCtx.sampleRate * 0.15;
    const noiseBuffer = audioCtx.createBuffer(1, noiseLen, audioCtx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(volume, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(musicGain);
    noise.start(t);
    noise.stop(t + 0.15);

    // Tone component
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);

    const oscGain = audioCtx.createGain();
    oscGain.gain.setValueAtTime(volume * 0.7, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(oscGain);
    oscGain.connect(musicGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  // Synth pad/melody note
  function playSynth(freq, time = 0, duration = 0.3, type = 'sawtooth', volume = 0.15) {
    if (!audioCtx) return;
    const t = time || audioCtx.currentTime;

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    osc1.type = type;
    osc2.type = type;
    osc1.frequency.value = freq;
    osc2.frequency.value = freq * 1.005; // Slight detune for width

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, t);
    filter.frequency.exponentialRampToValueAtTime(500, t + duration);
    filter.Q.value = 5;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.02);
    gain.gain.setValueAtTime(volume, t + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(musicGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + duration);
    osc2.stop(t + duration);
  }

  // Pluck bass for melodies
  function playPluck(freq, time = 0, duration = 0.2, volume = 0.2) {
    if (!audioCtx) return;
    const t = time || audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = freq;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + duration);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(musicGain);

    osc.start(t);
    osc.stop(t + duration);
  }

  // ── BEAT PATTERNS ──
  // Each pattern is 16 steps (one bar at 140 BPM)
  // Notation: which sounds trigger on each step

  const PATTERNS = {
    // Main menu / default vibe
    main: {
      bpm: 140,
      bars: 4,
      bass: [
        // [step, freq, duration, volume]
        [0, 44, 0.4, 0.8],    // F1
        [4, 44, 0.3, 0.6],
        [10, 55, 0.4, 0.8],   // A1
        [14, 44, 0.2, 0.5],
      ],
      hihat: [
        // [step, open, volume]
        [0, false, 0.25], [1, false, 0.15], [2, false, 0.25], [3, false, 0.15],
        [4, false, 0.25], [5, false, 0.15], [6, true, 0.2],  [7, false, 0.15],
        [8, false, 0.25], [9, false, 0.15], [10, false, 0.25],[11, false, 0.15],
        [12, false, 0.25],[13, false, 0.2], [14, true, 0.2],  [15, false, 0.15],
      ],
      snare: [
        // [step, volume]
        [4, 0.5], [12, 0.5],
      ],
      melody: [
        // [step, freq, duration, type, volume]
        [0, 349.23, 0.4, 'sawtooth', 0.12],   // F4
        [4, 329.63, 0.3, 'sawtooth', 0.1],    // E4
        [8, 293.66, 0.4, 'sawtooth', 0.12],   // D4
        [12, 261.63, 0.3, 'sawtooth', 0.1],   // C4
      ]
    },

    // Intense - for encounters/combat
    combat: {
      bpm: 150,
      bars: 2,
      bass: [
        [0, 37, 0.3, 0.9],    // D1 (darker)
        [3, 37, 0.2, 0.6],
        [6, 44, 0.3, 0.9],
        [8, 37, 0.3, 0.9],
        [11, 37, 0.2, 0.6],
        [14, 49, 0.3, 0.7],
      ],
      hihat: [
        [0, false, 0.3], [1, false, 0.2], [2, false, 0.3], [3, false, 0.2],
        [4, true, 0.25], [5, false, 0.2], [6, false, 0.3], [7, false, 0.2],
        [8, false, 0.3], [9, false, 0.2], [10, false, 0.3], [11, false, 0.2],
        [12, true, 0.25],[13, false, 0.25],[14, false, 0.3], [15, false, 0.25],
      ],
      snare: [
        [4, 0.6], [12, 0.6], [13, 0.3],
      ],
      melody: [
        [0, 233.08, 0.2, 'square', 0.1],    // Bb3
        [2, 220.00, 0.2, 'square', 0.08],   // A3
        [4, 196.00, 0.3, 'square', 0.1],    // G3
        [8, 233.08, 0.2, 'square', 0.1],
        [10, 207.65, 0.2, 'square', 0.08],  // Ab3
        [12, 174.61, 0.4, 'square', 0.12],  // F3
      ]
    },

    // Chill - for shopping/bank/stash
    chill: {
      bpm: 130,
      bars: 4,
      bass: [
        [0, 55, 0.5, 0.6],    // A1
        [8, 49, 0.5, 0.6],    // G#1
        [16, 44, 0.5, 0.6],   // F#1
        [24, 49, 0.5, 0.6],
      ],
      hihat: [
        [0, false, 0.15], [2, false, 0.15], [4, false, 0.15], [6, true, 0.12],
        [8, false, 0.15], [10, false, 0.15], [12, false, 0.15], [14, false, 0.1],
      ],
      snare: [
        [4, 0.35], [12, 0.35],
      ],
      melody: [
        [0, 440.00, 0.6, 'sine', 0.1],    // A4
        [4, 523.25, 0.4, 'sine', 0.08],   // C5
        [8, 493.88, 0.6, 'sine', 0.1],    // B4
        [12, 440.00, 0.4, 'sine', 0.08],  // A4
      ]
    },

    // Travel vibes
    travel: {
      bpm: 145,
      bars: 2,
      bass: [
        [0, 41.2, 0.4, 0.7],   // E1
        [4, 41.2, 0.2, 0.5],
        [8, 55, 0.4, 0.7],     // A1
        [12, 49, 0.3, 0.6],
      ],
      hihat: [
        [0, false, 0.2], [1, false, 0.15], [2, false, 0.2], [3, false, 0.15],
        [4, false, 0.2], [5, false, 0.15], [6, false, 0.2], [7, true, 0.18],
        [8, false, 0.2], [9, false, 0.15], [10, false, 0.2], [11, false, 0.15],
        [12, false, 0.2], [13, false, 0.18],[14, true, 0.18], [15, false, 0.15],
      ],
      snare: [
        [4, 0.45], [12, 0.45],
      ],
      melody: [
        [0, 329.63, 0.3, 'sawtooth', 0.08],  // E4
        [4, 392.00, 0.3, 'sawtooth', 0.08],  // G4
        [8, 440.00, 0.3, 'sawtooth', 0.1],   // A4
        [12, 392.00, 0.3, 'sawtooth', 0.08],
      ]
    },

    // Menacing - loan shark / danger
    danger: {
      bpm: 135,
      bars: 2,
      bass: [
        [0, 32.7, 0.6, 0.9],    // C1 (very low, ominous)
        [6, 32.7, 0.2, 0.5],
        [8, 36.71, 0.6, 0.9],   // D1
        [14, 32.7, 0.2, 0.5],
      ],
      hihat: [
        [0, false, 0.2], [2, false, 0.15], [4, true, 0.18], [6, false, 0.1],
        [8, false, 0.2], [10, false, 0.15], [12, true, 0.18], [14, false, 0.1],
      ],
      snare: [
        [4, 0.55], [12, 0.55],
      ],
      melody: [
        [0, 155.56, 0.5, 'sawtooth', 0.12],  // Eb3
        [4, 146.83, 0.5, 'sawtooth', 0.1],   // D3
        [8, 138.59, 0.5, 'sawtooth', 0.12],  // C#3
        [12, 130.81, 0.5, 'sawtooth', 0.1],  // C3
      ]
    },

    // Victory / achievement
    victory: {
      bpm: 140,
      bars: 2,
      bass: [
        [0, 55, 0.4, 0.7],
        [4, 65.41, 0.4, 0.7],  // C2
        [8, 73.42, 0.4, 0.7],  // D2
        [12, 82.41, 0.4, 0.7], // E2
      ],
      hihat: [
        [0, false, 0.2], [1, false, 0.15], [2, false, 0.2], [3, false, 0.15],
        [4, true, 0.2],  [5, false, 0.15], [6, false, 0.2], [7, false, 0.15],
        [8, false, 0.2], [9, false, 0.15], [10, false, 0.2], [11, false, 0.15],
        [12, true, 0.2], [13, false, 0.15],[14, false, 0.2], [15, false, 0.15],
      ],
      snare: [
        [4, 0.5], [12, 0.5], [14, 0.3], [15, 0.3],
      ],
      melody: [
        [0, 523.25, 0.3, 'square', 0.1],   // C5
        [2, 587.33, 0.3, 'square', 0.1],   // D5
        [4, 659.25, 0.4, 'square', 0.12],  // E5
        [8, 783.99, 0.3, 'square', 0.1],   // G5
        [10, 659.25, 0.3, 'square', 0.1],
        [12, 783.99, 0.6, 'square', 0.14], // G5 long
      ]
    },

    // Night club vibe
    club: {
      bpm: 128,
      bars: 4,
      bass: [
        [0, 55, 0.3, 0.8],
        [2, 55, 0.15, 0.4],
        [4, 55, 0.3, 0.8],
        [6, 55, 0.15, 0.4],
        [8, 49, 0.3, 0.8],
        [10, 49, 0.15, 0.4],
        [12, 49, 0.3, 0.8],
        [14, 49, 0.15, 0.4],
      ],
      hihat: [
        [0, false, 0.2], [1, false, 0.25], [2, false, 0.2], [3, false, 0.25],
        [4, false, 0.2], [5, false, 0.25], [6, false, 0.2], [7, false, 0.25],
        [8, false, 0.2], [9, false, 0.25], [10, false, 0.2], [11, false, 0.25],
        [12, false, 0.2], [13, false, 0.25],[14, true, 0.2],  [15, false, 0.25],
      ],
      snare: [
        [4, 0.55], [12, 0.55],
      ],
      melody: [
        [0, 440.00, 0.15, 'sine', 0.15],
        [3, 523.25, 0.15, 'sine', 0.12],
        [6, 440.00, 0.15, 'sine', 0.15],
        [8, 587.33, 0.3, 'sine', 0.12],
        [12, 523.25, 0.15, 'sine', 0.15],
        [14, 440.00, 0.3, 'sine', 0.12],
      ]
    },

    // Game over
    gameover: {
      bpm: 100,
      bars: 2,
      bass: [
        [0, 32.7, 0.8, 0.7],
        [8, 30.87, 0.8, 0.7],
      ],
      hihat: [],
      snare: [
        [4, 0.3], [12, 0.3],
      ],
      melody: [
        [0, 261.63, 0.8, 'sine', 0.12],   // C4
        [4, 246.94, 0.8, 'sine', 0.1],    // B3
        [8, 233.08, 0.8, 'sine', 0.12],   // Bb3
        [12, 220.00, 1.0, 'sine', 0.14],  // A3 (hold)
      ]
    }
  };

  // ── BEAT SEQUENCER ──

  function startBeat(trackName) {
    if (!audioCtx) init();
    if (!PATTERNS[trackName]) trackName = 'main';

    // Don't restart if same track
    if (isPlaying && currentTrack === trackName) return;

    stopBeat();
    currentTrack = trackName;
    const pattern = PATTERNS[trackName];
    bpm = pattern.bpm;
    beatStep = 0;
    isPlaying = true;

    const stepDuration = 60 / bpm / 4; // 16th note duration
    const stepsPerBar = 16;
    const totalSteps = stepsPerBar * (pattern.bars || 1);

    // Use scheduling for tight timing
    function scheduler() {
      if (!isPlaying) return;

      const currentTime = audioCtx.currentTime;
      const step = beatStep % stepsPerBar;

      // Bass
      pattern.bass.forEach(b => {
        if (b[0] === step) play808(b[1], currentTime, b[2], b[3]);
      });

      // Hi-hat
      pattern.hihat.forEach(h => {
        if (h[0] === step) playHiHat(currentTime, h[1], h[2]);
      });

      // Snare
      pattern.snare.forEach(s => {
        if (s[0] === step) playSnare(currentTime, s[1]);
      });

      // Melody
      pattern.melody.forEach(m => {
        if (m[0] === step) playSynth(m[1], currentTime, m[2], m[3], m[4]);
      });

      beatStep = (beatStep + 1) % totalSteps;
    }

    beatInterval = setInterval(scheduler, stepDuration * 1000);
  }

  function stopBeat() {
    isPlaying = false;
    if (beatInterval) {
      clearInterval(beatInterval);
      beatInterval = null;
    }
  }

  function setTrack(trackName) {
    if (currentTrack !== trackName) {
      startBeat(trackName);
    }
  }

  // ── SOUND EFFECTS ──

  function sfxCashRegister() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    // Bright ding
    [1200, 1500, 1800].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.15, t + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.3);
      osc.connect(gain);
      gain.connect(sfxGain);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.3);
    });
  }

  function sfxBuy() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.15);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  function sfxSell() {
    if (!audioCtx) return;
    sfxCashRegister();
  }

  function sfxAlert() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    [0, 0.15, 0.3].forEach(offset => {
      const osc = audioCtx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = 880;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.15, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.1);
      osc.connect(gain);
      gain.connect(sfxGain);
      osc.start(t + offset);
      osc.stop(t + offset + 0.1);
    });
  }

  function sfxSiren() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

    // Siren wobble
    for (let i = 0; i < 6; i++) {
      osc.frequency.setValueAtTime(600, t + i * 0.25);
      osc.frequency.linearRampToValueAtTime(900, t + i * 0.25 + 0.125);
      osc.frequency.linearRampToValueAtTime(600, t + i * 0.25 + 0.25);
    }

    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(t);
    osc.stop(t + 1.5);
  }

  function sfxGunshot() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;

    // Noise burst
    const bufferSize = audioCtx.sampleRate * 0.15;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
    }
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    source.connect(gain);
    gain.connect(sfxGain);
    source.start(t);
    source.stop(t + 0.15);

    // Low thud
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.1);
    const oscGain = audioCtx.createGain();
    oscGain.gain.setValueAtTime(0.3, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(oscGain);
    oscGain.connect(sfxGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  function sfxLevelUp() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.2, t + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.4);
      osc.connect(gain);
      gain.connect(sfxGain);
      osc.start(t + i * 0.12);
      osc.stop(t + i * 0.12 + 0.4);
    });
  }

  function sfxPhoneVibrate() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 200;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.1, t + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.2 + 0.1);
      osc.connect(gain);
      gain.connect(sfxGain);
      osc.start(t + i * 0.2);
      osc.stop(t + i * 0.2 + 0.1);
    }
  }

  function sfxClick() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 1000;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  function sfxError() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    [400, 300].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = freq;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.12, t + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.15);
      osc.connect(gain);
      gain.connect(sfxGain);
      osc.start(t + i * 0.15);
      osc.stop(t + i * 0.15 + 0.15);
    });
  }

  function sfxAchievement() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const notes = [659.25, 783.99, 987.77, 1318.51]; // E5, G5, B5, E6
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.15, t + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.5);
      osc.connect(gain);
      gain.connect(sfxGain);
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.5);
    });
  }

  function sfxTravel() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    // Engine-like rumble
    const osc = audioCtx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.linearRampToValueAtTime(120, t + 0.5);
    osc.frequency.linearRampToValueAtTime(80, t + 1.0);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.setValueAtTime(0.08, t + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(sfxGain);
    osc.start(t);
    osc.stop(t + 1.2);
  }

  // ── VOLUME CONTROLS ──

  function setMasterVolume(val) {
    if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, val));
  }

  function setMusicVolume(val) {
    if (musicGain) musicGain.gain.value = Math.max(0, Math.min(1, val));
  }

  function setSfxVolume(val) {
    if (sfxGain) sfxGain.gain.value = Math.max(0, Math.min(1, val));
  }

  function toggleMusic() {
    if (isPlaying) {
      stopBeat();
      return false;
    } else {
      startBeat(currentTrack);
      return true;
    }
  }

  function isInitialized() {
    return !!audioCtx;
  }

  // ── CONTEXT-AWARE MUSIC SELECTION ──
  // Call this to auto-select the right track based on game context
  function setMusicForContext(context) {
    const trackMap = {
      'title': 'main',
      'market': 'chill',
      'stash': 'chill',
      'travel': 'travel',
      'traveling': 'travel',
      'shark': 'danger',
      'bank': 'chill',
      'encounter': 'combat',
      'combat': 'combat',
      'bust': 'combat',
      'club': 'club',
      'night': 'club',
      'gameover': 'gameover',
      'victory': 'victory',
      'achievement': 'victory',
      'quest': 'main',
      'dialogue': 'chill',
      'danger': 'danger',
      'default': 'main'
    };
    const track = trackMap[context] || 'main';
    setTrack(track);
  }

  // ── EXPORT ──
  window.Audio = {
    init,
    isInitialized,
    startBeat,
    stopBeat,
    setTrack,
    setMusicForContext,
    toggleMusic,
    setMasterVolume,
    setMusicVolume,
    setSfxVolume,
    // SFX
    sfxCashRegister,
    sfxBuy,
    sfxSell,
    sfxAlert,
    sfxSiren,
    sfxGunshot,
    sfxLevelUp,
    sfxPhoneVibrate,
    sfxClick,
    sfxError,
    sfxAchievement,
    sfxTravel,
    // Data
    PATTERNS,
    isPlaying: () => isPlaying,
    currentTrack: () => currentTrack
  };

})();
