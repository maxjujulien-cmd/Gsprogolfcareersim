/* ============ VUES ============ */
function boardRows(rows, o) {
  o = o || {};
  let h = '';
  rows.forEach(r => {
    if (r.gap) { h += '<tr class="gap"><td colspan="' + (o.cols || 4) + '">\u00b7\u00b7\u00b7</td></tr>'; return; }
    const me = r.id === 0 ? ' me' : '';
    h += '<tr class="' + (me + (r.zone ? ' ' + r.zone : '') + (r.pending ? ' pending' : '') + (r.pinned ? ' ' + pinCls(r.pinned) : '')).trim() + '">' + o.cells(r) + '</tr>';
  });
  return h;
}
/* v313 : bloc « À jouer » : pas de pointillés par ligne, une seule séparation sous le bloc */
const pinCls = p => p === 'L' ? 'pinl' : p === 'LE' ? 'pinl pinle' : p ? 'pinned' : '';
function pickRows(rows, top, around) {
  const meIdx = rows.findIndex(r => r.id === 0), keep = new Set();
  for (let i = 0; i < Math.min(top, rows.length); i++) keep.add(i);
  if (meIdx >= 0) for (let i = Math.max(0, meIdx - around); i <= Math.min(rows.length - 1, meIdx + around); i++) keep.add(i);
  const idx = Array.from(keep).sort((a, b) => a - b), out = []; let prev = -1;
  idx.forEach(i => { if (prev >= 0 && i > prev + 1) out.push({ gap: true }); out.push(rows[i]); prev = i; });
  return out;
}
/* Épingle une copie de la ligne du joueur tout en haut (juste sous l'en-tête), marquée .pinned ; la ligne d'origine reste à sa vraie position plus bas. */
function pinMe(list, rows) {
  const me = rows.find(r => r.id === 0);
  if (!me) return list;
  return [Object.assign({}, me, { pinned: true }), ...list];
}
/* Fenêtre centrée sur le joueur (ex. 20 rangs, ~10 au-dessus/en dessous) : pour suivre qui le pourchasse sans faire défiler. */
function pickAround(rows, count) {
  const meIdx = rows.findIndex(r => r.id === 0);
  if (meIdx < 0) return rows.slice(0, count);
  let start = Math.max(0, meIdx - Math.floor(count / 2));
  const end = Math.min(rows.length, start + count);
  start = Math.max(0, end - count);
  const out = [];
  if (start > 0) out.push({ gap: true });
  for (let i = start; i < end; i++) out.push(rows[i]);
  if (end < rows.length) out.push({ gap: true });
  return out;
}
/* v232 : âge et recrue à côté du nom (ordinateur seulement : sur téléphone, les noms manqueraient de place) */
const isRookie = g => !!g && g.cs === 0 && S.season > 1;
function ageTag(id) {
  if (!isPC()) return ''; const g = S.G[id]; if (!g || !g.a) return '';
  return (isRookie(g) ? '<span class="rkb" title="Recrue" aria-label="Recrue">R</span>' : '') + '<span class="agt notr">' + g.a + (LANG === 'en' ? ' yrs' : ' ans') + '</span>';
}
