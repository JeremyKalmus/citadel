import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { forwardRef } from "react"

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
  loading?: boolean
  icon?: React.ReactNode
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  function ActionButton({
    className,
    variant = 'default',
    size = 'md',
    loading,
    icon,
    children,
    disabled,
    ...props
  }, ref) {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all",
          "focus:outline-none focus:ring-2 focus:ring-chrome-border focus:ring-offset-2 focus:ring-offset-carbon-black",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          {
            // Variants
            'bg-bone text-carbon-black hover:bg-bone/90': variant === 'default',
            'bg-status-dead/20 text-status-dead border border-status-dead/30 hover:bg-status-dead/30': variant === 'danger',
            'text-ash hover:text-bone hover:bg-gunmetal': variant === 'ghost',
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
)
