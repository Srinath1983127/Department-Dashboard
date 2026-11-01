const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate icon.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="50%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <linearGradient id="codeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#e0e7ff" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Background rounded squircle -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Inner glass glow -->
  <rect x="24" y="24" width="464" height="464" rx="92" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="4" />

  <!-- Terminal / Code Badge Group -->
  <g filter="url(#glow)">
    <!-- Terminal header dots -->
    <circle cx="160" cy="150" r="12" fill="#ef4444" />
    <circle cx="196" cy="150" r="12" fill="#f59e0b" />
    <circle cx="232" cy="150" r="12" fill="#10b981" />

    <!-- Terminal Window frame -->
    <rect x="120" y="116" width="272" height="280" rx="28" fill="#0f172a" fill-opacity="0.75" stroke="#3b82f6" stroke-width="6" />

    <!-- Code elements < / > -->
    <!-- Left bracket < -->
    <path d="M 195 210 L 155 256 L 195 302" fill="none" stroke="url(#codeGrad)" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" />

    <!-- Slash / -->
    <path d="M 270 190 L 242 322" fill="none" stroke="#38bdf8" stroke-width="18" stroke-linecap="round" />

    <!-- Right bracket > -->
    <path d="M 317 210 L 357 256 L 317 302" fill="none" stroke="url(#codeGrad)" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" />

    <!-- Status pulse dot -->
    <circle cx="340" cy="150" r="8" fill="#38bdf8" />
  </g>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');

// Helper to calculate CRC32
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'binary');
  const crcBuf = Buffer.alloc(4);
  const checksum = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(checksum, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function generatePNG(width, height, isMaskable = false) {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = createChunk('IHDR', ihdrData);

  const rowSize = 1 + width * 4;
  const raw = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const scale = width / 512;
  const cornerRadius = isMaskable ? 0 : 112 * scale;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    raw[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Distance from corners for rounded rectangle
      let inShape = true;
      if (!isMaskable) {
        const dx = Math.abs(x - cx) - (cx - cornerRadius);
        const dy = Math.abs(y - cy) - (cy - cornerRadius);
        if (dx > 0 && dy > 0) {
          if (dx * dx + dy * dy > cornerRadius * cornerRadius) {
            inShape = false;
          }
        }
      }

      if (!inShape) {
        raw[pxOffset] = 0;
        raw[pxOffset + 1] = 0;
        raw[pxOffset + 2] = 0;
        raw[pxOffset + 3] = 0;
        continue;
      }

      // Background gradient (Indigo to Blue to Cyan)
      const gradT = (x / width + y / height) / 2;
      let r = Math.round(30 + gradT * (6 - 30));
      let g = Math.round(27 + gradT * (182 - 27));
      let b = Math.round(140 + gradT * (235 - 140));
      let a = 255;

      // Safe-zone scaling for maskable vs standard
      const sZone = isMaskable ? 0.72 : 0.88;
      const nx = (x - cx) / (cx * sZone);
      const ny = (y - cy) / (cy * sZone);

      // Terminal Box: rx: [-0.65, 0.65], ry: [-0.6, 0.6]
      if (nx >= -0.65 && nx <= 0.65 && ny >= -0.65 && ny <= 0.65) {
        // Dark slate window fill
        r = 15;
        g = 23;
        b = 42;

        // Terminal border
        const isBorder = (Math.abs(nx) > 0.61 || Math.abs(ny) > 0.61);
        if (isBorder) {
          r = 59;
          g = 130;
          b = 246; // Sky blue border
        }

        // Terminal dots
        // Red dot: nx approx -0.45, ny -0.48
        const distRed = Math.hypot(nx - (-0.45), ny - (-0.48));
        if (distRed < 0.065) { r = 239; g = 68; b = 68; }

        // Yellow dot
        const distYellow = Math.hypot(nx - (-0.28), ny - (-0.48));
        if (distYellow < 0.065) { r = 245; g = 158; b = 11; }

        // Green dot
        const distGreen = Math.hypot(nx - (-0.11), ny - (-0.48));
        if (distGreen < 0.065) { r = 16; g = 185; b = 129; }

        // Pulse dot
        const distBlue = Math.hypot(nx - 0.45, ny - (-0.48));
        if (distBlue < 0.045) { r = 56; g = 189; b = 248; }

        // Left angle bracket < : (x: -0.35 to -0.15, y: -0.15 to 0.35)
        // Upper arm: (nx - (-0.15)) * (0.1 - (-0.15)) ...
        // Check distance to segment (-0.15, -0.15) -> (-0.35, 0.1) -> (-0.15, 0.35)
        const dLeftArm1 = distToSegment(nx, ny, -0.15, -0.15, -0.36, 0.1);
        const dLeftArm2 = distToSegment(nx, ny, -0.36, 0.1, -0.15, 0.35);
        if (Math.min(dLeftArm1, dLeftArm2) < 0.06) {
          r = 255; g = 255; b = 255;
        }

        // Slash / : (-0.02, 0.38) -> (0.06, -0.18)
        const dSlash = distToSegment(nx, ny, 0.06, -0.18, -0.04, 0.38);
        if (dSlash < 0.055) {
          r = 56; g = 189; b = 248;
        }

        // Right angle bracket > : (0.15, -0.15) -> (0.36, 0.1) -> (0.15, 0.35)
        const dRightArm1 = distToSegment(nx, ny, 0.15, -0.15, 0.36, 0.1);
        const dRightArm2 = distToSegment(nx, ny, 0.36, 0.1, 0.15, 0.35);
        if (Math.min(dRightArm1, dRightArm2) < 0.06) {
          r = 255; g = 255; b = 255;
        }
      }

      raw[pxOffset] = r;
      raw[pxOffset + 1] = g;
      raw[pxOffset + 2] = b;
      raw[pxOffset + 3] = a;
    }
  }

  const idat = createChunk('IDAT', zlib.deflateSync(raw));
  const iend = createChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([header, ihdr, idat, iend]);
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

// Generate PNGs
console.log('Writing public/pwa-192x192.png...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePNG(192, 192, false));

console.log('Writing public/pwa-512x512.png...');
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePNG(512, 512, false));

console.log('Writing public/pwa-maskable-512x512.png...');
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePNG(512, 512, true));

console.log('Writing public/apple-touch-icon.png (180x180)...');
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePNG(180, 180, false));

// Favicon copy
console.log('Writing public/favicon.ico...');
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), generatePNG(32, 32, false));

console.log('All PWA assets generated successfully!');
