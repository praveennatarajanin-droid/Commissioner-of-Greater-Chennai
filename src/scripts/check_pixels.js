const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function readPNG(filePath) {
  const buf = fs.readFileSync(filePath);
  let pos = 8; // skip signature
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

function main() {
  const filePath = path.join(__dirname, '../../public/images/tn_police_patrol.png');
  try {
    const { width, height, colorType, inflated } = readPNG(filePath);
    console.log(`PNG Dimensions: ${width}x${height}, ColorType: ${colorType}`);
    
    // In PNG, each scanline starts with a filter byte (1 byte), followed by pixel data.
    // For RGBA (ColorType 6), each pixel is 4 bytes.
    // Let's inspect the first pixel at (0, 0)
    // Scanline 0: filter byte at index 0, pixel 0 at index 1..4 (R, G, B, A)
    const r = inflated[1];
    const g = inflated[2];
    const b = inflated[3];
    const a = inflated[4];
    console.log(`Corner Pixel (0,0) - R:${r}, G:${g}, B:${b}, A:${a}`);
    
    if (a === 0) {
      console.log('✓ The image corner is already transparent.');
    } else {
      console.log('✗ The image corner is solid (likely white background).');
    }
  } catch (err) {
    console.error('Error reading PNG:', err);
  }
}

main();
