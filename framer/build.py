#!/usr/bin/env python3
"""Build the Framer code components from the site's own code.

  python3 framer/build.py

Writes framer/NameTagLanyard.tsx and framer/CrayonPlaceCard.tsx. The card templates, styles and
physics come straight from app.js and styles.css, so the components stay in step with the site.
"""
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
APP = (ROOT / 'app.js').read_text()
CSS = (ROOT / 'styles.css').read_text()
SCOPE = '.ntag'
FONTS = ('https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400..900;1,700..900'
         '&family=Archivo+Narrow:wght@600;700&family=Courier+Prime&family=Gaegu:wght@400;700'
         '&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap')


def between(text, start, end, include_end=False):
    a = text.index(start)
    b = text.index(end, a)
    return text[a:b + (len(end) if include_end else 0)]


# ---------- js ----------
templates = between(APP, '  const GREETS = [', '  const now = new Date();\n', include_end=True)
templates = templates.replace('let svgUid = 0;', 'let svgUid = Math.floor(Math.random() * 1e6); // unique ids per instance')
helpers = between(APP, '  // ---------- helpers ----------', '  // ---------- dom ----------')
engine = (HERE / 'src/core-head.js').read_text() + templates + helpers + (HERE / 'src/core-tail.js').read_text()


# ---------- css ----------
def css_section(start, end):
    return between(CSS, start, end)


card_css = css_section('/* ---------- the hanging rig ---------- */', '/* ---------- right panel')

extra_css = '''
:root {
  --white: #FFFFFF; --ink: #141414; --ink-2: #474744; --muted: #8C8B85;
  --edge: rgba(20, 20, 10, .10); --edge-strong: rgba(20, 20, 10, .22); --accent: #141414;
  --f-ui: "Geist", "Helvetica Neue", Helvetica, Arial, sans-serif;
  --f-display: "Archivo", "Helvetica Neue", Arial, sans-serif;
  --f-narrow: "Archivo Narrow", "Arial Narrow", "Helvetica Neue", sans-serif;
  --f-hand: "Gaegu", "Segoe Print", "Comic Sans MS", cursive;
  position: relative; display: flex; flex-direction: row; align-items: stretch; gap: var(--ntag-space, 40px); width: 100%; height: 100%; overflow: visible; padding-left: var(--ntag-pad, 120px);
  font: 400 14px/1.45 var(--f-ui); color: var(--ink); -webkit-font-smoothing: antialiased;
  user-select: none; -webkit-user-select: none;
}
*, *::before, *::after { box-sizing: border-box; }
[hidden] { display: none !important; }
svg, img { display: block; }
/* only the top is clipped (so the strap comes in from the edge); the card may swing past every other side */
.ntag-stage { position: relative; z-index: 2; flex: none; height: 100%; min-width: 0; overflow: visible; clip-path: inset(0 -100vw -100vh -100vw); }
.ntag-hint { position: absolute; left: 0; right: 0; bottom: 2px; margin: 0; text-align: center; font: 400 11px/1.3 var(--ntag-font, var(--f-ui)); color: var(--ntag-hint, #9A9A9A); pointer-events: none; }
/* type buttons: a 4 x 2 grid beside the card, styled like the portfolio's chips */
.ntag-picker { flex: none; align-self: flex-end; padding-bottom: var(--ntag-bottom, 0px); display: grid; grid-template-columns: repeat(var(--ntag-cols, 4), auto); gap: var(--ntag-gap, 8px); position: relative; z-index: 0; }
.ntag-picker button {
  height: var(--ntag-h, 27px); padding: 0 10px; border: 1px solid transparent; border-radius: var(--ntag-radius, 0px); cursor: pointer;
  background: var(--ntag-chip, #F1F1F1); color: var(--ntag-chip-ink, #828282);
  font: 400 12px/1 var(--ntag-font, "Geist Mono", ui-monospace, "SF Mono", Menlo, monospace); text-transform: var(--ntag-case, lowercase); white-space: nowrap;
  transition: color .15s, border-color .15s;
}
.ntag-picker button:hover { color: var(--ntag-accent, #135FEC); }
.ntag-picker button[aria-pressed="true"] { color: var(--ntag-accent, #135FEC); font-weight: 500; border-color: var(--ntag-ring, transparent); }
.ntag-picker button:focus-visible, .card:focus-visible { outline: 2px solid var(--ntag-accent, #135FEC); outline-offset: 2px; }
/* narrow frames: card on top, buttons wrap underneath */
&.ntag-narrow { flex-direction: column; padding-left: 0; }
&.ntag-narrow .ntag-stage { flex: 1; width: 100%; height: auto; }
&.ntag-narrow .ntag-picker { align-self: center; padding-top: 8px; }
.card.no-box .face { box-shadow: none !important; overflow: visible; }
.card.no-box .sheen { display: none; }
.card.no-box:not(.is-flipped) .front .cf, .card.no-box.is-flipped .back .cf { filter: drop-shadow(0 2px 2px rgba(15, 15, 30, .14)) drop-shadow(0 16px 22px rgba(15, 15, 30, .2)); }
/* iOS draws black corners on rounded 3D layers, so there the card flips flat */
@supports (-webkit-touch-callout: none) {
  .card { transform: none !important; }
  .flip { transform: none !important; transition: none; transform-style: flat; }
  .face { -webkit-backface-visibility: visible; backface-visibility: visible; }
  .face.back { transform: none; }
  .flip.flat-flip { animation: flat-flip .38s cubic-bezier(.4, 0, .2, 1); }
  .card:not(.no-box) .face { box-shadow: none; clip-path: inset(0 round 18px); }
  .card:not(.no-box) .flip { filter: drop-shadow(0 2px 3px rgba(15, 15, 30, .14)) drop-shadow(0 18px 22px rgba(15, 15, 30, .22)); }
}
@keyframes flat-flip { 50% { transform: scaleX(.02); } }
@media (prefers-reduced-motion: reduce) {
  .drop, .flip { transition-duration: .01s !important; animation: none !important; }
  .gl-orb { animation: none; }
}
'''


