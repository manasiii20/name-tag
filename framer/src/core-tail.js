  const tpl = () => TPLS[state.tpl];
  const pal = (key = state.tpl) => { const t = TPLS[key]; return t.palettes[(state.colors[key] || 0) % t.palettes.length]; };
  const LABELS = { classic: 'Classic', volunteer: 'Say Hi', glow: 'Montu', postcard: 'Postcard', coffee: 'Sparky', slogan: 'Motto', crayon: 'Crayons', licence: 'Licenced' };
  const isLanyard = () => tpl().kind === 'lanyard';
  const strapLen = () => clamp(opts.strapLength == null ? 90 : opts.strapLength, 20, 400); // visible strap above the clip
  const lanH = () => strapLen() + 24 + 440; // tallest hanging rig (strap + clip + portrait card)
  const SLOT_W = 500; // width the card area is sized for, so it doesn't jump between types

  // ---------- dom ----------
  root.classList.add('ntag');
  root.innerHTML = `
    <div class="ntag-stage">
      <div class="mount"><div class="drop"><div class="rig">
        <div class="strap"><span></span></div>
        <div class="clip" aria-hidden="true"><span class="clip-body"></span><span class="clip-stem"></span><span class="clip-ring"></span></div>
        <div class="card" tabindex="0" role="button">
          <div class="flip"><div class="face front"></div><div class="face back"></div></div>
        </div>
      </div></div></div>
      <p class="ntag-hint"></p>
    </div>
    <div class="ntag-picker" role="group" aria-label="Card type"></div>`;
  const stage = $('.ntag-stage');
  const mount = $('.mount');
  const drop = $('.drop');
  const rig = $('.rig');
  const card = $('.card');
  const flipEl = $('.flip');
  const front = $('.face.front');
  const back = $('.face.back');
  const picker = $('.ntag-picker');

  function fitAll() {
    $$('.fit', rig).forEach((el) => {
      let size = +el.dataset.max;
      const min = +el.dataset.min;
      el.style.fontSize = `${size}px`;
      while (el.scrollWidth > el.clientWidth + 1 && size > min) { size -= 2; el.style.fontSize = `${size}px`; }
    });
    $$('.fitblock', rig).forEach((el) => {
      let size = +el.dataset.max;
      const min = +el.dataset.min;
      const inner = el.firstElementChild;
      el.style.fontSize = `${size}px`;
      while ((inner.scrollHeight > el.clientHeight + 1 || inner.scrollWidth > el.clientWidth + 1) && size > min) {
        size -= 2; el.style.fontSize = `${size}px`;
      }
    });
  }

  let types = ['coffee'];
  function renderPicker() {
    picker.hidden = !opts.showPicker || types.length < 2;
    picker.innerHTML = types.map((k) => `<button type="button" data-tpl="${k}" aria-pressed="${k === state.tpl}">${esc(LABELS[k] || k)}</button>`).join('');
  }

  function render() {
    Object.assign(TPLS.classic, state.shape === 'circle' ? { w: 360, h: 360 } : { w: 440, h: 316 });
    const t = tpl();
    const lan = t.kind === 'lanyard';
    rig.classList.toggle('sticker', !lan);
    card.classList.toggle('is-circle', state.tpl === 'classic' && state.shape === 'circle');
    const p = pal();
    card.style.setProperty('--cw', `${t.w}px`);
    card.style.setProperty('--ch', `${t.h}px`);
    card.classList.toggle('no-box', !!t.noBox);
    front.innerHTML = frontHTML() + '<div class="sheen"></div>';
    back.innerHTML = lan ? backHTML() + '<div class="sheen"></div>' : '';
    card.classList.toggle('is-flipped', lan && state.flipped);
    const strap = $('.strap');
    if (lan) strap.style.setProperty('--strap', t.strap(p));
    strap.style.setProperty('--strap-ink', t.strapInk || 'rgba(255, 255, 255, .82)');
    strap.style.setProperty('--strap-h', `${400 + strapLen()}px`);
    $('span', strap).textContent = Array(12).fill((state.event.trim() || 'hello').toUpperCase()).join('  •  ');
    const hint = $('.ntag-hint');
    hint.hidden = !opts.showHint;
    hint.textContent = lan ? 'drag to swing, tap to flip' : 'drag it anywhere, it sticks';
    card.setAttribute('aria-label', `Name tag for ${nameOr()}. ${lan ? 'Press Enter to flip it, arrow keys to swing it.' : 'Arrow keys move it.'}`);
    $$('button', picker).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tpl === state.tpl)));
    fitAll();
  }

  // ---------- layout: card space on the left, the type buttons beside it ----------
  let scale = 1;
  function layout() {
    const RW = root.clientWidth - (parseFloat(getComputedStyle(root).paddingLeft) || 0);
    const RH = root.clientHeight;
    if (!RW || !RH) return;
    picker.style.flexWrap = 'nowrap';
    const narrow = RW < (opts.stackBelow || 0) || RW < picker.scrollWidth + 260;
    root.classList.toggle('ntag-narrow', narrow);
    picker.style.flexWrap = narrow ? 'wrap' : 'nowrap';
    const gap = parseFloat(getComputedStyle(root).columnGap) || 40;
    const pickW = narrow ? 0 : picker.scrollWidth + gap;
    const H = stage.clientHeight || RH;
    const hintRoom = (opts.showHint ? 22 : 0) + 34; // the hint, plus room for the card's shadow
    scale = clamp((H - hintRoom) / lanH(), 0.15, opts.maxScale || 1);
    const avail = narrow ? RW : RW - pickW;
    if (SLOT_W * scale > avail) scale = avail / SLOT_W;
    stage.style.width = narrow ? '100%' : `${Math.round(SLOT_W * scale)}px`;
    const t = tpl();
    const natW = t.w + 40;
    const ty = isLanyard() ? 0 : Math.max(6, (H - hintRoom - t.h * scale) / 2 + 6);
    mount.style.width = `${natW}px`;
    mount.style.transform = `translate(-50%, ${ty}px) scale(${scale})`;
    // measure the gap to the buttons from the card's own edge, not from the wider card slot
    // (the card's untransformed right edge, so swinging and stickers' tilt don't change it)
    let edge = card.offsetWidth;
    for (let el = card; el && el !== mount; el = el.offsetParent) edge += el.offsetLeft;
    const cardRight = SLOT_W * scale / 2 + (edge - natW / 2) * scale;
    picker.style.marginLeft = narrow ? '' : `${-Math.max(0, Math.round(SLOT_W * scale) - cardRight)}px`;
    // and line the bottom row of buttons up with the bottom of a hanging card. It's one fixed line
    // for every type, so the buttons stay put when switching between hanging cards and stickers.
    picker.style.marginBottom = narrow ? '' : `${Math.max(0, Math.round(RH - lanH() * scale))}px`;
  }
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(layout) : null;
  if (ro) ro.observe(root);

  // ---------- physics: a pendulum on the lanyard ----------
  const K = 17;
  const D = 1.15;
  let th = 0.32, w = 0, t = 0, last = performance.now(), drag = null, raf = 0, alive = true;
  let x = 0, y = 0, vx = 0, vy = 0, restRot = -2, lastRot = -2;
  // a sticker can go anywhere inside the whole component, not just the card's own slot
  function stickerLimits() {
    const R = root.getBoundingClientRect(), m = mount.getBoundingClientRect(), pad = 8;
    const w = card.offsetWidth * scale, h = card.offsetHeight * scale;
    const left = m.left + (m.width - w) / 2, top = m.top;
    // room for the sticker's tilt, so its corners stay inside too
    const r = Math.abs(restRot) * Math.PI / 180, sn = Math.sin(r), cs = Math.cos(r);
    const ex = pad + (w * cs + h * sn - w) / 2, ey = pad + (w * sn + h * cs - h) / 2;
    return {
      x0: Math.min(0, (R.left + ex - left) / scale), x1: Math.max(0, (R.right - ex - left - w) / scale),
      y0: Math.min(0, (R.top + ey - top) / scale), y1: Math.max(0, (R.bottom - ey - top - h) / scale),
    };
  }
  function frame(time) {
    if (!alive) return;
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
      const twist = flat3d ? 0 : clamp(-w * 6 + th * 12, -32, 32);
      rig.style.transform = `rotate(${th.toFixed(4)}rad)`;
      card.style.setProperty('--twist', `${twist.toFixed(2)}deg`);
      card.style.setProperty('--sh', (th * 1.3 + twist / 70).toFixed(3));
    } else {
      // stickers lift while dragged and stick flat wherever they're dropped
      if (held) { vx *= Math.pow(0.03, dt); vy *= Math.pow(0.03, dt); } else { vx = 0; vy = 0; }
      const lim = stickerLimits();
      x = clamp(x, lim.x0, lim.x1);
      y = clamp(y, lim.y0, lim.y1);
      const rot = held ? restRot + clamp(vx * 0.02, -14, 14) : restRot;
      lastRot = rot;
      rig.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`;
      card.style.setProperty('--twist', '0deg');
      card.style.setProperty('--sh', (x / 260).toFixed(3));
    }
    updateEyes();
    raf = requestAnimationFrame(frame);
  }

  // Montu's eyes follow the pointer and blink now and then
  let ptr = null;
  const onMove = (e) => { ptr = { x: e.clientX, y: e.clientY }; };
  addEventListener('pointermove', onMove, { passive: true });
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
  let blinkTimer = 0;
  (function blink() {
    blinkTimer = setTimeout(() => {
      const pairs = $$('.eye-pair', rig);
      pairs.forEach((e) => e.classList.add('blink'));
      setTimeout(() => pairs.forEach((e) => e.classList.remove('blink')), 130);
      if (alive) blink();
    }, 2000 + Math.random() * 3400);
  })();

  // ---------- pointer: drag to swing, tap to flip ----------
  card.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    card.setPointerCapture(e.pointerId);
    const m = mount.getBoundingClientRect();
    const px = m.left + m.width / 2;
    const py = m.top;
    drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, moved: false, px, py, a0: Math.atan2(e.clientX - px, e.clientY - py), th0: th, x0: x, y0: y, lastT: performance.now(), lastTh: th };
    rig.classList.add('grabbing');
  });
  card.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
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
      const nx = drag.x0 + dx / scale, ny = drag.y0 + dy / scale;
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
    rig.classList.remove('grabbing');
    if (placed) stickDown();
    w = clamp(w, -9, 9);
    if (wasTap) { if (isLanyard()) flip(); else slap(); }
  };
  card.addEventListener('pointerup', endDrag);
  card.addEventListener('pointercancel', endDrag);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (isLanyard()) flip(); else slap(); }
    else if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      const dir = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1;
      if (isLanyard()) w -= dir * 1.6;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') x += dir * 24; else y += dir * 24;
    }
  });
  function stickDown() {
    restRot = clamp(lastRot * 0.35 + (Math.random() * 10 - 5), -6, 6);
    vx = vy = 0;
    rig.classList.remove('lifted');
    flipEl.classList.remove('stick', 'slap'); void flipEl.offsetWidth; flipEl.classList.add('stick');
  }
  function slap() { flipEl.classList.remove('slap'); void flipEl.offsetWidth; flipEl.classList.add('slap'); }
  function flip() {
    state.flipped = !state.flipped;
    card.classList.toggle('is-flipped', state.flipped);
    if (flat3d && !reduceMotion.matches) { flipEl.classList.remove('flat-flip'); void flipEl.offsetWidth; flipEl.classList.add('flat-flip'); }
    if (!reduceMotion.matches) w += (state.flipped ? 1 : -1) * 1.1;
  }
  flipEl.addEventListener('animationend', () => flipEl.classList.remove('flat-flip', 'slap', 'stick'));

  // ---------- switching card types ----------
  let switching = false, switchTimer = 0;
  function setType(next, animate = true) {
    if (!TPLS[next] || next === state.tpl || switching) return;
    const swap = () => {
      state.tpl = next;
      state.flipped = false;
      render(); layout();
      th = TPLS[next].kind === 'lanyard' ? (Math.random() < 0.5 ? -1 : 1) * 0.4 : 0; w = 0;
      x = y = vx = vy = 0; restRot = lastRot = Math.random() * 6 - 3;
      if (opts.onType) opts.onType(next);
    };
    if (!animate || reduceMotion.matches) { swap(); return; }
    switching = true;
    drop.classList.add('leave');
    switchTimer = setTimeout(() => {
      swap();
      drop.classList.remove('leave');
      drop.classList.add('enter');
      void drop.offsetWidth;
      drop.classList.remove('enter');
      switching = false;
    }, 240);
  }
  picker.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-tpl]');
    if (b) setType(b.dataset.tpl);
  });

  // web fonts can arrive after the first fit; refit whenever one finishes
  const onFonts = () => { if (alive) { render(); layout(); } };
  if (document.fonts) { document.fonts.ready.then(onFonts); document.fonts.addEventListener('loadingdone', onFonts); }

  function update(next) {
    opts = { ...opts, ...next };
    Object.assign(state, next.state || {});
    types = (opts.types && opts.types.length ? opts.types : ['coffee']).filter((k) => TPLS[k]);
    if (!types.includes(state.tpl)) state.tpl = types[0];
    renderPicker();
    render();
    layout();
  }

  update({ ...opts, state: { ...opts.state, tpl: opts.state && opts.state.tpl || 'coffee' } });
  raf = requestAnimationFrame((time) => { last = time; frame(time); });

  return {
    update,
    setType,
    destroy() {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(blinkTimer); clearTimeout(switchTimer);
      removeEventListener('pointermove', onMove);
      if (document.fonts) document.fonts.removeEventListener('loadingdone', onFonts);
      if (ro) ro.disconnect();
      root.innerHTML = '';
      root.classList.remove('ntag');
    },
  };
}
