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
    member: {
      kind: 'lanyard', w: 300, h: 440, fields: ['role', 'event', 'since', 'photo', 'back'],
      palettes: [
        { n: 'Graphite', i: '#2B2B2E', il: '#C4C4C6' }, { n: 'Forest', i: '#1E6A49', il: '#A9CBB9' },
        { n: 'Oxblood', i: '#8C1F2C', il: '#D9AEB3' }, { n: 'Ink', i: '#1F4A8C', il: '#A9BCD8' },
      ],
      swatch: (p) => p.i, strap: (p) => p.i,
    },
    volunteer: {
      kind: 'lanyard', w: 300, h: 440, fields: ['greet', 'role', 'event', 'back'],
      palettes: [{ n: 'Tangerine', a: '#F27A1A' }, { n: 'Electric blue', a: '#2F6BFF' }, { n: 'Hot pink', a: '#EE4F9B' }, { n: 'Leaf', a: '#1FA35B' }],
      swatch: (p) => p.a, strap: () => '#1E2329',
    },
    glow: {
      kind: 'lanyard', w: 300, h: 440, fields: ['role', 'event', 'mood', 'back'],
      palettes: [{ n: 'Amber', h: 28 }, { n: 'Rose', h: 342 }, { n: 'Lime', h: 72 }, { n: 'Sky', h: 198 }, { n: 'Violet', h: 262 }],
      swatch: (p) => hsl(p.h, 95, 58), strap: (p) => hsl(p.h, 70, 46),
    },
  };
  const now = new Date();
  const DEFAULTS = {
    tpl: 'volunteer', name: 'Alex', pronouns: 'they/them', greet: 1, role: 'volunteer', event: 'design week',
    q: 0, answer: 'durian ice cream', since: `${now.toLocaleString('en', { month: 'short' })} ${now.getFullYear()}`,
    back: 'how can i help?', mood: 64, photo: '', flipped: false,
    colors: { classic: 0, chatty: 0, member: 0, volunteer: 0, glow: 0 },
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
      try { localStorage.setItem(KEY, JSON.stringify(state)); }
      catch { try { localStorage.setItem(KEY, JSON.stringify({ ...state, photo: '' })); } catch { /* ignore */ } }
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

      case 'member': {
        const h = hash(state.name + state.event);
        const no = String(h % 1000).padStart(3, '0');
        const initial = esc((state.name.trim()[0] || '?').toUpperCase());
        const photo = state.photo
          ? `<div class="mem-photo-in" style="background-image:url('${state.photo}')"></div>`
          : `<div class="mem-photo-in">${initial}</div>`;
        const field = (label, val) => `<div><div class="mem-label">${label}</div><div class="mem-val fit" data-max="26" data-min="14">${val || '&nbsp;'}</div></div>`;
        return `<div class="mem" style="--i:${p.i};--il:${p.il}">
          <span class="slot"></span>
          <div class="mem-no">MEMBER ${no}</div>
          <div class="mem-title">Member<br>Card</div>
          <div class="mem-org fit" data-max="10" data-min="8">${event || 'the club'}</div>
          <div class="mem-body">
            <div class="mem-fields">
              ${field('name', name)}${field('team', role)}${field('pronouns', pron)}${field('since', esc(state.since.trim()))}
            </div>
            <div class="mem-photo">${photo}</div>
          </div>
          <div class="mem-foot">
            <div class="mem-fine">The holder of this card is an official member of ${event || 'the club'}</div>
            <div class="mem-stamp-wrap"><div class="mem-stamp">${initial}</div><div class="mem-code">NT-${String(now.getFullYear()).slice(2)}-${no}</div></div>
          </div>
        </div>`;
      }

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
    switch (state.tpl) {
      case 'member': {
        const no = String(hash(state.name + state.event) % 1000).padStart(3, '0');
        return `<div class="mem mem-back" style="--i:${p.i};--il:${p.il}">
          <span class="slot"></span>
          <div class="mem-no">MEMBER ${no}</div>
          <div class="mem-big fitblock" data-max="52" data-min="24"><span>${back}</span></div>
          ${barcode(state.name + no, p.i)}
          <div class="mem-fine">If found, please return to ${esc(nameOr())}${event ? ` at ${event}` : ''}</div>
        </div>`;
      }
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
    $('#clearPhoto').hidden = !state.photo;
    const tile = $('#photoTile');
    tile.style.backgroundImage = state.photo ? `url('${state.photo}')` : '';
    $('#hint').textContent = lan ? 'Drag to swing it, tap to flip it.' : 'Drag it around, tap to stick it down.';
    stage.style.setProperty('--doodle', state.tpl === 'member' ? p.i : '#2B2B2E');
    $$('#greets .greet').forEach((g) => g.setAttribute('aria-checked', String(+g.dataset.i === state.greet)));
    renderTickets(p);
    $('#questionText').textContent = QUESTIONS[state.q] || QUESTIONS[0];
    card.setAttribute('aria-label', `Name tag for ${nameOr()}. ${lan ? 'Press Enter to flip it, arrow keys to swing it.' : 'Press Enter to slap it, arrow keys to wiggle it.'}`);

    fitAll();
    renderThumbs();
  }

  // ticket stubs: number the visible ones and show what's filled in
  function renderTickets(p) {
    const vals = {
      name: state.name.trim(),
      pronouns: state.pronouns.trim(),
      role: state.role.trim(),
      event: state.event.trim(),
      since: state.since.trim(),
      greet: GREETS[state.greet],
      q: state.answer.trim(),
      photo: state.photo ? 'Added' : '',
      mood: `${state.mood}%, ${moodWord(state.mood)}`,
      back: state.back.trim(),
    };
    let n = 0;
    $$('.ticket').forEach((tk) => {
      if (tk.hidden) return;
      $('.t-no', tk).textContent = String(++n).padStart(2, '0');
      const key = tk.dataset.ticket;
      const el = $('.t-val', tk);
      if (key === 'color') {
        el.innerHTML = `<i class="dot" style="background:${tpl().swatch(p)}"></i>${esc(p.n)}`;
        el.classList.remove('empty');
        return;
      }
      el.textContent = vals[key] || 'Not filled in';
      el.classList.toggle('empty', !vals[key]);
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

  // live mini versions of each preset, with your name on them
  function renderThumbs() {
    $$('.preset').forEach((b) => {
      const key = b.dataset.tpl;
      const t = TPLS[key];
      const box = $('.thumb', b);
      const bw = box.clientWidth;
      const bh = box.clientHeight;
      if (!bw || !bh) return;
      const k = Math.min((bw - 4) / t.w, (bh - 4) / t.h);
      box.innerHTML = `<div class="thumb-in${t.kind === 'sticker' ? ' is-sticker' : ''}" style="transform:scale(${k.toFixed(4)}) translate(-50%, -50%)">
        <div class="face-mini" style="width:${t.w}px;height:${t.h}px">${frontHTML(key)}</div></div>`;
      fitAll(box);
    });
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
    scale = clamp(Math.min((H - (lan ? 54 : 100)) / natH, (W - 32) / natW), 0.4, lan ? 1.08 : 1.1);
    const ty = lan ? 0 : Math.max(10, (H - natH * scale) / 2 - 16);
    mount.style.width = `${natW}px`;
    mount.style.transform = `translate(-50%, ${ty}px) scale(${scale})`;
  }
  new ResizeObserver(() => { layout(); renderThumbs(); }).observe(stage);

  // ---------- physics ----------
  const K = 17;          // pendulum stiffness (g / L)
  const D = 1.15;        // swing damping
  const KS = 170;        // sticker spring
  const DS = 15;
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
      if (held) { vx *= Math.pow(0.03, dt); vy *= Math.pow(0.03, dt); }
      else {
        vx += (-KS * x - DS * vx) * dt; vy += (-KS * y - DS * vy) * dt;
        x += vx * dt; y += vy * dt;
      }
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
  function setTemplate(next) {
    if (next === state.tpl || switching) return;
    const fromSticker = !isLanyard();
    const toSticker = TPLS[next].kind === 'sticker';
    const swap = () => {
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

  // photo for the member card: downscale so it stays light
  $('#f-photo').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 360;
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      state.photo = c.toDataURL('image/jpeg', 0.86);
      URL.revokeObjectURL(url);
      render(); save(); kick(1.5);
    };
    img.onerror = () => { URL.revokeObjectURL(url); toast("That file didn't open as an image. Try a JPG or PNG."); };
    img.src = url;
  });
  $('#clearPhoto').addEventListener('click', () => { state.photo = ''; render(); save(); });

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
  syncInputs();
  render();
  layout();
  if (document.fonts) document.fonts.ready.then(() => { render(); layout(); });
  requestAnimationFrame((time) => { last = time; frame(time); });
})();
