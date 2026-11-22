/* ============ v293 : immersion — ambiance sonore, aperçu de la semaine, réactions des partisans ============ */
/* ---- Ambiance sonore (synthétisée dans le navigateur, rien à télécharger) ---- */
let SND_AC = null, SND_NOISE = null, SNDQ = null;
function sndOn() { try { return localStorage.getItem('igc-snd') !== '0'; } catch (e) { return true; } }
function sndCtx() {
  if (!sndOn()) return null;
  try {
    if (!SND_AC) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; SND_AC = new A(); }
    if (SND_AC.state === 'suspended') SND_AC.resume();
    if (!SND_NOISE) { const n = SND_AC.sampleRate * 3, b = SND_AC.createBuffer(1, n, SND_AC.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; SND_NOISE = b; }
    return SND_AC;
  } catch (e) { return null; }
}
function sndNoise(A, t0, dur, f, q, peak, att, rel, out) {
  const s = A.createBufferSource(); s.buffer = SND_NOISE; s.loop = true;
  const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q;
  const g = A.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(peak, t0 + att); g.gain.setValueAtTime(peak, t0 + Math.max(att, dur - rel)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(bp); bp.connect(g); g.connect(out); s.start(t0, Math.random() * 2); s.stop(t0 + dur + 0.05);
}
/* applaudissements : des centaines de petits claquements + un fond de foule */
function sndClap(level, dur) {
  const A = sndCtx(); if (!A) return; const t = A.currentTime + 0.02, out = A.createGain(); out.gain.value = 0.5; out.connect(A.destination);
  const n = Math.round(40 + level * 260);
  for (let i = 0; i < n; i++) {
    const x = Math.pow(Math.random(), 1.6), at = t + x * dur, len = 0.02 + Math.random() * 0.03;
    const s = A.createBufferSource(); s.buffer = SND_NOISE;
    const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900 + Math.random() * 1900; bp.Q.value = 1.4;
    const g = A.createGain(), pk = (0.05 + Math.random() * 0.09) * (1 - x * 0.7) * (0.5 + level * 0.5);
    g.gain.setValueAtTime(pk, at); g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    s.connect(bp); bp.connect(g); g.connect(out); s.start(at, Math.random() * 2.5); s.stop(at + len + 0.01);
  }
  sndNoise(A, t, dur + 0.6, 1600, 0.6, 0.05 + level * 0.07, 0.15, dur * 0.6, out);
}
/* clameur : « ahhh ! » de la foule (voix + souffle), suivie d'applaudissements */
function sndRoar(level) {
  const A = sndCtx(); if (!A) return; const t = A.currentTime + 0.02, dur = 1.8 + level * 1.6, out = A.createGain(); out.gain.value = 0.32 + level * 0.25; out.connect(A.destination);
  const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100; lp.connect(out);
  for (let i = 0; i < 14; i++) {
    const o = A.createOscillator(), g = A.createGain(), f = 170 + Math.random() * 190;
    o.type = 'sawtooth'; o.frequency.setValueAtTime(f * 0.85, t); o.frequency.linearRampToValueAtTime(f * 1.08, t + 0.5); o.frequency.linearRampToValueAtTime(f * 0.92, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.03, t + 0.35 + Math.random() * 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + dur * (0.8 + Math.random() * 0.3));
    o.connect(g); g.connect(lp); o.start(t); o.stop(t + dur * 1.2);
  }
  sndNoise(A, t, dur + 0.4, 600, 0.7, 0.35, 0.3, dur * 0.6, out);
  setTimeout(() => sndClap(0.6 + level * 0.4, 2.2 + level), 500);
}
/* « ohhh… » déçu de la foule */
function sndGroan() {
  const A = sndCtx(); if (!A) return; const t = A.currentTime + 0.02, dur = 1.6, out = A.createGain(); out.gain.value = 0.28; out.connect(A.destination);
  const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.connect(out);
  for (let i = 0; i < 10; i++) {
    const o = A.createOscillator(), g = A.createGain(), f = 190 + Math.random() * 90;
    o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.62, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.035, t + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(lp); o.start(t); o.stop(t + dur + 0.1);
  }
  sndNoise(A, t, dur, 350, 0.8, 0.12, 0.2, 1, out);
}
function sndPlay(k) { try { if (k === 'clap') sndClap(0.35, 1.6); else if (k === 'clap2') sndClap(0.8, 2.6); else if (k === 'roar') sndRoar(1); else if (k === 'roar2') sndRoar(0.35); else if (k === 'win') sndRoar(1.3); else if (k === 'groan') sndGroan(); } catch (e) { } }
function sndFlush() { if (SNDQ) { const k = SNDQ; SNDQ = null; sndPlay(k); } }
const SND_RANK = { roar: 5, win: 6, clap2: 4, roar2: 3, groan: 2, clap: 1 };
function sndAsk(k) { if (!SNDQ || SND_RANK[k] > SND_RANK[SNDQ]) SNDQ = k; }
function sndOptHTML() {
  return '<div class="block"><h3 style="margin-top:0">Ambiance sonore</h3><label class="crftog"><input type="checkbox" data-c="sndon"' + (sndOn() ? ' checked' : '') + '>Bruits de foule</label>' +
    '<p class="small mute" style="margin:6px 0 8px">Applaudissements sur tes birdies, clameur sur les aigles et les trous d’un coup, « ohhh » sur les gros dérapages, ovation quand tu gagnes.</p><button class="btn sec sm" data-a="sndtest">Écouter</button></div>';
}

/* ---- Réactions des partisans et des journalistes pendant les rondes ---- */
const FAN_U = [['@BirdieBrigade', 'f'], ['@FairwayFred', 'f'], ['@GolfNutQC', 'f'], ['@PinSeeker88', 'f'], ['@TeeTimeTina', 'f'], ['@BunkerBuster', 'f'], ['@Back9Betty', 'f'], ['@GreensideGus', 'f'], ['@SlicedAgain', 'f'], ['@ClubhouseCam', 'f'],
  ['Martin Leduc · Golf Hebdo', 'j'], ['Sarah Kemp · Tour Insider', 'j'], ['Paolo Ricci · Fairway Report', 'j'], ['Julie Gagnon · Le Vert', 'j']];
/* gabarits : {n} golfeur (lien), {h} trou, {s} score, {p} position, {d} nombre. Les morceaux de texte passent par I18N_RX (créés plus bas). */
const FAN_T = {
  mb: [['Birdie pour {n} au {h} ! 🔥', 'Birdie for {n} on {h}! 🔥'], ['{n} vient de rentrer un birdie au {h}. Allez !', '{n} just made birdie on {h}. Let’s go!'], ['Joli birdie de {n} au {h}, la foule est debout.', 'Nice birdie from {n} on {h}, the crowd is on its feet.']],
  me: [['AIGLE pour {n} au {h} !!! Je suis debout dans mon salon.', 'EAGLE for {n} on {h}!!! I’m standing in my living room.'], ['Un aigle au {h} pour {n} ! Quel coup !', 'An eagle on {h} for {n}! What a shot!']],
  ma: [['TROU D’UN COUP pour {n} au {h} !!! 🤯', 'HOLE-IN-ONE for {n} on {h}!!! 🤯']],
  mx: [['Aïe… {n} perd {d} coups au {h}. Faut se ressaisir.', 'Ouch… {n} drops {d} shots on {h}. Time to regroup.'], ['Trou difficile pour {n} au {h} (+{d}). On reste derrière toi !', 'Tough hole for {n} on {h} (+{d}). We’re still behind you!']],
  ml: [['{n} prend la tête à {s} ! Qui va l’arrêter ?', '{n} takes the lead at {s}! Who’s going to stop this?']],
  mc: [['{n} est sur la ligne de coupure… chaque coup compte.', '{n} is right on the cut line… every shot counts.']],
  nl: [['Nouveau meneur : {n} à {s}.', 'New leader: {n} at {s}.'], ['{n} passe en tête à {s}. Le tournoi s’anime.', '{n} moves to the top at {s}. Things are heating up.']],
  oe: [['Aigle de {n} au {h} ! Il pointe maintenant au {p}.', 'Eagle for {n} on {h}! Now sitting {p}.'], ['Quel aigle de {n} au {h} !', 'What an eagle from {n} on {h}!']],
  oa: [['Trou d’un coup de {n} au {h} ! Le tertre explose.', 'Hole-in-one for {n} on {h}! The tee box erupts.']],
  ox: [['{n} s’effondre : {d} coups perdus au {h}, il glisse au {p}.', '{n} collapses: {d} shots lost on {h}, down to {p}.']],
  oc: [['{n} gagne {d} places, maintenant {p}. Attention à lui !', '{n} jumps {d} spots, now {p}. Watch out!']]
};
const FAN_J = { nl: 1, ox: 1, oc: 1, mc: 1 };   // gabarits plutôt signés par un journaliste
function fanPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function fanAdd(c, key, v, hi) {
  const tpls = FAN_T[key]; if (!tpls) return;
  const pool = FAN_U.map((u, i) => [u, i]).filter(x => (x[0][1] === 'j') === !!FAN_J[key]);
  c.fan = c.fan || [];
  c.fan.unshift({ u: fanPick(pool)[1], k: key, i: Math.floor(Math.random() * tpls.length), v, hi: hi ? 1 : 0, r: c.r });
  if (c.fan.length > 25) c.fan.length = 25;
}
/* un pas de jeu (trou, heure de départ) : réactions + sons */
function fanStep(before, after, k) {
  const c = S.cur; if (!c) return;
  const bn = {}, bp = {}; before.forEach(r => { bn[r.id] = r.n; bp[r.id] = r.pos; });
  const lb = new Set(before.filter(r => r.pos === 1).map(r => r.id));
  const out = [];   // [prio, key, v, mine]
  let chg = null;
  const holesOf = id => id === 0 ? myHoles(c) : c.ai[id];
  after.forEach(r => {
    const mine = r.id === 0; if (!mine && r.pos > 30) return;
    const hs = holesOf(r.id); if (!hs) return;
    const js = r.n == null ? [k - 1] : range(bn[r.id] || 0, r.n - 1);
    js.forEach(j => {
      if (j < 0 || hs[j] == null) return;
      const rel = hs[j] - c.pars[j], v = { n: r.id, h: j + 1, p: posLbl(r), d: rel, s: fmt(r.tot) };
      if (mine) {
        if (hs[j] === 1) { out.push([10, 'ma', v, 1]); sndAsk('roar'); }
        else if (rel <= -2) { out.push([9, 'me', v, 1]); sndAsk('roar'); }
        else if (rel === -1) { if (Math.random() < 0.7) out.push([5, 'mb', v, 1]); sndAsk('clap'); }
        else if (rel >= 2) { out.push([4, 'mx', v, 1]); sndAsk('groan'); }
      } else if (hs[j] === 1) { out.push([8, 'oa', v]); sndAsk('roar2'); }
      else if (rel <= -2 && r.pos <= 25) { out.push([6, 'oe', v]); sndAsk('roar2'); }
      else if (rel >= 3 && bp[r.id] <= 10) out.push([4, 'ox', v]);
    });
    if (!mine && bp[r.id] && bp[r.id] - r.pos >= 10 && r.pos <= 10 && (r.n == null ? k : r.n) >= 8 && (!chg || bp[r.id] - r.pos > chg.d)) chg = { n: r.id, d: bp[r.id] - r.pos, p: posLbl(r) };
  });
  if (chg && Math.random() < 0.6) out.push([3, 'oc', chg]);
  const ld = after[0];
  if (ld && ld.pos === 1 && !(after[1] && after[1].pos === 1) && !lb.has(ld.id) && (ld.n == null || ld.n > 0)) {
    if (ld.id === 0) { out.push([9, 'ml', { n: 0, s: fmt(ld.tot) }, 1]); sndAsk('clap2'); }
    else out.push([5, 'nl', { n: ld.id, s: fmt(ld.tot) }]);
  }
  const me = after.find(r => r.id === 0);
  if (me && c.r === 0 && !S.one && !c.rc && !c.fin && !c.fanCut && k >= 13 && k < 18) {
    const cut = cutScoreOf(after.map(r => r.tot), S.settings.cut);
    if (Math.abs(me.tot - cut) <= 1) { c.fanCut = 1; out.push([4, 'mc', { n: 0 }, 1]); }
  }
  out.sort((a, b) => b[0] - a[0]).slice(0, 2).reverse().forEach(o => fanAdd(c, o[1], o[2], o[3]));
}
function fanTxt(p) {
  const T = FAN_T[p.k]; if (!T) return '';
  const t = (T[p.i] || T[0])[0], v = p.v || {};
  return t.split(/(\{[nhspd]\})/).map(x => {
    if (x === '{n}') return '<a href="#" data-a="golfer" data-id="' + v.n + '">' + esc(nameOf(v.n)) + '</a>';
    const m = x.match(/^\{([hspd])\}$/); if (m) return esc(String(v[m[1]]));
    return esc(x);
  }).join('');
}
function fanHTML(c) {
  if (!c || !c.fan || !c.fan.length) return '';
  return '<h2>Réactions</h2><div class="fanl">' + c.fan.slice(0, 6).map(p => {
    const u = FAN_U[p.u] || FAN_U[0], j = u[1] === 'j', ini = j ? u[0].split(' ').map(w => w[0]).slice(0, 2).join('') : u[0].charAt(1).toUpperCase();
    return '<div class="fanp' + (p.hi ? ' hi' : '') + '"><span class="fana' + (j ? ' j' : '') + '" aria-hidden="true">' + esc(ini) + '</span><div><div class="fanu notr">' + esc(j ? u[0].split(' · ')[0] : u[0]) + (j ? ' <span class="fanm">' + esc(u[0].split(' · ')[1]) + '</span>' : '') + '</div><div class="fant">' + fanTxt(p) + '</div></div></div>';
  }).join('') + '</div>';
}
/* les gabarits deviennent des règles de traduction (un morceau de texte entre deux liens de golfeur) */
(function () {
  const rxEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  Object.values(FAN_T).forEach(L => L.forEach(([fr, en]) => {
    const fp = fr.split('{n}'), ep = en.split('{n}'); if (fp.length !== ep.length) return;
    fp.forEach((f, i) => {
      const core = f.trim(), ec = ep[i].trim(); if (!core || !/[A-Za-zÀ-ÿ]/.test(core)) return;
      const toks = []; const rx = '^' + rxEsc(core).replace(/\\\{([hspd])\\\}/g, (m, t) => { toks.push(t); return '(\\S+?)'; }) + '$';
      if (!toks.length) { I18N_EN[core] = ec; return; }
      I18N_RX.unshift([new RegExp(rx), function () { const a = arguments, v = {}; toks.forEach((t, i) => { v[t] = a[i + 1]; }); return ec.replace(/\{([hspd])\}/g, (m, t) => v[t]); }]);
    });
  }));
})();

/* ---- Aperçu de la semaine : favoris et cotes, champion en titre, historique sur le terrain, golfeurs à surveiller ---- */
let PRV_CACHE = null;
function prvStrength(id) {   // ce que les parieurs voient : les derniers différentiels du carnet (index), sinon le classement
  const h = hcHolder(id), d = h && h.hc && h.hc.d ? h.hc.d.slice(-8).map(x => x[6]) : [];
  return d.length >= 3 ? avg(d) : null;
}
function prvOdds(ids, rounds) {
  const m = ids.map(prvStrength), known = m.filter(x => x != null), fb = known.length ? Math.max.apply(null, known) + 1 : 5;
  const mu = m.map(x => x == null ? fb : x), N = 2000, sd = 6.5 * Math.sqrt(rounds), win = new Array(ids.length).fill(0);
  for (let s = 0; s < N; s++) { let b = Infinity, bi = []; for (let i = 0; i < ids.length; i++) { const v = mu[i] * rounds + gauss() * sd; if (v < b - 1e-9) { b = v; bi = [i]; } else if (Math.abs(v - b) < 1e-9) bi.push(i); } win[bi[Math.floor(Math.random() * bi.length)]]++; }
  return ids.map((id, i) => ({ id, p: win[i] / N }));
}
const PRV_NICE = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 18, 20, 25, 30, 33, 40, 50, 60, 66, 80, 100, 125, 150, 200, 250, 300, 400, 500];
function prvOddsTxt(p) {
  const q = Math.min(0.95, p * 1.12); if (q <= 0.002) return '500-1';
  const x = 1 / q - 1; if (x < 1) { const y = Math.max(1, Math.round(1 / x)); return '1-' + y; }
  return PRV_NICE.reduce((a, b) => Math.abs(b - x) < Math.abs(a - x) ? b : a, 1) + '-1';
}
const prvNm = id => '<span class="flg">' + flagOf(id, 16) + '</span> <a href="#" data-a="golfer" data-id="' + id + '">' + esc(nameOf(id)) + '</a>';
function previewHTML(l) {
  if (!S || S.t >= N_TOURN || S.cur || l < 0 || l > 3) return '';
  const course = curCourse(); if (!course) return '';
  const ids = S.L[l].filter(id => id === 0 ? !!(S.G[0] || S.pk) : !!S.G[id]); if (ids.length < 4) return '';
  const key = [S.season, S.t, l, ids.length, course.name].join('|');
  if (!PRV_CACHE || PRV_CACHE.key !== key) PRV_CACHE = { key, od: prvOdds(ids, S.one ? 1 : 2).sort((a, b) => b.p - a.p) };
  const od = PRV_CACHE.od, inF = new Set(ids);
  let h = '<h2>Aperçu de la semaine</h2><div class="block prv"><div class="prvh">Favoris</div>';
  h += od.filter(o => o.id !== 0).slice(0, 5).map(o => '<div class="prvr"><span class="prvn">' + prvNm(o.id) + '</span><span class="prvo">' + prvOddsTxt(o.p) + '</span></div>').join('');
  const me = od.find(o => o.id === 0);
  if (me) h += '<div class="prvr me"><span class="prvn"><b>Ta cote</b></span><span class="prvo">' + prvOddsTxt(me.p) + '</span></div>';
  // champion en titre (même tournoi la saison dernière, dans cette ligue)
  const H = S.hist[S.season - 2], pt = H && H.t && H.t[S.t], pr = pt && pt.lg && pt.lg[l] && pt.lg[l].rows && pt.lg[l].rows[0];
  h += '<div class="prvh">Champion en titre</div>';
  if (pr) h += '<p class="prvp">' + prvNm(pr[0]) + (pt.name !== course.name ? ' <span class="mute small">(<span>terrain :</span> ' + esc(pt.name) + ')</span>' : '') + (inF.has(pr[0]) ? '' : ' <span class="mute small">· <span>absent cette semaine</span></span>') + '</p>';
  else h += '<p class="prvp mute small">Première édition</p>';
  // historique sur ce terrain
  const st = {}; let vis = 0;
  S.hist.forEach(Hs => (Hs && Hs.t || []).forEach(T => {
    if (!T || T.name !== course.name || !T.lg) return; vis++;
    T.lg.forEach(L => (L && L.rows || []).forEach(r => { if (!inF.has(r[0])) return; const o = st[r[0]] || (st[r[0]] = { w: 0, t: 0, n: 0 }); o.n++; if (r[1] === 1) o.w++; if (r[1] > 0 && r[1] <= 10) o.t++; }));
  }));
  h += '<div class="prvh">Sur ce terrain</div>';
  const best = Object.entries(st).map(([id, o]) => ({ id: +id, o, sc: o.w * 3 + o.t })).filter(x => x.sc > 0).sort((a, b) => b.sc - a.sc).slice(0, 2);
  if (!vis) h += '<p class="prvp mute small">Première visite du circuit sur ce terrain</p>';
  else if (!best.length) h += '<p class="prvp mute small"><span>Aucun habitué du top 10 ici</span> · <span>' + vis + ' tournoi' + (vis > 1 ? 's' : '') + ' disputé' + (vis > 1 ? 's' : '') + '</span></p>';
  else h += best.map(x => '<p class="prvp">' + prvNm(x.id) + ' <span class="mute small">· ' + (x.o.w ? '<span>' + x.o.w + ' victoire' + (x.o.w > 1 ? 's' : '') + '</span> · ' : '') + '<span>' + x.o.t + ' top-10 en ' + x.o.n + ' départ' + (x.o.n > 1 ? 's' : '') + '</span></span></p>').join('');
  // à surveiller : la meilleure forme récente (trois derniers départs de la saison)
  const SH = seasonHist(), last = [];
  if (SH && SH.t) for (let t = S.t - 1; t >= 0 && last.length < 3; t--) { const T = SH.t[t]; if (T && T.lg && T.lg[l]) last.push(T.lg[l].rows); }
  if (last.length >= 2) {
    const fm = ids.filter(id => id !== 0).map(id => { const ps = last.map(rows => { const r = rows.find(x => x[0] === id); return r ? r : null; }).filter(Boolean); return { id, ps, a: ps.length === last.length ? avg(ps.map(r => r[1] || 60)) : 99 }; }).filter(x => x.a < 99).sort((a, b) => a.a - b.a)[0];
    if (fm && fm.a <= 15) {
      const lbl = r => r[1] === 0 ? 'MC' : String(r[1]);
      h += '<div class="prvh">À surveiller</div><p class="prvp">' + prvNm(fm.id) + ' <span class="mute small">· <span>' + fm.ps.map(lbl).join(', ') + '</span> · <span>ses ' + fm.ps.length + ' derniers départs</span></span></p>';
    }
  }
  return h + '<p class="small mute" style="margin:8px 0 0">Cotes des parieurs, d’après l’index récent de chaque golfeur.</p></div>';
}