def split_blocks(css):
    """Yield (prelude, body) for each top-level block, or (None, text) for stray text."""
    i, n = 0, len(css)
    while i < n:
        j = css.find('{', i)
        if j < 0:
            break
        prelude = css[i:j].strip()
        depth, k = 1, j + 1
        while depth:
            if css[k] == '{':
                depth += 1
            elif css[k] == '}':
                depth -= 1
            k += 1
        yield prelude, css[j + 1:k - 1]
        i = k


def strip_comments(css):
    return re.sub(r'/\*.*?\*/', '', css, flags=re.S)


def scope_css(css, scope, prefix):
    css = strip_comments(css)
    frames = set()
    out = []

    def sel(s):
        s = s.strip()
        if s in (':root', 'html', 'body'):
            return scope
        if s.startswith('&'):
            return scope + s[1:]
        return f'{scope} {s}'

    def walk(text):
        parts = []
        for prelude, body in split_blocks(text):
            if prelude.startswith('@keyframes'):
                name = prelude.split()[1]
                frames.add(name)
                parts.append(f'@keyframes {prefix}{name} {{{body}}}')
            elif prelude.startswith('@media') or prelude.startswith('@supports'):
                parts.append(f'{prelude} {{{walk(body)}}}')
            else:
                sels = ', '.join(sel(s) for s in prelude.split(',') if s.strip())
                parts.append(f'{sels} {{{body.strip()}}}')
        return '\n'.join(parts)

    out = walk(css)
    for name in sorted(frames, key=len, reverse=True):
        out = re.sub(rf'(animation:\s*){re.escape(name)}\b', rf'\g<1>{prefix}{name}', out)
    return re.sub(r'[ \t]+', ' ', out)


lanyard_css = scope_css(extra_css + card_css, SCOPE, 'ntag-')

# ---------- crayon place card (standalone) ----------
crayon_js = between(APP, '  function crayonFilters(id, seed) {', '  function crayonFront(p) {')
speckles_js = between(APP, '  function speckles(seed, W, H, color, count) {', '  const CRITTERS = {')
hash_js = between(APP, '  function hash(s) {', '  function glowBg(h, energy) {')

# ---------- write ----------
banner = '// Generated by framer/build.py from the hello, i\'m_ site. Edit the site, then rebuild.\n'
lan_tsx = (HERE / 'src/NameTagLanyard.tsx.tpl').read_text()
lan_tsx = lan_tsx.replace('/*__ENGINE__*/', engine).replace('__CSS__', json.dumps(lanyard_css)).replace('__FONTS__', json.dumps(FONTS))
(HERE / 'NameTagLanyard.tsx').write_text(banner + lan_tsx)

cr_tsx = (HERE / 'src/CrayonPlaceCard.tsx.tpl').read_text()
cr_tsx = cr_tsx.replace('/*__CRAYON__*/', hash_js + speckles_js + crayon_js).replace('__FONTS__', json.dumps(FONTS))
(HERE / 'CrayonPlaceCard.tsx').write_text(banner + cr_tsx)

# plain-JS copy of the engine for the local test page
(HERE / 'test' ).mkdir(exist_ok=True)
(HERE / 'test/engine.js').write_text(engine + f'\nwindow.createNameTag = createNameTag;\nwindow.NTAG_CSS = {json.dumps(lanyard_css)};\n')
print('built', len(engine), 'chars of engine,', len(lanyard_css), 'chars of css')
