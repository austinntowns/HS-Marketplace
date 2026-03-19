'use client'

interface StepIndicatorProps {
  current: number
  total: number
  labels?: string[]
}

export function StepIndicator({ current, total, labels }: StepIndicatorProps) {
  const defaultLabels = ['Location', 'Financials', 'Photos & Details']

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1
        const isComplete = step < current
        const isCurrent = step === current

        return (
          <div key={step} className="flex items-center">
            <div
              className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${isComplete ? 'bg-pink-600 text-white' : ''}
                ${isCurrent ? 'bg-pink-600 text-white ring-2 ring-pink-300' : ''}
                ${!isComplete && !isCurrent ? 'bg-gray-200 text-gray-500' : ''}
              `}
            >
              {isComplete ? '✓' : step}
            </div>
            <span className={`ml-2 text-sm ${isCurrent ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
              {(labels || defaultLabels)[i]}
            </span>
            {step < total && (
              <div className={`w-12 h-0.5 mx-4 ${isComplete ? 'bg-pink-600' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
