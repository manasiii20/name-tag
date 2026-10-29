// @ts-nocheck
// Name Tag — a hanging ID card (or a sticker) for an About section, with the card types listed beside it.
// You set the details in Framer's properties panel; viewers swing, flip or drag it and switch the card type.
import * as React from "react"
import { useEffect, useRef } from "react"
import { addPropertyControls, ControlType } from "framer"

const CSS = __CSS__
const FONTS = __FONTS__

// Always (re)write the styles: Framer keeps the page alive while you edit code, so an older
// version's styles can still be sitting in the page from a previous paste.
function ensureStyles() {
    if (typeof document === "undefined") return
    let link = document.getElementById("ntag-fonts")
    if (!link) {
        link = document.createElement("link")
        link.id = "ntag-fonts"
        link.rel = "stylesheet"
        document.head.appendChild(link)
    }
    if (link.getAttribute("href") !== FONTS) link.setAttribute("href", FONTS)
    const styles = [...document.querySelectorAll("style#ntag-styles")]
    if (styles.length === 1 && styles[0].textContent === CSS) return
    styles.forEach((el) => el.remove())
    const style = document.createElement("style")
    style.id = "ntag-styles"
    style.textContent = CSS
    document.head.appendChild(style)
}

/*__ENGINE__*/

const TYPES = ["classic", "volunteer", "glow", "postcard", "coffee", "slogan", "crayon", "licence"]
const TYPE_TITLES = ["Classic", "Say Hi", "Montu", "Postcard", "Sparky", "Motto", "Crayons", "Licenced"]
const GREETINGS = ["hello, i'm", "hi, i'm", "hello, my name is", "hey, i'm", "hello, who am i again?", "arree, mai hoon", "hola, soy"]
const STICKERS = ["certified", "heart", "pencil", "nib", "gold", "holo", "smiley", "rainbow"]
const STICKER_TITLES = ["Certified creative", "Heart bubble", "Pencil", "Pen nib", "Gold star", "Holo star", "Smiley", "Rainbow"]

