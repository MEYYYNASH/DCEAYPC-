/**
 * StorageManager - Robust local persistence with IndexedDB and LocalStorage fallback.
 * Manages Tracks, Playlists, Queue, Favorites, History, and Settings.
 */
export class StorageManager {
  constructor() {
    this.dbName = 'dceay_music_db';
    this.dbVersion = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('tracks')) {
          const trackStore = db.createObjectStore('tracks', { keyPath: 'id' });
          trackStore.createIndex('title', 'title', { unique: false });
          trackStore.createIndex('artist', 'artist', { unique: false });
          trackStore.createIndex('album', 'album', { unique: false });
          trackStore.createIndex('dateAdded', 'dateAdded', { unique: false });
        }
        if (!db.objectStoreNames.contains('playlists')) {
          db.createObjectStore('playlists', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('lyrics')) {
          db.createObjectStore('lyrics', { keyPath: 'trackId' });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve();
      };

      request.onerror = (e) => {
        console.error('IndexedDB open error:', e);
        resolve(); // Continue even if IndexedDB fails, using memory/localStorage
      };
    });
  }

  // --- Track Management ---

  async getAllTracks() {
    if (!this.db) return this.getFallback('tracks', []);
    return new Promise((resolve) => {
      const tx = this.db.transaction('tracks', 'readonly');
      const store = tx.objectStore('tracks');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve(this.getFallback('tracks', []));
    });
  }

  async saveTrack(track) {
    if (!this.db) return;
    return new Promise((resolve) => {
      const tx = this.db.transaction('tracks', 'readwrite');
      const store = tx.objectStore('tracks');
      store.put(track);
      tx.oncomplete = () => resolve();
    });
  }

  async deleteTrack(trackId) {
    if (!this.db) return;
    return new Promise((resolve) => {
      const tx = this.db.transaction('tracks', 'readwrite');
      const store = tx.objectStore('tracks');
      store.delete(trackId);
      tx.oncomplete = () => resolve();
    });
  }

  // --- Lyrics Store ---

  async getLyrics(trackId) {
    if (!this.db) return null;
    return new Promise((resolve) => {
      const tx = this.db.transaction('lyrics', 'readonly');
      const store = tx.objectStore('lyrics');
      const req = store.get(trackId);
      req.onsuccess = () => resolve(req.result ? req.result.content : null);
      req.onerror = () => resolve(null);
    });
  }

  async saveLyrics(trackId, content) {
    if (!this.db) return;
    return new Promise((resolve) => {
      const tx = this.db.transaction('lyrics', 'readwrite');
      const store = tx.objectStore('lyrics');
      store.put({ trackId, content, updatedAt: Date.now() });
      tx.oncomplete = () => resolve();
    });
  }

  // --- Playlists ---

  async getPlaylists() {
    if (!this.db) return this.getFallback('playlists', []);
    return new Promise((resolve) => {
      const tx = this.db.transaction('playlists', 'readonly');
      const store = tx.objectStore('playlists');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve(this.getFallback('playlists', []));
    });
  }

  async savePlaylist(playlist) {
    if (!this.db) return;
    return new Promise((resolve) => {
      const tx = this.db.transaction('playlists', 'readwrite');
      const store = tx.objectStore('playlists');
      store.put(playlist);
      tx.oncomplete = () => resolve();
    });
  }

  async deletePlaylist(playlistId) {
    if (!this.db) return;
    return new Promise((resolve) => {
      const tx = this.db.transaction('playlists', 'readwrite');
      const store = tx.objectStore('playlists');
      store.delete(playlistId);
      tx.oncomplete = () => resolve();
    });
  }

  // --- Settings & State (LocalStorage) ---

  getSettings() {
    const defaults = {
      theme: 'theme-dark',
      accentColor: '#00f0ff',
      dynamicArtwork: true,
      reducedMotion: false,
      volume: 0.85,
      playbackSpeed: 1.0,
      lyricsOffset: 0,
      lyricsFontSize: 20,
      equalizerPreset: 'flat',
      eqGains: [0, 0, 0, 0, 0],
      githubOwner: 'DCEAY',
      githubRepo: 'DCEAY-Music-App',
      autoCheckUpdates: true
    };
    try {
      const stored = localStorage.getItem('dceay_settings');
      return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
    } catch {
      return defaults;
    }
  }

  saveSettings(settings) {
    try {
      localStorage.setItem('dceay_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }

  getFavorites() {
    try {
      const f = localStorage.getItem('dceay_favorites');
      return f ? JSON.parse(f) : [];
    } catch {
      return [];
    }
  }

  saveFavorites(favArray) {
    try {
      localStorage.setItem('dceay_favorites', JSON.stringify(favArray));
    } catch (e) {
      console.warn('Failed to save favorites:', e);
    }
  }

  getHistory() {
    try {
      const h = localStorage.getItem('dceay_history');
      return h ? JSON.parse(h) : [];
    } catch {
      return [];
    }
  }

  addToHistory(track) {
    try {
      let history = this.getHistory();
      history = history.filter(t => t.id !== track.id);
      history.unshift({ ...track, playedAt: Date.now() });
      if (history.length > 50) history.pop();
      localStorage.setItem('dceay_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to update history:', e);
    }
  }

  getPlaybackState() {
    try {
      const s = localStorage.getItem('dceay_playback_state');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  }

  savePlaybackState(state) {
    try {
      localStorage.setItem('dceay_playback_state', JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save playback state:', e);
    }
  }

  getQueue() {
    try {
      const q = localStorage.getItem('dceay_queue');
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  }

  saveQueue(queue) {
    try {
      localStorage.setItem('dceay_queue', JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed to save queue:', e);
    }
  }

  getFallback(key, defaultVal) {
    try {
      const val = localStorage.getItem(`dceay_${key}`);
      return val ? JSON.parse(val) : defaultVal;
    } catch {
      return defaultVal;
    }
  }
}
