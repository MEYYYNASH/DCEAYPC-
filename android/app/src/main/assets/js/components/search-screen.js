/**
 * SearchScreen Component - Instant search with filtering across tracks,
 * artists, albums, genres, and recent search history.
 */
export function setupSearchScreen({ container, tracks, onPlayTrack }) {
  let activeFilter = 'all'; // 'all' | 'songs' | 'artists' | 'albums'
  let currentQuery = '';
  let searchHistory = getSearchHistory();

  function render() {
    container.innerHTML = `
      <div style="max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column;">
        <div class="search-input-wrapper">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-muted);"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" class="search-input" id="search-field" placeholder="Search songs, artists, albums, or lyrics..." value="${escapeHtml(currentQuery)}" autofocus />
          ${currentQuery ? `
            <button class="btn-icon" id="search-btn-clear" style="padding: 0.2rem;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          ` : ''}
        </div>

        <!-- Filter Pills -->
        <div class="filter-pills">
          ${[
            { id: 'all', label: 'All' },
            { id: 'songs', label: 'Songs' },
            { id: 'artists', label: 'Artists' },
            { id: 'albums', label: 'Albums' }
          ].map(f => `
            <button class="filter-pill ${activeFilter === f.id ? 'active' : ''}" data-filter="${f.id}">
              ${f.label}
            </button>
          `).join('')}
        </div>

        <!-- Recent Searches Chips (if no query) -->
        ${!currentQuery && searchHistory.length > 0 ? `
          <div style="margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <span class="text-meta" style="text-transform: uppercase; letter-spacing: 0.05em;">Recent Searches</span>
              <button class="btn-ghost" id="search-clear-history" style="font-size: 0.75rem; padding: 0.2rem 0.6rem;">Clear</button>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              ${searchHistory.map(term => `
                <button class="filter-pill search-history-chip" data-term="${escapeHtml(term)}">
                  ${escapeHtml(term)}
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Results List -->
        <div id="search-results-list" style="display: flex; flex-direction: column; gap: 0.35rem;"></div>
      </div>
    `;

    const input = container.querySelector('#search-field');
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);

    input.oninput = (e) => {
      currentQuery = e.target.value;
      if (currentQuery.trim()) {
        saveSearchHistory(currentQuery.trim());
      }
      renderResults();
    };

    const clearBtn = container.querySelector('#search-btn-clear');
    if (clearBtn) {
      clearBtn.onclick = () => {
        currentQuery = '';
        render();
      };
    }

    container.querySelectorAll('.filter-pill[data-filter]').forEach(pill => {
      pill.onclick = () => {
        activeFilter = pill.getAttribute('data-filter');
        container.querySelectorAll('.filter-pill[data-filter]').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        renderResults();
      };
    });

    container.querySelectorAll('.search-history-chip').forEach(chip => {
      chip.onclick = () => {
        currentQuery = chip.getAttribute('data-term');
        input.value = currentQuery;
        renderResults();
      };
    });

    const clearHistBtn = container.querySelector('#search-clear-history');
    if (clearHistBtn) {
      clearHistBtn.onclick = () => {
        localStorage.removeItem('dceay_search_history');
        searchHistory = [];
        render();
      };
    }

    renderResults();
  }

  function renderResults() {
    const resultsContainer = container.querySelector('#search-results-list');
    if (!resultsContainer) return;

    const q = currentQuery.trim().toLowerCase();
    if (!q) {
      resultsContainer.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
          Type a song title, artist, or album name to search your music library.
        </div>
      `;
      return;
    }

    let filtered = tracks.filter(t => {
      const matchTitle = (t.title || '').toLowerCase().includes(q);
      const matchArtist = (t.artist || '').toLowerCase().includes(q);
      const matchAlbum = (t.album || '').toLowerCase().includes(q);
      const matchGenre = (t.genre || '').toLowerCase().includes(q);

      if (activeFilter === 'songs') return matchTitle;
      if (activeFilter === 'artists') return matchArtist;
      if (activeFilter === 'albums') return matchAlbum;
      return matchTitle || matchArtist || matchAlbum || matchGenre;
    });

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
          No matching tracks found for "<b>${escapeHtml(currentQuery)}</b>".
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = `
      <div class="text-meta" style="margin-bottom: 0.5rem;">${filtered.length} results found</div>
      ${filtered.map((track, i) => `
        <div class="track-row" data-id="${track.id}">
          <div style="color: var(--text-muted); font-size: 0.85rem; font-family: var(--font-mono);">${i + 1}</div>
          <img src="${track.artwork || './assets/sample/default_cover.png'}" class="track-cover-thumb" alt="Cover" />
          <div style="min-width: 0;">
            <div class="track-title">${highlightMatch(track.title || 'Unknown Title', q)}</div>
            <div class="track-artist">${highlightMatch(track.artist || 'Unknown Artist', q)}</div>
          </div>
          <div class="track-album text-sub" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${highlightMatch(track.album || '-', q)}
          </div>
          <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); text-align: right;">
            ${formatTime(track.duration || 0)}
          </div>
          <div></div>
        </div>
      `).join('')}
    `;

    resultsContainer.querySelectorAll('.track-row').forEach(row => {
      row.onclick = () => {
        const id = row.getAttribute('data-id');
        const track = tracks.find(t => t.id === id);
        if (track) onPlayTrack(track);
      };
    });
  }

  function getSearchHistory() {
    try {
      const h = localStorage.getItem('dceay_search_history');
      return h ? JSON.parse(h) : [];
    } catch {
      return [];
    }
  }

  function saveSearchHistory(term) {
    if (!term || term.length < 2) return;
    try {
      let h = getSearchHistory();
      h = h.filter(x => x.toLowerCase() !== term.toLowerCase());
      h.unshift(term);
      if (h.length > 8) h.pop();
      localStorage.setItem('dceay_search_history', JSON.stringify(h));
      searchHistory = h;
    } catch (e) {
      console.warn('Failed to save search history:', e);
    }
  }

  return { render };
}

function highlightMatch(text, query) {
  if (!query || !text) return escapeHtml(text || '');
  const escaped = escapeHtml(text);
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return escaped.replace(regex, '<span style="color: var(--accent-primary); font-weight: 700;">$1</span>');
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
