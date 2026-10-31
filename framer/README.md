# Framer code components

Three components built from the site's own code. Paste the `.tsx` file into a new Framer code component.

- **NameTagLanyard.tsx** – the hanging ID card with the eight card types listed beside it (two columns when the frame is short, underneath it when narrow). You set every detail in the properties panel; viewers swing and flip the hanging cards, drag the stickers, and switch types. Button colours, font, radius and case are properties too, so the chips can match your site.
- **CrayonPlaceCard.tsx** – the crayon place card with your own text (wraps onto two lines) and a corner note. It behaves like the site's sticker cards: viewers drag it anywhere inside the frame, it lifts and leans while held and sticks back down where it's dropped; a tap gives it a slap. Set its size with Card width and give the frame extra room to play in.
- **EndingNotesPostcard.tsx** – the postcard tag on its own: a small line on top ("ending notes"), a handwritten message on the line ("building more stuff, brb", wraps onto two lines), and the orange narwhal on a purple stamp frame. It drags and sticks like the crayon card. Buddy and colours are properties.

To regenerate after changing the site: `python3 framer/build.py`.
