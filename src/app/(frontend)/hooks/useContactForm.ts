import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { useState, useCallback } from 'react'
import { ContactSubmissionForm } from '@/frontend/models/ContactSubmissionForm'
import { httpClient } from '@/frontend/api/Api'

export function useContactForm(referralSources: string[]) {
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // TanStack Query mutation for form submission
  const mutation = useMutation({
    mutationFn: async (data: ContactSubmissionForm & { recaptchaToken: string }) => {
      return httpClient.cms_authenticated.post('/contact-submissions', {
        data,
      })
    },
    onSuccess: () => {
      setIsSuccess(true)
      setMessage({ type: 'success', text: 'Message sent successfully!' })
    },
    onError: (error: any) => {
      // Strapi-style error parsing
      if (
        error.response &&
        error.response.data &&
        error.response.data.error &&
        error.response.data.error.details &&
        error.response.data.error.details.errors
      ) {
        const strapiErrors = error.response.data.error.details.errors
        const fieldErrors: Record<string, string> = {}
        strapiErrors.forEach((err: any) => {
          if (err.path && err.path.length > 0 && err.message) {
            const fieldName = err.path[0]
            if (fieldErrors[fieldName]) {
              fieldErrors[fieldName] += `, ${err.message}`
            } else {
              fieldErrors[fieldName] = err.message
            }
          }
        })
        setMessage({ type: 'error', text: 'Failed to send message' })
        return fieldErrors
      } else {
        setMessage({ type: 'error', text: 'Failed to send message' })
        return {}
      }
    },
  })

  // TanStack Form setup (no explicit type argument)
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      budget: '',
      content: '',
      source: '',
    },
    onSubmit: async ({ value }) => {
      if (!recaptchaToken) {
        setMessage({ type: 'error', text: 'Please complete the reCAPTCHA verification' })
        return
      }
      setIsSuccess(false)
      setMessage(null)
      await mutation.mutateAsync({ ...value, recaptchaToken })
      // Reset form and recaptcha on success
      if (!mutation.error) {
        form.reset()
        setRecaptchaToken('')
      }
    },
  })

  // reCAPTCHA handler
  const handleReCaptchaVerify = useCallback((token: string) => {
    setRecaptchaToken(token)
  }, [])

  return {
    form,
    isSending: mutation.isPending,
    isSuccess,
    message,
    setMessage,
    handleReCaptchaVerify,
    referralSources,
    recaptchaToken,
  }
}
