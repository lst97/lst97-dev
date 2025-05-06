import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { useState, useCallback } from 'react'
import { ContactSubmissionForm } from '@/frontend/models/forms/ContactSubmissionForm'
import { ApiResponse } from '@/frontend/api'

export function useContactForm(referralSources: string[]) {
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // TanStack Query mutation for form submission
  const mutation = useMutation({
    mutationFn: async (data: ContactSubmissionForm & { recaptchaToken: string }) => {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      })

      const responseData = (await response.json()) as ApiResponse<{ message: string }>

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.error?.message || 'Failed to send message')
      }

      return responseData.data
    },
    onSuccess: (data) => {
      setIsSuccess(true)
      setMessage({ type: 'success', text: data?.message || 'Message sent successfully!' })
    },
    onError: (error: any) => {
      // Error handling for form validation errors
      if (error.response && error.response.data && error.response.data.error) {
        setMessage({
          type: 'error',
          text: error.response.data.error.message || error.response.data.error,
        })
      } else {
        setMessage({ type: 'error', text: error.message || 'Failed to send message' })
      }
      return {}
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
