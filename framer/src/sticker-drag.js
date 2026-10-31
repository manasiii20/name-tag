// ---------- drag it like a sticker: it lifts while held, leans into the drag and sticks down where dropped ----------
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const lerp = (a, b, t) => a + (b - a) * t
const STICK = [{ transform: "scale(1.045)" }, { transform: "scale(.975, .985)", offset: 0.4 }, { transform: "scale(1.006)", offset: 0.72 }, { transform: "scale(1)" }]
const SLAP = [{ transform: "scale(1)" }, { transform: "scale(1.07, .9)", offset: 0.28 }, { transform: "scale(.97, 1.04)", offset: 0.62 }, { transform: "scale(1)" }]

// W x H is the card's own size. Returns refs for the frame (box), the moving card (mover) and the part
// that lifts and squishes (lift), plus the handlers to put on the mover.
function useStickerDrag(W, H, { tilt, draggable, cardWidth, posX = 50, posY = 50, onLift }) {
    const box = useRef(null)
    const mover = useRef(null)
    const lift = useRef(null)
    const liftCb = useRef(onLift)
    liftCb.current = onLift
    // where the card is, kept outside React so dragging stays smooth
    const m = useRef({ x: 0, y: 0, vx: 0, rot: tilt, rest: tilt, scale: 1, drag: null, placed: false })

    // keep the card inside the frame, corners and tilt included
    // (measured at its resting angle, so the lean while it is dragged doesn't push it off the edges)
    const limits = () => {
        const el = box.current, s = m.current
        const r = (Math.abs(s.rest) * Math.PI) / 180, w = W * s.scale, h = H * s.scale
        const ex = (w * Math.cos(r) + h * Math.sin(r)) / 2 + 8, ey = (w * Math.sin(r) + h * Math.cos(r)) / 2 + 8
        return { x: Math.max(0, el.clientWidth / 2 - ex), y: Math.max(0, el.clientHeight / 2 - ey) }
    }
    // the starting spot: 0% hugs the left (or top) edge, 50% is the middle, 100% the right (or bottom)
    const home = () => {
        const s = m.current, lim = limits()
        s.x = ((clamp(posX, 0, 100) - 50) / 50) * lim.x
        s.y = ((clamp(posY, 0, 100) - 50) / 50) * lim.y
    }
    const apply = () => {
        const s = m.current
        if (!box.current || !mover.current) return
        const lim = limits()
        s.x = clamp(s.x, -lim.x, lim.x)
        s.y = clamp(s.y, -lim.y, lim.y)
        mover.current.style.transform = `translate(-50%, -50%) translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px) rotate(${s.rot.toFixed(2)}deg) scale(${s.scale})`
    }

    // size: the card's own width, shrunk to fit if the frame is smaller
    useLayoutEffect(() => {
        const el = box.current
        if (!el) return
        const fit = () => {
            const f = Math.min(el.clientWidth / W, el.clientHeight / H) * 0.94
            if (f > 0) m.current.scale = Math.min(f, (cardWidth || W) / W)
            // until a viewer moves it, the card keeps to its starting spot as the frame resizes
            if (!m.current.placed) home()
            apply()
        }
        fit()
        const ro = new ResizeObserver(fit)
        ro.observe(el)
        return () => ro.disconnect()
    }, [cardWidth])

    useLayoutEffect(() => {
        const s = m.current
        if (!s.drag) { s.rest = s.rot = tilt; s.placed = false; home(); apply() }
    }, [tilt, posX, posY])

    const squish = (frames, ms) => {
        if (lift.current.animate && !matchMedia("(prefers-reduced-motion: reduce)").matches)
            lift.current.animate(frames, { duration: ms, easing: "cubic-bezier(.3, 1.3, .5, 1)" })
    }
    const setLifted = (on) => {
        lift.current.style.transform = on ? "scale(1.045)" : ""
        mover.current.style.cursor = on ? "grabbing" : "grab"
        if (liftCb.current) liftCb.current(on)
    }

    const onPointerDown = (e) => {
        if (!draggable || e.button !== 0) return
        e.currentTarget.setPointerCapture(e.pointerId)
        const s = m.current
        s.drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, x0: s.x, y0: s.y, moved: false, t: performance.now() }
        mover.current.style.transition = "none"
    }
    const onPointerMove = (e) => {
        const s = m.current, d = s.drag
        if (!d || e.pointerId !== d.id) return
        const dx = e.clientX - d.sx, dy = e.clientY - d.sy
        if (!d.moved && Math.hypot(dx, dy) > 6) { d.moved = true; setLifted(true) }
        if (!d.moved) return
        const now = performance.now(), dt = Math.max(8, now - d.t) / 1000
        const nx = d.x0 + dx
        s.vx = lerp(s.vx, (nx - s.x) / dt, 0.5)
        s.x = nx
        s.y = d.y0 + dy
        d.t = now
        // it leans into the direction it's dragged
        s.rot = s.rest + clamp(s.vx * 0.02, -14, 14)
        apply()
    }
    const onPointerUp = (e) => {
        const s = m.current, d = s.drag
        if (!d || e.pointerId !== d.id) return
        s.drag = null
        mover.current.style.transition = "transform .35s cubic-bezier(.3, 1.4, .5, 1)"
        if (d.moved) {
            // stick it down where it was dropped, at a fresh little angle
            s.rest = clamp(s.rot * 0.35 + tilt + (Math.random() * 8 - 4), tilt - 7, tilt + 7)
            s.rot = s.rest
            s.vx = 0
            s.placed = true
            setLifted(false)
            squish(STICK, 380)
            apply()
        } else if (e.type === "pointerup") squish(SLAP, 420)
    }
    const onKeyDown = (e) => {
        if (!draggable) return
        const s = m.current
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); squish(SLAP, 420) }
        else if (e.key.startsWith("Arrow")) {
            e.preventDefault()
            if (e.key === "ArrowLeft") s.x -= 24
            if (e.key === "ArrowRight") s.x += 24
            if (e.key === "ArrowUp") s.y -= 24
            if (e.key === "ArrowDown") s.y += 24
            s.placed = true
            mover.current.style.transition = "transform .25s ease"
            apply()
        }
    }

    const moverProps = {
        ref: mover,
        tabIndex: draggable ? 0 : -1,
        role: draggable ? "button" : undefined,
        onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onKeyDown,
        style: {
            position: "absolute", left: "50%", top: "50%", width: W, height: H,
            cursor: draggable ? "grab" : "default", touchAction: draggable ? "none" : "auto",
            userSelect: "none", WebkitUserSelect: "none", outline: "none",
        },
    }
    return { box, lift, moverProps }
}
