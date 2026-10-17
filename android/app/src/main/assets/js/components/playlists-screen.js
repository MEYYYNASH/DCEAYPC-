/**
 * PlaylistsScreen Component - Custom user playlists with drag-and-drop reordering,
 * JSON export/import, and track management.
 */
export function setupPlaylistsScreen({ container, playlists, tracks, onPlayTrack, onSavePlaylist, onDeletePlaylist }) {
  let selectedPlaylist = null;

  function render() {
    container.innerHTML = `
      <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 class="title-section" style="font-size: 1.75rem;">Playlists</h1>
            <div class="text-meta" style="margin-top: 0.25rem;">${playlists.length} custom playlists</div>
          </div>

          <div style="display: flex; gap: 0.75rem;">
            <button class="btn-primary" id="pl-btn-create" style="font-size: 0.88rem;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Playlist
            </button>
            <label class="btn-ghost" style="cursor: pointer; font-size: 0.88rem;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Import JSON
              <input type="file" id="pl-import-input" accept=".json" style="display: none;" />
            </label>
          </div>
        </div>

        ${selectedPlaylist ? renderPlaylistDetail() : renderPlaylistGrid()}
      </div>
    `;

    setupHandlers();
  }

  function renderPlaylistGrid() {
    if (playlists.length === 0) {
      return `
        <div class="glass-card" style="padding: 4rem 2rem; text-align: center; border-radius: var(--radius-lg);">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1.25rem; color: var(--accent-primary); opacity: 0.8;">
            <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
          </svg>
          <div style="font-size: 1.3rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-main);">No Playlists Created</div>
          <div style="color: var(--text-secondary); max-width: 450px; margin: 0 auto 1.5rem auto; line-height: 1.5; font-size: 0.92rem;">
            Group your favorite songs, create listening queues, and organize your music library.
          </div>
          <button class="btn-primary" id="pl-empty-btn-create">Create Your First Playlist</button>
        </div>
      `;
    }

    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.5rem;">
        ${playlists.map(pl => `
          <div class="glass-card pl-card" data-id="${pl.id}" style="padding: 1.25rem; cursor: pointer;">
            <div style="width: 100%; aspect-ratio: 1; border-radius: var(--radius-md); overflow: hidden; background: linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(255, 0, 127, 0.2)); display: flex; align-items: center; justify-content: center; margin-bottom: 0.75rem; border: 1px solid var(--border-glass);">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--accent-primary);"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            </div>
            <div style="font-weight: 700; font-size: 1.05rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${escapeHtml(pl.name)}
            </div>
            <div class="text-meta" style="margin-top: 0.25rem;">
              ${(pl.trackIds || []).length} songs
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderPlaylistDetail() {
    const pl = selectedPlaylist;
    const plTracks = (pl.trackIds || []).map(id => tracks.find(t => t.id === id)).filter(Boolean);

    return `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div style="display: flex; align-items: center; gap: 1.25rem;">
          <button class="btn-icon" id="pl-btn-back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style="flex: 1;">
            <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--text-main);">${escapeHtml(pl.name)}</h2>
            <div class="text-sub">${plTracks.length} tracks • Created ${new Date(pl.createdAt || Date.now()).toLocaleDateString()}</div>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn-ghost" id="pl-btn-export" style="font-size: 0.8rem;">Export JSON</button>
            <button class="btn-ghost" id="pl-btn-delete" style="font-size: 0.8rem; color: #ff4757; border-color: rgba(255, 71, 87, 0.3);">Delete</button>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.35rem;">
          ${plTracks.length === 0 ? `
            <div class="glass-card" style="padding: 3rem; text-align: center; color: var(--text-muted);">
              This playlist has no songs yet. Add songs from your Library!
            </div>
          ` : plTracks.map((track, i) => `
            <div class="track-row" data-id="${track.id}">
              <div style="color: var(--text-muted); font-size: 0.85rem; font-family: var(--font-mono);">${i + 1}</div>
              <img src="${track.artwork || './assets/sample/default_cover.png'}" class="track-cover-thumb" alt="Cover" />
              <div style="min-width: 0;">
                <div class="track-title">${escapeHtml(track.title || 'Unknown Title')}</div>
                <div class="track-artist">${escapeHtml(track.artist || 'Unknown Artist')}</div>
              </div>
              <div class="track-album text-sub">${escapeHtml(track.album || '-')}</div>
              <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); text-align: right;">${formatTime(track.duration || 0)}</div>
              <button class="btn-icon pl-track-remove" data-id="${track.id}" title="Remove from playlist">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function setupHandlers() {
    const createBtn = container.querySelector('#pl-btn-create') || container.querySelector('#pl-empty-btn-create');
    if (createBtn) {
      createBtn.onclick = () => {
        const name = prompt('Enter playlist name:', 'My Favorite Vibes');
        if (name && name.trim()) {
          const newPl = {
            id: 'pl_' + Date.now(),
            name: name.trim(),
            trackIds: [],
            createdAt: Date.now()
          };
          onSavePlaylist(newPl);
          selectedPlaylist = newPl;
          render();
        }
      };
    }

    container.querySelectorAll('.pl-card').forEach(card => {
      card.onclick = () => {
        const id = card.getAttribute('data-id');
        selectedPlaylist = playlists.find(p => p.id === id);
        render();
      };
    });

    const backBtn = container.querySelector('#pl-btn-back');
    if (backBtn) {
      backBtn.onclick = () => {
        selectedPlaylist = null;
        render();
      };
    }

    const delBtn = container.querySelector('#pl-btn-delete');
    if (delBtn && selectedPlaylist) {
      delBtn.onclick = () => {
        if (confirm(`Delete playlist "${selectedPlaylist.name}"?`)) {
          onDeletePlaylist(selectedPlaylist.id);
          selectedPlaylist = null;
          render();
        }
      };
    }

    const exportBtn = container.querySelector('#pl-btn-export');
    if (exportBtn && selectedPlaylist) {
      exportBtn.onclick = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedPlaylist, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", `${selectedPlaylist.name.replace(/\s+/g, '_')}_playlist.json`);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();
      };
    }

    const importInput = container.querySelector('#pl-import-input');
    if (importInput) {
      importInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (re) => {
            try {
              const imported = JSON.parse(re.target.result);
              if (imported.name) {
                imported.id = 'pl_' + Date.now();
                onSavePlaylist(imported);
                selectedPlaylist = imported;
                render();
              }
            } catch (err) {
              alert('Invalid playlist JSON file: ' + err.message);
            }
          };
          reader.readAsText(file);
        }
      };
    }

    container.querySelectorAll('.pl-track-remove').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (selectedPlaylist) {
          selectedPlaylist.trackIds = (selectedPlaylist.trackIds || []).filter(tid => tid !== id);
          onSavePlaylist(selectedPlaylist);
          render();
        }
      };
    });

    container.querySelectorAll('.track-row').forEach(row => {
      row.onclick = (e) => {
        if (e.target.closest('.pl-track-remove')) return;
        const id = row.getAttribute('data-id');
        const track = tracks.find(t => t.id === id);
        if (track) onPlayTrack(track);
      };
    });
  }

  return { render };
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
