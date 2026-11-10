// Vérifie que src/ -> page -> src/ ne perd rien : construire puis redécouper redonne exactement les mêmes fichiers.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { assemble } from '../tools/build.mjs';
import { split } from '../tools/importer.mjs';
import { SRC, listFiles } from '../tools/lib.mjs';

test('construire puis réimporter redonne src/ à l’identique', () => {
  const { html } = assemble();
  const { files, assets } = split(html);
  const actual = new Map([...files].map(([k, v]) => [k, Buffer.from(v)]));
  for (const [k, v] of assets) actual.set('assets/' + k, v);
  const expected = listFiles(SRC).map(f => path.relative(SRC, f));
  assert.deepEqual([...actual.keys()].sort(), expected, 'mêmes noms de fichiers (un en-tête de section a peut-être changé)');
  for (const rel of expected) assert.ok(actual.get(rel).equals(fs.readFileSync(path.join(SRC, rel))), 'contenu identique : src/' + rel);
});

test('chaque fichier de src/ est utilisé par la page', () => {
  const { used } = assemble();
  const unused = listFiles(SRC).map(f => path.relative(SRC, f)).filter(r => !used.has(r));
  assert.deepEqual(unused, []);
});
