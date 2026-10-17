import { StorageManager } from './storage-manager.js';
import { AudioEngine } from './audio-engine.js';
import { LyricsEngine } from './lyrics-engine.js';
import { PaletteExtractor } from './palette-extractor.js';
import { UpdateService } from './update-service.js';

import { renderMiniPlayer, updateMiniProgress } from './components/mini-player.js';
import { setupFullPlayer } from './components/full-player.js';
import { setupLyricsView } from './components/lyrics-view.js';
import { setupEqualizerDialog } from './components/equalizer-dialog.js';
import { setupQueueDrawer } from './components/queue-drawer.js';

import { renderHomeScreen } from './components/home-screen.js';
import { setupSearchScreen } from './components/search-screen.js';
import { setupLibraryScreen } from './components/library-screen.js';
import { setupPlaylistsScreen } from './components/playlists-screen.js';
import { setupSettingsScreen } from './components/settings-screen.js';

class DceayMusicApp {
  constructor() {
    this.storage = new StorageManager();
    this.lyricsEngine = new LyricsEngine();
    this.paletteExtractor = new PaletteExtractor();
    this.updateService = new UpdateService('1.0.0');

    this.tracks = [];
    this.playlists = [];
    this.favorites = [];
    this.history = [];
    this.settings = {};

    this.currentScreen = 'home'; // 'home' | 'search' | 'library' | 'playlists' | 'settings'

    this.initAudioEngine();
  }

  initAudioEngine() {
    this.audioEngine = new AudioEngine({
      onTimeUpdate: (currentTime, duration) => this.handleTimeUpdate(currentTime, duration),
      onTrackEnd: () => this.handleTrackEnd(),
      onStateChange: (state) => this.handleStateChange(state)
    });
  }

  async init() {
    await this.storage.init();

    this.settings = this.storage.getSettings();
    this.tracks = await this.storage.getAllTracks();
    this.playlists = await this.storage.getPlaylists();
    this.favorites = this.storage.getFavorites();
    this.history = this.storage.getHistory();

    // Configure update service
    this.updateService.configure(this.settings.githubOwner, this.settings.githubRepo);

    // Apply saved theme
    document.body.className = `${this.settings.theme} ${this.settings.reducedMotion ? 'reduced-motion' : ''}`;

    // Apply audio settings
    this.audioEngine.setVolume(this.settings.volume !== undefined ? this.settings.volume : 0.85);
    this.audioEngine.setPlaybackRate(this.settings.playbackSpeed || 1.0);
    this.lyricsEngine.setOffset(this.settings.lyricsOffset || 0);

    // If tracks are empty, provide a built-in demo track with lyrics so user can immediately test!
    if (this.tracks.length === 0) {
      await this.injectDemoTrack();
    }

    // Set queue from tracks
    this.audioEngine.queue = [...this.tracks];
    this.audioEngine.queueIndex = 0;

    // Restore last playback state if available
    const lastState = this.storage.getPlaybackState();
    if (lastState && lastState.trackId) {
      const found = this.tracks.find(t => t.id === lastState.trackId);
      if (found) {
        this.audioEngine.loadTrack(found, false);
        this.audioEngine.queueIndex = this.tracks.indexOf(found);
        if (lastState.position > 0) {
          setTimeout(() => this.audioEngine.seek(lastState.position), 300);
        }
      }
    } else if (this.tracks.length > 0) {
      this.audioEngine.loadTrack(this.tracks[0], false);
    }

    this.setupUI();
    this.setupKeyboardShortcuts();
    this.setupDragAndDrop();

    // Check updates in background if enabled
    if (this.settings.autoCheckUpdates) {
      setTimeout(() => this.updateService.checkForUpdates(), 3000);
    }
  }

