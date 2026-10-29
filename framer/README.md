# Framer code components

Two components built from the site's own code. Paste the `.tsx` file into a new Framer code component.

- **NameTagLanyard.tsx** – the hanging ID card and its eight card types. Two layouts: **Panel** (the default) hangs the card in the middle with a panel top right, like the site: a title, the type buttons, and the card's details as tickets that open to show each answer (read only). **Buttons beside card** puts just the buttons next to the card, bottom-aligned. You set every detail in the properties panel; viewers swing and flip the hanging cards, drag the stickers anywhere in the frame, and switch types. Button colours, font, radius and case are properties too, so the chips can match your site.
- **CrayonPlaceCard.tsx** – the crayon place card with your own text (wraps onto two lines) and a corner note.

To regenerate after changing the site: `python3 framer/build.py`.
