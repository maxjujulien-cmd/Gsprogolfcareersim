/* ============ RÉSUMÉS DE TOURNOI (les quatre ligues) + JOURNAL ============
   Un résumé = { head, sub, st[], rc[], fa[] }. Les textes contiennent des jetons {id} : ils sont rendus
   en liens vers le profil du golfeur. Les résumés des tournois déjà joués sont reconstitués à la demande
   à partir des résultats conservés (sans le classement d'avant-tournoi : résumé « partiel »). */
const SI = {
  trophy: '<path d="M5 2.5h6v4a3 3 0 0 1-6 0zM5 4H2.8v.8A2.2 2.2 0 0 0 5 7M11 4h2.2v.8A2.2 2.2 0 0 1 11 7M8 9.5V12M5.5 13.5h5"/>',
  flag: '<path d="M4 14V2.5M4 3h8l-2 3 2 3H4"/>',
  alert: '<path d="M8 2.2L14.4 13H1.6zM8 6.5v3M8 11.3v.2"/>',
  target: '<circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="2.3"/>',
  up: '<path d="M2 11.5l4-4 2.5 2.5L14 4.5M10.5 4H14v3.5"/>',
  swap: '<path d="M5 13V3M2.5 5.5L5 3l2.5 2.5M11 3v10M8.5 10.5L11 13l2.5-2.5"/>',
  star: '<path d="M8 2l1.8 3.7 4 .6-2.9 2.8.7 4L8 11.3 4.4 13.1l.7-4L2.2 6.3l4-.6z"/>',
  cut: '<circle cx="4.2" cy="12" r="1.9"/><circle cx="11.8" cy="12" r="1.9"/><path d="M5.4 10.4L11.5 2.5M10.6 10.4L4.5 2.5"/>',
  user: '<circle cx="8" cy="5.2" r="2.7"/><path d="M2.8 14a5.2 5.2 0 0 1 10.4 0"/>',
  cal: '<rect x="2.5" y="3.5" width="11" height="10" rx="1.5"/><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3"/>',
  down: '<path d="M2 4.5l4 4 2.5-2.5L14 11.5M10.5 12H14V8.5"/>',
  arrowup: '<path d="M8 13V3M4 7l4-4 4 4"/>',
  arrowdown: '<path d="M8 3v10M4 9l4 4 4-4"/>',
  door: '<path d="M6 2.5H3.5v11H6M10 5l3 3-3 3M13 8H6.5"/>'
};
const ico = n => '<svg class="si" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (SI[n] || SI.flag) + '</svg>';
const tk = id => '{' + id + '}';
const rkTxt = (pos, tie) => tie ? 'T' + pos : ord(pos);
const ptsWord = n => n + ' point' + (n > 1 ? 's' : '');
const plural = (n, w) => n + ' ' + w + (n > 1 ? 's' : '');
function listT(ids) { const a = ids.map(tk); return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' et ' + a[a.length - 1]; }

