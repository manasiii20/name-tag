(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const phone = matchMedia('(max-width: 900px)');

  // ---------- content ----------
  const GREETS = [
    "hello, i'm", "hi, i'm", 'hello, my name is', "hey, i'm", 'hello, who am i again?',
    'arree, mai hoon', 'hola, soy', 'bonjour, je suis',
  ];

  const TPLS = {
    volunteer: {
      kind: 'lanyard', w: 300, h: 440, fields: ['greet', 'role', 'event', 'back'],
      palettes: [{ n: 'Tangerine', a: '#F27A1A' }, { n: 'Electric blue', a: '#2F6BFF' }, { n: 'Hot pink', a: '#EE4F9B' }, { n: 'Leaf', a: '#1FA35B' }],
      swatch: (p) => p.a, strap: () => '#1E2329',
    },
    classic: {
      kind: 'sticker', w: 440, h: 316, fields: ['greet', 'shape'],
      palettes: [
        { n: 'Tomato', c: '#C8160F' }, { n: 'Cobalt', c: '#1F4FD6' }, { n: 'Grass', c: '#138A4E' },
        { n: 'Bubblegum', c: '#E2468E' }, { n: 'Licorice', c: '#1C1C1E' },
      ],
      swatch: (p) => p.c,
    },
    glow: {
      kind: 'lanyard', w: 300, h: 440, fields: ['role', 'event', 'mood', 'back'],
      palettes: [{ n: 'Amber', h: 28 }, { n: 'Rose', h: 342 }, { n: 'Lime', h: 72 }, { n: 'Sky', h: 198 }, { n: 'Violet', h: 262 }],
      swatch: (p) => hsl(p.h, 95, 58), strap: (p) => hsl(p.h, 70, 46),
    },
  };
  // ---------- illustrated tags: postcard, slogan, coffee, licence ----------
  let svgUid = 0;
  const uid = (p) => `${p}${++svgUid}`;

  // closed path whose edges wobble like a hand-cut border
  function wavyPath(x, y, w, h, amp, step) {
    const edge = (len) => Math.max(2, Math.round(len / step));
    let d = `M${x} ${y}`;
    let n = edge(w);
    for (let i = 0; i < n; i++) d += ` Q${(x + (i + 0.5) * w / n).toFixed(1)} ${(y + (i % 2 ? amp : -amp)).toFixed(1)} ${(x + (i + 1) * w / n).toFixed(1)} ${y}`;
    n = edge(h);
    for (let i = 0; i < n; i++) d += ` Q${(x + w + (i % 2 ? -amp : amp)).toFixed(1)} ${(y + (i + 0.5) * h / n).toFixed(1)} ${x + w} ${(y + (i + 1) * h / n).toFixed(1)}`;
    n = edge(w);
    for (let i = 0; i < n; i++) d += ` Q${(x + w - (i + 0.5) * w / n).toFixed(1)} ${(y + h + (i % 2 ? -amp : amp)).toFixed(1)} ${(x + w - (i + 1) * w / n).toFixed(1)} ${y + h}`;
    n = edge(h);
    for (let i = 0; i < n; i++) d += ` Q${(x + (i % 2 ? amp : -amp)).toFixed(1)} ${(y + h - (i + 0.5) * h / n).toFixed(1)} ${x} ${(y + h - (i + 1) * h / n).toFixed(1)}`;
    return `${d} Z`;
  }

  // a postage-stamp frame: a rectangle with round bumps all the way around
  function scallopFrame(W, H, r, fill) {
    let out = `<rect x="${r}" y="${r}" width="${W - 2 * r}" height="${H - 2 * r}" fill="${fill}"/>`;
    const nx = Math.round((W - 2 * r) / (2.1 * r));
    const ny = Math.round((H - 2 * r) / (2.1 * r));
    for (let i = 0; i <= nx; i++) {
      const cx = (r + i * (W - 2 * r) / nx).toFixed(1);
      out += `<circle cx="${cx}" cy="${r}" r="${r}" fill="${fill}"/><circle cx="${cx}" cy="${H - r}" r="${r}" fill="${fill}"/>`;
    }
    for (let i = 1; i < ny; i++) {
      const cy = (r + i * (H - 2 * r) / ny).toFixed(1);
      out += `<circle cx="${r}" cy="${cy}" r="${r}" fill="${fill}"/><circle cx="${W - r}" cy="${cy}" r="${r}" fill="${fill}"/>`;
    }
    return out;
  }

  function speckles(seed, W, H, color, count) {
    let h = hash(seed) || 7;
    const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
    let out = '';
    for (let i = 0; i < count; i++) {
      out += `<circle cx="${(rnd() * W).toFixed(1)}" cy="${(rnd() * H).toFixed(1)}" r="${(0.6 + rnd() * 1.6).toFixed(2)}" fill="${color}" opacity="${(0.35 + rnd() * 0.5).toFixed(2)}"/>`;
    }
    return out;
  }

  const CRITTERS = {
    fish: `<svg class="pc-critter" viewBox="0 0 150 100" width="172" height="115" aria-hidden="true">
      <path d="M38 50 L8 26 Q16 50 8 74 Z" fill="#E8432E"/>
      <path d="M58 24 Q60 6 72 14 Q76 4 86 12 Q94 6 96 22 Z" fill="#E8432E"/>
      <ellipse cx="78" cy="54" rx="46" ry="34" fill="#E8432E"/>
      <path d="M104 23 Q128 34 128 56 Q128 78 104 87 Q114 56 104 23 Z" fill="#F27B3C"/>
      <path d="M60 86 q6 8 12 0 q6 8 12 0 q6 8 12 0" fill="#E8432E"/>
      <path d="M110 46 q5 -6 10 0" stroke="#3B1A12" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <circle cx="131" cy="58" r="4.6" fill="#E8432E"/><circle cx="131" cy="67" r="4.6" fill="#E8432E"/>
      <circle cx="113" cy="60" r="4" fill="#F7A07A" opacity=".8"/>
      <path d="M66 42 c-3 -4 -8 0 -4 4 l4 4 l4 -4 c4 -4 -1 -8 -4 -4z" fill="#F9B36B"/>
      <circle cx="80" cy="36" r="1.8" fill="#F9B36B"/><circle cx="88" cy="44" r="1.8" fill="#F9B36B"/><circle cx="74" cy="56" r="1.8" fill="#F9B36B"/>
    </svg>`,
    narwhal: `<svg class="pc-critter" viewBox="0 0 150 100" width="172" height="115" aria-hidden="true">
      <path d="M104 40 L124 2 L114 42 Z" fill="#F4E7C4"/>
      <path d="M111 30 l7 -4 M108 22 l8 -4 M114 14 l6 -3" stroke="#E2CC96" stroke-width="2" stroke-linecap="round"/>
      <path d="M22 72 L4 60 L8 80 Z" fill="#E8693A"/>
      <path d="M20 74 Q32 62 46 64 Q60 32 98 36 Q134 40 134 66 Q134 92 98 92 L52 90 Q34 88 20 74 Z" fill="#E8693A"/>
      <path d="M54 84 Q96 98 132 74 Q130 92 98 92 L54 90 Z" fill="#FFF7EE"/>
      <path d="M80 70 q-6 12 6 14" stroke="#C9512A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M106 58 q5 -6 10 0" stroke="#3B1A12" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <circle cx="120" cy="70" r="4" fill="#F9A88A" opacity=".85"/>
      <path d="M70 52 c-3 -4 -8 0 -4 4 l4 4 l4 -4 c4 -4 -1 -8 -4 -4z" fill="#FFF7EE"/>
      <circle cx="62" cy="62" r="1.8" fill="#FFF7EE"/><circle cx="84" cy="48" r="1.8" fill="#FFF7EE"/>
    </svg>`,
    puffer: `<svg class="pc-critter" viewBox="0 0 150 100" width="172" height="115" aria-hidden="true">
      <path d="M34 52 L10 36 Q16 52 10 68 Z" fill="#F2B530"/>
      ${Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const c = (r) => `${(80 + Math.cos(a) * r).toFixed(1)} ${(52 + Math.sin(a) * r).toFixed(1)}`;
        const b1 = (r) => `${(80 + Math.cos(a - 0.12) * r).toFixed(1)} ${(52 + Math.sin(a - 0.12) * r).toFixed(1)}`;
        const b2 = (r) => `${(80 + Math.cos(a + 0.12) * r).toFixed(1)} ${(52 + Math.sin(a + 0.12) * r).toFixed(1)}`;
        return `<path d="M${b1(34)} L${c(44)} L${b2(34)} Z" fill="#E59A1E"/>`;
      }).join('')}
      <circle cx="80" cy="52" r="36" fill="#F7C84A"/>
      <path d="M50 66 Q80 92 110 66 Q104 86 80 88 Q56 86 50 66 Z" fill="#FFF3CF"/>
      <path d="M86 40 q5 -6 10 0" stroke="#3B2A0E" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <circle cx="108" cy="56" r="5" fill="none" stroke="#3B2A0E" stroke-width="2.4"/>
      <circle cx="94" cy="54" r="4" fill="#F59C7A" opacity=".8"/>
      <path d="M62 40 q8 4 4 12" stroke="#E59A1E" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`,
  };

  function postcardFront(p) {
    const W = 460, H = 240;
    const inner = wavyPath(26, 26, W - 52, H - 52, 3.2, 22);
    const greet = esc(GREETS[state.greet] || GREETS[0]);
    return `<div class="pc" style="--frame:${p.frame};--ink:${p.ink}">
      <svg class="pc-bg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">
        ${scallopFrame(W, H, 7, p.frame)}
        <path d="${inner}" fill="${p.inner}"/>
        ${p.speck ? `<g>${speckles(state.name + p.n, W, H, p.speck, 140)}</g><path d="${wavyPath(0, 0, W, H, 0, 400)} ${inner}" fill="${p.frame}" fill-rule="evenodd"/>` : ''}
      </svg>
      ${CRITTERS[state.critter] || CRITTERS.fish}
      <div class="pc-write">
        <div class="pc-greet">${greet}</div>
        <div class="pc-name fit" data-max="48" data-min="20">${esc(nameOr())}</div>
        <div class="pc-line"></div>
      </div>
    </div>`;
  }

  function smileySvg(color, cls, w = 130) {
    return `<svg class="${cls}" viewBox="0 0 120 100" width="${w}" height="${Math.round(w * 100 / 120)}" aria-hidden="true">
      <ellipse cx="44" cy="30" rx="9" ry="20" transform="rotate(-14 44 30)" fill="${color}"/>
      <ellipse cx="74" cy="26" rx="9" ry="20" transform="rotate(-14 74 26)" fill="${color}"/>
      <path d="M14 60 Q58 104 112 58" stroke="${color}" stroke-width="7" fill="none" stroke-linecap="round"/>
    </svg>`;
  }
  const leather = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='l'%3E%3CfeTurbulence type='turbulence' baseFrequency='.055' numOctaves='3' seed='4'/%3E%3CfeDiffuseLighting surfaceScale='1.6' lighting-color='%23fff'%3E%3CfeDistantLight azimuth='225' elevation='55'/%3E%3C/feDiffuseLighting%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1 0 0 0 .9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23l)'/%3E%3C/svg%3E")`;

  function sloganWords() {
    return (state.statement.trim() || 'you belong here').split(/\s+/).slice(0, 6).map(esc);
  }
  function sloganFront(p) {
    const name = esc(nameOr());
    const event = esc(state.event.trim());
    const words = sloganWords();
    const foot = `<div class="sl-foot"><b>${name}</b>${event ? `<span>${event}</span>` : ''}</div>`;
    return `<div class="sl soft" style="--bg:${p.bg};--ink:${p.ink}">
      <span class="slot"></span><i class="sl-tex" style="background-image:${leather}"></i>
      ${smileySvg(p.ink, 'sl-smile s1')}${smileySvg(p.ink, 'sl-smile s2')}
      <div class="sl-stack fitblock" data-max="58" data-min="26"><span>${words.join('<br>')}</span></div>
      ${foot}
    </div>`;
  }
  function sloganBack(p) {
    return `<div class="sl soft sl-back" style="--bg:${p.bg};--ink:${p.ink}">
      <span class="slot"></span><i class="sl-tex" style="background-image:${leather}"></i>
      ${smileySvg(p.ink, 'sl-smile s3', 96)}
      <div class="sl-backtext fitblock" data-max="48" data-min="22"><span>${esc(state.back.trim() || 'hello!')}</span></div>
      <div class="sl-foot"><b>${esc(nameOr())}</b></div>
    </div>`;
  }

  function burstPoints(cx, cy, rx, ry, n, seed) {
    let h = hash(seed) || 3;
    const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
      const k = i % 2 === 0 ? 0.86 + rnd() * 0.16 : 0.5 + rnd() * 0.1;
      pts.push(`${(cx + Math.cos(a) * rx * k).toFixed(1)},${(cy + Math.sin(a) * ry * k).toFixed(1)}`);
    }
    return pts.join(' ');
  }
  function shirtPattern(id, p) {
    switch (p.shirt) {
      case 'gingham':
        return `<pattern id="${id}" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="18" fill="#FFFFFF"/><rect width="9" height="18" fill="${p.shirtC}" opacity=".55"/><rect width="18" height="9" fill="${p.shirtC}" opacity=".55"/></pattern>`;
      case 'sprinkles':
        return `<pattern id="${id}" width="26" height="22" patternUnits="userSpaceOnUse"><rect width="26" height="22" fill="${p.shirtC}"/><rect x="4" y="4" width="8" height="2.4" rx="1.2" fill="#FFFFFF" transform="rotate(35 8 5)"/><rect x="15" y="13" width="8" height="2.4" rx="1.2" fill="#FFFFFF" transform="rotate(-25 19 14)"/></pattern>`;
      case 'stripes':
        return `<pattern id="${id}" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#FFFFFF"/><rect width="14" height="6" fill="${p.shirtC}"/></pattern>`;
      default:
        return `<pattern id="${id}" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="18" fill="#FFFFFF"/><circle cx="9" cy="9" r="3.4" fill="${p.shirtC}"/></pattern>`;
    }
  }
  function coffeeCharacter(p) {
    const id = uid('shirt');
    return `<svg class="cf-person" viewBox="0 0 250 200" width="240" height="192" aria-hidden="true">
      <defs>${shirtPattern(id, p)}</defs>
      <path d="M18 204 Q20 124 72 104 Q112 92 152 104 Q206 122 212 204 Z" fill="url(#${id})" stroke="#111" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="112" cy="64" r="30" fill="#F6C6B4" stroke="#111" stroke-width="3"/>
      <path d="M82 66 Q78 26 114 28 Q146 30 144 58 Q130 42 110 44 Q92 48 86 70 Z" fill="#111"/>
      ${p.shirt === 'sprinkles' ? '<path d="M86 70 Q72 74 76 88 Q86 92 92 82" fill="#111"/>' : ''}
      <path d="M116 60 v9" stroke="#111" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="128" cy="65" r="3.4" fill="none" stroke="#111" stroke-width="2.4"/>
      <path d="M36 130 Q12 168 40 186 Q92 192 150 182 Q166 176 160 160 Q150 150 132 152 L74 156 Q68 142 62 130 Z" fill="#F6C6B4" stroke="#111" stroke-width="3" stroke-linejoin="round"/>
      <rect x="146" y="136" width="48" height="50" rx="5" fill="#FFFFFF" stroke="#111" stroke-width="3"/>
      <path d="M194 148 q16 2 14 16 q-2 12 -14 10" fill="none" stroke="#111" stroke-width="3"/>
      <ellipse cx="170" cy="141" rx="19" ry="3.6" fill="#3A2416"/>
      <path d="M170 172 c-6 -8 -16 -2 -10 6 l10 8 l10 -8 c6 -8 -4 -14 -10 -6z" fill="#2E9E4A" stroke="#111" stroke-width="2"/>
      <path d="M140 156 q10 -4 12 8 q-2 8 -12 6" fill="#F6C6B4" stroke="#111" stroke-width="3"/>
    </svg>`;
  }
  const doodleStar = (cls) => `<svg class="${cls}" viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><path d="M20 3 L24 15 L37 16 L27 24 L31 37 L20 29 L9 37 L13 24 L3 16 L16 15 Z" fill="#FFFFFF" stroke="#111" stroke-width="2.4" stroke-linejoin="round"/></svg>`;

  function coffeeFront(p) {
    const pts = burstPoints(170, 112, 168, 108, 11, 'coffee' + p.n);
    const event = esc(state.event.trim());
    const role = esc(state.role.trim());
    return `<div class="cf no-box-shadow">
      <div class="cf-body">
        <div class="cf-side"><b>${event || 'hello'}</b>${role ? ` ${role}` : ''}</div>
        ${coffeeCharacter(p)}
        ${doodleStar('cf-star')}
      </div>
      <svg class="cf-burst" viewBox="0 0 340 230" width="340" height="230" aria-hidden="true">
        <polygon points="${pts}" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="18" stroke-linejoin="round"/>
        <polygon points="${pts}" fill="${p.burst}" stroke="#111" stroke-width="3.2" stroke-linejoin="round"/>
        <circle cx="170" cy="30" r="9" fill="#EFEFEC" stroke="#111" stroke-width="2"/>
      </svg>
      <div class="cf-name fitblock" data-max="56" data-min="18"><span>${esc(nameOr())}</span></div>
    </div>`;
  }
  function coffeeBack(p) {
    const pts = burstPoints(170, 70, 120, 62, 10, 'coffee-back' + p.n);
    return `<div class="cf">
      <div class="cf-body cf-body-back">
        <div class="cf-backtext fitblock" data-max="48" data-min="22"><span>${esc(state.back.trim() || 'hello!')}</span></div>
        ${doodleStar('cf-star cf-star-b')}
      </div>
      <svg class="cf-burst cf-burst-back" viewBox="0 0 340 150" width="340" height="150" aria-hidden="true">
        <polygon points="${pts}" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="16" stroke-linejoin="round"/>
        <polygon points="${pts}" fill="${p.burst}" stroke="#111" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="170" cy="30" r="9" fill="#EFEFEC" stroke="#111" stroke-width="2"/>
      </svg>
    </div>`;
  }

  // ---------- licensed: a whimsical creative licence covered in stickers ----------
  const starPath = (cx, cy, r, ir = 0.45) => {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * ir : r;
      d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`;
    }
    return `${d}Z`;
  };
  // glitter: a star in one colour, peppered with lighter and darker flecks
  function glitterStar(size, fill, light, dark, seed, rot = 0) {
    const id = uid('gs');
    const s = size;
    return `<svg viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" style="transform:rotate(${rot}deg)" aria-hidden="true">
      <defs><clipPath id="${id}"><path d="${starPath(s / 2, s / 2 + s * 0.04, s * 0.48, 0.48)}"/></clipPath></defs>
      <path d="${starPath(s / 2, s / 2 + s * 0.04, s * 0.48, 0.48)}" fill="${fill}" stroke="${dark}" stroke-width="${(s / 40).toFixed(1)}" stroke-linejoin="round"/>
      <g clip-path="url(#${id})">${speckles(seed + 'l', s, s, light, Math.round(s * 1.4))}${speckles(seed + 'd', s, s, dark, Math.round(s * 0.9))}</g>
    </svg>`;
  }
  function holoStar(size, rot = 0) {
    const id = uid('hs');
    const s = size;
    return `<svg viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" style="transform:rotate(${rot}deg)" aria-hidden="true">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#FFD1F0"/><stop offset=".35" stop-color="#C9E7FF"/><stop offset=".65" stop-color="#E4FFD8"/><stop offset="1" stop-color="#E9D2FF"/></linearGradient></defs>
      <path d="${starPath(s / 2, s / 2 + s * 0.04, s * 0.48, 0.5)}" fill="url(#${id})" stroke="#FFFFFF" stroke-width="${(s / 22).toFixed(1)}" stroke-linejoin="round"/>
      <path d="${starPath(s / 2, s / 2 + s * 0.04, s * 0.48, 0.5)}" fill="none" stroke="#B9A6D9" stroke-width="${(s / 60).toFixed(1)}" stroke-linejoin="round"/>
    </svg>`;
  }

  const LIC_STICKERS = {
    certified: { label: 'Certified creative', art: (n) => `<div class="lk lk-certified"><span>★ certified ★</span><span>creative</span><b>${n}</b></div>` },
    heart: { label: 'Heart bubble', art: () => `<div class="lk lk-heart"><svg viewBox="0 0 64 54" width="64" height="54" aria-hidden="true"><path d="M8 4h48a6 6 0 0 1 6 6v26a6 6 0 0 1-6 6H30l-12 10v-10H8a6 6 0 0 1-6-6V10a6 6 0 0 1 6-6z" fill="#F7B6D4" stroke="#111" stroke-width="2.4" stroke-linejoin="round"/><path d="M32 33 C22 26 19 22 19 18 C19 14.5 21.8 12 25 12 C28 12 30.4 13.8 32 16.2 C33.6 13.8 36 12 39 12 C42.2 12 45 14.5 45 18 C45 22 42 26 32 33 Z" fill="#FFFFFF"/></svg></div>` },
    pencil: { label: 'Pencil', art: () => `<div class="lk lk-pencil"><svg viewBox="0 0 90 34" width="90" height="34" aria-hidden="true"><rect x="16" y="6" width="54" height="22" rx="3" fill="#C9B6F2" stroke="#111" stroke-width="2.4"/><path d="M16 6 L2 17 L16 28 Z" fill="#F6D9B5" stroke="#111" stroke-width="2.4" stroke-linejoin="round"/><path d="M2 17 l5 -4 v8 z" fill="#111"/><rect x="70" y="6" width="9" height="22" fill="#D9DCE2" stroke="#111" stroke-width="2.4"/><rect x="79" y="6" width="9" height="22" rx="3" fill="#F7A9C4" stroke="#111" stroke-width="2.4"/><path d="M20 13 h46" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" opacity=".7"/></svg></div>` },
    nib: { label: 'Pen nib', art: () => `<div class="lk lk-nib"><svg viewBox="0 0 54 54" width="54" height="54" aria-hidden="true"><path d="M27 4 L44 24 L33 46 H21 L10 24 Z" fill="#111"/><path d="M27 18 V34" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round"/><circle cx="27" cy="30" r="3.4" fill="#FFFFFF"/><path d="M48 6 l1.8 4.2 4.2 1.8 -4.2 1.8 -1.8 4.2 -1.8 -4.2 -4.2 -1.8 4.2 -1.8z" fill="#111"/><path d="M6 36 l1.2 2.8 2.8 1.2 -2.8 1.2 -1.2 2.8 -1.2 -2.8 -2.8 -1.2 2.8 -1.2z" fill="#111"/></svg></div>` },
    gold: { label: 'Gold star', art: () => `<div class="lk lk-gold">${glitterStar(58, '#E8B730', '#FFF2B0', '#9C7212', 'gold', -12)}</div>` },
    holo: { label: 'Holo star', art: () => `<div class="lk lk-holo">${holoStar(54, 14)}</div>` },
    smiley: { label: 'Smiley', art: () => `<div class="lk lk-smiley"><svg viewBox="0 0 50 50" width="50" height="50" aria-hidden="true"><circle cx="25" cy="25" r="22" fill="#FFD84A" stroke="#111" stroke-width="2.4"/><ellipse cx="18" cy="21" rx="2.8" ry="4.6" fill="#111"/><ellipse cx="32" cy="21" rx="2.8" ry="4.6" fill="#111"/><path d="M14 30 Q25 41 36 30" stroke="#111" stroke-width="2.8" fill="none" stroke-linecap="round"/></svg></div>` },
    rainbow: { label: 'Rainbow', art: () => `<div class="lk lk-rainbow"><svg viewBox="0 0 70 40" width="70" height="40" aria-hidden="true"><path d="M6 38 a29 29 0 0 1 58 0" fill="none" stroke="#111" stroke-width="13"/><path d="M6 38 a29 29 0 0 1 58 0" fill="none" stroke="#FF7A7A" stroke-width="9"/><path d="M14 38 a21 21 0 0 1 42 0" fill="none" stroke="#FFD84A" stroke-width="7"/><path d="M21 38 a14 14 0 0 1 28 0" fill="none" stroke="#7FD6A6" stroke-width="6"/><path d="M27 38 a8 8 0 0 1 16 0" fill="none" stroke="#8EC5FF" stroke-width="5"/></svg></div>` },
  };

  function licenceBarcode(seed) {
    let h = hash(seed) || 1;
    const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
    let out = '';
    let w = 0;
    while (w < 112) {
      const bar = 1 + Math.floor(rnd() * 3);
      const gap = 1 + Math.floor(rnd() * 2.4);
      out += `<i style="width:${bar}px"></i><b style="width:${gap}px"></b>`;
      w += bar + gap;
    }
    return out;
  }
  const blackStars = (n) => Array.from({ length: n }, () => `<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true"><path d="${starPath(10, 10.6, 9.6, 0.45)}" fill="#111"/></svg>`).join('');
  const initials = () => (state.name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2) || 'v').toUpperCase();

  function licenceFront() {
    const name = esc(nameOr());
    const photo = state.photo
      ? `<div class="lc-photo" style="background-image:url('${state.photo}')"></div>`
      : `<div class="lc-photo lc-photo-empty"><span>${esc(initials())}</span><small>photo booth</small></div>`;
    const on = new Set(state.stickers.split(',').filter(Boolean));
    const stickers = Object.keys(LIC_STICKERS).filter((k) => on.has(k)).map((k) => LIC_STICKERS[k].art(esc(initials()))).join('');
    return `<div class="lc">
      <span class="slot"></span>
      <div class="lc-card">
        <div class="lc-stars">${blackStars(8)}</div>
        <div class="lc-grid">
          <div class="lc-left">
            ${photo}
            <div class="lc-barcode">${licenceBarcode(state.name + 'licence')}</div>
            <div class="lc-mono lc-cap">${name} · creative</div>
          </div>
          <div class="lc-right">
            <div class="lc-title"><span>CREATIVE</span><span>LICENCE</span></div>
            <div class="lc-fields">
              <div class="lc-f"><span class="lc-mono">name :</span><b class="fit" data-max="17" data-min="9">${name}</b></div>
              <div class="lc-f lc-occ"><span class="lc-mono">here as :</span><b class="fitblock" data-max="15" data-min="9"><span>${esc(state.role.trim()) || '&nbsp;'}</span></b></div>
              <div class="lc-f lc-font"><span class="lc-mono">least favourite font :</span><em class="fit" data-max="26" data-min="12">${esc(state.font.trim()) || '&nbsp;'}</em></div>
            </div>
          </div>
        </div>
        ${stickers}
      </div>
    </div>`;
  }
  function licenceBack() {
    return `<div class="lc">
      <span class="slot"></span>
      <div class="lc-card lc-card-back">
        <div class="lc-stars">${blackStars(7)}</div>
        <div class="lc-backtext fitblock" data-max="40" data-min="18"><span>${esc(state.back.trim() || 'hello!')}</span></div>
        <div class="lc-backfoot"><div class="lc-barcode">${licenceBarcode(state.name + 'back')}</div><span class="lc-mono">if found, return to ${esc(nameOr())}</span></div>
        <div class="lk lk-gold lk-back">${glitterStar(58, '#E8B730', '#FFF2B0', '#9C7212', 'goldb', 10)}</div>
      </div>
    </div>`;
  }

  // scattered glitter and holo stars behind the licence, like a sticker-covered desk
  function confettiHTML() {
    const kinds = [
      ['#E8B730', '#FFF2B0', '#9C7212'], ['#E8457E', '#FFC2DA', '#9C1F4E'], ['#C7242E', '#FF9A9A', '#7E1018'],
      ['#2E7FD6', '#B9DCFF', '#164E8C'], ['#F2852E', '#FFD1A6', '#A0480E'], ['#8E9AA6', '#EEF2F6', '#4E5862'],
      ['#7AB648', '#D8F2B8', '#3E6C1E'], ['#5B8FD9', '#C9DEFF', '#2B4F8C'],
    ];
    let h = 12345;
    const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
    let out = '';
    for (let i = 0; i < 26; i++) {
      const x = (i % 6) * 17 + rnd() * 12 - 2;
      const y = Math.floor(i / 6) * 22 + rnd() * 14 - 2;
      const size = Math.round(34 + rnd() * 30);
      const rot = Math.round(rnd() * 60 - 30);
      const star = rnd() < 0.18 ? holoStar(size, rot) : (() => { const k = kinds[Math.floor(rnd() * kinds.length)]; return glitterStar(size, k[0], k[1], k[2], `c${i}`, rot); })();
      out += `<span style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%">${star}</span>`;
    }
    return out;
  }

  const EXTRA_TPLS = {
    postcard: {
      kind: 'sticker', w: 460, h: 240, fields: ['greet', 'critter'], noBox: true,
      palettes: [
        { n: 'Periwinkle', frame: '#6460C6', inner: '#FDFBF3', ink: '#2C2A57', speck: null },
        { n: 'Sunflower', frame: '#F5D63C', inner: '#E5ECEE', ink: '#2C3A4F', speck: '#9DB0AD' },
        { n: 'Cherry', frame: '#8D1120', inner: '#E7EDF0', ink: '#2C3A4F', speck: '#FFFFFF' },
        { n: 'Sea glass', frame: '#3DA88A', inner: '#FFF8EC', ink: '#22423A', speck: '#E8C6A2' },
      ],
      swatch: (p) => p.frame,
    },
    slogan: {
      kind: 'lanyard', w: 300, h: 440, fields: ['statement', 'event', 'back'],
      palettes: [
        { n: 'Mint', bg: '#2DB94C', ink: '#F4FFF2', strap: '#14532A' },
        { n: 'Cobalt', bg: '#2033E3', ink: '#FFFFFF', strap: '#0E1766' },
        { n: 'Bubblegum', bg: '#FF8DB5', ink: '#5A0F2E', strap: '#5A0F2E' },
        { n: 'Lemon', bg: '#FFE14D', ink: '#1A1A1A', strap: '#1A1A1A' },
      ],
      swatch: (p) => `linear-gradient(135deg, ${p.bg} 50%, ${p.ink} 50%)`, strap: (p) => p.strap,
    },
    coffee: {
      kind: 'lanyard', w: 340, h: 450, fields: ['event', 'role', 'back'], noBox: true,
      palettes: [
        { n: 'Sky', burst: '#3D8BEB', shirt: 'gingham', shirtC: '#9CC3EE' },
        { n: 'Pink', burst: '#F06BC3', shirt: 'sprinkles', shirtC: '#E2302E' },
        { n: 'Lime', burst: '#B5DD43', shirt: 'stripes', shirtC: '#F3B23A' },
        { n: 'Tangerine', burst: '#FF8A3D', shirt: 'dots', shirtC: '#2F6B4F' },
      ],
      swatch: (p) => p.burst, strap: () => '#2A2321',
    },
    crayon: {
      kind: 'sticker', w: 440, h: 300, fields: [],
      palettes: [
        { n: 'Sunshine', stripe: '#F6C531', wave: '#F07B1D', ink: '#2B2620' },
        { n: 'Lagoon', stripe: '#45C9B4', wave: '#2D5BD9', ink: '#1F2B5C' },
        { n: 'Bubblegum', stripe: '#E6577F', wave: '#2F66E0', ink: '#3A1626' },
        { n: 'Sky', stripe: '#9CC0F2', wave: '#C9DB2E', ink: '#22314A' },
        { n: 'Coral', stripe: '#F27868', wave: '#7A3FD1', ink: '#3A1A16' },
      ],
      swatch: (p) => `linear-gradient(135deg, ${p.stripe} 50%, ${p.wave} 50%)`,
    },
    licence: {
      kind: 'lanyard', w: 440, h: 300, fields: ['role', 'font', 'photo', 'stickers', 'back'], noColor: true, noPronouns: true,
      palettes: [{ n: 'Sunny', acc: '#D1462F' }],
      swatch: (p) => p.acc, strap: () => '#A9D3F2', strapInk: 'rgba(16, 44, 72, .75)',
    },
  };
  // --- crayon: a folded place card, striped and outlined in wax crayon ---
  function crayonFilters(id, seed) {
    return `<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${seed}" result="wob"/>
        <feDisplacementMap in="SourceGraphic" in2="wob" scale="6" xChannelSelector="R" yChannelSelector="G" result="moved"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${seed + 7}" result="grain"/>
        <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.95" result="wax"/>
        <feComposite in="moved" in2="wax" operator="in"/>
      </filter>`;
  }
  function crayonBlob(cx, cy, rx, ry, bumps) {
    // a wobbly rounded rectangle with soft scallops, like a hand-drawn crayon frame
    const pts = [];
    const n = bumps * 8;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const c = Math.cos(a), s = Math.sin(a);
      const sq = (v) => Math.sign(v) * Math.pow(Math.abs(v), 0.55);
      const wob = 1 + 0.06 * Math.sin(a * bumps);
      pts.push(`${(cx + sq(c) * rx * wob).toFixed(1)},${(cy + sq(s) * ry * wob).toFixed(1)}`);
    }
    return `M${pts.join(' L')} Z`;
  }
  function crayonFront(p) {
    const W = 440, H = 300, fold = 236;
    const f1 = uid('cr'), f2 = uid('cr');
    const seed = (hash(state.name + p.n) % 50) + 1;
    let stripes = '';
    for (let x = 6; x < W; x += 30) stripes += `<rect x="${x}" y="-10" width="15" height="${H + 20}" rx="4"/>`;
    const blob = crayonBlob(W / 2, 112, 150, 62, 9);
    return `<div class="cr">
      <svg class="cr-art" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">
        <defs>${crayonFilters(f1, seed)}${crayonFilters(f2, seed + 3)}
        </defs>
        <rect width="${W}" height="${H}" fill="#FFFFFF"/>
        <g fill="${p.stripe}" filter="url(#${f1})">${stripes}</g>
        <rect y="${fold}" width="${W}" height="${H - fold}" fill="#FFFFFF" opacity=".62"/>
        <rect y="${fold - 1}" width="${W}" height="2" fill="#000" opacity=".07"/>
        <path d="${blob}" fill="#FFFFFF"/>
        <path d="${blob}" fill="none" stroke="${p.wave}" stroke-width="9" stroke-linejoin="round" filter="url(#${f2})"/>
      </svg>
      <div class="cr-name fit" data-max="64" data-min="24" style="color:${p.ink}">${esc(nameOr())}</div>
      ${state.pronouns.trim() ? `<div class="cr-pron" style="color:${p.ink}">${esc(state.pronouns.trim())}</div>` : ''}
      <svg class="cr-wax" viewBox="0 0 300 120" width="300" height="120" aria-hidden="true">${speckles(state.name + 'wax', 300, 120, '#FFFFFF', 520)}</svg>
    </div>`;
  }

  const EXTRA_FRONTS = { postcard: postcardFront, slogan: sloganFront, coffee: coffeeFront, licence: licenceFront, crayon: crayonFront };
  const EXTRA_BACKS = { slogan: sloganBack, coffee: coffeeBack, licence: licenceBack };

  Object.assign(TPLS, EXTRA_TPLS);

  const now = new Date();
  const DEFAULTS = {
    tpl: 'volunteer', name: '', pronouns: 'they/them', greet: 1, role: 'volunteer', event: 'design week',
    back: 'how can i help?', mood: 64, flipped: false,
    colors: { volunteer: 0, classic: 0, glow: 0, postcard: 0, slogan: 0, coffee: 0, licence: 0, crayon: 0 },
    shape: 'rect', critter: 'fish', statement: 'you belong here', font: 'comic sans, obviously',
    stickers: 'certified,heart,pencil,nib,gold',
    photo: '',
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
        if (merged.name === 'Alex') merged.name = ''; // the old sample name, not something a visitor typed
        if (!(merged.greet >= 0 && merged.greet < GREETS.length)) merged.greet = DEFAULTS.greet;
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
  const nameOr = () => state.name.trim() || '(visitor)';

  // ---------- templates ----------
  function frontHTML(key = state.tpl) {
    const p = pal(key);
    const name = esc(nameOr());
    const pron = esc(state.pronouns.trim());
    const role = esc(state.role.trim());
    const event = esc(state.event.trim());
    const greet = GREETS[state.greet] || GREETS[0];

    if (EXTRA_FRONTS[key]) return EXTRA_FRONTS[key](p);
    switch (key) {
      case 'classic':
        if (state.shape === 'circle') {
          return `<div class="cl-wrap circle"><div class="cl circle" style="--c:${p.c}">
          <div class="cl-head fit" data-max="40" data-min="14">${esc(greet.toUpperCase())}</div>
          <div class="cl-box">
            <div class="cl-name fit" data-max="70" data-min="26">${name}</div>
            ${pron ? `<div class="cl-pron">${pron}</div>` : ''}
          </div>
        </div></div>`;
        }
        return `<div class="cl-wrap"><div class="cl" style="--c:${p.c}">
          <div class="cl-head fit" data-max="52" data-min="16">${esc(greet.toUpperCase())}</div>
          <div class="cl-box">
            <div class="cl-name fit" data-max="86" data-min="30">${name}</div>
            ${pron ? `<div class="cl-pron">${pron}</div>` : ''}
          </div>
        </div></div>`;

      case 'volunteer':
        return `<div class="vol" style="--a:${p.a}">
          <span class="slot"></span>
          <div class="vol-org">${event ? `<b>${event}</b>` : '&nbsp;'}</div>
          <div class="vol-main">
            <div class="vol-hi fit" data-max="46" data-min="18">${esc(greet)}</div>
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
    if (EXTRA_BACKS[state.tpl]) return EXTRA_BACKS[state.tpl](p);
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
    card.classList.toggle('is-circle', state.tpl === 'classic' && state.shape === 'circle');
    card.classList.toggle('no-box', !!t.noBox);
    $$('.opt[data-k]').forEach((o) => o.setAttribute('aria-checked', String(o.dataset.v === String(state[o.dataset.k]))));
    const tile = $('#photoTile');
    tile.style.backgroundImage = state.photo ? `url('${state.photo}')` : '';
    tile.classList.toggle('has-photo', !!state.photo);
    $('#clearPhoto').hidden = !state.photo;

    if (lan) {
      $('#strap').style.setProperty('--strap', t.strap(p));
      $('#strap').style.setProperty('--strap-ink', t.strapInk || 'rgba(255, 255, 255, .82)');
      const word = (state.event.trim() || 'hello').toUpperCase();
      $('#strapText').textContent = Array(12).fill(word).join('  •  ');
    }
    stage.dataset.tpl = state.tpl;

    // panel
    $$('.sty').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tpl === state.tpl)));
    $$('[data-for]').forEach((el) => { el.hidden = !t.fields.includes(el.dataset.for); });
    $('[data-ticket="color"]').hidden = !!t.noColor;
    $('[data-ticket="pronouns"]').hidden = !!t.noPronouns;
    $$('#stickerOpts .opt').forEach((o) => o.setAttribute('aria-checked', String(state.stickers.split(',').includes(o.dataset.s))));
    $$('.row').forEach((row) => { row.hidden = [...row.children].every((c) => c.hidden); });
    renderSwatches();
    syncFlip(lan);
    $('#hint').textContent = lan ? 'Drag to swing it, tap to flip it.' : 'Drag it anywhere, tap to stick it down.';
    $$('#greets .greet').forEach((g) => g.setAttribute('aria-checked', String(+g.dataset.i === state.greet)));
    renderTickets();
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
    // the panel scrolls; bring a newly opened ticket fully into view once it has expanded
    if (tk) setTimeout(() => tk.scrollIntoView({ block: 'nearest', behavior: reduceMotion.matches ? 'auto' : 'smooth' }), 300);
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
  // phones: the editor is a side column you open and close; the tag shrinks into the space beside it
  function setEditing(on) {
    document.documentElement.classList.toggle('editing', on);
    $('#editToggle').setAttribute('aria-expanded', String(on));
    if (!on && document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }
  $('#editToggle').addEventListener('click', () => setEditing(true));
  $('#panelClose').addEventListener('click', () => setEditing(false));
  phone.addEventListener('change', () => { if (!phone.matches) setEditing(false); });

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
    ind.style.height = `${on.offsetHeight}px`;
    ind.style.transform = `translate(${on.offsetLeft}px, ${on.offsetTop}px)`;
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
    const editingPhone = phone.matches && document.documentElement.classList.contains('editing');
    const room = editingPhone ? 60 : phone.matches ? 170 : (lan ? 120 : 150); // keep clear of the Save / Flip stack
    scale = clamp(Math.min((H - room) / natH, (W - (editingPhone ? 16 : 32)) / natW), 0.2, lan ? 0.92 : 0.95);
    const ty = lan ? 0 : Math.max(10, (H - natH * scale) / 2 + 8);
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
  let restRot = -2, lastRot = -2;

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
      // stickers lift while you drag and stick flat wherever you let go
      if (held) { vx *= Math.pow(0.03, dt); vy *= Math.pow(0.03, dt); }
      else { vx = 0; vy = 0; }
      const lim = stickerLimits();
      x = clamp(x, -lim.x, lim.x);
      y = clamp(y, -lim.y, lim.y);
      const rot = held ? restRot + clamp(vx * 0.02, -14, 14) : restRot;
      lastRot = rot;
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
    if (!drag.moved && Math.hypot(dx, dy) > 6) {
      drag.moved = true;
      if (!isLanyard()) { rig.classList.add('lifted'); flipEl.classList.remove('stick', 'slap'); }
    }
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
    const placed = drag.moved && !isLanyard();
    drag = null;
    if (placed) stickDown();
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

  // the sticker presses onto the paper: a quick squash, the shadow tightens, the tilt settles
  function stickDown() {
    // settle at a fresh tilt each time, either way, leaning a little toward the throw
    restRot = clamp(lastRot * 0.35 + (Math.random() * 10 - 5), -6, 6);
    vx = vy = 0;
    rig.classList.remove('lifted');
    flipEl.classList.remove('stick', 'slap');
    void flipEl.offsetWidth;
    flipEl.classList.add('stick');
  }

  function tap() { if (isLanyard()) flip(); else slap(); }
  function flip() {
    if (!isLanyard()) return;
    state.flipped = !state.flipped;
    card.classList.toggle('is-flipped', state.flipped);
    syncFlip(true);
    if (!reduceMotion.matches) w += (state.flipped ? 1 : -1) * 1.1;
    save();
  }
  function slap() {
    flipEl.classList.remove('slap');
    void flipEl.offsetWidth;
    flipEl.classList.add('slap');
    vy += 120;
  }
  flipEl.addEventListener('animationend', () => flipEl.classList.remove('slap', 'stick'));

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
      w = 0; x = y = vx = vy = 0; restRot = lastRot = Math.random() * 6 - 3;
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

  $$('[data-key]').forEach((el) => {
    el.addEventListener('input', () => {
      const k = el.dataset.key;
      state[k] = 'num' in el.dataset ? +el.value : el.value;
      render(); save();
    });
  });

  function syncFlip(lan) {
    const btn = $('#flipBtn');
    btn.disabled = !lan;
    btn.setAttribute('aria-pressed', String(lan && state.flipped));
    $('#flipState').textContent = !lan ? 'Stickers are one-sided' : state.flipped ? 'Showing the back' : 'Showing the front';
  }
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
    const label = $('.act-t', btn);
    label.textContent = 'Printing…';
    btn.classList.add('busy');
    try {
      if (document.fonts) await document.fonts.ready;
      // the exporter loses inline drawings when it copies the page, so for the moment of the
      // snapshot each drawing on the card becomes an identical image; render() puts them back
      await Promise.all($$('svg', card).map((svg) => {
        const box = svg.getBoundingClientRect();
        if (!box.width || !box.height) return null;
        const w = svg.clientWidth || box.width;
        const h = svg.clientHeight || box.height;
        const copy = svg.cloneNode(true);
        copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        copy.setAttribute('width', w);
        copy.setAttribute('height', h);
        const img = new Image();
        img.className = svg.getAttribute('class') || '';
        img.setAttribute('style', `${svg.getAttribute('style') || ''};width:${w}px;height:${h}px;max-width:none`);
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(copy))}`;
        svg.replaceWith(img);
        return img.decode().catch(() => {});
      }));
      const canvas = await window.html2canvas(card, {
        backgroundColor: null,
        scale: 3,
        logging: false,
        onclone: (doc) => doc.documentElement.classList.add('exporting'),
      });
      const url = canvas.toDataURL('image/png');
      const fileName = `${(state.name.trim() || 'visitor').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'visitor'}-tag.png`;
      $('#saveImg').src = url;
      const link = $('#dlgDownload');
      link.href = url;
      link.download = fileName;
      // on phones, offer the share sheet so the tag can go straight to Photos
      shareFile = null;
      const shareBtn = $('#dlgShare');
      shareBtn.hidden = true;
      link.classList.remove('secondary');
      const blob = await new Promise((done) => canvas.toBlob(done, 'image/png'));
      if (blob && typeof File === 'function' && navigator.canShare) {
        const file = new File([blob], fileName, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          shareFile = file;
          shareBtn.hidden = false;
          link.classList.add('secondary');
        }
      }
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    } catch (err) {
      console.error(err);
      toast("Couldn't make the picture. Try again in a moment.");
    } finally {
      render();
      btn.disabled = false;
      label.textContent = 'Save PNG';
      btn.classList.remove('busy');
    }
  });
  let shareFile = null;
  $('#dlgShare').addEventListener('click', async () => {
    if (!shareFile) return;
    try {
      await navigator.share({ files: [shareFile], title: 'My name tag' });
    } catch (err) {
      if (err && err.name !== 'AbortError') toast('Sharing isn\'t available here. Long-press the picture to save it.');
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
  // the classic sticker comes as a rectangle or a circle
  function applyShape() {
    Object.assign(TPLS.classic, state.shape === 'circle' ? { w: 360, h: 360 } : { w: 440, h: 316 });
  }
  $('#stickerOpts').innerHTML = Object.entries(LIC_STICKERS).map(([k, v]) =>
    `<button type="button" class="stk-opt opt" role="checkbox" aria-checked="false" data-s="${k}" aria-label="${v.label}" title="${v.label}"><span class="stk-prev">${v.art('MV')}</span></button>`).join('');
  $('#stickerOpts').addEventListener('click', (e) => {
    const o = e.target.closest('.opt[data-s]');
    if (!o) return;
    const set = new Set(state.stickers.split(',').filter(Boolean));
    if (set.has(o.dataset.s)) set.delete(o.dataset.s); else set.add(o.dataset.s);
    state.stickers = [...set].join(',');
    render(); save(); kick(1.2);
  });
  $('#confetti').innerHTML = confettiHTML();

  // option buttons inside tickets (sticker shape, postcard buddy, slogan look)
  $('#tickets').addEventListener('click', (e) => {
    const o = e.target.closest('.opt[data-k]');
    if (!o || o.dataset.v === String(state[o.dataset.k])) return;
    state[o.dataset.k] = o.dataset.v;
    if (o.dataset.k === 'shape') applyShape();
    render(); layout(); save();
    if (isLanyard()) kick(1.4); else slap();
  });

  // licence photo: shrink it and turn it black and white, like a photo-booth strip
  $('#f-photo').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, 320 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, c.width, c.height);
      const px = ctx.getImageData(0, 0, c.width, c.height);
      const d = px.data;
      for (let i = 0; i < d.length; i += 4) {
        const g = Math.min(255, (0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]) * 1.06 + 6);
        d[i] = g; d[i + 1] = g * 0.97; d[i + 2] = g * 0.92;
      }
      ctx.putImageData(px, 0, 0);
      state.photo = c.toDataURL('image/jpeg', 0.85);
      URL.revokeObjectURL(url);
      render(); save(); kick(1.4);
    };
    img.onerror = () => { URL.revokeObjectURL(url); toast("That file didn't open as an image. Try a JPG or PNG."); };
    img.src = url;
  });
  $('#clearPhoto').addEventListener('click', () => { state.photo = ''; render(); save(); });

  applyShape();
  syncInputs();
  render();
  layout();
  if (document.fonts) {
    document.fonts.ready.then(() => { render(); layout(); });
    // web fonts can arrive after the first fit; refit whenever one finishes so names never get clipped
    document.fonts.addEventListener('loadingdone', () => { render(); layout(); });
  }
  requestAnimationFrame((time) => { last = time; frame(time); });
})();
