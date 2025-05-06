'use client'

import React from 'react'
import {
  FaCheckCircle,
  FaSpinner,
  FaUser,
  FaEnvelope,
  FaDollarSign,
  FaCommentAlt,
} from 'react-icons/fa'
import ReCaptcha from '../../common/ReCaptcha'
import { PixelInput, PixelSelect } from '@/frontend/components/ui/Inputs'
import { contactFormSchema } from '@/frontend/components/services/forms/schemas'
import { ZodError } from 'zod'
import { ContactSubmissionForm } from '@/frontend/models/forms/ContactSubmissionForm'

// Original props interface
interface ContactFormWithPixelUIProps {
  formData?: ContactSubmissionForm
  handleInputChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void
  handleFormSubmit?: (e: React.FormEvent) => void
  referralSources: string[]
  formErrors?: { [key in keyof ContactSubmissionForm]?: string }
  isSuccess: boolean
  isSending: boolean
  onVerifyReCaptcha: (token: string) => void
  setFormErrors?: (errors: { [key in keyof ContactSubmissionForm]?: string }) => void
  form?: any // Simplify to avoid complex TypeScript errors
}

// Helper function to validate form data with Zod
export const validateContactForm = (
  data: ContactSubmissionForm,
): {
  success: boolean
  errors?: { [key in keyof ContactSubmissionForm]?: string }
} => {
  try {
    // Need to convert budget from string to number for Zod validation
    const parsedData = {
      ...data,
      budget: data.budget ? Number(data.budget) : undefined,
    }

    contactFormSchema.parse(parsedData)
    return { success: true }
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors: { [key in keyof ContactSubmissionForm]?: string } = {}

      error.errors.forEach((err) => {
        const field = err.path[0] as keyof ContactSubmissionForm
        formattedErrors[field] = err.message
      })

      return { success: false, errors: formattedErrors }
    }

    return {
      success: false,
      errors: { content: 'An unexpected error occurred. Please try again.' },
    }
  }
}

