# Gas Town Design System

> "Black & Chrome Edition" - A design system inspired by Mad Max: Fury Road's monochromatic re-release

## Philosophy

Gas Town is an industrial machine. The dashboard should feel like the control panel of a war rig - functional, rugged, and unforgiving. High contrast. No wasted space. Every element serves a purpose.

**Core Principles:**
1. **Chrome on black** - Silver/white elements on dark backgrounds
2. **Industrial clarity** - Information is fuel, present it efficiently
3. **Status at a glance** - Gauges, not graphs
4. **Earned color** - Color is reserved for status only

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | React 18+ | Component architecture |
| Styling | Tailwind CSS 3.4+ | Utility-first styling |
| Components | shadcn/ui | Accessible, customizable primitives |
| Icons | Lucide React | Consistent, clean iconography |
| Animations | Tailwind + CSS | Subtle, purposeful motion |

---

## Color Palette

### Base Colors (Black & Chrome)

```css
:root {
  /* Blacks - The void */
  --black-abyss: #000000;      /* True black, main background */
  --black-oil: #0a0a0a;        /* Elevated surfaces */
  --black-steel: #141414;      /* Cards, panels */
  --black-iron: #1c1c1c;       /* Borders, dividers */

  /* Chromes - The machine */
  --chrome-bright: #ffffff;    /* Primary text, high emphasis */
  --chrome-polish: #e4e4e7;    /* Secondary text */
  --chrome-dust: #a1a1aa;      /* Tertiary text, labels */
  --chrome-rust: #71717a;      /* Disabled, placeholder */
  --chrome-shadow: #3f3f46;    /* Subtle borders */

  /* Accent - War paint */
  --accent-chrome: #d4d4d8;    /* Interactive elements */
  --accent-glow: #fafafa;      /* Hover states */
}
```

### Status Colors (Earned Through State)

```css
:root {
  /* Status - The only colors allowed */
  --status-active: #22c55e;      /* Green - Running hot */
  --status-thinking: #3b82f6;    /* Blue - Processing */
  --status-slow: #eab308;        /* Yellow - Caution */
  --status-unresponsive: #f97316; /* Orange - Warning */
  --status-dead: #ef4444;        /* Red - Critical */
  --status-blocked: #6b7280;     /* Gray - Stopped */
  --status-done: #10b981;        /* Emerald - Complete */

  /* Status backgrounds (10% opacity) */
  --status-active-bg: rgba(34, 197, 94, 0.1);
  --status-thinking-bg: rgba(59, 130, 246, 0.1);
  --status-slow-bg: rgba(234, 179, 8, 0.1);
  --status-unresponsive-bg: rgba(249, 115, 22, 0.1);
  --status-dead-bg: rgba(239, 68, 68, 0.1);
  --status-blocked-bg: rgba(107, 114, 128, 0.1);
  --status-done-bg: rgba(16, 185, 129, 0.1);
}
```

### Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base
        abyss: '#000000',
        oil: '#0a0a0a',
        steel: '#141414',
        iron: '#1c1c1c',

        // Chrome
        chrome: {
          bright: '#ffffff',
          polish: '#e4e4e7',
          dust: '#a1a1aa',
          rust: '#71717a',
          shadow: '#3f3f46',
        },

        // Status
        status: {
          active: '#22c55e',
          thinking: '#3b82f6',
          slow: '#eab308',
          unresponsive: '#f97316',
          dead: '#ef4444',
          blocked: '#6b7280',
          done: '#10b981',
        },
      },

      fontFamily: {
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      boxShadow: {
        'chrome': '0 0 0 1px rgba(255,255,255,0.1)',
        'chrome-lg': '0 0 0 1px rgba(255,255,255,0.1), 0 4px 16px rgba(0,0,0,0.4)',
        'glow': '0 0 20px rgba(255,255,255,0.1)',
        'glow-status': '0 0 12px currentColor',
      },

      backgroundImage: {
        'noise': "url('/noise.png')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },

      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },

      keyframes: {
        glow: {
          '0%': { opacity: '0.5' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
}
```

---

## Typography

### Font Stack

```css
/* Primary - Interface text */
font-family: 'Inter', system-ui, sans-serif;

/* Mono - Code, IDs, technical data */
font-family: 'JetBrains Mono', 'SF Mono', monospace;
```

### Scale

| Name | Size | Weight | Use |
|------|------|--------|-----|
| `display` | 36px / 2.25rem | 700 | Page titles |
| `title` | 24px / 1.5rem | 600 | Section headers |
| `heading` | 18px / 1.125rem | 600 | Card titles |
| `body` | 14px / 0.875rem | 400 | Default text |
| `small` | 12px / 0.75rem | 400 | Labels, captions |
| `micro` | 10px / 0.625rem | 500 | Badges, tags |

### Tailwind Classes

```html
<!-- Display -->
<h1 class="text-4xl font-bold text-chrome-bright">Gas Town</h1>

<!-- Title -->
<h2 class="text-2xl font-semibold text-chrome-bright">Convoys</h2>

<!-- Heading -->
<h3 class="text-lg font-semibold text-chrome-polish">Worker Status</h3>

<!-- Body -->
<p class="text-sm text-chrome-dust">Last activity 2 minutes ago</p>

<!-- Small -->
<span class="text-xs text-chrome-rust">gt-abc12</span>

<!-- Mono (IDs, code) -->
<code class="font-mono text-xs text-chrome-dust">polecat-alpha</code>
```

---

## Components

### Card (Panel)

The fundamental container. Steel panels with chrome edges.

```tsx
// components/ui/panel.tsx
import { cn } from "@/lib/utils"

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'inset'
}

export function Panel({ className, variant = 'default', ...props }: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-chrome-shadow/50",
        {
          'bg-steel': variant === 'default',
          'bg-oil shadow-chrome-lg': variant === 'elevated',
          'bg-abyss border-iron': variant === 'inset',
        },
        className
      )}
      {...props}
    />
  )
}
```

```html
<!-- Usage -->
<Panel className="p-4">
  <h3 class="text-lg font-semibold text-chrome-bright">Convoy Status</h3>
  <p class="text-sm text-chrome-dust">3 of 5 issues complete</p>
