import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { useState } from "react"
import { GuideNav, type GuideSection } from "./guide-nav"
import { guideIcons } from "@/components/ui/icon"

const meta = {
  title: "Guide/GuideNav",
  component: GuideNav,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-48 bg-carbon-black p-4 rounded-sm border border-chrome-border">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GuideNav>

export default meta
type Story = StoryObj<typeof meta>

const defaultSections: GuideSection[] = [
  { id: "overview", label: "Overview", icon: guideIcons.overview },
  { id: "entities", label: "Entities", icon: guideIcons.entities },
  { id: "lifecycle", label: "Lifecycle", icon: guideIcons.lifecycle },
  { id: "plugins", label: "Plugins", icon: guideIcons.plugins },
  { id: "scenarios", label: "Scenarios", icon: guideIcons.scenarios },
]

const sectionsWithBadges: GuideSection[] = [
  { id: "overview", label: "Overview", icon: guideIcons.overview },
  { id: "entities", label: "Entities", icon: guideIcons.entities, badge: "7" },
  { id: "lifecycle", label: "Lifecycle", icon: guideIcons.lifecycle },
  { id: "plugins", label: "Plugins", icon: guideIcons.plugins, badge: "3" },
  { id: "scenarios", label: "Scenarios", icon: guideIcons.scenarios, badge: "5" },
]

export const Default: Story = {
  args: {
    sections: defaultSections,
    activeSection: "overview",
    onSectionChange: () => {},
  },
}

export const WithBadges: Story = {
  args: {
    sections: sectionsWithBadges,
    activeSection: "plugins",
    onSectionChange: () => {},
  },
}

export const EntitiesActive: Story = {
  args: {
    sections: defaultSections,
    activeSection: "entities",
    onSectionChange: () => {},
  },
}

export const LifecycleActive: Story = {
  args: {
    sections: defaultSections,
    activeSection: "lifecycle",
    onSectionChange: () => {},
  },
}

/**
 * Interactive example showing section switching
 */
function InteractiveGuideNav() {
  const [active, setActive] = useState("overview")

  return (
    <div className="space-y-4">
      <GuideNav
        sections={sectionsWithBadges}
        activeSection={active}
        onSectionChange={setActive}
      />
      <div className="text-xs text-ash pt-2 border-t border-chrome-border">
        Active: <span className="text-acid-green">{active}</span>
      </div>
    </div>
  )
}

export const Interactive: Story = {
  args: {
    sections: [],
    activeSection: "",
    onSectionChange: () => {},
  },
  render: () => <InteractiveGuideNav />,
}

export const MinimalSections: Story = {
  args: {
    sections: [
      { id: "overview", label: "Overview", icon: "compass" },
      { id: "entities", label: "Entities", icon: "layers" },
    ],
    activeSection: "overview",
    onSectionChange: () => {},
  },
}

export const AllSectionsWithBadges: Story = {
  args: {
    sections: sectionsWithBadges,
    activeSection: "overview",
    onSectionChange: () => {},
  },
}
