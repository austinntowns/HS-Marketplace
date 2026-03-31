'use client'

import { useState, useCallback } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { StepIndicator, StepIndicatorCompact } from '@/components/ui/StepIndicator'
import { TypeLocationStep } from './steps/TypeLocationStep'
import { FinancialsStep } from './steps/FinancialsStep'
import { PhotosDetailsStep } from './steps/PhotosDetailsStep'
import { listingSchema, getFieldsForStep } from '@/lib/listings/schemas'
import { saveDraft, submitListing } from '@/lib/listings/actions'
import type { ListingFormData } from '@/lib/listings/types'

interface ListingWizardProps {
  userId: string
}

type SaveToastState = 'idle' | 'saving' | 'saved' | 'error'

export function ListingWizard({ userId }: ListingWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [listingId, setListingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveToast, setSaveToast] = useState<SaveToastState>('idle')

  const methods = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    mode: 'onBlur',
    defaultValues: {
      type: undefined,
      locations: [],
      askingPrice: 0,
      photos: [],
      inventoryIncluded: false,
      laserIncluded: false,
    },
  })

  const showSaveToast = useCallback(() => {
    setSaveToast('saved')
    const timer = setTimeout(() => setSaveToast('idle'), 2500)
    return () => clearTimeout(timer)
  }, [])

  const handleSaveDraft = useCallback(async () => {
    setSaveToast('saving')
    try {
      const values = methods.getValues()
      const result = await saveDraft(values, listingId || undefined)
      if (result.listingId && !listingId) {
        setListingId(result.listingId)
      }
      showSaveToast()
      return result
    } catch {
      setSaveToast('error')
      setTimeout(() => setSaveToast('idle'), 3000)
      return null
    }
  }, [methods, listingId, showSaveToast])

  const handleStepComplete = async (nextStep: number) => {
    // Validate current step fields
    const fieldsToValidate = getFieldsForStep(step)
    const isValid = await methods.trigger(fieldsToValidate)
    if (!isValid) return

    // Auto-save draft
    await handleSaveDraft()

    setStep(nextStep)
  }

  const handleSaveAndExit = async () => {
    setSaveToast('saving')
    try {
      const values = methods.getValues()
      const result = await saveDraft(values, listingId || undefined)
      if (result.listingId) {
        router.push('/seller/listings')
      }
    } catch {
      setSaveToast('error')
      setTimeout(() => setSaveToast('idle'), 3000)
    }
  }

  const handleSubmit = async () => {
    // Validate all fields
    const isValid = await methods.trigger()
    if (!isValid) return

    setIsSubmitting(true)
    try {
      // Save final draft
      const values = methods.getValues()
      const saveResult = await saveDraft(values, listingId || undefined)
      const finalListingId = saveResult.listingId || listingId

      if (!finalListingId) {
        throw new Error('Failed to save listing')
      }

      // Submit for review
      await submitListing(finalListingId)

      // Redirect to success page
      router.push(`/seller/listings/${finalListingId}/submitted`)
    } catch (error) {
      console.error('Submit failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={(e) => e.preventDefault()}>
        {/* Auto-save indicator */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Your progress is saved automatically
          </p>

          {/* Save toast */}
          <div
            className={`
              flex items-center gap-1.5 text-xs sm:text-sm font-medium
              transition-all duration-300
              ${saveToast === 'idle' ? 'opacity-0' : 'opacity-100'}
              ${saveToast === 'saving' ? 'text-gray-500' : ''}
              ${saveToast === 'saved' ? 'text-emerald-600' : ''}
              ${saveToast === 'error' ? 'text-hs-red-600' : ''}
            `.trim().replace(/\s+/g, ' ')}
            role="status"
            aria-live="polite"
          >
            {saveToast === 'saving' && (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            )}
            {saveToast === 'saved' && (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Draft saved
              </>
            )}
            {saveToast === 'error' && (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Save failed
              </>
            )}
          </div>
        </div>

        {/* Compact step indicator on mobile, full on desktop */}
        <div className="sm:hidden mb-6">
          <StepIndicatorCompact current={step} total={3} />
        </div>
        <div className="hidden sm:block">
          <StepIndicator current={step} total={3} />
        </div>

        <div className="mt-8">
          {step === 1 && (
            <TypeLocationStep
              userId={userId}
              onNext={() => handleStepComplete(2)}
              onSaveAndExit={handleSaveAndExit}
              isSaving={saveToast === 'saving'}
            />
          )}

          {step === 2 && (
            <FinancialsStep
              onNext={() => handleStepComplete(3)}
              onBack={() => setStep(1)}
              onSaveAndExit={handleSaveAndExit}
              isSaving={saveToast === 'saving'}
            />
          )}

          {step === 3 && (
            <PhotosDetailsStep
              onSubmit={handleSubmit}
              onBack={() => setStep(2)}
              onSaveAndExit={handleSaveAndExit}
              isSubmitting={isSubmitting}
              isSaving={saveToast === 'saving'}
            />
          )}
        </div>
      </form>
    </FormProvider>
  )
}
