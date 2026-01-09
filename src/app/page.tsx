import { Panel, StatusBadge, Gauge, ActionButton, type Status } from "@/components/ui"
import { Container, Truck, Terminal, ArrowRight } from "lucide-react"

// Demo data for showcase
const demoStats = [
  { label: "Active Rigs", value: "3", icon: Container },
  { label: "Running Convoys", value: "5", icon: Truck },
  { label: "Active Workers", value: "12", icon: Terminal },
]

const demoStatuses: Status[] = ['active', 'thinking', 'slow', 'unresponsive', 'dead', 'blocked', 'done']

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-4xl font-bold text-chrome-bright">Town Overview</h1>
        <p className="text-sm text-chrome-dust mt-1">
          Gas Town Dashboard - Black & Chrome Edition
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {demoStats.map((stat) => (
          <Panel key={stat.label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-chrome-dust uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-chrome-bright mt-1">
                  {stat.value}
                </p>
              </div>
              <stat.icon className="w-8 h-8 text-chrome-rust" />
            </div>
          </Panel>
        ))}
      </div>

      {/* Component showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status badges */}
        <Panel className="p-6">
          <h2 className="text-lg font-semibold text-chrome-bright mb-4">
            Status Badges
          </h2>
          <div className="flex flex-wrap gap-2">
            {demoStatuses.map((status) => (
              <StatusBadge key={status} status={status} />
            ))}
          </div>
        </Panel>

        {/* Gauges */}
        <Panel className="p-6">
          <h2 className="text-lg font-semibold text-chrome-bright mb-4">
            Progress Gauges
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-chrome-dust mb-2">Small (25%)</p>
              <Gauge value={25} size="sm" />
            </div>
            <div>
              <p className="text-xs text-chrome-dust mb-2">Medium (60%)</p>
              <Gauge value={60} size="md" />
            </div>
            <div>
              <p className="text-xs text-chrome-dust mb-2">Large (100%)</p>
              <Gauge value={100} size="lg" />
            </div>
          </div>
        </Panel>

        {/* Buttons */}
        <Panel className="p-6">
          <h2 className="text-lg font-semibold text-chrome-bright mb-4">
            Action Buttons
          </h2>
          <div className="flex flex-wrap gap-3">
            <ActionButton>
              Default
            </ActionButton>
            <ActionButton icon={<ArrowRight className="w-4 h-4" />}>
              With Icon
            </ActionButton>
            <ActionButton variant="danger">
              Danger
            </ActionButton>
            <ActionButton variant="ghost">
              Ghost
            </ActionButton>
            <ActionButton loading>
              Loading
            </ActionButton>
            <ActionButton size="sm">
              Small
            </ActionButton>
          </div>
        </Panel>

        {/* Panel variants */}
        <Panel className="p-6">
          <h2 className="text-lg font-semibold text-chrome-bright mb-4">
            Panel Variants
          </h2>
          <div className="space-y-3">
            <Panel className="p-3">
              <p className="text-sm text-chrome-dust">Default panel</p>
            </Panel>
            <Panel variant="elevated" className="p-3">
              <p className="text-sm text-chrome-dust">Elevated panel</p>
            </Panel>
            <Panel variant="inset" className="p-3">
              <p className="text-sm text-chrome-dust">Inset panel</p>
            </Panel>
          </div>
        </Panel>
      </div>
    </div>
  )
}
