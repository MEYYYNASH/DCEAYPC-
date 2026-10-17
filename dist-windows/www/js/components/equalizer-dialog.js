/**
 * EqualizerDialog Component - 5-Band Equalizer with presets.
 */
export function setupEqualizerDialog({ container, audioEngine, currentPreset, currentGains, onSaveEqualizer }) {
  const bands = [
    { label: '60Hz', sub: 'Bass' },
    { label: '230Hz', sub: 'Low Mid' },
    { label: '910Hz', sub: 'Mid' },
    { label: '3.6kHz', sub: 'High Mid' },
    { label: '14kHz', sub: 'Treble' }
  ];

  let gains = [...currentGains];
  let preset = currentPreset;

  function render() {
    container.innerHTML = `
      <div style="background: var(--bg-glass); backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px); border: 1px solid var(--border-glass); border-radius: var(--radius-lg); width: 440px; max-width: 90vw; padding: 1.75rem; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <div>
            <div style="font-weight: 700; font-size: 1.2rem; color: var(--text-main);">Equalizer</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">Real-time Web Audio API hardware DSP</div>
          </div>
          <button class="btn-icon" id="eq-btn-close">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Presets Selection -->
        <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem; margin-bottom: 1.75rem;">
          ${['flat', 'bass_boost', 'vocal_boost', 'rock', 'electronic', 'classical'].map(p => `
            <button class="filter-pill ${preset === p ? 'active' : ''}" data-preset="${p}">
              ${formatPresetName(p)}
            </button>
          `).join('')}
        </div>

        <!-- Sliders -->
        <div style="display: flex; justify-content: space-between; align-items: center; height: 180px; padding: 0 0.5rem;">
          ${bands.map((b, i) => `
            <div style="display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: space-between;">
              <span id="eq-val-${i}" style="font-size: 0.75rem; font-family: var(--font-mono); color: var(--accent-primary); font-weight: 600;">
                ${gains[i] > 0 ? '+' : ''}${gains[i]}dB
              </span>
              <input type="range" class="eq-slider" data-index="${i}" min="-12" max="12" step="1" value="${gains[i]}" 
                     style="transform: rotate(-90deg); width: 100px; margin: 40px -40px;" />
              <div style="text-align: center;">
                <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-main);">${b.label}</div>
                <div style="font-size: 0.68rem; color: var(--text-muted);">${b.sub}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-glass);">
          <button class="btn-ghost" id="eq-btn-reset">Reset</button>
          <button class="btn-primary" id="eq-btn-apply">Done</button>
        </div>
      </div>
    `;

    // Listeners
    container.querySelector('#eq-btn-close').onclick = () => container.style.display = 'none';
    container.querySelector('#eq-btn-apply').onclick = () => {
      container.style.display = 'none';
      if (onSaveEqualizer) onSaveEqualizer(preset, gains);
    };

    container.querySelector('#eq-btn-reset').onclick = () => {
      preset = 'flat';
      gains = [0, 0, 0, 0, 0];
      audioEngine.setEqualizerGains(gains);
      render();
    };

    container.querySelectorAll('.filter-pill[data-preset]').forEach(btn => {
      btn.onclick = () => {
        preset = btn.getAttribute('data-preset');
        gains = audioEngine.applyEqualizerPreset(preset);
        render();
      };
    });

    container.querySelectorAll('.eq-slider').forEach(input => {
      input.oninput = (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        const val = parseInt(e.target.value, 10);
        gains[idx] = val;
        preset = 'custom';
        audioEngine.setEqualizerGains(gains);
        container.querySelector(`#eq-val-${idx}`).textContent = `${val > 0 ? '+' : ''}${val}dB`;
      };
    });
  }

  return { render };
}

function formatPresetName(key) {
  return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
