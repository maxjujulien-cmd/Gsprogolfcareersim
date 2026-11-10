// Outils partagés par l'import (découpage) et la construction (assemblage).
import fs from 'node:fs';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export const SRC = path.join(ROOT, 'src');

// Directive d'inclusion : une ligne entière du gabarit, remplacée par le contenu du fichier.
export const INCLUDE_RE = /^<!-- @inclure (\S+) -->$/;
export const includeLine = (rel) => `<!-- @inclure ${rel} -->`;

// Image intégrée : {{asset:nom.ext}} devient une URI data:… en base64 à la construction.
export const ASSET_RE = /\{\{asset:([A-Za-z0-9._-]+)\}\}/g;
export const MIME = { '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.gif': 'image/gif' };
export const EXT = Object.fromEntries(Object.entries(MIME).map(([e, m]) => [m, e]));

// Enveloppe ajoutée par claude.ai à la publication d'un artifact (à retirer d'une page téléchargée).
export const WRAP_HEAD = '<!doctype html><html><head><meta charset=utf8>';
export const WRAP_TAIL = '\n</body></html>';

export function unwrap(html) {
  if (!html.startsWith(WRAP_HEAD)) return html;
  const nl = html.indexOf('\n');
  let out = html.slice(nl + 1);
  if (out.endsWith(WRAP_TAIL)) out = out.slice(0, -WRAP_TAIL.length);
  return out;
}

export function slug(title) {
  return title
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\bv\d+\b\s*:?/gi, ' ')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
    .split(/\s+/).filter(Boolean).slice(0, 5).join('-') || 'section';
}

export function listFiles(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...listFiles(p)); else out.push(p);
  }
  return out.sort();
}
