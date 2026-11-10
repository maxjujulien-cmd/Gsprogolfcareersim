/* ============ v231 : Boîte de réception ============
   Les nouvelles (S.news) deviennent des messages : id stable, lu / non lu (n.rd), suppression, filtres.
   S.ibxOff : catégories qu'on ne veut plus recevoir (cachées, pas effacées). */
const IBX_MAX = 150;
const IBX_CATS = [['n', 'Circuit'], ['s', 'Dépisteurs'], ['f', 'Famille'], ['r', 'Retraite'], ['h', 'Temple']];
function ibxSync() {
  if (!S || !Array.isArray(S.news)) return;
  const first = !S.ibxv; S.ibxSeq = S.ibxSeq || 0;
  for (let i = S.news.length - 1; i >= 0; i--) { const n = S.news[i]; if (n.id == null) { n.id = ++S.ibxSeq; if (first && n.s < S.season) n.rd = 1; } }
  S.ibxv = 1;
}
const ibxCat = n => dNewsTag(n.text)[0];
function ibxVis() { const off = S.ibxOff || []; return (S.news || []).filter(n => !off.includes(ibxCat(n))); }
const ibxUnread = () => ibxVis().filter(n => !n.rd).length;
const ibxMe = n => (n.ids || []).includes(0) || /^(\S+ )?Tu /.test(n.text);
function ibxWl() { const w = new Set(); ((S.wl && S.wl.lists) || []).forEach(l => (l.ids || []).forEach(i => w.add(i))); return w; }
function ibxList(f) {
  const all = ibxVis(), wl = f === 'w' ? ibxWl() : null;
  return all.filter(n => f === 'all' || !f ? true : f === 'u' ? !n.rd : f === 'w' ? (n.ids || []).some(i => wl.has(i)) : f === 'me' ? ibxMe(n) : ibxCat(n) === f);
}
function ibxDate(n) {
  const w = n.t === 0 ? '<span>Intersaison</span>' : n.t > N_TOURN ? '<span>Finale</span>' : '<span>Tournoi</span> ' + Math.min(n.t, N_TOURN);
  return '<span>' + yr(n.s) + '</span> · ' + w;
}
function ibxPlain(n) { return newsHTML(n.text, n.ids).replace(/<a href="#" data-a="golfer" data-id="\d+" class="nlink">/g, '<span class="ibnm">').replace(/<\/a>/g, '</span>'); }
function ibxTag(n) { const tg = dNewsTag(n.text); return '<span class="dtg ' + tg[0] + '">' + tg[1] + '</span>'; }
function ibxGolfer(id) {
  const g = S.G[id], o = !g && S.old && S.old[id], nm = nameOf(id); if (!nm) return '';
  const l = g ? leagueOf(id) : -1;
  const meta = g ? (g.a ? g.a + ' <span>ans</span>' : '') + (l >= 0 ? (g.a ? ' · ' : '') + 'L' + (l + 1) : '') : o ? '<span>Retraité</span>' : '';
  return '<a href="#" class="ibg" data-a="golfer" data-id="' + id + '">' + flagOf(id, 22) + '<span class="ibgn"><b>' + esc(nm) + '</b><small>' + meta + '</small></span><span class="ibgc">›</span></a>';
}
function ibxRead(n, list) {
  const i = list.indexOf(n), prev = list[i - 1], next = list[i + 1];
  const gs = Array.from(new Set((n.ids || []).filter(id => id != null && id !== 0))).map(ibxGolfer).join('');
  return '<article class="ibr">' +
    (isPC() ? '' : '<button class="ibback" data-a="ibxback">‹ <span>Boîte de réception</span></button>') +
    '<div class="ibrh">' + ibxTag(n) + '<span class="ibd">' + ibxDate(n) + '</span></div>' +
    '<p class="ibrt">' + newsHTML(n.text, n.ids) + '</p>' +
    (gs ? '<div class="ibgl"><div class="dfl">Golfeurs mentionnés</div>' + gs + '</div>' : '') +
    '<div class="ibra"><button class="ibb" data-a="ibxunread" data-id="' + n.id + '">Marquer comme non lu</button><button class="ibb del" data-a="ibxdel" data-id="' + n.id + '">Supprimer</button>' +
    '<span class="ibnav"><button class="ibb" data-a="ibxopen" data-id="' + (prev ? prev.id : '') + '"' + (prev ? '' : ' disabled') + ' aria-label="Précédent">‹</button><button class="ibb" data-a="ibxopen" data-id="' + (next ? next.id : '') + '"' + (next ? '' : ' disabled') + ' aria-label="Suivant">›</button></span></div>' +
    '</article>';
}
function vInbox() {
  ibxSync();
  const f = VIEW.ibf || 'all', list = ibxList(f), chk = new Set(VIEW.chk || []);
  const sel = VIEW.sel != null ? list.find(n => n.id === VIEW.sel) || (S.news || []).find(n => n.id === VIEW.sel) : null;
  const tot = ibxVis().length, un = ibxUnread();
  const cnt = k => ibxList(k).length;
  const chips = [['all', 'Tous'], ['u', 'Non lus'], ['me', 'Moi'], ['w', 'Watchlist']].concat(IBX_CATS)
    .filter(([k]) => !(S.ibxOff || []).includes(k))
    .map(([k, t]) => { const c = cnt(k); return (k === 'all' || k === f || c) ? '<button class="chip ibf' + (k === f ? ' on' : '') + '" data-a="ibxf" data-v="' + k + '" aria-pressed="' + (k === f) + '"><span>' + t + '</span><small>' + c + '</small></button>' : ''; }).join('');
  let h = '<div class="top"><div><h1>Boîte de réception</h1><div class="ctx"><b>' + tot + '</b> <span>' + (tot > 1 ? 'messages' : 'message') + '</span> · <b>' + un + '</b> <span>' + (un > 1 ? 'non lus' : 'non lu') + '</span></div></div></div>';
  const mob = !isPC() && sel;
  const undoBar = VIEW.undo && VIEW.undo.length ? '<div class="ibundo"><span><b>' + VIEW.undo.length + '</b> <span>' + (VIEW.undo.length > 1 ? 'messages supprim\u00e9s' : 'message supprim\u00e9') + '</span></span><button class="ibb" data-a="ibxundo">R\u00e9cup\u00e9rer</button></div>' : '';
  if (mob) return h + '<div class="ibx">' + (undoBar ? '<div class="ibmundo">' + undoBar + '</div>' : '') + ibxRead(sel, list) + '</div>';
  h += '<div class="ibx"><div class="chips ibfs">' + chips + '</div>';
  const nSel = list.filter(n => chk.has(n.id)).length, allOn = list.length && nSel === list.length;
  let left = '<div class="ibbar"><button class="ibck' + (allOn ? ' on' : nSel ? ' some' : '') + '" data-a="ibxall" aria-label="Tout sélectionner"></button>' +
    (nSel ? '<span class="ibsc"><b>' + nSel + '</b> <span>' + (nSel > 1 ? 'sélectionnés' : 'sélectionné') + '</span></span><button class="ibb" data-a="ibxreadsel">Marquer comme lu</button><button class="ibb del" data-a="ibxdelsel">Supprimer</button>'
      : '<button class="ibb" data-a="ibxreadall"' + (list.some(n => !n.rd) ? '' : ' disabled') + '>Tout marquer lu</button><button class="ibb" data-a="ibxdelread"' + (list.some(n => n.rd) ? '' : ' disabled') + '>Supprimer les messages lus</button>') + '</div>';
  if (VIEW.undo && VIEW.undo.length) left += '<div class="ibundo"><span><b>' + VIEW.undo.length + '</b> <span>' + (VIEW.undo.length > 1 ? 'messages supprimés' : 'message supprimé') + '</span></span><button class="ibb" data-a="ibxundo">R\u00e9cup\u00e9rer</button></div>';
  const rows = list.map(n => '<div class="ibrow' + (n.rd ? '' : ' un') + (sel && sel.id === n.id ? ' cur' : '') + (chk.has(n.id) ? ' ck' : '') + '" data-a="ibxopen" data-id="' + n.id + '"><button class="ibck' + (chk.has(n.id) ? ' on' : '') + '" data-a="ibxchk" data-id="' + n.id + '" aria-label="Sélectionner"></button><i class="ibdot"></i><div class="ibrw"><div class="ibrm">' + ibxTag(n) + '<span class="ibd">' + ibxDate(n) + '</span></div><div class="ibtx">' + ibxPlain(n) + '</div></div></div>').join('')
    || '<p class="mute small" style="padding:16px">Aucun message ici.</p>';
  const reader = sel ? ibxRead(sel, list) : '<div class="ibempty">' + (list.length ? 'Choisis un message pour le lire.' : '') + '</div>';
  h += '<div class="ibgrid"><div class="ibleft">' + left + '<div class="iblist">' + rows + '</div></div>' + (isPC() ? '<div class="ibpane">' + reader + '</div>' : '') + '</div>';
  h += '<details class="ibset"' + (VIEW.ibset ? ' open' : '') + '><summary data-a="ibxset">Messages reçus</summary><p class="small mute" style="margin:2px 0 8px">Décoche une catégorie pour ne plus voir ses messages. Ils ne sont pas effacés : recoche-la pour les revoir.</p><div class="chips">' +
    IBX_CATS.map(([k, t]) => { const on = !(S.ibxOff || []).includes(k); return '<button class="chip' + (on ? ' on' : '') + '" data-a="ibxoff" data-v="' + k + '" aria-pressed="' + on + '">' + (on ? '✓ ' : '') + '<span>' + t + '</span></button>'; }).join('') + '</div></details></div>';
  return h;
}
function ibxDelete(ids) {
  const set = new Set(ids), out = [];
  S.news = S.news.filter((n, i) => { if (set.has(n.id)) { out.push([i, n]); return false; } return true; });
  VIEW.undo = out; VIEW.chk = (VIEW.chk || []).filter(id => !set.has(id));
  persist();
}
function ibxUndo() {
  (VIEW.undo || []).forEach(([i, n]) => S.news.splice(Math.min(i, S.news.length), 0, n));
  VIEW.undo = null; persist();
}

