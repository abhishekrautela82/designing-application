type RenderParams = {
  width: number;
  height: number;
  seed: string;
};

// Produces a deterministic PNG placeholder so the server-side export pipeline
// behaves like a real renderer (binary image output, correct content-type).
export async function renderPlaceholderPng(params: RenderParams): Promise<Buffer> {
  const mod = await import("pngjs");
  // pngjs is CommonJS; support both default and named exports.
  const PNG = (mod as any).PNG ?? (mod as any).default?.PNG;
  if (!PNG) {
    throw new Error("pngjs PNG export not found");
  }

  const { width, height, seed } = params;
  const png = new PNG({ width, height });

  // Simple gradient + seeded banding so different jobs look different.
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      const r = (x * 255) / Math.max(1, width - 1);
      const g = (y * 255) / Math.max(1, height - 1);
      const b = (64 + ((hash ^ (x * 131 + y * 313)) & 63)) & 255;
      png.data[idx] = r & 255;
      png.data[idx + 1] = g & 255;
      png.data[idx + 2] = b;
      png.data[idx + 3] = 255;
    }
  }

  return PNG.sync.write(png);
}
