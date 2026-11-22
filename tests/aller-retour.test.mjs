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

test('la version autonome se réimporte en redonnant src/ et public/', async () => {
  const { standalone } = await import('../tools/build.mjs');
  const { ROOT } = await import('../tools/lib.mjs');
  const { html } = assemble();
  const res = split(standalone(html));
  assert.deepEqual(split(html).files, res.files);
  const pub = path.join(ROOT, 'public');
  assert.deepEqual([...res.data.keys()].sort(), fs.readdirSync(pub).sort());
  for (const [name, text] of res.data) assert.equal(text, fs.readFileSync(path.join(pub, name), 'utf8'), name);
});
