"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import type { Bead, BeadStatus } from "@/lib/gastown"

interface DependencyGraphProps {
  beads: Bead[]
  selectedId?: string
  onSelect?: (bead: Bead) => void
  className?: string
}

interface NodePosition {
  x: number
  y: number
  width: number
  height: number
}

interface LayoutNode {
  bead: Bead
  position: NodePosition
  level: number
  column: number
}

const NODE_WIDTH = 180
const NODE_HEIGHT = 60
const LEVEL_GAP = 100
const NODE_GAP = 24
const PADDING = 40

const statusColors: Record<BeadStatus, { bg: string; border: string; text: string }> = {
  open: { bg: "#141820", border: "#2A2F3A", text: "#9AA1AC" },
  in_progress: { bg: "#1a2030", border: "#F2C94C", text: "#F2C94C" },
  hooked: { bg: "#1a2520", border: "#27AE60", text: "#27AE60" },
  blocked: { bg: "#201818", border: "#FF7A00", text: "#FF7A00" },
  deferred: { bg: "#181820", border: "#6B7280", text: "#6B7280" },
  closed: { bg: "#141820", border: "#27AE60", text: "#27AE60" },
}

function calculateLayout(beads: Bead[]): LayoutNode[] {
  if (beads.length === 0) return []

  const beadMap = new Map(beads.map(b => [b.id, b]))
  const levels = new Map<string, number>()
  const visited = new Set<string>()

  // Calculate levels using topological sort
  function getLevel(id: string): number {
    if (levels.has(id)) return levels.get(id)!
    if (visited.has(id)) return 0 // Cycle detection

    visited.add(id)
    const bead = beadMap.get(id)
    if (!bead) return 0

    // Level is 1 + max level of all dependencies
    const depLevels = bead.depends_on
      .filter(depId => beadMap.has(depId))
      .map(depId => getLevel(depId))

    const level = depLevels.length > 0 ? Math.max(...depLevels) + 1 : 0
    levels.set(id, level)
    return level
  }

  // Calculate levels for all beads
  beads.forEach(bead => getLevel(bead.id))

  // Group beads by level
  const levelGroups = new Map<number, Bead[]>()
  beads.forEach(bead => {
    const level = levels.get(bead.id) || 0
    if (!levelGroups.has(level)) levelGroups.set(level, [])
    levelGroups.get(level)!.push(bead)
  })

  // Calculate positions
  const nodes: LayoutNode[] = []
  const maxColumns = Math.max(...Array.from(levelGroups.values()).map(g => g.length))
  const graphWidth = maxColumns * (NODE_WIDTH + NODE_GAP) - NODE_GAP + PADDING * 2

  levelGroups.forEach((groupBeads, level) => {
    const groupWidth = groupBeads.length * (NODE_WIDTH + NODE_GAP) - NODE_GAP
    const startX = (graphWidth - groupWidth) / 2

    groupBeads.forEach((bead, column) => {
      nodes.push({
        bead,
        level,
        column,
        position: {
          x: startX + column * (NODE_WIDTH + NODE_GAP),
          y: PADDING + level * (NODE_HEIGHT + LEVEL_GAP),
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
        },
      })
    })
  })

  return nodes
}

function BeadNode({
  node,
  selected,
  onClick,
}: {
  node: LayoutNode
  selected: boolean
  onClick?: () => void
}) {
  const { bead, position } = node
  const colors = statusColors[bead.status] || statusColors.open

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onClick={onClick}
      className="cursor-pointer"
    >
      {/* Node background */}
      <rect
        width={position.width}
        height={position.height}
        rx={2}
        fill={colors.bg}
        stroke={selected ? "#E6E8EB" : colors.border}
        strokeWidth={selected ? 2 : 1.5}
        className="transition-all duration-150"
      />

      {/* Priority indicator */}
      <rect
        x={0}
        y={0}
        width={4}
        height={position.height}
        rx={2}
        fill={colors.border}
      />

      {/* ID badge */}
      <text
        x={12}
        y={20}
        fontSize={10}
        fontFamily="monospace"
        fill={colors.text}
        className="select-none"
      >
        {bead.id}
      </text>

      {/* Title (truncated) */}
      <text
        x={12}
        y={40}
        fontSize={12}
        fill="#E6E8EB"
        className="select-none"
      >
        {bead.title.length > 18 ? bead.title.slice(0, 18) + "..." : bead.title}
      </text>

      {/* Status indicator */}
      <circle
        cx={position.width - 16}
        cy={position.height / 2}
        r={4}
        fill={colors.border}
      />
    </g>
  )
}