  async injectDemoTrack() {
    // Generate a high quality synthetic demo audio via Web Audio API Wave file blob
    const demoAudioUrl = this.generateSampleToneAudioUrl();
    const demoTrack = {
      id: 'demo_track_01',
      title: 'Neon Horizon (Dotify Inspiration)',
      artist: 'DCEAY Audio Lab',
      album: 'Cyberpunk Odyssey',
      duration: 180,
      url: demoAudioUrl,
      dateAdded: Date.now(),
      artwork: './assets/sample/default_cover.png'
    };

    const demoLrc = `
[ti:Neon Horizon (Dotify Inspiration)]
[ar:DCEAY Audio Lab]
[al:Cyberpunk Odyssey]
[00:00.00]Welcome to DCEAY Music App
[00:04.00]Inspired by the Dotify Desktop Experience
[00:08.50]Glassmorphism and Neon Ambient Illumination
[00:13.20]High fidelity sound and smooth animations
[00:18.00]Synchronized lyrics flow line by line
[00:23.00]Drag the seek bar or adjust audio equalizers
[00:28.40]Add your own MP3, FLAC, and WAV music files
[00:34.00]Cross-platform on Android APK and Windows Desktop
[00:40.00]Enjoy seamless playback anywhere
    `.trim();

    await this.storage.saveTrack(demoTrack);
    await this.storage.saveLyrics(demoTrack.id, demoLrc);
    this.tracks = [demoTrack];
  }

