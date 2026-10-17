/**
 * FullPlayer Component - Immersive Now Playing screen with album art animation,
 * interactive scrubber, transport controls, and modal launchers.
 */
export function setupFullPlayer({
  container,
  audioEngine,
  isFavorite,
  onToggleFavorite,
  onOpenLyrics,
  onOpenEqualizer,
  onOpenQueue
}) {
  let isDraggingScrubber = false;

  function render(track, isPlaying) {
    if (!track) return;

    const repeatIcons = {
      off: getRepeatIcon(false, 20),
      all: getRepeatIcon(true, 20),
      one: getRepeatOneIcon(20)
    };

    container.innerHTML = `
      <div class="full-player-ambient-blur"></div>
      
      <div class="full-player-header">
        <button class="btn-icon" id="fp-btn-close" aria-label="Close Player">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div style="font-weight: 700; font-size: 0.9rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-secondary);">
          Now Playing
        </div>
        <button class="btn-icon" id="fp-btn-queue" aria-label="Queue">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        </button>
      </div>

      <div class="full-player-body">
        <div class="full-artwork-container">
          <img src="${track.artwork || './assets/sample/default_cover.png'}" 
               class="full-artwork ${isPlaying ? 'spinning-vinyl' : 'spinning-vinyl paused'}" 
               id="fp-artwork" alt="Album Art" />
        </div>

        <div class="full-track-panel">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
            <div>
              <div class="full-track-title">${escapeHtml(track.title || 'Unknown Title')}</div>
              <div class="full-track-artist">${escapeHtml(track.artist || 'Unknown Artist')}</div>
              <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">${escapeHtml(track.album || '')}</div>
            </div>
            <button class="btn-icon" id="fp-btn-fav" aria-label="Favorite">
              ${isFavorite(track.id) ? getHeartIcon(true, 24) : getHeartIcon(false, 24)}
            </button>
          </div>

          <div class="scrubber-container">
            <input type="range" class="scrubber-slider" id="fp-scrubber" min="0" max="100" value="0" />
            <div class="scrubber-times">
              <span id="fp-current-time">0:00</span>
              <span id="fp-total-time">0:00</span>
            </div>
          </div>

          <div class="full-player-controls">
            <button class="btn-icon ${audioEngine.isShuffle ? 'active' : ''}" id="fp-btn-shuffle" style="${audioEngine.isShuffle ? 'color: var(--accent-primary)' : ''}">
              ${getShuffleIcon(20)}
            </button>
            <button class="btn-icon" id="fp-btn-prev">
              ${getPrevIcon(24)}
            </button>
            <button class="btn-play-circle" id="fp-btn-play" style="width: 58px; height: 58px;">
              ${isPlaying ? getPauseIcon(26) : getPlayIcon(26)}
            </button>
            <button class="btn-icon" id="fp-btn-next">
              ${getNextIcon(24)}
            </button>
            <button class="btn-icon" id="fp-btn-repeat" style="${audioEngine.repeatMode !== 'off' ? 'color: var(--accent-primary)' : ''}">
              ${repeatIcons[audioEngine.repeatMode]}
            </button>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--border-glass);">
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn-ghost" id="fp-btn-lyrics" style="font-size: 0.82rem; padding: 0.4rem 0.85rem;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                Lyrics
              </button>
              <button class="btn-ghost" id="fp-btn-eq" style="font-size: 0.82rem; padding: 0.4rem 0.85rem;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/></svg>
                EQ
              </button>
            </div>
            
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-secondary);"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              <input type="range" id="fp-volume" min="0" max="1" step="0.01" value="${audioEngine.getVolume()}" style="width: 80px;" />
            </div>
          </div>
        </div>
      </div>
    `;

    // Attach listeners
    container.querySelector('#fp-btn-close').onclick = () => container.classList.remove('open');
    container.querySelector('#fp-btn-play').onclick = () => audioEngine.togglePlay();
    container.querySelector('#fp-btn-next').onclick = () => audioEngine.playNext();
    container.querySelector('#fp-btn-prev').onclick = () => audioEngine.playPrevious();
    
    container.querySelector('#fp-btn-shuffle').onclick = () => {
      audioEngine.setShuffle(!audioEngine.isShuffle);
      render(audioEngine.currentTrack, audioEngine.isPlaying);
    };

    container.querySelector('#fp-btn-repeat').onclick = () => {
      audioEngine.cycleRepeat();
      render(audioEngine.currentTrack, audioEngine.isPlaying);
    };

    container.querySelector('#fp-btn-fav').onclick = () => {
      onToggleFavorite(track.id);
      render(track, audioEngine.isPlaying);
    };

    container.querySelector('#fp-btn-lyrics').onclick = () => onOpenLyrics();
    container.querySelector('#fp-btn-eq').onclick = () => onOpenEqualizer();
    container.querySelector('#fp-btn-queue').onclick = () => onOpenQueue();

    const scrubber = container.querySelector('#fp-scrubber');
    scrubber.oninput = () => {
      isDraggingScrubber = true;
      const targetTime = (scrubber.value / 100) * (audioEngine.audio.duration || 0);
      container.querySelector('#fp-current-time').textContent = formatTime(targetTime);
    };
    scrubber.onchange = () => {
      const targetTime = (scrubber.value / 100) * (audioEngine.audio.duration || 0);
      audioEngine.seek(targetTime);
      isDraggingScrubber = false;
    };

    container.querySelector('#fp-volume').oninput = (e) => {
      audioEngine.setVolume(parseFloat(e.target.value));
    };
  }

  function updateProgress(currentTime, duration) {
    if (isDraggingScrubber) return;
    const scrubber = container.querySelector('#fp-scrubber');
    const curLabel = container.querySelector('#fp-current-time');
    const totalLabel = container.querySelector('#fp-total-time');

    if (scrubber && duration > 0) {
      scrubber.value = (currentTime / duration) * 100;
      if (curLabel) curLabel.textContent = formatTime(currentTime);
      if (totalLabel) totalLabel.textContent = formatTime(duration);
    }
  }

  return { render, updateProgress };
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

function getPlayIcon(size = 24) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
}

function getPauseIcon(size = 24) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
}

function getNextIcon(size = 24) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>`;
}

function getPrevIcon(size = 24) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>`;
}

function getShuffleIcon(size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>`;
}

function getRepeatIcon(active, size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`;
}

function getRepeatOneIcon(size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/><text x="11" y="15" font-size="8" font-family="sans-serif" font-weight="bold" fill="currentColor" stroke="none">1</text></svg>`;
}

function getHeartIcon(filled, size = 24) {
  if (filled) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="#ff007f" stroke="#ff007f" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
}
