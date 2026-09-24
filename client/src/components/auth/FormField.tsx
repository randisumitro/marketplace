import { useState, forwardRef, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import clsx from 'clsx'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, type = 'text', id, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const fieldId = id ?? props.name

    return (
      <div>
        <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={fieldId}
            type={isPassword && showPassword ? 'text' : type}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${fieldId}-error` : undefined}
            className={clsx(
              'w-full rounded-xl border bg-paper px-4 py-3 text-sm outline-none transition-colors duration-200',
              'focus:border-emerald dark:focus:border-gold',
              'dark:bg-paper-dark-surface',
              error ? 'border-red-400 dark:border-red-500' : 'border-ink/15 dark:border-paper-surface/15',
              isPassword && 'pr-11',
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink dark:text-paper-surface/40 dark:hover:text-paper-surface"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          )}
        </div>
        {error && (
          <p id={`${fieldId}-error`} className="mt-1.5 text-xs text-red-500 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    )
  },
)
FormField.displayName = 'FormField'
