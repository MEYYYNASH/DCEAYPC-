/**
 * LyricsEngine - High precision parser and synchronizer for LRC lyrics.
 */
export class LyricsEngine {
  constructor() {
    this.lines = [];
    this.metadata = {};
    this.userOffsetMs = 0;
  }

  parseLRC(lrcText) {
    this.lines = [];
    this.metadata = {};
    if (!lrcText || typeof lrcText !== 'string') return [];

    const rawLines = lrcText.split(/\r?\n/);
    const tagRegex = /^\[([a-zA-Z]+):(.*)\]$/;
    const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

    for (const rawLine of rawLines) {
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

      // Check metadata tag like [ti:Song] or [offset:100]
      const tagMatch = trimmed.match(tagRegex);
      if (tagMatch) {
        const key = tagMatch[1].toLowerCase();
        const val = tagMatch[2].trim();
        this.metadata[key] = val;
        if (key === 'offset') {
          const parsed = parseInt(val, 10);
          if (!isNaN(parsed)) this.userOffsetMs = parsed;
        }
        continue;
      }

      // Check timestamps
      let match;
      const timestamps = [];
      while ((match = timeRegex.exec(trimmed)) !== null) {
        const min = parseInt(match[1], 10);
        const sec = parseInt(match[2], 10);
        const msStr = match[3] || '0';
        const ms = msStr.length === 2 ? parseInt(msStr, 10) * 10 : parseInt(msStr.padEnd(3, '0').slice(0, 3), 10);
        timestamps.push(min * 60 + sec + ms / 1000);
      }

      const text = trimmed.replace(/\[\d{1,2}:\d{2}(?:\.\d{2,3})?\]/g, '').trim();

      if (timestamps.length > 0 && text.length > 0) {
        for (const time of timestamps) {
          this.lines.push({ time, text });
        }
      }
    }

    // Sort chronologically
    this.lines.sort((a, b) => a.time - b.time);
    return this.lines;
  }

  getActiveLineIndex(currentTimeSeconds) {
    if (!this.lines.length) return -1;

    const adjustedTime = currentTimeSeconds + (this.userOffsetMs / 1000);

    // If before first line
    if (adjustedTime < this.lines[0].time) return 0;

    let low = 0;
    let high = this.lines.length - 1;
    let result = -1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (this.lines[mid].time <= adjustedTime) {
        result = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return result;
  }

  setOffset(offsetMs) {
    this.userOffsetMs = offsetMs;
  }

  getOffset() {
    return this.userOffsetMs;
  }

  hasLyrics() {
    return this.lines.length > 0;
  }
}
