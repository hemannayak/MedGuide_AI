export function splitSpeechText(text: string, limit = 1800): string[] {
  if (limit < 1) throw new Error("Speech segment limit must be positive");
  const chunks: string[] = [];
  let remaining = text.trim();
  while (remaining.length > limit) {
    const prefix = remaining.slice(0, limit);
    const sentence = Math.max(prefix.lastIndexOf(". "), prefix.lastIndexOf("। "), prefix.lastIndexOf("? "));
    const space = prefix.lastIndexOf(" ");
    let end = sentence >= limit / 2 ? sentence + 1 : space > 0 ? space : limit;
    // Keep UTF-16 surrogate pairs intact when there is no word boundary.
    if (end === limit && /[\uD800-\uDBFF]/.test(remaining[end - 1])) end--;
    chunks.push(remaining.slice(0, end).trim());
    remaining = remaining.slice(end).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

type AudioHandle = {
  pause(): void;
  play(): Promise<void>;
  onended: ((event: Event) => unknown) | null;
  onerror: ((event: Event) => unknown) | null;
};

/** A generation counter prevents cancelled requests from starting late audio. */
export class SpeechPlayback {
  private generation = 0;
  private audio: AudioHandle | null = null;
  private finish: (() => void) | null = null;

  cancel() {
    this.generation++;
    this.audio?.pause();
    this.audio = null;
    this.finish?.();
    this.finish = null;
  }

  async speak(text: string, synthesize: (text: string) => Promise<string>,
    createAudio: (source: string) => AudioHandle, onPlaying: () => void) {
    this.cancel();
    const current = this.generation;
    for (const segment of splitSpeechText(text)) {
      let source: string;
      try {
        source = await synthesize(segment);
      } catch (error) {
        if (current !== this.generation) return;
        throw error;
      }
      if (current !== this.generation) return;
      const audio = createAudio(source);
      this.audio = audio;
      await new Promise<void>((resolve, reject) => {
        this.finish = resolve;
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error("Audio playback failed"));
        audio.play().then(() => {
          if (current === this.generation) onPlaying();
        }, reject);
      });
      if (current !== this.generation) return;
      this.finish = null;
      this.audio = null;
    }
  }
}
