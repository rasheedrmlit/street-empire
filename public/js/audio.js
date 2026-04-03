// ============================================================
// STREET EMPIRE — Audio Engine v2
// Procedural trap music & SFX using Web Audio API
// Improved: proper scheduling, reverb, variation, richer sound
// ============================================================

(function() {
  'use strict';

  let audioCtx = null;
  let masterGain = null;
  let musicGain = null;
  let sfxGain = null;
  let reverbNode = null;
  let reverbGain = null;
  let compressor = null;
  let isPlaying = false;
  let currentTrack = 'main';
  let schedulerTimer = null;
  let nextNoteTime = 0;
  let currentStep = 0;
  let bpm = 140;
  let barCount = 0;

  // Initialize audio context (must be called after user gesture)
  function init() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Master compressor to glue everything together
    compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 12;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.15;
    compressor.connect(audioCtx.destination);

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.7;
    masterGain.connect(compressor);

    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0.45;
    musicGain.connect(masterGain);

    sfxGain = audioCtx.createGain();
    sfxGain.gain.value = 0.8;
    sfxGain.connect(masterGain);

    // Create convolution reverb
    createReverb();
  }

  // Generate impulse response for reverb
  function createReverb() {
    const sampleRate = audioCtx.sampleRate;
    const length = sampleRate * 1.5; // 1.5 second reverb
    const impulse = audioCtx.createBuffer(2, length, sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }
    reverbNode = audioCtx.createConvolver();
    reverbNode.buffer = impulse;
    reverbGain = audioCtx.createGain();
    reverbGain.gain.value = 0.15;
    reverbNode.connect(reverbGain);
    reverbGain.connect(musicGain);
  }

  // ── SYNTHESIZER COMPONENTS ──

  // Deep 808 bass with sub and saturation
  function play808(freq = 55, time = 0, duration = 0.5, volume = 0.8) {
    if (!audioCtx) return;
    const t = time || audioCtx.currentTime;

    // Sub oscillator
    const sub = audioCtx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(freq * 2, t);
    sub.frequency.exponentialRampToValueAtTime(freq, t + 0.04);
    sub.frequency.exponentialRampToValueAtTime(freq * 0.5, t + duration * 0.8);

    // Harmonic layer for punch
    const harm = audioCtx.createOscillator();
    harm.type = 'triangle';
    harm.frequency.setValueAtTime(freq * 3, t);
    harm.frequency.exponentialRampToValueAtTime(freq * 0.8, t + 0.06);

    // Distortion for warmth
    const dist = audioCtx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = Math.tanh(x * 2);
    }
    dist.curve = curve;
    dist.oversample = '2x';

    const subGain = audioCtx.createGain();
    subGain.gain.setValueAtTime(volume, t);
    subGain.gain.setValueAtTime(volume * 0.8, t + duration * 0.3);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    const harmGain = audioCtx.createGain();
    harmGain.gain.setValueAtTime(volume * 0.3, t);
    harmGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    // Low pass to keep it clean
    const lpf = audioCtx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.setValueAtTime(freq * 8, t);
    lpf.frequency.exponentialRampToValueAtTime(freq * 2, t + duration * 0.5);

    sub.connect(dist);
    harm.connect(harmGain);
    harmGain.connect(dist);
    dist.connect(lpf);
    lpf.connect(subGain);
    subGain.connect(musicGain);

    sub.start(t);
    harm.start(t);
    sub.stop(t + duration);
    harm.stop(t + duration);
  }

  // Hi-hat with more character
  function playHiHat(time = 0, open = false, volume = 0.3) {
    if (!audioCtx) return;
    const t = time || audioCtx.currentTime;
    const duration = open ? 0.15 : 0.04;

    // Multiple oscillators for metallic quality
    const freqs = [3500, 5500, 8000, 11000];
    const mixer = audioCtx.createGain();
    mixer.gain.setValueAtTime(volume * 0.6, t);
    mixer.gain.exponentialRampToValueAtTime(0.001, t + duration);

    freqs.forEach(f => {
      const osc = audioCtx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = f + (Math.random() - 0.5) * 200; // slight random
      const g = audioCtx.createGain();
      g.gain.value = 0.08;
      osc.connect(g);
      g.connect(mixer);
      osc.start(t);
      osc.stop(t + duration);
    });

    // Noise layer
    const bufferSize = Math.floor(audioCtx.sampleRate * duration);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.5, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    const hpf = audioCtx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = open ? 6000 : 8500;

    const bpf = audioCtx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = open ? 8000 : 10000;
    bpf.Q.value = 1.5;

    noise.connect(hpf);
    hpf.connect(bpf);
    bpf.connect(noiseGain);
    noiseGain.connect(mixer);
    mixer.connect(musicGain);
    if (open && reverbNode) mixer.connect(reverbNode); // open hats get reverb

    noise.start(t);
    noise.stop(t + duration);
  }

  // Snare/clap with body and snap
  function playSnare(time = 0, volume = 0.5) {
    if (!audioCtx) return;
    const t = time || audioCtx.currentTime;

    // Body tone
    const body = audioCtx.createOscillator();
    body.type = 'triangle';
    body.frequency.setValueAtTime(220, t);
    body.frequency.exponentialRampToValueAtTime(120, t + 0.04);
    const bodyGain = audioCtx.createGain();
    bodyGain.gain.setValueAtTime(volume * 0.6, t);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    body.connect(bodyGain);
    bodyGain.connect(musicGain);
    body.start(t);
    body.stop(t + 0.08);

    // Noise snap
    const noiseLen = Math.floor(audioCtx.sampleRate * 0.12);
    const noiseBuf = audioCtx.createBuffer(1, noiseLen, audioCtx.sampleRate);
    const noiseData = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuf;

    const hpf = audioCtx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 2000;

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.8, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    noise.connect(hpf);
    hpf.connect(noiseGain);
    noiseGain.connect(musicGain);
    if (reverbNode) noiseGain.connect(reverbNode); // snare gets reverb

    noise.start(t);
    noise.stop(t + 0.12);
  }

  // Clap (layered snares)
  function playClap(time = 0, volume = 0.4) {
    if (!audioCtx) return;
    const t = time || audioCtx.currentTime;
    // Multiple micro-hits for clap texture
    for (let i = 0; i < 3; i++) {
      const offset = i * 0.012;
      const len = Math.floor(audioCtx.sampleRate * 0.06);
      const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      for (let j = 0; j < len; j++) d[j] = Math.random() * 2 - 1;
      const src = audioCtx.createBufferSource();
      src.buffer = buf;
      const bpf = audioCtx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.value = 1500 + Math.random() * 500;
      bpf.Q.value = 2;
      const g = audioCtx.createGain();
      g.gain.setValueAtTime(volume * 0.5, t + offset);
      g.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.08);
      src.connect(bpf);
      bpf.connect(g);
      g.connect(musicGain);
      if (reverbNode) g.connect(reverbNode);
      src.start(t + offset);
      src.stop(t + offset + 0.08);
    }
  }

  // Synth pad with filter sweep and detune
  function playSynth(freq, time = 0, duration = 0.3, type = 'sawtooth', volume = 0.12) {
    if (!audioCtx) return;
    const t = time || audioCtx.currentTime;

    const voices = 3;
    const detuneAmounts = [-8, 0, 8]; // cents
    const mixer = audioCtx.createGain();

    for (let v = 0; v < voices; v++) {
      const osc = audioCtx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      osc.detune.value = detuneAmounts[v] + (Math.random() - 0.5) * 4;
      const g = audioCtx.createGain();
      g.gain.value = 1 / voices;
      osc.connect(g);
      g.connect(mixer);
      osc.start(t);
      osc.stop(t + duration + 0.05);
    }

    // Filter sweep
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(freq * 6, 8000), t);
    filter.frequency.exponentialRampToValueAtTime(Math.max(freq * 0.5, 200), t + duration);
    filter.Q.value = 3;

    // ADSR envelope
    const env = audioCtx.createGain();
    env.gain.setValueAtTime(0.001, t);
    env.gain.linearRampToValueAtTime(volume, t + 0.015);
    env.gain.setValueAtTime(volume * 0.8, t + duration * 0.3);
    env.gain.exponentialRampToValueAtTime(0.001, t + duration);

    mixer.connect(filter);
    filter.connect(env);
    env.connect(musicGain);
    if (reverbNode) env.connect(reverbNode);
  }

  // Pluck for arpeggios
  function playPluck(freq, time = 0, duration = 0.15, volume = 0.18) {
    if (!audioCtx) return;
    const t = time || audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = freq;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 10, t);
    filter.frequency.exponentialRampToValueAtTime(freq, t + duration * 0.6);
    filter.Q.value = 2;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(musicGain);
    if (reverbNode) gain.connect(reverbNode);

    osc.start(t);
    osc.stop(t + duration + 0.01);
  }

  // Sub bass drone for atmosphere
  function playDrone(freq, time = 0, duration = 2.0, volume = 0.06) {
    if (!audioCtx) return;
    const t = time || audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.3;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = freq * 0.02;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(volume, t + 0.3);
    g.gain.setValueAtTime(volume, t + duration - 0.5);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(g);
    g.connect(musicGain);
    osc.start(t);
    lfo.start(t);
    osc.stop(t + duration);
    lfo.stop(t + duration);
  }

  // ── MUSICAL SCALES ──
  // Minor pentatonic in various keys (trap standard)
  const SCALES = {
    Fmin:  [174.61, 207.65, 233.08, 261.63, 311.13, 349.23, 415.30, 466.16, 523.25],
    Dmin:  [146.83, 174.61, 196.00, 220.00, 261.63, 293.66, 349.23, 392.00, 440.00],
    Cmin:  [130.81, 155.56, 174.61, 196.00, 233.08, 261.63, 311.13, 349.23, 392.00],
    Emin:  [164.81, 196.00, 220.00, 246.94, 293.66, 329.63, 392.00, 440.00, 493.88],
    Amin:  [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25],
    Abmin: [207.65, 246.94, 277.18, 311.13, 369.99, 415.30, 493.88, 554.37, 622.25],
  };

  // ── BEAT PATTERNS ──
  // Now with variation: multiple bar alternatives, probability-based ghost notes
  const PATTERNS = {
    main: {
      bpm: 140,
      key: 'Fmin',
      bars: 4,
      bass: [
        { steps: [[0, 44, 0.4, 0.7], [6, 44, 0.2, 0.4], [10, 55, 0.4, 0.7]] },
        { steps: [[0, 44, 0.4, 0.7], [4, 55, 0.2, 0.4], [10, 44, 0.3, 0.6], [14, 55, 0.2, 0.4]] },
      ],
      drums: [
        // kick on 0,10; snare on 4,12; hats on every 8th; ghost notes with probability
        { steps: [
          {s:0,t:'kick'},{s:2,t:'hat'},{s:3,t:'hat',p:0.4},{s:4,t:'snare'},{s:5,t:'hat',p:0.5},
          {s:6,t:'hat',open:true},{s:7,t:'hat',p:0.3},{s:8,t:'hat'},{s:9,t:'hat',p:0.4},
          {s:10,t:'kick'},{s:11,t:'hat',p:0.5},{s:12,t:'snare'},{s:13,t:'hat'},
          {s:14,t:'hat',open:true},{s:15,t:'hat',p:0.3}
        ]},
        { steps: [
          {s:0,t:'kick'},{s:2,t:'hat'},{s:3,t:'hat'},{s:4,t:'clap'},{s:5,t:'hat',p:0.4},
          {s:6,t:'hat'},{s:7,t:'hat',p:0.5},{s:8,t:'kick',p:0.6},{s:9,t:'hat'},
          {s:10,t:'kick'},{s:11,t:'hat'},{s:12,t:'clap'},{s:13,t:'hat',open:true},
          {s:14,t:'hat'},{s:15,t:'hat'}
        ]},
      ],
      melody: 'arp', // arp = arpeggiate scale, pad = sustained chords
      melodyOctave: 1, // 0=low, 1=mid, 2=high
    },

    combat: {
      bpm: 152,
      key: 'Cmin',
      bars: 2,
      bass: [
        { steps: [[0, 33, 0.3, 0.9], [3, 33, 0.15, 0.5], [6, 39, 0.3, 0.8], [8, 33, 0.3, 0.9], [11, 33, 0.15, 0.5], [14, 44, 0.2, 0.7]] },
      ],
      drums: [
        { steps: [
          {s:0,t:'kick'},{s:1,t:'hat'},{s:2,t:'hat'},{s:3,t:'kick',p:0.5},{s:4,t:'snare'},
          {s:5,t:'hat'},{s:6,t:'hat',open:true},{s:7,t:'hat'},{s:8,t:'kick'},
          {s:9,t:'hat'},{s:10,t:'hat'},{s:11,t:'hat',p:0.4},{s:12,t:'snare'},
          {s:13,t:'clap'},{s:14,t:'hat'},{s:15,t:'hat',open:true}
        ]},
      ],
      melody: 'stab',
      melodyOctave: 0,
    },

    chill: {
      bpm: 125,
      key: 'Amin',
      bars: 4,
      bass: [
        { steps: [[0, 55, 0.6, 0.5], [8, 49, 0.6, 0.5]] },
        { steps: [[0, 55, 0.6, 0.5], [8, 44, 0.6, 0.5]] },
      ],
      drums: [
        { steps: [
          {s:0,t:'kick'},{s:4,t:'snare',v:0.35},{s:6,t:'hat',open:true,v:0.12},
          {s:8,t:'hat',v:0.15},{s:10,t:'hat',v:0.12},{s:12,t:'snare',v:0.35},
          {s:14,t:'hat',v:0.1}
        ]},
      ],
      melody: 'pad',
      melodyOctave: 1,
    },

    travel: {
      bpm: 145,
      key: 'Emin',
      bars: 2,
      bass: [
        { steps: [[0, 41, 0.4, 0.7], [4, 41, 0.2, 0.4], [8, 55, 0.4, 0.7], [12, 49, 0.3, 0.5]] },
      ],
      drums: [
        { steps: [
          {s:0,t:'kick'},{s:2,t:'hat'},{s:3,t:'hat',p:0.4},{s:4,t:'snare'},{s:5,t:'hat'},
          {s:6,t:'hat'},{s:7,t:'hat',open:true},{s:8,t:'kick'},{s:9,t:'hat',p:0.5},
          {s:10,t:'hat'},{s:11,t:'hat'},{s:12,t:'snare'},{s:13,t:'hat'},
          {s:14,t:'hat',open:true},{s:15,t:'hat'}
        ]},
      ],
      melody: 'arp',
      melodyOctave: 1,
    },

    danger: {
      bpm: 130,
      key: 'Abmin',
      bars: 2,
      bass: [
        { steps: [[0, 26, 0.7, 0.9], [6, 26, 0.2, 0.4], [8, 31, 0.7, 0.9], [14, 26, 0.2, 0.4]] },
      ],
      drums: [
        { steps: [
          {s:0,t:'kick'},{s:4,t:'snare',v:0.5},{s:6,t:'hat',open:true,v:0.15},
          {s:8,t:'kick'},{s:12,t:'snare',v:0.5},{s:14,t:'hat',open:true,v:0.15}
        ]},
      ],
      melody: 'pad',
      melodyOctave: 0,
    },

    victory: {
      bpm: 142,
      key: 'Dmin',
      bars: 2,
      bass: [
        { steps: [[0, 55, 0.4, 0.7], [4, 65, 0.4, 0.7], [8, 73, 0.4, 0.7], [12, 82, 0.4, 0.7]] },
      ],
      drums: [
        { steps: [
          {s:0,t:'kick'},{s:2,t:'hat'},{s:4,t:'clap'},{s:5,t:'hat'},{s:6,t:'hat',open:true},
          {s:8,t:'kick'},{s:10,t:'hat'},{s:12,t:'clap'},{s:14,t:'snare'},{s:15,t:'snare',v:0.3}
        ]},
      ],
      melody: 'arp',
      melodyOctave: 2,
    },

    club: {
      bpm: 128,
      key: 'Fmin',
      bars: 4,
      bass: [
        { steps: [[0, 44, 0.25, 0.8], [2, 44, 0.1, 0.3], [4, 44, 0.25, 0.8], [6, 44, 0.1, 0.3],
                  [8, 37, 0.25, 0.8], [10, 37, 0.1, 0.3], [12, 37, 0.25, 0.8], [14, 37, 0.1, 0.3]] },
      ],
      drums: [
        { steps: [
          {s:0,t:'kick'},{s:1,t:'hat'},{s:2,t:'hat'},{s:3,t:'hat'},{s:4,t:'clap'},
          {s:5,t:'hat'},{s:6,t:'hat'},{s:7,t:'hat'},{s:8,t:'kick'},{s:9,t:'hat'},
          {s:10,t:'hat'},{s:11,t:'hat'},{s:12,t:'clap'},{s:13,t:'hat'},
          {s:14,t:'hat',open:true},{s:15,t:'hat'}
        ]},
      ],
      melody: 'arp',
      melodyOctave: 1,
    },

    gameover: {
      bpm: 90,
      key: 'Cmin',
      bars: 2,
      bass: [
        { steps: [[0, 33, 1.0, 0.6], [8, 31, 1.0, 0.6]] },
      ],
      drums: [
        { steps: [{s:4,t:'snare',v:0.25},{s:12,t:'snare',v:0.25}] },
      ],
      melody: 'pad',
      melodyOctave: 0,
    }
  };

  // ── BEAT SEQUENCER (Web Audio scheduling for tight timing) ──

  const SCHEDULE_AHEAD = 0.1; // seconds
  const LOOKAHEAD = 25; // ms

  function startBeat(trackName) {
    if (!audioCtx) init();
    if (!PATTERNS[trackName]) trackName = 'main';
    if (isPlaying && currentTrack === trackName) return;

    stopBeat();
    currentTrack = trackName;
    const pattern = PATTERNS[trackName];
    bpm = pattern.bpm;
    currentStep = 0;
    barCount = 0;
    isPlaying = true;
    nextNoteTime = audioCtx.currentTime + 0.05;

    scheduler();
  }

  function scheduler() {
    if (!isPlaying) return;
    const pattern = PATTERNS[currentTrack];
    if (!pattern) return;

    while (nextNoteTime < audioCtx.currentTime + SCHEDULE_AHEAD) {
      scheduleStep(pattern, currentStep, nextNoteTime);
      advanceStep(pattern);
    }

    schedulerTimer = setTimeout(scheduler, LOOKAHEAD);
  }

  function scheduleStep(pattern, step, time) {
    const stepsPerBar = 16;
    const barStep = step % stepsPerBar;
    const currentBar = Math.floor(step / stepsPerBar);

    // Select drum pattern variant
    const drumVariant = pattern.drums[currentBar % pattern.drums.length];
    drumVariant.steps.forEach(d => {
      if (d.s !== barStep) return;
      if (d.p && Math.random() > d.p) return; // probability-based ghost notes
      const vol = (d.v || 0.3) * (0.9 + Math.random() * 0.2); // humanize volume
      const timeJitter = (Math.random() - 0.5) * 0.003; // micro-timing humanize

      switch(d.t) {
        case 'kick': play808(44, time + timeJitter, 0.25, vol * 1.5); break;
        case 'snare': playSnare(time + timeJitter, vol * 1.4); break;
        case 'clap': playClap(time + timeJitter, vol * 1.2); break;
        case 'hat': playHiHat(time + timeJitter, d.open || false, vol); break;
      }
    });

    // Select bass pattern variant
    const bassVariant = pattern.bass[currentBar % pattern.bass.length];
    bassVariant.steps.forEach(b => {
      if (b[0] === barStep) play808(b[1], time, b[2], b[3]);
    });

    // Melody generation
    const scale = SCALES[pattern.key] || SCALES.Fmin;
    const octaveOffset = (pattern.melodyOctave || 1) * 3;

    if (pattern.melody === 'arp') {
      // Arpeggiate: play scale notes on certain steps with variation
      const arpSteps = [0, 3, 6, 8, 10, 12, 14];
      if (arpSteps.includes(barStep)) {
        // Pick notes from scale with some randomness
        const noteIdx = (barStep + currentBar * 3) % scale.length;
        const freq = scale[Math.min(noteIdx + Math.floor(octaveOffset * 0.5), scale.length - 1)];
        if (Math.random() > 0.25) { // 75% chance to play
          playPluck(freq, time, 0.12, 0.13 + Math.random() * 0.04);
        }
      }
    } else if (pattern.melody === 'pad') {
      // Sustained pad chord on bar start
      if (barStep === 0) {
        const stepDur = 60 / bpm / 4;
        const dur = stepDur * 14;
        const idx = currentBar % 4;
        const chordRoot = scale[Math.min(idx * 2, scale.length - 1)];
        playSynth(chordRoot, time, dur, 'sawtooth', 0.06);
        playSynth(chordRoot * 1.2, time, dur, 'sawtooth', 0.04); // minor third approx
        playSynth(chordRoot * 1.5, time, dur, 'sawtooth', 0.03); // fifth
      }
    } else if (pattern.melody === 'stab') {
      // Short aggressive stabs
      const stabSteps = [0, 4, 8, 12];
      if (stabSteps.includes(barStep)) {
        const idx = (barStep / 4 + currentBar) % scale.length;
        const freq = scale[Math.min(idx + octaveOffset, scale.length - 1)];
        playSynth(freq, time, 0.08, 'square', 0.1);
        playSynth(freq * 1.5, time, 0.08, 'square', 0.06);
      }
    }

    // Atmospheric drone every 4 bars
    if (barStep === 0 && currentBar % 4 === 0) {
      const rootFreq = scale[0] * 0.5;
      playDrone(rootFreq, time, 60 / bpm * 4, 0.04);
    }
  }

  function advanceStep(pattern) {
    const stepDuration = 60 / bpm / 4;
    nextNoteTime += stepDuration;
    currentStep++;
    const totalSteps = 16 * (pattern.bars || 1);
    if (currentStep >= totalSteps) {
      currentStep = 0;
      barCount++;
    }
  }

  function stopBeat() {
    isPlaying = false;
    if (schedulerTimer) {
      clearTimeout(schedulerTimer);
      schedulerTimer = null;
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

  function sfxSell() { if (!audioCtx) return; sfxCashRegister(); }

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
    const bufferSize = Math.floor(audioCtx.sampleRate * 0.15);
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
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
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
    [659.25, 783.99, 987.77, 1318.51].forEach((freq, i) => {
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
  function setMasterVolume(val) { if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, val)); }
  function setMusicVolume(val) { if (musicGain) musicGain.gain.value = Math.max(0, Math.min(1, val)); }
  function setSfxVolume(val) { if (sfxGain) sfxGain.gain.value = Math.max(0, Math.min(1, val)); }

  function toggleMusic() {
    if (isPlaying) { stopBeat(); return false; }
    else { startBeat(currentTrack); return true; }
  }

  function isInitialized() { return !!audioCtx; }

  function setMusicForContext(context) {
    const trackMap = {
      'title': 'main', 'main': 'main', 'market': 'chill', 'stash': 'chill',
      'travel': 'travel', 'traveling': 'travel', 'shark': 'danger', 'bank': 'chill',
      'encounter': 'combat', 'combat': 'combat', 'bust': 'combat',
      'club': 'club', 'night': 'club', 'gameover': 'gameover',
      'victory': 'victory', 'achievement': 'victory', 'quest': 'main',
      'dialogue': 'chill', 'danger': 'danger', 'default': 'main'
    };
    setTrack(trackMap[context] || 'main');
  }

  // ── EXPORT ──
  window.Audio = {
    init, isInitialized, startBeat, stopBeat, setTrack, setMusicForContext, toggleMusic,
    setMasterVolume, setMusicVolume, setSfxVolume,
    sfxCashRegister, sfxBuy, sfxSell, sfxAlert, sfxSiren, sfxGunshot,
    sfxLevelUp, sfxPhoneVibrate, sfxClick, sfxError, sfxAchievement, sfxTravel,
    PATTERNS, isPlaying: () => isPlaying, currentTrack: () => currentTrack
  };

})();
