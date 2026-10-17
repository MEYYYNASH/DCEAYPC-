/**
 * PaletteExtractor - Asynchronously extracts dominant colors from album artwork
 * and smoothly updates ambient gradients.
 */
export class PaletteExtractor {
  constructor() {
    this.cache = new Map();
    this.canvas = document.createElement('canvas');
    this.canvas.width = 64;
    this.canvas.height = 64;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
  }

  async extractAndApply(imageSrc, isEnabled = true) {
    if (!isEnabled || !imageSrc) {
      this.resetToDefault();
      return;
    }

    if (this.cache.has(imageSrc)) {
      this.applyPalette(this.cache.get(imageSrc));
      return;
    }

    try {
      const palette = await this.extractColors(imageSrc);
      this.cache.set(imageSrc, palette);
      this.applyPalette(palette);
    } catch (e) {
      console.warn('Failed to extract palette from artwork:', e);
      this.resetToDefault();
    }
  }

  extractColors(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          this.ctx.clearRect(0, 0, 64, 64);
          this.ctx.drawImage(img, 0, 0, 64, 64);
          const imageData = this.ctx.getImageData(0, 0, 64, 64).data;
          
          let rTotal = 0, gTotal = 0, bTotal = 0, count = 0;
          let maxSat = 0;
          let vibrantColor = { r: 0, g: 240, b: 255 };

          for (let i = 0; i < imageData.length; i += 16) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            const a = imageData[i + 3];

            if (a < 128) continue;

            rTotal += r;
            gTotal += g;
            bTotal += b;
            count++;

            // Measure saturation
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const sat = max === 0 ? 0 : (max - min) / max;

            if (sat > maxSat && max > 50 && max < 240) {
              maxSat = sat;
              vibrantColor = { r, g, b };
            }
          }

          if (count === 0) {
            resolve(this.getDefaultPalette());
            return;
          }

          const avgR = Math.round(rTotal / count);
          const avgG = Math.round(gTotal / count);
          const avgB = Math.round(bTotal / count);

          const palette = {
            top: `rgba(${vibrantColor.r}, ${vibrantColor.g}, ${vibrantColor.b}, 0.28)`,
            bottom: `rgba(${Math.round(avgR * 0.4)}, ${Math.round(avgG * 0.4)}, ${Math.round(avgB * 0.4)}, 0.45)`,
            accent: `rgb(${vibrantColor.r}, ${vibrantColor.g}, ${vibrantColor.b})`,
            glow: `rgba(${vibrantColor.r}, ${vibrantColor.g}, ${vibrantColor.b}, 0.35)`
          };

          resolve(palette);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  applyPalette(palette) {
    const root = document.documentElement;
    root.style.setProperty('--dynamic-bg-top', palette.top);
    root.style.setProperty('--dynamic-bg-bottom', palette.bottom);
    root.style.setProperty('--dynamic-accent', palette.accent);
    root.style.setProperty('--accent-glow', palette.glow);
  }

  resetToDefault() {
    const root = document.documentElement;
    root.style.removeProperty('--dynamic-bg-top');
    root.style.removeProperty('--dynamic-bg-bottom');
    root.style.removeProperty('--dynamic-accent');
    root.style.removeProperty('--accent-glow');
  }

  getDefaultPalette() {
    return {
      top: 'rgba(18, 24, 38, 0.85)',
      bottom: 'rgba(10, 11, 16, 0.95)',
      accent: '#00f0ff',
      glow: 'rgba(0, 240, 255, 0.25)'
    };
  }
}