/* v296 : niveau du circuit ajustable en carrière */
Object.assign(I18N_EN, { 'au départ :': 'at the start:', 'Déverrouiller pour l’ajuster…': 'Unlock to adjust it…', 'Adversaires plus forts': 'Stronger opponents', 'Adversaires moins forts': 'Weaker opponents', 'Plus forts': 'Stronger', 'Moins forts': 'Weaker',
  'Revenir au niveau de départ': 'Back to the starting level', 'Estimations moyennes, selon le par. Le changement s’applique dès la prochaine ronde simulée.': 'Average estimates, relative to par. The change applies from the next simulated round.',
  'Tu domines trop ? Rends les adversaires plus forts. Tu n’arrives pas à suivre ? Rends-les moins forts. Chaque clic : 0.5 coup par ronde, pour tous les golfeurs IA.': 'Dominating too much? Make the opponents stronger. Can’t keep up? Make them weaker. Each click: 0.5 stroke per round, for every AI golfer.' });
Object.assign(I18N_EN, { '🔒 Reverrouiller': '🔒 Lock again', 'Réglages reverrouillés': 'Settings locked again', 'Satisfait du niveau ?': 'Happy with the level?', '🔓 Réglages déverrouillés.': '🔓 Settings unlocked.' });
I18N_RX.push([/^(🔓|🔒) Réglages (déverrouillés|reverrouillés) en (\d+) \((fin de saison|avant le tournoi (\d+))\)\.$/, (m, ic, w, y, f, n) => ic + ' Settings ' + (w === 'reverrouillés' ? 'locked again' : 'unlocked') + ' in ' + y + ' (' + (n ? 'before tournament ' + n : 'end of season') + ').'], [/^🔓 Réglages déverrouillés en (.+)\.$/, '🔓 Settings unlocked in $1.']);
I18N_RX.push([/^🎚️ Niveau du circuit ajusté : ([+−]?[\d,]+) → ([+−]?[\d,]+) coups par ronde pour les adversaires\.$/, (m, a, b) => '🎚️ Tour level adjusted: ' + a.replace(',', '.') + ' → ' + b.replace(',', '.') + ' strokes per round for the opponents.']);
Object.assign(I18N_EN, { 'R\u00e9actions': 'Reactions', 'Ambiance sonore': 'Sound atmosphere', 'Bruits de foule': 'Crowd noise', '\u00c9couter': 'Listen',
  'Applaudissements sur tes birdies, clameur sur les aigles et les trous d\u2019un coup, \u00ab ohhh \u00bb sur les gros d\u00e9rapages, ovation quand tu gagnes.': 'Applause on your birdies, a roar for eagles and holes-in-one, an \u201cohhh\u201d on big blow-ups, an ovation when you win.',
  'Aper\u00e7u de la semaine': 'Week preview', 'Favoris': 'Favorites', 'Ta cote': 'Your odds', 'Champion en titre': 'Defending champion', 'terrain :': 'course:', 'absent cette semaine': 'not in the field this week',
  'Premi\u00e8re \u00e9dition': 'First edition', 'Sur ce terrain': 'On this course', 'Premi\u00e8re visite du circuit sur ce terrain': 'The tour\u2019s first visit to this course', 'Aucun habitu\u00e9 du top 10 ici': 'No regular top-10 finishers here',
  '\u00c0 surveiller': 'One to watch', 'Cotes des parieurs, d\u2019apr\u00e8s l\u2019index r\u00e9cent de chaque golfeur.': 'Betting odds, based on each golfer\u2019s recent index.' });
