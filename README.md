# hello, i'm_

A small name tag maker. Pick a style, type your name, swing the badge around, save it as a PNG.

## Styles

| style   | what it is                                                        | extras                                  |
| ------- | ----------------------------------------------------------------- | --------------------------------------- |
| say hi  | "hi, i'm" badge with a highlighted name and a smiley              | dark flip side ("how can i help?")      |
| classic | the red "HELLO, I'M" sticker, rectangle or circle                | greetings incl. "arree, mai hoon"      |
| montu | soft gradient light with a face that watches your cursor          | energy slider changes the glow + eyes   |
| postcard| stamp-edged sticker with a little sea buddy and your name on a line | fish, narwhal or puffer                 |
| motto | lanyard card with your own one-liner                              | your line, stacked, with smileys, bold colours |
| sparky | starburst with your name over a doodled coffee drinker            | four colourways, each with its own shirt|
| licenced | "creative licence" ID on a pale blue lanyard, glitter stars on the desk | photo, least favourite font, pick stickers to stick on |
| crayons | folded place card: crayon stripes, a wavy crayon frame, your name in the middle | pronouns on the fold, five colourways |

## Interactions

- Drag a lanyard badge to swing it (real pendulum physics). Tap or press Enter to flip it.
- Drag a sticker anywhere on the page; it stays where you drop it. Tap to slap it down.
- Picking a greeting or colour gives the badge a little nudge; typing leaves it still.
- Your name stays exactly as you type it. Until you type one, the tag says "(visitor)".
- Each field is a small numbered ticket with a question ("What do we call you?"). Click one to open it; Enter moves to the next.
- Save PNG and Flip are stacked at the bottom left of the stage, so they're always in reach.
- Glow eyes follow your pointer, blink, go sleepy at low energy and happy at high energy.
- **Save PNG** renders the current side as a sharp PNG with a transparent background. On phones, Download PNG opens the share sheet so the picture can go straight to Photos.
- On phones the stage works like desktop (swing, flip, drag). Edit, Flip, Share and Save are icon buttons in the top right (edit opens the tickets beside the tag), and the eight tag types sit in a 2×4 grid along the bottom.
- **Share** (bottom right of the page): email a link, copy a link, or send the picture through the share sheet. The link carries the whole tag (minus the photo), so friends open your exact tag. No backend involved.
- Your tag is remembered in `localStorage`.

## Run it

It's plain HTML, CSS and JS with no build step:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

Fonts come from Google Fonts; PNG export uses [html2canvas](https://html2canvas.hertzen.com/) from cdnjs.

## Files

- `index.html` – markup for the stage and editor panel
- `styles.css` – app UI plus the five tag designs
- `app.js` – state, templates, physics, eye tracking, export
