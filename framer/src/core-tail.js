  const tpl = () => TPLS[state.tpl];
  const pal = (key = state.tpl) => { const t = TPLS[key]; return t.palettes[(state.colors[key] || 0) % t.palettes.length]; };
  const LABELS = { volunteer: 'Say Hi', glow: 'Montu', slogan: 'Motto', coffee: 'Sparky', licence: 'Licenced' };
  const DROP = { licence: 60 };

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
      <p class="ntag-hint">drag to swing it, tap to flip it</p>
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
    const t = tpl();
    const p = pal();
    card.style.setProperty('--cw', `${t.w}px`);
    card.style.setProperty('--ch', `${t.h}px`);
    card.classList.toggle('no-box', !!t.noBox);
    front.innerHTML = frontHTML() + '<div class="sheen"></div>';
    back.innerHTML = backHTML() + '<div class="sheen"></div>';
    card.classList.toggle('is-flipped', state.flipped);
    const strap = $('.strap');
    strap.style.setProperty('--strap', t.strap(p));
    strap.style.setProperty('--strap-ink', t.strapInk || 'rgba(255, 255, 255, .82)');
    strap.style.setProperty('--strap-h', `${610 + (DROP[state.tpl] || 0)}px`);
    $('span', strap).textContent = Array(12).fill((state.event.trim() || 'hello').toUpperCase()).join('  •  ');
    $('.ntag-hint').hidden = !opts.showHint;
    card.setAttribute('aria-label', `Name tag for ${nameOr()}. Press Enter to flip it, arrow keys to swing it.`);
    $$('button', picker).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tpl === state.tpl)));
    fitAll();
  }

  // ---------- layout: scale the card to the component's size ----------
  function layout() {
    const t = tpl();
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    if (!W || !H) return;
    const natW = t.w + 40;
    const natH = mount.offsetHeight || 640;
    const scale = clamp(Math.min((H - (opts.showHint ? 34 : 14)) / natH, (W - 24) / natW), 0.15, opts.maxScale || 1);
    mount.style.width = `${natW}px`;
    mount.style.transform = `translate(-50%, 0) scale(${scale})`;
  }
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(layout) : null;
  if (ro) ro.observe(stage);

  // ---------- physics: a pendulum on the lanyard ----------
  const K = 17;
  const D = 1.15;
  let th = 0.32, w = 0, t = 0, last = performance.now(), drag = null, raf = 0, alive = true;
  function frame(time) {
    if (!alive) return;
    const dt = Math.min(0.033, (time - last) / 1000);
    last = time; t += dt;
    if (drag && drag.moved) w *= Math.pow(0.03, dt);
    else {
      const breeze = reduceMotion.matches ? 0 : Math.sin(t * 0.9) * 0.16 + Math.sin(t * 2.3) * 0.06;
      w += (-K * Math.sin(th) - D * w + breeze) * dt;
      th += w * dt;
    }
    const twist = flat3d ? 0 : clamp(-w * 6 + th * 12, -32, 32);
    rig.style.transform = `rotate(${th.toFixed(4)}rad)`;
    card.style.setProperty('--twist', `${twist.toFixed(2)}deg`);
    card.style.setProperty('--sh', (th * 1.3 + twist / 70).toFixed(3));
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
    drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, moved: false, px, py, a0: Math.atan2(e.clientX - px, e.clientY - py), th0: th, lastT: performance.now(), lastTh: th };
    rig.classList.add('grabbing');
  });
  card.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) drag.moved = true;
    if (!drag.moved) return;
    const tnow = performance.now();
    const dt = Math.max(8, tnow - drag.lastT) / 1000;
    const a = Math.atan2(e.clientX - drag.px, e.clientY - drag.py);
    const next = clamp(drag.th0 - (a - drag.a0), -1.3, 1.3);
    w = lerp(w, (next - drag.lastTh) / dt, 0.5);
    th = next; drag.lastTh = th; drag.lastT = tnow;
  });
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const wasTap = !drag.moved && e.type === 'pointerup';
    drag = null;
    rig.classList.remove('grabbing');
    w = clamp(w, -9, 9);
    if (wasTap) flip();
  };
  card.addEventListener('pointerup', endDrag);
  card.addEventListener('pointercancel', endDrag);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); w -= (e.key === 'ArrowLeft' ? -1 : 1) * 1.6; }
  });
  function flip() {
    state.flipped = !state.flipped;
    card.classList.toggle('is-flipped', state.flipped);
    if (flat3d && !reduceMotion.matches) { flipEl.classList.remove('flat-flip'); void flipEl.offsetWidth; flipEl.classList.add('flat-flip'); }
    if (!reduceMotion.matches) w += (state.flipped ? 1 : -1) * 1.1;
  }
  flipEl.addEventListener('animationend', () => flipEl.classList.remove('flat-flip'));

  // ---------- switching card types ----------
  let switching = false, switchTimer = 0;
  function setType(next, animate = true) {
    if (!TPLS[next] || next === state.tpl || switching) return;
    const swap = () => {
      state.tpl = next;
      state.flipped = false;
      render(); layout();
      th = (Math.random() < 0.5 ? -1 : 1) * 0.4; w = 0;
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
