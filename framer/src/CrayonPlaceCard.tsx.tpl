// @ts-nocheck
// Crayon Place Card — the hello, i'm_ crayon tag as a sticker. Text wraps onto two lines and shrinks to
// fit inside the crayon frame. Viewers can drag it anywhere inside the frame; it lifts while held and
// sticks back down where it's dropped, just like the sticker cards on the site. A tap gives it a slap.
import * as React from "react"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

const FONTS = __FONTS__
const W = 440
const H = 300
const FOLD = 236

const PALETTES = {
    Sunshine: { stripe: "#F6C531", wave: "#F07B1D", ink: "#2B2620" },
    Lagoon: { stripe: "#45C9B4", wave: "#2D5BD9", ink: "#1F2B5C" },
    Bubblegum: { stripe: "#E6577F", wave: "#2F66E0", ink: "#3A1626" },
    Sky: { stripe: "#9CC0F2", wave: "#C9DB2E", ink: "#22314A" },
    Coral: { stripe: "#F27868", wave: "#7A3FD1", ink: "#3A1A16" },
}

/*__CRAYON__*/

let uidCount = Math.floor(Math.random() * 1e6)
const uid = (p) => `${p}${++uidCount}`

function artSVG(p, seed) {
    const f1 = uid("crw"), f2 = uid("crw")
    let stripes = ""
    for (let x = 6; x < W; x += 30) stripes += `<rect x="${x}" y="-10" width="15" height="${H + 20}" rx="4"/>`
    const blob = crayonBlob(W / 2, 112, 158, 74, 9)
    return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true" style="position:absolute;inset:0;display:block">
        <defs>${crayonFilters(f1, seed)}${crayonFilters(f2, seed + 3)}</defs>
        <rect width="${W}" height="${H}" fill="#FFFFFF"/>
        <g fill="${p.stripe}" filter="url(#${f1})">${stripes}</g>
        <rect y="${FOLD}" width="${W}" height="${H - FOLD}" fill="#FFFFFF" opacity=".62"/>
        <rect y="${FOLD - 1}" width="${W}" height="2" fill="#000" opacity=".07"/>
        <path d="${blob}" fill="#FFFFFF"/>
        <path d="${blob}" fill="none" stroke="${p.wave}" stroke-width="9" stroke-linejoin="round" filter="url(#${f2})"/>
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

const HAND = '"Gaegu", "Segoe Print", "Comic Sans MS", cursive'
const SHADOW_REST = "0 1px 1px rgba(15,15,30,.16), 0 4px 8px -4px rgba(15,15,30,.22)"
const SHADOW_LIFT = "0 2px 6px rgba(15,15,30,.1), 0 30px 46px -16px rgba(15,15,30,.42)"
/*__DRAG__*/

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 * @framerIntrinsicWidth 720
 * @framerIntrinsicHeight 480
 */
export default function CrayonPlaceCard(props) {
    const { text, sub, colorway, tilt, shadow, draggable, cardWidth, posX, posY } = props
    const p = PALETTES[colorway] || PALETTES.Sunshine
    const seed = (hash(text + colorway) % 50) + 1
    const art = useMemo(() => artSVG(p, seed), [colorway, seed])
    const wax = useMemo(() => speckles(text + "wax", 320, 140, "#FFFFFF", 560), [text])

    const face = useRef(null)
    const textRef = useRef(null)
    const [size, setSize] = useState(56)
    const { box, lift, moverProps } = useStickerDrag(W, H, {
        tilt, draggable, cardWidth, posX, posY,
        onLift: (on) => { face.current.style.boxShadow = shadow ? (on ? SHADOW_LIFT : SHADOW_REST) : "none" },
    })

    useEffect(ensureFonts, [])

    // shrink the message until it sits inside the frame, wrapping onto as many lines as it needs
    useLayoutEffect(() => {
        const el = textRef.current
        if (!el) return
        const run = () => {
            let s = 58
            el.style.fontSize = `${s}px`
            const inner = el.firstElementChild
            while ((inner.scrollHeight > el.clientHeight + 1 || inner.scrollWidth > el.clientWidth + 1) && s > 18) {
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
            <div {...moverProps} aria-label={draggable ? `${text}. Drag it anywhere, arrow keys move it.` : undefined}>
                <div ref={lift} style={{ width: "100%", height: "100%", transition: "transform .18s ease" }}>
                    <div
                        ref={face}
                        style={{
                            position: "relative", width: "100%", height: "100%", borderRadius: 6, overflow: "hidden",
                            boxShadow: shadow ? SHADOW_REST : "none", transition: "box-shadow .22s ease",
                        }}
                    >
                        <div dangerouslySetInnerHTML={{ __html: art }} />
                        <div
                            ref={textRef}
                            style={{
                                position: "absolute", left: 92, right: 92, top: 52, height: 120,
                                display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
                                font: `700 ${size}px/1 ${HAND}`, color: p.ink, transform: "rotate(-2deg)",
                            }}
                        >
                            <span style={{ display: "block", width: "100%", overflowWrap: "normal" }}>{text}</span>
                        </div>
                        {sub ? (
                            <div style={{ position: "absolute", right: 22, bottom: 16, font: `700 26px/1 ${HAND}`, color: p.ink, transform: "rotate(-2deg)" }}>
                                {sub}
                            </div>
                        ) : null}
                        <svg
                            viewBox="0 0 320 140"
                            width={320}
                            height={140}
                            aria-hidden="true"
                            style={{ position: "absolute", left: 60, top: 42, pointerEvents: "none", opacity: 0.9 }}
                            dangerouslySetInnerHTML={{ __html: wax }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

CrayonPlaceCard.defaultProps = {
    text: "welcome to my playground",
    sub: "manasi :)",
    colorway: "Sunshine",
    tilt: -2,
    shadow: true,
    draggable: true,
    posX: 50,
    posY: 50,
    cardWidth: 440,
}

addPropertyControls(CrayonPlaceCard, {
    text: { type: ControlType.String, title: "Text", defaultValue: "welcome to my playground", displayTextArea: true },
    sub: { type: ControlType.String, title: "Corner note", defaultValue: "manasi :)" },
    colorway: { type: ControlType.Enum, title: "Colors", options: Object.keys(PALETTES), defaultValue: "Sunshine" },
    cardWidth: { type: ControlType.Number, title: "Card width", min: 160, max: 1200, step: 10, unit: "px", defaultValue: 440, description: "The card's size. It shrinks to fit if the frame is smaller; any space left over is room to drag it around." },
    posX: { type: ControlType.Number, title: "Start X", min: 0, max: 100, step: 1, unit: "%", defaultValue: 50, description: "Where the card starts, left to right: 0% at the left edge, 50% in the middle, 100% at the right edge." },
    posY: { type: ControlType.Number, title: "Start Y", min: 0, max: 100, step: 1, unit: "%", defaultValue: 50, description: "Where the card starts, top to bottom." },
    tilt: { type: ControlType.Number, title: "Tilt", min: -10, max: 10, step: 0.5, unit: "°", defaultValue: -2 },
    draggable: { type: ControlType.Boolean, title: "Draggable", defaultValue: true },
    shadow: { type: ControlType.Boolean, title: "Shadow", defaultValue: true },
})