I18N_RX.unshift([/^(\d+) tournois? disput\u00e9s?$/, (m, n) => n + ' tournament' + (n > 1 ? 's' : '') + ' played'], [/^(\d+) victoires?$/, (m, n) => n + ' win' + (n > 1 ? 's' : '')],
  [/^(\d+) top-10 en (\d+) d\u00e9parts?$/, (m, a, n) => a + ' top-10' + (a > 1 ? 's' : '') + ' in ' + n + ' start' + (n > 1 ? 's' : '')], [/^ses (\d+) derniers d\u00e9parts$/, 'last $1 starts']);

/* ---- v301 : barème de points — éditeur par positions (1 à 10) et par paliers ----
   S.settings.pts reste un tableau (la dernière valeur s'applique aux positions suivantes). */
function ptsTiers(arr) {
  const a = (arr && arr.length ? arr : defaultPts()).slice(), top = [];
  for (let i = 0; i < 10; i++) top.push(a[Math.min(i, a.length - 1)]);
  const T = []; let i = 10;
  while (i < a.length) { let j = i; while (j + 1 < a.length && a[j + 1] === a[i]) j++; T.push({ from: i + 1, to: j + 1, v: a[i] }); i = j + 1; }
  if (!T.length) T.push({ from: 11, to: 11, v: top[9] });
  T[T.length - 1].to = null;   // le dernier palier : « et suivants »
  return { top, T };
}
function ptsBuild(top, T) {
  const out = top.map(v => Math.max(0, Math.round(+v || 0))); let from = 11;
  T.forEach((t, j) => { const last = j === T.length - 1, to = last ? from : Math.max(from, Math.round(+t.to || from)); for (let p = from; p <= to; p++) out.push(Math.max(0, Math.round(+t.v || 0))); from = to + 1; });
  return out;
}
function ptsSave(arr) { S.settings.pts = arr; setPoints(arr, S.settings.mc); persist(); }
function ptsEditorHTML() {
  const { top, T } = ptsTiers(S.settings.pts), A = ptsBuild(top, T), mx = Math.max.apply(null, A.concat([1]));
  const N = Math.max(40, (T.length > 1 ? T[T.length - 2].to : 10) + 10), val = p => A[Math.min(p, A.length) - 1];
  let h = '<details open><summary>Barème de points</summary><p class="small mute" style="margin:0 0 10px">Points gagnés selon la position finale. Les égalités se partagent la moyenne des positions.</p>';
  h += '<div class="ptsh">Positions 1 à 10</div><div class="ptsg">' + top.map((v, i) => '<label class="ptsc"><span>' + ord(i + 1) + '</span><input type="number" min="0" max="999" inputmode="numeric" data-c="ptsi" data-i="' + i + '" value="' + v + '"></label>').join('') + '</div>';
  h += '<div class="ptsh">Paliers</div><div class="ptsl"><div class="ptsr ptshd"><span>Positions</span><span>Points chacune</span><span></span></div>';
  T.forEach((t, j) => {
    const last = j === T.length - 1;
    h += '<div class="ptsr"><span class="ptsrng"><span>' + ord(t.from) + '</span> ' + (last ? '<span>et suivants</span>' : '<span>–</span> <input type="number" class="ptsto" min="' + t.from + '" max="300" inputmode="numeric" data-c="ptst" data-k="to" data-j="' + j + '" value="' + t.to + '">') + '</span>' +
      '<label class="ptsv"><input type="number" min="0" max="999" inputmode="numeric" data-c="ptst" data-k="v" data-j="' + j + '" value="' + t.v + '"><span>pts</span></label>' +
      (T.length > 1 ? '<button type="button" class="ptsx" data-a="ptsdel" data-j="' + j + '" title="Retirer ce palier">×</button>' : '<span class="ptsx"></span>') + '</div>';
  });
  h += '</div><div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap"><button class="btn sec sm" data-a="ptsadd">+ Ajouter un palier</button><button class="btn sec sm" data-a="ptsdef">Rétablir le barème par défaut</button></div>';
  h += '<div class="ptsh">Aperçu</div><div class="ptsch" role="img">' + range(1, N).map(p => '<i style="height:' + Math.max(2, Math.round(val(p) / mx * 100)) + '%" title="' + ord(p) + ' : ' + val(p) + ' pts"></i>').join('') + '</div><div class="ptsax"><span>' + ord(1) + ' · ' + val(1) + '</span><span>' + ord(10) + ' · ' + val(10) + '</span><span>' + ord(N) + ' · ' + val(N) + '</span></div>';
  h += '<label for="mc">Points pour une coupure ratée (0 par défaut)</label><input type="number" id="mc" data-c="mc" min="0" max="100" value="' + S.settings.mc + '"></details>';
  return h;
}
function ptsEdit(c, el) {
  const d = el.dataset, { top, T } = ptsTiers(S.settings.pts), v = Math.max(0, Math.min(999, Math.round(+el.value || 0)));
  if (c === 'ptsi') top[+d.i] = v;
  else {
    const j = +d.j, t = T[j]; if (!t) return;
    if (d.k === 'v') t.v = v;
    else { t.to = Math.max(t.from, Math.min(300, v)); for (let k = j + 1; k < T.length; k++) { T[k].from = (T[k - 1].to || T[k - 1].from) + 1; if (T[k].to != null && T[k].to < T[k].from) T[k].to = T[k].from; } }
  }
  ptsSave(ptsBuild(top, T)); render();
}
function ptsAct(a, d) {
  const { top, T } = ptsTiers(S.settings.pts);
  if (a === 'ptsdef') { ptsSave(defaultPts()); toast('Barème par défaut rétabli'); }
  else if (a === 'ptsadd') { const L = T[T.length - 1]; T.splice(T.length - 1, 0, { from: L.from, to: L.from + 9, v: L.v }); L.from += 10; L.v = Math.max(0, Math.round(L.v / 2)); ptsSave(ptsBuild(top, T)); }
  else if (a === 'ptsdel') { const j = +d.j; if (T.length < 2) return; if (j === T.length - 1) { T.pop(); T[T.length - 1].to = null; } else { T[j + 1].from = T[j].from; T.splice(j, 1); } ptsSave(ptsBuild(top, T)); }
  render();
}
Object.assign(I18N_EN, { 'Points gagnés selon la position finale. Les égalités se partagent la moyenne des positions.': 'Points earned by final position. Ties share the average of the positions.', 'Positions 1 à 10': 'Positions 1 to 10', 'Paliers': 'Tiers', 'Positions': 'Positions', 'Points chacune': 'Points each', 'et suivants': 'and beyond', 'pts': 'pts', '+ Ajouter un palier': '+ Add a tier', 'Rétablir le barème par défaut': 'Restore the default table', 'Aperçu': 'Preview', 'Barème par défaut rétabli': 'Default table restored', 'Retirer ce palier': 'Remove this tier' });
I18N_RX.push([/^(\d+)(?:er|e) : (\d+) pts$/, (m, a, b) => ord(+a) + ': ' + b + ' pts']);


