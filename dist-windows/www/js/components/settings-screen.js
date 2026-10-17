/**
 * SettingsScreen Component - Comprehensive settings for theme, accent colors,
 * audio preferences, and real GitHub Releases Online Update Center.
 */
export function setupSettingsScreen({ container, settings, updateService, onSaveSettings, onClearHistory, onResetDatabase }) {
  let updateState = { status: 'idle', result: null };

  function render() {
    container.innerHTML = `
      <div style="max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem;">
        <div>
          <h1 class="title-section" style="font-size: 1.75rem;">Settings</h1>
          <div class="text-meta" style="margin-top: 0.25rem;">Customize appearance, audio engine, and check online updates</div>
        </div>

        <!-- Appearance Section -->
        <div class="glass-card" style="padding: 1.75rem; border-radius: var(--radius-lg); display: flex; flex-direction: column; gap: 1.5rem;">
          <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            Appearance & Themes
          </h2>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 600; font-size: 0.95rem;">Theme Preset</div>
                <div class="text-sub">Choose visual aesthetic and color contrast</div>
              </div>
              <select id="setting-theme-select" style="background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 0.5rem 0.8rem; outline: none;">
                <option value="theme-dark" ${settings.theme === 'theme-dark' ? 'selected' : ''}>Obsidian Dark (Default)</option>
                <option value="theme-cyberpunk" ${settings.theme === 'theme-cyberpunk' ? 'selected' : ''}>Cyberpunk Neon (Pink & Cyan)</option>
                <option value="theme-glassmorphism" ${settings.theme === 'theme-glassmorphism' ? 'selected' : ''}>Glassmorphism (Frosted Translucent)</option>
                <option value="theme-oled" ${settings.theme === 'theme-oled' ? 'selected' : ''}>OLED Pure Black</option>
              </select>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--border-glass);">
              <div>
                <div style="font-weight: 600; font-size: 0.95rem;">Dynamic Album Art Backgrounds</div>
                <div class="text-sub">Sample vibrant colors from the playing track for background glow</div>
              </div>
              <input type="checkbox" id="setting-dyn-art" ${settings.dynamicArtwork ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;" />
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--border-glass);">
              <div>
                <div style="font-weight: 600; font-size: 0.95rem;">Reduced Motion</div>
                <div class="text-sub">Disable intensive animations for accessibility and battery conservation</div>
              </div>
              <input type="checkbox" id="setting-red-motion" ${settings.reducedMotion ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;" />
            </div>
          </div>
        </div>

        <!-- Audio Preferences Section -->
        <div class="glass-card" style="padding: 1.75rem; border-radius: var(--radius-lg); display: flex; flex-direction: column; gap: 1.5rem;">
          <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
            Audio Engine & Playback
          </h2>

          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; font-size: 0.95rem;">Default Playback Speed</div>
              <div class="text-sub">Choose default speed for audio content</div>
            </div>
            <select id="setting-speed-select" style="background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 0.5rem 0.8rem; outline: none;">
              <option value="0.75" ${settings.playbackSpeed === 0.75 ? 'selected' : ''}>0.75x</option>
              <option value="1.0" ${settings.playbackSpeed === 1.0 ? 'selected' : ''}>1.0x (Normal)</option>
              <option value="1.25" ${settings.playbackSpeed === 1.25 ? 'selected' : ''}>1.25x</option>
              <option value="1.5" ${settings.playbackSpeed === 1.5 ? 'selected' : ''}>1.5x</option>
              <option value="2.0" ${settings.playbackSpeed === 2.0 ? 'selected' : ''}>2.0x</option>
            </select>
          </div>
        </div>

        <!-- GitHub Releases Online Update Center -->
        <div class="glass-card" style="padding: 1.75rem; border-radius: var(--radius-lg); display: flex; flex-direction: column; gap: 1.5rem; border-color: rgba(0, 240, 255, 0.2);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                GitHub Online Update Center
              </h2>
              <div class="text-sub" style="margin-top: 0.2rem;">Checks official GitHub Releases for Android APK and Windows EXE updates</div>
            </div>
            <div style="padding: 0.3rem 0.75rem; border-radius: var(--radius-full); background: rgba(0, 240, 255, 0.1); border: 1px solid var(--border-focus); font-size: 0.82rem; font-family: var(--font-mono); color: var(--accent-primary);">
              Current: v${updateService.currentVersion}
            </div>
          </div>

          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 200px;">
              <label class="text-meta" style="display: block; margin-bottom: 0.35rem;">Repository Owner</label>
              <input type="text" id="setting-gh-owner" value="${escapeHtml(settings.githubOwner || 'DCEAY')}" 
                     style="width: 100%; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); padding: 0.5rem 0.75rem; outline: none;" />
            </div>
            <div style="flex: 1; min-width: 200px;">
              <label class="text-meta" style="display: block; margin-bottom: 0.35rem;">Repository Name</label>
              <input type="text" id="setting-gh-repo" value="${escapeHtml(settings.githubRepo || 'DCEAY-Music-App')}" 
                     style="width: 100%; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); padding: 0.5rem 0.75rem; outline: none;" />
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.5rem;">
            <button class="btn-primary" id="setting-btn-check-update">
              ${updateState.status === 'checking' ? `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning-vinyl"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                Checking Releases...
              ` : `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Check for Updates
              `}
            </button>
          </div>

          <div id="update-feedback-area"></div>
        </div>

        <!-- Data & Cache Section -->
        <div class="glass-card" style="padding: 1.75rem; border-radius: var(--radius-lg); display: flex; flex-direction: column; gap: 1.5rem;">
          <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            Privacy, Storage & Reset
          </h2>

          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; font-size: 0.95rem;">Clear Playback History</div>
              <div class="text-sub">Remove recently played history from local storage</div>
            </div>
            <button class="btn-ghost" id="setting-btn-clear-history">Clear History</button>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--border-glass);">
            <div>
              <div style="font-weight: 600; font-size: 0.95rem; color: #ff4757;">Reset Music Database</div>
              <div class="text-sub">Clear all imported tracks and playlists (does not delete audio files from disk)</div>
            </div>
            <button class="btn-ghost" id="setting-btn-reset-db" style="color: #ff4757; border-color: rgba(255, 71, 87, 0.3);">Reset Library</button>
          </div>
        </div>

        <!-- About Card -->
        <div style="text-align: center; color: var(--text-muted); font-size: 0.82rem; padding: 1rem 0;">
          <b>DCEAY Music App</b> • v${updateService.currentVersion}<br/>
          Inspired by Dotify • Built for Android APK & Windows Desktop
        </div>
      </div>
    `;

    setupHandlers();
    renderUpdateFeedback();
  }

  function setupHandlers() {
    // Theme Switcher
    const themeSelect = container.querySelector('#setting-theme-select');
    themeSelect.onchange = (e) => {
      settings.theme = e.target.value;
      document.body.className = `${settings.theme} ${settings.reducedMotion ? 'reduced-motion' : ''}`;
      onSaveSettings(settings);
    };

    // Dynamic Artwork Toggle
    const dynArt = container.querySelector('#setting-dyn-art');
    dynArt.onchange = (e) => {
      settings.dynamicArtwork = e.target.checked;
      onSaveSettings(settings);
    };

    // Reduced Motion
    const redMotion = container.querySelector('#setting-red-motion');
    redMotion.onchange = (e) => {
      settings.reducedMotion = e.target.checked;
      if (settings.reducedMotion) document.body.classList.add('reduced-motion');
      else document.body.classList.remove('reduced-motion');
      onSaveSettings(settings);
    };

    // Speed Select
    const speedSelect = container.querySelector('#setting-speed-select');
    speedSelect.onchange = (e) => {
      settings.playbackSpeed = parseFloat(e.target.value);
      onSaveSettings(settings);
    };

    // GitHub Repo inputs
    const ghOwner = container.querySelector('#setting-gh-owner');
    const ghRepo = container.querySelector('#setting-gh-repo');
    const saveGh = () => {
      settings.githubOwner = ghOwner.value.trim();
      settings.githubRepo = ghRepo.value.trim();
      updateService.configure(settings.githubOwner, settings.githubRepo);
      onSaveSettings(settings);
    };
    ghOwner.onchange = saveGh;
    ghRepo.onchange = saveGh;

    // Check updates button
    const checkBtn = container.querySelector('#setting-btn-check-update');
    checkBtn.onclick = async () => {
      saveGh();
      updateState = { status: 'checking', result: null };
      render();

      const res = await updateService.checkForUpdates();
      updateState = { status: 'done', result: res };
      render();
    };

    // Clear History & Reset
    container.querySelector('#setting-btn-clear-history').onclick = () => {
      if (confirm('Clear playback history?')) {
        onClearHistory();
        alert('Playback history cleared.');
      }
    };

    container.querySelector('#setting-btn-reset-db').onclick = () => {
      if (confirm('Are you sure you want to reset all library tracks and playlists?')) {
        onResetDatabase();
      }
    };
  }

  function renderUpdateFeedback() {
    const area = container.querySelector('#update-feedback-area');
    if (!area || !updateState.result) return;

    const r = updateState.result;

    if (r.hasUpdate) {
      area.innerHTML = `
        <div style="background: rgba(0, 240, 255, 0.08); border: 1px solid var(--border-focus); border-radius: var(--radius-md); padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; color: var(--accent-primary);">Update Available: v${escapeHtml(r.latestVersion)}</span>
            <span class="text-meta">${new Date(r.publishedAt).toLocaleDateString()}</span>
          </div>
          <div style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; white-space: pre-wrap; max-height: 120px; overflow-y: auto;">
            ${escapeHtml(r.releaseNotes)}
          </div>
          <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem; flex-wrap: wrap;">
            ${r.apkAsset ? `
              <a href="${r.apkAsset.browser_download_url}" target="_blank" class="btn-primary" style="font-size: 0.82rem; text-decoration: none;">
                Download Android APK (${(r.apkAsset.size / 1024 / 1024).toFixed(1)} MB)
              </a>
            ` : ''}
            ${r.exeAsset ? `
              <a href="${r.exeAsset.browser_download_url}" target="_blank" class="btn-primary" style="font-size: 0.82rem; text-decoration: none;">
                Download Windows EXE (${(r.exeAsset.size / 1024 / 1024).toFixed(1)} MB)
              </a>
            ` : ''}
            <a href="${r.htmlUrl}" target="_blank" class="btn-ghost" style="font-size: 0.82rem; text-decoration: none;">
              View Release on GitHub
            </a>
          </div>
        </div>
      `;
    } else {
      area.innerHTML = `
        <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 1rem; font-size: 0.88rem; color: var(--text-secondary);">
          ${escapeHtml(r.message || `You have the latest version (v${updateService.currentVersion}).`)}
        </div>
      `;
    }
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
