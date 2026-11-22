/* ============ PARTIE DUO : tournois d'une ronde et vraie bourse (tirelire) ============
   S.duo = { min, max : gain du gagnant en L1 (en $ réels) selon la bourse du tournoi ; lm : % de ce montant par ligue ;
   low : plus petit montant versé dans la ligne de paye ; log : gains par tournoi ; paid : sommes remises }. */
const DUO_DEF = { min: 10, max: 20, lm: [100, 50, 25, 10], low: 0.25, hc: 4 };
function newDuo() { return Object.assign({ v: 4, log: [], paid: [] }, clone(DUO_DEF)); }
/* Handicap d'\u00e9quipe : coups ajout\u00e9s \u00e0 votre score, un par trou en commen\u00e7ant par les trous d'index 1, 2, 3\u2026 */
function duoStrokes(idx) { const n = (S && S.duo && S.duo.hc) || 0; return Math.floor(n / 18) + ((idx || 99) <= n % 18 ? 1 : 0); }
/* Part du gain du gagnant selon la position : le top 10 touche au moins le tiers du gagnant, puis ça descend en douceur jusqu'au 65e. */
/* Barème de Max (exemple avec un gagnant à 20 $) : 20, 12, 10, 8, 6 ; 6e-10e 4 ; 11e-20e 2,75 ; 21e-35e 2 ; 36e-50e 1 ; 51e-65e et égalités 0,50. */
const DUO_TOP5 = [1, 0.6, 0.5, 0.4, 0.3];
function duoShare(k) { return k <= 5 ? DUO_TOP5[k - 1] : k <= 10 ? 0.2 : k <= 20 ? 0.1375 : k <= 35 ? 0.1 : k <= 50 ? 0.05 : 0.025; }
function duoMigrate() {
  if (!S || !S.duo || (S.duo.v || 1) >= 4) return;
  if ((S.duo.v || 1) < 3 && ((S.duo.min === 5 && S.duo.max === 10) || (S.duo.min === 10 && S.duo.max === 15))) { S.duo.min = 10; S.duo.max = 20; }
  if (S.duo.hc == null) S.duo.hc = 4;
  S.duo.v = 4;
}
const cash = v => Math.round(v * 20) / 20;   // au 5 cents
function fmtCash(v) { const x = (Math.round((v || 0) * 100) / 100).toFixed(2); return LANG === 'en' ? '$' + x : x.replace('.', ',') + ' $'; }
function duoWinAmt(purse, l) { const D = S.duo, f = clamp(((purse || (PURSE_RANGE[0] + PURSE_RANGE[1]) / 2) - PURSE_RANGE[0]) / Math.max(1, PURSE_RANGE[1] - PURSE_RANGE[0]), 0, 1); return cash((D.min + (D.max - D.min) * f) * ((D.lm[l] == null ? 100 : D.lm[l]) / 100)); }
function duoAmtFor(rows, cut, purse, l, id) {
  const r = rows.find(x => x[0] === id); if (!r || r[1] < 1 || (cut != null && r[2] > cut)) return 0;
  const n = rows.filter(x => x[1] === r[1]).length, share = avg(range(r[1], r[1] + n - 1).map(duoShare));
  const win = duoWinAmt(purse, l); return win ? Math.max(S.duo.low || 0, cash(win * share)) : 0;
}
function duoRecord(res, c, l) {
  const r = res.rows.find(x => x[0] === 0); if (!r) return null;
  const amt = duoAmtFor(res.rows, res.cut, c.purse, l, 0), tie = res.rows.filter(x => x[1] === r[1]).length > 1;
  const e = { s: S.season, t: S.t, n: c.name, l, pos: r[1], tie, amt, win: duoWinAmt(c.purse, l) };
  S.duo.log.push(e); return e;
}
/* Gain estimé en direct (classement de la ronde en cours) : position actuelle, égalités partagées, ligne de paye actuelle. */
let DUO_LIVE = '';
function duoLiveEst(rows) {
  const c = S.cur, me = rows.find(r => r.id === 0); if (!c || !me) return null;
  const cut = cutScoreOf(rows.map(r => r.tot), S.settings.cut); if (me.tot > cut) return { amt: 0, out: true };
  const n = rows.filter(r => r.pos === me.pos).length, win = duoWinAmt(c.purse, c.pl);
  return { amt: Math.max(S.duo.low || 0, cash(win * avg(range(me.pos, me.pos + n - 1).map(duoShare)))), out: false };
}
/* Gains en direct de tout le classement : { pos -> montant } (0 au-del\u00e0 de la ligne de paye actuelle) */
function duoLiveMap(rows) {
  const c = S.cur, cut = cutScoreOf(rows.map(r => r.tot), S.settings.cut), win = duoWinAmt(c.purse, c.pl), cnt = {}, m = {};
  rows.forEach(r => { cnt[r.pos] = (cnt[r.pos] || 0) + 1; });
  Object.keys(cnt).forEach(p => { p = +p; m[p] = Math.max(S.duo.low || 0, cash(win * avg(range(p, p + cnt[p] - 1).map(duoShare)))); });
  return { cut, m, amt: r => r.tot > cut ? 0 : m[r.pos] || 0 };
}
function duoPurseTotal(win) { return cash(range(1, S.settings.cut).reduce((a, k) => a + Math.max(S.duo.low || 0, cash(win * duoShare(k))), 0)); }
function duoPurseStrip() { const c = S.cur, win = duoWinAmt(c.purse, c.pl); return '<div class="duostrip sans"><span>Bourse totale <b>' + fmtCash(duoPurseTotal(win)) + '</b></span><span>1er : <b>' + fmtCash(win) + '</b> \u00b7 ' + S.settings.cut + ' pay\u00e9s</span></div>'; }
function duoLiveTag(e) { return !e ? '' : '<span class="duoest' + (e.out ? ' out' : '') + '" title="' + (e.out ? 'Hors de la ligne de paye pour l\u2019instant' : 'Gain estim\u00e9 selon ta position actuelle') + '">' + (e.out ? '0\u00a0$' : '\ud83d\udcb0 ' + fmtCash(e.amt)) + '</span>'; }
function duoTotals() { const D = S.duo, e = D.log.reduce((a, x) => a + x.amt, 0), p = D.paid.reduce((a, x) => a + x.amt, 0); return { earned: cash(e), paid: cash(p), due: cash(e - p) }; }
function duoBlock(full) {
  const D = S.duo, T = duoTotals(), last = D.log.slice(-(full ? 30 : 5)).reverse();
  let h = '<div class="block duo"><h3 style="margin-top:0">🐷 Tirelire</h3><div class="mgrid">' + tile(fmtCash(T.due), 'à remettre') + tile(fmtCash(T.earned), 'gagné au total') + tile(fmtCash(T.paid), 'déjà remis') + '</div>';
  if (T.due > 0) h += '<button class="btn" data-a="duopay" style="margin-top:10px">C’est payé (' + fmtCash(T.due) + ')</button>';
  if (last.length) h += '<table class="plain" style="margin-top:10px"><tr><th>Tournoi</th><th class="r">Pos</th><th class="r">Gain</th></tr>' + last.map(x => '<tr><td>' + esc(x.n) + ' <span class="mute small">S' + yr(x.s) + ' · L' + (x.l + 1) + '</span></td><td class="r">' + (x.tie ? 'T' : '') + x.pos + '</td><td class="r">' + (x.amt ? '<b>' + fmtCash(x.amt) + '</b>' : '<span class="mute">–</span>') + '</td></tr>').join('') + '</table>';
  else h += '<p class="small mute" style="margin:8px 0 0">Les gains s’ajoutent ici après chaque tournoi.</p>';
  if (D.paid.length) h += '<p class="small mute" style="margin:8px 0 0">Dernier paiement : ' + fmtCash(D.paid[D.paid.length - 1].amt) + ' le ' + esc(D.paid[D.paid.length - 1].d) + ' · <a href="#" data-a="duounpay">annuler</a></p>';
  h += '<details style="border-top:none;padding-top:4px"><summary style="font-size:16px;color:var(--acc)">Régler la bourse</summary>' +
    '<div class="row"><div><label for="duo-min">Gagnant L1, petit tournoi ($)</label><input type="number" id="duo-min" data-c="duo" data-k="min" min="0" step="0.5" value="' + D.min + '"></div><div><label for="duo-max">Gagnant L1, gros tournoi ($)</label><input type="number" id="duo-max" data-c="duo" data-k="max" min="0" step="0.5" value="' + D.max + '"></div></div>' +
    '<div class="row">' + [1, 2, 3].map(l => '<div><label for="duo-lm' + l + '">L' + (l + 1) + ' (% de la L1)</label><input type="number" id="duo-lm' + l + '" data-c="duo" data-k="lm" data-i="' + l + '" min="0" max="100" step="5" value="' + D.lm[l] + '"></div>').join('') + '</div>' +
    '<label for="duo-hc">Handicap d\u2019\u00e9quipe (coups ajout\u00e9s \u00e0 votre score)</label><input type="number" id="duo-hc" data-c="duo" data-k="hc" min="0" max="36" step="1" value="' + (D.hc || 0) + '">' +
    '<p class="small mute" style="margin:2px 0 6px">Un coup par trou, en commen\u00e7ant par les trous les plus difficiles (index 1, 2, 3\u2026). Votre score affich\u00e9 l\u2019inclut. Avec +4 et vos scores habituels : environ 1 victoire sur 10.</p>' +
    '<label for="duo-low">Montant minimum dans le top 65 ($)</label><input type="number" id="duo-low" data-c="duo" data-k="low" min="0" step="0.05" value="' + D.low + '">' +
    '<p class="small mute">Les 65 premiers (et les égalités) sont payés, selon leur position, en proportion du gagnant. Exemple avec 20 $ : 2e 12 $, 3e 10 $, 4e 8 $, 5e 6 $, 6e à 10e 4 $, 11e à 20e 2,75 $, 21e à 35e 2 $, 36e à 50e 1 $, 51e à 65e (et égalités) 0,50 $. Les égalités se partagent les places. Montants arrondis au 5 cents.</p></details></div>';
  return h;
}
/* Résumé d'un tournoi d'une ronde (vu par le joueur) */
function buildRecap1(res, c) {
  const rows = res.rows, w = rows[0], parts = [];
  const second = rows.find(r => r[1] > 1);
  let s = (w[0] === 0 ? 'Tu remportes' : nameOf(w[0]) + ' remporte') + ' le tournoi à ' + fmt(w[2]);
  if (res.playoff) s += ', après une prolongation.';
  else if (second) { const gap = second[2] - w[2]; s += gap === 1 ? ', à un coup du deuxième.' : ', avec ' + gap + ' coups d’avance.'; }
  else s += '.';
  parts.push(s);
  const me = rows.find(r => r[0] === 0);
  if (me && me[1] !== 1) parts.push(me[2] <= res.cut ? 'Tu termines ' + (rows.filter(r => r[1] === me[1]).length > 1 ? 'T' : '') + me[1] + ' à ' + fmt(me[2]) + ' et rapportes ' + me[4] + ' points.' : 'Tu termines ' + ord(me[1]) + ' à ' + fmt(me[2]) + ', hors de la ligne de paye (top ' + S.settings.cut + ' à ' + fmt(res.cut) + ').');
  else if (me) parts.push('Tu empoches ' + me[4] + ' points.');
  return parts.join(' ');
}

