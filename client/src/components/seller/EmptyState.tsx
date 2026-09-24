import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/15 px-6 py-20 text-center dark:border-paper-surface/15">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper text-ink/30 dark:bg-paper-dark-surface dark:text-paper-surface/30">
        <Icon size={22} strokeWidth={1.5} />
      </div>
      <p className="mt-4 font-display text-lg">{title}</p>
      <p className="mt-1.5 max-w-xs text-sm text-ink/55 dark:text-paper-surface/55">{description}</p>
    </div>
  )
}
