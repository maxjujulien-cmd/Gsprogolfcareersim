#!/usr/bin/env node
// Import : découpe une page complète de l'application (un seul gros fichier HTML) en modules dans src/.
// C'est l'inverse exact de tools/build.mjs : construire le résultat redonne la page octet pour octet.
//
//   node tools/importer.mjs page.html [ootp-names.js ...] [--remplacer]
//
// Utile si une nouvelle version de la page a été produite ailleurs (par exemple dans le chat claude.ai) :
// on la réimporte, puis `git diff` montre exactement ce qui a changé, module par module.
// Les fichiers .js donnés après la page sont copiés dans public/ (données publiées à côté de la page).
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SRC, includeLine, unwrap, slug, EXT } from './lib.mjs';

const MIN_SECTION = 15;          // une section plus courte (ex. un simple commentaire) est fusionnée à la suivante
const MIN_ASSET_B64 = 2000;      // les images intégrées plus petites restent dans le code

const HEADER_RE = /^\/\*\s*=+/;   // « /* ============ TITRE ============ »

function headerTitle(lines, i) {
  const own = lines[i].replace(/^\/\*\s*=+/, '').replace(/=+\s*(\*\/)?\s*$/, '').trim();
  if (own) return own;
  for (let j = i + 1; j < Math.min(lines.length, i + 4); j++) {
    const t = lines[j].replace(/^\s*\*?/, '').replace(/=+\s*(\*\/)?\s*$/, '').trim();
    if (t) return t;
  }
  return 'section';
}

// Découpe des lignes de code aux en-têtes de section.
function sections(lines) {
  const starts = [];
  lines.forEach((l, i) => { if (HEADER_RE.test(l)) starts.push(i); });
  if (!starts.length || starts[0] !== 0) starts.unshift(0);
  let parts = starts.map((s, k) => ({ start: s, end: k + 1 < starts.length ? starts[k + 1] : lines.length }));
  const merged = [];
  for (let k = 0; k < parts.length; k++) {
    const p = { ...parts[k] };
    while (p.end - p.start < MIN_SECTION && k + 1 < parts.length) p.end = parts[++k].end;
    merged.push(p);
  }
  return merged.map((p, k) => {
    const title = HEADER_RE.test(lines[p.start]) ? headerTitle(lines, p.start) : 'base';
    // Après fusion, nommer d'après la section qui porte le vrai contenu (la dernière en-tête du bloc).
    let named = p.start;
    for (let i = p.start; i < p.end; i++) if (HEADER_RE.test(lines[i]) && i - p.start < MIN_SECTION) named = i;
    const t = HEADER_RE.test(lines[named]) ? headerTitle(lines, named) : title;
    return { name: String(k + 1).padStart(2, '0') + '-' + slug(t), lines: lines.slice(p.start, p.end) };
  });
}

function findLine(lines, pred, from = 0, what = '') {
  for (let i = from; i < lines.length; i++) if (pred(lines[i])) return i;
  throw new Error('Structure inattendue : ' + what + ' introuvable');
}
function findLastLine(lines, pred, what = '') {
  for (let i = lines.length - 1; i >= 0; i--) if (pred(lines[i])) return i;
  throw new Error('Structure inattendue : ' + what + ' introuvable');
}