/* ---- v304 : les golfeurs de la watchlist en gras partout où leur nom est un lien (classements, nouvelles, golfeurs…).
   Pas sur la page Watchlist elle-même (tout le monde y serait en gras). Un observateur suit aussi les mises à jour partielles. ---- */
/* v307 : une couleur par watchlist (S.wl.lists[i].c) et une couleur par défaut (S.wl.dc) pour les listes sans couleur.
   Un golfeur dans plusieurs listes prend la couleur de la première liste (dans l'ordre) qui en a une, sinon la couleur par défaut. */
const WL_COLS = [['#F2C230', 'Or'], ['#A97BE8', 'Mauve'], ['#F05A5F', 'Rouge'], ['#4C9BF5', 'Bleu'], ['#22C3E6', 'Cyan'], ['#3DCB6E', 'Vert'], ['#FB8A3C', 'Orange'], ['#F062B0', 'Rose']];
const WL_DEF = '#22C3E6';
let WLB_MAP = null, WLB_KEY = '';
function wlbMap() {
  if (!S || !S.wl || !Array.isArray(S.wl.lists)) return null;
  const key = (S.wl.dc || '') + '#' + S.wl.lists.map(l => (l.c || '') + ':' + l.ids.join(',')).join('|');
  if (key !== WLB_KEY || !WLB_MAP) {
    WLB_KEY = key; WLB_MAP = new Map(); const dc = S.wl.dc || WL_DEF;
    S.wl.lists.forEach(l => l.ids.forEach(id => { const k = String(id), cur = WLB_MAP.get(k); if (cur === undefined || (cur.d && l.c)) WLB_MAP.set(k, l.c ? { c: l.c } : { c: dc, d: 1 }); }));
  }
  return WLB_MAP;
}
function wlbMark(root) {
  try {
    const m = wlbMap(), off = !m || !m.size || (VIEW && VIEW.name === 'watch');
    (root || document).querySelectorAll('[data-a="golfer"][data-id]').forEach(el => {
      const x = !off && el.dataset.id !== '0' ? m.get(el.dataset.id) : null;
      el.classList.toggle('wlb', !!x);
      if (x) { if (el.style.color !== x.c) el.style.color = x.c; el.dataset.wlc = 1; } else if (el.dataset.wlc) { el.style.color = ''; delete el.dataset.wlc; }
    });
  } catch (e) { }
}
function wlColRow(lbl, key, cur, withDef) {
  return '<div class="wlcr"><span class="wlcn">' + lbl + '</span><div class="wlsw">' + (withDef ? '<button type="button" class="wlsx' + (!cur ? ' on' : '') + '" data-a="wlcol" data-l="' + key + '" data-v="" title="Couleur par défaut">Défaut</button>' : '') +
    WL_COLS.map(([c, n]) => '<button type="button" class="wlsc' + (cur && cur.toLowerCase() === c.toLowerCase() ? ' on' : '') + '" style="background:' + c + '" data-a="wlcol" data-l="' + key + '" data-v="' + c + '" title="' + n + '" aria-label="' + n + '"></button>').join('') + '</div></div>';
}
function wlColorsHTML() {
  const W = S.wl; if (!W.lists.length) return '';
  return '<div class="block wlcols"><h3 style="margin-top:0">Couleurs des noms</h3><p class="small mute" style="margin:0 0 8px">Les golfeurs suivis s’affichent dans la couleur de leur liste partout dans le jeu. Un golfeur dans plusieurs listes prend la couleur de la première.</p>' +
    W.lists.map(l => wlColRow('<span style="color:' + esc(l.c || W.dc || WL_DEF) + ';font-weight:800">' + esc(l.n) + '</span>', l.id, l.c || '', true)).join('') +
    wlColRow('<b>Couleur par défaut</b>', 'def', W.dc || WL_DEF, false) + '</div>';
}
let WLB_RAF = 0;
try { new MutationObserver(() => { if (!WLB_RAF) WLB_RAF = requestAnimationFrame(() => { WLB_RAF = 0; wlbMark(); }); }).observe(document.body, { childList: true, subtree: true }); } catch (e) { }