function buildSummary(o) {
  const rows = o.rows, l = o.l, pre = o.pre, post = o.post, live = !!(pre && post && o.tIdx >= 1);
  const W = rows[0], wid = W[0], wt = W[2] + W[3], par = o.par || 0;
  const cnt = {}; rows.forEach(r => { cnt[r[1]] = (cnt[r[1]] || 0) + 1; });
  const isTie = r => r[1] > 0 && cnt[r[1]] > 1;
  const byId = {}; rows.forEach(r => { byId[r[0]] = r; });
  const madeN = rows.filter(r => r[1] > 0).length;
  const r1min = Math.min.apply(null, rows.map(r => r[2]));
  const lead = rows.filter(r => r[2] === r1min), soleLead = lead.length === 1 ? lead[0][0] : null;
  const second = rows.find(r => r[1] > 1 && r[3] !== null);
  const gap = (!o.playoff && second) ? (second[2] + second[3]) - wt : 0;
  const purse = (o.pay && o.pay[wid]) || 0;
  const s = { head: '', sub: '', st: [], rc: [], fa: [] };
  if (o.partial) s.partial = 1;
  s.head = (wid === 0 ? 'Tu remportes le tournoi' : tk(wid) + ' remporte le tournoi') + (o.playoff ? ' en prolongation' : '');
  s.sub = ['Total ' + fmt(wt), purse ? fmtMoney(purse) : null, gap === 1 ? 'un coup d’avance' : gap > 1 ? gap + ' coups d’avance' : null].filter(Boolean).join(' · ');

  /* ---- ce qui s'est passé ---- */
  const st = [];
  const deficit = W[2] - r1min;
  if (deficit >= 3) st.push({ i: 'up', t: wid === 0 ? 'Tu accusais ' + deficit + ' coups de retard sur le meneur après la ronde 1 et tu as tout rattrapé.' : tk(wid) + ' accusait ' + deficit + ' coups de retard sur le meneur après la ronde 1 et a tout rattrapé.' });
  else if (soleLead === wid && !o.one) st.push({ i: 'flag', t: (wid === 0 ? 'Tu menais' : tk(wid) + ' menait') + ' après la ronde 1 et ' + (wid === 0 ? 'tu finis' : 'finit') + ' le travail.' });
  if (o.playoff) {
    const rivals = rows.filter(r => r[1] === 2 && r[3] !== null && r[2] + r[3] === wt).map(r => r[0]);
    if (rivals.length) st.push({ i: 'trophy', t: 'Prolongation' + (rivals.length > 1 ? ' à ' + (rivals.length + 1) : '') + ' : ' + (wid === 0 ? 'tu l’emportes' : tk(wid) + ' l’emporte') + ' sur ' + listT(rivals.slice(0, 3)) + (rivals.length > 3 ? ' et ' + (rivals.length - 3) + ' autre' + (rivals.length > 4 ? 's' : '') : '') + '.' });
  }
  if (soleLead != null && soleLead !== wid && !o.one) {
    const lr = byId[soleLead], me0 = soleLead === 0;
    st.push({ i: 'flag', t: (me0 ? 'Tu menais' : tk(soleLead) + ' menait') + ' après la ronde 1 (' + fmt(r1min) + ') mais ' + (lr[1] === 0 ? (me0 ? 'rates' : 'rate') + ' finalement la coupure' : (me0 ? 'termines' : 'termine') + ' ' + rkTxt(lr[1], isTie(lr))) + '.' });
  }
  if (live) {
    const f = pre.ids[0], fr = byId[f];
    if (fr && f !== wid) {
      const lead0 = f === 0 ? 'Meneur du classement, tu ' : 'Le meneur du classement, ' + tk(f) + ', ', v = (a, b) => f === 0 ? a : b;
      if (fr[1] === 0) st.push({ i: 'alert', t: lead0 + v('rates', 'rate') + ' la coupure (' + fmt(fr[2]) + ' contre une coupure à ' + fmt(o.cut) + ').' });
      else if (fr[1] >= 30) st.push({ i: 'alert', t: lead0 + v('termines', 'termine') + ' ' + rkTxt(fr[1], isTie(fr)) + '.' });
      else if (fr[1] <= 3) st.push({ i: 'star', t: lead0 + v('termines', 'termine') + ' ' + rkTxt(fr[1], isTie(fr)) + '.' });
    }
    const kw = pre.rk[wid];
    if (kw >= 40) st.push({ i: 'star', t: wid === 0 ? 'Classé ' + ord(kw) + ' avant le tournoi, tu l’emportes.' : tk(wid) + ', ' + ord(kw) + ' du classement avant le tournoi, l’emporte.' });
    let sp = null;
    rows.forEach(r => { if (r[1] > 0 && r[1] <= 10 && r[0] !== wid) { const k = pre.rk[r[0]]; if (k >= 60 && (!sp || k > sp.k)) sp = { k, r }; } });
    if (sp) st.push({ i: 'up', t: sp.r[0] === 0 ? 'Classé ' + ord(sp.k) + ' avant le tournoi, tu termines ' + rkTxt(sp.r[1], isTie(sp.r)) + '.' : tk(sp.r[0]) + ', ' + ord(sp.k) + ' du classement avant le tournoi, termine ' + rkTxt(sp.r[1], isTie(sp.r)) + '.' });
  }
  let br = null, brN = 0;
  rows.forEach(r => [r[2], r[3]].forEach((v, i) => { if (v === null) return; if (!br || v < br.v) { br = { id: r[0], v, i }; brN = 1; } else if (v === br.v) brN++; }));
  if (br) st.push({ i: 'target', t: 'Meilleure ronde : ' + tk(br.id) + ', ' + (par ? (par + br.v) + ' (' + fmt(br.v) + ')' : fmt(br.v)) + ', ronde ' + (br.i + 1) + (brN > 1 ? ' (égalée par ' + (brN - 1) + ' autre' + (brN > 2 ? 's' : '') + ')' : '') + '.' });
  const missBy1 = rows.filter(r => r[1] === 0 && r[2] === o.cut + 1).length;
  if (o.one) st.push({ i: 'cut', t: 'Les ' + paidRows(rows, o.cut).length + ' premiers (jusqu’à ' + fmt(o.cut) + ') touchent une part de la bourse.' }); else st.push({ i: 'cut', t: missBy1 >= 5 ? 'La coupure tombe à ' + fmt(o.cut) + ' : ' + missBy1 + ' golfeurs la manquent d’un seul coup.' : 'La coupure tombe à ' + fmt(o.cut) + ' : ' + madeN + ' joueurs poursuivent.' });
  if (live) { const t10 = rows.filter(r => r[1] === 0 && pre.rk[r[0]] <= 10).length; if (t10 >= 2) st.push({ i: 'alert', t: t10 + ' des 10 premiers du classement ratent la coupure.' }); }
  const r1pos = {}; rankTies(rows.map(r => ({ id: r[0], tot: r[2] }))).forEach(r => { r1pos[r.id] = r.pos; });
  let cb = null;
  rows.forEach(r => { if (r[1] > 0 && r[0] !== wid) { const d = r1pos[r[0]] - r[1]; if (!cb || d > cb.d) cb = { id: r[0], d, r }; } });
  if (cb && cb.d >= 20) st.push({ i: 'up', t: (cb.id === 0 ? 'Tu grimpes' : tk(cb.id) + ' grimpe') + ' de ' + cb.d + ' places entre les deux rondes pour finir ' + rkTxt(cb.r[1], isTie(cb.r)) + '.' });
  s.st = st.slice(0, 5);
  if (o.me && byId[0]) {
    const m = byId[0];
    s.st.push({ i: 'user', me: 1, t: o.one && m[2] > o.cut ? 'Tu termines ' + rkTxt(m[1], isTie(m)) + ' à ' + fmt(m[2]) + ', hors de la ligne de paye (' + fmt(o.cut) + ').' : m[1] === 0 ? 'Tu rates la coupure (' + fmt(m[2]) + ' contre une coupure à ' + fmt(o.cut) + ').' : m[1] === 1 ? 'Tu empoches ' + ptsWord(m[4]) + '.' : 'Tu termines ' + rkTxt(m[1], isTie(m)) + ' à ' + fmt(m[2] + m[3]) + ' et rapportes ' + ptsWord(m[4]) + '.' });
  }

  /* ---- course au classement (seulement quand on connaît le classement d'avant) ---- */
  if (live) {
    const rc = [], la = post.ids[0], lb = pre.ids[0], N = post.ids.length;
    if ((o.tIdx === N_TOURN - 1 && !(finOn() && o.l === 0)) || o.tIdx === N_TOURN) rc.push({ i: 'trophy', t: (la === 0 ? 'Tu es couronné champion' : tk(la) + ' est couronné champion') + ' de la ligue avec ' + ptsWord(post.pts[la]) + '.' });
    else if (la !== lb) rc.push({ i: 'swap', t: (la === 0 ? 'Tu prends' : tk(la) + ' prend') + ' la tête du classement (' + ptsWord(post.pts[la]) + '), à la place de ' + tk(lb) + '.' });
    else { const d = post.pts[la] - post.pts[post.ids[1]]; rc.push({ i: 'flag', t: (la === 0 ? 'Tu conserves' : tk(la) + ' conserve') + ' la tête du classement (' + ptsWord(post.pts[la]) + ')' + (d > 0 ? ', avec ' + ptsWord(d) + ' d’avance' : ', à égalité de points avec ' + tk(post.ids[1])) + '.' }); }
    if (o.tIdx >= 3) {
      const real = post.ids.filter(id => !(post.gh || {})[id]), bub = (idx, txt) => { const a = real[idx], b = real[idx + 1]; if (a == null || b == null) return; const d = post.pts[a] - post.pts[b]; if (d <= 5) rc.push({ i: 'alert', t: txt(a, b, d) }); };
      if (l > 0) bub(MOVE - 1, (a, b, d) => 'Course à la promotion : ' + tk(a) + ' (' + ord(MOVE) + ') ' + (d ? 'devance ' + tk(b) + ' (' + ord(MOVE + 1) + ') de ' + ptsWord(d) : 'et ' + tk(b) + ' (' + ord(MOVE + 1) + ') sont à égalité de points') + '.');
      if (l < 3) bub(real.length - MOVE - 1, (a, b, d) => 'Lutte pour le maintien : ' + tk(a) + ' (' + ord(N - MOVE) + ') ' + (d ? 'devance ' + tk(b) + ' (' + ord(N - MOVE + 1) + '), premier relégable, de ' + ptsWord(d) : 'et ' + tk(b) + ' (' + ord(N - MOVE + 1) + '), premier relégable, sont à égalité de points') + '.');
    }
    let cl = null;
    post.ids.forEach(id => { const d = (pre.rk[id] || 0) - post.rk[id]; if (d >= 15 && (!cl || d > cl.d)) cl = { id, d }; });
    if (cl) rc.push({ i: 'up', t: (cl.id === 0 ? 'Tu bondis' : tk(cl.id) + ' bondit') + ' du ' + ord(pre.rk[cl.id]) + ' au ' + ord(post.rk[cl.id]) + ' rang du classement.' });
    s.rc = rc.slice(0, 4);
  }

  /* ---- faits marquants : événements rares + records ---- */
  const fa = [];
  let e4n = 0;
  (o.evs || []).forEach(e => {
    if (e.l !== l || (e.kind === 'e4' && l !== o.pl)) return;
    if (e.kind === 'e4' && ++e4n > 2) return;          // les aigles sur par 4 sont fréquents : on en cite deux, puis on compte les autres
    fa.push({ i: 'star', t: (e.id === 0 ? 'Tu réussis ' : tk(e.id) + ' réussit ') + EV_LABEL[e.kind] + ' au trou ' + e.hole + ' (ronde ' + e.round + ').' });
  });
  if (e4n > 2) fa.push({ i: 'star', t: '… et ' + (e4n - 2) + ' autre' + (e4n > 3 ? 's' : '') + ' aigle' + (e4n > 3 ? 's' : '') + ' sur un par 4.' });
  (o.recs || []).filter(r => r.l === l || (r.l === -1 && byId[r.me ? 0 : (r.ids || [])[0]] !== undefined)).slice().sort((a, b) => (b.me - a.me)).forEach(r => fa.push({ i: 'star', t: r.text, ids: r.ids || [], me: 0 }));
  s.fa = fa.slice(0, 6);
  return s;
}

