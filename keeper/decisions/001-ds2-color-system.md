# ADR-001: DS2 Color System

## Status
Accepted

## Date
2026-01-09

## Context
Gas Town Dashboard needed a consistent color system aligned with the "Black & Chrome Edition" aesthetic inspired by Mad Max: Fury Road's monochromatic re-release.

## Decision

### Approved Palette

#### Base Colors
| Name | Hex | Purpose |
|------|-----|---------|
| Carbon Black | `#0B0D10` | Background |
| Gunmetal | `#141820` | Surfaces, panels |
| Chrome Border | `#2A2F3A` | Borders |
| Bone | `#E6E8EB` | Primary text |
| Ash | `#9AA1AC` | Muted text |

#### Accent Colors (use sparingly)
| Name | Hex | Purpose |
|------|-----|---------|
| Rust Orange | `#FF7A00` | Warnings, blockers |
| Fuel Yellow | `#F2C94C` | Active convoys, running systems |
| Acid Green | `#27AE60` | Success, healthy state |

### Status Color Mapping
- **Active/Done**: Acid Green (`#27AE60`)
- **Thinking/Slow**: Fuel Yellow (`#F2C94C`)
- **Unresponsive**: Rust Orange (`#FF7A00`)
- **Dead**: Red (`#ef4444`)
- **Blocked**: Ash (`#9AA1AC`)

### Component Guidelines

#### Panels
- **Default**: `bg-gunmetal` with `border-chrome-border`
- **Elevated**: `bg-gunmetal` with highlight shadow
- **Inset**: `bg-gunmetal` with NO border, inset shadow only

### Removed Legacy Colors
The following aliases were removed in favor of the canonical DS2 names:
- `abyss` → use `carbon-black`
- `oil` → removed (was `#0a0a0a`)
- `steel` → use `gunmetal`
- `iron` → removed (was `#1c1c1c`)
- `chrome-bright` → use `bone`
- `chrome-polish` → removed (was `#e4e4e7`)
- `chrome-dust` → use `ash`
- `chrome-rust` → removed (was `#71717a`)
- `chrome-shadow` → use `chrome-border`

## Consequences

### Positive
- Simplified color vocabulary (5 base + 3 accent colors)
- Clear semantic mapping for status states
- Consistent industrial aesthetic
- Easier onboarding for new components

### Negative
- Breaking change for components using legacy aliases
- Requires audit of all existing components

## Implementation
- CSS variables defined in `globals.css` under `@theme inline`
- Tailwind classes available: `bg-carbon-black`, `text-bone`, etc.
- Status colors: `text-status-active`, `bg-status-thinking-bg`, etc.