export function split(html) {
  html = unwrap(html);
  const lines = html.split('\n');
  const files = new Map(); // chemin relatif dans src/ -> contenu texte
  const tpl = [];
  const put = (rel, ls) => { files.set(rel, ls.join('\n') + '\n'); tpl.push(includeLine(rel)); };

  const styleOpen = findLine(lines, l => l === '<style>', 0, '<style>');
  const styleClose = findLine(lines, l => l === '</style>', styleOpen, '</style>');
  const monde = findLine(lines, l => /^<script>\S/.test(l), styleClose, 'le script de la carte du monde');
  const mondeClose = findLine(lines, l => l.startsWith('</script>'), monde + 1, 'la fin du script de la carte');
  const mainOpen = findLastLine(lines, l => l === '<script>', 'le script principal');
  const mainClose = findLastLine(lines, l => l === '</script>', 'la fin du script principal');
  if (!(styleOpen < styleClose && styleClose < monde && monde < mondeClose && mondeClose < mainOpen && mainOpen < mainClose))
    throw new Error('Structure inattendue : blocs dans un ordre imprévu');

  // 1. En-tête HTML
  tpl.push(...lines.slice(0, styleOpen + 1));
  // 2. Styles
  for (const s of sections(lines.slice(styleOpen + 1, styleClose))) put(`styles/${s.name}.css`, s.lines);
  // 3. Corps HTML jusqu'au script de la carte
  tpl.push(...lines.slice(styleClose, monde + 1));
  // 4. Carte du monde : bibliothèques d3 puis données géographiques (window.CG_…)
  const mondeLines = lines.slice(monde + 1, mondeClose);
  const dataAt = mondeLines.findIndex(l => l.startsWith('window.CG_'));
  if (dataAt <= 0) put('vendor/carte-monde.js', mondeLines);
  else { put('vendor/d3-geo.js', mondeLines.slice(0, dataAt)); put('data/carte-monde.js', mondeLines.slice(dataAt)); }
  // 5. Entre les scripts
  tpl.push(...lines.slice(mondeClose, mainOpen + 1));
  // 6. Script principal, une section par fichier
  for (const s of sections(lines.slice(mainOpen + 1, mainClose))) put(`js/${s.name}.js`, s.lines);
  // 7. Fin
  tpl.push(...lines.slice(mainClose));
  files.set('index.html', tpl.join('\n'));

  // Images intégrées en base64 -> src/assets/
  const assets = new Map();
  const used = new Set();
  const nameFor = (before, mime) => {
    let base = 'image';
    let m;
    if (/rel="icon"[^>]*$/.test(before)) base = 'favicon';
    else if (/id="splash"[^<]*<img[^>]*$/.test(before)) base = 'splash';
    else if ((m = before.match(/([A-Za-z_$][\w$]*)\s*=\s*['"]$/))) base = slug(m[1].replace(/_/g, ' '));
    let n = base + EXT[mime], k = 2;
    while (used.has(n)) n = `${base}-${k++}${EXT[mime]}`;
    used.add(n);
    return n;
  };
  for (const [rel, text] of files) {
    const out = text.replace(/data:(image\/[a-z+]+);base64,([A-Za-z0-9+/=]+)/g, (all, mime, b64, off) => {
      if (b64.length < MIN_ASSET_B64 || !EXT[mime]) return all;
      const buf = Buffer.from(b64, 'base64');
      if (buf.toString('base64') !== b64) return all; // encodage non canonique : on n'y touche pas
      const name = nameFor(text.slice(Math.max(0, off - 200), off), mime);
      assets.set(name, buf);
      return `{{asset:${name}}}`;
    });
    files.set(rel, out);
  }
  if (/\{\{asset:/.test(html)) throw new Error('La page contient déjà « {{asset: » : le découpage ne serait pas réversible');
  return { files, assets };
}

export function writeSrc({ files, assets }, dir = SRC) {
  fs.rmSync(dir, { recursive: true, force: true });
  for (const [rel, text] of files) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), text);
  }
  fs.mkdirSync(path.join(dir, 'assets'), { recursive: true });
  for (const [name, buf] of assets) fs.writeFileSync(path.join(dir, 'assets', name), buf);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const force = args.includes('--remplacer');
  const [page, ...extra] = args.filter(a => a !== '--remplacer');
  if (!page) { console.error('Usage : node tools/importer.mjs page.html [donnees.js ...] [--remplacer]'); process.exit(1); }
  if (fs.existsSync(SRC) && !force) {
    console.error('src/ existe déjà. Ajoute --remplacer pour l’écraser (fais d’abord un commit : git montrera la différence).');
    process.exit(1);
  }
  const res = split(fs.readFileSync(page, 'utf8'));
  writeSrc(res);
  for (const f of extra) {
    fs.mkdirSync(path.join(ROOT, 'public'), { recursive: true });
    fs.copyFileSync(f, path.join(ROOT, 'public', path.basename(f)));
  }
  console.log(`Importé : ${res.files.size} fichiers de code et ${res.assets.size} images dans src/` + (extra.length ? `, ${extra.length} fichiers de données dans public/` : ''));
}
