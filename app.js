(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

  // ---------- content ----------
  const GREETS = ["hello, i'm", "hi, i'm", 'hello, my name is', "hey, i'm", 'hola, soy', 'bonjour, je suis', 'ciao, sono'];
  const QUESTIONS = [
    "what's the weirdest thing you've ever eaten?",
    'what word best describes you?',
    "what's your most unusual skill?",
    "what's your go-to karaoke song?",
    "what's a hill you'd happily die on?",
    'what are you nerding out about lately?',
    "what's your comfort food?",
    'what made you laugh this week?',
    "what's playing in your headphones?",
    "what's your hidden talent?",
    'cats, dogs, or neither?',
    'what would your superpower be?',
  ];

  const TPLS = {
    volunteer: {
      kind: 'lanyard', w: 300, h: 440, fields: ['greet', 'role', 'event', 'back'],
      palettes: [{ n: 'Tangerine', a: '#F27A1A' }, { n: 'Electric blue', a: '#2F6BFF' }, { n: 'Hot pink', a: '#EE4F9B' }, { n: 'Leaf', a: '#1FA35B' }],
      swatch: (p) => p.a, strap: () => '#1E2329',
    },
    classic: {
      kind: 'sticker', w: 440, h: 316, fields: ['greet'],
      palettes: [
        { n: 'Tomato', c: '#C8160F' }, { n: 'Cobalt', c: '#1F4FD6' }, { n: 'Grass', c: '#138A4E' },
        { n: 'Bubblegum', c: '#E2468E' }, { n: 'Licorice', c: '#1C1C1E' },
      ],
      swatch: (p) => p.c,
    },
    chatty: {
      kind: 'sticker', w: 440, h: 320, fields: ['q', 'answer'],
      palettes: [
        { n: 'Grape and lime', f: '#4B2C9C', h: '#C8DA2C', q: '#FFFFFF' },
        { n: 'Mint and grape', f: '#BFE4DF', h: '#3D2A8E', q: '#3D2A8E' },
        { n: 'Lime and tomato', f: '#D7E13B', h: '#E2401C', q: '#E2401C' },
        { n: 'Slate and lime', f: '#88888C', h: '#D7E13B', q: '#FFFFFF' },
      ],
      swatch: (p) => `linear-gradient(135deg, ${p.f} 50%, ${p.h} 50%)`,
    },
    glow: {
      kind: 'lanyard', w: 300, h: 440, fields: ['role', 'event', 'mood', 'back'],
      palettes: [{ n: 'Amber', h: 28 }, { n: 'Rose', h: 342 }, { n: 'Lime', h: 72 }, { n: 'Sky', h: 198 }, { n: 'Violet', h: 262 }],
      swatch: (p) => hsl(p.h, 95, 58), strap: (p) => hsl(p.h, 70, 46),
    },
  };
  // ---------- generated tags ----------
  // "Random" builds a new tag from a seed: format, layout, palette, type pairing and a few details.
  const GEN_PALETTES = [
    { n: 'Paper and tomato', bg: '#F3EFE6', ink: '#1B1B1B', ac: '#E8442E', soft: '#E7DFCF' },
    { n: 'Forest', bg: '#E9EFE6', ink: '#17301F', ac: '#2F7D4F', soft: '#D4E2D0' },
    { n: 'Cobalt', bg: '#EEF1F8', ink: '#121A33', ac: '#2B4FD8', soft: '#DAE1F4' },
    { n: 'Butter', bg: '#FFF6D6', ink: '#2A2410', ac: '#E8A800', soft: '#F3E5B0' },
    { n: 'Lilac', bg: '#F1ECFA', ink: '#24183D', ac: '#7C4DEB', soft: '#E0D6F5' },
    { n: 'Night', bg: '#17171A', ink: '#F3F1EA', ac: '#FF6A3D', soft: '#2B2B31' },
    { n: 'Bubblegum', bg: '#FFE9F1', ink: '#3A1225', ac: '#E8407F', soft: '#F8D0DF' },
    { n: 'Mint', bg: '#E4F5EF', ink: '#0F2E26', ac: '#14996F', soft: '#CBE9DC' },
    { n: 'Clay', bg: '#F4E6DC', ink: '#3B1F12', ac: '#C4592E', soft: '#EAD2C0' },
    { n: 'Ink', bg: '#FFFFFF', ink: '#111111', ac: '#111111', soft: '#ECECEC' },
  ];
  const GEN_LAYOUTS = ['band', 'block', 'frame', 'badge', 'stub', 'stripes'];
  const GEN_NAME_FONTS = [
    { f: "var(--f-hand)", w: 700, max: 76, tilt: true },
    { f: "var(--f-display)", w: 800, max: 64, ls: '-.04em' },
    { f: "var(--f-narrow)", w: 700, max: 78, up: true },
    { f: "var(--f-ui)", w: 600, max: 60, ls: '-.04em' },
  ];
  const GEN_DISPLAY_FONTS = [
    { f: "var(--f-display)", w: 800, ls: '-.03em' },
    { f: "var(--f-narrow)", w: 700, up: true, ls: '0' },
    { f: "var(--f-ui)", w: 600, ls: '-.03em' },
  ];
  function mulberry(a) {
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function genSpec(seed) {
    const r = mulberry(seed);
    const pick = (arr) => arr[Math.floor(r() * arr.length)];
    return {
      format: r() < 0.6 ? 'P' : 'L',
      layout: pick(GEN_LAYOUTS),
      nameFont: pick(GEN_NAME_FONTS),
      dispFont: pick(GEN_DISPLAY_FONTS),
      palette: Math.floor(r() * GEN_PALETTES.length),
      smile: r() < 0.4,
      tilt: (r() * 5 - 3).toFixed(1),
      no: String(Math.floor(r() * 900) + 100),
      radius: pick([14, 20, 26]),
    };
  }
  function applyGen() {
    const g = genSpec(state.seed);
    Object.assign(TPLS.random, g.format === 'P'
      ? { kind: 'lanyard', w: 300, h: 440, fields: ['greet', 'role', 'event', 'back'] }
      : { kind: 'sticker', w: 440, h: 300, fields: ['greet', 'role', 'event'] });
  }
  TPLS.random = {
    kind: 'lanyard', w: 300, h: 440, fields: [],
    palettes: GEN_PALETTES,
    swatch: (p) => `linear-gradient(135deg, ${p.bg} 50%, ${p.ac} 50%)`,
    strap: (p) => (p.n === 'Night' ? '#2B2B31' : p.ink),
  };

  function genFront(p) {
    const g = genSpec(state.seed);
    const t = TPLS.random;
    const name = esc(nameOr());
    const pron = esc(state.pronouns.trim());
    const role = esc(state.role.trim());
    const event = esc(state.event.trim());
    const greet = esc(GREETS[state.greet] || GREETS[0]);
    const initial = esc((state.name.trim()[0] || '?').toUpperCase());
    const nf = g.nameFont;
    const df = g.dispFont;
    const P = g.format === 'P';
    const nameMax = Math.round(nf.max * (P ? 1 : 1.05));
    const nameStyle = `font:${nf.w} ${nameMax}px/1.15 ${nf.f};letter-spacing:${nf.ls || '0'};${nf.up ? 'text-transform:uppercase;' : ''}${nf.tilt ? `transform:rotate(${g.tilt}deg);` : ''}`;
    const dispStyle = `font-family:${df.f};font-weight:${df.w};letter-spacing:${df.ls};${df.up ? 'text-transform:uppercase;' : ''}`;
    const nameEl = (max = nameMax, min = 24) => `<div class="g-name fit" data-max="${max}" data-min="${min}" style="${nameStyle}">${name}</div>`;
    const smileEl = g.smile ? `<span class="g-smile">${smile(p.ac === p.ink ? p.ink : p.ac)}</span>` : '';
    const slot = P ? '<span class="slot"></span>' : '';
    const vars = `--bg:${p.bg};--ink:${p.ink};--ac:${p.ac};--soft:${p.soft};--r:${g.radius}px`;
    const meta = [event, pron].filter(Boolean).join(' · ');
    let inner = '';

    switch (g.layout) {
      case 'band':
        inner = `<div class="g-top g-meta">${meta || '&nbsp;'}</div>
          <div class="g-mid">
            <div class="g-greet fit" data-max="${P ? 40 : 34}" data-min="18" style="${dispStyle}">${greet}</div>
            <div class="g-row">${nameEl()}${smileEl}</div>
          </div>
          <div class="g-band"><div class="fit" data-max="26" data-min="14" style="${dispStyle}">${role || 'guest'}</div></div>`;
        break;
      case 'block':
        inner = `<div class="g-block" style="${dispStyle}"><span>${initial}</span></div>
          <div class="g-body">
            <div class="g-small">${greet}</div>
            <div class="g-row">${nameEl(P ? nameMax : 60)}${smileEl}</div>
            <div class="g-meta">${[role, event].filter(Boolean).join(' · ') || '&nbsp;'}</div>
          </div>`;
        break;
      case 'frame':
        inner = `<div class="g-frame">
            <div class="g-small g-caps">${greet}</div>
            <div class="g-center">${nameEl()}${pron ? `<div class="g-meta">${pron}</div>` : ''}</div>
            <div class="g-foot"><span style="${dispStyle}">${role || 'guest'}</span><span class="g-meta">${event ? `${event}` : ''}</span></div>
          </div>`;
        break;
      case 'badge':
        inner = `<div class="g-badge">
            <div class="g-small g-caps">${event || greet}</div>
            <div class="g-disc" style="${dispStyle}">${initial}</div>
            <div class="g-text">
              <div class="g-small">${greet}</div>
              ${nameEl(P ? Math.min(nameMax, 60) : 56)}
              <div class="g-pill">${role || 'guest'}</div>
            </div>
          </div>`;
        break;
      case 'stub':
        inner = `<div class="g-stub" style="${dispStyle}"><span class="g-no">No. ${g.no}</span><span class="g-stub-t fit" data-max="${P ? 30 : 22}" data-min="12">${event || 'hello'}</span></div>
          <div class="g-body">
            <div class="g-small">${greet}</div>
            <div class="g-row">${nameEl()}${smileEl}</div>
            <div class="g-meta">${[role, pron].filter(Boolean).join(' · ') || '&nbsp;'}</div>
          </div>`;
        break;
      case 'stripes':
        inner = `<div class="g-stripes"><i></i><i></i><i></i><i></i><i></i></div>
          <div class="g-body">
            <div class="g-greet fit" data-max="${P ? 36 : 30}" data-min="16" style="${dispStyle}">${greet}</div>
            <div class="g-row">${nameEl()}${smileEl}</div>
            <div class="g-meta">${[role, event, pron].filter(Boolean).join(' · ') || '&nbsp;'}</div>
          </div>`;
        break;
    }
    const card = `<div class="gen ${P ? 'P' : 'L'} lay-${g.layout}" style="${vars}">${slot}${inner}</div>`;
    return t.kind === 'sticker' ? `<div class="gen-wrap" style="--r:${g.radius}px">${card}</div>` : card;
  }

  function genBack(p) {
    const g = genSpec(state.seed);
    const df = g.dispFont;
    const back = esc(state.back.trim() || 'hello!');
    return `<div class="gen gen-back P" style="--bg:${p.bg};--ink:${p.ink};--ac:${p.ac};--soft:${p.soft}">
      <span class="slot"></span>
      <div class="g-meta g-top">${esc(state.event.trim()) || '&nbsp;'}</div>
      <div class="g-backtext fitblock" data-max="56" data-min="24" style="font-family:${df.f};font-weight:${df.w};letter-spacing:${df.ls};${df.up ? 'text-transform:uppercase;' : ''}"><span>${back}</span></div>
      <div class="g-backno">No. ${g.no}</div>
    </div>`;
  }

  const now = new Date();
  const DEFAULTS = {
    tpl: 'volunteer', name: 'Alex', pronouns: 'they/them', greet: 1, role: 'volunteer', event: 'design week',
    q: 0, answer: 'durian ice cream', since: `${now.toLocaleString('en', { month: 'short' })} ${now.getFullYear()}`,
    back: 'how can i help?', mood: 64, flipped: false,
    colors: { volunteer: 0, classic: 0, chatty: 0, glow: 0, random: 0 },
    seed: 20261022,
  };

  // ---------- state ----------
  const KEY = 'hellotag:v1';
  const state = load();
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        const merged = { ...DEFAULTS, ...s, colors: { ...DEFAULTS.colors, ...(s.colors || {}) } };
        if (!TPLS[merged.tpl]) merged.tpl = DEFAULTS.tpl;
        return merged;
      }
    } catch { /* storage unavailable: start fresh */ }
    return JSON.parse(JSON.stringify(DEFAULTS));
  }
  let saveTimer;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full or blocked */ }
    }, 250);
  }

  const tpl = () => TPLS[state.tpl];
  const pal = (key = state.tpl) => { const t = TPLS[key]; return t.palettes[(state.colors[key] || 0) % t.palettes.length]; };
  const isLanyard = () => tpl().kind === 'lanyard';

  // ---------- helpers ----------
  function hsl(h, s, l) {
    h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return `rgb(${Math.round(f(0) * 255)}, ${Math.round(f(8) * 255)}, ${Math.round(f(4) * 255)})`;
  }
  function hash(s) {
    let h = 2166136261;
    for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function glowBg(h, energy) {
    const t = energy / 100;
    const stops = [
      [hsl(h - 4, 98, 52), 0], [hsl(h + 6, 98, 60), 8 + t * 16], [hsl(h + 16, 96, 72), 24 + t * 24],
      [hsl(h + 24, 92, 85), 46 + t * 22], [hsl(h + 30, 75, 94), 78 + t * 14],
    ];
    return `radial-gradient(circle at 50% 78%, ${stops.map(([c, p]) => `${c} ${p.toFixed(1)}%`).join(', ')})`;
  }
  const moodWord = (e) => (e < 22 ? 'sleepy' : e < 45 ? 'chill' : e < 70 ? 'cozy' : e < 88 ? 'buzzing' : 'radiant');
  const moodClass = (e) => (e < 22 ? 'sleepy' : e > 86 ? 'happy' : '');
  const smile = (color) => `<span class="smile" style="--sc:${color}"><i></i><i></i><b></b></span>`;
  const eyes = (cls = '') => `<div class="eye-pair ${cls}"><i class="eye"></i><i class="eye"></i></div>`;
  const nameOr = () => state.name.trim() || 'your name';

  function barcode(seed, ink) {
    let h = hash(seed) || 1;
    const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
    let html = '';
    let width = 0;
    while (width < 190) {
      const bar = 1 + Math.floor(rnd() * 3.2);
      const gap = 1 + Math.floor(rnd() * 3);
      html += `<i style="width:${bar}px"></i><b style="width:${gap}px"></b>`;
      width += bar + gap;
    }
    return `<div class="barcode" style="--i:${ink}">${html}</div>`;
  }

  // ---------- templates ----------
  function frontHTML(key = state.tpl) {
    const p = pal(key);
    const name = esc(nameOr());
    const pron = esc(state.pronouns.trim());
    const role = esc(state.role.trim());
    const event = esc(state.event.trim());
    const greet = GREETS[state.greet] || GREETS[0];

    if (key === 'random') return genFront(p);
    switch (key) {
      case 'classic':
        return `<div class="cl-wrap"><div class="cl" style="--c:${p.c}">
          <div class="cl-head fit" data-max="52" data-min="22">${esc(greet.toUpperCase())}</div>
          <div class="cl-box">
            <div class="cl-name fit" data-max="86" data-min="30">${name}</div>
            ${pron ? `<div class="cl-pron">${pron}</div>` : ''}
          </div>
        </div></div>`;

      case 'chatty':
        return `<div class="ch-wrap"><div class="ch" style="--f:${p.f};--h:${p.h};--q:${p.q}">
          <div class="ch-top">
            ${pron ? `<div class="ch-pron">${pron}</div>` : ''}
            <div class="ch-name fit" data-max="70" data-min="30">${name}</div>
          </div>
          <div class="ch-bottom">
            <div class="ch-hello">hello</div>
            <div class="ch-right">
              <div class="ch-q">${esc(QUESTIONS[state.q] || QUESTIONS[0])}</div>
              <div class="ch-a"><div class="ch-ans fit" data-max="30" data-min="16">${esc(state.answer.trim())}</div></div>
            </div>
          </div>
        </div></div>`;

      case 'volunteer':
        return `<div class="vol" style="--a:${p.a}">
          <span class="slot"></span>
          <div class="vol-org">${event ? `<b>${event}</b>` : '&nbsp;'}</div>
          <div class="vol-main">
            <div class="vol-hi fit" data-max="46" data-min="26">${esc(greet)}</div>
            <div class="vol-pill"><span class="vol-name fit" data-max="64" data-min="28">${name}</span>${smile('#1C2127')}</div>
            ${pron ? `<div class="vol-pron">${pron}</div>` : ''}
          </div>
          <div class="vol-band"><div class="vol-role fit" data-max="27" data-min="16">${role || 'guest'}</div></div>
        </div>`;

      case 'glow': {
        const e = state.mood;
        const crumbs = [event, role, pron].filter(Boolean).join(' • ') || 'hello';
        return `<div class="gl">
          <div class="gl-orb" style="background:${glowBg(p.h, e)}"></div>
          <div class="gl-top">
            <span class="slot"></span>
            <div class="gl-crumbs fit" data-max="15" data-min="11">${crumbs}</div>
            <div class="gl-name fit" data-max="44" data-min="22">${name}</div>
            <div class="gl-row"><span>color<i class="gl-dot" style="background:${hsl(p.h, 95, 56)}"></i></span><span>energy: ${e}%</span><span class="gl-edit">${moodWord(e)}</span></div>
          </div>
          ${eyes(moodClass(e))}
        </div>`;
      }
    }
    return '';
  }

  function backHTML() {
    const p = pal();
    const back = esc(state.back.trim() || 'hello!');
    const event = esc(state.event.trim());
    if (state.tpl === 'random') return genBack(p);
    switch (state.tpl) {
      case 'volunteer':
        return `<div class="vol dark">
          <span class="slot"></span>
          <div class="vol-org">${event ? `<b>${event}</b>` : '&nbsp;'}</div>
          <div class="vol-bigsmile">${smile(p.a)}</div>
          <div class="vol-backtext fitblock" data-max="58" data-min="26"><span>${back}</span></div>
        </div>`;
      case 'glow':
        return `<div class="gl gl-back">
          <div class="gl-orb" style="background:${glowBg(p.h, Math.max(state.mood, 40))}"></div>
          <span class="slot"></span>
          <div class="gl-backtext fitblock" data-max="46" data-min="22"><span>${back}</span></div>
          ${eyes('happy')}
        </div>`;
    }
    return '';
  }

  // ---------- dom ----------
  const stage = $('#stage');
  const mount = $('#mount');
  const drop = $('#drop');
  const rig = $('#rig');
  const card = $('#card');
  const flipEl = $('.flip', card);
  const front = $('#front');
  const back = $('#back');

  $('#greets').innerHTML = GREETS.map((g, i) =>
    `<button type="button" class="greet" role="radio" aria-checked="false" data-i="${i}">${esc(g)}</button>`).join('');

  function fitAll(root = rig) {
    $$('.fit', root).forEach((el) => {
      let size = +el.dataset.max;
      const min = +el.dataset.min;
      el.style.fontSize = `${size}px`;
      while (el.scrollWidth > el.clientWidth + 1 && size > min) { size -= 2; el.style.fontSize = `${size}px`; }
    });
    $$('.fitblock', root).forEach((el) => {
      let size = +el.dataset.max;
      const min = +el.dataset.min;
      const inner = el.firstElementChild;
      el.style.fontSize = `${size}px`;
      while ((inner.scrollHeight > el.clientHeight + 1 || inner.scrollWidth > el.clientWidth + 1) && size > min) {
        size -= 2; el.style.fontSize = `${size}px`;
      }
    });
  }

  function render() {
    const t = tpl();
    const p = pal();
    const lan = t.kind === 'lanyard';

    rig.classList.toggle('sticker', !lan);
    card.style.setProperty('--cw', `${t.w}px`);
    card.style.setProperty('--ch', `${t.h}px`);
    front.innerHTML = frontHTML() + '<div class="sheen"></div>';
    back.innerHTML = lan ? backHTML() + '<div class="sheen"></div>' : '';
    card.classList.toggle('is-flipped', lan && state.flipped);

    if (lan) {
      $('#strap').style.setProperty('--strap', t.strap(p));
      const word = (state.event.trim() || 'hello').toUpperCase();
      $('#strapText').textContent = Array(12).fill(word).join('  •  ');
    }
    stage.dataset.tpl = state.tpl;

    // panel
    $$('.sty').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tpl === state.tpl)));
    $$('[data-for]').forEach((el) => { el.hidden = !t.fields.includes(el.dataset.for); });
    $$('.row').forEach((row) => { row.hidden = [...row.children].every((c) => c.hidden); });
    renderSwatches();
    $('#flipBtn').disabled = !lan;
    $('#flipBtn').setAttribute('aria-pressed', String(lan && state.flipped));
    $('#hint').textContent = lan ? 'Drag to swing it, tap to flip it.' : 'Drag it anywhere, tap to stick it down.';
    $$('#greets .greet').forEach((g) => g.setAttribute('aria-checked', String(+g.dataset.i === state.greet)));
    renderTickets();
    $('#questionText').textContent = QUESTIONS[state.q] || QUESTIONS[0];
    card.setAttribute('aria-label', `Name tag for ${nameOr()}. ${lan ? 'Press Enter to flip it, arrow keys to swing it.' : 'Press Enter to slap it, arrow keys to wiggle it.'}`);

    fitAll();
    moveIndicator();
  }

  // number the tickets that apply to this tag
  function renderTickets() {
    let n = 0;
    $$('.ticket').forEach((tk) => {
      if (!tk.hidden) $('.t-no', tk).textContent = String(++n).padStart(2, '0');
    });
    const open = $('.ticket.is-open');
    if (open && open.hidden) setOpen(null);
  }

  function setOpen(tk, focus = false) {
    $$('.ticket').forEach((t) => {
      const on = t === tk;
      t.classList.toggle('is-open', on);
      $('.t-head', t).setAttribute('aria-expanded', String(on));
    });
    if (tk && focus) {
      const field = $('input:not([type="file"]), .greet[aria-checked="true"], .swatch[aria-checked="true"], button.link', $('.t-body', tk));
      if (field) setTimeout(() => field.focus({ preventScroll: true }), 120);
    }
  }
  $('#tickets').addEventListener('click', (e) => {
    const head = e.target.closest('.t-head');
    if (!head) return;
    const tk = head.closest('.ticket');
    setOpen(tk.classList.contains('is-open') ? null : tk, true);
  });
  // Enter moves on to the next ticket
  $('#tickets').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || !e.target.matches('.t-input')) return;
    e.preventDefault();
    const list = $$('.ticket').filter((t) => !t.hidden);
    const i = list.indexOf(e.target.closest('.ticket'));
    setOpen(list[i + 1] || null, true);
  });
  $('#greets').addEventListener('click', (e) => {
    const g = e.target.closest('.greet');
    if (!g) return;
    state.greet = +g.dataset.i;
    render(); save(); kick(1.2);
  });

  // slide the tag picker's highlight under the chosen option
  function moveIndicator() {
    const on = $(`.seg[data-tpl="${state.tpl}"]`);
    const ind = $('#segInd');
    ind.style.opacity = on ? '1' : '0';
    if (!on) return;
    ind.style.width = `${on.offsetWidth}px`;
    ind.style.transform = `translateX(${on.offsetLeft}px)`;
  }

  function renderSwatches() {
    const t = tpl();
    const wrap = $('#swatches');
    const current = (state.colors[state.tpl] || 0) % t.palettes.length;
    wrap.innerHTML = t.palettes.map((p, i) =>
      `<button type="button" class="swatch" role="radio" aria-checked="${i === current}" aria-label="${p.n}" title="${p.n}" data-i="${i}" style="--sw:${t.swatch(p)}"></button>`
    ).join('');
  }

  function syncInputs() {
    $$('[data-key]').forEach((el) => { el.value = state[el.dataset.key]; });
  }

  // ---------- layout: scale the rig to fit the stage ----------
  let scale = 1;
  function layout() {
    const t = tpl();
    const lan = t.kind === 'lanyard';
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const natW = t.w + 40;
    const natH = mount.offsetHeight || (lan ? 640 : t.h);
    const room = stage.clientWidth < 600 ? 150 : (lan ? 92 : 120); // keep clear of the Save / Flip stack
    scale = clamp(Math.min((H - room) / natH, (W - 32) / natW), 0.4, lan ? 1.08 : 1.1);
    const ty = lan ? 0 : Math.max(10, (H - natH * scale) / 2 - 16);
    mount.style.width = `${natW}px`;
    mount.style.transform = `translate(-50%, ${ty}px) scale(${scale})`;
  }
  new ResizeObserver(layout).observe(stage);
  new ResizeObserver(moveIndicator).observe($('#styles'));

  function stickerLimits() {
    const t = tpl();
    return {
      x: Math.max(0, (stage.clientWidth / scale - t.w) / 2 - 8),
      y: Math.max(0, (stage.clientHeight / scale - t.h) / 2 - 8),
    };
  }

  // ---------- physics ----------
  const K = 17;          // pendulum stiffness (g / L)
  const D = 1.15;        // swing damping
  let th = 0.32, w = 0;  // lanyard angle + angular velocity
  let x = 0, y = 0, vx = 0, vy = 0;
  let t = 0, last = performance.now();
  let drag = null;

  function kick(strength = 1) {
    if (reduceMotion.matches) return;
    const dir = Math.random() < 0.5 ? -1 : 1;
    if (isLanyard()) w += dir * (0.25 + Math.random() * 0.25) * strength;
    else { vx += dir * 70 * strength; vy -= 30 * strength; }
  }

  function frame(time) {
    const dt = Math.min(0.033, (time - last) / 1000);
    last = time; t += dt;
    const held = drag && drag.moved;

    if (isLanyard()) {
      if (held) w *= Math.pow(0.03, dt);
      else {
        const breeze = reduceMotion.matches ? 0 : Math.sin(t * 0.9) * 0.16 + Math.sin(t * 2.3) * 0.06;
        w += (-K * Math.sin(th) - D * w + breeze) * dt;
        th += w * dt;
      }
      const twist = clamp(-w * 6 + th * 12, -32, 32);
      rig.style.transform = `rotate(${th.toFixed(4)}rad)`;
      card.style.setProperty('--twist', `${twist.toFixed(2)}deg`);
      card.style.setProperty('--sh', (th * 1.3 + twist / 70).toFixed(3));
    } else {
      // stickers stay wherever you drop them; a throw glides to a stop and bumps off the edges
      if (held) { vx *= Math.pow(0.03, dt); vy *= Math.pow(0.03, dt); }
      else {
        const f = Math.pow(0.02, dt);
        vx *= f; vy *= f;
        x += vx * dt; y += vy * dt;
      }
      const lim = stickerLimits();
      if (Math.abs(x) > lim.x) { x = Math.sign(x) * lim.x; vx *= -0.35; }
      if (Math.abs(y) > lim.y) { y = Math.sign(y) * lim.y; vy *= -0.35; }
      const rot = clamp(vx * 0.02, -16, 16) - 2;
      rig.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`;
      card.style.setProperty('--twist', '0deg');
      card.style.setProperty('--sh', (x / 260).toFixed(3));
    }
    updateEyes();
    requestAnimationFrame(frame);
  }

  // eyes follow the pointer
  let ptr = null;
  addEventListener('pointermove', (e) => { ptr = { x: e.clientX, y: e.clientY }; }, { passive: true });
  function updateEyes() {
    $$('.eye-pair', rig).forEach((el) => {
      const r = el.getBoundingClientRect();
      let tx = -2, ty = 3;
      if (ptr) {
        const dx = ptr.x - (r.left + r.width / 2);
        const dy = ptr.y - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, d / 180) * 7;
        tx = (dx / d) * k; ty = (dy / d) * k;
      }
      el._ex = lerp(el._ex || 0, tx, 0.18);
      el._ey = lerp(el._ey || 0, ty, 0.18);
      el.style.setProperty('--ex', `${el._ex.toFixed(2)}px`);
      el.style.setProperty('--ey', `${el._ey.toFixed(2)}px`);
    });
  }
  (function blink() {
    setTimeout(() => {
      const pairs = $$('.eye-pair', rig);
      pairs.forEach((e) => e.classList.add('blink'));
      setTimeout(() => pairs.forEach((e) => e.classList.remove('blink')), 130);
      blink();
    }, 2000 + Math.random() * 3400);
  })();

  // ---------- pointer: drag to swing, tap to flip ----------
  card.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    card.setPointerCapture(e.pointerId);
    const m = mount.getBoundingClientRect();
    const px = m.left + m.width / 2;
    const py = m.top;
    drag = {
      id: e.pointerId, sx: e.clientX, sy: e.clientY, moved: false, px, py,
      a0: Math.atan2(e.clientX - px, e.clientY - py), th0: th, x0: x, y0: y,
      lastT: performance.now(), lastTh: th,
    };
    rig.classList.add('grabbing');
  });
  card.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.sx;
    const dy = e.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) > 6) drag.moved = true;
    if (!drag.moved) return;
    const tnow = performance.now();
    const dt = Math.max(8, tnow - drag.lastT) / 1000;
    if (isLanyard()) {
      const a = Math.atan2(e.clientX - drag.px, e.clientY - drag.py);
      const next = clamp(drag.th0 - (a - drag.a0), -1.3, 1.3);
      w = lerp(w, (next - drag.lastTh) / dt, 0.5);
      th = next; drag.lastTh = th;
    } else {
      const nx = drag.x0 + dx / scale;
      const ny = drag.y0 + dy / scale;
      vx = lerp(vx, (nx - x) / dt, 0.5); vy = lerp(vy, (ny - y) / dt, 0.5);
      x = nx; y = ny;
    }
    drag.lastT = tnow;
  });
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const wasTap = !drag.moved && e.type === 'pointerup';
    drag = null;
    rig.classList.remove('grabbing');
    w = clamp(w, -9, 9); vx = clamp(vx, -2500, 2500); vy = clamp(vy, -2500, 2500);
    if (wasTap) tap();
  };
  card.addEventListener('pointerup', endDrag);
  card.addEventListener('pointercancel', endDrag);

  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const dir = e.key === 'ArrowLeft' ? -1 : 1;
      if (isLanyard()) w -= dir * 1.6; else vx += dir * 260;
    }
  });

  function tap() { if (isLanyard()) flip(); else slap(); }
  function flip() {
    if (!isLanyard()) return;
    state.flipped = !state.flipped;
    card.classList.toggle('is-flipped', state.flipped);
    $('#flipBtn').setAttribute('aria-pressed', String(state.flipped));
    if (!reduceMotion.matches) w += (state.flipped ? 1 : -1) * 1.1;
    save();
  }
  function slap() {
    flipEl.classList.remove('slap');
    void flipEl.offsetWidth;
    flipEl.classList.add('slap');
    vy += 120;
  }
  flipEl.addEventListener('animationend', () => flipEl.classList.remove('slap'));

  // ---------- switching styles ----------
  let switching = false;
  function setTemplate(next, opts = {}) {
    if ((next === state.tpl && !opts.force) || switching) return;
    const fromSticker = !isLanyard();
    const toSticker = opts.toSticker ?? TPLS[next].kind === 'sticker';
    const swap = () => {
      if (opts.prep) opts.prep();
      state.tpl = next;
      state.flipped = false;
      render();
      layout();
      th = toSticker ? 0 : (Math.random() < 0.5 ? -1 : 1) * 0.4;
      w = 0; x = y = vx = vy = 0;
      save();
    };
    if (reduceMotion.matches) { swap(); return; }
    switching = true;
    drop.classList.add('leave');
    drop.classList.toggle('from-sticker', fromSticker);
    setTimeout(() => {
      swap();
      drop.classList.remove('leave', 'from-sticker');
      drop.classList.add('enter');
      drop.classList.toggle('to-sticker', toSticker);
      void drop.offsetWidth;
      drop.classList.remove('enter', 'to-sticker');
      switching = false;
    }, 240);
  }

  // a brand-new generated tag on every press
  function randomize() {
    const seed = Math.floor(Math.random() * 2 ** 31);
    const g = genSpec(seed);
    const btn = $('#randomBtn');
    btn.classList.remove('rolling'); void btn.offsetWidth; btn.classList.add('rolling');
    setTemplate('random', {
      force: true,
      toSticker: g.format === 'L',
      prep: () => { state.seed = seed; state.colors.random = g.palette; applyGen(); },
    });
  }
  $('#randomBtn').addEventListener('click', randomize);

  // ---------- panel wiring ----------
  $('#styles').addEventListener('click', (e) => {
    const b = e.target.closest('.sty');
    if (b) setTemplate(b.dataset.tpl);
  });
  $('#swatches').addEventListener('click', (e) => {
    const b = e.target.closest('.swatch');
    if (!b) return;
    state.colors[state.tpl] = +b.dataset.i;
    render(); save(); kick(1.4);
    $(`.swatch[data-i="${b.dataset.i}"]`).focus();
  });
  $('#swatches').addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    const n = tpl().palettes.length;
    const dir = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1;
    const i = (((state.colors[state.tpl] || 0) + dir) % n + n) % n;
    state.colors[state.tpl] = i;
    render(); save(); kick();
    $(`.swatch[data-i="${i}"]`).focus();
  });

  // Names get a capital first letter as you start typing. Lowercase it yourself afterwards and it stays small.
  const nameInput = $('#f-name');
  let freshName = false;
  nameInput.addEventListener('beforeinput', (e) => {
    const all = nameInput.selectionStart === 0 && nameInput.selectionEnd === nameInput.value.length;
    freshName = all && /^insert/.test(e.inputType || '');
  });
  nameInput.addEventListener('input', () => {
    const v = nameInput.value;
    if (freshName && v && v[0] !== v[0].toUpperCase()) {
      const pos = nameInput.selectionStart;
      nameInput.value = v[0].toUpperCase() + v.slice(1);
      nameInput.setSelectionRange(pos, pos);
    }
    freshName = false;
  });


  $$('[data-key]').forEach((el) => {
    el.addEventListener('input', () => {
      const k = el.dataset.key;
      state[k] = 'num' in el.dataset ? +el.value : el.value;
      render(); save();
      if (el.type !== 'range') kick();
    });
  });

  $('#shuffleQ').addEventListener('click', () => {
    let q;
    do { q = Math.floor(Math.random() * QUESTIONS.length); } while (q === state.q);
    state.q = q;
    render(); save(); kick(1.5);
  });

  $('#flipBtn').addEventListener('click', flip);

  // ---------- save as png ----------
  const dlg = $('#saveDlg');
  $('#saveBtn').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    if (typeof window.html2canvas !== 'function') {
      toast("The image exporter didn't load. Check your connection and reload.");
      return;
    }
    btn.disabled = true;
    const label = $('span', btn);
    label.textContent = 'Printing…';
    try {
      if (document.fonts) await document.fonts.ready;
      const canvas = await window.html2canvas(card, {
        backgroundColor: null,
        scale: 3,
        logging: false,
        onclone: (doc) => doc.documentElement.classList.add('exporting'),
      });
      const url = canvas.toDataURL('image/png');
      $('#saveImg').src = url;
      const link = $('#dlgDownload');
      link.href = url;
      link.download = `${(state.name.trim() || 'name').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-tag.png`;
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    } catch (err) {
      console.error(err);
      toast("Couldn't make the picture. Try again in a moment.");
    } finally {
      btn.disabled = false;
      label.textContent = 'Save PNG';
    }
  });
  $('#dlgClose').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
  }

  // ---------- go ----------
  applyGen();
  syncInputs();
  render();
  layout();
  if (document.fonts) document.fonts.ready.then(() => { render(); layout(); });
  requestAnimationFrame((time) => { last = time; frame(time); });
})();
