---
name: Kof Motif
description: Multi-surface creative portfolio — Work collections, Motion, Music, Diary, Shop
colors:
  ground: "#000000"
  foreground: "#FFFFFF"
  muted: "rgba(255, 255, 255, 0.68)"
  line: "rgba(255, 255, 255, 0.14)"
  gutter: "#000000"
  menu: "#050505"
  info-surface: "#000000"
  motion-ink: "#F0F2F1"
typography:
  display:
    fontFamily: "Bodoni Moda, Times New Roman, serif"
    fontWeight: 500
    letterSpacing: "0.04em"
  nav:
    fontFamily: "Archivo, Helvetica Neue, sans-serif"
    fontSize: "0.62rem"
    letterSpacing: "0.22em"
  body:
    fontFamily: "Archivo, Helvetica Neue, sans-serif"
    fontSize: "0.95rem"
    lineHeight: 1.65
  motion-ui:
    fontFamily: "IBM Plex Sans, Helvetica Neue, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    letterSpacing: "normal"
  motion-display:
    fontFamily: "Schibsted Grotesk, Helvetica Neue, sans-serif"
    fontWeight: 500
    letterSpacing: "normal"
rounded:
  none: "0"
spacing:
  gutter: "2px"
  chrome: "1.25rem"
---

# Design System

## Overview

Kof Motif is an image-led multi-surface portfolio. Work collections open into galleries (Oshane Howard–style project depth). Peer tabs: Motion, Music, Diary, Shop. Cinematic film-strip preloader and custom cursor aim at Awwwards-level craft within a black/white photographer grammar (Clennon / Ricc / Collienne). Motion theater borrows the directedbywes grammar (full-bleed stage, off-white HUD ink, oversized centered title).

## Colors

Black ground and gutters. White chrome via `mix-blend-mode: difference` on fixed chrome. Menu is solid near-black `#050505`. Motion theater ink is `#F0F2F1` (not pure white). No accent hue — color lives in photography.

## Typography

**Bodoni Moda** for brand and menu titles. **Archivo** for chrome, captions, body. Bracketed chrome labels `[ Menu ]` echo Oshane Howard’s UI voice without copying his yellow palette.

**Motion only:** **IBM Plex Sans** (14px / 600) for clock, sound, filmstrip meta, and index; **Schibsted Grotesk** (500, fluid ~2.4–8.75rem) for the centered reel title. Letter-spacing stays normal — no Archivo tracking on Motion HUD.

## Layout

Loader → Work mosaic of named collection covers (3-column grid; light scroll parallax on stills). `[MENU]` opens fullscreen nav. Collection overlay: Gregor-style focus viewer with Ricc LIGHT|DARK. Motion List: full-viewport theater. Music: Untitled-style album layout for Renaissance Cruise. Diary: dated rows with thumbs. Shop: 3-col product grid.

## Motion

Cinematic preloader (grain, film strip, count 00–100, clip-path wipe). Section reveals via IntersectionObserver. Hover scale on stills. Custom ring cursor with contextual labels (View / Play / Zoom / Add). Motion theater: Ken Burns stills, live clock + timezone, Sound Off/On (inactive at 0.2 opacity), auto-advancing reels. `prefers-reduced-motion` disables loader animation and cursor.

## Components

- Loader, brand, `[MENU]` overlay, view panels, collection focus, Motion theater/grid, Music, Diary, Shop, About panel, email float, custom cursor

## Do's and Don'ts

**Do** keep Work as named collections; label placeholders; keep hire email findable; keep Motion ink at `#F0F2F1`.

**Don't** invent clients; use Oshane’s yellow/green; skip the loader; open Work as orphan stills without a collection; copy proprietary Wes fonts or assets.
