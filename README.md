# hello, i'm

A small name tag maker. Pick a style, type your name, swing the badge around, save it as a PNG.

## Styles

| style   | what it is                                                        | extras                                  |
| ------- | ----------------------------------------------------------------- | --------------------------------------- |
| classic | the red "HELLO, I'M" sticker, name in marker                      | greeting picker (hola, bonjour, ciao…)  |
| chatty  | speech-bubble sticker with an icebreaker question                 | shuffle questions, write your answer    |
| member  | ID card on a lanyard, typewriter labels, handwritten fields       | upload a photo, barcode on the back     |
| lanyard | "hi, i'm" badge with a highlighted name and a smiley              | dark flip side ("how can i help?")      |
| glow    | soft gradient light with a face that watches your cursor          | energy slider changes the glow + eyes   |

## Interactions

- Drag a lanyard badge to swing it (real pendulum physics). Tap or press Enter to flip it.
- Drag a sticker to fling it; it springs back. Tap to slap it down.
- Typing and picking colors give the badge a little nudge.
- Names get a capital first letter as you type. Change it back to lowercase and it stays that way.
- The style picker shows live mini versions of every tag with your name on them.
- Glow eyes follow your pointer, blink, go sleepy at low energy and happy at high energy.
- **surprise me** rolls a random style, color, question and greeting.
- **save png** renders the current side at 3x with a transparent background.
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
