/**
 * AudioEngine - Production grade audio playback engine with Web Audio API Equalizer,
 * System MediaSession integration, Sleep Timer, Shuffle, and Repeat.
 */
export class AudioEngine {
  constructor({ onTimeUpdate, onTrackEnd, onStateChange }) {
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.audio.crossOrigin = 'anonymous';

    this.onTimeUpdate = onTimeUpdate || (() => {});
    this.onTrackEnd = onTrackEnd || (() => {});
    this.onStateChange = onStateChange || (() => {});

    this.currentTrack = null;
    this.queue = [];
    this.queueIndex = -1;
    this.originalQueue = [];
    this.isShuffle = false;
    this.repeatMode = 'all'; // 'off' | 'all' | 'one'
    this.isPlaying = false;
    this.sleepTimerId = null;
    this.sleepTimerRemaining = 0;

    // Web Audio Equalizer nodes
    this.audioCtx = null;
    this.sourceNode = null;
    this.gainNode = null;
    this.eqNodes = [];
    this.isEqInitialized = false;

    this.setupListeners();
    this.setupMediaSession();
  }

  setupListeners() {
    this.audio.addEventListener('timeupdate', () => {
      this.onTimeUpdate(this.audio.currentTime, this.audio.duration || 0);
    });

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.updateMediaSessionState();
      this.onStateChange('playing');
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updateMediaSessionState();
      this.onStateChange('paused');
    });

    this.audio.addEventListener('ended', () => {
      if (this.repeatMode === 'one') {
        this.seek(0);
        this.play();
      } else {
        this.onTrackEnd();
      }
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio playback error:', e);
      this.isPlaying = false;
      this.onStateChange('error');
    });
  }

  initEqualizer() {
    if (this.isEqInitialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      this.audioCtx = new AudioContext();
      this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
      this.gainNode = this.audioCtx.createGain();

      const freqs = [60, 230, 910, 3600, 14000];
      const types = ['lowshelf', 'peaking', 'peaking', 'peaking', 'highshelf'];

      let prevNode = this.sourceNode;
      this.eqNodes = freqs.map((freq, i) => {
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = types[i];
        filter.frequency.value = freq;
        filter.gain.value = 0;
        prevNode.connect(filter);
        prevNode = filter;
        return filter;
      });

      prevNode.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);
      this.isEqInitialized = true;
    } catch (e) {
      console.warn('Web Audio API Equalizer initialization note:', e);
    }
  }

  setEqualizerGains(gains) {
    if (!this.isEqInitialized) this.initEqualizer();
    if (!this.eqNodes.length) return;

    gains.forEach((gain, i) => {
      if (this.eqNodes[i]) {
        this.eqNodes[i].gain.setValueAtTime(gain, this.audioCtx ? this.audioCtx.currentTime : 0);
      }
    });
  }

  applyEqualizerPreset(presetName) {
    const presets = {
      flat: [0, 0, 0, 0, 0],
      bass_boost: [6, 4, 1, 0, 0],
      vocal_boost: [-2, 1, 4, 3, 1],
      rock: [4, 2, -1, 2, 4],
      electronic: [5, 3, 0, 2, 4],
      classical: [3, 2, -1, 2, 3]
    };
    const gains = presets[presetName] || presets.flat;
    this.setEqualizerGains(gains);
    return gains;
  }

  loadTrack(track, autoPlay = true) {
    if (!track) return;
    this.currentTrack = track;
    this.audio.src = track.url;
    this.updateMediaSessionMetadata(track);

    if (autoPlay) {
      this.play();
    }
  }

  async play() {
    if (!this.audio.src && this.currentTrack) {
      this.audio.src = this.currentTrack.url;
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
    try {
      await this.audio.play();
    } catch (err) {
      console.warn('Playback play request prevented by autoplay policy:', err);
    }
  }

  pause() {
    this.audio.pause();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  seek(seconds) {
    if (!isNaN(seconds) && isFinite(seconds)) {
      this.audio.currentTime = Math.max(0, Math.min(seconds, this.audio.duration || seconds));
    }
  }

  setVolume(val) {
    const vol = Math.max(0, Math.min(1, val));
    this.audio.volume = vol;
  }

  getVolume() {
    return this.audio.volume;
  }

  setPlaybackRate(rate) {
    this.audio.playbackRate = rate;
  }

  setShuffle(shuffle) {
    this.isShuffle = shuffle;
    if (shuffle) {
      this.originalQueue = [...this.queue];
      const cur = this.currentTrack;
      const rest = this.queue.filter(t => t.id !== (cur ? cur.id : null));
      // Fisher-Yates shuffle
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }
      this.queue = cur ? [cur, ...rest] : rest;
      this.queueIndex = cur ? 0 : -1;
    } else {
      if (this.originalQueue.length > 0) {
        this.queue = [...this.originalQueue];
        if (this.currentTrack) {
          this.queueIndex = this.queue.findIndex(t => t.id === this.currentTrack.id);
        }
      }
    }
  }

  cycleRepeat() {
    if (this.repeatMode === 'off') this.repeatMode = 'all';
    else if (this.repeatMode === 'all') this.repeatMode = 'one';
    else this.repeatMode = 'off';
    return this.repeatMode;
  }

  setSleepTimer(minutes) {
    if (this.sleepTimerId) {
      clearInterval(this.sleepTimerId);
      this.sleepTimerId = null;
    }
    if (!minutes || minutes <= 0) {
      this.sleepTimerRemaining = 0;
      return;
    }

    this.sleepTimerRemaining = minutes * 60;
    this.sleepTimerId = setInterval(() => {
      this.sleepTimerRemaining--;
      if (this.sleepTimerRemaining <= 0) {
        clearInterval(this.sleepTimerId);
        this.sleepTimerId = null;
        this.pause();
      }
    }, 1000);
  }

  setupMediaSession() {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('play', () => this.play());
    navigator.mediaSession.setActionHandler('pause', () => this.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => this.playPrevious());
    navigator.mediaSession.setActionHandler('nexttrack', () => this.playNext());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        this.seek(details.seekTime);
      }
    });
  }

  updateMediaSessionMetadata(track) {
    if (!('mediaSession' in navigator) || !track) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title || 'Unknown Title',
      artist: track.artist || 'Unknown Artist',
      album: track.album || 'Unknown Album',
      artwork: track.artwork ? [
        { src: track.artwork, sizes: '512x512', type: 'image/jpeg' }
      ] : []
    });
  }

  updateMediaSessionState() {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = this.isPlaying ? 'playing' : 'paused';
  }

  playNext() {
    if (!this.queue.length) return;
    let nextIndex = this.queueIndex + 1;
    if (nextIndex >= this.queue.length) {
      if (this.repeatMode === 'all') {
        nextIndex = 0;
      } else {
        return;
      }
    }
    this.queueIndex = nextIndex;
    this.loadTrack(this.queue[this.queueIndex], true);
  }

  playPrevious() {
    if (this.audio.currentTime > 3) {
      this.seek(0);
      return;
    }
    if (!this.queue.length) return;
    let prevIndex = this.queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = this.repeatMode === 'all' ? this.queue.length - 1 : 0;
    }
    this.queueIndex = prevIndex;
    this.loadTrack(this.queue[this.queueIndex], true);
  }
}