function DependencyEdge({
  from,
  to,
  highlighted,
}: {
  from: NodePosition
  to: NodePosition
  highlighted: boolean
}) {
  // Calculate edge points
  const startX = from.x + from.width / 2
  const startY = from.y + from.height
  const endX = to.x + to.width / 2
  const endY = to.y

  // Create a curved path
  const midY = (startY + endY) / 2
  const path = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`

  // Arrow marker
  const arrowSize = 6
  const arrowPath = `M ${endX} ${endY} L ${endX - arrowSize} ${endY - arrowSize * 1.5} L ${endX + arrowSize} ${endY - arrowSize * 1.5} Z`

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={highlighted ? "#F2C94C" : "#2A2F3A"}
        strokeWidth={highlighted ? 2 : 1.5}
        strokeDasharray={highlighted ? undefined : "4 2"}
        className="transition-all duration-150"
      />
      <path
        d={arrowPath}
        fill={highlighted ? "#F2C94C" : "#2A2F3A"}
        className="transition-all duration-150"
      />
    </g>
  )
}

export function DependencyGraph({
  beads,
  selectedId,
  onSelect,
  className,
}: DependencyGraphProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const nodes = useMemo(() => calculateLayout(beads), [beads])
  const nodeMap = useMemo(
    () => new Map(nodes.map(n => [n.bead.id, n])),
    [nodes]
  )

  // Calculate graph dimensions
  const graphHeight = useMemo(() => {
    if (nodes.length === 0) return 200
    const maxY = Math.max(...nodes.map(n => n.position.y + n.position.height))
    return maxY + PADDING
  }, [nodes])

  const graphWidth = useMemo(() => {
    if (nodes.length === 0) return 400
    const maxX = Math.max(...nodes.map(n => n.position.x + n.position.width))
    return maxX + PADDING
  }, [nodes])

  // Calculate edges
  const edges = useMemo(() => {
    const result: Array<{
      from: NodePosition
      to: NodePosition
      highlighted: boolean
      key: string
    }> = []

    nodes.forEach(node => {
      node.bead.depends_on.forEach(depId => {
        const depNode = nodeMap.get(depId)
        if (depNode) {
          const highlighted =
            hoveredId === node.bead.id ||
            hoveredId === depId ||
            selectedId === node.bead.id ||
            selectedId === depId

          result.push({
            from: depNode.position,
            to: node.position,
            highlighted,
            key: `${depId}-${node.bead.id}`,
          })
        }
      })
    })

    return result
  }, [nodes, nodeMap, hoveredId, selectedId])

  if (beads.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-48 text-ash",
          className
        )}
      >
        No beads with dependencies
      </div>
    )
  }

  return (
    <div className={cn("overflow-auto", className)}>
      <svg
        width={graphWidth}
        height={graphHeight}
        className="min-w-full"
      >
        {/* Grid background */}
        <defs>
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="#1a1f28"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Edges (render first so they're behind nodes) */}
        <g className="edges">
          {edges.map(edge => (
            <DependencyEdge
              key={edge.key}
              from={edge.from}
              to={edge.to}
              highlighted={edge.highlighted}
            />
          ))}
        </g>

        {/* Nodes */}
        <g className="nodes">
          {nodes.map(node => (
            <g
              key={node.bead.id}
              onMouseEnter={() => setHoveredId(node.bead.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <BeadNode
                node={node}
                selected={selectedId === node.bead.id || hoveredId === node.bead.id}
                onClick={() => onSelect?.(node.bead)}
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
