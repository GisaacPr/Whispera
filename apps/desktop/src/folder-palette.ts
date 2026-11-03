// Colour scheme of the realistic 3D folder. One chosen body colour derives the metal of the
// stitches, edges, clasp, emblem and timer, the waveform and its glow, and the ribbon, the way
// the design pairs obsidian with gold or leather with bronze. Empty keeps the design's look.

export type FolderPalette = { face: string; trim: string; accent: string; glow: string; ribbon: string; timer: [string, string, string] };

export const DESIGN_PALETTE: FolderPalette = { face: '#0f0f13', trim: '#dcb168', accent: '#d39a3c', glow: '#ffcf7a', ribbon: '#6b1020', timer: ['#fff1c4', '#e2b65e', '#9a6a22'] };

const clamp = (v: number, low: number, high: number) => Math.min(high, Math.max(low, v));

function toHsl(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function toHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return '#' + [r, g, b].map(v => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('');
}

export function folderPalette(color?: string): FolderPalette {
  if (!color || !/^#[0-9a-f]{6}$/i.test(color)) return DESIGN_PALETTE;
  const [hue, saturation, lightness] = toHsl(color);
  // Greys get a cool silver; colours keep their hue in a brighter, metallic tone.
  const grey = saturation < 0.12, h = grey ? 220 : hue;
  const s = grey ? 0.08 : clamp(saturation * 0.75 + 0.25, 0.45, 0.85);
  // Trim must read against the body: light on dark bodies, dark on light ones.
  const dark = lightness < 0.55;
  // Mid tones need the widest step, so trim lightness moves away from the body, not to a fixed value.
  const l = dark ? clamp(lightness + 0.32, 0.62, 0.86) : clamp(lightness - 0.34, 0.12, 0.38);
  return {
    face: color.toLowerCase(),
    trim: toHex(h, s, l),
    accent: toHex(h, clamp(s + 0.1, 0, 0.95), dark ? 0.58 : 0.42),
    glow: toHex(h, grey ? 0.12 : 0.9, 0.76),
    ribbon: toHex((h + 25) % 360, grey ? 0.1 : 0.55, dark ? 0.32 : 0.26),
    timer: [toHex(h, s, clamp(l + 0.2, 0, 0.92)), toHex(h, s, l), toHex(h, s, clamp(l - 0.25, 0.12, 1))],
  };
}
