# hello, i'm_

A small name tag maker. Pick a style, type your name, swing the badge around, save it as a PNG.

## Styles

| style   | what it is                                                        | extras                                  |
| ------- | ----------------------------------------------------------------- | --------------------------------------- |
| lanyard | "hi, i'm" badge with a highlighted name and a smiley              | dark flip side ("how can i help?")      |
| classic | the red "HELLO, I'M" sticker, rectangle or circle                | greetings incl. "arree, mai hoon"      |
| glow    | soft gradient light with a face that watches your cursor          | energy slider changes the glow + eyes   |
| postcard| stamp-edged sticker with a little sea buddy and your name on a line | fish, narwhal or puffer                 |
| slogan  | lanyard card with your own one-liner                              | soft (smileys) or bold (pills) look     |
| coffee  | starburst with your name over a doodled coffee drinker            | four colourways, each with its own shirt|
| licence | landscape "creative licence" ID in a clear holder                 | b&w photo, occupation, place, favourites|

## Interactions

- Drag a lanyard badge to swing it (real pendulum physics). Tap or press Enter to flip it.
- Drag a sticker anywhere on the page; it stays where you drop it. Tap to slap it down.
- Typing and picking colors give the badge a little nudge.
- Your name stays exactly as you type it. Until you type one, the tag says "(visitor)".
- Each field is a small numbered ticket with a question ("What do we call you?"). Click one to open it; Enter moves to the next.
- Save PNG and Flip are stacked at the bottom left of the stage, so they're always in reach.
- Glow eyes follow your pointer, blink, go sleepy at low energy and happy at high energy.
- **Save PNG** renders the current side as a sharp PNG with a transparent background. On phones the save dialog also offers **Save to phone**, which opens the share sheet (Photos, Files, apps).
- On phones the stage works like desktop (swing, flip, drag). **Edit tag** opens the editor as a side column next to the tag; **Done** closes it.
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
