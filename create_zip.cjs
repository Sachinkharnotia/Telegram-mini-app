const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Packaging clean production zip...');

const distDir = path.join(__dirname, 'frontend', 'dist');
const zipPath = path.join(__dirname, 'vextoral-build.zip');

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

try {
  const AdmZip = require('adm-zip');
  const zip = new AdmZip();

  function addDir(dirPath, zipFolder) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const full = path.join(dirPath, file);
      const stat = fs.statSync(full);
      const rel = zipFolder ? `${zipFolder}/${file}` : file;
      if (stat.isDirectory()) {
        addDir(full, rel);
      } else {
        zip.addFile(rel, fs.readFileSync(full));
      }
    });
  }

  addDir(distDir, '');
  zip.writeZip(zipPath);
  console.log('>>> ZIP UPDATED AT:', zipPath);
} catch (e) {
  console.error('Packaging fallback error:', e);
}
