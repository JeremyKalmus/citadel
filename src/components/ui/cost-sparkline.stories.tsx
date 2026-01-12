import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { CostSparkline, CostBadge } from "./cost-sparkline"
import type { SparklinePoint } from "@/lib/cost-utils"

const meta = {
  title: "UI/CostSparkline",
  component: CostSparkline,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CostSparkline>

export default meta
type Story = StoryObj<typeof CostSparkline>

// Generate sample data
function generateData(
  points: number,
  trend: "up" | "down" | "flat" | "volatile",
  baseValue: number = 1.5
): SparklinePoint[] {
  const now = new Date()
  return Array.from({ length: points }, (_, i) => {
    let value = baseValue
    switch (trend) {
      case "up":
        value = baseValue + (i / points) * baseValue * 0.5
        break
      case "down":
        value = baseValue - (i / points) * baseValue * 0.3
        break
      case "volatile":
        value = baseValue + Math.sin(i * 0.5) * baseValue * 0.3 + Math.random() * 0.2
        break
      default:
        value = baseValue + (Math.random() - 0.5) * 0.1
    }
    return {
      timestamp: new Date(now.getTime() - (points - i) * 3600000).toISOString(),
      value: Math.max(0, value),
    }
  })
}

export const Default: Story = {
  args: {
    data: generateData(24, "up"),
    width: 80,
    height: 24,
    showValue: true,
    showTrend: true,
    variant: "default",
  },
}

export const TrendingUp: Story = {
  args: {
    data: generateData(24, "up", 2.0),
    width: 100,
    height: 28,
    showValue: true,
    showTrend: true,
    variant: "default",
  },
}

export const TrendingDown: Story = {
  args: {
    data: generateData(24, "down", 3.0),
    width: 100,
    height: 28,
    showValue: true,
    showTrend: true,
    variant: "default",
  },
}

export const Volatile: Story = {
  args: {
    data: generateData(24, "volatile", 1.5),
    width: 120,
    height: 32,
    showValue: true,
    showTrend: true,
    variant: "default",
  },
}

export const Warning: Story = {
  args: {
    data: generateData(24, "up", 8.0),
    width: 100,
    height: 28,
    showValue: true,
    showTrend: true,
    variant: "warning",
  },
}

export const Danger: Story = {
  args: {
    data: generateData(24, "up", 15.0),
    width: 100,
    height: 28,
    showValue: true,
    showTrend: true,
    variant: "danger",
  },
}

export const NoValue: Story = {
  args: {
    data: generateData(24, "flat"),
    width: 80,
    height: 24,
    showValue: false,
    showTrend: false,
    variant: "default",
  },
}

export const Empty: Story = {
  args: {
    data: [],
    width: 80,
    height: 24,
    showValue: true,
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-ash w-20">Small</span>
        <CostSparkline data={generateData(24, "up")} width={60} height={16} />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-ash w-20">Medium</span>
        <CostSparkline data={generateData(24, "up")} width={80} height={24} />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-ash w-20">Large</span>
        <CostSparkline data={generateData(24, "up")} width={120} height={32} />
      </div>
    </div>
  ),
}

export const InlineUsage: Story = {
  render: () => (
    <div className="space-y-2 text-bone">
      <div className="flex items-center justify-between p-3 bg-gunmetal rounded-sm">
        <span>Worker: greenplace/Toast</span>
        <CostSparkline data={generateData(12, "up", 1.2)} width={60} height={20} />
      </div>
      <div className="flex items-center justify-between p-3 bg-gunmetal rounded-sm">
        <span>Worker: greenplace/Furiosa</span>
        <CostSparkline data={generateData(12, "down", 2.5)} width={60} height={20} />
      </div>
      <div className="flex items-center justify-between p-3 bg-gunmetal rounded-sm">
        <span>Worker: citadel/iron</span>
        <CostSparkline data={generateData(12, "volatile", 0.8)} width={60} height={20} />
      </div>
    </div>
  ),
}

// CostBadge stories
export const BadgeDefault: StoryObj<typeof CostBadge> = {
  render: () => (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <span className="text-ash w-32">Current only</span>
        <CostBadge value={1.23} />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-ash w-32">Trending up</span>
        <CostBadge value={1.50} previousValue={1.23} />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-ash w-32">Trending down</span>
        <CostBadge value={0.95} previousValue={1.23} />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-ash w-32">Warning</span>
        <CostBadge value={8.50} previousValue={6.00} variant="warning" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-ash w-32">Danger</span>
        <CostBadge value={15.00} previousValue={12.00} variant="danger" />
      </div>
    </div>
  ),
}
