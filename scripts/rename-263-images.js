/**
 * Script to rename lesson 263 images from numbered format to word names
 * Run: node scripts/rename-263-images.js
 */

const fs = require('fs');
const path = require('path');

// Mapping from current numbered files to word names
const imageMapping = [
  { from: '263(1).jpg', to: '263/vote.jpg' },
  { from: '263(2).jpg', to: '263/prison.jpg' },
  { from: '263(3).jpg', to: '263/politician.jpg' },
  { from: '263(4).jpg', to: '263/marry.jpg' },
  { from: '263(5).jpg', to: '263/permission.jpg' },
  { from: '263(6).jpg', to: '263/couple.jpg' },
  { from: '263(7).jpg', to: '263/military.jpg' },
  { from: '263(8).jpg', to: '263/army.jpg' },
  { from: '263(9).jpg', to: '263/professional.jpg' },
  { from: '263(10).jpg', to: '263/responsible.jpg' },
  { from: '263(11).jpg', to: '263/crime.jpg' },
  { from: '263(12).jpg', to: '263/commit.jpg' },
  { from: '263(13).jpg', to: '263/graffiti.jpg' },
  { from: '263(14).jpg', to: '263/steal.jpg' },
  { from: '263(15).jpg', to: '263/murder.jpg' },
  { from: '263(16).jpg', to: '263/criminal.jpg' },
  { from: '263(17).jpg', to: '263/illegal.jpg' },
  { from: '263(18).jpg', to: '263/alcohol.jpg' },
  { from: '263(19).jpg', to: '263/strict.jpg' },
  { from: '263(20).jpg', to: '263/banned.jpg' },
  { from: '263(21).jpg', to: '263/bar.jpg' },
  { from: '263(22).jpg', to: '263/nightclub.jpg' },
  { from: '263(23).jpg', to: '263/drive.jpg' },
  { from: '263(24).jpg', to: '263/law.jpg' },
  { from: '263(25).jpg', to: '263/politics.jpg' }
];

const imagesDir = path.join(__dirname, '..', 'images');
const targetDir = path.join(imagesDir, '263');

// Create 263 subdirectory if doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log('Created directory:', targetDir);
}

let renamed = 0;
let errors = 0;

imageMapping.forEach(({ from, to }) => {
  const sourcePath = path.join(imagesDir, from);
  const targetPath = path.join(imagesDir, to);
  
  try {
    if (fs.existsSync(sourcePath)) {
      fs.renameSync(sourcePath, targetPath);
      console.log(`✓ Renamed: ${from} → ${to}`);
      renamed++;
    } else {
      console.log(`⚠ File not found: ${from}`);
    }
  } catch (err) {
    console.error(`✗ Error renaming ${from}:`, err.message);
    errors++;
  }
});

console.log(`\nSummary: ${renamed} renamed, ${errors} errors`);
