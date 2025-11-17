import { createId } from '../utils/helpers';

export default class NarrativeEngine {
  constructor(updateFn) {
    this.messages = [];
    this.update = updateFn;
    this.timeouts = new Map();
  }

  push(text, options = {}) {
    if (!text) return null;
    const entry = {
      id: createId('narrative'),
      text,
      position: options.position || 'top',
      floating: options.floating || false,
      accent: options.accent || null,
    };
    this.messages = [...this.messages, entry];
    this.update(this.messages);
    const duration = options.duration || 6000;
    const timeoutId = setTimeout(() => this.remove(entry.id), duration);
    this.timeouts.set(entry.id, timeoutId);
    return entry.id;
  }

  sequence(lines = [], options = {}) {
    lines.forEach((line, index) => {
      setTimeout(() => {
        this.push(line, options);
      }, index * (options.gap || 2500));
    });
  }

  remove(id) {
    this.messages = this.messages.filter((msg) => msg.id !== id);
    this.update(this.messages);
    const timeout = this.timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(id);
    }
  }

  clear() {
    this.messages.forEach((message) => {
      const timeout = this.timeouts.get(message.id);
      if (timeout) clearTimeout(timeout);
    });
    this.messages = [];
    this.timeouts.clear();
    this.update([]);
  }

  dispose() {
    this.clear();
  }
}
