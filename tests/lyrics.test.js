import assert from 'node:assert';
import { LyricsEngine } from '../app/js/lyrics-engine.js';

console.log('Running LyricsEngine tests...');

const engine = new LyricsEngine();

const sampleLrc = `
[ti:Cyberpunk Odyssey]
[ar:DCEAY Audio Lab]
[offset:500]
[00:02.50]Line One in the matrix
[00:08.00]Line Two synthwave vibes
[00:15.20]Line Three neon horizon
[00:22.00]Line Four digital sunset
`;

const lines = engine.parseLRC(sampleLrc);

// Test 1: Line parsing
assert.strictEqual(lines.length, 4, 'Should parse 4 lyric lines');
assert.strictEqual(engine.metadata.ti, 'Cyberpunk Odyssey', 'Metadata title should match');
assert.strictEqual(engine.metadata.ar, 'DCEAY Audio Lab', 'Metadata artist should match');
assert.strictEqual(engine.getOffset(), 500, 'Parsed offset should be 500ms');

// Test 2: Active line index tracking with offset
// Line 1 is at 2.50s. With 500ms offset, adjusted time is time + 0.5s.
// At time 1.0s, adjusted is 1.5s (< 2.5s) -> before line 1 (idx 0)
assert.strictEqual(engine.getActiveLineIndex(1.0), 0);

// At time 2.1s, adjusted is 2.6s (>= 2.5s and < 8.0s) -> line 0
assert.strictEqual(engine.getActiveLineIndex(2.1), 0);

// At time 8.0s, adjusted is 8.5s (>= 8.0s and < 15.2s) -> line 1
assert.strictEqual(engine.getActiveLineIndex(8.0), 1);

// At time 25.0s -> last line (idx 3)
assert.strictEqual(engine.getActiveLineIndex(25.0), 3);

// Test 3: Manual offset adjustment
engine.setOffset(-1000);
assert.strictEqual(engine.getOffset(), -1000);

console.log('LyricsEngine tests passed successfully!');
