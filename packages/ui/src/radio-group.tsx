import * as React from 'react'
import { cn } from './utils'

export interface RadioOption {
  value: string
  label: string
  description?: string
}

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  name: string
  options: RadioOption[]
  value?: string
  onChange?: (value: string) => void
  label?: string
  error?: string
  orientation?: 'horizontal' | 'vertical'
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, name, options, value, onChange, label, error, orientation = 'vertical', ...props }, ref) => {
    const groupId = React.useId()

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {label && (
          <label className="block text-sm font-medium text-navy mb-3">
            {label}
          </label>
        )}
        <div
          className={cn(
            'flex gap-3',
            orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
          )}
          role="radiogroup"
          aria-labelledby={label ? `${groupId}-label` : undefined}
        >
          {options.map((option) => (
            <label
              key={option.value}
              className={cn(
                'flex items-start gap-3 cursor-pointer p-3 rounded-lg border transition-colors',
                value === option.value
                  ? 'border-teal bg-teal/5'
                  : 'border-stone/40 hover:border-stone hover:bg-stone/10'
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange?.(e.target.value)}
                className="sr-only"
              />
              <div
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                  value === option.value ? 'border-teal' : 'border-stone'
                )}
              >
                {value === option.value && (
                  <div className="w-2.5 h-2.5 rounded-full bg-teal" />
                )}
              </div>
              <div className="flex-1">
                <span className="text-base font-medium text-navy">{option.label}</span>
                {option.description && (
                  <p className="text-sm text-navy/60 mt-0.5">{option.description}</p>
                )}
              </div>
            </label>
          ))}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

RadioGroup.displayName = 'RadioGroup'