function dNewsTag(t) { return /fait son entrée/.test(t) ? ['f', 'Famille'] : /Temple/.test(t) ? ['h', 'Temple'] : /retraite|perd sa place/.test(t) ? ['r', 'Retraite'] : /dépisteurs|potentiel|éclosion|franchi un cap|déçoit|progresse :/.test(t) ? ['s', 'Dépisteurs'] : ['n', 'Circuit']; }
function mgrPanels(html, cls) {   // découpe un contenu en sections <h2> et met chacune dans un panneau
  return html.split(/(?=<h2>)/).map(p => { const m = p.match(/^<h2>([\s\S]*?)<\/h2>([\s\S]*)$/); return m ? dPanel(m[1], '<div class="mpb">' + m[2] + '</div>', '', cls) : p; }).join('');
}
function homeDash(h, hero, pl, lastH, prvH) {
  const g0 = S.G[0], rk = seasonRank(pl, 0), st = lgSt(0);
  // prochain tournoi (le bloc d'origine, avec ses boutons)
  const next = '<section class="dpn dnext"><div class="dart">' + DART + '</div>' + hero + '</section>';
  // boîte de réception : les nouvelles du circuit
  ibxSync();
  const inbox = ibxVis().slice(0, 6).map(n => { const tg = dNewsTag(n.text); return '<div class="dmsg' + (n.rd ? '' : ' new') + '" data-a="ibxopen" data-id="' + n.id + '"><i></i><div><span class="dtg ' + tg[0] + '">' + tg[1] + '</span>' + newsHTML(n.text, n.ids) + '</div></div>'; }).join('') || '<p class="mute small" style="padding:12px">Aucune nouvelle pour l’instant.</p>';
  const ibU = ibxUnread();
  // ta forme
  const gh = golferHistory(0, true), cur = gh.filter(x => x.s === S.season), last = gh.slice(-8);
  const chip = x => { const w = x.pos === 1, t10 = x.pos > 0 && x.pos <= 10, mc = x.pos === 0; return '<a href="#" class="dres' + (w ? ' w' : t10 ? ' t' : mc ? ' c' : '') + '" data-a="tourn" data-s="' + x.s + '" data-t="' + x.t + '" data-l="' + x.l + '" title="' + esc(x.name) + ' · ' + yr(x.s) + ' · ' + (x.l === 4 ? 'Recrues' : 'L' + (x.l + 1)) + '">' + (mc ? 'CUT' : x.pos) + '</a>'; };
  const made = cur.filter(x => x.pos > 0).length;
  const hh = hcHolder(0), hc = hh && hh.hc && hh.hc.x != null ? fmtHI(hh.hc.x) : '–';
  const forme = '<div class="dform"><div class="dfl">Derniers résultats</div><div class="dress">' + (last.length ? last.map(chip).join('') : '<span class="mute small">Aucun tournoi joué</span>') + '</div></div>' +
    '<div class="dst3"><div><b>' + (pl >= 0 && rk && (pl !== 4 || rcX(0) < 90) ? ord(rk) : '–') + '</b><span>' + (pl === 4 ? 'Rang de la classe' : 'Rang en L' + (pl + 1)) + '</span></div>' + (pl === 4 ? '<div><b>' + hc + '</b><span>Index</span></div>' : '<div><b>' + st.pts + '</b><span>Points</span></div>') + '<div><b>' + (wrPub(0) ? '#' + wrPub(0) : 'NC') + '</b><span>World Ranking</span></div></div>' +
    '<div class="dst3"><div><b>' + (pl === 4 ? cur.filter(x => x.pos === 1).length + ' · ' + cur.filter(x => x.pos > 0 && x.pos <= 10).length : st.w + ' · ' + st.t10) + '</b><span>V · T10</span></div>' + (pl === 4 ? '<div><b>' + cur.length + '</b><span>Tournois</span></div>' : '<div><b>' + made + '/' + cur.length + '</b><span>Coupures</span></div>') + '<div><b>' + (g0 ? TIERS[tierOf(g0)][1] : hc) + '</b><span>' + (g0 ? 'Niveau' : 'Handicap') + '</span></div></div>';
  // classement
  const stand = pl === 4 ? '<div style="padding:8px 12px">' + rcStandHTML() + '</div>' : '<p class="mute small" style="margin:0;padding:8px 12px">Tu es ' + ord(rk) + ' avec ' + st.pts + ' points' + (st.w ? ', ' + st.w + ' victoire' + (st.w > 1 ? 's' : '') : '') + '.</p>' + standingsBoard(pl);
  // World Ranking
  let wr = []; try { wr = wrSnapshot(); } catch (e) { }
  const me = wrPub(0);
  const wrRows = wr.slice(0, 6).map((id, i) => '<tr' + (id === 0 ? ' class="dme"' : '') + '><td class="dn' + (i === 0 ? ' g' : '') + '">' + (i + 1) + '</td><td>' + flagVisual(natOf(id), 16) + ' <a href="#" data-a="golfer" data-id="' + id + '">' + esc(nameOf(id)) + '</a></td><td class="r small mute">' + (leagueOf(id) >= 0 ? 'L' + (leagueOf(id) + 1) : '') + '</td></tr>').join('') +
    (wr.slice(0, 6).includes(0) ? '' : '<tr class="dme"><td class="dn">' + (me || 'NC') + '</td><td>' + flagVisual(natOf(0), 16) + ' <a href="#" data-a="golfer" data-id="0">' + esc(S.name || 'Toi') + '</a></td><td class="r small mute">' + (pl === 4 ? 'Recrues' : 'L' + (pl + 1)) + '</td></tr>');
  // calendrier
  const H = S.hist[S.season - 1];
  const cal = Array.from({ length: N_TOURN }, (_, i) => {
    const c = S.courses[i] || {}, t = H && H.t[i];
    let res = '–', cls = '', link = '';
    if (t) { let r = null, l = 0; for (let k = 0; k < 4 && !r; k++) { const x = t.lg[k] && t.lg[k].rows.find(y => y[0] === 0); if (x) { r = x; l = k; } }
      if (!r && t.rc) { const x = t.rc.rows.find(y => y[0] === 0); if (x) { r = x; l = 4; } }
      res = r ? (r[1] === 0 ? 'CUT' : ord(r[1])) : '✓'; cls = r && r[1] === 1 ? ' win' : r && r[1] === 0 ? ' cut' : ' done'; link = ' data-a="tourn" data-s="' + S.season + '" data-t="' + i + '" data-l="' + (r ? l : pl) + '"'; }
    else if (i === S.t) { cls = ' nx'; res = '▶'; }
    return '<a href="#" class="dev' + cls + '"' + link + '><small>T' + (i + 1) + (i === S.t && !t ? ' · prochain' : '') + '</small><b>' + res + '</b><span>' + esc(c.name || '') + '</span></a>';
  }).join('');
  const lastBody = lastH ? lastH.replace(/^<h2>[^<]*<\/h2>/, '').replace(/^<div class="block">/, '<div>') : '<p class="mute small">Aucun tournoi joué pour l’instant.</p>';
  let x = '';
  if (canRetire() && golferHistory(0).some(y => y.s < S.season)) x += retireBlock();
  x += pnHomeBtn();
  return '<div class="dash">' +
    next +
    dPanel('Boîte de réception' + (ibU ? ' <span class="ibbadge">' + ibU + '</span>' : ''), '<div class="dinbox">' + inbox + '</div>', '<a href="#" data-a="ibx">Tout voir</a>', 'dinb') +
    dPanel('Ta forme', forme, '<a href="#" data-a="golfer" data-id="0">Ton profil</a>', 'dfrm') +
    dPanel(pl === 4 ? 'Classe de recrues · ' + yr(S.season) : 'Classement de saison · ' + LEAGUE_SHORT[pl], stand, '<a href="#" data-a="league" data-v="' + pl + '">' + (pl === 4 ? 'Toute la classe' : 'Classement complet') + '</a>', 'dstd') +
    dPanel('World Ranking', '<table class="dwr">' + wrRows + '</table>', '<a href="#" data-a="tab" data-v="golfers">Golfeurs</a>', 'dwrp') +
    dPanel('Calendrier de la saison ' + yr(S.season), '<div class="dcal">' + cal + '</div>', '', 'dcalp') +
    dPanel('Dernier tournoi', lastBody, '', 'dlast') +
    (prvH ? dPanel('Aper\u00e7u de la semaine', prvH.replace(/^<h2>[^<]*<\/h2>/, '').replace(/^<div class="block prv">/, '<div class="prv">'), '', 'dprv') : '') +
    (S.duo ? dPanel('Partie Duo', duoBlock(), '', 'dduo') : '') +
    '<section class="dact">' + x + '</section>' +
    '</div>';
}