/* ---- v308 : « Aller directement à… » — une heure de départ (avant le dernier départ) ou un trou du dernier groupe ---- */
function teeJumpHTML(c, tr) {
  const opts = [];
  if (tr && preTeeOn(c)) {
    const G = teeGroups(tr.o, tr.lm), st = tr._st || teeStarts(tr.o, null, tr.lm);
    G.forEach((ids, g) => { const t = st[ids[0]]; if (t == null || t <= c.pw + 1e-6 || t > tr.anc + 1e-6) return;
      opts.push(['t:' + t, teeTime(g) + ' · groupe ' + (g + 1) + ' · ' + ids.map(id => id === 0 ? nameOf(0) : shortNm(nameOf(id))).join(', ')]); });
  } else if (teeSim(c) && c.k2 < 18) {
    const tr2 = tr; for (let k = c.k2 + 1; k <= 18; k++) opts.push(['h:' + k, (tr2 ? teeClock(tr2.anc + k) + ' · ' : '') + (k === 18 ? 'fin de la ronde' : 'trou ' + (k + 1) + ' du dernier groupe')]);
  }
  if (!opts.length) return '';
  return '<label for="tejump" class="small mute" style="display:block;margin:10px 0 4px">Aller directement à…</label><select id="tejump" data-c="tejump"><option value="">' + (tr && preTeeOn(c) ? 'Choisir une heure de départ…' : 'Choisir un moment…') + '</option>' + opts.map(o => '<option value="' + o[0] + '">' + esc(o[1]) + '</option>').join('') + '</select>';
}
function teeJump(v) {
  const c = S.cur; if (!c || !v) return;
  if (v.startsWith('t:')) {   // avant le dernier départ : on avance l'horloge
    const tr = teeCur(c); if (!tr || c.pw == null) return;
    preTeeAdv(false, +v.slice(2)); render(); window.scrollTo(0, 0); return;
  }
  if (v.startsWith('w:')) {   // v385 : après ta ronde, avancer de plusieurs trous
    if (REVEAL) { clearInterval(REVEAL.timer); REVEAL = null; }
    const before = liveRows(18); c.tx = (c.tx || 0) + Math.max(1, +v.slice(2));
    const after = liveRows(18), ev = []; holeEvents(before, after, 18, ev, true); try { fanStep(before, after, 18); } catch (e) { }
    const left = after.filter(r => r.n < 18).length;
    c.feed.unshift({ n: '+' + c.tx, w: 1, t: (left ? left + ' golfeurs encore sur le terrain. ' : 'Tout le monde a termin\u00e9. ') + 'En t\u00eate : ' + nameOf(after[0].id) + ' (' + fmt(after[0].tot) + ').', ev: ev.slice(0, 3) });
    persist(); render(); window.scrollTo(0, 0); return;
  }
  if (v.startsWith('h:')) {   // trous du dernier groupe
    const k = Math.min(18, +v.slice(2)); while (c.k2 < k) simSpectHole();
    render(); window.scrollTo(0, 0);
  }
}

