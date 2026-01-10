"use client"

import { useState } from "react"
import { Panel, PanelHeader, PanelBody } from "@/components/ui"
import { Icon } from "@/components/ui/icon"
import { cn } from "@/lib/utils"
import type { WorkerGitActivity, FileChange, Commit } from "@/lib/gastown"

interface DiffViewerProps {
  activity: WorkerGitActivity | null
  loading?: boolean
  showCommits?: boolean
  maxFiles?: number
}

interface FileRowProps {
  file: FileChange
  expanded: boolean
  onToggle: () => void
}

function FileRow({ file, expanded, onToggle }: FileRowProps) {
  const statusColors: Record<string, string> = {
    added: "text-acid-green",
    modified: "text-fuel-yellow",
    deleted: "text-rust-orange",
    renamed: "text-ash",
  }

  const statusLabels: Record<string, string> = {
    added: "Added",
    modified: "Modified",
    deleted: "Deleted",
    renamed: "Renamed",
  }

  return (
    <div className="border-b border-chrome-border/30 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 px-4 hover:bg-carbon-black/30 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon
            name={expanded ? "activity" : "terminal"}
            aria-label=""
            variant="muted"
            size="sm"
            className={cn("transition-transform", expanded && "rotate-90")}
          />
          <span className="body-text font-mono truncate">{file.path}</span>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="font-mono text-sm">
            <span className="text-acid-green">+{file.additions}</span>
            {" "}
            <span className="text-rust-orange">-{file.deletions}</span>
          </span>
          <span className={cn("caption uppercase", statusColors[file.status])}>
            {statusLabels[file.status]}
          </span>
        </div>
      </button>
      {expanded && file.patch && (
        <div className="px-4 pb-4">
          <DiffPatch patch={file.patch} />
        </div>
      )}
    </div>
  )
}

interface DiffPatchProps {
  patch: string
}

function DiffPatch({ patch }: DiffPatchProps) {
  const lines = patch.split("\n")

  return (
    <div className="rounded-sm border border-chrome-border/50 bg-carbon-black overflow-x-auto">
      <pre className="text-xs font-mono p-3">
        {lines.map((line, index) => (
          <DiffLine key={index} line={line} />
        ))}
      </pre>
    </div>
  )
}

interface DiffLineProps {
  line: string
}

function DiffLine({ line }: DiffLineProps) {
  let className = "text-bone/70" // context line

  if (line.startsWith("+") && !line.startsWith("+++")) {
    className = "text-acid-green bg-acid-green/10"
  } else if (line.startsWith("-") && !line.startsWith("---")) {
    className = "text-rust-orange bg-rust-orange/10"
  } else if (line.startsWith("@@")) {
    className = "text-ash italic"
  } else if (line.startsWith("diff ") || line.startsWith("index ")) {
    className = "text-ash"
  }

  return (
    <div className={cn("px-2 -mx-2", className)}>
      {line || " "}
    </div>
  )
}

interface CommitRowProps {
  commit: Commit
}

function CommitRow({ commit }: CommitRowProps) {
  const shortSha = commit.sha.slice(0, 7)
  const timeAgo = formatTimeAgo(commit.timestamp)

  return (
    <div className="flex items-center justify-between py-2 border-b border-chrome-border/30 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-mono text-xs text-ash">{shortSha}</span>
        <span className="body-text truncate">{commit.message}</span>
      </div>
      <span className="caption text-ash flex-shrink-0">{timeAgo}</span>
    </div>
  )
}

function formatTimeAgo(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  } catch {
    return timestamp
  }
}

export function DiffViewer({
  activity,
  loading = false,
  showCommits = true,
  maxFiles = 20,
}: DiffViewerProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())

  const toggleFile = (path: string) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  // Build file changes from activity
  const fileChanges: FileChange[] = activity?.files_changed.map((path) => ({
    path,
    status: "modified" as const,
    additions: 0,
    deletions: 0,
  })) || []

  const displayFiles = fileChanges.slice(0, maxFiles)
  const hasMore = fileChanges.length > maxFiles

  return (
    <div className="space-y-6">
      {/* File changes panel */}
      <Panel>
        <PanelHeader
          icon="terminal"
          title="Git Changes"
          actions={
            <div className="flex items-center gap-4">
              {activity && (
                <>
                  <span className="font-mono text-sm">
                    <span className="text-acid-green">+{activity.total_additions}</span>
                    {" / "}
                    <span className="text-rust-orange">-{activity.total_deletions}</span>
                  </span>
                  <span className="caption text-ash">
                    {activity.files_changed.length} files
                  </span>
                </>
              )}
            </div>
          }
        />
        <PanelBody className="p-0">
          {loading ? (
            <div className="p-4 text-center">
              <p className="caption text-ash">Loading git activity...</p>
            </div>
          ) : !activity || fileChanges.length === 0 ? (
            <div className="p-4 text-center">
              <p className="caption text-ash">No file changes</p>
            </div>
          ) : (
            <>
              {displayFiles.map((file) => (
                <FileRow
                  key={file.path}
                  file={file}
                  expanded={expandedFiles.has(file.path)}
                  onToggle={() => toggleFile(file.path)}
                />
              ))}
              {hasMore && (
                <div className="p-4 text-center border-t border-chrome-border/30">
                  <p className="caption text-ash">
                    +{fileChanges.length - maxFiles} more files
                  </p>
                </div>
              )}
            </>
          )}
        </PanelBody>
      </Panel>

      {/* Commits panel */}
      {showCommits && (
        <Panel>
          <PanelHeader
            icon="activity"
            title="Commits"
            actions={
              <span className="caption text-ash">
                {activity?.commits.length ?? 0} commits
              </span>
            }
          />
          <PanelBody className="p-0">
            {loading ? (
              <div className="p-4 text-center">
                <p className="caption text-ash">Loading commits...</p>
              </div>
            ) : !activity || activity.commits.length === 0 ? (
              <div className="p-4 text-center">
                <p className="caption text-ash">No commits yet</p>
              </div>
            ) : (
              <div className="px-4">
                {activity.commits.map((commit) => (
                  <CommitRow key={commit.sha} commit={commit} />
                ))}
              </div>
            )}
          </PanelBody>
        </Panel>
      )}

      {/* Branch info */}
      {activity && (
        <div className="p-4 rounded-sm bg-gunmetal border-2 border-chrome-border">
          <div className="flex items-center gap-4">
            <div>
              <p className="label text-ash">Branch</p>
              <p className="font-mono text-sm text-bone">{activity.branch}</p>
            </div>
            <div className="text-ash">vs</div>
            <div>
              <p className="label text-ash">Base</p>
              <p className="font-mono text-sm text-bone">{activity.base_branch}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
