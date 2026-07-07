const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function unfilter(width, height, data) {
  const bytesPerPixel = 4; // RGBA
  const rowBytes = width * bytesPerPixel;
  const unfiltered = Buffer.alloc(width * height * bytesPerPixel);

  let readOffset = 0;
  let writeOffset = 0;

  for (let y = 0; y < height; y++) {
    const filterType = data[readOffset++];
    const rowStart = readOffset;

    for (let x = 0; x < rowBytes; x++) {
      const currentByte = data[rowStart + x];
      let left = 0;
      let up = 0;
      let upLeft = 0;

      const channel = x % bytesPerPixel;
      const pixelX = Math.floor(x / bytesPerPixel);

      if (pixelX > 0) {
        left = unfiltered[writeOffset + x - bytesPerPixel];
      }
      if (y > 0) {
        up = unfiltered[writeOffset - rowBytes + x];
      }
      if (pixelX > 0 && y > 0) {
        upLeft = unfiltered[writeOffset - rowBytes + x - bytesPerPixel];
      }

      let rawVal = 0;
      if (filterType === 0) {
        rawVal = currentByte;
      } else if (filterType === 1) {
        rawVal = (currentByte + left) & 0xff;
      } else if (filterType === 2) {
        rawVal = (currentByte + up) & 0xff;
      } else if (filterType === 3) {
        rawVal = (currentByte + Math.floor((left + up) / 2)) & 0xff;
      } else if (filterType === 4) {
        rawVal = (currentByte + paethPredictor(left, up, upLeft)) & 0xff;
      }

      unfiltered[writeOffset + x] = rawVal;
    }
    readOffset += rowBytes;
    writeOffset += rowBytes;
  }
  return unfiltered;
}

function readPNG(filePath) {
  const buf = fs.readFileSync(filePath);
  let pos = 8;
  let width, height, colorType;
  let idatBuffers = [];

  while (pos < buf.length) {
    const length = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.slice(pos + 8, pos + 8 + length);
    pos += 12 + length;

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    } else if (type === 'IDAT') {
      idatBuffers.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  const idatBuf = Buffer.concat(idatBuffers);
  const inflated = zlib.inflateSync(idatBuf);
  return { width, height, colorType, inflated };
}

function writePNG(filePath, width, height, rawRGBA) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // Create IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Prepare scanlines with filter type 0 (None)
  const bytesPerPixel = 4;
  const rowBytes = width * bytesPerPixel;
  const scanlines = Buffer.alloc(height * (1 + rowBytes));
  
  for (let y = 0; y < height; y++) {
    scanlines[y * (1 + rowBytes)] = 0; // Filter type 0
    rawRGBA.copy(scanlines, y * (1 + rowBytes) + 1, y * rowBytes, (y + 1) * rowBytes);
  }

  const idatData = zlib.deflateSync(scanlines);
  const idatChunk = createChunk('IDAT', idatData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  const outBuf = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(filePath, outBuf);
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lengthBuf = Buffer.alloc(4);
  lengthBuf.writeUInt32BE(data.length, 0);
  
  // Calculate CRC
  const crc = crc32(Buffer.concat([typeBuf, data]));
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([lengthBuf, typeBuf, data, crcBuf]);
}

// Simple CRC32 implementation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function flipHorizontal(width, height, rawRGBA) {
  const bytesPerPixel = 4;
  const flipped = Buffer.alloc(width * height * bytesPerPixel);
  const rowBytes = width * bytesPerPixel;
  
  for (let y = 0; y < height; y++) {
    const rowStart = y * rowBytes;
    for (let x = 0; x < width; x++) {
      const srcIdx = rowStart + x * bytesPerPixel;
      const dstIdx = rowStart + (width - 1 - x) * bytesPerPixel;
      rawRGBA.copy(flipped, dstIdx, srcIdx, srcIdx + bytesPerPixel);
    }
  }
  return flipped;
}

function main() {
  const inputPath = path.join(__dirname, '../../public/images/tn_police_patrol.png');
  const outputPath = path.join(__dirname, '../../public/images/tn_police_patrol_forward.png');

  try {
    console.log('Reading PNG...');
    const { width, height, colorType, inflated } = readPNG(inputPath);
    if (colorType !== 6) {
      console.error('Only RGBA PNGs are supported for background removal.');
      process.exit(1);
    }

    console.log('Unfiltering scanlines...');
    let rawRGBA = unfilter(width, height, inflated);

    console.log('Running background flood fill...');
    const visited = new Uint8Array(width * height);
    const queue = [];

    // Starting points: corners
    const corners = [
      [0, 0],
      [width - 1, 0],
      [0, height - 1],
      [width - 1, height - 1]
    ];

    for (const [cx, cy] of corners) {
      const idx = cy * width + cx;
      if (!visited[idx]) {
        queue.push(idx);
        visited[idx] = 1;
      }
    }

    // Flood fill to turn near-white/gray background pixels transparent
    let count = 0;
    while (queue.length > 0) {
      const idx = queue.shift();
      const pixelOffset = idx * 4;
      const r = rawRGBA[pixelOffset];
      const g = rawRGBA[pixelOffset + 1];
      const b = rawRGBA[pixelOffset + 2];

      const isTargetBg = (r > 240 && g > 240 && b > 240) || // white background
                         (Math.abs(r - 132) < 40 && Math.abs(g - 132) < 40 && Math.abs(b - 132) < 40) || // gray border/background
                         (r > 220 && g > 220 && b > 220); // slightly off-white

      if (isTargetBg) {
        rawRGBA[pixelOffset + 3] = 0;
        count++;

        const x = idx % width;
        const y = Math.floor(idx / width);

        const neighbors = [];
        if (x > 0) neighbors.push(idx - 1);
        if (x < width - 1) neighbors.push(idx + 1);
        if (y > 0) neighbors.push(idx - width);
        if (y < height - 1) neighbors.push(idx + width);

        for (const n of neighbors) {
          if (!visited[n]) {
            visited[n] = 1;
            queue.push(n);
          }
        }
      }
    }

    console.log(`Made ${count} background pixels transparent.`);

    console.log('Erasing original wheels from image...');
    // Define wheel centers on original 1024x723 image
    const cx1 = 185, cy1 = 560, r1 = 100; // Front wheel
    const cx2 = 835, cy2 = 560, r2 = 100; // Rear wheel

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const pixelOffset = idx * 4;

        const dx1 = x - cx1;
        const dy1 = y - cy1;
        const distSq1 = dx1 * dx1 + dy1 * dy1;

        const dx2 = x - cx2;
        const dy2 = y - cy2;
        const distSq2 = dx2 * dx2 + dy2 * dy2;

        if (distSq1 < r1 * r1 || distSq2 < r2 * r2) {
          rawRGBA[pixelOffset + 3] = 0; // Make transparent
        }
      }
    }

    console.log('Flipping image horizontally...');
    rawRGBA = flipHorizontal(width, height, rawRGBA);

    console.log('Writing transparent PNG...');
    writePNG(outputPath, width, height, rawRGBA);
    console.log('Done! Output saved to public/images/tn_police_patrol_forward.png');
    process.exit(0);
  } catch (err) {
    console.error('BG removal failed:', err);
    process.exit(1);
  }
}

main();
