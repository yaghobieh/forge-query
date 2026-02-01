/**
 * Package the extension for Chrome Web Store / Safari
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const OUTPUT = path.join(ROOT, 'build');

// Files to include in the package
const FILES = [
  'manifest.json',
  'devtools.html',
  'panel.html',
];

const DIRS = [
  'icons',
];

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function packageExtension() {
  // Check if dist exists
  if (!fs.existsSync(DIST)) {
    console.error('Error: dist/ folder not found. Run "npm run build" first.');
    process.exit(1);
  }

  // Clean output directory
  if (fs.existsSync(OUTPUT)) {
    fs.rmSync(OUTPUT, { recursive: true });
  }
  fs.mkdirSync(OUTPUT, { recursive: true });

  // Copy files
  for (const file of FILES) {
    const src = path.join(ROOT, file);
    const dest = path.join(OUTPUT, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`Copied: ${file}`);
    }
  }

  // Copy directories
  for (const dir of DIRS) {
    const src = path.join(ROOT, dir);
    const dest = path.join(OUTPUT, dir);
    if (fs.existsSync(src)) {
      copyDir(src, dest);
      console.log(`Copied directory: ${dir}`);
    }
  }

  // Copy dist folder
  copyDir(DIST, path.join(OUTPUT, 'dist'));
  console.log('Copied directory: dist');

  console.log('\n✓ Extension packaged successfully!');
  console.log(`Output: ${OUTPUT}`);
  console.log('\nTo install in Chrome:');
  console.log('1. Go to chrome://extensions/');
  console.log('2. Enable "Developer mode"');
  console.log('3. Click "Load unpacked"');
  console.log(`4. Select: ${OUTPUT}`);
}

packageExtension();

