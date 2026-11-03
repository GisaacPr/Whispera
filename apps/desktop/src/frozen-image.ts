// Frozen desktop previews arrive as PNG (current native side) or BMP (older builds, tests).
// Label the blob by its signature so either decodes without trusting a fixed type.
export function frozenImageType(bytes: ArrayBuffer | Uint8Array): 'image/png' | 'image/bmp' {
  const head = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes, 0, Math.min(4, bytes.byteLength));
  return head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47 ? 'image/png' : 'image/bmp';
}
