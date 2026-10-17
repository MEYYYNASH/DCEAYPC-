/**
 * HomeScreen Component - Shows resume playback hero, recently played,
 * favorites, and quick recommendations based on library.
 */
export function renderHomeScreen({ container, tracks, history, favorites, currentTrack, onPlayTrack, onNavigate }) {
  const favoriteTracks = tracks.filter(t => favorites.includes(t.id));
  const recentTracks = history.length > 0 ? history : tracks.slice(0, 5);

  container.innerHTML = `
    <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 2.5rem;">
      <!-- Hero Banner -->
      <div class="glass-card" style="padding: 2.5rem 2rem; border-radius: var(--radius-xl); position: relative; overflow: hidden; display: flex; justify-content: space-between; align-items: center;">
        <div style="position: absolute; right: -50px; top: -50px; width: 300px; height: 300px; border-radius: 50%; background: var(--accent-gradient); opacity: 0.15; filter: blur(60px); pointer-events: none;"></div>
        <div style="max-width: 600px; z-index: 2;">
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--accent-primary); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.5rem;">
            DCEAY Music Player
          </div>
          <h1 class="title-hero" style="margin-bottom: 0.75rem;">Immersive Sound & Synchronized Lyrics</h1>
          <p class="text-sub" style="margin-bottom: 1.5rem; line-height: 1.5;">
            Enjoy high-fidelity music playback with dynamic album art themes, hardware equalizer, and offline library support.
          </p>
          <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
            ${currentTrack ? `
              <button class="btn-primary" id="home-btn-resume">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Resume Playback
              </button>
            ` : ''}
            <button class="btn-ghost" id="home-btn-explore">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Import Music
            </button>
          </div>
        </div>
        <div style="display: flex; gap: 1.5rem; text-align: right;" class="hero-stats">
          <div>
            <div style="font-size: 2rem; font-weight: 800; color: var(--text-main);">${tracks.length}</div>
            <div class="text-meta">Tracks</div>
          </div>
          <div>
            <div style="font-size: 2rem; font-weight: 800; color: var(--accent-primary);">${favorites.length}</div>
            <div class="text-meta">Favorites</div>
          </div>
        </div>
      </div>

      <!-- Recently Played -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <h2 class="title-section">Recently Played</h2>
          <span class="text-meta">${recentTracks.length} tracks</span>
        </div>
        ${recentTracks.length === 0 ? `
          <div class="glass-card" style="padding: 2rem; text-align: center; color: var(--text-muted);">
            No recently played music yet. Play some tracks from your library!
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.25rem;">
            ${recentTracks.slice(0, 6).map(track => `
              <div class="glass-card track-card" data-track-id="${track.id}" style="padding: 1rem; cursor: pointer;">
                <div style="position: relative; width: 100%; aspect-ratio: 1; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 0.75rem;">
                  <img src="${track.artwork || './assets/sample/default_cover.png'}" style="width: 100%; height: 100%; object-fit: cover;" alt="Cover" />
                  <div class="card-play-overlay" style="position: absolute; bottom: 8px; right: 8px;">
                    <div class="btn-play-circle" style="width: 38px; height: 38px;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                  </div>
                </div>
                <div style="font-weight: 600; font-size: 0.92rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-main);">
                  ${escapeHtml(track.title || 'Unknown Title')}
                </div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 0.2rem;">
                  ${escapeHtml(track.artist || 'Unknown Artist')}
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Favorites Section -->
      ${favoriteTracks.length > 0 ? `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <h2 class="title-section" style="display: flex; align-items: center; gap: 0.5rem;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff007f" stroke="#ff007f" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              Favorite Tracks
            </h2>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.35rem;">
            ${favoriteTracks.slice(0, 5).map(track => `
              <div class="track-row" data-track-id="${track.id}">
                <div style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.85rem;">▶</div>
                <img src="${track.artwork || './assets/sample/default_cover.png'}" class="track-cover-thumb" alt="Cover" />
                <div style="min-width: 0;">
                  <div class="track-title">${escapeHtml(track.title)}</div>
                  <div class="track-artist">${escapeHtml(track.artist)}</div>
                </div>
                <div class="track-album text-sub" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(track.album || '-')}</div>
                <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); text-align: right;">${formatTime(track.duration || 0)}</div>
                <div></div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  // Attach event handlers
  const resumeBtn = container.querySelector('#home-btn-resume');
  if (resumeBtn) {
    resumeBtn.onclick = () => onPlayTrack(currentTrack);
  }

  const exploreBtn = container.querySelector('#home-btn-explore');
  if (exploreBtn) {
    exploreBtn.onclick = () => onNavigate('library');
  }

  container.querySelectorAll('[data-track-id]').forEach(el => {
    el.onclick = () => {
      const id = el.getAttribute('data-track-id');
      const track = tracks.find(t => t.id === id) || history.find(t => t.id === id);
      if (track) onPlayTrack(track);
    };
  });
}

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '--:--';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
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
