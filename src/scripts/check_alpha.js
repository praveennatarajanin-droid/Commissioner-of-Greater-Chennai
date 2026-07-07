const fs = require('fs');
const path = require('path');

function main() {
  const filePath = path.join(__dirname, '../../public/images/tn_police_patrol.png');
  if (!fs.existsSync(filePath)) {
    console.error('File does not exist:', filePath);
    process.exit(1);
  }

  const buf = fs.readFileSync(filePath);
  // PNG signature is 89 50 4E 47 0D 0A 1A 0A
  if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4E || buf[3] !== 0x47) {
    console.error('Not a valid PNG file');
    process.exit(1);
  }

  // Search for the IDAT chunk or read pixel data to check transparency
  // Since we just want to know if it has alpha, let's look for IHDR color type (byte 25)
  // IHDR starts at byte 12 (length 13). 
  // Bytes: Width (4), Height (4), Bit depth (1), Color type (1), Compression (1), Filter (1), Interlace (1)
  const colorType = buf[25];
  console.log('PNG Color Type:', colorType);
  if (colorType === 6) {
    console.log('✓ This is an RGBA PNG (supports transparency).');
  } else {
    console.log('✗ This is not an RGBA PNG (it does not support transparency).');
  }
  process.exit(0);
}

main();
