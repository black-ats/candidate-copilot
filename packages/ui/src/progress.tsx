import * as React from 'react'
import { cn } from './utils'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  showLabel?: boolean
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, showLabel = false, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {showLabel && (
          <div className="flex justify-between mb-2 text-sm text-navy/70">
            <span>Progresso</span>
            <span>{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-stone/40"
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div
            className="h-full bg-teal transition-all duration-300 ease-in-out rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)

Progress.displayName = 'Progress'

export interface StepProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStep: number
  totalSteps: number
  labels?: string[]
}

export const StepProgress = React.forwardRef<HTMLDivElement, StepProgressProps>(
  ({ className, currentStep, totalSteps, labels, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-navy">
            Passo {currentStep} de {totalSteps}
          </span>
          {labels && labels[currentStep - 1] && (
            <span className="text-sm text-navy/70">{labels[currentStep - 1]}</span>
          )}
        </div>
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={cn(
                'h-2 flex-1 rounded-full transition-colors duration-300',
                i < currentStep ? 'bg-teal' : 'bg-stone/40'
              )}
            />
          ))}
        </div>
      </div>
    )
  }
)

StepProgress.displayName = 'StepProgress'
