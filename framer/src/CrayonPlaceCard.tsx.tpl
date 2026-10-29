// @ts-nocheck
// Crayon Place Card — the hello, i'm_ crayon tag as a static card. Text wraps onto two lines and
// shrinks to fit inside the crayon frame; the card scales to whatever box you give it.
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
    if (typeof document === "undefined" || document.getElementById("ntag-fonts")) return
    const link = document.createElement("link")
    link.id = "ntag-fonts"
    link.rel = "stylesheet"
    link.href = FONTS
    document.head.appendChild(link)
}

const HAND = '"Gaegu", "Segoe Print", "Comic Sans MS", cursive'

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 * @framerIntrinsicWidth 440
 * @framerIntrinsicHeight 300
 */
export default function CrayonPlaceCard(props) {
    const { text, sub, colorway, tilt, shadow, wobble } = props
    const p = PALETTES[colorway] || PALETTES.Sunshine
    const seed = (hash(text + colorway) % 50) + 1
    const art = useMemo(() => artSVG(p, seed), [colorway, seed])
    const wax = useMemo(() => speckles(text + "wax", 320, 140, "#FFFFFF", 560), [text])

    const box = useRef(null)
    const textRef = useRef(null)
    const [scale, setScale] = useState(1)
    const [size, setSize] = useState(56)
    const [hover, setHover] = useState(false)

    useEffect(ensureFonts, [])

    // scale the 440 x 300 card to fit the frame Framer gives it
    useLayoutEffect(() => {
        const el = box.current
        if (!el) return
        const fit = () => {
            const s = Math.min(el.clientWidth / W, el.clientHeight / H)
            if (s > 0) setScale(s * 0.94)
        }
        fit()
        const ro = new ResizeObserver(fit)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

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

    const lift = wobble && hover
    return (
        <div
            ref={box}
            style={{ width: "100%", height: "100%", position: "relative", display: "grid", placeItems: "center", overflow: "visible", ...props.style }}
            onPointerEnter={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
        >
            <div
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: W,
                    height: H,
                    borderRadius: 6,
                    overflow: "hidden",
                    transform: `translate(-50%, -50%) scale(${scale}) rotate(${lift ? tilt * -0.4 : tilt}deg) translateY(${lift ? -4 : 0}px)`,
                    transition: "transform .35s cubic-bezier(.3, 1.4, .5, 1), box-shadow .35s",
                    boxShadow: shadow
                        ? lift
                            ? "0 2px 6px rgba(15,15,30,.12), 0 30px 40px -18px rgba(15,15,30,.35)"
                            : "0 1px 2px rgba(15,15,30,.14), 0 10px 18px -10px rgba(15,15,30,.28)"
                        : "none",
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
    )
}

CrayonPlaceCard.defaultProps = {
    text: "welcome to my playground",
    sub: "manasi :)",
    colorway: "Sunshine",
    tilt: -2,
    shadow: true,
    wobble: true,
}

addPropertyControls(CrayonPlaceCard, {
    text: { type: ControlType.String, title: "Text", defaultValue: "welcome to my playground", displayTextArea: true },
    sub: { type: ControlType.String, title: "Corner note", defaultValue: "manasi :)" },
    colorway: { type: ControlType.Enum, title: "Colors", options: Object.keys(PALETTES), defaultValue: "Sunshine" },
    tilt: { type: ControlType.Number, title: "Tilt", min: -10, max: 10, step: 0.5, unit: "°", defaultValue: -2 },
    shadow: { type: ControlType.Boolean, title: "Shadow", defaultValue: true },
    wobble: { type: ControlType.Boolean, title: "Hover lift", defaultValue: true },
})
