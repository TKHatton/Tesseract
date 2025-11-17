import { SCALE_MAP, DRONE_PITCH } from '../utils/constants';
import { randomFromArray } from '../utils/helpers';

const DEFAULT_VOLUME = -8;

export default class MusicEngine {
  constructor() {
    this.tone = window.Tone;
    this.initialized = false;
    this.currentPhase = 1;
    this.isMuted = false;
    if (!this.tone) {
      console.warn('Tone.js not detected. Music system disabled.');
      return;
    }
    this.master = new this.tone.Volume(DEFAULT_VOLUME).toDestination();
    this.reverb = new this.tone.Reverb({ decay: 12, wet: 0.45 }).connect(this.master);
    this.delay = new this.tone.FeedbackDelay({ delayTime: '8n', feedback: 0.35, wet: 0.35 }).connect(
      this.master,
    );
    this.synth = new this.tone.PolySynth(this.tone.Synth).chain(this.reverb, this.delay);
    this.drone = null;
    this.scale = SCALE_MAP[1];
  }

  async resume() {
    if (!this.tone) return;
    if (this.initialized) return;
    await this.tone.start();
    this.initialized = true;
    this.setPhase(this.currentPhase);
  }

  setPhase(phase = 1) {
    this.currentPhase = phase;
    this.scale = SCALE_MAP[phase] || SCALE_MAP[1];
    if (!this.tone) return;
    if (!this.drone) {
      this.drone = new this.tone.PolySynth(this.tone.Synth).chain(this.reverb, this.delay);
      this.drone.volume.value = -18;
      this.droneTrigger = new this.tone.Loop(() => {
        const notes = (DRONE_PITCH[phase] || DRONE_PITCH[1]).split('+');
        this.drone.triggerAttackRelease(notes, '4n');
      }, '1m').start(0);
    } else if (this.droneTrigger) {
      this.droneTrigger.cancel(0);
      const notes = (DRONE_PITCH[phase] || DRONE_PITCH[1]).split('+');
      this.droneTrigger = new this.tone.Loop(() => {
        this.drone.triggerAttackRelease(notes, '4n');
      }, '1m').start(0);
    }
  }

  trigger(event = 'click', payload = {}) {
    if (!this.initialized || !this.synth) return;
    switch (event) {
      case 'rotate':
        this.playNoteByIndex(payload.index || 0, 0.2);
        break;
      case 'click':
        this.playNoteByIndex(payload.index || 0, 0.3);
        break;
      case 'match':
        this.playChord(3, 0.45);
        break;
      case 'wrong':
        this.playDissonant();
        break;
      case 'victory':
        this.playArpeggio();
        break;
      default:
        this.playNoteByIndex(0, 0.2);
    }
  }

  playNoteByIndex(index, duration = 0.2) {
    const note = this.scale[index % this.scale.length];
    this.synth.triggerAttackRelease(note, duration);
  }

  playChord(size = 3, duration = 0.6) {
    const notes = [];
    for (let i = 0; i < size; i += 1) {
      const note = this.scale[(Math.floor(Math.random() * this.scale.length) + i) % this.scale.length];
      notes.push(note);
    }
    this.synth.triggerAttackRelease(notes, duration);
  }

  playDissonant() {
    const base = randomFromArray(this.scale);
    const interval = randomFromArray(['m2', 'tritone']);
    const offset = interval === 'm2' ? 1 : 6;
    const idx = (this.scale.indexOf(base) + offset) % this.scale.length;
    const note = this.scale[idx];
    this.synth.triggerAttackRelease([base, note], 0.25);
  }

  playArpeggio() {
    this.scale.forEach((note, idx) => {
      this.synth.triggerAttackRelease(note, 0.4, this.tone.now() + idx * 0.15);
    });
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.master) {
      this.master.mute = muted;
    }
  }
}