</Panel>
```

### Status Badge

Color only appears here. Earned through state.

```tsx
// components/ui/status-badge.tsx
import { cn } from "@/lib/utils"
import {
  Activity, Brain, Clock, AlertTriangle,
  XCircle, Lock, CheckCircle
} from "lucide-react"

type Status = 'active' | 'thinking' | 'slow' | 'unresponsive' | 'dead' | 'blocked' | 'done'

const statusConfig: Record<Status, { icon: any, label: string, class: string }> = {
  active: {
    icon: Activity,
    label: 'Active',
    class: 'text-status-active bg-status-active/10 border-status-active/30'
  },
  thinking: {
    icon: Brain,
    label: 'Thinking',
    class: 'text-status-thinking bg-status-thinking/10 border-status-thinking/30'
  },
  slow: {
    icon: Clock,
    label: 'Slow',
    class: 'text-status-slow bg-status-slow/10 border-status-slow/30'
  },
  unresponsive: {
    icon: AlertTriangle,
    label: 'Unresponsive',
    class: 'text-status-unresponsive bg-status-unresponsive/10 border-status-unresponsive/30'
  },
  dead: {
    icon: XCircle,
    label: 'Dead',
    class: 'text-status-dead bg-status-dead/10 border-status-dead/30'
  },
  blocked: {
    icon: Lock,
    label: 'Blocked',
    class: 'text-status-blocked bg-status-blocked/10 border-status-blocked/30'
  },
  done: {
    icon: CheckCircle,
    label: 'Done',
    class: 'text-status-done bg-status-done/10 border-status-done/30'
  },
}

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium",
      config.class
    )}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}
```

### Progress Gauge

Industrial progress indicator. Like a fuel gauge.

```tsx
// components/ui/gauge.tsx
import { cn } from "@/lib/utils"

interface GaugeProps {
  value: number  // 0-100
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function Gauge({ value, size = 'md', showLabel = true }: GaugeProps) {
  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "flex-1 bg-iron rounded-full overflow-hidden",
        sizes[size]
      )}>
        <div
          className="h-full bg-gradient-to-r from-chrome-dust to-chrome-bright rounded-full transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono text-chrome-dust w-10 text-right">
          {value}%
        </span>
      )}
    </div>
  )
}
```

### Worker Card

Displays a polecat/worker with status.

```tsx
// components/workers/worker-card.tsx
import { Panel } from "@/components/ui/panel"
import { StatusBadge } from "@/components/ui/status-badge"
import { Terminal, GitBranch, Clock } from "lucide-react"

interface WorkerCardProps {
  name: string
  status: Status
  issue?: string
  branch?: string
  lastActivity?: string
}