function toOpts(p) {
    const types = (p.types && p.types.length ? p.types : TYPES).filter((k) => TYPES.includes(k))
    return {
        layout: p.layout,
        panelTitle: p.panelTitle,
        panelWidth: p.panelWidth,
        showTickets: p.showTickets,
        showPicker: p.showPicker,
        showHint: p.showHint,
        maxScale: p.maxScale,
        stackBelow: p.stackBelow,
        strapLength: p.strapLength,
        types,
        state: {
            tpl: types.includes(p.startWith) ? p.startWith : types[0],
            name: p.name || "",
            pronouns: p.pronouns || "",
            role: p.role || "",
            event: p.event || "",
            greet: Math.max(0, GREETINGS.indexOf(p.greeting)),
            back: p.backText || "",
            statement: p.motto || "",
            font: p.leastFavouriteFont || "",
            photo: p.photo || "",
            stickers: (p.stickers || []).join(","),
            mood: p.energy,
            shape: p.classicShape === "circle" ? "circle" : "rect",
            critter: p.postcardBuddy || "fish",
            colors: {
                classic: +p.classicColor || 0, volunteer: +p.sayHiColor || 0, glow: +p.montuColor || 0, postcard: +p.postcardColor || 0,
                coffee: +p.sparkyColor || 0, slogan: +p.mottoColor || 0, crayon: +p.crayonsColor || 0, licence: 0,
            },
        },
    }
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight fixed
 * @framerIntrinsicWidth 560
 * @framerIntrinsicHeight 620
 */
export default function NameTagLanyard(props) {
    const ref = useRef(null)
    const api = useRef(null)
    const opts = toOpts(props)
    const key = JSON.stringify(opts)

    useEffect(() => {
        ensureStyles()
        api.current = createNameTag(ref.current, opts)
        return () => {
            if (api.current) api.current.destroy()
            api.current = null
        }
    }, [])

    useEffect(() => {
        if (api.current) api.current.update(opts)
    }, [key])

    const look = {
        "--ntag-font": props.buttonFont || undefined,
        "--ntag-chip": props.chipColor,
        "--ntag-chip-ink": props.chipTextColor,
        "--ntag-accent": props.accentColor,
        "--ntag-radius": `${props.chipRadius}px`,
        "--ntag-h": `${props.chipHeight}px`,
        "--ntag-gap": `${props.buttonGap}px`,
        "--ntag-space": `${props.cardGap}px`,
        "--ntag-pad": `${props.swingRoom}px`,
        "--ntag-cols": props.buttonColumns,
        "--ntag-bottom": `${props.buttonsBottom}px`,
        "--ntag-ring": props.selectedOutline ? props.accentColor : "transparent",
        "--ntag-case": props.lowercase ? "lowercase" : "none",
        "--ntag-tickets-gap": `${props.ticketsGap}px`,
        "--ntag-ticket": props.ticketColor,
    }
    return <div ref={ref} style={{ width: "100%", height: "100%", ...look, ...props.style }} />
}

NameTagLanyard.defaultProps = {
    layout: "panel",
    panelTitle: "Which tag are you?",
    panelWidth: 420,
    showTickets: true,
    ticketsGap: 24,
    ticketColor: "#F1F1F1",
    startWith: "coffee",
    classicShape: "rect",
    postcardBuddy: "fish",
    classicColor: "0",
    postcardColor: "0",
    crayonsColor: "0",
    buttonFont: "",
    chipColor: "#F1F1F1",
    chipTextColor: "#828282",
    accentColor: "#135FEC",
    selectedOutline: false,
    chipRadius: 0,
    chipHeight: 27,
    buttonGap: 12,
    cardGap: 48,
    swingRoom: 120,
    buttonColumns: 4,
    buttonsBottom: 0,
    lowercase: true,
    stackBelow: 0,
    strapLength: 90,
    types: TYPES,
    name: "manasi",
    pronouns: "she/her",
    role: "designer",
    event: "my portfolio",
    greeting: "hi, i'm",
    motto: "you belong here",
    backText: "say hi, i don't bite",
    leastFavouriteFont: "comic sans, obviously",
    photo: "",
    stickers: ["certified", "heart", "pencil", "nib", "gold"],
    energy: 64,
    sayHiColor: "0",
    montuColor: "0",
    mottoColor: "0",
    sparkyColor: "0",
    showPicker: true,
    showHint: false,
    maxScale: 1,
}

addPropertyControls(NameTagLanyard, {
    layout: { type: ControlType.Enum, title: "Layout", options: ["panel", "beside"], optionTitles: ["Panel, top right", "Buttons beside card"], defaultValue: "panel", displaySegmentedControl: true, segmentedControlDirection: "vertical" },
    panelTitle: { type: ControlType.String, title: "Panel title", defaultValue: "Which tag are you?", hidden: (p) => p.layout !== "panel" },
    panelWidth: { type: ControlType.Number, title: "Panel width", min: 200, max: 800, step: 10, unit: "px", defaultValue: 420, hidden: (p) => p.layout !== "panel" },
    showTickets: { type: ControlType.Boolean, title: "Details", defaultValue: true, enabledTitle: "Show", disabledTitle: "Hide", hidden: (p) => p.layout !== "panel" },
    ticketsGap: { type: ControlType.Number, title: "Buttons ↔ details", min: 0, max: 80, step: 2, unit: "px", defaultValue: 24, hidden: (p) => p.layout !== "panel" },
    ticketColor: { type: ControlType.Color, title: "Details fill", defaultValue: "#F1F1F1", hidden: (p) => p.layout !== "panel" },
    cardGap: { type: ControlType.Number, title: "Card ↔ buttons", min: 0, max: 400, step: 2, unit: "px", defaultValue: 48, description: "Space between the card area and the buttons." },
    buttonGap: { type: ControlType.Number, title: "Button spacing", min: 0, max: 40, step: 1, unit: "px", defaultValue: 12 },
    startWith: { type: ControlType.Enum, title: "Opens on", options: TYPES, optionTitles: TYPE_TITLES, defaultValue: "coffee" },
    types: {
        type: ControlType.Array,
        title: "Card types",
        control: { type: ControlType.Enum, options: TYPES, optionTitles: TYPE_TITLES },
        defaultValue: TYPES,
    },
    showPicker: { type: ControlType.Boolean, title: "Type picker", defaultValue: true },
    showHint: { type: ControlType.Boolean, title: "Hint", defaultValue: false },
    name: { type: ControlType.String, title: "Name", defaultValue: "manasi" },
    pronouns: { type: ControlType.String, title: "Pronouns", defaultValue: "she/her" },
    role: { type: ControlType.String, title: "Here as", defaultValue: "designer" },
    event: { type: ControlType.String, title: "Event", defaultValue: "my portfolio" },
    greeting: { type: ControlType.Enum, title: "Greeting", options: GREETINGS, defaultValue: "hi, i'm" },
    motto: { type: ControlType.String, title: "Motto line", defaultValue: "you belong here" },
    backText: { type: ControlType.String, title: "Back of card", defaultValue: "say hi, i don't bite" },
    leastFavouriteFont: { type: ControlType.String, title: "Least fav font", defaultValue: "comic sans, obviously" },
    photo: { type: ControlType.Image, title: "Photo" },
    stickers: {
        type: ControlType.Array,
        title: "Stickers",
        control: { type: ControlType.Enum, options: STICKERS, optionTitles: STICKER_TITLES },
        defaultValue: ["certified", "heart", "pencil", "nib", "gold"],
    },
    energy: { type: ControlType.Number, title: "Montu energy", min: 0, max: 100, step: 1, defaultValue: 64 },
    sayHiColor: { type: ControlType.Enum, title: "Say Hi color", options: ["0", "1", "2", "3"], optionTitles: ["Tangerine", "Electric blue", "Hot pink", "Leaf"], defaultValue: "0" },
    montuColor: { type: ControlType.Enum, title: "Montu color", options: ["0", "1", "2", "3", "4"], optionTitles: ["Amber", "Rose", "Lime", "Sky", "Violet"], defaultValue: "0" },
    mottoColor: { type: ControlType.Enum, title: "Motto color", options: ["0", "1", "2", "3"], optionTitles: ["Mint", "Sky", "Blush", "Lemon"], defaultValue: "0" },
    sparkyColor: { type: ControlType.Enum, title: "Sparky color", options: ["0", "1", "2", "3"], optionTitles: ["Sky", "Pink", "Lime", "Tangerine"], defaultValue: "0" },
    classicShape: { type: ControlType.Enum, title: "Classic shape", options: ["rect", "circle"], optionTitles: ["Rectangle", "Circle"], defaultValue: "rect" },
    classicColor: { type: ControlType.Enum, title: "Classic color", options: ["0", "1", "2", "3", "4"], optionTitles: ["Tomato", "Cobalt", "Grass", "Bubblegum", "Licorice"], defaultValue: "0" },
    postcardBuddy: { type: ControlType.Enum, title: "Postcard buddy", options: ["fish", "narwhal", "puffer"], optionTitles: ["Fish", "Narwhal", "Puffer"], defaultValue: "fish" },
    postcardColor: { type: ControlType.Enum, title: "Postcard color", options: ["0", "1", "2", "3"], optionTitles: ["Periwinkle", "Sunflower", "Cherry", "Sea glass"], defaultValue: "0" },
    crayonsColor: { type: ControlType.Enum, title: "Crayons color", options: ["0", "1", "2", "3", "4"], optionTitles: ["Sunshine", "Lagoon", "Bubblegum", "Sky", "Coral"], defaultValue: "0" },
    strapLength: { type: ControlType.Number, title: "Strap length", min: 20, max: 400, step: 5, unit: "px", defaultValue: 90 },
    maxScale: { type: ControlType.Number, title: "Max size", min: 0.3, max: 1.5, step: 0.05, defaultValue: 1 },
    stackBelow: { type: ControlType.Number, title: "Stack below", min: 0, max: 1200, step: 10, unit: "px", defaultValue: 0, description: "Under this width the buttons move under the card. They also move there on their own when the row doesn't fit." },
    buttonFont: { type: ControlType.String, title: "Button font", defaultValue: "", placeholder: "Geist Mono" },
    chipColor: { type: ControlType.Color, title: "Chip", defaultValue: "#F1F1F1" },
    chipTextColor: { type: ControlType.Color, title: "Chip text", defaultValue: "#828282" },
    accentColor: { type: ControlType.Color, title: "Selected text", defaultValue: "#135FEC" },
    selectedOutline: { type: ControlType.Boolean, title: "Selected outline", defaultValue: false },
    chipRadius: { type: ControlType.Number, title: "Chip radius", min: 0, max: 20, step: 1, defaultValue: 0 },
    chipHeight: { type: ControlType.Number, title: "Chip height", min: 20, max: 48, step: 1, defaultValue: 27 },
    swingRoom: { type: ControlType.Number, title: "Swing room", min: 0, max: 300, step: 4, unit: "px", defaultValue: 120, description: "Space on the left so the card can swing without being cut off.", hidden: (p) => p.layout === "panel" },
    buttonColumns: { type: ControlType.Number, title: "Button columns", min: 1, max: 8, step: 1, displayStepper: true, defaultValue: 4 },
    buttonsBottom: { type: ControlType.Number, title: "Buttons lift", min: 0, max: 200, step: 2, unit: "px", defaultValue: 0, description: "Raise the row of buttons from the bottom edge.", hidden: (p) => p.layout === "panel" },
    lowercase: { type: ControlType.Boolean, title: "Lowercase", defaultValue: true },
})
