/**
 * LibraryScreen Component - Music library manager with local audio import,
 * metadata extraction, sorting, filtering, and multi-select actions.
 */
export function setupLibraryScreen({ container, tracks, onPlayTrack, onImportTracks, onDeleteTrack }) {
  let activeTab = 'tracks'; // 'tracks' | 'artists' | 'albums'
  let sortBy = 'title'; // 'title' | 'artist' | 'album' | 'dateAdded' | 'duration'
  let sortAsc = true;
  let selectedTrackIds = new Set();

  function render() {
    container.innerHTML = `
      <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem;">
        <!-- Header & Action Buttons -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 class="title-section" style="font-size: 1.75rem;">Music Library</h1>
            <div class="text-meta" style="margin-top: 0.25rem;">${tracks.length} tracks imported</div>
          </div>

          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <label class="btn-primary" style="cursor: pointer; font-size: 0.88rem;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Import Files
              <input type="file" id="lib-file-input" multiple accept="audio/*,.mp3,.flac,.wav,.aac,.m4a,.ogg" style="display: none;" />
            </label>
            <label class="btn-ghost" style="cursor: pointer; font-size: 0.88rem;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              Scan Folder
              <input type="file" id="lib-folder-input" webkitdirectory directory multiple style="display: none;" />
            </label>
          </div>
        </div>

        <!-- Tabs and Sorting Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-glass); padding-bottom: 0.75rem; flex-wrap: wrap; gap: 0.75rem;">
          <div style="display: flex; gap: 0.5rem;">
            ${[
              { id: 'tracks', label: 'All Tracks' },
              { id: 'artists', label: 'Artists' },
              { id: 'albums', label: 'Albums' }
            ].map(tab => `
              <button class="filter-pill ${activeTab === tab.id ? 'active' : ''}" data-tab="${tab.id}">
                ${tab.label}
              </button>
            `).join('')}
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">
            <span>Sort by:</span>
            <select id="lib-sort-select" style="background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); padding: 0.35rem 0.6rem; outline: none;">
              <option value="title" ${sortBy === 'title' ? 'selected' : ''}>Title</option>
              <option value="artist" ${sortBy === 'artist' ? 'selected' : ''}>Artist</option>
              <option value="album" ${sortBy === 'album' ? 'selected' : ''}>Album</option>
              <option value="duration" ${sortBy === 'duration' ? 'selected' : ''}>Duration</option>
              <option value="dateAdded" ${sortBy === 'dateAdded' ? 'selected' : ''}>Date Added</option>
            </select>
            <button class="btn-icon" id="lib-btn-sort-dir" title="Toggle Sort Direction">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="${sortAsc ? '18 15 12 9 6 15' : '6 9 12 15 18 9'}"/></svg>
            </button>
          </div>
        </div>

        <!-- Multi-select Action Bar -->
        <div id="lib-multi-bar" style="display: ${selectedTrackIds.size > 0 ? 'flex' : 'none'}; justify-content: space-between; align-items: center; background: var(--bg-card-hover); border: 1px solid var(--border-focus); border-radius: var(--radius-md); padding: 0.65rem 1.25rem;">
          <span style="font-weight: 600; font-size: 0.9rem; color: var(--accent-primary);">${selectedTrackIds.size} selected</span>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn-ghost" id="lib-btn-select-all" style="padding: 0.3rem 0.75rem; font-size: 0.8rem;">Select All</button>
            <button class="btn-ghost" id="lib-btn-clear-selection" style="padding: 0.3rem 0.75rem; font-size: 0.8rem;">Deselect</button>
            <button class="btn-ghost" id="lib-btn-delete-selected" style="padding: 0.3rem 0.75rem; font-size: 0.8rem; color: #ff4757; border-color: rgba(255, 71, 87, 0.3);">Remove</button>
          </div>
        </div>

        <!-- Content Area -->
        <div id="lib-content-view"></div>
      </div>
    `;

    // Listeners
    setupFileHandlers();

    container.querySelectorAll('.filter-pill[data-tab]').forEach(btn => {
      btn.onclick = () => {
        activeTab = btn.getAttribute('data-tab');
        render();
      };
    });

    const sortSelect = container.querySelector('#lib-sort-select');
    if (sortSelect) {
      sortSelect.onchange = (e) => {
        sortBy = e.target.value;
        renderContentView();
      };
    }

    const sortDirBtn = container.querySelector('#lib-btn-sort-dir');
    if (sortDirBtn) {
      sortDirBtn.onclick = () => {
        sortAsc = !sortAsc;
        render();
      };
    }

    renderContentView();
  }

  function renderContentView() {
    const view = container.querySelector('#lib-content-view');
    if (!view) return;

    if (tracks.length === 0) {
      view.innerHTML = `
        <div class="glass-card" style="padding: 4rem 2rem; text-align: center; border-radius: var(--radius-lg);">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1.25rem; color: var(--accent-primary); opacity: 0.8;">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
          <div style="font-size: 1.3rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-main);">Your Library is Empty</div>
          <div style="color: var(--text-secondary); max-width: 450px; margin: 0 auto 1.75rem auto; line-height: 1.5; font-size: 0.92rem;">
            Import your local MP3, FLAC, WAV, AAC, M4A, or OGG music files to start playing with synchronized lyrics and dynamic artwork.
          </div>
          <label class="btn-primary" style="cursor: pointer;">
            Choose Audio Files
            <input type="file" id="lib-empty-file-input" multiple accept="audio/*" style="display: none;" />
          </label>
        </div>
      `;
      const emptyInput = view.querySelector('#lib-empty-file-input');
      if (emptyInput) {
        emptyInput.onchange = (e) => processFiles(e.target.files);
      }
      return;
    }

    // Sort tracks
    const sortedTracks = [...tracks].sort((a, b) => {
      let va = a[sortBy] || '';
      let vb = b[sortBy] || '';
      if (typeof va === 'string') {
        const cmp = va.localeCompare(vb);
        return sortAsc ? cmp : -cmp;
      }
      return sortAsc ? (va - vb) : (vb - va);
    });

    if (activeTab === 'tracks') {
      view.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 0.35rem;">
          ${sortedTracks.map((track, i) => `
            <div class="track-row" data-id="${track.id}" style="${selectedTrackIds.has(track.id) ? 'background: var(--bg-card-hover); border-color: var(--border-focus);' : ''}">
              <input type="checkbox" class="track-checkbox" data-id="${track.id}" ${selectedTrackIds.has(track.id) ? 'checked' : ''} style="cursor: pointer;" />
              <img src="${track.artwork || './assets/sample/default_cover.png'}" class="track-cover-thumb" alt="Cover" />
              <div style="min-width: 0;">
                <div class="track-title">${escapeHtml(track.title || 'Unknown Title')}</div>
                <div class="track-artist">${escapeHtml(track.artist || 'Unknown Artist')}</div>
              </div>
              <div class="track-album text-sub" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${escapeHtml(track.album || '-')}
              </div>
              <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); text-align: right;">
                ${formatTime(track.duration || 0)}
              </div>
              <button class="btn-icon track-delete" data-id="${track.id}" title="Remove track">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          `).join('')}
        </div>
      `;

      view.querySelectorAll('.track-row').forEach(row => {
        row.onclick = (e) => {
          if (e.target.closest('.track-checkbox') || e.target.closest('.track-delete')) return;
          const id = row.getAttribute('data-id');
          const track = tracks.find(t => t.id === id);
          if (track) onPlayTrack(track);
        };
      });

      view.querySelectorAll('.track-checkbox').forEach(cb => {
        cb.onchange = (e) => {
          const id = cb.getAttribute('data-id');
          if (e.target.checked) selectedTrackIds.add(id);
          else selectedTrackIds.delete(id);
          updateMultiBar();
        };
      });

      view.querySelectorAll('.track-delete').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          if (confirm('Remove this track from your library?')) {
            onDeleteTrack(id);
          }
        };
      });
    } else if (activeTab === 'artists') {
      const artistMap = new Map();
      tracks.forEach(t => {
        const ar = t.artist || 'Unknown Artist';
        if (!artistMap.has(ar)) artistMap.set(ar, []);
        artistMap.get(ar).push(t);
      });

      view.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.25rem;">
          ${Array.from(artistMap.entries()).map(([artist, artistTracks]) => `
            <div class="glass-card" style="padding: 1.25rem; text-align: center; cursor: pointer;">
              <div style="width: 100px; height: 100px; border-radius: 50%; margin: 0 auto 1rem auto; overflow: hidden; background: #1a1d29; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                <img src="${artistTracks[0].artwork || './assets/sample/default_cover.png'}" style="width: 100%; height: 100%; object-fit: cover;" alt="Artist" />
              </div>
              <div style="font-weight: 700; font-size: 1rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${escapeHtml(artist)}
              </div>
              <div class="text-meta" style="margin-top: 0.25rem;">${artistTracks.length} tracks</div>
            </div>
          `).join('')}
        </div>
      `;
    } else if (activeTab === 'albums') {
      const albumMap = new Map();
      tracks.forEach(t => {
        const al = t.album || 'Unknown Album';
        if (!albumMap.has(al)) albumMap.set(al, []);
        albumMap.get(al).push(t);
      });

      view.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.25rem;">
          ${Array.from(albumMap.entries()).map(([album, albumTracks]) => `
            <div class="glass-card" style="padding: 1rem; cursor: pointer;">
              <div style="width: 100%; aspect-ratio: 1; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 0.75rem;">
                <img src="${albumTracks[0].artwork || './assets/sample/default_cover.png'}" style="width: 100%; height: 100%; object-fit: cover;" alt="Album" />
              </div>
              <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${escapeHtml(album)}
              </div>
              <div class="text-meta" style="margin-top: 0.2rem;">${albumTracks[0].artist} • ${albumTracks.length} tracks</div>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  function updateMultiBar() {
    const bar = container.querySelector('#lib-multi-bar');
    if (!bar) return;
    if (selectedTrackIds.size > 0) {
      bar.style.display = 'flex';
      bar.querySelector('span').textContent = `${selectedTrackIds.size} selected`;
    } else {
      bar.style.display = 'none';
    }
  }

  function setupFileHandlers() {
    const fileInput = container.querySelector('#lib-file-input');
    const folderInput = container.querySelector('#lib-folder-input');

    if (fileInput) fileInput.onchange = (e) => processFiles(e.target.files);
    if (folderInput) folderInput.onchange = (e) => processFiles(e.target.files);

    const selectAllBtn = container.querySelector('#lib-btn-select-all');
    if (selectAllBtn) {
      selectAllBtn.onclick = () => {
        tracks.forEach(t => selectedTrackIds.add(t.id));
        renderContentView();
        updateMultiBar();
      };
    }

    const clearSelBtn = container.querySelector('#lib-btn-clear-selection');
    if (clearSelBtn) {
      clearSelBtn.onclick = () => {
        selectedTrackIds.clear();
        renderContentView();
        updateMultiBar();
      };
    }

    const deleteSelBtn = container.querySelector('#lib-btn-delete-selected');
    if (deleteSelBtn) {
      deleteSelBtn.onclick = () => {
        if (confirm(`Remove ${selectedTrackIds.size} tracks from your library?`)) {
          selectedTrackIds.forEach(id => onDeleteTrack(id));
          selectedTrackIds.clear();
        }
      };
    }
  }

  async function processFiles(fileList) {
    if (!fileList || !fileList.length) return;
    const newTracks = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|flac|wav|m4a|aac|ogg)$/i)) continue;

      const track = parseFileInfo(file);
      newTracks.push(track);
    }

    if (newTracks.length > 0) {
      await onImportTracks(newTracks);
    }
  }

  function parseFileInfo(file) {
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    let artist = 'Unknown Artist';
    let title = cleanName;

    // Check if filename is "Artist - Title"
    if (cleanName.includes(' - ')) {
      const parts = cleanName.split(' - ');
      artist = parts[0].trim();
      title = parts.slice(1).join(' - ').trim();
    }

    return {
      id: 'track_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      title: title,
      artist: artist,
      album: 'Imported Media',
      duration: 0,
      url: URL.createObjectURL(file),
      dateAdded: Date.now(),
      artwork: generateProceduralArtwork(title, artist)
    };
  }

  return { render };
}

function generateProceduralArtwork(title, artist) {
  // Generates a beautiful SVG data URI as fallback album cover
  const colors = [
    ['#00f0ff', '#ff007f'],
    ['#8b5cf6', '#06b6d4'],
    ['#10b981', '#3b82f6'],
    ['#f59e0b', '#ef4444'],
    ['#ec4899', '#8b5cf6']
  ];
  const charCode = (title + artist).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const pair = colors[charCode % colors.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${pair[0]}"/>
        <stop offset="100%" stop-color="${pair[1]}"/>
      </linearGradient>
    </defs>
    <rect width="300" height="300" fill="#0d0e17"/>
    <circle cx="150" cy="150" r="100" fill="url(#g)" opacity="0.85"/>
    <circle cx="150" cy="150" r="40" fill="#0d0e17"/>
    <circle cx="150" cy="150" r="15" fill="${pair[0]}"/>
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
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