Object.assign(I18N_EN, { 'v': 'yds' });
Object.assign(I18N_EN, { 'Golfeur par golfeur': 'Golfer by golfer', 'Golfeur suivant :': 'Next golfer:', 'Dernier golfeur :': 'Last golfer:', 'Dévoiler le reste du trou': 'Reveal the rest of the hole', '· meilleur score': '· best score' });
I18N_RX.push([/^(\d+) sur (\d+) dévoilés$/, '$1 of $2 revealed']);
I18N_RX.push([/^À jouer \((\d+)\)$/, (m, n) => 'Still playing (' + n + ')']);
let RENDERING = false;   // v295 : un render déclenché pendant un autre (blur d'un champ retiré du DOM) est repoussé
/* v359 : re-render d'une fiche de terrain sans bouger l'écran (la fiche reste à la même hauteur) */
function renderKeep(i) {
  const q = () => { const d = document.querySelector('details[data-i="' + i + '"]'); return d ? (d.closest('.ccard') || d) : null; };
  const e0 = q(), t0 = e0 ? e0.getBoundingClientRect().top : null, y0 = window.scrollY;
  render();
  const fix = () => { const e1 = q(); if (e1 && t0 != null) window.scrollBy(0, e1.getBoundingClientRect().top - t0); else window.scrollTo(0, y0); };
  fix(); requestAnimationFrame(fix); setTimeout(fix, 120);
}
function render() { if (RENDERING) { setTimeout(render, 0); return; } RENDERING = true; try { render0(); } finally { RENDERING = false; } }
function render0() {
  futOff(); applyLayout(); CARDX = [];
  if (VIEW && /^pn[A-Z]/.test(VIEW.name || '')) { pnRender(); return; }
  if (!S || VIEW.name === 'new') { $tabs.hidden = true; $app.innerHTML = scene() + vNew(); newFormLoad(); return; }
  if (S.presim) { runPresim(); return; }   // histoire en cours de simulation (y compris apr\u00e8s un import ou une r\u00e9ouverture)
  if (S.needsPlayerCreate && VIEW.name !== 'playerCreate') VIEW = { name: 'playerCreate', isRecreate: (S.playerCareers && S.playerCareers.length > 0) };
  const V = { tees: () => vTees(false), off: vOff, hofCer: vHofCer, home: vHome, palm: vPalm, play: vPlay, spec: vSpec, po: vPO, roundEnd: vRoundEnd, tournEnd: vTournEnd, leagues: vLeagues, tourn: vTourn, golfers: vGolfers, golfer: vGolfer, watch: vWatch, records: vRecords, almanac: vAlmanac, courses: vCourses, voyage: vVoyage, cres: vCourseResume, rclass: vRookieClass, more: vMore, inbox: vInbox, seasonEnd: vSeasonEnd, journal: vJournal, playerCreate: vPlayerCreate }[VIEW.name] || vHome;
  const scenic = VIEW.name !== 'play' && VIEW.name !== 'spec' && VIEW.name !== 'palm' && (!isMgr() || VIEW.name === 'home');   // style gestionnaire : le paysage reste sur l'accueil
  if (!isSub(VIEW)) NAV = [];   // page principale : l'historique de d\u00e9tail repart de z\u00e9ro
  $app.innerHTML = (scenic ? scene() : '') + (isSub(VIEW) ? '<button class="backfab" data-a="backview" aria-label="Retour \u00e0 la page pr\u00e9c\u00e9dente">\u2039 Retour</button>' : '') + '<div class="wrap' + (scenic ? ' sc' : '') + ' v-' + VIEW.name + (VIEW.rv ? ' rv-' + VIEW.rv : '') + '">' + V() + '</div>' + (VIEW.retAsk && canRetire() ? retireModal() : '');
  const hide = ((VIEW.name === 'play' || VIEW.name === 'spec') && !isPC()) || VIEW.name === 'playerCreate';
  $tabs.hidden = hide;
  const cur = (VIEW.name === 'seasonEnd' && VIEW.from === 'arch') || (VIEW.name === 'almanac' && !isPC()) ? 'records' : TAB_OF[VIEW.name];
  $tabs.innerHTML = isMgr() ? mSideHTML(cur || 'home') : '<span class="brand"><img src="' + LOGO_SM + '" alt="">Indoor Golf Career</span>' + TABS.filter(t => t[0] !== 'almanac' || isPC()).map(([v, l]) => '<button class="tab" data-a="tab" data-v="' + v + '"' + (v === cur ? ' aria-current="page"' : '') + '>' + l + '</button>').join('');
  mgrSync(cur);
  syncCardScroll(); fillBackups(); try { phHydrate(); } catch (e) { } sndFlush(); wlbMark();
}
/* Repositionne le scroll horizontal des cartes de scores pour que le prochain trou à jouer reste visible au bord droit (colonnes Golfeur/Tot restent figées à gauche via CSS sticky). */
function fillBackups() {
  const el = document.getElementById('bkrows'); if (!el) return;
  backupsHTML().then(list => {
    const e2 = document.getElementById('bkrows'); if (!e2) return;
    e2.innerHTML = list.length ? list.map(x => '<div class="row" style="justify-content:space-between;align-items:center;margin:4px 0"><span>' + yr(x.s) + ' \u00b7 ' + (x.t >= N_TOURN ? (x.fin ? 'apr\u00e8s la Finale' : 'fin de saison') : 'apr\u00e8s le tournoi ' + x.t) + ' <span class="mute">\u00b7 ' + new Date(x.at).toLocaleString('fr-CA', { dateStyle: 'short', timeStyle: 'short' }) + '</span></span><button class="btn sec sm" data-a="bkrestore" data-v="' + esc(x.k) + '">Restaurer</button></div>').join('') : 'Aucune copie pour l\u2019instant : la premi\u00e8re arrive apr\u00e8s ton prochain tournoi.';
  });
}
function syncCardWidth() { document.querySelectorAll('.cardwrap').forEach(w => w.style.setProperty('--cw', w.clientWidth + 'px')); }
function syncCardScroll() {
  syncCardWidth();
  // le prochain trou (vide) est la dernière colonne visible, juste avant les colonnes collées à droite (Coups…) : au trou 9, on voit 7-8-9
  document.querySelectorAll('.cardwrap').forEach(w => {
    const th = w.querySelector('th.nx'), hr = th && th.parentElement; if (!th) return;
    let rw = 0; Array.from(hr.children).forEach(c => { const cs = getComputedStyle(c); if (cs.position === 'sticky' && cs.right !== 'auto') rw += c.offsetWidth; });
    const x = (th.getBoundingClientRect().right - w.getBoundingClientRect().left) / zf() - w.clientLeft + w.scrollLeft;
    w.scrollLeft = Math.max(0, Math.round(x - (w.clientWidth - rw)));
  });
  // v259 : classement complet d'une ligue : si ton joueur est plus bas, le tableau défile jusqu'à lui
  document.querySelectorAll('.cardwrap.lgall').forEach(w => {
    const me = w.querySelector('tr.me'), hd = w.querySelector('thead'); if (!me) return;
    const y = me.offsetTop, vis = w.clientHeight - (hd ? hd.offsetHeight : 0);
    if (y + me.offsetHeight > w.clientHeight) w.scrollTop = Math.max(0, Math.round(y - (hd ? hd.offsetHeight : 0) - vis / 2 + me.offsetHeight / 2));
  });
}
/* Sur mobile, apr\u00e8s la validation d'un trou : d\u00e9file directement jusqu'au tableau des scores (pour voir les adversaires se r\u00e9v\u00e9ler) plut\u00f4t que de revenir en haut de l'\u00e9cran de saisie. Sur ordinateur (colonnes c\u00f4te \u00e0 c\u00f4te) ou si l'\u00e9cran a chang\u00e9 (fin de ronde, etc.), on revient en haut comme avant. */
function scrollAfterHole() {
  const t = !isPC() && document.getElementById('boardTop');
  if (t) t.scrollIntoView({ block: 'start' }); else window.scrollTo(0, 0);
}
/* ---- Historique de navigation : chaque page de d\u00e9tail (profil, tournoi, journal, r\u00e9sum\u00e9 d'intersaison)
   garde la page d'o\u00f9 l'on vient, avec sa position de d\u00e9filement. Le bouton \u00ab \u2039 Retour \u00bb flottant y ram\u00e8ne. ---- */
const SUB_VIEWS = { golfer: 1, tourn: 1, journal: 1, seasonEnd: 1, cres: 1, rclass: 1 };
let NAV = [];
function isSub(v) { return !!SUB_VIEWS[v.name] && (v.name !== 'seasonEnd' || !!v.arch); }
function pushNav() {
  NAV.push(Object.assign({}, VIEW, { _sy: window.scrollY, _cs: Array.from(document.querySelectorAll('.cardwrap,.scroll')).map(e => [e.scrollTop, e.scrollLeft]) }));
  if (NAV.length > 40) NAV.shift();
}
function goBack() {
  const bk = NAV.pop();
  if (!bk) { go(VIEW.name === 'golfer' ? 'golfers' : VIEW.name === 'tourn' ? 'leagues' : 'home'); return; }
  const sy = bk._sy || 0, cs = bk._cs; VIEW = bk; render(); window.scrollTo(0, sy);
  if (cs) Array.from(document.querySelectorAll('.cardwrap,.scroll')).forEach((e, i) => { const v = cs[i]; if (v) { e.scrollTop = v[0]; e.scrollLeft = v[1]; } });
}
function go(name, extra) { VIEW = Object.assign({ name }, extra || {}); render(); window.scrollTo(0, 0); }

