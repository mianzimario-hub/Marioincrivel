const fs = require('fs');
const zlib = require('zlib');

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.slice(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function createPNG(width, height, pixelFn) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 per scanline
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = pixelFn(x, y, width, height);
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Draw Miazoom icon: Deep warm background, Red & Yellow badge, camera silhouette with yellow play icon
function renderMiazoomPixel(x, y, w, h, isMaskable = false) {
  const nx = x / w;
  const ny = y / h;

  // Background: Deep obsidian warm tone (#0c0a09 -> #160d0a)
  let bgR = 14 + Math.floor(nx * 10);
  let bgG = 10 + Math.floor(ny * 4);
  let bgB = 9;

  // Badge bounds
  const margin = isMaskable ? 0.22 : 0.16;
  const bx1 = w * margin;
  const by1 = h * margin;
  const bx2 = w * (1 - margin);
  const by2 = h * (1 - margin);
  const bradius = w * 0.18;

  // Check if inside rounded badge
  const inRectX = x >= bx1 + bradius && x <= bx2 - bradius && y >= by1 && y <= by2;
  const inRectY = y >= by1 + bradius && y <= by2 - bradius && x >= bx1 && x <= bx2;
  const inTopLeft = Math.hypot(x - (bx1 + bradius), y - (by1 + bradius)) <= bradius;
  const inTopRight = Math.hypot(x - (bx2 - bradius), y - (by1 + bradius)) <= bradius;
  const inBottomLeft = Math.hypot(x - (bx1 + bradius), y - (by2 - bradius)) <= bradius;
  const inBottomRight = Math.hypot(x - (bx2 - bradius), y - (by2 - bradius)) <= bradius;

  const inBadge = inRectX || inRectY || inTopLeft || inTopRight || inBottomLeft || inBottomRight;

  if (inBadge) {
    // Red to Yellow gradient (Red: 239, 68, 68; Amber: 245, 158, 11; Yellow: 250, 204, 21)
    const t = (nx + ny) / 2;
    let badgeR = Math.floor(239 * (1 - t) + 250 * t);
    let badgeG = Math.floor(68 * (1 - t) + 204 * t);
    let badgeB = Math.floor(68 * (1 - t) + 21 * t);

    // Camera body inside
    const cx = w * 0.44;
    const cy = h * 0.48;
    const camW = w * 0.24;
    const camH = h * 0.20;

    const inCamBody =
      x >= cx - camW / 2 && x <= cx + camW / 2 &&
      y >= cy - camH / 2 && y <= cy + camH / 2;

    // Lens triangle on right
    const tx1 = cx + camW / 2;
    const ty1 = cy - camH * 0.35;
    const tx2 = cx + camW * 0.88;
    const ty2 = cy - camH * 0.65;
    const ty3 = cy + camH * 0.65;

    let inLens = false;
    if (x >= tx1 && x <= tx2) {
      const progress = (x - tx1) / (tx2 - tx1);
      const topBound = ty1 + (ty2 - ty1) * progress;
      const bottomBound = (cy + camH * 0.35) + (ty3 - (cy + camH * 0.35)) * progress;
      if (y >= topBound && y <= bottomBound) {
        inLens = true;
      }
    }

    if (inCamBody || inLens) {
      // Camera cut-out in solid dark #0c0a09
      // Inner yellow play button
      const px1 = cx - camW * 0.2;
      const px2 = cx + camW * 0.25;
      const py1 = cy - camH * 0.3;
      const py2 = cy;
      const py3 = cy + camH * 0.3;

      let inPlay = false;
      if (x >= px1 && x <= px2) {
        const pProg = (x - px1) / (px2 - px1);
        const pTop = py1 + (py2 - py1) * pProg;
        const pBot = py3 - (py3 - py2) * pProg;
        if (y >= pTop && y <= pBot) {
          inPlay = true;
        }
      }

      if (inPlay) {
        return [250, 204, 21, 255]; // Yellow #facc15
      }
      return [12, 10, 9, 255]; // Dark camera #0c0a09
    }

    return [badgeR, badgeG, badgeB, 255];
  }

  // Outside badge: background
  return [bgR, bgG, bgB, 255];
}

console.log('Generating PNG icons...');
const icon192 = createPNG(192, 192, (x, y, w, h) => renderMiazoomPixel(x, y, w, h, false));
fs.writeFileSync('./public/pwa-192x192.png', icon192);

const icon512 = createPNG(512, 512, (x, y, w, h) => renderMiazoomPixel(x, y, w, h, false));
fs.writeFileSync('./public/pwa-512x512.png', icon512);

const iconMaskable = createPNG(512, 512, (x, y, w, h) => renderMiazoomPixel(x, y, w, h, true));
fs.writeFileSync('./public/pwa-maskable-512x512.png', iconMaskable);

const appleIcon = createPNG(180, 180, (x, y, w, h) => renderMiazoomPixel(x, y, w, h, false));
fs.writeFileSync('./public/apple-touch-icon.png', appleIcon);

console.log('Successfully generated all PWA & Android icons!');
