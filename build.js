'use strict';

const fs             = require('fs');
const path           = require('path');
const { minify }     = require('terser');
const CleanCSS       = require('clean-css');

const DIST = 'dist';

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'js'),  { recursive: true });
fs.mkdirSync(path.join(DIST, 'css'), { recursive: true });
fs.mkdirSync(path.join(DIST, 'img'), { recursive: true });

for (const f of fs.readdirSync('img')) {
  fs.copyFileSync(path.join('img', f), path.join(DIST, 'img', f));
}

async function build() {
  // ── CSS ──────────────────────────────────────────────────────
  const cssResult = new CleanCSS({ level: 2 }).minify(
    fs.readFileSync('css/styles.css', 'utf8')
  );
  if (cssResult.errors.length) throw new Error(cssResult.errors.join('\n'));
  fs.writeFileSync(path.join(DIST, 'css', 'styles.css'), cssResult.styles);

  // ── JS bundle ────────────────────────────────────────────────
  // Derive file order from the script tags in index.html so the
  // bundle always matches what the browser would have loaded.
  const html      = fs.readFileSync('index.html', 'utf8');
  const scriptRe  = /<script\s+src="(js\/[^"]+)"/g;
  const jsFiles   = [];
  let m;
  while ((m = scriptRe.exec(html)) !== null) jsFiles.push(m[1]);

  const combined  = jsFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');
  const jsResult  = await minify(combined, {
    compress: true,
    mangle:   { toplevel: false },
  });
  fs.writeFileSync(path.join(DIST, 'js', 'app.js'), jsResult.code);

  // ── index.html — replace individual <script> tags with bundle ─
  const firstTag  = html.indexOf(`<script src="${jsFiles[0]}"`);
  const lastTag   = html.lastIndexOf('<script src="js/');
  const lastEnd   = html.indexOf('</script>', lastTag) + '</script>'.length;
  const distHtml  = html.slice(0, firstTag)
                  + '<script src="js/app.js"></script>'
                  + html.slice(lastEnd);
  fs.writeFileSync(path.join(DIST, 'index.html'), distHtml);

  console.log(`Bundled ${jsFiles.length} JS files → js/app.js`);
  console.log('Build complete →', DIST);
}

build().catch(err => { console.error(err); process.exit(1); });
