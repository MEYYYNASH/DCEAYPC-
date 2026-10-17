/**
 * LyricsView Component - Synchronized lyrics modal with smooth auto-scroll,
 * line jumping, and offset adjustment.
 */
export function setupLyricsView({ container, lyricsEngine, audioEngine, onSaveLyrics }) {
  let activeIndex = -1;
  let fontSize = 20;

  function render(track) {
    const hasLyrics = lyricsEngine.hasLyrics();

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 1rem; border-bottom: 1px solid var(--border-glass);">
        <div>
          <div style="font-weight: 700; font-size: 1.1rem; color: var(--text-main);">Lyrics</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">${escapeHtml(track ? track.title : '')}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <button class="btn-icon" id="ly-btn-font-dec" title="Decrease font size" style="font-size: 0.8rem; font-weight: bold;">A-</button>
          <button class="btn-icon" id="ly-btn-font-inc" title="Increase font size" style="font-size: 1rem; font-weight: bold;">A+</button>
          <button class="btn-icon" id="ly-btn-close" aria-label="Close Lyrics">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <!-- Sync Offset Bar -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; font-size: 0.82rem; border-bottom: 1px solid var(--border-glass);">
        <span style="color: var(--text-muted);">Sync Offset: <b id="ly-offset-val" style="color: var(--accent-primary); font-family: var(--font-mono);">${lyricsEngine.getOffset()}ms</b></span>
        <div style="display: flex; gap: 0.35rem;">
          <button class="btn-ghost" id="ly-offset-minus-500" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">-500ms</button>
          <button class="btn-ghost" id="ly-offset-minus-100" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">-100ms</button>
          <button class="btn-ghost" id="ly-offset-plus-100" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">+100ms</button>
          <button class="btn-ghost" id="ly-offset-plus-500" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">+500ms</button>
        </div>
      </div>

      <div class="lyrics-scroll-container" id="lyrics-lines-container">
        ${hasLyrics ? lyricsEngine.lines.map((line, idx) => `
          <div class="lyric-line" data-index="${idx}" data-time="${line.time}" style="font-size: ${fontSize}px;">
            ${escapeHtml(line.text)}
          </div>
        `).join('') : `
          <div style="text-align: center; margin: auto; padding: 2rem; color: var(--text-muted);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem; opacity: 0.5;">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
            <div style="font-size: 1.1rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem;">No Lyrics Available</div>
            <div style="font-size: 0.85rem; margin-bottom: 1.5rem;">Import a timestamped .lrc file to view synchronized lyrics.</div>
            <label class="btn-primary" style="cursor: pointer;">
              Import .LRC File
              <input type="file" id="ly-file-input" accept=".lrc,.txt" style="display: none;" />
            </label>
          </div>
        `}
      </div>
    `;

    // Listeners
    container.querySelector('#ly-btn-close').onclick = () => container.classList.remove('open');

    container.querySelector('#ly-btn-font-inc').onclick = () => {
      fontSize = Math.min(32, fontSize + 2);
      updateLineFontSizes();
    };
    container.querySelector('#ly-btn-font-dec').onclick = () => {
      fontSize = Math.max(14, fontSize - 2);
      updateLineFontSizes();
    };

    // Offset buttons
    const bindOffset = (id, delta) => {
      const btn = container.querySelector(id);
      if (btn) {
        btn.onclick = () => {
          lyricsEngine.setOffset(lyricsEngine.getOffset() + delta);
          container.querySelector('#ly-offset-val').textContent = `${lyricsEngine.getOffset()}ms`;
        };
      }
    };
    bindOffset('#ly-offset-minus-500', -500);
    bindOffset('#ly-offset-minus-100', -100);
    bindOffset('#ly-offset-plus-100', 100);
    bindOffset('#ly-offset-plus-500', 500);

    // Line click to seek
    const lines = container.querySelectorAll('.lyric-line');
    lines.forEach(el => {
      el.onclick = () => {
        const time = parseFloat(el.getAttribute('data-time'));
        if (!isNaN(time)) {
          audioEngine.seek(time);
        }
      };
    });

    // File input for LRC
    const fileInput = container.querySelector('#ly-file-input');
    if (fileInput) {
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file && track) {
          const reader = new FileReader();
          reader.onload = (re) => {
            const content = re.target.result;
            lyricsEngine.parseLRC(content);
            if (onSaveLyrics) onSaveLyrics(track.id, content);
            render(track);
          };
          reader.readAsText(file);
        }
      };
    }
  }

  function updateLineFontSizes() {
    const lines = container.querySelectorAll('.lyric-line');
    lines.forEach(el => el.style.fontSize = `${fontSize}px`);
  }

  function updateActiveTime(currentTime) {
    if (!lyricsEngine.hasLyrics()) return;

    const newIndex = lyricsEngine.getActiveLineIndex(currentTime);
    if (newIndex === activeIndex) return;

    activeIndex = newIndex;
    const lines = container.querySelectorAll('.lyric-line');
    lines.forEach((el, idx) => {
      if (idx === activeIndex) {
        el.classList.add('active');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        el.classList.remove('active');
      }
    });
  }

  return { render, updateActiveTime };
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
