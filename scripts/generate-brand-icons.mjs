/**
 * Generates the Claquete PNG brand assets straight from the design tokens.
 *
 * The mark is a clapperboard whose top stripes turn into rating bars, drawn
 * analytically (rounded rects + rotated stripes) and rasterized with 3x3
 * supersampling, then encoded as PNG with Node's built-in zlib.
 *
 * Usage: node scripts/generate-brand-icons.mjs
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const PALETTE = {
  background: [14, 14, 18],
  surface: [26, 26, 33],
  surfaceAlt: [36, 36, 45],
  barMuted: [58, 58, 70], // side bars, lifted for contrast on small sizes
  primary: [255, 197, 61],
  white: [245, 245, 247],
};

// ---------------------------------------------------------------- geometry --

const roundRect = (x, y, w, h, r) => (px, py) => {
  const dx = Math.max(x + r - px, 0, px - (x + w - r));
  const dy = Math.max(y + r - py, 0, py - (y + h - r));
  if (px < x || px > x + w || py < y || py > y + h) return false;
  return dx * dx + dy * dy <= r * r || dx === 0 || dy === 0;
};

const rotatedRect = (cx, cy, w, h, deg) => {
  const rad = (-deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return (px, py) => {
    const dx = px - cx;
    const dy = py - cy;
    const lx = dx * cos - dy * sin;
    const ly = dx * sin + dy * cos;
    return Math.abs(lx) <= w / 2 && Math.abs(ly) <= h / 2;
  };
};

/**
 * Builds the mark as an ordered list of layers. Coordinates are normalized to a
 * 256x256 grid and scaled to the requested size, so every export stays aligned.
 */
function markLayers({ scale, withBoard, monochrome }) {
  const s = (v) => v * scale;
  const fg = monochrome ? PALETTE.white : null;
  const layers = [];

  const board = roundRect(s(0), s(0), s(256), s(256), s(56));

  if (withBoard) {
    layers.push({ test: board, color: fg ?? PALETTE.surface });
  }

  // clapper bar
  const bar = (px, py) => board(px, py) && py <= s(80);
  layers.push({ test: bar, color: fg ?? PALETTE.primary });

  // diagonal stripes cut out of the clapper bar
  const stripes = [28, 100, 172, 244].map((x) =>
    rotatedRect(s(x), s(40), s(28), s(130), 20)
  );
  layers.push({
    test: (px, py) => bar(px, py) && stripes.some((st) => st(px, py)),
    color: monochrome ? null : PALETTE.background,
  });

  // rating bars
  const bars = [
    { x: 72, y: 168, h: 42, color: PALETTE.barMuted },
    { x: 114, y: 128, h: 82, color: PALETTE.primary },
    { x: 156, y: 150, h: 60, color: PALETTE.barMuted },
  ];
  for (const b of bars) {
    layers.push({
      test: roundRect(s(b.x), s(b.y), s(30), s(b.h), s(8)),
      color: fg ?? b.color,
    });
  }

  return layers;
}

// --------------------------------------------------------------- rasterizer --

const SAMPLES = 4;

/**
 * Resolves the topmost layer that covers a point. Returns null when the point
 * is transparent (either uncovered, or punched out by a `color: null` layer).
 */
function sampleAt(layers, background, px, py) {
  let color = background ?? null;
  for (const layer of layers) {
    if (layer.test(px, py)) color = layer.color;
  }
  return color;
}

function rasterize({ width, height, layers, background = null, inset = 0 }) {
  const pixels = Buffer.alloc(width * height * 4);
  const total = SAMPLES * SAMPLES;
  const step = 1 / (SAMPLES + 1);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let covered = 0;

      for (let sy = 1; sy <= SAMPLES; sy++) {
        for (let sx = 1; sx <= SAMPLES; sx++) {
          const color = sampleAt(
            layers,
            background,
            x + sx * step - inset,
            y + sy * step - inset
          );
          if (!color) continue;
          r += color[0];
          g += color[1];
          b += color[2];
          covered++;
        }
      }

      const i = (y * width + x) * 4;
      if (covered > 0) {
        // Straight (non-premultiplied) alpha: average only the covered samples.
        pixels[i] = Math.round(r / covered);
        pixels[i + 1] = Math.round(g / covered);
        pixels[i + 2] = Math.round(b / covered);
        pixels[i + 3] = Math.round((covered / total) * 255);
      }
    }
  }

  return pixels;
}

// ------------------------------------------------------------- png encoding --

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(width, height, pixels) {
  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    pixels.copy(
      raw,
      y * (width * 4 + 1) + 1,
      y * width * 4,
      (y + 1) * width * 4
    );
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// -------------------------------------------------------------------- build --

function write(relativePath, width, height, options) {
  const pixels = rasterize({ width, height, ...options });
  const file = resolve(ROOT, relativePath);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, encodePng(width, height, pixels));
  console.log(`  ${relativePath}  ${width}x${height}`);
}

const SIZE = 1024;
const scale = SIZE / 256;

console.log('Generating Claquete brand assets:');

// App icon: full clapperboard on the brand surface.
write('assets/icon.png', SIZE, SIZE, {
  layers: markLayers({ scale, withBoard: true }),
});

// Android adaptive icon: foreground needs to sit inside the 66% safe zone.
const inner = SIZE * 0.62;
write('assets/android-icon-foreground.png', SIZE, SIZE, {
  layers: markLayers({ scale: inner / 256, withBoard: true }),
  inset: (SIZE - inner) / 2,
});

write('assets/android-icon-background.png', SIZE, SIZE, {
  layers: [{ test: () => true, color: PALETTE.background }],
});

write('assets/android-icon-monochrome.png', SIZE, SIZE, {
  layers: markLayers({ scale: inner / 256, withBoard: true, monochrome: true }),
  inset: (SIZE - inner) / 2,
});

write('assets/favicon.png', 64, 64, {
  layers: markLayers({ scale: 64 / 256, withBoard: true }),
});

write('assets/brand/logo-mark.png', 512, 512, {
  layers: markLayers({ scale: 512 / 256, withBoard: true }),
});

console.log('Done.');
