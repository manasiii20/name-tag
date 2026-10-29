// @ts-nocheck
// Name Tag (lanyard) — a hanging ID card for an About section.
// You set the details in Framer's properties panel; viewers can swing it, flip it and switch the card type.
import * as React from "react"
import { useEffect, useRef } from "react"
import { addPropertyControls, ControlType } from "framer"

const CSS = __CSS__
const FONTS = __FONTS__

function ensureStyles() {
    if (typeof document === "undefined") return
    if (!document.getElementById("ntag-fonts")) {
        const link = document.createElement("link")
        link.id = "ntag-fonts"
        link.rel = "stylesheet"
        link.href = FONTS
        document.head.appendChild(link)
    }
    if (!document.getElementById("ntag-styles")) {
        const style = document.createElement("style")
        style.id = "ntag-styles"
        style.textContent = CSS
        document.head.appendChild(style)
    }
}

/*__ENGINE__*/

const TYPES = ["coffee", "volunteer", "glow", "slogan", "licence"]
const TYPE_TITLES = ["Sparky", "Say Hi", "Montu", "Motto", "Licenced"]
const GREETINGS = ["hello, i'm", "hi, i'm", "hello, my name is", "hey, i'm", "hello, who am i again?", "arree, mai hoon", "hola, soy"]
const STICKERS = ["certified", "heart", "pencil", "nib", "gold", "holo", "smiley", "rainbow"]
const STICKER_TITLES = ["Certified creative", "Heart bubble", "Pencil", "Pen nib", "Gold star", "Holo star", "Smiley", "Rainbow"]

function toOpts(p) {
    const types = (p.types && p.types.length ? p.types : TYPES).filter((k) => TYPES.includes(k))
    return {
        showPicker: p.showPicker,
        showHint: p.showHint,
        maxScale: p.maxScale,
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
            colors: { volunteer: +p.sayHiColor || 0, glow: +p.montuColor || 0, slogan: +p.mottoColor || 0, coffee: +p.sparkyColor || 0, licence: 0 },
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

    return <div ref={ref} style={{ width: "100%", height: "100%", ...props.style }} />
}

NameTagLanyard.defaultProps = {
    startWith: "coffee",
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
    showHint: true,
    maxScale: 1,
}

addPropertyControls(NameTagLanyard, {
    startWith: { type: ControlType.Enum, title: "Opens on", options: TYPES, optionTitles: TYPE_TITLES, defaultValue: "coffee" },
    types: {
        type: ControlType.Array,
        title: "Card types",
        control: { type: ControlType.Enum, options: TYPES, optionTitles: TYPE_TITLES },
        defaultValue: TYPES,
    },
    showPicker: { type: ControlType.Boolean, title: "Type picker", defaultValue: true },
    showHint: { type: ControlType.Boolean, title: "Hint", defaultValue: true },
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
    maxScale: { type: ControlType.Number, title: "Max size", min: 0.3, max: 1.5, step: 0.05, defaultValue: 1 },
})
