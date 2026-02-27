const fs = require('fs');
const path = require('path');

// Source: node_modules/prismjs
const prismSrc = path.join(__dirname, '..', 'node_modules', 'prismjs');

// Destination: public/prism
const prismDest = path.join(__dirname, '..', 'public', 'prism');

// Create destination directory
if (!fs.existsSync(prismDest)) {
  fs.mkdirSync(prismDest, { recursive: true });
}

// Copy core Prism.js files
const filesToCopy = [
  { src: 'prism.js', dest: 'prism.js' },
  { src: 'components/prism-typescript.min.js', dest: 'prism-typescript.min.js' },
  { src: 'components/prism-css.min.js', dest: 'prism-css.min.js' },
  { src: 'components/prism-scss.min.js', dest: 'prism-scss.min.js' },
  { src: 'themes/prism-dark.min.css', dest: 'prism-dark.min.css' },
];

// Copy each file
filesToCopy.forEach((file) => {
  const srcPath = path.join(prismSrc, file.src);
  const destPath = path.join(prismDest, file.dest);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied: ${file.src} → ${file.dest}`);
  } else {
    console.warn(`Warning: File not found: ${srcPath}`);
  }
});

console.log('\nPrism.js files copied to public/prism/');
