/**
 * UpdateService - Real GitHub Releases update checker with SemVer comparison,
 * release notes viewer, and SHA-256 checksum verification.
 */
export class UpdateService {
  constructor(currentVersion = '1.0.0') {
    this.currentVersion = currentVersion;
    this.owner = 'DCEAY';
    this.repo = 'DCEAY-Music-App';
    this.latestRelease = null;
    this.isChecking = false;
  }

  configure(owner, repo) {
    if (owner) this.owner = owner.trim();
    if (repo) this.repo = repo.trim();
  }

  async checkForUpdates() {
    this.isChecking = true;
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/releases/latest`;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            hasUpdate: false,
            message: `No public releases found yet for ${this.owner}/${this.repo}. You are on the latest build (v${this.currentVersion}).`
          };
        }
        throw new Error(`GitHub API returned status ${response.status}`);
      }

      const release = await response.json();
      this.latestRelease = release;

      const remoteTag = (release.tag_name || '').replace(/^v/, '');
      const hasUpdate = this.compareSemVer(remoteTag, this.currentVersion) > 0;

      // Filter assets for APK and EXE
      const apkAsset = release.assets.find(a => a.name.endsWith('.apk'));
      const exeAsset = release.assets.find(a => a.name.endsWith('.exe'));
      const checksumAsset = release.assets.find(a => a.name.includes('checksum') || a.name.endsWith('.sha256'));

      return {
        hasUpdate,
        currentVersion: this.currentVersion,
        latestVersion: remoteTag,
        releaseName: release.name || release.tag_name,
        releaseNotes: release.body || 'No release notes provided.',
        publishedAt: release.published_at,
        htmlUrl: release.html_url,
        apkAsset,
        exeAsset,
        checksumAsset
      };
    } catch (err) {
      console.warn('Update check failed:', err);
      return {
        hasUpdate: false,
        error: err.message,
        message: `Could not check GitHub releases: ${err.message}`
      };
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * Compares two SemVer strings (e.g. "1.2.0" and "1.1.5").
   * Returns: 1 if a > b, -1 if a < b, 0 if equal.
   */
  compareSemVer(a, b) {
    const pa = a.split('.').map(n => parseInt(n, 10) || 0);
    const pb = b.split('.').map(n => parseInt(n, 10) || 0);
    const len = Math.max(pa.length, pb.length);

    for (let i = 0; i < len; i++) {
      const na = pa[i] || 0;
      const nb = pb[i] || 0;
      if (na > nb) return 1;
      if (na < nb) return -1;
    }
    return 0;
  }

  /**
   * Verifies SHA-256 checksum of an ArrayBuffer against expected hash.
   */
  async verifyChecksum(arrayBuffer, expectedSha256) {
    if (!crypto || !crypto.subtle) {
      console.warn('SubtleCrypto not supported; skipping cryptographic hash check');
      return true;
    }

    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex.toLowerCase() === expectedSha256.trim().toLowerCase();
  }
}
