"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Panel, PanelBody, PanelHeader } from "@/components/ui"
import { Icon, pluginIcons, type IconName } from "@/components/ui/icon"
import type { PluginInfo } from "@/hooks/use-plugins"

export interface PluginPanelProps {
  /** Installed plugins to display */
  plugins: PluginInfo[];
  /** Additional className */
  className?: string;
}

/**
 * Get icon name for plugin based on its type/name
 */
function getPluginIcon(plugin: PluginInfo): IconName {
  // Use the pluginIcons mapping for known plugins
  const lower = plugin.name.toLowerCase()
  if (lower in pluginIcons) {
    return pluginIcons[lower]
  }
  // Fall back based on type
  if (plugin.type === "global-daemon") {
    return "activity"
  }
  return pluginIcons.default
}

/**
 * Get effect icon based on effect description
 */
function getEffectIcon(effect: string): IconName {
  const lower = effect.toLowerCase();
  if (lower.includes("hook")) return "anchor";
  if (lower.includes("daemon") || lower.includes("background")) return "activity";
  if (lower.includes("token") || lower.includes("budget")) return "coins";
  if (lower.includes("model") || lower.includes("tier")) return "layers";
  if (lower.includes("formula") || lower.includes("template")) return "file-text";
  if (lower.includes("gate") || lower.includes("enforcement")) return "shield";
  if (lower.includes("requires")) return "link";
  if (lower.includes("town") || lower.includes("rig")) return "box";
  return "check-circle";
}

interface PluginCardProps {
  plugin: PluginInfo;
  expanded: boolean;
  onToggle: () => void;
}

/**
 * Individual plugin card (expandable)
 */
