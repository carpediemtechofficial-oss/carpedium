let isMuted = true;

export function getMuteState(): boolean {
  return isMuted;
}

export function setMuteState(muted: boolean) {
  isMuted = muted;
}

export function playTick() {
  if (isMuted) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    // Quick mechanical-like pitch drop tick
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.03);

    // Very short, quiet click curve
    gainNode.gain.setValueAtTime(0.012, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.03);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.035);
  } catch (error) {
    // Fail silently to prevent console pollution
  }
}
