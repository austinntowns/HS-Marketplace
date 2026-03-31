'use client'

interface StepIndicatorProps {
  current: number
  total: number
  labels?: string[]
}

export function StepIndicator({ current, total, labels }: StepIndicatorProps) {
  const defaultLabels = ['Location', 'Financials', 'Photos & Details']
  const stepLabels = labels || defaultLabels

  return (
    <div role="list" className="flex items-center justify-center" aria-label="Listing creation steps">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1
        const isComplete = step < current
        const isCurrent = step === current
        const label = stepLabels[i]
        const stateDesc = isComplete ? 'completed' : isCurrent ? 'current' : 'upcoming'

        return (
          <div
            key={step}
            role="listitem"
            className="flex items-center"
            aria-current={isCurrent ? 'step' : undefined}
            aria-label={`Step ${step}: ${label}, ${stateDesc}`}
          >
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold
                  transition-all duration-300
                  ${isComplete ? 'bg-hs-red-600 text-white' : ''}
                  ${isCurrent ? 'bg-hs-red-600 text-white ring-4 ring-hs-red-100' : ''}
                  ${!isComplete && !isCurrent ? 'bg-gray-100 text-gray-400 border-2 border-gray-200' : ''}
                `
                  .trim()
                  .replace(/\s+/g, ' ')}
              >
                {isComplete ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step
                )}
              </div>
              {/* Label - hidden on mobile */}
              <span
                className={`
                  mt-2 text-xs sm:text-sm whitespace-nowrap hidden sm:block
                  ${isCurrent ? 'font-semibold text-gray-900' : ''}
                  ${isComplete ? 'font-medium text-hs-red-600' : ''}
                  ${!isComplete && !isCurrent ? 'text-gray-400' : ''}
                `
                  .trim()
                  .replace(/\s+/g, ' ')}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {step < total && (
              <div
                aria-hidden="true"
                className={`
                  w-8 sm:w-16 md:w-24 h-0.5 mx-1 sm:mx-2 sm:mt-[-1.5rem]
                  transition-colors duration-300
                  ${isComplete ? 'bg-hs-red-600' : 'bg-gray-200'}
                `
                  .trim()
                  .replace(/\s+/g, ' ')}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Compact variant for mobile or tight spaces
export function StepIndicatorCompact({ current, total }: { current: number; total: number }) {
  const defaultLabels = ['Location', 'Financials', 'Photos & Details']
  const label = defaultLabels[current - 1] || `Step ${current}`

  return (
    <div
      role="list"
      className="flex items-center gap-2"
      aria-label="Listing creation steps"
    >
      <div
        role="listitem"
        aria-current="step"
        aria-label={`Step ${current} of ${total}: ${label}, current`}
        className="flex items-center gap-2"
      >
        <span className="text-sm font-semibold text-hs-red-600">
          Step {current}
        </span>
        <span className="text-sm text-gray-400">of {total}</span>
      </div>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden ml-2" aria-hidden="true">
        <div
          className="h-full bg-hs-red-600 rounded-full transition-all duration-500"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  )
}
