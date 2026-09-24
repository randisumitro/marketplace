import clsx from 'clsx'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'inverse' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-tight transition-colors duration-200 ease-out-quart disabled:opacity-50'

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-ink text-paper hover:bg-emerald dark:bg-paper-surface dark:text-ink dark:hover:bg-gold dark:hover:text-ink',
  inverse:
    'bg-paper text-ink hover:bg-emerald hover:text-paper',
  ghost:
    'bg-transparent text-ink hover:text-emerald dark:text-paper-surface dark:hover:text-gold px-0',
}

/**
 * Kelas visual tombol, bisa dipakai di elemen NON-<button> (mis. <Link> atau <div role="button">)
 * supaya tampil identik dengan <Button> tanpa harus menaruh <button> sungguhan di dalamnya —
 * HTML tidak mengizinkan elemen interaktif bersarang di dalam elemen interaktif lain.
 */
export function buttonClasses(variant: Variant = 'primary', className?: string) {
  return clsx(BASE_CLASSES, VARIANT_CLASSES[variant], className)
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => {
    return (
      <button ref={ref} className={buttonClasses(variant, className)} {...props}>
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
