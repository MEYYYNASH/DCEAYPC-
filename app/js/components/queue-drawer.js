/**
 * QueueDrawer Component - Displays current playback queue and upcoming tracks.
 */
export function setupQueueDrawer({ container, audioEngine, onPlayTrack, onUpdateQueue }) {
  function render() {
    const queue = audioEngine.queue || [];
    const currentIndex = audioEngine.queueIndex;

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 1rem; border-bottom: 1px solid var(--border-glass);">
        <div>
          <div style="font-weight: 700; font-size: 1.15rem; color: var(--text-main);">Playback Queue</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">${queue.length} Tracks in Queue</div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <button class="btn-ghost" id="q-btn-clear" style="font-size: 0.75rem; padding: 0.3rem 0.7rem;">Clear</button>
          <button class="btn-icon" id="q-btn-close">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <div style="flex: 1; overflow-y: auto; padding: 1rem 0; display: flex; flex-direction: column; gap: 0.5rem;">
        ${queue.length === 0 ? `
          <div style="text-align: center; margin: auto; color: var(--text-muted); padding: 2rem;">
            Queue is empty. Add songs from your Library!
          </div>
        ` : queue.map((track, idx) => `
          <div class="track-row ${idx === currentIndex ? 'playing' : ''}" data-index="${idx}" style="grid-template-columns: 30px 44px 1fr 40px; padding: 0.5rem 0.75rem;">
            <div style="font-size: 0.8rem; font-family: var(--font-mono); color: var(--text-muted);">
              ${idx === currentIndex ? '▶' : idx + 1}
            </div>
            <img src="${track.artwork || './assets/sample/default_cover.png'}" class="track-cover-thumb" style="width: 38px; height: 38px;" alt="Cover" />
            <div style="min-width: 0;">
              <div class="track-title" style="font-size: 0.88rem;">${escapeHtml(track.title || 'Unknown Title')}</div>
              <div class="track-artist" style="font-size: 0.75rem;">${escapeHtml(track.artist || 'Unknown Artist')}</div>
            </div>
            <button class="btn-icon q-remove" data-index="${idx}" title="Remove from queue" style="padding: 0.25rem;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelector('#q-btn-close').onclick = () => container.classList.remove('open');

    const clearBtn = container.querySelector('#q-btn-clear');
    if (clearBtn) {
      clearBtn.onclick = () => {
        audioEngine.queue = audioEngine.currentTrack ? [audioEngine.currentTrack] : [];
        audioEngine.queueIndex = audioEngine.currentTrack ? 0 : -1;
        if (onUpdateQueue) onUpdateQueue(audioEngine.queue);
        render();
      };
    }

    container.querySelectorAll('.track-row').forEach(row => {
      row.onclick = (e) => {
        if (e.target.closest('.q-remove')) return;
        const idx = parseInt(row.getAttribute('data-index'), 10);
        audioEngine.queueIndex = idx;
        audioEngine.loadTrack(queue[idx], true);
        render();
      };
    });

    container.querySelectorAll('.q-remove').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        audioEngine.queue.splice(idx, 1);
        if (idx < audioEngine.queueIndex) {
          audioEngine.queueIndex--;
        } else if (idx === audioEngine.queueIndex && audioEngine.queue.length > 0) {
          audioEngine.loadTrack(audioEngine.queue[Math.min(idx, audioEngine.queue.length - 1)], true);
        }
        if (onUpdateQueue) onUpdateQueue(audioEngine.queue);
        render();
      };
    });
  }

  return { render };
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
