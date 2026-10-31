// @ts-nocheck
// Ending Notes Postcard — the hello, i'm_ postcard tag as a sticker, with your own small line on top and a
// bigger handwritten message on the line. Viewers can drag it anywhere inside the frame; it lifts while held
// and sticks back down where it's dropped, just like the sticker cards on the site. A tap gives it a slap.
import * as React from "react"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

const FONTS = __FONTS__
const W = 460
const H = 240
const HAND = '"Gaegu", "Segoe Print", "Comic Sans MS", cursive'

const PALETTES = {
    Periwinkle: { frame: "#6460C6", inner: "#FDFBF3", ink: "#2C2A57", speck: null },
    Sunflower: { frame: "#F5D63C", inner: "#E5ECEE", ink: "#2C3A4F", speck: "#9DB0AD" },
    Cherry: { frame: "#8D1120", inner: "#E7EDF0", ink: "#2C3A4F", speck: "#FFFFFF" },
    "Sea glass": { frame: "#3DA88A", inner: "#FFF8EC", ink: "#22423A", speck: "#E8C6A2" },
}
const SHADOW_REST = "drop-shadow(0 1px 1px rgba(15,15,30,.18)) drop-shadow(0 4px 6px rgba(15,15,30,.16))"
const SHADOW_LIFT = "drop-shadow(0 4px 6px rgba(15,15,30,.12)) drop-shadow(0 32px 40px rgba(15,15,30,.32))"

/*__POSTCARD__*/