export function WorkerCard({ name, status, issue, branch, lastActivity }: WorkerCardProps) {
  return (
    <Panel className="p-4 hover:border-chrome-shadow transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-chrome-rust" />
          <span className="font-mono text-sm text-chrome-bright">{name}</span>
        </div>
        <StatusBadge status={status} />
      </div>

      {issue && (
        <p className="text-sm text-chrome-dust mb-2">{issue}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-chrome-rust">
        {branch && (
          <span className="flex items-center gap-1">
            <GitBranch className="w-3 h-3" />
            <span className="font-mono">{branch}</span>
          </span>
        )}
        {lastActivity && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {lastActivity}
          </span>
        )}
      </div>
    </Panel>
  )
}
```

### Convoy Row

Expandable convoy display.

```tsx
// components/convoys/convoy-row.tsx
import { useState } from "react"
import { ChevronRight, ChevronDown, Truck } from "lucide-react"
import { Gauge } from "@/components/ui/gauge"
import { cn } from "@/lib/utils"

interface ConvoyRowProps {
  id: string
  title: string
  progress: number
  issueCount: { completed: number, total: number }
  children?: React.ReactNode
}

export function ConvoyRow({ id, title, progress, issueCount, children }: ConvoyRowProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-b border-iron last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-4 hover:bg-oil/50 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-chrome-rust" />
        ) : (
          <ChevronRight className="w-4 h-4 text-chrome-rust" />
        )}

        <Truck className="w-4 h-4 text-chrome-dust" />

        <div className="flex-1 text-left">
          <span className="text-sm text-chrome-bright">{title}</span>
          <span className="ml-2 text-xs font-mono text-chrome-rust">{id}</span>
        </div>

        <span className="text-xs text-chrome-dust">
          {issueCount.completed}/{issueCount.total}
        </span>

        <div className="w-32">
          <Gauge value={progress} size="sm" showLabel={false} />
        </div>
      </button>

      {expanded && children && (
        <div className="px-4 pb-3 pl-12 bg-oil/30">
          {children}
        </div>
      )}
    </div>
  )
}
```

### Action Button

Chrome buttons that demand attention only when needed.

```tsx
// components/ui/action-button.tsx
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
  loading?: boolean
  icon?: React.ReactNode
}

export function ActionButton({
  className,
  variant = 'default',
  size = 'md',
  loading,
  icon,
  children,
  disabled,
  ...props
}: ActionButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all",
        "focus:outline-none focus:ring-2 focus:ring-chrome-shadow focus:ring-offset-2 focus:ring-offset-abyss",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        {
          // Variants
          'bg-chrome-bright text-abyss hover:bg-chrome-polish': variant === 'default',
          'bg-status-dead/20 text-status-dead border border-status-dead/30 hover:bg-status-dead/30': variant === 'danger',
          'text-chrome-dust hover:text-chrome-bright hover:bg-iron': variant === 'ghost',
          // Sizes
          'text-xs px-2 py-1': size === 'sm',
          'text-sm px-3 py-1.5': size === 'md',
        },
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon}
      {children}
    </button>
  )
}
```

---

## Layout

### Page Structure

```tsx
// app/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-abyss text-chrome-bright">
      {/* Header - The War Rig's dashboard */}
      <header className="sticky top-0 z-50 border-b border-iron bg-oil/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 text-chrome-bright" />
            <span className="text-lg font-bold tracking-tight">GAS TOWN</span>
          </div>
          <nav className="flex items-center gap-1">
            {/* Nav items */}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
```

### Grid System

```html
<!-- Town overview - 3 column stats -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <Panel>...</Panel>
  <Panel>...</Panel>
  <Panel>...</Panel>
</div>

<!-- Two column layout -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div class="lg:col-span-2">
    <!-- Main content (convoys, workers) -->
  </div>
  <div>
    <!-- Sidebar (events, actions) -->
  </div>
</div>

<!-- Worker grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <WorkerCard ... />
  <WorkerCard ... />
  <WorkerCard ... />
</div>
```

---

## Icons (Lucide)

### Standard Icon Set

| Concept | Icon | Usage |
|---------|------|-------|
| Town/Home | `Flame` | Gas Town logo, home |
| Rig/Project | `Container` | Rig identifier |
| Convoy | `Truck` | Convoy/batch work |
| Worker/Polecat | `Terminal` | Worker sessions |
| Issue/Task | `Circle` / `CheckCircle` | Issue status |
| Branch | `GitBranch` | Git branches |
| Merge | `GitMerge` | Merge queue |
| Time | `Clock` | Timestamps, durations |
| Settings | `Settings` | Configuration |
| Expand/Collapse | `ChevronRight` / `ChevronDown` | Accordion |
| Back | `ArrowLeft` | Navigation |
| External | `ExternalLink` | Open in new tab |
| Refresh | `RefreshCw` | Manual refresh |
| Alert | `AlertTriangle` | Warnings |
| Error | `XCircle` | Errors |
| Success | `CheckCircle` | Completion |
| Info | `Info` | Information |

### Icon Sizing

```html
<!-- Inline with text -->
<Icon className="w-4 h-4" />

<!-- Card header -->
<Icon className="w-5 h-5" />

<!-- Feature icon -->
<Icon className="w-6 h-6" />

