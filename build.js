'use strict';

const fs      = require('fs');
const path    = require('path');
const { minify } = require('terser');
const CleanCSS   = require('clean-css');

const DIST = 'dist';

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'js'),  { recursive: true });
fs.mkdirSync(path.join(DIST, 'css'), { recursive: true });
fs.mkdirSync(path.join(DIST, 'img'), { recursive: true });

for (const f of fs.readdirSync('img')) {
  fs.copyFileSync(path.join('img', f), path.join(DIST, 'img', f));
}

fs.copyFileSync('index.html', path.join(DIST, 'index.html'));

async function build() {
  const cssResult = new CleanCSS({ level: 2 }).minify(
    fs.readFileSync('css/styles.css', 'utf8')
  );
  if (cssResult.errors.length) throw new Error(cssResult.errors.join('\n'));
  fs.writeFileSync(path.join(DIST, 'css', 'styles.css'), cssResult.styles);

  const jsFiles = fs.readdirSync('js').filter(f => f.endsWith('.js'));
  for (const file of jsFiles) {
    const code   = fs.readFileSync(path.join('js', file), 'utf8');
    const result = await minify(code, {
      compress: true,
      mangle:   { toplevel: false },
    });
    fs.writeFileSync(path.join(DIST, 'js', file), result.code);
  }

  console.log('Build complete →', DIST);
}

build().catch(err => { console.error(err); process.exit(1); });