export const ContactForm: React.FC<ContactFormWithPixelUIProps> = ({
  formData,
  handleInputChange,
  handleFormSubmit,
  referralSources,
  formErrors: propFormErrors,
  isSuccess,
  isSending,
  onVerifyReCaptcha,
  setFormErrors,
  form,
}) => {
  // Check if we're using the new TanStack Form-based approach or the old approach
  const usingTanStackForm = !!form

  // Create a handler for the Select component
  const handleSelectChange = (value: string) => {
    if (usingTanStackForm) {
      form?.setFieldValue('source', value)
    } else if (handleInputChange) {
      const syntheticEvent = {
        target: {
          name: 'source',
          value,
        },
      } as React.ChangeEvent<HTMLSelectElement>

      handleInputChange(syntheticEvent)
    }
  }

  // Enhanced form submit handler with Zod validation
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (usingTanStackForm) {
      form?.handleSubmit()
    } else if (handleFormSubmit && formData) {
      // Validate form data with Zod
      const validationResult = validateContactForm(formData)

      if (!validationResult.success && setFormErrors && validationResult.errors) {
        setFormErrors(validationResult.errors)
        return
      }

      // If validation passes, proceed with the original form submission
      handleFormSubmit(e)
    }
  }

  // Convert referralSources array to the format expected by PixelSelect
  const referralOptions = referralSources.map((source) => ({
    value: source,
    label: source,
  }))

  return (
    <div className="w-full max-w-2xl mx-auto">
      {isSuccess ? (
        <div className="flex flex-col items-center gap-8 p-8 mb-12 border-4 border-[#97eb9a] shadow-[8px_8px_0_var(--shadow-color)] font-pixel text-[1.8rem] leading-[1.8] text-center bg-card-background text-text-color transition-all duration-300">
          <FaCheckCircle className="text-[4rem] text-[#97eb9a]" />
          <p className="text-[1.4rem] leading-8">
            Thank you for your message!
            <br />
            You will receive an auto-reply email shortly.
            <br />I will get back to you shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="max-w-2xl mx-auto flex flex-col gap-8">
          {usingTanStackForm ? (
            // Use a dynamic accessor pattern to avoid TypeScript errors
            // @ts-ignore
            <form.Field
              name="name"
              children={(field: any) => (
                <PixelInput
                  label="Name"
                  id="name"
                  name="name"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  placeholder="Your name"
                  error={field.state.meta.errors?.[0]}
                  icon={<FaUser />}
                  fullWidth
                />
              )}
            />
          ) : (
            <PixelInput
              label="Name"
              id="name"
              name="name"
              value={formData?.name || ''}
              onChange={handleInputChange}
              required
              placeholder="Your name"
              error={propFormErrors?.name}
              icon={<FaUser />}
              fullWidth
            />
          )}

          {usingTanStackForm ? (
            // @ts-ignore
            <form.Field
              name="email"
              children={(field: any) => (
                <PixelInput
                  label="Email"
                  id="email"
                  name="email"
                  type="email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  placeholder="your@email.com"
                  error={field.state.meta.errors?.[0]}
                  icon={<FaEnvelope />}
                  fullWidth
                />
              )}
            />
          ) : (
            <PixelInput
              label="Email"
              id="email"
              name="email"
              type="email"
              value={formData?.email || ''}
              onChange={handleInputChange}
              required
              placeholder="your@email.com"
              error={propFormErrors?.email}
              icon={<FaEnvelope />}
              fullWidth
            />
          )}

          {usingTanStackForm ? (
            // @ts-ignore
            <form.Field
              name="budget"
              children={(field: any) => (
                <PixelInput
                  label="Budget (AUD)"
                  id="budget"
                  name="budget"
                  type="number"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Your budget in AUD"
                  error={field.state.meta.errors?.[0]}
                  icon={<FaDollarSign />}
                  fullWidth
                />
              )}
            />
          ) : (
            <PixelInput
              label="Budget (AUD)"
              id="budget"
              name="budget"
              type="number"
              value={formData?.budget || ''}
              onChange={handleInputChange}
              placeholder="Your budget in AUD"
              error={propFormErrors?.budget}
              icon={<FaDollarSign />}
              fullWidth
            />
          )}

          {/* Custom textarea since PixelInput doesn't support textareas directly */}
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="content" className="font-pixel text-[1.2rem] text-[var(--color-text)]">
              What can I help you with?
            </label>
            <div className="relative">
              <div className="absolute left-4 top-6 text-[var(--color-text)] opacity-70 z-10">
                <FaCommentAlt />
              </div>
              {usingTanStackForm ? (
                // @ts-ignore
                <form.Field
                  name="content"
                  children={(field: any) => (
                    <>
                      <textarea
                        id="content"
                        name="content"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        required
                        className="font-['Press_Start_2P'] text-[1.2rem] p-4 pl-12 border-4 border-[var(--color-border)] bg-[var(--color-hover)] text-[var(--color-text)] transition-all duration-300 shadow-[4px_4px_0_var(--shadow-color)] focus:outline-none focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[6px_6px_0_var(--shadow-color)] resize-vertical min-h-[120px] w-full"
                        placeholder="E.g., 'I need a website for my e-commerce business', 'I want to improve my website's SEO'"
                        rows={4}
                      />
                      {field.state.meta.errors?.[0] && (
                        <span className="text-[var(--color-error)] text-[1rem] mt-1">
                          {field.state.meta.errors[0]}
                        </span>
                      )}
                    </>
                  )}
                />
              ) : (
                <>
                  <textarea
                    id="content"
                    name="content"
                    value={formData?.content || ''}
                    onChange={handleInputChange}
                    required
                    className="font-['Press_Start_2P'] text-[1.2rem] p-4 pl-12 border-4 border-[var(--color-border)] bg-[var(--color-hover)] text-[var(--color-text)] transition-all duration-300 shadow-[4px_4px_0_var(--shadow-color)] focus:outline-none focus:-translate-x-0.5 focus:-translate-y-0.5 focus:shadow-[6px_6px_0_var(--shadow-color)] resize-vertical min-h-[120px] w-full"
                    placeholder="E.g., 'I need a website for my e-commerce business', 'I want to improve my website's SEO'"
                    rows={4}
                  />
                  {propFormErrors?.content && (
                    <span className="text-[var(--color-error)] text-[1rem] mt-1">
                      {propFormErrors.content}
                    </span>
                  )}
                </>
              )}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(181, 137, 0, 0.05) 2px, rgba(181, 137, 0, 0.05) 4px)',
                  opacity: 0.5,
                  mixBlendMode: 'overlay',
                }}
              />
            </div>
          </div>

          {usingTanStackForm ? (
            // @ts-ignore
            <form.Field
              name="source"
              children={(field: any) => (
                <PixelSelect
                  label="Where did you find me?"
                  id="source"
                  options={referralOptions}
                  value={field.state.value}
                  onChange={(value) => field.handleChange(value)}
                  error={field.state.meta.errors?.[0]}
                  placeholder="Select an option"
                  fullWidth
                />
              )}
            />
          ) : (
            <PixelSelect
              label="Where did you find me?"
              id="source"
              options={referralOptions}
              value={formData?.source || ''}
              onChange={handleSelectChange}
              error={propFormErrors?.source}
              placeholder="Select an option"
              fullWidth
            />
          )}

          <ReCaptcha
            siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
            onVerify={onVerifyReCaptcha}
            action="contact_form"
          />

          <button
            type="submit"
            className="font-pixel text-[1.2rem] p-6 bg-[var(--color-button)] text-[var(--color-button-text)] border-4 border-[var(--color-border)] cursor-pointer transition-all duration-300 shadow-[6px_6px_0_var(--shadow-color)] mt-4 w-full hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_var(--shadow-color)] flex items-center justify-center gap-2 disabled:opacity-60"
            disabled={isSending}
          >
            {isSending ? <FaSpinner className="animate-spin text-[1.8rem]" /> : 'Send Message'}
          </button>

          <p className="text-xs text-[#666] text-center mt-4">
            This form is protected by reCAPTCHA and the Google{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] hover:underline"
            >
              Privacy Policy
            </a>{' '}
            and{' '}
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] hover:underline"
            >
              Terms of Service
            </a>{' '}
            apply.
          </p>
        </form>
      )}
    </div>
  )
}