function PluginCard({ plugin, expanded, onToggle }: PluginCardProps) {
  return (
    <Panel
      variant={expanded ? "elevated" : "default"}
      className={cn(
        "transition-all duration-200 ease-out",
        expanded && "ring-1 ring-chrome-border/50"
      )}
    >
      {/* Header - clickable to toggle */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-4 py-3",
          "text-left transition-colors hover:bg-carbon-black/30",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-acid-green/50 focus-visible:ring-inset",
          expanded && "border-b border-chrome-border/50"
        )}
        aria-expanded={expanded}
        aria-controls={`plugin-${plugin.name}-content`}
      >
        <div className="flex items-center gap-3">
          <Icon
            name={getPluginIcon(plugin)}
            aria-label=""
            variant="muted"
            size="md"
            className="flex-shrink-0"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-bone font-semibold">{plugin.name}</span>
              <span className="text-xs text-ash px-1.5 py-0.5 rounded-sm bg-carbon-black/50 border border-chrome-border/30">
                v{plugin.version}
              </span>
            </div>
            <span className="text-ash text-sm line-clamp-1">{plugin.description}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* CLAUDE.md badge */}
          {plugin.hasClaudeMd && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-sm bg-acid-green/10 border border-acid-green/30">
              <Icon name="file-text" size="xs" className="text-acid-green" aria-label="" />
              <span className="text-xs text-acid-green font-medium">CLAUDE.md</span>
            </div>
          )}

          {/* Effects count badge */}
          {plugin.effects.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-sm bg-carbon-black/50 border border-chrome-border/30">
              <span className="text-xs text-ash">{plugin.effects.length} effects</span>
            </div>
          )}

          {/* Expand/collapse chevron */}
          <Icon
            name={expanded ? "chevron-down" : "chevron-right"}
            aria-label={expanded ? "Collapse" : "Expand"}
            variant="muted"
            size="sm"
            className={cn(
              "flex-shrink-0 transition-transform duration-200",
              expanded && "text-bone"
            )}
          />
        </div>
      </button>

      {/* Expandable content */}
      <div
        id={`plugin-${plugin.name}-content`}
        className={cn(
          "grid transition-all duration-200 ease-out",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
        aria-hidden={!expanded}
      >
        <div className="overflow-hidden">
          <PanelBody className="pt-0">
            {/* Full description */}
            <p className="body-text text-ash leading-relaxed mb-4">
              {plugin.description}
            </p>

            {/* Mobile badges */}
            <div className="sm:hidden flex flex-wrap gap-2 mb-4">
              {plugin.hasClaudeMd && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-sm bg-acid-green/10 border border-acid-green/30">
                  <Icon name="file-text" size="xs" className="text-acid-green" aria-label="" />
                  <span className="text-xs text-acid-green font-medium">CLAUDE.md</span>
                </div>
              )}
            </div>

            {/* Effects list */}
            {plugin.effects.length > 0 && (
              <div className="space-y-2">
                <span className="label text-ash">Effects:</span>
                <div className="flex flex-wrap gap-2">
                  {plugin.effects.map((effect, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm bg-carbon-black/50 border border-chrome-border/30 text-xs text-bone"
                    >
                      <Icon
                        name={getEffectIcon(effect)}
                        aria-label=""
                        size="xs"
                        variant="muted"
                      />
                      {effect}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata footer */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-chrome-border/30">
              {plugin.scope && (
                <div className="flex items-center gap-1.5">
                  <span className="label text-ash">Scope:</span>
                  <span className="text-xs text-bone">{plugin.scope}</span>
                </div>
              )}
              {plugin.type && (
                <div className="flex items-center gap-1.5">
                  <span className="label text-ash">Type:</span>
                  <span className="text-xs text-bone">{plugin.type}</span>
                </div>
              )}
            </div>
          </PanelBody>
        </div>
      </div>
    </Panel>
  )
}

/**
 * PluginPanel - Installed Plugins Overview
 *
 * Shows what plugins are installed and how they affect the system.
 * Per spec section 4.6.
 *
 * @example
 * ```tsx
 * const { data } = usePlugins();
 * <PluginPanel plugins={data?.plugins ?? []} />
 * ```
 */
export function PluginPanel({ plugins, className }: PluginPanelProps) {
  const [expandedPlugin, setExpandedPlugin] = useState<string | null>(null)

  const handleToggle = (pluginName: string) => {
    setExpandedPlugin(expandedPlugin === pluginName ? null : pluginName)
  }

  // Empty state
  if (plugins.length === 0) {
    return (
      <Panel className={className}>
        <PanelHeader title="Installed Plugins" />
        <PanelBody>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Icon
              name="puzzle"
              aria-label=""
              size="lg"
              variant="muted"
              className="mb-4 opacity-50"
            />
            <p className="text-ash mb-2">No plugins installed</p>
            <p className="text-xs text-ash/60">
              Plugins extend Gas Town with additional capabilities.
              <br />
              Add plugins to ~/gt/plugins/ to get started.
            </p>
          </div>
        </PanelBody>
      </Panel>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Summary header */}
      <div className="flex items-center justify-between">
        <h3 className="section-header">Installed Plugins</h3>
        <span className="label text-ash">
          {plugins.length} plugin{plugins.length !== 1 ? "s" : ""} installed
        </span>
      </div>

      {/* Plugin cards */}
      <div className="space-y-2">
        {plugins.map((plugin) => (
          <PluginCard
            key={plugin.name}
            plugin={plugin}
            expanded={expandedPlugin === plugin.name}
            onToggle={() => handleToggle(plugin.name)}
          />
        ))}
      </div>

      {/* CLAUDE.md summary */}
      {plugins.some(p => p.hasClaudeMd) && (
        <div className="p-3 rounded-sm bg-acid-green/5 border border-acid-green/20">
          <div className="flex items-start gap-2">
            <Icon
              name="info"
              aria-label=""
              size="sm"
              className="text-acid-green mt-0.5"
            />
            <div className="text-sm">
              <span className="text-bone font-medium">Agent Context Available</span>
              <p className="text-ash text-xs mt-1">
                Plugins with CLAUDE.md provide additional context to AI agents.
                This helps agents understand plugin capabilities and constraints.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
