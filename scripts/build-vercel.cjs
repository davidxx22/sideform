const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
// Static files are served by Vercel directly; Liquid routes use the function.
fs.mkdirSync(path.join(root, 'public', 'assets'), { recursive: true });
for (const entry of fs.readdirSync(path.join(root, 'theme', 'assets'), { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  const source = path.join(root, 'theme', 'assets', entry.name);
  const target = path.join(root, 'public', 'assets', entry.name);
  const optimized = source.replace(/\.(?:jpe?g|png)$/i, '.webp');
  if (optimized !== source && fs.existsSync(optimized)) {
    // Remove only an obsolete generated copy, never the source photograph.
    if (fs.existsSync(target) && fs.statSync(target).isFile()) fs.unlinkSync(target);
    continue;
  }
  fs.copyFileSync(source, target);
}
console.log('Prepared SIDEFORM static assets for Vercel.');
