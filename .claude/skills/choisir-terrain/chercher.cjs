#!/usr/bin/env node
/* Choisir un terrain : retrouve dans la liste du jeu (public/terrains-data.js) les terrains
   d'une liste collée par Max, un nom par ligne, et affiche leurs données utiles.

   Utilisation :
     node .claude/skills/choisir-terrain/chercher.cjs liste.txt
     node .claude/skills/choisir-terrain/chercher.cjs liste.txt --sgt   (ajoute la difficulté et le concepteur GSPro de Simulator Golf Tour)

   Le fichier peut contenir des puces, des numéros ou du texte autour : seules les lignes non vides comptent. */
'use strict';
const fs = require('fs');
const path = require('path');

const RACINE = path.resolve(__dirname, '..', '..', '..');
const args = process.argv.slice(2);
const avecSgt = args.includes('--sgt');
const fichier = args.find(a => !a.startsWith('--'));
const texte = fichier ? fs.readFileSync(fichier, 'utf8') : fs.readFileSync(0, 'utf8');

const src = fs.readFileSync(path.join(RACINE, 'public', 'terrains-data.js'), 'utf8');
const LISTE = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1)).courses;

const norm = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
const MOTS_VIDES = new Set(['golf', 'club', 'course', 'country', 'the', 'cc', 'gc', 'and', 'links', 'resort', 'de', 'du', 'la', 'le']);
const mots = s => norm(s).split(' ').filter(w => w && !MOTS_VIDES.has(w));

const FREQ = new Map();
for (const t of LISTE) for (const w of new Set(mots(t.name))) FREQ.set(w, (FREQ.get(w) || 0) + 1);
const rare = w => w.length >= 4 && (FREQ.get(w) || 0) <= 15;

function trouver(nom) {
  const n = norm(nom);
  let c = LISTE.filter(t => norm(t.name) === n);
  if (c.length) return { sur: 'exact', c };
  const assezLong = s => s.length >= 8 && s.includes(' ');
  c = LISTE.filter(t => { const tn = norm(t.name); return (assezLong(n) && tn.includes(n)) || (assezLong(tn) && n.includes(tn)); });
  if (c.length) return { sur: 'proche', c: c.slice(0, 4) };
  const m = mots(nom);
  if (!m.length) return { sur: 'aucun', c: [] };
  const notes = LISTE.map(t => {
    const mt = new Set(mots(t.name));
    const communs = m.filter(w => mt.has(w));
    return { t, s: communs.length / Math.max(m.length, mt.size), r: communs.some(rare) };
  }).filter(x => x.r && x.s >= 0.4).sort((a, b) => b.s - a.s);
  return notes.length ? { sur: 'devine', c: notes.slice(0, 3).map(x => x.t) } : { sur: 'aucun', c: [] };
}

let SGT = null;
async function chargerSgt() {
  try {
    const r = await fetch('https://simulatorgolftour.com/courses/');
    const h = await r.text();
    const m = h.match(/<script id='courses-data' type='application\/json'>([\s\S]*?)<\/script>/);
    const d = JSON.parse(m[1]);
    SGT = new Map();
    for (const c of d.courses || d) SGT.set(norm(c[1]), { lieu: c[2], diff: c[4], concepteur: c[9], maj: c[8] });
  } catch (e) { console.log('(Simulator Golf Tour inaccessible : ' + e.message + ')'); }
}

function decrire(t) {
  const pars = t.pars || [];
  const nb = p => pars.filter(x => x === p).length;
  const par = pars.reduce((a, b) => a + b, 0);
  const tees = (t.tees || []).slice().sort((a, b) => b.yardage - a.yardage)
    .map(e => `${e.tee} ${e.yardage} v (${e.cr}/${e.slope})`).join(' · ');
  const g = t.geo ? `${t.geo.pl || '?'}, ${t.geo.cc || '?'}` : 'sans position (souvent un terrain fictif)';
  const yt = 'https://www.youtube.com/results?search_query=' + encodeURIComponent('GSPro ' + t.name);
  let l = `  ${t.name}\n    Aperçu : ${yt}\n    Par ${par} (${nb(3)} par 3, ${nb(4)} par 4, ${nb(5)} par 5) · ${g}\n    Tees : ${tees}`;
  if (SGT) {
    const s = SGT.get(norm(t.name));
    if (s) l += `\n    SGT : ${s.lieu} · difficulté ${s.diff == null ? '?' : (+s.diff).toFixed(1)} · concepteur GSPro ${s.concepteur || '?'} · version du ${s.maj}`;
    else l += '\n    SGT : pas trouvé sous ce nom';
  }
  return l;
}

(async () => {
  if (avecSgt) await chargerSgt();
  const noms = texte.split(/\r?\n/).map(s => s.replace(/^\s*([-*•·]|\d+[.)]|\d+\s*[-:])\s*/, '').trim()).filter(Boolean);
  for (const nom of noms) {
    const r = trouver(nom);
    const etiquette = { exact: '', proche: ' (nom proche)', devine: ' (deviné, à vérifier)', aucun: ' : PAS TROUVÉ dans la liste du jeu' }[r.sur];
    console.log(`\n■ ${nom}${etiquette}`);
    for (const t of r.c) console.log(decrire(t));
  }
})();
