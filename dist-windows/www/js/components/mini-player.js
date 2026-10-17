/**
 * MiniPlayer Component
 */
export function renderMiniPlayer(container, { track, isPlaying, onTogglePlay, onNext, onExpand }) {
  if (!track) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'flex';
  container.innerHTML = `
    <div class="mini-progress-bar" id="mini-progress" style="width: 0%;"></div>
    <img src="${track.artwork || './assets/sample/default_cover.png'}" class="mini-artwork" alt="Cover" />
    <div class="mini-info">
      <div class="mini-title">${escapeHtml(track.title || 'Unknown Title')}</div>
      <div class="mini-artist">${escapeHtml(track.artist || 'Unknown Artist')}</div>
    </div>
    <div class="mini-controls" onclick="event.stopPropagation()">
      <button class="btn-play-circle" id="mini-btn-play" aria-label="Play or Pause">
        ${isPlaying ? getPauseIcon(18) : getPlayIcon(18)}
      </button>
      <button class="btn-icon" id="mini-btn-next" aria-label="Next Track">
        ${getNextIcon(20)}
      </button>
    </div>
  `;

  container.onclick = () => onExpand();
  container.querySelector('#mini-btn-play').onclick = (e) => {
    e.stopPropagation();
    onTogglePlay();
  };
  container.querySelector('#mini-btn-next').onclick = (e) => {
    e.stopPropagation();
    onNext();
  };
}

export function updateMiniProgress(container, currentTime, duration) {
  const bar = container.querySelector('#mini-progress');
  if (bar && duration > 0) {
    const pct = (currentTime / duration) * 100;
    bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  }
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

function getPlayIcon(size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
}

function getPauseIcon(size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
}

function getNextIcon(size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>`;
}
