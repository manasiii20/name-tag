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
         '&family=Geist:wght@400;500;600&display=swap')


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


card_css = ''.join([
    css_section('/* ---------- the hanging rig ---------- */', '/* --- classic: HELLO'),
    css_section('/* --- volunteer:', '/* --- postcard:'),
    css_section('/* --- slogan:', '/* --- crayon:'),
    css_section('/* --- glow:', '/* ---------- right panel'),
])

extra_css = '''
:root {
  --white: #FFFFFF; --ink: #141414; --ink-2: #474744; --muted: #8C8B85;
  --edge: rgba(20, 20, 10, .10); --edge-strong: rgba(20, 20, 10, .22); --accent: #141414;
  --f-ui: "Geist", "Helvetica Neue", Helvetica, Arial, sans-serif;
  --f-display: "Archivo", "Helvetica Neue", Arial, sans-serif;
  --f-narrow: "Archivo Narrow", "Arial Narrow", "Helvetica Neue", sans-serif;
  --f-hand: "Gaegu", "Segoe Print", "Comic Sans MS", cursive;
  position: relative; display: flex; flex-direction: column; width: 100%; height: 100%;
  font: 400 14px/1.45 var(--f-ui); color: var(--ink); -webkit-font-smoothing: antialiased;
  user-select: none; -webkit-user-select: none;
}
*, *::before, *::after { box-sizing: border-box; }
[hidden] { display: none !important; }
svg, img { display: block; }
.ntag-stage { position: relative; flex: 1; min-height: 0; overflow: hidden; }
.ntag-hint { position: absolute; left: 0; right: 0; bottom: 8px; margin: 0; text-align: center; font-size: 12px; color: var(--muted); pointer-events: none; }
.ntag-picker { flex: none; display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; padding: 10px 8px 2px; }
.ntag-picker button {
  height: 32px; padding: 0 12px; border: 0; border-radius: 8px; cursor: pointer;
  background: var(--white); color: var(--ink-2); font: 500 13px var(--f-ui); white-space: nowrap;
  box-shadow: 0 0 0 1px var(--edge), 0 1px 2px rgba(20, 20, 10, .04);
  transition: background .15s, color .15s, box-shadow .15s;
}
.ntag-picker button:hover { box-shadow: 0 0 0 1px var(--edge-strong), 0 1px 2px rgba(20, 20, 10, .04); color: var(--ink); }
.ntag-picker button[aria-pressed="true"] { background: var(--ink); color: var(--white); box-shadow: none; }
.ntag-picker button:focus-visible, .card:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
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
