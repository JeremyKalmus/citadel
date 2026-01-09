import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { ConfirmDialog } from "./confirm-dialog"
import { ActionButton } from "./action-button"

const meta = {
  title: "UI/ConfirmDialog",
  component: ConfirmDialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

function DialogDemo({ variant, title, description, children }: {
  variant?: "default" | "danger"
  title: string
  description: string
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleConfirm = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setOpen(false)
    }, 1000)
  }

  return (
    <>
      <ActionButton onClick={() => setOpen(true)}>
        Open Dialog
      </ActionButton>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title={title}
        description={description}
        variant={variant}
        loading={loading}
      >
        {children}
      </ConfirmDialog>
    </>
  )
}

export const Default: Story = {
  render: () => (
    <DialogDemo
      title="Confirm Action"
      description="Are you sure you want to proceed with this action?"
    />
  ),
}

export const Danger: Story = {
  render: () => (
    <DialogDemo
      variant="danger"
      title="Delete Worker"
      description="This will permanently delete the worker and all associated data. This action cannot be undone."
    />
  ),
}

export const WithInput: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    const handleConfirm = () => {
      if (!message.trim()) return
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        setOpen(false)
        setMessage("")
      }, 1000)
    }

    return (
      <>
        <ActionButton onClick={() => setOpen(true)}>
          Open Nudge Dialog
        </ActionButton>
        <ConfirmDialog
          open={open}
          onClose={() => {
            setOpen(false)
            setMessage("")
          }}
          onConfirm={handleConfirm}
          title="Nudge Worker"
          description="Send a message to the worker's session."
          confirmLabel="Send"
          loading={loading}
        >
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message..."
            className="w-full h-24 px-3 py-2 rounded-sm bg-carbon-black border-2 border-chrome-border text-bone placeholder:text-ash resize-none focus:outline-none focus:border-bone"
          />
        </ConfirmDialog>
      </>
    )
  },
}

export const WithForm: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    const [target, setTarget] = useState({ rig: "", name: "" })
    const [loading, setLoading] = useState(false)

    const handleConfirm = () => {
      if (!target.rig.trim() || !target.name.trim()) return
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        setOpen(false)
        setTarget({ rig: "", name: "" })
      }, 1000)
    }

    return (
      <>
        <ActionButton onClick={() => setOpen(true)}>
          Open Reassign Dialog
        </ActionButton>
        <ConfirmDialog
          open={open}
          onClose={() => {
            setOpen(false)
            setTarget({ rig: "", name: "" })
          }}
          onConfirm={handleConfirm}
          title="Reassign Work"
          description="Transfer work to another worker."
          confirmLabel="Reassign"
          loading={loading}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-ash mb-1">Target Rig</label>
              <input
                type="text"
                value={target.rig}
                onChange={(e) =>
                  setTarget((prev) => ({ ...prev, rig: e.target.value }))
                }
                placeholder="e.g., greenplace"
                className="w-full px-3 py-2 rounded-sm bg-carbon-black border-2 border-chrome-border text-bone placeholder:text-ash focus:outline-none focus:border-bone"
              />
            </div>
            <div>
              <label className="block text-sm text-ash mb-1">Target Worker</label>
              <input
                type="text"
                value={target.name}
                onChange={(e) =>
                  setTarget((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Toast"
                className="w-full px-3 py-2 rounded-sm bg-carbon-black border-2 border-chrome-border text-bone placeholder:text-ash focus:outline-none focus:border-bone"
              />
            </div>
          </div>
        </ConfirmDialog>
      </>
    )
  },
}
