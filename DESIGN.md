# Design system — Worldwide Invest

<!-- impeccable:design-schema 1 -->

## Overview

Dark cartographic projection-room identity for a partnership-facing investment marketing site. Capital as geography: map routes, brass accent, institutional calm. Persuade mode; one conversion (partnership contact).

## Color

| Token | Value | Role |
| --- | --- | --- |
| `--bg` | `#0b1018` | Page ground |
| `--bg-elev` | `#121a24` | Contact band |
| `--ink` | `#e8e6e0` | Primary text |
| `--ink-soft` | `#b4bac4` | Supporting copy |
| `--muted` | `#8a9aab` | Meta / disclaimer |
| `--brass` | `#c4a574` | Accent, CTA, tags |
| `--map` | `#6a8fa3` | Cartography lines |
| `--line` | `#2a3848` | Rules / borders |

Strategy: restrained — neutrals plus brass; map cyan/slate reserved for SVG atmosphere.

## Typography

| Role | Face | Notes |
| --- | --- | --- |
| Display / UI | Bricolage Grotesque | Brand, headings, buttons, nav |
| Body | Source Serif 4 | Lede and paragraphs |
| Mono | Source Code Pro | Coordinates, domain, market tags |

## Layout

- Fixed frosted header; full-bleed hero map; sections separated by hairline rules.
- Markets as indexed end-tag rows (EQ / DA / EN / XA), not icon cards.
- Partnerships as three ruled columns (stack on small screens).
- Max readable measure ~36–42rem on body blocks.

## Motion

- Slow map drift; dashed-route pulse; node glow.
- Disabled under `prefers-reduced-motion`.

## Components

- Primary button: solid brass fill, dark ink.
- Ghost button: hairline border, transparent fill.
- Nav CTA: brass outline chip.
- Market tag: mono brass label.

## Do not

- Invent AUM, licenses, clients, awards, or performance.
- Hero stats strips, icon-card grids, purple/glow fintech cues.
- Eyebrow kickers above headings.