const SUMC = new WeakMap();
function getSum(t, l) {
  if (l === 4 || !t.lg[l]) l = 3;   // v249 : la classe de recrues n'a pas de résumé (on montre la L4)
  if (t.sum && t.sum[l]) return t.sum[l];
  let m = SUMC.get(t); if (!m) { m = {}; SUMC.set(t, m); }
  const lg = t.lg[l];
  return m[l] || (m[l] = buildSummary({ l, rows: lg.rows, cut: lg.cut, one: lg.one, playoff: lg.playoff, par: t.par, pay: lg.pay, evs: t.evs || [], recs: t.recs || [], pl: t.pl, me: l === t.pl, partial: true }));
}

/* Les jetons {id} deviennent des liens vers le profil ; les textes libres (records, actualités) passent par newsHTML. */
function sumTxt(str) {
  return String(str).split(/(\{\d+\})/).map(p => {
    const m = /^\{(\d+)\}$/.exec(p);
    return m ? '<a href="#" data-a="golfer" data-id="' + m[1] + '" class="nlink">' + esc(nameOf(+m[1])) + '</a>' : esc(p);
  }).join('');
}
const sumPlain = str => String(str).replace(/\{(\d+)\}/g, (_, id) => nameOf(+id));
function idsIn(text) {   // retrouve les golfeurs nommés dans un texte libre (anciennes actualités sans identifiants)
  const ids = [];
  Object.keys(S.G).forEach(k => { const g = S.G[k]; if (+k !== 0 && g.n && text.indexOf(g.n) >= 0) ids.push(+k); });
  Object.keys(S.old || {}).forEach(k => { const o = S.old[k]; if (o.n && text.indexOf(o.n) >= 0) ids.push(+k); });
  return ids;
}
function sumList(items, hideMe) {
  const its = (items || []).filter(it => !(hideMe && it.me));
  if (!its.length) return '';
  return '<ul class="news sl">' + its.map(it => '<li>' + ico(it.i) + '<span>' + (it.ids ? newsHTML(it.t, it.ids) : sumTxt(it.t)) + '</span></li>').join('') + '</ul>';
}
function sumHTML(s, opts) {
  opts = opts || {};
  let h = opts.noHead ? '' : '<div class="block sumhead"><div class="sh1">' + sumTxt(s.head) + '</div>' + (s.sub ? '<div class="ctx">' + esc(s.sub) + '</div>' : '') + '</div>';
  [['Ce qui s’est passé', s.st], ['Course au classement', s.rc], ['Faits marquants', s.fa]].forEach(([title, items]) => {
    const list = sumList(items, opts.hideMe); if (list) h += '<div class="block sumblk"><h3>' + title + '</h3>' + list + '</div>';
  });
  if (s.partial) h += '<p class="small mute">Résumé reconstitué à partir des résultats : le classement d’avant-tournoi n’était pas conservé.</p>';
  return h;
}

