/**
 * Generate PNG icons from SVG for the browser extension
 * Uses sharp if available, otherwise creates placeholder icons
 */

const fs = require('fs');
const path = require('path');

const SIZES = [16, 48, 128];
const SVG_PATH = path.join(__dirname, '../icons/icon.svg');
const ICONS_DIR = path.join(__dirname, '../icons');

async function generateIcons() {
  // Check if sharp is available
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.log('Sharp not available, creating placeholder icons...');
    createPlaceholderIcons();
    return;
  }

  const svgBuffer = fs.readFileSync(SVG_PATH);

  for (const size of SIZES) {
    const outputPath = path.join(ICONS_DIR, `icon-${size}.png`);
    
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`Generated: icon-${size}.png`);
  }

  console.log('All icons generated successfully!');
}

function createPlaceholderIcons() {
  // Create simple PNG placeholders (1x1 pink pixel, will work for loading)
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // bit depth, color type, etc
    0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00, // compressed data (pink)
    0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x05, 0xfe,
    0xd4, 0xef, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, // IEND chunk
    0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
  ]);

  for (const size of SIZES) {
    const outputPath = path.join(ICONS_DIR, `icon-${size}.png`);
    fs.writeFileSync(outputPath, pngHeader);
    console.log(`Created placeholder: icon-${size}.png`);
  }

  console.log('Placeholder icons created. Install sharp for proper icon generation.');
}

generateIcons().catch(console.error);