  generateSampleToneAudioUrl() {
    // Generates a valid 44.1kHz stereo WAV audio file in pure JS
    const sampleRate = 44100;
    const durationSeconds = 45;
    const numSamples = sampleRate * durationSeconds;
    const buffer = new ArrayBuffer(44 + numSamples * 2 * 2);
    const view = new DataView(buffer);

    // RIFF identifier
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 4, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 2, true); // 2 channels
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 4, true);
    view.setUint16(32, 4, true);
    view.setUint16(34, 16, true); // 16 bits
    this.writeString(view, 36, 'data');
    view.setUint32(40, numSamples * 4, true);

    // Generate melodious chords (A minor, F, C, G synth progression)
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const beat = Math.floor(t * 2);
      const roots = [220, 174.6, 261.6, 196]; // A3, F3, C4, G3
      const freq = roots[beat % 4];

      // Soft synth tone with bass harmonic
      const val1 = Math.sin(2 * Math.PI * freq * t) * 0.25;
      const val2 = Math.sin(2 * Math.PI * (freq * 1.5) * t) * 0.15;
      const val3 = Math.sin(2 * Math.PI * (freq * 0.5) * t) * 0.3;
      const sample = Math.max(-1, Math.min(1, val1 + val2 + val3));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;

      view.setInt16(offset, intSample, true);
      view.setInt16(offset + 2, intSample, true);
      offset += 4;
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  setupUI() {
    this.dom = {
      contentScrollable: document.getElementById('content-area'),
      miniPlayer: document.getElementById('mini-player-container'),
      fullPlayer: document.getElementById('full-player-overlay'),
      lyricsModal: document.getElementById('lyrics-modal'),
      equalizerModal: document.getElementById('equalizer-modal'),
      queueDrawer: document.getElementById('queue-drawer'),
      navItems: document.querySelectorAll('.nav-item'),
      bottomNavItems: document.querySelectorAll('.bottom-nav-item')
    };

    // Initialize Full Player component
    this.fullPlayerComp = setupFullPlayer({
      container: this.dom.fullPlayer,
      audioEngine: this.audioEngine,
      isFavorite: (id) => this.favorites.includes(id),
      onToggleFavorite: (id) => this.toggleFavorite(id),
      onOpenLyrics: () => this.openLyrics(),
      onOpenEqualizer: () => this.openEqualizer(),
      onOpenQueue: () => this.openQueue()
    });

    // Initialize Lyrics View
    this.lyricsComp = setupLyricsView({
      container: this.dom.lyricsModal,
      lyricsEngine: this.lyricsEngine,
      audioEngine: this.audioEngine,
      onSaveLyrics: (trackId, content) => this.storage.saveLyrics(trackId, content)
    });

    // Initialize Equalizer
    this.equalizerComp = setupEqualizerDialog({
      container: this.dom.equalizerModal,
      audioEngine: this.audioEngine,
      currentPreset: this.settings.equalizerPreset || 'flat',
      currentGains: this.settings.eqGains || [0, 0, 0, 0, 0],
      onSaveEqualizer: (preset, gains) => {
        this.settings.equalizerPreset = preset;
        this.settings.eqGains = gains;
        this.storage.saveSettings(this.settings);
      }
    });

    // Initialize Queue Drawer
    this.queueComp = setupQueueDrawer({
      container: this.dom.queueDrawer,
      audioEngine: this.audioEngine,
      onPlayTrack: (t) => this.playTrack(t),
      onUpdateQueue: (q) => this.storage.saveQueue(q)
    });

    // Navigation setup
    this.dom.navItems.forEach(el => {
      el.onclick = () => {
        const dest = el.getAttribute('data-dest');
        this.navigateTo(dest);
      };
    });
    this.dom.bottomNavItems.forEach(el => {
      el.onclick = () => {
        const dest = el.getAttribute('data-dest');
        this.navigateTo(dest);
      };
    });

    // Render Mini Player
    this.updateMiniPlayer();

    // Render Current Screen
    this.renderCurrentScreen();
  }

  navigateTo(screen) {
    this.currentScreen = screen;
    this.dom.navItems.forEach(el => {
      if (el.getAttribute('data-dest') === screen) el.classList.add('active');
      else el.classList.remove('active');
    });
    this.dom.bottomNavItems.forEach(el => {
      if (el.getAttribute('data-dest') === screen) el.classList.add('active');
      else el.classList.remove('active');
    });
    this.renderCurrentScreen();
  }

  renderCurrentScreen() {
    const container = this.dom.contentScrollable;
    container.innerHTML = '';

    switch (this.currentScreen) {
      case 'home':
        renderHomeScreen({
          container,
          tracks: this.tracks,
          history: this.history,
          favorites: this.favorites,
          currentTrack: this.audioEngine.currentTrack,
          onPlayTrack: (t) => this.playTrack(t),
          onNavigate: (s) => this.navigateTo(s)
        });
        break;
      case 'search':
        setupSearchScreen({
          container,
          tracks: this.tracks,
          onPlayTrack: (t) => this.playTrack(t)
        }).render();
        break;
      case 'library':
        setupLibraryScreen({
          container,
          tracks: this.tracks,
          onPlayTrack: (t) => this.playTrack(t),
          onImportTracks: (newTracks) => this.handleImportTracks(newTracks),
          onDeleteTrack: (id) => this.handleDeleteTrack(id)
        }).render();
        break;
      case 'playlists':
        setupPlaylistsScreen({
          container,
          playlists: this.playlists,
          tracks: this.tracks,
          onPlayTrack: (t) => this.playTrack(t),
          onSavePlaylist: (pl) => this.handleSavePlaylist(pl),
          onDeletePlaylist: (id) => this.handleDeletePlaylist(id)
        }).render();
        break;
      case 'settings':
        setupSettingsScreen({
          container,
          settings: this.settings,
          updateService: this.updateService,
          onSaveSettings: (s) => this.storage.saveSettings(s),
          onClearHistory: () => {
            this.history = [];
            localStorage.removeItem('dceay_history');
          },
          onResetDatabase: async () => {
            indexedDB.deleteDatabase('dceay_music_db');
            localStorage.clear();
            location.reload();
          }
        }).render();
        break;
    }
  }

  async playTrack(track) {
    if (!track) return;
    this.audioEngine.loadTrack(track, true);
    this.storage.addToHistory(track);
    this.history = this.storage.getHistory();

    // Extract dynamic artwork palette
    if (this.settings.dynamicArtwork) {
      this.paletteExtractor.extractAndApply(track.artwork, true);
    }

    // Load lyrics for this track
    const lrcContent = await this.storage.getLyrics(track.id);
    if (lrcContent) {
      this.lyricsEngine.parseLRC(lrcContent);
    } else {
      this.lyricsEngine.lines = [];
    }

    this.updateMiniPlayer();
    this.fullPlayerComp.render(track, true);

    this.storage.savePlaybackState({
      trackId: track.id,
      position: 0,
      timestamp: Date.now()
    });
  }

  updateMiniPlayer() {
    renderMiniPlayer(this.dom.miniPlayer, {
      track: this.audioEngine.currentTrack,
      isPlaying: this.audioEngine.isPlaying,
      onTogglePlay: () => this.audioEngine.togglePlay(),
      onNext: () => this.audioEngine.playNext(),
      onExpand: () => this.openFullPlayer()
    });
  }

  openFullPlayer() {
    this.dom.fullPlayer.classList.add('open');
    this.fullPlayerComp.render(this.audioEngine.currentTrack, this.audioEngine.isPlaying);
  }

  openLyrics() {
    this.dom.lyricsModal.classList.add('open');
    this.lyricsComp.render(this.audioEngine.currentTrack);
  }

  openEqualizer() {
    this.dom.equalizerModal.style.display = 'flex';
    this.equalizerComp.render();
  }

  openQueue() {
    this.dom.queueDrawer.classList.add('open');
    this.queueComp.render();
  }

  toggleFavorite(trackId) {
    if (this.favorites.includes(trackId)) {
      this.favorites = this.favorites.filter(id => id !== trackId);
    } else {
      this.favorites.push(trackId);
    }
    this.storage.saveFavorites(this.favorites);
  }

  handleTimeUpdate(currentTime, duration) {
    updateMiniProgress(this.dom.miniPlayer, currentTime, duration);
    this.fullPlayerComp.updateProgress(currentTime, duration);
    this.lyricsComp.updateActiveTime(currentTime);

    // Save playback position periodically
    if (Math.floor(currentTime) % 5 === 0 && this.audioEngine.currentTrack) {
      this.storage.savePlaybackState({
        trackId: this.audioEngine.currentTrack.id,
        position: currentTime,
        timestamp: Date.now()
      });
    }
  }

  handleTrackEnd() {
    this.audioEngine.playNext();
  }

  handleStateChange(state) {
    this.updateMiniPlayer();
    if (this.audioEngine.currentTrack) {
      this.fullPlayerComp.render(this.audioEngine.currentTrack, state === 'playing');
    }
  }

  async handleImportTracks(newTracks) {
    for (const t of newTracks) {
      await this.storage.saveTrack(t);
    }
    this.tracks = await this.storage.getAllTracks();
    this.audioEngine.queue = [...this.tracks];
    this.renderCurrentScreen();
  }

  async handleDeleteTrack(id) {
    await this.storage.deleteTrack(id);
    this.tracks = this.tracks.filter(t => t.id !== id);
    this.audioEngine.queue = this.audioEngine.queue.filter(t => t.id !== id);
    if (this.audioEngine.currentTrack && this.audioEngine.currentTrack.id === id) {
      this.audioEngine.playNext();
    }
    this.renderCurrentScreen();
  }

  async handleSavePlaylist(playlist) {
    await this.storage.savePlaylist(playlist);
    this.playlists = await this.storage.getPlaylists();
  }

  async handleDeletePlaylist(id) {
    await this.storage.deletePlaylist(id);
    this.playlists = await this.storage.getPlaylists();
  }

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          this.audioEngine.togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.audioEngine.seek(this.audioEngine.audio.currentTime + 5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.audioEngine.seek(this.audioEngine.audio.currentTime - 5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.audioEngine.setVolume(Math.min(1, this.audioEngine.getVolume() + 0.05));
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.audioEngine.setVolume(Math.max(0, this.audioEngine.getVolume() - 0.05));
          break;
        case 'KeyN':
          this.audioEngine.playNext();
          break;
        case 'KeyP':
          this.audioEngine.playPrevious();
          break;
        case 'KeyL':
          if (this.dom.lyricsModal.classList.contains('open')) {
            this.dom.lyricsModal.classList.remove('open');
          } else {
            this.openLyrics();
          }
          break;
        case 'KeyF':
          if (this.dom.fullPlayer.classList.contains('open')) {
            this.dom.fullPlayer.classList.remove('open');
          } else {
            this.openFullPlayer();
          }
          break;
      }
    });
  }

  setupDragAndDrop() {
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', async (e) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files) {
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('audio/') || f.name.match(/\.(mp3|flac|wav|m4a|aac|ogg)$/i));
        if (files.length > 0) {
          const newTracks = files.map(f => ({
            id: 'track_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            title: f.name.replace(/\.[^/.]+$/, ''),
            artist: 'Local Drop',
            album: 'Imported',
            duration: 0,
            url: URL.createObjectURL(f),
            dateAdded: Date.now(),
            artwork: './assets/sample/default_cover.png'
          }));
          await this.handleImportTracks(newTracks);
          alert(`Imported ${newTracks.length} tracks.`);
        }
      }
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new DceayMusicApp();
  app.init().catch(err => console.error('App initialization failed:', err));
  window.dceayApp = app;
});
