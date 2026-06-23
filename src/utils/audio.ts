/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let audioCtx: AudioContext | null = null;
let sirenOscillator1: OscillatorNode | null = null;
let sirenOscillator2: OscillatorNode | null = null;
let sirenGain: GainNode | null = null;
let sirenInterval: any = null;

export function startEmergencySiren() {
  try {
    // Lazy-init
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Stop former if already running
    stopEmergencySiren();

    sirenGain = audioCtx.createGain();
    sirenGain.gain.setValueAtTime(0.0, audioCtx.currentTime);

    // High warning oscillator 1
    sirenOscillator1 = audioCtx.createOscillator();
    sirenOscillator1.type = 'sawtooth';
    sirenOscillator1.frequency.setValueAtTime(800, audioCtx.currentTime); // High pitched

    // Low warning oscillator 2
    sirenOscillator2 = audioCtx.createOscillator();
    sirenOscillator2.type = 'sine';
    sirenOscillator2.frequency.setValueAtTime(1000, audioCtx.currentTime);

    // Connect them
    sirenOscillator1.connect(sirenGain);
    sirenOscillator2.connect(sirenGain);
    sirenGain.connect(audioCtx.destination);

    sirenOscillator1.start();
    sirenOscillator2.start();

    // Sound intermittent oscillation loop (classical alarm sweep)
    let flip = true;
    sirenInterval = setInterval(() => {
      if (!audioCtx || !sirenGain) return;
      
      const targetFreq = flip ? 1200 : 700;
      const targetGain = 0.15; // Safe comfortable loudness

      sirenOscillator1?.frequency.exponentialRampToValueAtTime(targetFreq, audioCtx.currentTime + 0.3);
      sirenOscillator2?.frequency.exponentialRampToValueAtTime(targetFreq + 200, audioCtx.currentTime + 0.3);
      sirenGain.gain.linearRampToValueAtTime(targetGain, audioCtx.currentTime + 0.05);

      flip = !flip;
    }, 450);

  } catch (error) {
    console.warn('Audio Context is blocked or not supported on this browser context', error);
  }
}

export function stopEmergencySiren() {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }

  try {
    if (sirenGain) {
      sirenGain.gain.setValueAtTime(0, audioCtx?.currentTime || 0);
      sirenGain.disconnect();
      sirenGain = null;
    }
    if (sirenOscillator1) {
      sirenOscillator1.stop();
      sirenOscillator1.disconnect();
      sirenOscillator1 = null;
    }
    if (sirenOscillator2) {
      sirenOscillator2.stop();
      sirenOscillator2.disconnect();
      sirenOscillator2 = null;
    }
  } catch (err) {
    // Fail safely
  }
}

// Play a quick soft positive tick sound
export function playTick() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const clickCtx = new AudioContextClass();
    const osc = clickCtx.createOscillator();
    const g = clickCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, clickCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, clickCtx.currentTime + 0.08);
    
    g.gain.setValueAtTime(0.08, clickCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, clickCtx.currentTime + 0.1);
    
    osc.connect(g);
    g.connect(clickCtx.destination);
    
    osc.start();
    osc.stop(clickCtx.currentTime + 0.1);
  } catch (e) {
    // Ignore error
  }
}
