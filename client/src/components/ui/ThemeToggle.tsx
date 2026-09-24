import { Monitor, Moon, Sun } from 'lucide-react'
import clsx from 'clsx'
import { useTheme, type ThemeChoice } from '@/context/ThemeContext'

const OPTIONS: { value: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Terang', icon: Sun },
  { value: 'dark', label: 'Gelap', icon: Moon },
  { value: 'system', label: 'Perangkat', icon: Monitor },
]

export function ThemeToggle() {
  const { choice, setChoice } = useTheme()

  return (
    <div
      role="radiogroup"
      aria-label="Pilih tema tampilan"
      className="flex items-center gap-0.5 rounded-full border border-ink/10 bg-paper-surface p-0.5 dark:border-paper-surface/10 dark:bg-paper-dark-surface"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = choice === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setChoice(value)}
            className={clsx(
              'flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200',
              active
                ? 'bg-ink text-paper dark:bg-paper-surface dark:text-ink'
                : 'text-ink/50 hover:text-ink dark:text-paper-surface/50 dark:hover:text-paper-surface',
            )}
          >
            <Icon size={14} strokeWidth={2} />
          </button>
        )
      })}
    </div>
  )
}
