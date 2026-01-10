import { NextResponse } from "next/server";
import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";
import { parse as parseYaml } from "yaml";

/**
 * Plugin metadata from plugin.yaml
 */
export interface PluginInfo {
  name: string;
  version: string;
  description: string;
  hasClaudeMd: boolean;
  effects: string[];
  enabled: boolean;
  scope?: string;
  type?: string;
}

/**
 * Response from GET /api/gastown/plugins
 */
export interface PluginsResponse {
  plugins: PluginInfo[];
}

/**
 * Extract effects from plugin config
 * Maps plugin type/config to human-readable effects
 */
function extractEffects(manifest: Record<string, unknown>): string[] {
  const effects: string[] = [];

  // Type-based effects
  const pluginType = manifest.type as string | undefined;
  if (pluginType) {
    switch (pluginType) {
      case "town-plugin":
        effects.push("Town-wide plugin");
        break;
      case "global-daemon":
        effects.push("Background service");
        break;
      case "rig-plugin":
        effects.push("Rig-scoped plugin");
        break;
    }
  }

  // Scope-based effects
  const scope = manifest.scope as string | undefined;
  if (scope === "town") {
    effects.push("Affects all rigs");
  } else if (scope === "rig") {
    effects.push("Per-rig configuration");
  }

  // Check for hooks
  const install = manifest.install as Record<string, unknown> | undefined;
  if (install?.hooks) {
    effects.push("Installs hooks");
  }

  // Check for templates
  if (install?.templates) {
    effects.push("Adds formulas/templates");
  }

  // Check for service
  if (install?.service) {
    effects.push("Runs background daemon");
  }

  // Config-based effects (specific to known plugins)
  const config = manifest.config as Record<string, unknown> | undefined;
  if (config?.token_budget) {
    effects.push("Token budget enforcement");
  }
  if (config?.models) {
    effects.push("Model tier recommendations");
  }

  // Gates (enforcement rules)
  if (manifest.gates) {
    effects.push("Enforcement gates");
  }

  // Requires other plugins
  const requires = manifest.requires as Record<string, string> | undefined;
  if (requires) {
    const deps = Object.keys(requires);
    if (deps.length > 0) {
      effects.push(`Requires: ${deps.join(", ")}`);
    }
  }

  return effects;
}

/**
 * GET /api/gastown/plugins
 *
 * Returns installed plugins and their metadata.
 * Dynamically reads from ~/gt/plugins/ directory.
 */
export async function GET() {
  try {
    const pluginsDir = process.env.GT_ROOT
      ? join(process.env.GT_ROOT, "plugins")
      : "/Users/jeremykalmus/gt/plugins";

    const plugins: PluginInfo[] = [];

    // Check if plugins directory exists
    try {
      await stat(pluginsDir);
    } catch {
      // Plugins directory doesn't exist
      return NextResponse.json({ plugins: [] });
    }

    // Read plugin directories
    const entries = await readdir(pluginsDir, { withFileTypes: true });

    for (const entry of entries) {
      // Skip non-directories and hidden files
      if (!entry.isDirectory() || entry.name.startsWith(".")) {
        continue;
      }

      const pluginPath = join(pluginsDir, entry.name);

      // Try to read plugin.yaml or manifest.yaml
      let manifest: Record<string, unknown> | null = null;
      const yamlPaths = [
        join(pluginPath, "plugin.yaml"),
        join(pluginPath, "manifest.yaml"),
      ];

      for (const yamlPath of yamlPaths) {
        try {
          const content = await readFile(yamlPath, "utf-8");
          manifest = parseYaml(content) as Record<string, unknown>;
          break;
        } catch {
          // Try next path
        }
      }

      // Check for CLAUDE.md
      let hasClaudeMd = false;
      try {
        await stat(join(pluginPath, "CLAUDE.md"));
        hasClaudeMd = true;
      } catch {
        // No CLAUDE.md
      }

      if (manifest) {
        plugins.push({
          name: (manifest.name as string) || entry.name,
          version: (manifest.version as string) || "unknown",
          description: (manifest.description as string) || "No description",
          hasClaudeMd,
          effects: extractEffects(manifest),
          enabled: true, // Assume enabled if directory exists
          scope: manifest.scope as string | undefined,
          type: manifest.type as string | undefined,
        });
      } else {
        // Plugin without manifest - basic info only
        plugins.push({
          name: entry.name,
          version: "unknown",
          description: "Plugin without manifest",
          hasClaudeMd,
          effects: [],
          enabled: true,
        });
      }
    }

    // Sort by name
    plugins.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ plugins });
  } catch (error) {
    console.error("Failed to fetch plugins:", error);
    return NextResponse.json(
      { error: "Failed to fetch plugins", plugins: [] },
      { status: 500 }
    );
  }
}
