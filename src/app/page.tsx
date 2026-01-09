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
        <h1 className="text-4xl font-bold text-bone">Town Overview</h1>
        <p className="body-text-muted mt-1">
          Gas Town Dashboard — Black & Chrome Edition
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {demoStats.map((stat) => (
          <Panel key={stat.label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="section-header">
                  {stat.label}
                </p>
                <p className="data-value mt-2">
                  {stat.value}
                </p>
              </div>
              <stat.icon className="w-8 h-8 text-ash" />
            </div>
          </Panel>
        ))}
      </div>

      {/* Component showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status badges */}
        <Panel className="p-6">
          <h2 className="section-header mb-4">
            Status Indicators
          </h2>
          <div className="flex flex-wrap gap-2">
            {demoStatuses.map((status) => (
              <StatusBadge key={status} status={status} />
            ))}
          </div>
        </Panel>

        {/* Gauges */}
        <Panel className="p-6">
          <h2 className="section-header mb-4">
            Fuel Gauges
          </h2>
          <div className="space-y-4">
            <div>
              <p className="label mb-2">Small (25%)</p>
              <Gauge value={25} size="sm" />
            </div>
            <div>
              <p className="label mb-2">Medium (60%)</p>
              <Gauge value={60} size="md" />
            </div>
            <div>
              <p className="label mb-2">Large (100%)</p>
              <Gauge value={100} size="lg" />
            </div>
          </div>
        </Panel>

        {/* Buttons */}
        <Panel className="p-6">
          <h2 className="section-header mb-4">
            Action Controls
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
              Awaiting signal
            </ActionButton>
            <ActionButton size="sm">
              Small
            </ActionButton>
          </div>
        </Panel>

        {/* Panel variants */}
        <Panel className="p-6">
          <h2 className="section-header mb-4">
            Panel Variants
          </h2>
          <div className="space-y-3">
            <Panel className="p-3">
              <p className="label">Default panel</p>
            </Panel>
            <Panel variant="elevated" className="p-3">
              <p className="label">Elevated panel</p>
            </Panel>
            <Panel variant="inset" className="p-3">
              <p className="label">Inset panel</p>
            </Panel>
          </div>
        </Panel>
      </div>
    </div>
  )
}
