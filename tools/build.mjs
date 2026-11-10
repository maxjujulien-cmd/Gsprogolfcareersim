#!/usr/bin/env node
// Construction : assemble src/ en une seule page dist/index.html (le format attendu par l'artifact),
// et copie à côté les gros fichiers de données de public/.
//
//   node tools/build.mjs            -> dist/
//   node tools/build.mjs autre/dir  -> autre/dir/
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SRC, INCLUDE_RE, ASSET_RE, MIME } from './lib.mjs';

export function assemble(srcDir = SRC) {
  const seen = new Set();
  const expand = (rel, stack = []) => {
    if (stack.includes(rel)) throw new Error('Inclusion circulaire : ' + [...stack, rel].join(' -> '));
    const file = path.join(srcDir, rel);
    if (!fs.existsSync(file)) throw new Error(`Fichier introuvable : src/${rel}` + (stack.length ? ` (inclus par src/${stack.at(-1)})` : ''));
    seen.add(rel);
    const text = fs.readFileSync(file, 'utf8');
    const lines = text.split('\n');
    const last = lines.pop(); // '' si le fichier finit par un saut de ligne
    let out = '';
    for (const line of lines) {
      const m = line.match(INCLUDE_RE);
      out += m ? expand(m[1], [...stack, rel]) : line + '\n';
    }
    const m = last.match(INCLUDE_RE);
    out += m ? expand(m[1], [...stack, rel]).replace(/\n$/, '') : last;
    return out;
  };
  let html = expand('index.html');
  html = html.replace(ASSET_RE, (_, name) => {
    const file = path.join(srcDir, 'assets', name);
    if (!fs.existsSync(file)) throw new Error('Image introuvable : src/assets/' + name);
    const mime = MIME[path.extname(name).toLowerCase()];
    if (!mime) throw new Error('Type d’image non reconnu : ' + name);
    seen.add('assets/' + name);
    return `data:${mime};base64,` + fs.readFileSync(file).toString('base64');
  });
  return { html, used: seen };
}

// Version autonome : chaque <script src="x.js"> de public/ est remplacé par le contenu du fichier,
// pour avoir un seul fichier HTML qui s'ouvre directement (double-clic), sans serveur ni fichiers à côté.
export function standalone(html, pubDir = path.join(ROOT, 'public')) {
  return html.replace(/<script src="([^"/]+\.js)"><\/script>/g, (all, name) => {
    const f = path.join(pubDir, name);
    return fs.existsSync(f) ? '<script>' + fs.readFileSync(f, 'utf8') + '</script>' : all;
  });
}

export const STANDALONE_NAME = 'IndoorGolfCareer.html';

export function build(outDir = path.join(ROOT, 'dist')) {
  const { html, used } = assemble();
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  const pub = path.join(ROOT, 'public');
  const copied = [];
  if (fs.existsSync(pub)) for (const f of fs.readdirSync(pub)) {
    fs.copyFileSync(path.join(pub, f), path.join(outDir, f));
    copied.push(f);
  }
  const solo = standalone(html, pub);
  fs.writeFileSync(path.join(outDir, STANDALONE_NAME), solo);
  return { outDir, bytes: Buffer.byteLength(html), soloBytes: Buffer.byteLength(solo), modules: used.size, copied };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = build(process.argv[2] ? path.resolve(process.argv[2]) : undefined);
  const dir = path.relative(ROOT, r.outDir) || '.';
  console.log(`Page pour l'artifact : ${dir}/index.html (${(r.bytes / 1e6).toFixed(2)} Mo, ${r.modules} fichiers source)`);
  if (r.copied.length) console.log('  avec à côté : ' + r.copied.join(', '));
  console.log(`Fichier autonome    : ${dir}/${STANDALONE_NAME} (${(r.soloBytes / 1e6).toFixed(2)} Mo, données incluses)`);
}