// the buddies' own oranges and yellows, swapped for purples
const PURPLE = {
    "#E8693A": "#8E7FE8", "#C9512A": "#5E4FC4", "#F9A88A": "#F2A7CF",
    "#E8432E": "#8E7FE8", "#F27B3C": "#B3A7F5", "#F7A07A": "#F2A7CF", "#F9B36B": "#E4DEFF",
    "#F2B530": "#8E7FE8", "#E59A1E": "#6F60D6", "#F7C84A": "#A99CF2", "#FFF3CF": "#F1EEFF", "#F59C7A": "#F2A7CF",
}
const tint = (svg) => svg.replace(/#[0-9A-F]{6}/g, (c) => PURPLE[c] || c)

function postcardSVG(p, seed) {
    const inner = wavyPath(26, 26, W - 52, H - 52, 3.2, 22)
    return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true" style="position:absolute;inset:0;display:block">
        ${scallopFrame(W, H, 7, p.frame)}
        <path d="${inner}" fill="${p.inner}"/>
        ${p.speck ? `<g>${speckles(seed, W, H, p.speck, 140)}</g><path d="${wavyPath(0, 0, W, H, 0, 400)} ${inner}" fill="${p.frame}" fill-rule="evenodd"/>` : ""}
    </svg>`
}

function ensureFonts() {
    if (typeof document === "undefined") return
    let link = document.getElementById("ntag-fonts")
    if (!link) {
        link = document.createElement("link")
        link.id = "ntag-fonts"
        link.rel = "stylesheet"
        document.head.appendChild(link)
    }
    if (link.getAttribute("href") !== FONTS) link.setAttribute("href", FONTS)
}

/*__DRAG__*/

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 * @framerIntrinsicWidth 720
 * @framerIntrinsicHeight 420
 */
export default function EndingNotesPostcard(props) {
    const { greeting, text, colorway, buddy, buddyColor, tilt, shadow, draggable, cardWidth } = props
    const p = PALETTES[colorway] || PALETTES.Periwinkle
    const art = useMemo(() => postcardSVG(p, text + colorway), [colorway, text])
    const critter = useMemo(() => {
        const svg = CRITTERS[buddy] || CRITTERS.narwhal
        return buddyColor === "original" ? svg : tint(svg)
    }, [buddy, buddyColor])

    const face = useRef(null)
    const textRef = useRef(null)
    const [size, setSize] = useState(46)
    const { box, lift, moverProps } = useStickerDrag(W, H, {
        tilt, draggable, cardWidth,
        onLift: (on) => { face.current.style.filter = shadow ? (on ? SHADOW_LIFT : SHADOW_REST) : "none" },
    })

    useEffect(ensureFonts, [])

    // shrink the message until it fits above the line, wrapping onto a second line if it needs to
    useLayoutEffect(() => {
        const el = textRef.current
        if (!el) return
        const run = () => {
            let s = 46
            el.style.fontSize = `${s}px`
            while ((el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1) && s > 16) {
                s -= 2
                el.style.fontSize = `${s}px`
            }
            setSize(s)
        }
        run()
        if (document.fonts) {
            document.fonts.ready.then(run)
            document.fonts.addEventListener("loadingdone", run)
            return () => document.fonts.removeEventListener("loadingdone", run)
        }
    }, [text])

    return (
        <div ref={box} style={{ width: "100%", height: "100%", position: "relative", overflow: "visible", ...props.style }}>
            <div {...moverProps} aria-label={draggable ? `${greeting} ${text}. Drag it anywhere, arrow keys move it.` : undefined}>
                <div ref={lift} style={{ width: "100%", height: "100%", transition: "transform .18s ease" }}>
                    <div
                        ref={face}
                        style={{ position: "relative", width: "100%", height: "100%", filter: shadow ? SHADOW_REST : "none", transition: "filter .22s ease" }}
                    >
                        <div dangerouslySetInnerHTML={{ __html: art }} />
                        <div style={{ position: "absolute", left: 34, top: 64, width: 172 }} dangerouslySetInnerHTML={{ __html: critter }} />
                        <div style={{ position: "absolute", left: 214, right: 44, bottom: 58, display: "flex", flexDirection: "column", gap: 2, color: p.ink }}>
                            {greeting ? <div style={{ font: `700 18px/1 ${HAND}`, opacity: 0.55 }}>{greeting}</div> : null}
                            <div ref={textRef} style={{ maxHeight: 96, font: `700 ${size}px/1.05 ${HAND}`, padding: "0 4px 0 2px", overflowWrap: "normal" }}>
                                {text}
                            </div>
                            <div style={{ height: 2.5, borderRadius: 2, background: p.ink, opacity: 0.85, marginTop: 2 }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

EndingNotesPostcard.defaultProps = {
    greeting: "ending notes",
    text: "building more stuff, brb",
    colorway: "Periwinkle",
    buddy: "narwhal",
    buddyColor: "purple",
    tilt: 2,
    shadow: true,
    draggable: true,
    cardWidth: 460,
}

addPropertyControls(EndingNotesPostcard, {
    greeting: { type: ControlType.String, title: "Small line", defaultValue: "ending notes" },
    text: { type: ControlType.String, title: "Message", defaultValue: "building more stuff, brb", displayTextArea: true },
    colorway: { type: ControlType.Enum, title: "Colors", options: Object.keys(PALETTES), defaultValue: "Periwinkle" },
    buddy: { type: ControlType.Enum, title: "Buddy", options: ["fish", "narwhal", "puffer"], optionTitles: ["Fish", "Narwhal", "Puffer"], defaultValue: "narwhal" },
    buddyColor: { type: ControlType.Enum, title: "Buddy color", options: ["purple", "original"], optionTitles: ["Purple", "Original"], defaultValue: "purple", displaySegmentedControl: true },
    cardWidth: { type: ControlType.Number, title: "Card width", min: 160, max: 1200, step: 10, unit: "px", defaultValue: 460, description: "The card's size. It shrinks to fit if the frame is smaller; any space left over is room to drag it around." },
    tilt: { type: ControlType.Number, title: "Tilt", min: -10, max: 10, step: 0.5, unit: "°", defaultValue: 2 },
    draggable: { type: ControlType.Boolean, title: "Draggable", defaultValue: true },
    shadow: { type: ControlType.Boolean, title: "Shadow", defaultValue: true },
})
