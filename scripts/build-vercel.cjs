const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
// Static files are served by Vercel directly; Liquid routes use the function.
fs.mkdirSync(path.join(root, 'public', 'assets'), { recursive: true });
fs.cpSync(path.join(root, 'theme', 'assets'), path.join(root, 'public', 'assets'), { recursive: true });
console.log('Prepared SIDEFORM static assets for Vercel.');