<!-- Hero/empty state -->
<Icon className="w-12 h-12" />
```

---

## Motion

### Principles

1. **Purposeful** - Motion communicates state change
2. **Quick** - 150-200ms for most transitions
3. **Subtle** - No bouncing, no overshooting
4. **Respectful** - Honor `prefers-reduced-motion`

### Standard Transitions

```css
/* Default transition */
transition: all 150ms ease;

/* Color/opacity changes */
transition: color 150ms ease, opacity 150ms ease;

/* Layout changes */
transition: all 200ms ease-out;

/* Expand/collapse */
transition: height 200ms ease-out, opacity 150ms ease;
```

### Tailwind Classes

```html
<!-- Interactive hover -->
<div class="transition-colors hover:bg-oil/50">

<!-- Expanding panel -->
<div class="transition-all duration-200 ease-out">

<!-- Status glow -->
<span class="animate-pulse-slow">
```

---

## Responsive Breakpoints

```javascript
// Tailwind defaults
screens: {
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Large desktop
}
```

### Mobile Considerations

```html
<!-- Stack on mobile, grid on desktop -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">

<!-- Hide on mobile -->
<span class="hidden md:inline">

<!-- Full width button on mobile -->
<button class="w-full md:w-auto">
```

---

## Accessibility

### Color Contrast

All text meets WCAG AA standards:
- Chrome bright (#ffffff) on Abyss (#000000): 21:1
- Chrome dust (#a1a1aa) on Steel (#141414): 7.5:1
- Status colors designed for colorblind accessibility

### Focus States

```css
/* All interactive elements */
focus:outline-none
focus:ring-2
focus:ring-chrome-shadow
focus:ring-offset-2
focus:ring-offset-abyss
```

### Screen Reader

```html
<!-- Status with label -->
<span class="sr-only">Status:</span>
<StatusBadge status="active" />

<!-- Icon-only buttons -->
<button aria-label="Refresh data">
  <RefreshCw className="w-4 h-4" />
</button>
```

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout with theme
│   ├── page.tsx             # Town overview (Level 0)
│   └── rig/
│       └── [name]/
│           └── page.tsx     # Rig view (Level 1)
├── components/
│   ├── ui/                  # Base components (shadcn)
│   │   ├── panel.tsx
│   │   ├── status-badge.tsx
│   │   ├── gauge.tsx
│   │   ├── action-button.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── nav.tsx
│   │   └── sidebar.tsx
│   ├── convoys/
│   │   ├── convoy-row.tsx
│   │   ├── convoy-detail.tsx
│   │   └── issue-list.tsx
│   ├── workers/
│   │   ├── worker-card.tsx
│   │   ├── worker-grid.tsx
│   │   └── worker-detail.tsx
│   └── events/
│       ├── event-feed.tsx
│       └── event-item.tsx
├── lib/
│   ├── utils.ts             # cn() helper
│   └── api.ts               # API/SSE client
├── hooks/
│   └── use-events.ts        # SSE subscription hook
└── styles/
    └── globals.css          # Tailwind + custom CSS
```

---

## Implementation Checklist (Phase 0)

### Setup
- [ ] Initialize Next.js 14+ with App Router
- [ ] Install and configure Tailwind CSS
- [ ] Install shadcn/ui (`npx shadcn-ui@latest init`)
- [ ] Install Lucide React (`npm install lucide-react`)
- [ ] Configure custom theme in `tailwind.config.js`
- [ ] Set up CSS variables in `globals.css`
- [ ] Install fonts (Inter, JetBrains Mono)

### Base Components
- [ ] Create `Panel` component
- [ ] Create `StatusBadge` component
- [ ] Create `Gauge` component
- [ ] Create `ActionButton` component
- [ ] Set up `cn()` utility

### Layout
- [ ] Create root layout with header
- [ ] Create navigation component
- [ ] Test responsive breakpoints
- [ ] Verify dark mode works

### Verification
- [ ] All colors render correctly
- [ ] Typography scale looks right
- [ ] Status badges display all states
- [ ] Gauge animates smoothly
- [ ] Focus states visible
- [ ] Mobile layout works

---

## Theme Variants (Future)

The design system supports alternative themes by swapping CSS variables:

| Theme | Inspiration | Primary | Accent |
|-------|-------------|---------|--------|
| **Black & Chrome** | Mad Max B&C | #000000 | #ffffff |
| **Rust** | Wasteland | #1a1410 | #d97706 |
| **Neon** | Cyberpunk | #0f0f23 | #00ff88 |
| **Sandstorm** | Fury Road | #1c1917 | #fbbf24 |

---

## References

- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/icons/)
- [Mad Max: Fury Road - Black & Chrome Edition](https://www.imdb.com/title/tt1392190/)
